"""Bumper voiceover: the exact three-line script, one clip per visual beat (Kokoro TTS, local).
Writes audio/bumper/vo{0,1,2}.wav. VO_VOICE / VO_SPEED override the defaults."""
import json, os, subprocess
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.environ.get("KOKORO_DIR", ROOT + "/models")
VOICE = os.environ.get("VO_VOICE", "af_heart")
SPEED = float(os.environ.get("VO_SPEED", "1.2"))  # brisk but clear; needed to fit a 6 s bumper
cues = json.loads(subprocess.check_output(["node", f"{ROOT}/bumper/timeline.js"]))


def trim(x, sr, thresh=0.012, pad=0.02):
    idx = np.where(np.abs(x) > thresh)[0]
    return x[max(0, idx[0] - int(pad * sr)): min(len(x), idx[-1] + int(pad * sr))]


k = Kokoro(f"{MODEL_DIR}/kokoro.onnx", f"{MODEL_DIR}/voices.bin")
for c in cues["vo"]:
    text = c["text"].replace("RecurPost", "Recur-Post")  # fixed pronunciation; on-screen text unaffected
    s, sr = k.create(text, voice=VOICE, speed=SPEED, lang="en-us")
    s = trim(np.asarray(s, dtype=np.float32), sr)
    sf.write(f"{ROOT}/audio/bumper/vo{c['line']}.wav", s, sr)
    print(f"{c['line']}  {c['at']:.2f}-{c['at'] + len(s) / sr:.2f}s  {c['text']}")
