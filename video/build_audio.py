"""Aide-moi Douala — bande-son du motion design (55 s) : musique, bruitages et voix off.
Tout est synthétisé ici (numpy), aucune banque de sons externe.
Usage : python build_audio.py   → écrit build/mix.wav (48 kHz stéréo)"""
import json, pathlib, wave
import numpy as np

HERE = pathlib.Path(__file__).parent
BUILD = HERE / "build"
SR = 48000
DUR = 55.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

music = np.zeros((N, 2)); sfx = np.zeros((N, 2)); send = np.zeros((N, 2)); vo = np.zeros(N)


# ------------------------------------------------------------------ outils
def tt(d): return np.arange(int(d * SR)) / SR

def midi(m): return 440.0 * 2 ** ((m - 69) / 12)

def pan_st(x, p):  # p : -1 (gauche) … +1 (droite), loi à puissance constante
    a = (np.asarray(p) + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)

def put(bus, t0, x, gain=1.0, p=0.0, rev=0.0):
    st = x if x.ndim == 2 else pan_st(x, p)
    i = int(t0 * SR)
    if i >= N or i + len(st) <= 0: return
    j = min(N, i + len(st)); k0 = max(0, -i)
    bus[max(0, i):j] += st[k0:j - i] * gain
    if rev: send[max(0, i):j] += st[k0:j - i] * gain * rev

def fft_filter(x, lo=None, hi=None, soft=0.15):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if hi: m *= 1 / (1 + (f / hi) ** 4)
    if lo: m *= 1 - 1 / (1 + (f / lo) ** 4)
    return np.fft.irfft(X * m, len(x))

def noise(d): return rng.standard_normal(int(d * SR))

def env_exp(d, k): return np.exp(-tt(d) * k)

def additive(f, d, nh=8, roll=1.0, detune=0.0):
    t = tt(d); y = np.zeros_like(t)
    for h in range(1, nh + 1):
        if f * h > 16000: break
        y += np.sin(2 * np.pi * f * h * (1 + detune) * t + rng.uniform(0, 6.28)) / (h ** roll)
    return y


# ------------------------------------------------------------------ bruitages
def whoosh(t0, d=0.6, g=0.5, p0=-0.7, p1=0.7, up=True):
    n = noise(d); bands = [(150, 400), (400, 900), (900, 2000), (2000, 4500), (4500, 9000)]
    t = tt(d); y = np.zeros_like(t)
    for i, (lo, hi) in enumerate(bands):
        c = (i + 0.5) / len(bands); c = c if up else 1 - c
        y += fft_filter(n, lo, hi) * np.exp(-((t / d - c * 0.8 - 0.1) ** 2) / 0.03)
    y *= np.sin(np.pi * t / d) ** 2
    y /= np.abs(y).max() + 1e-9
    put(sfx, t0, pan_st(y, np.linspace(p0, p1, len(y))), g, rev=0.25)

def pop(t0, f0=520, f1=880, g=0.35, p=0.0):
    t = tt(0.16); f = f0 + (f1 - f0) * (1 - np.exp(-t * 60))
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26)
    y += 0.15 * fft_filter(noise(0.16), 2000, 8000) * np.exp(-t * 80)
    put(sfx, t0, y, g, p, rev=0.3)

def tick(t0, f=3200, g=0.12, p=0.0, d=0.03):
    t = tt(d); y = np.sin(2 * np.pi * f * t) * np.exp(-t * 220) + 0.4 * noise(d) * np.exp(-t * 400)
    put(sfx, t0, y, g, p, rev=0.15)

def bell(t0, f=1320, g=0.25, p=0.0, d=1.6):
    t = tt(d); y = np.zeros_like(t)
    for r, a, k in [(1, 1, 3.2), (2.76, 0.45, 6), (5.4, 0.25, 10), (8.93, 0.12, 16)]:
        y += a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * k)
    y *= np.minimum(1, t / 0.002)
    put(sfx, t0, y / 1.8, g, p, rev=0.5)

def impact(t0, g=0.9):
    t = tt(2.2); f = 34 + 70 * np.exp(-t * 7)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    hit = fft_filter(noise(2.2), None, 1800) * np.exp(-t * 9)
    shim = sum(np.sin(2 * np.pi * fr * t + rng.uniform(0, 6)) for fr in [2093, 2637, 3136, 3951, 4699]) * np.exp(-t * 1.6) * 0.05
    y = sub * 0.9 + hit * 0.35 + shim
    put(sfx, t0, y / np.abs(y).max(), g, rev=0.45)

