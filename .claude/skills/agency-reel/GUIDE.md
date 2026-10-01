# agency-reel: quick orientation

Read in this order: `SKILL.md` -> `reference/cheatsheet.md` -> `kit/README.md`.
Open the other `reference/` guides only for a specific question.

## Pipeline

```
Premise (series-bible.md) -> Script + audit (cheatsheet.md) -> approval
  -> Shot plan -> Kokoro draft voices (free) -> build.py via kit (HyperFrames)
  -> check + snapshots -> ElevenLabs final voices (credits) -> render 2 cuts
  -> loudnorm -14 LUFS -> Drive upload + RecurPost scheduling (publish.md)
```

## Portability notes

The skill was written for one machine. These paths and services are assumed and
must be replaced before it runs elsewhere:
- `~/videos/...` project and reference folders
- `~/Sites/recurpost` product repo (used to verify claims)
- `~/.claude/skills/agency-reel/` (the kit scripts use this path)
- Google Doc ID and `gsheet.py` token helper in `SKILL.md` Step 2
- ElevenLabs API key (`kit/tts_el.py`, costs credits) and the Drive/RecurPost steps in `reference/publish.md`
- Tools: `npx hyperframes@0.8.50`, `ffmpeg`, `whisper-cli`, Kokoro TTS
