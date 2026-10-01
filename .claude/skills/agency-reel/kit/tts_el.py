#!/usr/bin/env python3
"""FINAL voices, generic across reels: ElevenLabs v3 per take, /with-timestamps. Rex = Chris, Kate = Sarah
by default. Short cues (2-4 words) work best. Cached mp3+alignment in assets/voice_el; re-running never
re-spends. Writes assets/voice/<id>.wav + assets/voice/voice.json.
Word times: v3 alignment, then snapped to real speech onsets from silencedetect when the alignment starts
a word inside a pause.

Reads TAKES from takes.json in the project root, either:
  - a plain list: [["k1", "K", "Before we start. The invoice?", "[casual, friendly]"], ...]
  - or an object: {"takes": [...], "voices": {"K": "<id>", "R": "<id>"}, "override": {...},
                   "clip_end": {...}, "suffix": {...}, "retake": {...}}
    where override/clip_end/suffix/retake mirror the OVERRIDE/CLIP_END/SUFFIX/RETAKE dicts below and,
    if present, are merged on top of the in-file defaults (which stay empty unless a reel needs a fix).

retakes.json (id -> alternate cue) is honoured too, taking priority over an in-file "retake" key, so a
retake can be pushed without touching takes.json.

Run `python3 tts_el.py` for every take, or `python3 tts_el.py k1 r3` to redo just those ids.
NEVER run this against a project unless you intend to spend ElevenLabs credits."""
import os, re, sys, json, subprocess
from el_call import call
os.chdir(os.path.dirname(os.path.abspath(__file__)))

DEFAULT_VOICES = {'K': 'EXAVITQu4vr4xnSDxMaL', 'R': 'iP95p4xoKVk53GoZ742B'}

raw = json.load(open('takes.json'))
if isinstance(raw, list):
    TAKES = [tuple(t) for t in raw]
    VOICES = dict(DEFAULT_VOICES)
    OVERRIDE, CLIP_END, SUFFIX, RETAKE_FILE = {}, {}, {}, {}
else:
    TAKES = [tuple(t) for t in raw['takes']]
    VOICES = dict(DEFAULT_VOICES); VOICES.update(raw.get('voices', {}))
    OVERRIDE = {k: {int(i): v for i, v in d.items()} for k, d in raw.get('override', {}).items()}
    CLIP_END = raw.get('clip_end', {})
    SUFFIX = raw.get('suffix', {})
    RETAKE_FILE = raw.get('retake', {})

RETAKE = json.load(open('retakes.json')) if os.path.exists('retakes.json') else RETAKE_FILE
C, V = 'assets/voice_el', 'assets/voice'; os.makedirs(C, exist_ok=True)
only = set(sys.argv[1:])
meta, spent = {}, 0
def sh(*a): return subprocess.run(a, capture_output=True, text=True)
for n, spk, text, tag in TAKES:
    if only and n not in only: continue
    SUFFIX.setdefault(n, ' [pause]')   # v3 clips the last word on ~half of all takes without something after it (Brad, 2026-09-28: 9 of 17); "" in takes.json opts out
    if not SUFFIX[n]: SUFFIX.pop(n)
    cue = RETAKE.get(n, tag); key = n + ('_rt' if n in RETAKE else '') + ('_sx' if n in SUFFIX else '')
    mp3, aj = f'{C}/{key}.mp3', f'{C}/{key}.json'
    if not os.path.exists(aj):
        a, cost = call(VOICES[spk], f'{cue} {text}{SUFFIX.get(n, "")}', mp3)
        json.dump(dict(alignment=a, cost=cost, cue=cue), open(aj, 'w')); spent += int(cost) if str(cost).isdigit() else 0
    rec = json.load(open(aj)); al = rec['alignment']
    chars, st, en = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    full = ''.join(chars); off = full.find(text)
    if off < 0:
        off = full.find(text.rstrip('.')); assert off >= 0, (n, full)
    tl = len(text.rstrip('.')) if full.find(text) < 0 else len(text)
    mdur = float(sh('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3).stdout)
    sd = sh('ffmpeg', '-i', mp3, '-af', 'silencedetect=n=-34dB:d=0.06', '-f', 'null', '-').stderr
    ss = [float(x) for x in re.findall(r'silence_start: (-?[\d.]+)', sd)]; se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', sd)]
    on = se[0] if ss and ss[0] <= 0.12 and se else 0.0
    al_end = en[off + tl - 1]
    flag = ' TRUNCATED?' if al_end > mdur - 0.02 else ''
    t0 = max(0.0, min(st[off] - 0.12, on - 0.04))
    t1 = min(al_end + 0.38, mdur)
    if CLIP_END.get(n): t1 = t0 + CLIP_END[n]
    af = f'atrim={t0:.3f}:{t1:.3f},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=mono,afade=t=in:d=0.015,afade=t=out:st={max(0, t1 - t0 - 0.12):.3f}:d=0.12'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-af', af, f'{V}/{n}.wav'], check=True)
    # speech segments of the trimmed clip, for onset snapping and speech_end
    sd2 = sh('ffmpeg', '-i', f'{V}/{n}.wav', '-af', 'silencedetect=n=-34dB:d=0.08', '-f', 'null', '-').stderr
    s2 = [float(x) for x in re.findall(r'silence_start: (-?[\d.]+)', sd2)]; e2 = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', sd2)]
    dur = float(sh('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{V}/{n}.wav').stdout)
    sil = list(zip(s2, e2 + [dur] * (len(s2) - len(e2))))
    words, pos = [], 0
    for w in text.split():
        i = text.find(w, pos); pos = i + len(w)
        wt = max(0.0, st[off + min(i, tl - 1)] - t0 - 0.03)
        for a, b in sil:                                   # alignment started this word inside a pause: snap to the onset
            if a - 0.01 <= wt < b - 0.02 and b < dur - 0.05: wt = b - 0.02; break
        words.append([w, round(wt, 3)])
    for k, v in OVERRIDE.get(n, {}).items(): words[int(k)][1] = v
    sp_end = min([a for a, b in sil if a > words[-1][1]] or [dur])
    meta[n] = dict(spk=spk, text=text, dur=round(dur, 3), speech_end=round(sp_end, 3), words=words, cue=cue)
    print(f'{n:4s} {spk} dur {dur:.2f} speech_end {sp_end:.2f} cost {rec.get("cost")} {flag} {words}')
p = f'{V}/voice.json'
old = json.load(open(p)) if (only and os.path.exists(p)) else {}
old = {k: v for k, v in old.items() if k in {t[0] for t in TAKES}}
old.update(meta); json.dump(old, open(p, 'w'), indent=1)
print('credits this run:', spent)

# speech_end = last 20 ms frame above -38 dB (silencedetect misses breath tails on v3 takes)
import struct, math
V2 = json.load(open(p))
for n in V2:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{V}/{n}.wav', '-f', 's16le', '-ac', '1', '-ar', '16000', '-'], capture_output=True).stdout
    x = struct.unpack(f'<{len(raw)//2}h', raw); w = 320
    e = [20 * math.log10(max(1, math.sqrt(sum(q * q for q in x[i:i + w]) / w)) / 32768) for i in range(0, len(x) - w + 1, w)]
    V2[n]['speech_end'] = round((max(i for i, v in enumerate(e) if v > -38) + 1) * 0.02, 3)
json.dump(V2, open(p, 'w'), indent=1)