def riser(t0, t1, g=0.45):
    d = t1 - t0; t = tt(d); n = noise(d); y = np.zeros_like(t)
    bands = [(300, 800), (800, 2000), (2000, 5000), (5000, 11000)]
    for i, (lo, hi) in enumerate(bands):
        y += fft_filter(n, lo, hi) * (t / d) ** (1 + i * 0.6)
    tone = np.sin(2 * np.pi * np.cumsum(180 * 2 ** (2.6 * t / d)) / SR) * (t / d) ** 2 * 0.5
    y = y / (np.abs(y).max() + 1e-9) + tone
    y *= (t / d) ** 1.4
    put(sfx, t0, y / np.abs(y).max(), g, rev=0.3)

def reverse_cym(t0, t1, g=0.35):
    d = t1 - t0; t = tt(d)
    y = fft_filter(noise(d), 4000, 14000) * (t / d) ** 3
    put(sfx, t0, pan_st(y / np.abs(y).max(), np.linspace(-0.4, 0.4, len(y))), g, rev=0.2)

def paper(t0, g=0.28, p=0.0):
    d = 0.22; t = tt(d)
    y = fft_filter(noise(d), 900, 6000) * np.exp(-t * 18) * (1 + 0.6 * (rng.random(len(t)) > 0.97))
    put(sfx, t0, y / np.abs(y).max(), g, p, rev=0.2)

def zip_(t0, g=0.22, p0=-0.5, p1=0.5):
    d = 0.42; t = tt(d); f = 380 * 2 ** (2.2 * t / d)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2 + 0.2 * fft_filter(noise(d), 3000, 9000) * np.sin(np.pi * t / d)
    put(sfx, t0, pan_st(y, np.linspace(p0, p1, len(y))), g, rev=0.35)

def gliss(t0, d, f0, f1, g=0.12):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d)
    y = (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * t / d)
    put(sfx, t0, y, g, rev=0.3)

def buzz(t0, g=0.22):
    for k in range(2):
        t = tt(0.09); y = sum(np.sin(2 * np.pi * 150 * h * t) / h for h in (1, 3, 5, 7)) * np.minimum(1, (0.09 - t) / 0.01)
        put(sfx, t0 + k * 0.13, y, g, 0.1, rev=0.1)

def counter(a, b, rate=26, g=0.06, f=4200):
    t = a
    while t < b:
        tick(t, f + rng.uniform(-300, 300), g * rng.uniform(0.7, 1), rng.uniform(-0.2, 0.2), 0.015)
        t += 1 / rate

def chime(t0, notes, g=0.22, step=0.07):
    for i, m in enumerate(notes): bell(t0 + i * step, midi(m), g, -0.3 + 0.3 * i)

def stamp(t0, g=0.6):
    t = tt(0.5); f = 60 + 120 * np.exp(-t * 25)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) + 0.5 * fft_filter(noise(0.5), None, 2500) * np.exp(-t * 30)
    put(sfx, t0, y / np.abs(y).max(), g, rev=0.3)


# ------------------------------------------------------------------ musique
BEAT = 0.6
GROOVE0, GROOVE1 = 6.95, 47.35
CHORDS = [[48, 55, 62, 64], [43, 50, 57, 59], [45, 52, 59, 60], [41, 48, 55, 57]]  # Cadd9 · G · Am · F

def pad(t0, notes, d, g=0.06, bright=1800):
    t = tt(d + 1.2); y = np.zeros_like(t)
    for m in notes:
        for det in (-0.004, 0.0, 0.0045):
            y += additive(midi(m), d + 1.2, nh=10, roll=1.15, detune=det)
    y = fft_filter(y, 80, bright)
    e = np.minimum(1, t / 0.45) * np.where(t > d, np.exp(-(t - d) * 3.5), 1)
    put(music, t0, pan_st(y * e, 0), g / len(notes), rev=0.35)

def pluck(t0, m, g=0.05, p=0.0):
    f = midi(m); t = tt(0.9); y = np.zeros_like(t)
    for h in range(1, 7): y += np.sin(2 * np.pi * f * h * t) * np.exp(-t * (5 + 7 * h)) / h
    put(music, t0, y * np.minimum(1, t / 0.003), g, p, rev=0.45)

def bass(t0, m, d=0.55, g=0.16):
    f = midi(m); t = tt(d)
    y = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)) * np.minimum(1, t / 0.01) * np.exp(-t * 2.5) * np.minimum(1, (d - t) / 0.03)
    put(music, t0, y, g)

def kick(t0, g=0.35):
    t = tt(0.35); f = 46 + 90 * np.exp(-t * 32)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10) + 0.08 * fft_filter(noise(0.35), 2000, 6000) * np.exp(-t * 120)
    put(music, t0, y, g)

def hat(t0, g=0.045, p=0.25):
    t = tt(0.06); y = fft_filter(noise(0.06), 7000, None) * np.exp(-t * 70)
    put(music, t0, y / (np.abs(y).max() + 1e-9), g, p)

