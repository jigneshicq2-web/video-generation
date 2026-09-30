"""Build the soundtrack: original synthesized music (120 BPM), a synced SFX layer
and the voiceover, then mix with VO ducking and master to broadcast levels.

Inputs : cue sheet from `node src/timeline.js`, audio/vo/lineNN.wav
Outputs: audio/music.wav, audio/sfx.wav, audio/vo_track.wav, audio/mix.wav
Everything is generated here (no stock/library audio), so it is fully cleared.
"""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf
from scipy import signal
import pyloudnorm as pyln

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
cues = json.loads(subprocess.check_output(["node", f"{ROOT}/src/timeline.js"]))
DUR = cues["duration"]
N = int(DUR * SR)
BEAT = 60.0 / cues["bpm"]
rng = np.random.default_rng(42)


# ---------------------------------------------------------------- helpers
def t_(d):
    return np.arange(int(d * SR)) / SR


def env_ad(n, a=0.005, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, t - a) / max(d, 1e-4))
    return e


def lp(x, fc, order=2):
    b, a = signal.butter(order, min(fc, SR / 2 - 100) / (SR / 2), "low")
    return signal.lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), "high")
    return signal.lfilter(b, a, x)


def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), min(hi, SR / 2 - 100) / (SR / 2)], "band")
    return signal.lfilter(b, a, x)


def sweep_filter(x, f0, f1, kind="low", steps=24):
    """Time-varying filter by crossfading short filtered blocks (cheap and smooth)."""
    out = np.zeros_like(x)
    edges = np.linspace(0, len(x), steps + 1).astype(int)
    zi = None
    for i in range(steps):
        fc = f0 * (f1 / f0) ** (i / max(1, steps - 1))
        b, a = signal.butter(2, min(fc, SR / 2 - 200) / (SR / 2), kind)
        seg = x[edges[i]:edges[i + 1]]
        if zi is None:
            zi = signal.lfilter_zi(b, a) * 0
        y, zi = signal.lfilter(b, a, seg, zi=zi)
        out[edges[i]:edges[i + 1]] = y
    return out


def saw(f, t, detune=0.0):
    ph = (f * (1 + detune)) * t
    return 2 * (ph - np.floor(ph + 0.5))


def noise(n):
    return rng.standard_normal(n)


def place(buf, x, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= buf.shape[0]:
        return
    x = x[: buf.shape[0] - i]
    l = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2)
    r = np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    buf[i:i + len(x), 0] += x * gain * l
    buf[i:i + len(x), 1] += x * gain * r


def reverb_ir(dur=1.6, decay=3.5, seed=1):
    r = np.random.default_rng(seed)
    n = int(dur * SR)
    t = np.arange(n) / SR
    ir = r.standard_normal((n, 2)) * np.exp(-decay * t)[:, None]
    ir[:, 0] = lp(ir[:, 0], 6000)
    ir[:, 1] = lp(ir[:, 1], 6000)
    return ir / np.sqrt(np.sum(ir ** 2, axis=0))


