#!/usr/bin/env python3
"""Synth the three "phone" one-shots a reel can optionally use: a phone buzz/vibrate, one ringback, and a
tinny music-box hold-music loop. Not every reel needs all three (or any) — run with the names you want,
e.g. `python3 gen_sfx.py buzz hold`, or with no args to generate all three. Writes assets/sfx/<name>.wav."""
import math, struct, wave, subprocess, os, sys
os.chdir(os.path.dirname(os.path.abspath(__file__)))
SR = 48000


def write(name, xs, band=False):
    raw = f'/tmp/{name}_raw.wav'
    with wave.open(raw, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, v)) * 30000)) for v in xs))
    af = 'highpass=f=320,lowpass=f=3200,acompressor=threshold=-18dB:ratio=4' if band else 'anull'
    os.makedirs('assets/sfx', exist_ok=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', af, f'assets/sfx/{name}.wav'], check=True)


def gen_buzz():
    """0.42 s on / 0.2 s off, 3 pulses, rattly 160 Hz with a table-rattle modulation."""
    buzz = []
    for i in range(int(SR * 1.86)):
        t = i / SR; on = (t % 0.62) < 0.42
        env = min(1, (t % 0.62) / 0.01) * min(1, (0.42 - (t % 0.62)) / 0.02) if on else 0
        v = (math.sin(2 * math.pi * 160 * t) + 0.55 * math.copysign(1, math.sin(2 * math.pi * 320 * t)) * 0.4) * (0.7 + 0.3 * math.sin(2 * math.pi * 28 * t))
        buzz.append(0.45 * env * v)
    write('buzz', buzz)


def gen_ring():
    """440 + 480 Hz ringback, 0.9 s with soft ends."""
    ring = []
    for i in range(int(SR * 0.9)):
        t = i / SR; env = min(1, t / 0.03) * min(1, (0.9 - t) / 0.06)
        ring.append(0.3 * env * (math.sin(2 * math.pi * 440 * t) + math.sin(2 * math.pi * 480 * t)))
    write('ring', ring, band=True)


def gen_hold():
    """A cheerful plinky loop (all original notes), 8 s, music-box timbre, phone band."""
    notes = [(72, .3), (76, .3), (79, .3), (76, .3), (74, .3), (77, .3), (81, .6), (79, .3), (77, .3), (76, .3), (74, .3), (72, .6),
             (72, .3), (76, .3), (79, .3), (84, .3), (83, .3), (79, .3), (77, .6), (76, .3), (74, .3), (72, .9)]
    hold, t0 = [0.0] * int(SR * 8.2), 0.0
    for m, d in notes:
        f = 440 * 2 ** ((m - 69) / 12); n0 = int(t0 * SR)
        for k in range(int(SR * min(d * 1.6, 1.2))):
            if n0 + k >= len(hold): break
            t = k / SR; env = math.exp(-t * 5) * min(1, t / 0.004)
            hold[n0 + k] += 0.32 * env * (math.sin(2 * math.pi * f * t) + 0.35 * math.sin(2 * math.pi * 2 * f * t) + 0.15 * math.sin(2 * math.pi * 3 * f * t))
        # bass on the beat
        if round(t0 / 0.6, 3) == int(round(t0 / 0.6, 3)):
            fb = f / 4
            for k in range(int(SR * 0.5)):
                if n0 + k >= len(hold): break
                t = k / SR; hold[n0 + k] += 0.18 * math.exp(-t * 6) * math.sin(2 * math.pi * fb * t)
        t0 += d
    write('hold', hold, band=True)


GEN = {'buzz': gen_buzz, 'ring': gen_ring, 'hold': gen_hold}

if __name__ == '__main__':
    names = sys.argv[1:] or list(GEN)
    for name in names:
        GEN[name]()
        print(name, 'ok')
