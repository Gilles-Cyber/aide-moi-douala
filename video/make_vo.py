"""Génère la voix off (une piste WAV par réplique) et affiche les durées.
Usage : python make_vo.py <dossier_sortie>"""
import asyncio, json, subprocess, sys, pathlib

import edge_tts

HERE = pathlib.Path(__file__).parent
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else HERE / "build")
OUT.mkdir(parents=True, exist_ok=True)
cfg = json.loads((HERE / "vo_script.json").read_text(encoding="utf-8"))


async def main():
    for ln in cfg["lines"]:
        mp3 = OUT / f"{ln['id']}.mp3"
        wav = OUT / f"{ln['id']}.wav"
        await edge_tts.Communicate(ln["text"], cfg["voice"], rate=cfg["rate"]).save(str(mp3))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(mp3), "-ar", "48000", "-ac", "1", str(wav)], check=True)
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)], capture_output=True, text=True).stdout)
        end = ln["start"] + dur
        nxt = next((x["start"] for x in cfg["lines"] if x["start"] > ln["start"]), 45.0)
        flag = "  <-- CHEVAUCHEMENT" if end > nxt - 0.15 else ""
        print(f"{ln['id']}: start {ln['start']:5.1f}s  durée {dur:5.2f}s  fin {end:5.2f}s (suivant {nxt:4.1f}){flag}")


asyncio.run(main())