def clap(t0, g=0.09):
    t = tt(0.3); n = fft_filter(noise(0.3), 900, 5000)
    e = sum(np.exp(-np.clip(t - o, 0, None) * 60) * (t >= o) for o in (0, 0.012, 0.024)) + 0.6 * np.exp(-t * 14)
    put(music, t0, n / np.abs(n).max() * e, g, 0, rev=0.4)

# intro inquiète : bourdon de la mineur + tic-tac
drone_t = tt(7.2)
drone = sum(additive(midi(m), 7.2, nh=6, roll=1.4, detune=d) for m in (33, 40, 45) for d in (-0.003, 0.003))
drone = fft_filter(drone, 40, 700) * np.minimum(1, drone_t / 1.5) * np.minimum(1, (7.2 - drone_t) / 0.3)
put(music, 0, pan_st(drone / np.abs(drone).max(), 0), 0.22, rev=0.3)
for i, t0 in enumerate(np.arange(0.25, 6.4, 0.5)): tick(t0, 1900 if i % 2 else 1500, 0.11, -0.3 if i % 2 else 0.3, 0.04)

# groove
nbar = 0
t = GROOVE0
while t < GROOVE1 - 0.01:
    ch = CHORDS[nbar % 4]
    bar_end = min(t + 4 * BEAT, GROOVE1)
    pad(t, ch, bar_end - t, g=0.11, bright=1400 + 900 * min(1, (t - GROOVE0) / 10))
    for b in range(4):
        tb = t + b * BEAT
        if tb >= GROOVE1: break
        kick(tb, 0.32 if t > 12.8 else 0.22)
        bass(tb, ch[0] - 12, 0.55)
        if t > 12.8: hat(tb + BEAT / 2, 0.05, 0.3 if b % 2 else -0.3)
        if t > 12.8 and b in (1, 3): clap(tb, 0.08)
        arp = [ch[1] + 12, ch[2] + 12, ch[3] + 12, ch[2] + 12]
        for e in range(2):
            te = tb + e * BEAT / 2
            if te < GROOVE1: pluck(te, arp[(b * 2 + e) % 4], 0.07, -0.35 if e else 0.35)
    t += 4 * BEAT; nbar += 1

# outro : accord large et arpège lent
pad(47.45, [36, 43, 48, 52, 55, 62, 64], 6.5, g=0.16, bright=3200)
bass(47.45, 24, 6.0, 0.2)
for i, m in enumerate([72, 76, 79, 83, 84, 79, 76, 74, 76, 79, 84, 88]):
    pluck(47.65 + i * 0.3, m, 0.06 * (1 - i / 16), -0.4 + 0.07 * i)

# ------------------------------------------------------------------ partition des bruitages (Aide-moi Douala)
for t0, p in [(0.7, -0.6), (2.37, 0), (4.47, 0.6)]:
    whoosh(t0 - 0.15, 0.5, 0.3, p - 0.2, p + 0.2); pop(t0 + 0.25, 600, 900, 0.18, p)
