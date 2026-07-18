"""
infer_on_image.py
Run the trained BraTS Attention U-Net on a plain PNG/JPG image
and produce: binary mask, overlay, and summary stats.

Usage:
    python infer_on_image.py --image path/to/scan.png --weights attention_unet_inference.pth
"""

import os
import argparse
import numpy as np
import cv2
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

IMG_SIZE = 256          # must match CFG.IMG_SIZE used in training
THRESHOLD = 0.5         # must match deploy_config.json


# ----------------------------------------------------------------------
# 1. Model definition (must match training notebook exactly)
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

        return self.out_conv(d1)   # raw logits, shape (B,1,H,W)


# ----------------------------------------------------------------------
# 2. Preprocessing (must mirror BraTSSliceDataset.normalize + resize)
# ----------------------------------------------------------------------
def load_and_preprocess(image_path, img_size=IMG_SIZE):
    """
    Loads a PNG/JPG (any bit depth), converts to single-channel grayscale,
    applies the SAME percentile 1-99 min-max normalization used in training,
    and resizes to img_size x img_size.
    """
    raw = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
    if raw is None:
        raise FileNotFoundError(f"Could not read image: {image_path}")

    if raw.ndim == 3:
        gray = cv2.cvtColor(raw, cv2.COLOR_BGR2GRAY)
    else:
        gray = raw

    gray = gray.astype(np.float32)

    lo, hi = np.percentile(gray, 1), np.percentile(gray, 99)
    gray = np.clip(gray, lo, hi)
    denom = hi - lo if (hi - lo) > 1e-6 else 1.0
    gray = (gray - lo) / denom

    gray_resized = cv2.resize(gray, (img_size, img_size), interpolation=cv2.INTER_LINEAR)
    return gray_resized.astype(np.float32)


# ----------------------------------------------------------------------
# 3. Inference + overlay (same logic as predict_and_overlay in notebook)
# ----------------------------------------------------------------------
def predict_and_overlay(model, img_np, device, threshold=THRESHOLD):
    img_tensor = torch.from_numpy(img_np).unsqueeze(0).unsqueeze(0).float().to(device)  # (1,1,H,W)

    with torch.no_grad():
        logits = model(img_tensor)
        prob_map = torch.sigmoid(logits)[0, 0].cpu().numpy()

    binary_mask = (prob_map > threshold).astype(np.uint8)
    tumor_detected = bool(binary_mask.sum() > 0)
    confidence = float(prob_map[binary_mask == 1].mean()) if tumor_detected else float(prob_map.max())
    tumor_area_pct = 100.0 * binary_mask.sum() / binary_mask.size

    img_rgb = np.stack([img_np] * 3, axis=-1)
    overlay = img_rgb.copy()
    overlay[binary_mask == 1] = [1.0, 0.15, 0.15]  # red highlight
    overlay = 0.6 * img_rgb + 0.4 * overlay

    return {
        "prob_map": prob_map,
        "binary_mask": binary_mask,
        "overlay": overlay,
        "tumor_detected": tumor_detected,
        "confidence": round(confidence, 4),
        "tumor_area_pct": round(tumor_area_pct, 3),
    }


# ----------------------------------------------------------------------
# 4. Main
# ----------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True, help="Path to input PNG/JPG image")
    parser.add_argument("--weights", default="attention_unet_inference.pth",
                         help="Path to .pth weights (inference OR best checkpoint)")
    parser.add_argument("--out_dir", default="output", help="Where to save results")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    os.makedirs(args.out_dir, exist_ok=True)

    model = AttentionUNet(in_ch=1, out_ch=1, base_ch=32).to(device)

    ckpt = torch.load(args.weights, map_location=device)
    # Handles BOTH file types you exported:
    #   - attention_unet_best.pth      -> dict with key "model_state_dict"
    #   - attention_unet_inference.pth -> raw state_dict
    if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
        model.load_state_dict(ckpt["model_state_dict"])
    else:
        model.load_state_dict(ckpt)
    model.eval()

    img_np = load_and_preprocess(args.image)
    result = predict_and_overlay(model, img_np, device)

    base_name = os.path.splitext(os.path.basename(args.image))[0]
    mask_path = os.path.join(args.out_dir, f"{base_name}_mask.png")
    overlay_path = os.path.join(args.out_dir, f"{base_name}_overlay.png")

    cv2.imwrite(mask_path, (result["binary_mask"] * 255).astype(np.uint8))
    plt.imsave(overlay_path, np.clip(result["overlay"], 0, 1))

    fig, axes = plt.subplots(1, 3, figsize=(9, 3))
    axes[0].imshow(img_np, cmap="gray"); axes[0].set_title("Input"); axes[0].axis("off")
    axes[1].imshow(result["binary_mask"], cmap="gray"); axes[1].set_title("Predicted mask"); axes[1].axis("off")
    axes[2].imshow(result["overlay"]); axes[2].set_title(
        f"Overlay (tumor={result['tumor_detected']}, {result['tumor_area_pct']}%)"
    ); axes[2].axis("off")
    plt.tight_layout()
    plt.savefig(os.path.join(args.out_dir, f"{base_name}_summary.png"), dpi=120)

    print("Tumor detected:", result["tumor_detected"])
    print("Confidence:", result["confidence"])
    print("Tumor area %:", result["tumor_area_pct"])
    print("Saved:", mask_path, overlay_path)


if __name__ == "__main__":
    main()