def reverb(st, mix=0.2, dur=1.6, decay=3.5):
    ir = reverb_ir(dur, decay)
    wet = np.stack([signal.fftconvolve(st[:, c], ir[:, c])[: len(st)] for c in range(2)], axis=1)
    return st * (1 - mix) + wet * mix


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- music
def build_music():
    mus = np.zeros((N, 2))
    # chords per bar (2 s): Am F C G, looped. (root midi, chord tones)
    prog = [(45, [57, 60, 64, 67]), (41, [53, 57, 60, 64]), (48, [55, 60, 64, 67]), (43, [55, 59, 62, 67])]
    bars = int(np.ceil(DUR / (4 * BEAT)))

    def chord_at(t):
        return prog[int(t // (4 * BEAT)) % 4]

    # --- intro tension 0 - 2.7: drone + riser + accelerating ticks
    d = t_(2.7)
    drone = (saw(midi(33), d) * 0.5 + saw(midi(33), d, 0.004) * 0.5)
    drone = lp(drone, 380) * np.linspace(0.3, 0.9, len(d))
    place(mus, drone * 0.35, 0.0)
    rz = noise(len(d))
    rz = sweep_filter(rz, 300, 7000, "low") * np.linspace(0, 1, len(d)) ** 2
    place(mus, rz * 0.12, 0.0, pan=-0.2)
    tt = 0.0
    step = 0.25
    while tt < 2.65:
        tick = hp(noise(int(0.03 * SR)), 7000) * env_ad(int(0.03 * SR), 0.001, 0.02)
        place(mus, tick * (0.12 + 0.2 * tt / 2.7), tt, pan=0.3 if int(tt * 8) % 2 else -0.3)
        tt += step
        step = max(0.0625, step * 0.9)
    # pitch-rising tension tone
    sw = np.sin(2 * np.pi * np.cumsum(np.linspace(220, 660, len(d))) / SR) * np.linspace(0, 0.08, len(d))
    place(mus, sw, 0.0)

    # --- drums from 3.0
    def kick():
        n = int(0.45 * SR)
        t = np.arange(n) / SR
        f = 45 + 110 * np.exp(-t * 28)
        k = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
        click = hp(noise(n), 3000) * np.exp(-t * 300) * 0.3
        return np.tanh((k + click) * 1.6)

    def clap():
        n = int(0.3 * SR)
        z = bp(noise(n), 900, 5000)
        e = np.zeros(n)
        for off in (0, 0.011, 0.022):
            i = int(off * SR)
            e[i:] += np.exp(-np.arange(n - i) / SR * 40) * (0.6 if off < 0.02 else 1)
        return z * e * 0.6

    def hat(open_=False):
        n = int((0.22 if open_ else 0.05) * SR)
        return hp(noise(n), 8000) * env_ad(n, 0.001, 0.12 if open_ else 0.018)

    K, CL, HC, HO = kick(), clap(), hat(), hat(True)
    kick_times = []
    beat = 3.0
    while beat < 28.0 - 1e-6:
        in_break = 25.5 <= beat < 26.5  # short drop before the hero hit
        rel = beat - 3.0
        bi = int(round(rel / BEAT))
        if not in_break:
            place(mus, K, beat, 0.95)
            kick_times.append(beat)
            if bi % 2 == 1:
                place(mus, CL, beat, 0.55, 0.05)
            # hats
            place(mus, HC, beat + BEAT / 2, 0.22 if beat < 10 else 0.28, 0.25)
            if beat >= 10:
                place(mus, HC, beat + BEAT / 4, 0.12, -0.25)
                place(mus, HC, beat + 3 * BEAT / 4, 0.12, -0.25)
            if beat >= 20:
                place(mus, HO, beat + BEAT / 2, 0.14, 0.3)
        beat += BEAT
    # snare roll into the hero moment
    for i in range(8):
        place(mus, CL, 25.5 + i * BEAT / 4 + (i // 4) * 0, 0.2 + 0.05 * i, 0.0)

    # sidechain envelope from kicks
    sc = np.ones(N)
    for kt in kick_times:
        i = int(kt * SR)
        n = int(0.28 * SR)
        seg = 1 - 0.65 * np.exp(-np.arange(n) / SR * 14)
        sc[i:i + n] = np.minimum(sc[i:i + n], seg[: len(sc[i:i + n])])

    # --- bass (8ths on the root) 3.0 - 28
    bass = np.zeros(N)
    t0 = 3.0
    while t0 < 28.0:
        root, _ = chord_at(t0)
        n = int(BEAT / 2 * SR)
        tt_ = np.arange(n) / SR
        f = midi(root - 12 + (12 if (t0 >= 20 and int(t0 / (BEAT / 2)) % 2) else 0))
        note = (np.sin(2 * np.pi * f * tt_) * 0.8 + saw(f, tt_) * 0.35) * env_ad(n, 0.004, 0.22, 3)
        i = int(t0 * SR)
        bass[i:i + n] += note[: max(0, min(n, N - i))]
        t0 += BEAT / 2
    bass = lp(bass, 900) * sc
    mus[:, 0] += bass * 0.42
    mus[:, 1] += bass * 0.42

    # --- pad (supersaw, per bar) 2.9 - 30
    pad = np.zeros((N, 2))
    for b in range(bars):
        start = b * 4 * BEAT
        if start + 4 * BEAT < 2.9:
            continue
        s0 = max(start, 2.9)
        dur = min(start + 4 * BEAT, DUR) - s0
        if dur <= 0:
            continue
        tt_ = t_(dur)
        _, tones = chord_at(s0)
        v = np.zeros((len(tt_), 2))
        for j, m in enumerate(tones):
            for k, dt in enumerate((-0.006, 0.0, 0.007)):
                ch = (j + k) % 2
                v[:, ch] += saw(midi(m), tt_ + 0.013 * k, dt)
        a = np.minimum(1, tt_ / 0.08) * np.minimum(1, (dur - tt_) / 0.05 + 0.0)
        v *= a[:, None]
        i = int(s0 * SR)
        pad[i:i + len(tt_)] += v[: N - i]
    padf = np.zeros_like(pad)
    for c in range(2):
        seg1 = lp(pad[:, c], 1300)
        seg2 = lp(pad[:, c], 2400)
        seg3 = lp(pad[:, c], 3600)
        tt_ = np.arange(N) / SR
        w2 = np.clip((tt_ - 10) / 2, 0, 1)
        w3 = np.clip((tt_ - 20) / 2, 0, 1)
        padf[:, c] = seg1 * (1 - w2) + seg2 * (w2 - w3) + seg3 * w3
    padf *= sc[:, None] * 0.055
    mus += padf

    # --- arp (16ths plucks) 10 - 28
    t0 = 10.0
    idx = 0
    while t0 < 28.0:
        if not (25.5 <= t0 < 26.5):
            _, tones = chord_at(t0)
            m = tones[[0, 1, 2, 3, 2, 1, 3, 2][idx % 8]] + 12
            n = int(0.18 * SR)
            tt_ = np.arange(n) / SR
            pl = saw(midi(m), tt_) * env_ad(n, 0.002, 0.08, 5)
            pl = lp(pl, 2500 if t0 < 20 else 4200)
            place(mus, pl, t0, 0.07 if t0 < 20 else 0.09, pan=0.35 if idx % 2 else -0.35)
        t0 += BEAT / 4
        idx += 1

    # --- risers into scene changes & the hero hit
    for at, d, g in [(9.0, 1.0, 0.05), (19.0, 1.0, 0.06), (25.4, 1.1, 0.12)]:
        z = noise(int(d * SR))
        z = sweep_filter(z, 400, 9000, "low") * np.linspace(0, 1, len(z)) ** 2
        place(mus, z, at, g, 0.15)

    # --- final branded chord 28 - 30 (Am add9 with bell)
    tt_ = t_(2.0)
    fin = np.zeros(len(tt_))
    for m in (45, 57, 64, 67, 71, 72):
        fin += np.sin(2 * np.pi * midi(m) * tt_) * (0.5 if m > 60 else 0.8)
        fin += saw(midi(m), tt_, 0.004) * 0.08
    fin = lp(fin, 2500) * np.exp(-tt_ * 0.9) * np.minimum(1, tt_ / 0.02)
    place(mus, fin * 0.09, 28.0)

    # hard gap at the freeze (2.7 - 2.9): only tails remain
    g = np.ones(N)
    a, b = int(2.7 * SR), int(2.92 * SR)
    g[a:b] = 0.0
    mus *= g[:, None]
    mus = reverb(mus, 0.16, 1.4, 3.0)
    # gentle overall fade at the very end
    tail = int(0.35 * SR)
    mus[-tail:] *= np.linspace(1, 0, tail)[:, None]
    return mus


# ---------------------------------------------------------------- SFX
def sfx(kind):
    if kind == "click":
        n = int(0.04 * SR)
        return hp(noise(n), 2500) * env_ad(n, 0.0005, 0.008) * 0.8 + np.sin(2 * np.pi * 2200 * t_(0.04)) * env_ad(n, 0.0005, 0.01) * 0.3
    if kind == "key":
        n = int(0.05 * SR)
        return bp(noise(n), 1500, 6000) * env_ad(n, 0.0005, 0.012) * 0.7
    if kind == "pop":
        n = int(0.09 * SR)
        tt = np.arange(n) / SR
        f = 500 + 900 * np.exp(-tt * 60)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.001, 0.04) * 0.7
    if kind == "notif":
        a = np.sin(2 * np.pi * 1318.5 * t_(0.12)) * env_ad(int(0.12 * SR), 0.002, 0.06)
        b = np.sin(2 * np.pi * 1760 * t_(0.2)) * env_ad(int(0.2 * SR), 0.002, 0.09)
        out = np.zeros(int(0.28 * SR)); out[: len(a)] += a; out[int(0.07 * SR): int(0.07 * SR) + len(b)] += b
        return out * 0.45
    if kind in ("blip", "data_blip", "tick"):
        f = {"blip": 1900, "data_blip": 2600 + rng.integers(0, 6) * 180, "tick": 3200}[kind]
        n = int(0.05 * SR)
        return np.sin(2 * np.pi * f * t_(0.05)) * env_ad(n, 0.001, 0.015) * 0.5
    if kind.startswith("whoosh") or kind in ("publish_whoosh", "circle_whoosh"):
        d = {"whoosh_short": 0.3, "whoosh_long": 0.55, "whoosh_wide": 0.45, "whoosh_rev": 0.45, "publish_whoosh": 0.5, "circle_whoosh": 0.5}[kind]
        z = noise(int(d * SR))
        up = kind != "whoosh_rev"
        z = sweep_filter(z, 400, 6000, "low") if up else sweep_filter(z, 6000, 400, "low")
        e = np.sin(np.linspace(0, np.pi, len(z))) ** (1.5 if up else 0.8)
        if kind == "whoosh_rev":
            e = np.linspace(0, 1, len(z)) ** 2
        if kind == "circle_whoosh":
            e = e * (0.75 + 0.25 * np.sin(np.linspace(0, 6 * np.pi, len(z))))
        return z * e * 0.5
    if kind in ("slam", "impact", "soft_impact", "impact_big", "thud", "report_impact"):
        d = {"slam": 0.5, "impact": 0.8, "soft_impact": 0.5, "impact_big": 1.8, "thud": 0.4, "report_impact": 1.0}[kind]
        n = int(d * SR)
        tt = np.arange(n) / SR
        f = 38 + 90 * np.exp(-tt * 18)
        body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * (2.2 if kind == "impact_big" else 6))
        crack = lp(noise(n), 5000 if kind != "soft_impact" else 1800) * np.exp(-tt * 35) * (0.5 if kind != "thud" else 0.15)
        out = np.tanh((body * 1.2 + crack) * 1.4)
        if kind in ("impact_big", "report_impact"):
            out = out + lp(noise(n), 2500) * np.exp(-tt * 4) * 0.12
        return out * 0.8
    if kind == "error":
        a = np.sign(np.sin(2 * np.pi * 330 * t_(0.12))) * env_ad(int(0.12 * SR), 0.002, 0.08, 2)
        b = np.sign(np.sin(2 * np.pi * 247 * t_(0.2))) * env_ad(int(0.2 * SR), 0.002, 0.12, 2)
        out = np.zeros(int(0.35 * SR)); out[: len(a)] += a; out[int(0.13 * SR): int(0.13 * SR) + len(b)] += b
        return lp(out, 2500) * 0.3
    if kind in ("tension", "tension_short"):
        d = 2.7 if kind == "tension" else 0.5
        tt = t_(d)
        x = (np.sin(2 * np.pi * 55 * tt) + 0.5 * np.sin(2 * np.pi * 58.3 * tt)) * np.linspace(0.2, 1, len(tt))
        return lp(x, 300) * 0.35
    if kind == "freeze":
        # tape-stop style: short downward pitch sweep + filtered hit
        n = int(0.25 * SR)
        tt = np.arange(n) / SR
        f = 900 * np.exp(-tt * 14)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.001, 0.15) * 0.5 + lp(noise(n), 1500) * env_ad(n, 0.001, 0.05) * 0.4
    if kind == "implode":
        z = noise(int(0.25 * SR))
        return sweep_filter(z, 8000, 300, "low") * np.linspace(1, 0.2, len(z)) * 0.45
    if kind in ("logo_sting", "shimmer"):
        d = 1.6 if kind == "logo_sting" else 0.9
        tt = t_(d)
        x = np.zeros(len(tt))
        for m, g in ((76, 0.5), (81, 0.4), (83, 0.3), (88, 0.25)):
            x += np.sin(2 * np.pi * midi(m) * tt) * g * np.exp(-tt * 2.5)
        x += hp(noise(len(tt)), 9000) * np.exp(-tt * 6) * 0.08
        return x * 0.35 * np.minimum(1, tt / 0.005)
    if kind == "chime" or kind == "success":
        notes = (72, 76, 79, 84) if kind == "chime" else (79, 84)
        out = np.zeros(int(0.9 * SR))
        for i, m in enumerate(notes):
            n = int(0.6 * SR)
            tone = (np.sin(2 * np.pi * midi(m) * t_(0.6)) + 0.3 * np.sin(2 * np.pi * midi(m) * 2 * t_(0.6))) * env_ad(n, 0.002, 0.25)
            s = int(i * 0.06 * SR)
            out[s:s + n] += tone
        return out * 0.3
    if kind == "ai_gen":
        tt = t_(0.5)
        f = 600 + 1800 * tt / 0.5
        x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(2 * np.pi * 24 * tt)) * np.sin(np.linspace(0, np.pi, len(tt)))
        return x * 0.22 + bp(noise(len(tt)), 3000, 9000) * np.sin(np.linspace(0, np.pi, len(tt))) * 0.08
    if kind == "type_burst":
        out = np.zeros(int(0.45 * SR))
        for i in range(9):
            k = sfx("key")
            s = int((i * 0.045 + rng.random() * 0.01) * SR)
            out[s:s + len(k)] += k[: len(out) - s]
        return out
    if kind == "snap":
        n = int(0.06 * SR)
        return (bp(noise(n), 2000, 8000) * env_ad(n, 0.0005, 0.01) + np.sin(2 * np.pi * 1400 * t_(0.06)) * env_ad(n, 0.0005, 0.02) * 0.4) * 0.7
    if kind == "morph":
        tt = t_(0.4)
        f = 300 + 900 * (tt / 0.4) ** 2
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.linspace(0, np.pi, len(tt))) * 0.25
    if kind == "retry":
        out = np.zeros(int(0.4 * SR))
        for i in range(3):
            b = sfx("blip")
            s = int(i * 0.08 * SR)
            out[s:s + len(b)] += b * (0.6 + 0.2 * i)
        return out
    if kind == "magnet_snap":
        z = noise(int(0.3 * SR))
        suck = sweep_filter(z, 300, 7000, "low") * np.linspace(0, 1, len(z)) ** 3 * 0.4
        hit = sfx("impact")[: int(0.5 * SR)] * 0.9
        out = np.zeros(len(suck) + len(hit))
        out[: len(suck)] += suck
        out[len(suck) - int(0.01 * SR): len(suck) - int(0.01 * SR) + len(hit)] += hit
        return out
    if kind == "data_burst":
        out = np.zeros(int(0.6 * SR))
        for i in range(14):
            b = np.sin(2 * np.pi * (1800 + rng.random() * 2400) * t_(0.04)) * env_ad(int(0.04 * SR), 0.001, 0.012)
            s = int(rng.random() * 0.45 * SR)
            out[s:s + len(b)] += b * 0.4
        w = sfx("whoosh_short")
        out[: len(w)] += w * 0.6
        return out
    if kind == "chart_build":
        tt = t_(0.18)
        f = 700 + 1400 * tt / 0.18
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(tt), 0.002, 0.1) * 0.25
    if kind == "riser_short":
        z = noise(int(0.5 * SR))
        return sweep_filter(z, 500, 9000, "low") * np.linspace(0, 1, len(z)) ** 2 * 0.4
    raise ValueError(kind)


