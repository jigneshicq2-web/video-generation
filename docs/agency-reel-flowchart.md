# agency-reel: pipeline flowchart

Renders on GitHub (Mermaid). Source of truth: `.claude/skills/agency-reel/SKILL.md`.

```mermaid
flowchart TD
    A["Step 1 · Premise<br/>series-bible.md: pick an unused pain<br/>from an area the last 2 reels skipped"] --> B{"Length?"}
    B -->|"one device, one turn"| S["Short: 20 s max<br/>5–7 lines, end card 5.5–6.5 s"]
    B -->|"recognition piles up"| L["Long: 45–75 s<br/>3–5 scenes, end card 6–9 s"]
    S --> C
    L --> C
    C["Step 2 · Script + audit<br/>cheatsheet.md: 15 yes/no checks<br/>verify every product claim in code"] --> D{"Dinesh<br/>approves script?"}
    D -->|no| C
    D -->|yes| E["Step 3b · Beat sheet + shot plan<br/>one row per line: intensity, framing,<br/>camera move + reason, device state"]
    E --> F["Step 3 · Kokoro draft voices<br/>FREE: iterate here"]
    F --> G["Step 4 · Build (Sonnet subagent)<br/>kit/new_reel.sh → build.py<br/>HyperFrames HTML/GSAP"]
    G --> H["check (0 errors) + snapshots<br/>read the contact sheet"]
    H --> I{"Layout, timing,<br/>TOTAL ≤ cap?"}
    I -->|no| G
    I -->|yes| J["Step 5 · Verify<br/>whisper per clip vs script"]
    J --> K{"Dinesh<br/>approves cut?"}
    K -->|no| G
    K -->|yes| M["Step 6 · ElevenLabs final voices<br/>PAID: once, 130–500 credits<br/>(ask first)"]
    M --> N["Render 2 cuts<br/>captions / NOCAPS · loudnorm −14 LUFS"]
    N --> O["publish.md<br/>3 covers · Drive upload + share"]
    O --> P["Schedule via RecurPost<br/>IG (in_thumb) · YouTube · TikTok"]
    P --> Q["Record it:<br/>update pain register + memory"]
    Q -.->|"next run avoids this pain"| A

    classDef paid fill:#FED024,stroke:#1B1C31,color:#1B1C31;
    classDef gate fill:#14B8A6,stroke:#1B1C31,color:#1B1C31;
    class M paid;
    class D,K,I,B gate;
```

## How to read it

- **Teal diamonds** are decision points. Two are human approvals (script, cut), and the loops
  go back before any money is spent.
- **Yellow** is the only step that costs real money (ElevenLabs). Everything before it uses free Kokoro voices.
- **The dotted arrow** is why the pain register matters: each shipped reel marks its pain as used,
  so the next run starts from a different area of agency life.

## Who does what

| Stage | Where it runs |
|---|---|
| Steps 1, 2, 3b, review of snapshots | Main session (premise, writing, taste) |
| Steps 3, 4 (Kokoro, build, check, snapshots, render) | Sonnet subagent, from the kit (cheaper) |
| Step 6 | Main session, only with approval |
