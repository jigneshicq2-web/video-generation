"""Bumper soundtrack: original synthesized corporate-electronic bed (120 BPM), UI SFX from the
cue sheet, and the VO, mixed with ducking and mastered to -14 LUFS / <= -1 dBTP.
Everything is generated here (no stock or library audio), so it is cleared for commercial use.
Usage: python3 bumper/audio.py <spot>   -> audio/bumper/<spot>/{music,sfx,mix}.wav"""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf
from scipy import signal
from scipy.ndimage import maximum_filter1d
import pyloudnorm as pyln

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPOT = sys.argv[1] if len(sys.argv) > 1 else "batch"
OUT = f"{ROOT}/audio/bumper/{SPOT}"
SR = 48000
cues = json.loads(subprocess.check_output(["node", f"{ROOT}/bumper/spots/{SPOT}/timeline.js"]))
DUR = cues["duration"]
N = int(round(DUR * SR))
BEAT = 60.0 / cues["bpm"]
STING = 4.0          # beat 8: resolves as the end card lands
LIFT = (2.9, STING)  # synth lift into the end card
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.003, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, t - a) / max(d, 1e-4))


def filt(x, fc, kind="low", order=2):
    fc = np.minimum(np.atleast_1d(fc), SR / 2 - 200) / (SR / 2)
    b, a = signal.butter(order, fc[0] if len(fc) == 1 else fc, kind if len(fc) == 1 else "band")
    return signal.lfilter(b, a, x)


def sweep(x, f0, f1, steps=32):
    out = np.zeros_like(x)
    edges = np.linspace(0, len(x), steps + 1).astype(int)
    zi = np.zeros(2)
    for i in range(steps):
        fc = f0 * (f1 / f0) ** (i / (steps - 1))
        b, a = signal.butter(2, min(fc, SR / 2 - 200) / (SR / 2))
        out[edges[i]:edges[i + 1]], zi = signal.lfilter(b, a, x[edges[i]:edges[i + 1]], zi=zi)
    return out


def saw(f, t, det=0.0):
    ph = f * (1 + det) * t
    return 2 * (ph - np.floor(ph + 0.5))


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(buf, x, at, g=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    buf[i:i + len(x), 0] += x * g * np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    buf[i:i + len(x), 1] += x * g * np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)


def reverb(st, mix=0.15, dur=1.2, decay=4.0):
    n = int(dur * SR)
    ir = np.random.default_rng(1).standard_normal((n, 2)) * np.exp(-decay * np.arange(n) / SR)[:, None]
    ir = np.stack([filt(ir[:, c], 7000) for c in range(2)], 1)
    ir /= np.sqrt((ir ** 2).sum(0))
    wet = np.stack([signal.fftconvolve(st[:, c], ir[:, c])[: len(st)] for c in range(2)], 1)
    return st * (1 - mix) + wet * mix


# chord per time: C | Am | F G  -> resolve to C add9 on the sting
def chord(t):
    if t < 2.0:
        return 48, [60, 64, 67, 71]      # Cmaj7
    if t < 3.0:
        return 45, [57, 60, 64, 67]      # Am7
    if t < 3.5:
        return 41, [57, 60, 65, 69]      # Fmaj7
    return 43, [59, 62, 67, 71]          # G