def build_sfx():
    buf = np.zeros((N, 2))
    pans = np.random.default_rng(3)
    for at, kind, g in cues["sfx"]:
        x = sfx(kind)
        pan = 0.0 if kind in ("impact_big", "slam", "impact", "logo_sting", "freeze", "tension") else float(pans.uniform(-0.35, 0.35))
        place(buf, x, at, g, pan)
    return reverb(buf, 0.12, 0.9, 5.0)


# ---------------------------------------------------------------- VO
def peaking(x, f0, gain_db, q=1.0):
    A = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * f0 / SR
    al = np.sin(w0) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w0), 1 - al * A]
    a = [1 + al / A, -2 * np.cos(w0), 1 - al / A]
    return signal.lfilter(b, a, x)


def compress(x, thr_db=-20, ratio=3.0, att=0.004, rel=0.12):
    env = np.abs(x)
    a1, r1 = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    e = np.zeros_like(env)
    prev = 0.0
    for i, v in enumerate(env):  # simple follower
        c = a1 if v > prev else r1
        prev = c * prev + (1 - c) * v
        e[i] = prev
    db = 20 * np.log10(e + 1e-9)
    over = np.maximum(0, db - thr_db)
    gain = 10 ** (-(over - over / ratio) / 20)
    return x * gain


