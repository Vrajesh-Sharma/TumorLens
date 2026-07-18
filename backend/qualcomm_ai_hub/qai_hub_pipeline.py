import json
import os
import numpy as np
import qai_hub as hub


# ----------------------------------------------------------------------
# CONFIG - edit these paths to match your project structure
# ----------------------------------------------------------------------
MODEL_PATH    = "../tflite_export/attention_unet_float32.tflite"  # the .tflite file to upload
METADATA_PATH = "../tflite_export/model_metadata.json"             # from inspect_tflite_model.py
DEVICE_NAME   = "Samsung Galaxy S24 (Family)"                    # target device on AI Hub
OUT_DIR       = "qai_hub_export"                                 # where results get saved
# ----------------------------------------------------------------------


def load_metadata(metadata_path):
    with open(metadata_path, "r") as f:
        meta = json.load(f)
    return meta


def build_dummy_input(meta):
    """
    Builds a correctly-shaped dummy input strictly from the model's
    documented contract (model_metadata.json), never guessing shape
    or normalization range.
    """
    in_shape = meta["input"]["shape"]          # e.g. [1, 256, 256, 1] or [1, 1, 256, 256]
    dtype_str = meta["input"]["dtype"]
    np_dtype = np.float32 if "float32" in dtype_str else np.uint8

    # Simulate a normalized [0,1] grayscale slice, matching training normalization
    dummy = np.random.rand(*in_shape).astype(np_dtype)
    return dummy


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    meta = load_metadata(METADATA_PATH)
    device = hub.Device(DEVICE_NAME)

    # ------------------------------------------------------------------
    # Step 1: Upload the model
    # ------------------------------------------------------------------
    print("Step 1/3: Uploading model to AI Hub...")
    uploaded_model = hub.upload_model(MODEL_PATH)
    print(f"  Uploaded model ID: {uploaded_model.model_id}")

    # ------------------------------------------------------------------
    # Step 2: Profile job directly on the uploaded .tflite model.
    # .tflite is already a compiled runtime artifact, so we do NOT call
    # submit_compile_job() here - that API only accepts PyTorch/ONNX
    # source models. We profile the uploaded model as-is.
    # ------------------------------------------------------------------
    print(f"Step 2/3: Submitting profile job on real device: {DEVICE_NAME}...")
    profile_job = hub.submit_profile_job(
        model=uploaded_model,
        device=device,
        name="attention_unet_profile",
    )
    profile_job.wait()
    profile_results = profile_job.download_profile()

    print(f"  Profile job URL: {profile_job.url}")
    summary = profile_results.get("execution_summary", {})
    print("  --- Profiling summary ---")
    print(f"    Estimated inference time: {summary.get('estimated_inference_time', 'N/A')} us")
    print(f"    Peak memory usage:        {summary.get('inference_memory_peak_range', 'N/A')} bytes")
    print(f"    Compute unit breakdown:   {summary.get('compute_unit_breakdown', 'N/A')}")

    profile_json_path = os.path.join(OUT_DIR, "profile_results.json")
    with open(profile_json_path, "w") as f:
        json.dump(profile_results, f, indent=2, default=str)
    print(f"  Full profile results saved -> {profile_json_path}")

    # ------------------------------------------------------------------
    # Step 3: Inference job directly on the uploaded .tflite model.
    # ------------------------------------------------------------------
    print(f"Step 3/3: Submitting inference job on real device: {DEVICE_NAME}...")
    dummy_input = build_dummy_input(meta)
    input_name = meta.get("input", {}).get("name", "input")

    inference_job = hub.submit_inference_job(
        model=uploaded_model,
        device=device,
        inputs={input_name: [dummy_input]},
        name="attention_unet_inference",
    )
    inference_job.wait()
    print(f"  Inference job URL: {inference_job.url}")

    output_tensors = inference_job.download_output_data()
    output_key = list(output_tensors.keys())[0]
    output_array = output_tensors[output_key][0]

    print("  --- Inference output summary ---")
    print(f"    Output shape: {output_array.shape}")
    print(f"    Output min/max/mean: {output_array.min():.4f} / {output_array.max():.4f} / {output_array.mean():.4f}")

    np.save(os.path.join(OUT_DIR, "inference_output.npy"), output_array)
    print(f"  Raw output saved -> {os.path.join(OUT_DIR, 'inference_output.npy')}")

    # ------------------------------------------------------------------
    # Convert raw output into segmentation mask using the documented contract
    # ------------------------------------------------------------------
    threshold = meta["output"].get("threshold", 0.5)
    activation = meta["output"].get("activation_applied", "sigmoid")

    probs = output_array
    if "none" in activation:
        probs = 1 / (1 + np.exp(-probs))  # manual sigmoid if not baked into the graph

    binary_mask = (probs > threshold).astype(np.uint8)
    tumor_detected = bool(binary_mask.sum() > 0)
    tumor_area_pct = 100.0 * binary_mask.sum() / binary_mask.size

    print("  --- Segmentation result (from on-device output) ---")
    print(f"    tumor_detected:  {tumor_detected}")
    print(f"    tumor_area_pct:  {tumor_area_pct:.3f}%")

    np.save(os.path.join(OUT_DIR, "binary_mask.npy"), binary_mask)
    print(f"  Binary mask saved -> {os.path.join(OUT_DIR, 'binary_mask.npy')}")

    print("\nAll AI Hub steps completed successfully.")
    print("Artifacts in:", OUT_DIR)
    for f in os.listdir(OUT_DIR):
        print(" -", f)


if __name__ == "__main__":
    main()