#!/usr/bin/env python3
"""Run after tts_el.py + fix_tails.py: shorten long pauses INSIDE a take to MAXP[id] seconds and shift
its word times. MAXP is read from timing_cfg.json's "MAXP" key ({"e1": 0.32, "k1": 0.3, ...}); if that
key is absent, DEFAULT_MAXP below is used as a fallback so a fresh reel works without any config."""
import json, re, subprocess, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
V = 'assets/voice'; p = f'{V}/voice.json'; m = json.load(open(p))
DEFAULT_MAXP = {'e1': 0.32, 'k1': 0.3}
TIMING = json.load(open('timing_cfg.json')) if os.path.exists('timing_cfg.json') else {}
MAXP = TIMING.get('MAXP', DEFAULT_MAXP)
for n, mx in MAXP.items():
    if n not in m: continue
    f = f'{V}/{n}.wav'
    sd = subprocess.run(['ffmpeg', '-i', f, '-af', 'silencedetect=n=-38dB:d=0.2', '-f', 'null', '-'], capture_output=True, text=True).stderr
    ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', sd)]; se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', sd)]
    ws = m[n]['words']; cuts = []
    for a, b in zip(ss, se):
        if a > ws[0][1] and b < ws[-1][1] + 0.05 and b - a > mx:
            ca, cb = a + mx / 2, b - mx / 2; cuts.append((ca, cb))
    if not cuts: continue
    keep, cur = [], 0.0
    for ca, cb in cuts: keep.append((cur, ca)); cur = cb
    keep.append((cur, m[n]['dur']))
    expr = '+'.join(f'between(t,{a:.3f},{b:.3f})' for a, b in keep)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f, '-af', f"aselect='{expr}',asetpts=N/SR/TB", '/tmp/c.wav'], check=True); os.replace('/tmp/c.wav', f)
    shift = lambda t: t - sum(cb - ca for ca, cb in cuts if cb <= t + 1e-6)
    for w in ws: w[1] = round(shift(w[1]), 3)
    m[n]['speech_end'] = round(shift(m[n]['speech_end']), 3)
    m[n]['dur'] = round(float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], capture_output=True, text=True).stdout), 3)
    print(n, 'cuts', [(round(a, 2), round(b, 2)) for a, b in cuts], 'dur', m[n]['dur'], ws)
json.dump(m, open(p, 'w'), indent=1)
