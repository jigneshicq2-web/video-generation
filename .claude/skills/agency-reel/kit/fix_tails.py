#!/usr/bin/env python3
"""Run after tts_el.py: trim silent tails to speech_end + 0.22 s (0.1 s fade) so GAP, not dead air,
sets the pauses. A hand-set speech_end in voice.json (e.g. for an end-card line that trails off with
a breath) is respected as-is — this script only trims, it never recomputes speech_end."""
import json, subprocess, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
V = 'assets/voice'; p = f'{V}/voice.json'; m = json.load(open(p))
for n, d in m.items():
    end = round(d['speech_end'] + 0.22, 3)
    if d['dur'] - end > 0.05:
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{V}/{n}.wav', '-af', f'atrim=0:{end},afade=t=out:st={end - 0.1:.3f}:d=0.1', f'/tmp/{n}_t.wav'], check=True)
        os.replace(f'/tmp/{n}_t.wav', f'{V}/{n}.wav'); print(n, d['dur'], '->', end); d['dur'] = end
json.dump(m, open(p, 'w'), indent=1)
