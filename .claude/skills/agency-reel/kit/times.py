#!/usr/bin/env python3
"""Word start times for the Kokoro lines: spread each line's words over its VOICED regions (silencedetect)."""
import os, re, json, subprocess
os.chdir(os.path.dirname(os.path.abspath(__file__)))
def sh(*a): return subprocess.run(a, capture_output=True, text=True)
meta = {}
for ln in open('lines.txt'):
    n, spk, text = ln.rstrip('\n').split('|', 2)
    f = f'assets/voice/{n}.wav'
    dur = float(sh('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f).stdout)
    sd = sh('ffmpeg', '-i', f, '-af', 'silencedetect=n=-35dB:d=0.12', '-f', 'null', '-').stderr
    ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', sd)]; se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', sd)]
    voiced, cur = [], 0.0
    for a, b in zip(ss, se + [dur] * (len(ss) - len(se))):
        if a > cur: voiced.append((cur, a))
        cur = b
    if cur < dur: voiced.append((cur, dur))
    if not voiced: voiced = [(0.0, dur)]
    tot = sum(b - a for a, b in voiced)
    words = text.split(); wts = [max(2, len(re.sub(r'[^\w]', '', w))) for w in words]; W = sum(wts)
    def at(frac):
        x = frac * tot
        for a, b in voiced:
            if x <= b - a: return a + x
            x -= b - a
        return voiced[-1][1]
    acc, wl = 0, []
    for w, k in zip(words, wts):
        wl.append([w, round(at(acc / W), 3)]); acc += k
    meta[n] = dict(spk=spk, text=text, dur=round(dur, 3), words=wl)
json.dump(meta, open('assets/voice/voice.json', 'w'), indent=1)
print('lines', len(meta), 'speech', round(sum(m['dur'] for m in meta.values()), 2))
