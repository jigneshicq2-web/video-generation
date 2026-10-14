"""Bumper voiceover: the exact three-line script, one clip per visual beat (Kokoro TTS, local).
Usage: python3 bumper/vo.py <spot>  -> audio/bumper/<spot>/vo{0,1,2}.wav
VO_VOICE / VO_SPEED override the defaults; a line may set its own "tts" text and "speed"."""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.environ.get("KOKORO_DIR", ROOT + "/models")
VOICE = os.environ.get("VO_VOICE", "af_heart")
SPEED = float(os.environ.get("VO_SPEED", "1.2"))  # brisk but clear; needed to fit a 6 s bumper
SPOT = sys.argv[1] if len(sys.argv) > 1 else "batch"
OUT = f"{ROOT}/audio/bumper/{SPOT}"
os.makedirs(OUT, exist_ok=True)
cues = json.loads(subprocess.check_output(["node", f"{ROOT}/bumper/spots/{SPOT}/timeline.js"]))


def trim(x, sr, thresh=0.012, pad=0.02):
    idx = np.where(np.abs(x) > thresh)[0]
    return x[max(0, idx[0] - int(pad * sr)): min(len(x), idx[-1] + int(pad * sr))]


k = Kokoro(f"{MODEL_DIR}/kokoro.onnx", f"{MODEL_DIR}/voices.bin")
for c in cues["vo"]:
    text = c.get("tts", c["text"]).replace("RecurPost", "Recur-Post")  # fixed pronunciation
    s, sr = k.create(text, voice=VOICE, speed=c.get("speed", SPEED), lang="en-us")
    s = trim(np.asarray(s, dtype=np.float32), sr)
    sf.write(f"{OUT}/vo{c['line']}.wav", s, sr)
    print(f"{c['line']}  {c['at']:.2f}-{c['at'] + len(s) / sr:.2f}s  {c['text']}")
