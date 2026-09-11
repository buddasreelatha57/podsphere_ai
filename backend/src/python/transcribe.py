from faster_whisper import WhisperModel
import sys
sys.stdout.reconfigure(encoding='utf-8')

audio = sys.argv[1]

model = WhisperModel(
    "base",
    device="cpu",
    compute_type="int8"
)

segments, info = model.transcribe(audio)

text = ""

for segment in segments:
    text += segment.text + " "

print(text.strip())