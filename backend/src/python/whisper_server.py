"""
Whisper HTTP microservice
Listens on port 9000, accepts POST /transcribe with an audio file path,
returns the transcript as plain text.
"""
from flask import Flask, request, jsonify
from faster_whisper import WhisperModel
import sys, os

app = Flask(__name__)

print("[Whisper] Loading model...", flush=True)
model = WhisperModel("base", device="cpu", compute_type="int8")
print("[Whisper] Model ready.", flush=True)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/transcribe", methods=["POST"])
def transcribe():
    data = request.get_json()
    audio_path = data.get("audioPath", "")

    if not audio_path or not os.path.exists(audio_path):
        return jsonify({"error": f"File not found: {audio_path}"}), 400

    try:
        segments, _ = model.transcribe(audio_path)
        text = " ".join(segment.text for segment in segments).strip()
        return jsonify({"transcript": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=9000)
