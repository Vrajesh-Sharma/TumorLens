import argparse
import json
import os
import numpy as np
import tensorflow as tf


def inspect_model(model_path):
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    print("=" * 60)
    print("INPUT TENSOR(S)")
    print("=" * 60)
    for d in input_details:
        print(f"  name:  {d['name']}")
        print(f"  shape: {d['shape'].tolist()}")
        print(f"  dtype: {d['dtype'].__name__}")
        print(f"  quantization: {d['quantization']}")
        print("-" * 40)

    print("=" * 60)
    print("OUTPUT TENSOR(S)")
    print("=" * 60)
    for d in output_details:
        print(f"  name:  {d['name']}")
        print(f"  shape: {d['shape'].tolist()}")
        print(f"  dtype: {d['dtype'].__name__}")
        print(f"  quantization: {d['quantization']}")
        print("-" * 40)

    return interpreter, input_details, output_details


def probe_with_dummy_input(interpreter, input_details, output_details):
    """
    Feeds a zero tensor and a random tensor through the model to confirm
    the output range (helps verify whether sigmoid is baked in, i.e.
    outputs are already in [0,1] probabilities vs raw logits).
    """
    in_shape = input_details[0]["shape"]
    in_dtype = input_details[0]["dtype"]

    zeros = np.zeros(in_shape, dtype=in_dtype)
    randoms = np.random.rand(*in_shape).astype(in_dtype)

    results = {}
    for name, arr in [("zeros", zeros), ("random", randoms)]:
        interpreter.set_tensor(input_details[0]["index"], arr)
        interpreter.invoke()
        out = interpreter.get_tensor(output_details[0]["index"])
        results[name] = {
            "output_shape": list(out.shape),
            "min": float(out.min()),
            "max": float(out.max()),
            "mean": float(out.mean()),
        }

    print("=" * 60)
    print("OUTPUT RANGE PROBE (to detect sigmoid vs raw logits)")
    print("=" * 60)
    for name, stats in results.items():
        print(f"  [{name}] shape={stats['output_shape']} "
              f"min={stats['min']:.4f} max={stats['max']:.4f} mean={stats['mean']:.4f}")

    looks_like_probabilities = all(
        0.0 <= r["min"] and r["max"] <= 1.0 for r in results.values()
    )
    return looks_like_probabilities


def detect_layout(input_shape):
    """
    Determines NCHW vs NHWC from the raw shape, rather than assuming.
    """
    if len(input_shape) != 4:
        return "unknown", None

    dims = list(input_shape)
    # channel dim is whichever axis is 1 or 3 and NOT equal to the square spatial dims
    if dims[1] in (1, 3) and dims[1] != dims[2]:
        return "NCHW", dims[2]        # (N, C, H, W)
    elif dims[3] in (1, 3):
        return "NHWC", dims[1]        # (N, H, W, C)
    else:
        return "unknown", None


def build_metadata(model_path, input_details, output_details, looks_like_probabilities):
    in_shape = input_details[0]["shape"].tolist()
    out_shape = output_details[0]["shape"].tolist()
    layout, img_size = detect_layout(in_shape)
    channels = in_shape[1] if layout == "NCHW" else (in_shape[3] if layout == "NHWC" else None)

    metadata = {
        "model_file": os.path.basename(model_path),
        "input": {
            "shape": in_shape,
            "layout": layout,
            "image_size": img_size,
            "channels": channels,
            "color_mode": "grayscale" if channels == 1 else ("rgb" if channels == 3 else "unknown"),
            "dtype": str(input_details[0]["dtype"]),
            "normalization": "percentile_1_99_minmax_to_[0,1]",
            "normalization_detail": (
                "Clip pixel values to the 1st and 99th percentile of the image, "
                "then min-max scale the clipped range to [0, 1]. "
                "This MUST match training-time preprocessing exactly."
            ),
        },
        "output": {
            "shape": out_shape,
            "dtype": str(output_details[0]["dtype"]),
            "activation_applied": "sigmoid" if looks_like_probabilities else "none (raw logits - apply sigmoid manually)",
            "value_range": "[0, 1] probability map" if looks_like_probabilities else "unbounded logits",
            "postprocessing": (
                "Threshold the probability map at 0.5 to obtain a binary mask. "
                "binary_mask = (prob_map > 0.5).astype(uint8). "
                "tumor_detected = binary_mask.sum() > 0. "
                "tumor_area_pct = 100 * binary_mask.sum() / binary_mask.size."
            ),
            "threshold": 0.5,
        },
        "notes": [
            "This model was trained on single-modality (FLAIR) brain MRI slices "
            "from the BraTS2020 dataset, NOT natural photos.",
            "If layout is NHWC, transpose any (1,1,H,W) numpy array to (1,H,W,1) before inference.",
            "Always re-run this inspection script after any re-export, since onnx2tf/TFLite "
            "conversion tools can silently change tensor layout or output activation.",
        ],
    }
    return metadata


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", required=True, help="Path to .tflite file")
    parser.add_argument("--out", default=None, help="Path to write model_metadata.json")
    args = parser.parse_args()

    interpreter, input_details, output_details = inspect_model(args.model)
    looks_like_probabilities = probe_with_dummy_input(interpreter, input_details, output_details)
    metadata = build_metadata(args.model, input_details, output_details, looks_like_probabilities)

    out_path = args.out or os.path.join(os.path.dirname(args.model) or ".", "model_metadata.json")
    with open(out_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print("=" * 60)
    print(f"Metadata written -> {out_path}")
    print("=" * 60)
    print(json.dumps(metadata, indent=2))


if __name__ == "__main__":
    main()