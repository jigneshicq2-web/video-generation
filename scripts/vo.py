"""Generate the voiceover, one clip per line, with Kokoro TTS (local, offline).

Writes audio/vo/lineNN.wav (trimmed of leading/trailing silence) and
audio/vo/durations.json so the video timeline can be fitted around the voice.
"""
import json, os, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.environ.get("KOKORO_DIR", ROOT + "/models")
VOICE = os.environ.get("VO_VOICE", "am_fenrir")
SPEED = float(os.environ.get("VO_SPEED", "1.12"))

# Exact script. The TTS spelling of the brand is fixed so it is always
# pronounced the same way ("ree-KUR-post"); on-screen text is unaffected.
LINES = [
    "Still managing social media like this?",
    "Meet RecurPost.",
    "Your social media workflow, in one place.",
    "Create smarter with AI.",
    "Schedule across accounts.",
    "And keep your best content working.",
    "Get approvals without the back-and-forth.",
    "And when something goes wrong, know exactly what to fix.",
    "Manage conversations from one inbox.",
    "Turn performance into client-ready reports.",
    "One workflow.",
    "All in RecurPost.",
]
TTS_SPELLING = {"RecurPost": "Recur-Post"}
# Slightly tighter read for the two closing lines so they land before 00:28.
SPEED_OVERRIDES = {10: 1.2, 11: 1.2}


def trim(x, sr, thresh=0.012, pad=0.03):
    idx = np.where(np.abs(x) > thresh)[0]
    if not len(idx):
        return x
    a = max(0, idx[0] - int(pad * sr))
    b = min(len(x), idx[-1] + int(pad * sr))
    return x[a:b]


def main():
    k = Kokoro(f"{MODEL_DIR}/kokoro.onnx", f"{MODEL_DIR}/voices.bin")
    out = {}
    for i, line in enumerate(LINES):
        text = line
        for a, b in TTS_SPELLING.items():
            text = text.replace(a, b)
        speed = SPEED_OVERRIDES.get(i, SPEED)
        samples, sr = k.create(text, voice=VOICE, speed=speed, lang="en-us")
        samples = trim(np.asarray(samples, dtype=np.float32), sr)
        path = f"{ROOT}/audio/vo/line{i:02d}.wav"
        sf.write(path, samples, sr)
        out[i] = {"text": line, "dur": round(len(samples) / sr, 3), "sr": sr}
        print(f"{i:02d} {out[i]['dur']:.2f}s  {line}")
    json.dump({"voice": VOICE, "speed": SPEED, "lines": out},
              open(f"{ROOT}/audio/vo/durations.json", "w"), indent=2)


if __name__ == "__main__":
    main()