for t0 in (1.2, 2.9, 5.0): buzz(t0, 0.09)
riser(5.0, 6.95, 0.45); reverse_cym(6.2, 6.95, 0.3)
impact(6.95, 0.95)
for i in range(8): tick(7.2 + i * 0.05, 2600 + i * 80, 0.07, -0.5 + i / 7)
whoosh(8.05, 0.5, 0.16)
stamp(10.12, 0.4); chime(10.22, [84, 88, 91], 0.16)
whoosh(12.85, 0.9, 0.4, 0.4, 0.6, up=True)
pop(13.6, 480, 760, 0.2, -0.5); tick(14.1, 2400, 0.12, 0.5, 0.05)
for k in range(30): tick(14.4 + k * 0.04 + rng.uniform(0, 0.012), 3600 + rng.uniform(-300, 300), 0.06, 0.5, 0.012)
pop(14.9, 700, 1000, 0.16, 0.1)
tick(16.1, 1800, 0.18, 0.5, 0.06); zip_(16.25, 0.18, 0.4, 0.6)
pop(16.5, 900, 1200, 0.16, 0.6); bell(17.2, 1319, 0.16, 0.5); pop(17.0, 520, 820, 0.18, -0.5); pop(19.9, 900, 1250, 0.14, 0.6)
pop(18.6, 600, 950, 0.2, 0.1); chime(18.7, [88, 91], 0.12)
whoosh(21.3, 0.6, 0.4, 0.5, -0.6, up=False)
whoosh(22.55, 0.5, 0.18, -0.6, -0.2)
for i, t0 in enumerate([22.7, 23.0, 23.3]): whoosh(t0 - 0.05, 0.5, 0.24, -0.6 + 0.4 * i, -0.4 + 0.4 * i)
whoosh(23.75, 0.6, 0.26, 0.9, 0.5)
for t0 in (24.3, 25.7, 27.1, 28.5): tick(t0, 2200, 0.1, 0.6, 0.05)
for i, t0 in enumerate([25.59, 26.42, 27.1, 27.78]): pop(t0, 520 + i * 70, 820 + i * 80, 0.18, -0.6 + 0.2 * i)
whoosh(30.05, 0.6, 0.4, 0.5, -0.5, up=False)
stamp(31.2, 0.45); whoosh(32.35, 0.6, 0.25, 0, 0, up=False)
whoosh(32.55, 0.6, 0.3, -0.8, -0.3); whoosh(32.8, 0.6, 0.28, 0.2, -0.1)
counter(33.9, 34.9, 26, 0.06); pop(34.95, 800, 1100, 0.14)
whoosh(35.55, 0.6, 0.28, 0.9, 0.4)
pop(35.95, 520, 820, 0.2, 0.5); pop(36.75, 600, 900, 0.2, 0.6)
pop(37.3, 400, 700, 0.24, 0.5); chime(37.35, [84, 88, 91, 96], 0.17, 0.08)
whoosh(39.1, 0.6, 0.4, -0.5, 0.5, up=False)
whoosh(40.1, 0.6, 0.3, -0.7, -0.3); whoosh(40.87, 0.6, 0.3, -0.2, 0.2)
whoosh(41.75, 0.5, 0.18, 0.6, 0.6)
counter(42.8, 44.15, 24, 0.06); chime(44.15, [88, 91], 0.15)
for k in range(5): pop(42.9 + k * 0.12, 560 + k * 60, 860 + k * 70, 0.13, 0.6)
whoosh(46.55, 0.6, 0.3, -0.4, 0.4, up=False)
reverse_cym(46.5, 47.45, 0.35); riser(46.4, 47.45, 0.25)
impact(47.45, 0.95)
for i in range(8): tick(47.55 + i * 0.045, 2800 + i * 70, 0.05, -0.5 + i / 7)
whoosh(48.75, 0.5, 0.14); whoosh(49.5, 0.5, 0.12, 0.5, -0.5)
pop(50.41, 520, 880, 0.26); chime(50.5, [79, 84, 88, 91], 0.16, 0.09)
whoosh(51.15, 0.8, 0.12, -0.6, 0.6)
pop(51.9, 600, 900, 0.12)

# ------------------------------------------------------------------ voix off
def read_wav(p):
    with wave.open(str(p)) as w:
        a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2: a = a.reshape(-1, 2).mean(1)
    return a

cfg = json.loads((HERE / "vo_script.json").read_text(encoding="utf-8"))
for ln in cfg["lines"]:
    a = read_wav(BUILD / f"{ln['id']}.wav")
    a = fft_filter(a, 70, None)                    # coupe les basses inutiles
    a = a / (np.sqrt(np.mean(a[np.abs(a) > 0.01] ** 2)) + 1e-9) * 0.16   # niveau homogène entre répliques
    i = int(ln["start"] * SR); j = min(N, i + len(a)); vo[i:j] += a[:j - i]
vo = np.tanh(vo * 1.6) / 1.6                       # compression douce

# ------------------------------------------------------------------ mixage
k = int(0.06 * SR)
env = np.convolve(np.abs(vo), np.ones(k) / k, mode="same")
duck = 1 - 0.62 * np.clip(env / 0.05, 0, 1)
duck = np.convolve(duck, np.ones(int(0.12 * SR)) / int(0.12 * SR), mode="same")

ir_t = tt(2.0)
ir = rng.standard_normal((len(ir_t), 2)) * np.exp(-ir_t * 3.2)[:, None]
ir[:, 0] = fft_filter(ir[:, 0], 200, 7000); ir[:, 1] = fft_filter(ir[:, 1], 200, 7000)
L = 1 << int(np.ceil(np.log2(N + len(ir))))
rev = np.stack([np.fft.irfft(np.fft.rfft(send[:, c], L) * np.fft.rfft(ir[:, c], L), L)[:N] for c in range(2)], axis=1)
rev *= 0.18 / (np.abs(rev).max() + 1e-9)

music_n = music / (np.abs(music).max() + 1e-9) * 0.42
sfx_n = sfx / (np.abs(sfx).max() + 1e-9) * 0.62
mix = music_n * duck[:, None] + sfx_n * (0.75 + 0.25 * duck[:, None]) + rev + np.stack([vo, vo], 1) * 1.0
fade_in = np.minimum(1, tt(DUR)[:N] / 0.05)[:, None]
fade_out = np.clip((DUR - tt(DUR)[:N]) / 1.4, 0, 1)[:, None]
mix = mix * fade_in * fade_out
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix *= 0.95 / np.abs(mix).max()

out = BUILD / "mix.wav"
with wave.open(str(out), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("écrit", out, f"{len(mix) / SR:.1f} s")