def build_music():
    mus = np.zeros((N, 2))
    # drums: light four-on-the-floor pulse, offbeat hats, 16th shaker; drop out for the lift
    n = int(0.35 * SR); tt = np.arange(n) / SR
    kick = np.tanh(np.sin(2 * np.pi * np.cumsum(50 + 100 * np.exp(-tt * 30)) / SR) * np.exp(-tt * 9) * 1.5)
    hat = filt(rng.standard_normal(int(0.05 * SR)), 8500, "high") * env(int(0.05 * SR), 0.001, 0.02)
    shk = filt(rng.standard_normal(int(0.04 * SR)), [5000, 12000]) * env(int(0.04 * SR), 0.004, 0.015)
    clap_n = int(0.25 * SR)
    clap = filt(rng.standard_normal(clap_n), [1000, 6000]) * env(clap_n, 0.002, 0.09)
    kicks = []
    b = 0.0
    while b < 3.5 - 1e-6:
        place(mus, kick, b, 0.8); kicks.append(b)
        if int(round(b / BEAT)) % 2 == 1:
            place(mus, clap, b, 0.3)
        place(mus, hat, b + BEAT / 2, 0.22, 0.25)
        for q in (0.25, 0.75):
            place(mus, shk, b + q * BEAT, 0.12, -0.3)
        b += BEAT
    sc = np.ones(N)  # sidechain from the kick
    for k in kicks:
        i = int(k * SR); m = int(0.22 * SR)
        sc[i:i + m] = np.minimum(sc[i:i + m], 1 - 0.55 * np.exp(-np.arange(m) / SR * 16)[: len(sc[i:i + m])])

    # bass: 8ths on the root
    bass = np.zeros(N)
    t0 = 0.0
    while t0 < STING - 1e-6:
        root, _ = chord(t0)
        m = int(BEAT / 2 * SR); tt = np.arange(m) / SR
        f = midi(root - 12)
        note = (np.sin(2 * np.pi * f * tt) * 0.8 + saw(f, tt) * 0.3) * env(m, 0.004, 0.2, 3)
        i = int(t0 * SR); bass[i:i + m] += note[: N - i]
        t0 += BEAT / 2
    bass = filt(bass, 700) * sc
    mus += np.stack([bass, bass], 1) * 0.4

    # plucked arpeggio, 8ths (the "repetitive" motif under Scene 1, keeps going into Scene 2)
    t0, idx = 0.0, 0
    while t0 < STING - 1e-6:
        _, tones = chord(t0)
        m_ = tones[[0, 2, 1, 3, 2, 1, 3, 2][idx % 8]] + 12
        m = int(0.2 * SR); tt = np.arange(m) / SR
        pl = filt(saw(midi(m_), tt) * 0.6 + np.sin(2 * np.pi * midi(m_) * tt), 3200) * env(m, 0.002, 0.09, 5)
        place(mus, pl, t0, 0.075, 0.35 if idx % 2 else -0.35)
        t0 += BEAT / 2; idx += 1

    # soft pad
    pad = np.zeros((N, 2))
    for s0, s1 in ((0.0, 2.0), (2.0, 3.0), (3.0, 3.5), (3.5, STING)):
        tt = t_(s1 - s0); _, tones = chord(s0)
        v = np.zeros((len(tt), 2))
        for j, m_ in enumerate(tones):
            for k, d in enumerate((-0.005, 0.006)):
                v[:, (j + k) % 2] += saw(midi(m_), tt + 0.01 * k, d)
        v *= (np.minimum(1, tt / 0.03) * np.minimum(1, (s1 - s0 - tt) / 0.03))[:, None]
        i = int(s0 * SR); pad[i:i + len(tt)] += v[: N - i]
    pad = np.stack([filt(pad[:, c], 1600) for c in range(2)], 1) * sc[:, None] * 0.03
    mus += pad

    # synth lift into the end card: rising filtered saw + noise swell
    d = LIFT[1] - LIFT[0]; tt = t_(d)
    f = midi(55) * 2 ** (tt / d)                       # one-octave rise
    lift = saw(1, np.cumsum(f) / SR) * 0.5
    lift = sweep(lift, 400, 6000) * (tt / d) ** 2
    nz = sweep(rng.standard_normal(len(tt)), 600, 9000) * (tt / d) ** 2.5
    place(mus, lift * 0.09 + nz * 0.07, LIFT[0])

    # end-card sting: bright C add9 chord + bell, decaying through the hold
    tt = t_(DUR - STING)
    st = np.zeros(len(tt))
    for m_, g in ((36, 0.9), (48, 0.6), (60, 0.5), (64, 0.4), (67, 0.4), (74, 0.3)):
        st += (np.sin(2 * np.pi * midi(m_) * tt) * g + saw(midi(m_), tt, 0.003) * g * 0.12)
    st = filt(st, 3000) * np.exp(-tt * 0.9) * np.minimum(1, tt / 0.01)
    bell = sum(np.sin(2 * np.pi * midi(m_) * tt) * g for m_, g in ((84, 0.5), (88, 0.35), (91, 0.25))) * np.exp(-tt * 3.5)
    hit = np.tanh(np.sin(2 * np.pi * np.cumsum(45 + 80 * np.exp(-tt * 20)) / SR) * np.exp(-tt * 8) * 1.4)
    place(mus, st * 0.16 + bell * 0.08 + hit * 0.45, STING)

    mus = reverb(mus, 0.14)
    fade = int(0.35 * SR)
    mus[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
    return mus


LONG20 = {"drop": 3.5, "solve": 5.0, "riser": 4.15, "demo": 8.7, "lift": 15.4, "end": 16.5}


def build_music_long(P=LONG20):
    """Long-form bed (120 BPM). Problem in A minor until `solve`, with drums dropping out from `drop`
    and a rise from `riser` into the solution; a C-G-Am-F groove under the product beats (busier from
    `demo`); a lift from `lift` into a resolving C add9 sting at `end` (on the beat)."""
    t_ = lambda d: np.arange(int(d * SR)) / SR
    mus = np.zeros((N, 2))
    FREEZE, SOLVE, LIFT0, END = P["drop"], P["solve"], P["lift"], P["end"]
    def chord_l(t):
        if t < SOLVE:  # problem: Am | F (two beats each bar half)
            return (45, [57, 60, 64, 67]) if (t // 2) % 2 == 0 else (41, [57, 60, 65, 69])
        prog = [(48, [60, 64, 67, 71]), (43, [59, 62, 67, 71]), (45, [57, 60, 64, 67]), (41, [57, 60, 65, 69])]
        return prog[int((t - SOLVE) // 2) % 4]
    n = int(0.35 * SR); tt = np.arange(n) / SR
    kick = np.tanh(np.sin(2 * np.pi * np.cumsum(50 + 100 * np.exp(-tt * 30)) / SR) * np.exp(-tt * 9) * 1.5)
    hat = filt(rng.standard_normal(int(0.05 * SR)), 8500, "high") * env(int(0.05 * SR), 0.001, 0.02)
    shk = filt(rng.standard_normal(int(0.04 * SR)), [5000, 12000]) * env(int(0.04 * SR), 0.004, 0.015)
    cn = int(0.25 * SR)
    clap = filt(rng.standard_normal(cn), [1000, 6000]) * env(cn, 0.002, 0.09)
    drums_on = lambda b: (b < FREEZE) or (SOLVE - 1e-6 <= b < LIFT0)
    kicks = []
    b = 0.0
    while b < END - 1e-6:
        if drums_on(b):
            place(mus, kick, b, 0.75 if b < SOLVE else 0.85); kicks.append(b)
            if int(round(b / BEAT)) % 2 == 1 and b >= SOLVE:
                place(mus, clap, b, 0.28)
            place(mus, hat, b + BEAT / 2, 0.2, 0.25)
            if b >= P["demo"]:  # a little more motion under the product demo
                for q in (0.25, 0.75):
                    place(mus, shk, b + q * BEAT, 0.12, -0.3)
        b += BEAT
    # light pulse continues under the end card (hats only), so it never goes dead
    b = END + BEAT
    while b < DUR - 0.6:
        place(mus, hat, b + BEAT / 2, 0.12, 0.2); b += BEAT
    sc = np.ones(N)
    for k in kicks:
        i = int(k * SR); m = int(0.22 * SR)
        sc[i:i + m] = np.minimum(sc[i:i + m], 1 - 0.5 * np.exp(-np.arange(m) / SR * 16)[: len(sc[i:i + m])])
    # bass 8ths (rests through the freeze and the lift)
    bass = np.zeros(N)
    t0 = 0.0
    while t0 < END - 1e-6:
        if drums_on(t0):
            root, _ = chord_l(t0)
            m = int(BEAT / 2 * SR); tt = np.arange(m) / SR
            f = midi(root - 12)
            note = (np.sin(2 * np.pi * f * tt) * 0.8 + saw(f, tt) * 0.3) * env(m, 0.004, 0.2, 3)
            i = int(t0 * SR); bass[i:i + m] += note[: N - i]
        t0 += BEAT / 2
    bass = filt(bass, 700) * sc
    mus += np.stack([bass, bass], 1) * 0.38
    # pluck arp from the solution on; brighter from the status beat
    t0, idx = SOLVE, 0
    while t0 < LIFT0 - 1e-6:
        _, tones = chord_l(t0)
        m_ = tones[[0, 2, 1, 3, 2, 1, 3, 2][idx % 8]] + 12
        m = int(0.2 * SR); tt = np.arange(m) / SR
        pl = filt(saw(midi(m_), tt) * 0.6 + np.sin(2 * np.pi * midi(m_) * tt), 2600 if t0 < P["demo"] else 3600) * env(m, 0.002, 0.09, 5)
        place(mus, pl, t0, 0.07, 0.35 if idx % 2 else -0.35)
        t0 += BEAT / 2; idx += 1
    # pad: continuous, swells through the freeze (the "stillness"), dips for the lift
    pad = np.zeros((N, 2))
    seg = 0.0
    while seg < END - 1e-6:
        s1 = min(END, seg + (2.0 if seg < SOLVE else 2.0))
        tt = t_(s1 - seg); _, tones = chord_l(seg)
        v = np.zeros((len(tt), 2))
        for j, m_ in enumerate(tones):
            for kk, d in enumerate((-0.005, 0.006)):
                v[:, (j + kk) % 2] += saw(midi(m_), tt + 0.01 * kk, d)
        v *= (np.minimum(1, tt / 0.03) * np.minimum(1, (s1 - seg - tt) / 0.03))[:, None]
        i = int(seg * SR); pad[i:i + len(tt)] += v[: N - i]
        seg = s1
    pad = np.stack([filt(pad[:, c], 1500) for c in range(2)], 1)
    tl = np.arange(N) / SR
    padg = 0.028 + 0.02 * np.clip((tl - FREEZE) / 0.3, 0, 1) * np.clip((SOLVE - tl) / 0.2, 0, 1)
    mus += pad * (sc * padg)[:, None]
    # rising sweep into the solution, and the lift into the end card
    for a0, a1, g in ((P["riser"], SOLVE, 0.9), (LIFT0, END, 1.0)):
        d = a1 - a0; tt = t_(d)
        f = midi(55) * 2 ** (tt / d)
        lift = sweep(saw(1, np.cumsum(f) / SR) * 0.5, 400, 6000) * (tt / d) ** 2
        nz = sweep(rng.standard_normal(len(tt)), 600, 9000) * (tt / d) ** 2.5
        place(mus, (lift * 0.08 + nz * 0.06) * g, a0)
    # downbeat accent on the solution
    tt = t_(0.6)
    place(mus, np.tanh(np.sin(2 * np.pi * np.cumsum(45 + 80 * np.exp(-tt * 20)) / SR) * np.exp(-tt * 8) * 1.4) * 0.3, SOLVE)
    # end-card sting: C add9 + bell, decaying under the CTA, with a soft held pad
    tt = t_(DUR - END)
    st = np.zeros(len(tt))
    for m_, g in ((36, 0.9), (48, 0.6), (60, 0.5), (64, 0.4), (67, 0.4), (74, 0.3)):
        st += (np.sin(2 * np.pi * midi(m_) * tt) * g + saw(midi(m_), tt, 0.003) * g * 0.12)
    st = filt(st, 3000) * (np.exp(-tt * 0.9) * 0.8 + 0.2) * np.minimum(1, tt / 0.01)
    bell = sum(np.sin(2 * np.pi * midi(m_) * tt) * g for m_, g in ((84, 0.5), (88, 0.35), (91, 0.25))) * np.exp(-tt * 3.0)
    hit = np.tanh(np.sin(2 * np.pi * np.cumsum(45 + 80 * np.exp(-tt * 20)) / SR) * np.exp(-tt * 8) * 1.4)
    place(mus, st * 0.13 + bell * 0.07 + hit * 0.4, END)
    mus = reverb(mus, 0.14)
    fade = int(0.6 * SR)
    mus[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5
    return mus


def sfx(kind):
    if kind == "click":  # soft, precise UI click
        m = int(0.035 * SR)
        return (filt(rng.standard_normal(m), [2500, 9000]) * env(m, 0.0004, 0.006) * 0.7
                + np.sin(2 * np.pi * 1900 * t_(0.035)) * env(m, 0.0004, 0.008) * 0.35)
    if kind == "notif":  # one restrained message notification: soft two-tone ping
        out = np.zeros(int(0.45 * SR))
        for i, (m_, g) in enumerate(((81, 0.8), (86, 0.6))):
            m = int(0.3 * SR); tt = t_(0.3)
            tone = (np.sin(2 * np.pi * midi(m_) * tt) + 0.15 * np.sin(6 * np.pi * midi(m_) * tt)) * env(m, 0.002, 0.11)
            s0 = int(i * 0.085 * SR); out[s0:s0 + m] += tone * g
        return out * 0.4
    if kind == "flip":  # quick calendar-page flip: papery swish ending in a light snap
        n = int(0.16 * SR); tt = np.arange(n) / SR
        sw = filt(rng.standard_normal(n), [1500, 9000]) * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.5
        snap = filt(rng.standard_normal(n), [2000, 7000]) * np.exp(-np.maximum(0, tt - 0.12) * 120) * (tt > 0.12) * 0.6
        return sw + snap
    if kind == "paper":  # soft paper-stack impact: low thump + papery slap
        n = int(0.3 * SR); tt = np.arange(n) / SR
        thump = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-tt * 30)) / SR) * np.exp(-tt * 18)
        slap = filt(rng.standard_normal(n), [600, 5000]) * np.exp(-tt * 45)
        return (thump * 0.7 + slap * 0.6) * 0.8
    if kind == "alert_soft":  # quiet UI alert: two soft descending tones, no buzz
        out = np.zeros(int(0.5 * SR))
        for i, (m_, g) in enumerate(((76, 0.7), (71, 0.6))):
            m = int(0.32 * SR); tt = t_(0.32)
            tone = (np.sin(2 * np.pi * midi(m_) * tt) + 0.12 * np.sin(4 * np.pi * midi(m_) * tt)) * env(m, 0.004, 0.13)
            s0 = int(i * 0.11 * SR); out[s0:s0 + m] += tone * g
        return out * 0.4
    if kind == "riser":  # short smooth rising whoosh (calendars aligning)
        n = int(0.55 * SR); tt = np.arange(n) / SR
        z = sweep(rng.standard_normal(n), 400, 7000) * (tt / tt[-1]) ** 1.6 * np.minimum(1, (tt[-1] - tt) / 0.04)
        return z * 0.55
    if kind == "snap":  # soft snap into place
        n = int(0.09 * SR)
        return (filt(rng.standard_normal(n), [1800, 7000]) * env(n, 0.0005, 0.012) * 0.8
                + np.sin(2 * np.pi * 1200 * t_(0.09)) * env(n, 0.0008, 0.025) * 0.45)
    if kind == "whoosh_soft":
        z = sweep(rng.standard_normal(int(0.32 * SR)), 400, 3500)
        return z * np.sin(np.linspace(0, np.pi, len(z))) ** 2 * 0.35
    if kind == "whoosh":
        z = sweep(rng.standard_normal(int(0.4 * SR)), 500, 5500)
        return z * np.sin(np.linspace(0, np.pi, len(z))) ** 1.6 * 0.55
    if kind == "confirm":  # restrained two-note confirmation
        out = np.zeros(int(0.6 * SR))
        for i, m_ in enumerate((79, 84)):
            m = int(0.45 * SR); tt = t_(0.45)
            tone = (np.sin(2 * np.pi * midi(m_) * tt) + 0.25 * np.sin(4 * np.pi * midi(m_) * tt)) * env(m, 0.002, 0.18)
            s = int(i * 0.07 * SR); out[s:s + m] += tone
        return out * 0.35
    raise ValueError(kind)


def build_sfx():
    buf = np.zeros((N, 2))
    for at, kind, g in cues["sfx"]:
        pan = {"click": float(rng.uniform(-0.25, 0.25)), "whoosh": -0.15}.get(kind, 0.0)
        place(buf, sfx(kind), at, g, pan)
    return reverb(buf, 0.1, 0.8, 6.0)


def peaking(x, f0, gain_db, q=1.0):
    A = 10 ** (gain_db / 40); w0 = 2 * np.pi * f0 / SR; al = np.sin(w0) / (2 * q)
    return signal.lfilter([1 + al * A, -2 * np.cos(w0), 1 - al * A], [1 + al / A, -2 * np.cos(w0), 1 - al / A], x)


def compress(x, thr_db=-22, ratio=3.0):
    e = signal.filtfilt(*signal.butter(1, 30 / (SR / 2)), np.abs(x))
    over = np.maximum(0, 20 * np.log10(e + 1e-9) - thr_db)
    return x * 10 ** (-(over - over / ratio) / 20)


def build_vo():
    vo = np.zeros(N)
    for c in cues["vo"]:
        x, sr = sf.read(f"{OUT}/vo{c['line']}.wav")
        x = signal.resample_poly(x if x.ndim == 1 else x.mean(1), SR, sr)
        i = int(c["at"] * SR); vo[i:i + len(x)] += x[: N - i]
    vo = filt(vo, 90, "high")
    vo = peaking(vo, 220, -1.5, 0.9)
    vo = peaking(vo, 3200, 2.5, 1.0)
    vo = compress(vo)
    return vo / (np.abs(vo).max() + 1e-9)


def limiter(st, ceiling_db):
    ceil = 10 ** (ceiling_db / 20)
    need = maximum_filter1d(np.maximum(1.0, np.abs(st).max(1) / ceil), size=2 * int(0.003 * SR) + 1)
    g = 1 / need; r = np.exp(-1 / (0.06 * SR)); out = np.empty_like(g); cur = 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else r * cur + (1 - r) * v
        out[i] = cur
    return st * out[:, None]


def main():
    m = cues.get("music")
    mus = build_music_long(LONG20) if m == "long20" else build_music_long(m) if isinstance(m, dict) else build_music()
    fx, vo = build_sfx(), build_vo()
    sf.write(f"{OUT}/music.wav", (mus / np.abs(mus).max() * 0.9).astype(np.float32), SR)
    sf.write(f"{OUT}/sfx.wav", (fx / np.abs(fx).max() * 0.9).astype(np.float32), SR)
    meter = pyln.Meter(SR, block_size=0.4)
    norm = lambda x, tgt: x * 10 ** ((tgt - meter.integrated_loudness(x)) / 20)
    vo_st = norm(np.stack([vo, vo], 1), -16.0)
    mus_n = norm(mus, -22.5)          # energetic but well under the voice
    fx_n = norm(fx, -27.0)            # SFX subordinate to the VO
    e = signal.filtfilt(*signal.butter(1, 10 / (SR / 2)), np.abs(vo)); e /= e.max()
    duck = np.clip(e * 2.5, 0, 1)
    mus_n *= (1 - 0.45 * duck)[:, None]   # ~ -5 dB under speech
    fx_n *= (1 - 0.2 * duck)[:, None]
    mix = norm(vo_st + mus_n + fx_n, -14.0)
    mix = limiter(limiter(mix, -2.0), -2.0)
    print(f"mix: {meter.integrated_loudness(mix):.1f} LUFS, sample peak {20 * np.log10(np.abs(mix).max()):.2f} dBFS, {len(mix) / SR:.3f}s")
    sf.write(f"{OUT}/mix.wav", mix.astype(np.float32), SR, subtype="PCM_24")


if __name__ == "__main__":
    main()
