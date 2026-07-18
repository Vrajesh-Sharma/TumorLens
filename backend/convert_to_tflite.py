import os
import argparse
import shutil
import numpy as np
import torch
import torch.nn as nn


IMG_SIZE = 256   # must match training CFG.IMG_SIZE


# ----------------------------------------------------------------------
# 1. Model definition (identical to training notebook / infer_on_image.py)
# ----------------------------------------------------------------------
class ConvBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.block(x)


class UpConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.up = nn.Sequential(
            nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True),
            nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.up(x)


class AttentionGate(nn.Module):
    def __init__(self, gate_ch, skip_ch, inter_ch):
        super().__init__()
        self.W_g = nn.Sequential(
            nn.Conv2d(gate_ch, inter_ch, 1, bias=True),
            nn.BatchNorm2d(inter_ch),
        )
        self.W_x = nn.Sequential(
            nn.Conv2d(skip_ch, inter_ch, 1, bias=True),
            nn.BatchNorm2d(inter_ch),
        )
        self.psi = nn.Sequential(
            nn.Conv2d(inter_ch, 1, 1, bias=True),
            nn.BatchNorm2d(1),
            nn.Sigmoid(),
        )
        self.relu = nn.ReLU(inplace=True)

    def forward(self, gate, skip):
        g1 = self.W_g(gate)
        x1 = self.W_x(skip)
        psi = self.relu(g1 + x1)
        psi = self.psi(psi)
        return skip * psi