def build_vo():
    vo = np.zeros(N)
    override = os.path.join(ROOT, "audio", "vo_override.wav")
    if os.path.exists(override):
        # A full-length pre-timed VO (e.g. a Higgsfield / studio take) replaces the TTS lines.
        x, sr = sf.read(override, always_2d=True)
        x = x.mean(axis=1)
        if sr != SR:
            x = signal.resample_poly(x, SR, sr)
        vo[: min(N, len(x))] = x[:N]
    else:
        for c in cues["vo"]:
            x, sr = sf.read(f"{ROOT}/audio/vo/line{c['line']:02d}.wav")
            if x.ndim > 1:
                x = x.mean(axis=1)
            x = signal.resample_poly(x, SR, sr)
            i = int(c["at"] * SR)
            vo[i:i + len(x)] += x[: N - i]
    vo = hp(vo, 90)
    vo = peaking(vo, 200, -1.5, 0.9)
    vo = peaking(vo, 3200, 3.0, 1.0)
    vo = compress(vo, -22, 3.0)
    vo /= np.max(np.abs(vo)) + 1e-9
    return vo


# ---------------------------------------------------------------- mix
def follower(x, att=0.01, rel=0.25):
    env = np.abs(x)
    b, a = signal.butter(1, 12 / (SR / 2))
    e = signal.filtfilt(b, a, env)
    return e / (e.max() + 1e-9)


def limiter(st, ceiling_db=-1.2, look=0.003, rel=0.08):
    ceil = 10 ** (ceiling_db / 20)
    peak = np.max(np.abs(st), axis=1)
    la = int(look * SR)
    need = np.maximum(1.0, peak / ceil)
    # look-ahead: max over window
    from scipy.ndimage import maximum_filter1d
    need = maximum_filter1d(need, size=2 * la + 1)
    g = 1 / need
    r = np.exp(-1 / (rel * SR))
    out = np.empty_like(g)
    cur = 1.0
    for i, v in enumerate(g):
        cur = v if v < cur else r * cur + (1 - r) * v
        out[i] = cur
    return st * out[:, None]


def main():
    os.makedirs(f"{ROOT}/audio", exist_ok=True)
    mus = build_music()
    fx = build_sfx()
    vo = build_vo()
    sf.write(f"{ROOT}/audio/music.wav", mus / (np.abs(mus).max() + 1e-9) * 0.9, SR)
    sf.write(f"{ROOT}/audio/sfx.wav", fx / (np.abs(fx).max() + 1e-9) * 0.9, SR)
    sf.write(f"{ROOT}/audio/vo_track.wav", vo * 0.9, SR)

    meter = pyln.Meter(SR)
    def norm(x, target):
        l = meter.integrated_loudness(x if x.ndim == 2 else np.stack([x, x], 1))
        return x * 10 ** ((target - l) / 20)

    # stem levels relative to each other (LUFS), then duck music/SFX under VO
    vo_st = np.stack([vo, vo], 1)
    vo_st = norm(vo_st, -16.0)
    mus_n = norm(mus, -21.5)
    fx_n = norm(fx, -22.5)
    duck = follower(vo)
    mus_n *= (1 - 0.5 * np.clip(duck * 2.2, 0, 1))[:, None]   # up to ~-6 dB under speech
    fx_n *= (1 - 0.25 * np.clip(duck * 2.2, 0, 1))[:, None]
    mix = vo_st + mus_n + fx_n
    mix = norm(mix, -14.0)
    mix = limiter(mix, -1.2)
    mix = limiter(mix, -1.2)
    L = meter.integrated_loudness(mix)
    print(f"integrated loudness {L:.1f} LUFS, sample peak {20*np.log10(np.abs(mix).max()):.2f} dBFS")
    sf.write(f"{ROOT}/audio/mix.wav", mix.astype(np.float32), SR, subtype="PCM_24")


if __name__ == "__main__":
    main()