class AttentionUNet(nn.Module):
    def __init__(self, in_ch=1, out_ch=1, base_ch=32):
        super().__init__()
        chs = [base_ch, base_ch * 2, base_ch * 4, base_ch * 8, base_ch * 16]

        self.pool = nn.MaxPool2d(2)

        self.enc1 = ConvBlock(in_ch, chs[0])
        self.enc2 = ConvBlock(chs[0], chs[1])
        self.enc3 = ConvBlock(chs[1], chs[2])
        self.enc4 = ConvBlock(chs[2], chs[3])
        self.bottleneck = ConvBlock(chs[3], chs[4])

        self.up4 = UpConv(chs[4], chs[3])
        self.att4 = AttentionGate(chs[3], chs[3], chs[3] // 2)
        self.dec4 = ConvBlock(chs[3] * 2, chs[3])

        self.up3 = UpConv(chs[3], chs[2])
        self.att3 = AttentionGate(chs[2], chs[2], chs[2] // 2)
        self.dec3 = ConvBlock(chs[2] * 2, chs[2])

        self.up2 = UpConv(chs[2], chs[1])
        self.att2 = AttentionGate(chs[1], chs[1], chs[1] // 2)
        self.dec2 = ConvBlock(chs[1] * 2, chs[1])

        self.up1 = UpConv(chs[1], chs[0])
        self.att1 = AttentionGate(chs[0], chs[0], chs[0] // 2)
        self.dec1 = ConvBlock(chs[0] * 2, chs[0])

        self.out_conv = nn.Conv2d(chs[0], out_ch, 1)

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool(e1))
        e3 = self.enc3(self.pool(e2))
        e4 = self.enc4(self.pool(e3))
        b = self.bottleneck(self.pool(e4))

        d4 = self.up4(b)
        s4 = self.att4(d4, e4)
        d4 = self.dec4(torch.cat([d4, s4], dim=1))

        d3 = self.up3(d4)
        s3 = self.att3(d3, e3)
        d3 = self.dec3(torch.cat([d3, s3], dim=1))

        d2 = self.up2(d3)
        s2 = self.att2(d2, e2)
        d2 = self.dec2(torch.cat([d2, s2], dim=1))

        d1 = self.up1(d2)
        s1 = self.att1(d1, e1)
        d1 = self.dec1(torch.cat([d1, s1], dim=1))

        return torch.sigmoid(self.out_conv(d1))   # export WITH sigmoid baked in for tflite convenience


# ----------------------------------------------------------------------
# 2. Load checkpoint (.pth) -> PyTorch model
# ----------------------------------------------------------------------
def load_pytorch_model(weights_path, device="cpu"):
    model = AttentionUNet(in_ch=1, out_ch=1, base_ch=32).to(device)
    ckpt = torch.load(weights_path, map_location=device, weights_only=False)
    if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
        model.load_state_dict(ckpt["model_state_dict"])
    else:
        model.load_state_dict(ckpt)
    model.eval()
    return model


# ----------------------------------------------------------------------
# 3. PyTorch -> ONNX
# ----------------------------------------------------------------------
def export_onnx(model, onnx_path, img_size=IMG_SIZE):
    dummy_input = torch.randn(1, 1, img_size, img_size)
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        input_names=["input"],
        output_names=["output"],
        opset_version=13,
        dynamic_axes=None,   # fixed batch/size for max TFLite compatibility
        do_constant_folding=True,
    )
    print(f"Saved ONNX model -> {onnx_path}")


# ----------------------------------------------------------------------
# 4. ONNX -> TensorFlow SavedModel -> TFLite (via onnx2tf)
# ----------------------------------------------------------------------
def convert_onnx_to_tflite(onnx_path, out_dir):
    import onnx2tf
    onnx2tf.convert(
        input_onnx_file_path=onnx_path,
        output_folder_path=out_dir,
        copy_onnx_input_output_names_to_tflite=True,
        non_verbose=False,
    )
    # onnx2tf auto-generates several .tflite variants (float32, float16, etc.)
    # inside out_dir. We surface the plain float32 one with a clean name.
    for fname in os.listdir(out_dir):
        if fname.endswith(".tflite") and "float32" in fname:
            final_path = os.path.join(out_dir, "attention_unet.tflite")
            shutil.copy(os.path.join(out_dir, fname), final_path)
            print(f"Final TFLite model -> {final_path}")
            return final_path
    raise RuntimeError("No float32 .tflite file found in onnx2tf output.")


# ----------------------------------------------------------------------
# 5. Sanity check: compare PyTorch vs TFLite outputs on random input
# ----------------------------------------------------------------------
def verify_tflite(tflite_path, torch_model, img_size=IMG_SIZE):
    import tensorflow as tf

    np.random.seed(0)
    dummy_np = np.random.rand(1, 1, img_size, img_size).astype(np.float32)

    with torch.no_grad():
        torch_out = torch_model(torch.from_numpy(dummy_np)).numpy()

    interpreter = tf.lite.Interpreter(model_path=tflite_path)
    interpreter.allocate_tensors()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    # onnx2tf typically converts NCHW -> NHWC, so transpose input accordingly
    in_shape = input_details[0]["shape"]
    if list(in_shape) == [1, img_size, img_size, 1]:
        tflite_input = np.transpose(dummy_np, (0, 2, 3, 1))
    else:
        tflite_input = dummy_np

    interpreter.set_tensor(input_details[0]["index"], tflite_input)
    interpreter.invoke()
    tflite_out = interpreter.get_tensor(output_details[0]["index"])

    if tflite_out.shape[-1] == 1 and tflite_out.ndim == 4 and tflite_out.shape[1] != 1:
        tflite_out_cmp = np.transpose(tflite_out, (0, 3, 1, 2))
    else:
        tflite_out_cmp = tflite_out

    max_diff = np.max(np.abs(torch_out - tflite_out_cmp))
    print(f"Max abs diff (PyTorch vs TFLite): {max_diff:.6f}")
    if max_diff < 1e-3:
        print("Conversion verified: outputs match closely.")
    else:
        print("WARNING: outputs differ more than expected, inspect manually.")


# ----------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--weights", required=True, help="Path to .pth file (best or inference)")
    parser.add_argument("--out_dir", default="tflite_export", help="Output directory")
    parser.add_argument("--img_size", type=int, default=IMG_SIZE)
    args = parser.parse_args()

    os.makedirs(args.out_dir, exist_ok=True)
    onnx_path = os.path.join(args.out_dir, "attention_unet.onnx")

    print("Step 1/4: Loading PyTorch model...")
    model = load_pytorch_model(args.weights)

    print("Step 2/4: Exporting to ONNX...")
    export_onnx(model, onnx_path, img_size=args.img_size)

    print("Step 3/4: Converting ONNX -> TFLite via onnx2tf...")
    tflite_path = convert_onnx_to_tflite(onnx_path, args.out_dir)

    print("Step 4/4: Verifying TFLite output against PyTorch...")
    verify_tflite(tflite_path, model, img_size=args.img_size)

    print("\nDone. Files in:", args.out_dir)
    for f in os.listdir(args.out_dir):
        print(" -", f)


if __name__ == "__main__":
    main()