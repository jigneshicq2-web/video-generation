# RecurPost Festive Season Campaign (Navratri → Dussehra → Dhanteras → Diwali → Bhai Dooj → Christmas/New Year)

## The strategic truth to plan around

1. **Agency owners won't adopt a new tool during Diwali week.** They're too busy. The buying window is **before the rush**: when they're planning festive calendars and dreading it. Most spend should go into the pre-rush phase.
2. **[Likely] Meta CPMs rise sharply around Diwali** as e-commerce brands flood the auction, so RecurPost's ads will cost more that week. Front-load budget now, run lean in peak week, and come back after.
3. **The product fit isn't "evergreen" this time.** Festival posts are date-specific. The features that actually solve festive pain are **bulk CSV scheduling + calendar**, **client approvals by link**, **workspaces per client**, **AI captions/images**, and (only if a yearly repeat interval exists) **recycling last year's festive posts**.
4. **Cultural care:** use diyas, lights, rangoli, sweets boxes, marigolds and lanterns. **No deities or religious symbols** in ads for a SaaS tool. Keep Hinglish natural and respectful.
5. **Verify 2026 festival dates** before scheduling (Navratri, Dussehra, Dhanteras, Diwali, Bhai Dooj). Copy deliberately avoids exact dates.

## Campaign phases

| Phase | When | Goal | Angles |
|---|---|---|---|
| **1. Pre-rush ("plan it now")** | Now → ~5 days before Dhanteras | Trials from agencies dreading the rush | F1, F4, F5, F6, F7 |
| **2. Peak ("we feel you")** | Dhanteras → Bhai Dooj | Brand empathy, retargeting, cheaper reach | F2, F3, F9 (lower budget) |
| **3. Post-festival ("never again")** | After Bhai Dooj → mid-Dec | Convert the burnt-out; prep Christmas/New Year | F8, F10 |

---

## The 10 festive angles

| # | Angle | Pain | Hook (static headline or video first 3s) | Feature it sells | Best format | Phase |
|---|---|---|---|---|---|---|
| F1 | **Festive maths** | Volume explosion | "9 Navratri days + 5 Diwali days × 20 clients = 280 festive posts." Numbers slam; a diya flickers. | Bulk CSV + calendar | Video + static | 1 |
| F2 | **Sab celebrate kar rahe hain** | Missing family moments | Split: the family lighting diyas on a balcony vs the agency owner indoors, lit by a laptop. "Sab Diwali mana rahe hain. Aap scheduling kar rahe ho?" | Bulk scheduling → be offline | Video (emotional) + static | 2 |
| F3 | **11:58 PM on Diwali night** | The client's panicked ping | Phone buzzes amid fireworks: "Client: Happy Diwali post kahan hai??" Clock 11:58 PM. | Scheduling ahead + approvals | Video + static | 2 |
| F4 | **One post, six platforms** | Multi-platform fatigue | "1 Diwali post × 6 platforms × 20 clients = 120 uploads." Platform icons multiply like firecrackers. | Multi-platform publishing + workspaces | Video + static | 1 |
| F5 | **Plan this week. Celebrate next week.** | Last-minute scramble | A calendar from Navratri → Bhai Dooj fills itself in 3 seconds. "Saare festive posts. Is hafte schedule. Agle hafte celebrate." | Bulk CSV upload + calendar | Video + static | 1 (hero ad) |
| F6 | **Approval stuck in festive mode** | Clients unreachable during festivals | WhatsApp: "Seen" since Monday under "Sir, Diwali creative approve kar do 🙏". "Client busy. Post stuck." | Approve-by-link, no login | Static + video | 1 |
| F7 | **Don't click (festive)** | Reverse psychology | "Don't click this ad… if you want to spend Diwali night scheduling posts." 🪔 | All-in-one | Static (type) | 1 |
| F8 | **Last year's Diwali posts** | Rebuilding from scratch | "Last year's Diwali posts got great engagement. This year you're making them from scratch again?" | Evergreen libraries (yearly repeat: **verify**) | Static + video | 3 (also 1) |
| F9 | **Diya vs laptop** | Burnout, visual metaphor | Visual: a rangoli made of red notification badges. "Is Diwali, diye jalao. Laptop nahi." | Bulk scheduling + inbox | Static (strong visual) | 2 |
| F10 | **The next wave** | Festival after festival | A calendar shows Diwali ✓ → Christmas → New Year → Republic Day → Valentine's stacking up. "Diwali survive kiya. Agla wave ready hai?" | Bulk + libraries + workspaces | Video + static | 3 |

**Global (non-India) mirror** for the same structure: Black Friday → Christmas → New Year.
- F1-G: "BFCM + Christmas + New Year × 20 clients = 300+ posts."
- F3-G: "Christmas Eve, 11:58 PM: 'Where's the holiday post?'"

## Claims guardrail

- "280 festive posts", "120 uploads" and similar figures are **example maths** shown as an equation, with a small footnote "Example: 20 clients".
- F8 depends on RecurPost supporting a **yearly repeat**. If it doesn't, reframe F8 as "Save this year's festive posts to a library. Reuse them next year with one click", and only if a reuse/duplicate flow exists.
- No claims that RecurPost "posts at midnight automatically" unless scheduled posting at a set time is confirmed (it's a scheduler, so it almost certainly is, but word it as "scheduled in advance").

## Production

These angles use the same systems already in the repo:
- **Statics:** the image style guide `prompts/recurpost/00-master-style-guide.md`, or code-rendered via `out/recurpost-ads/src/` (exact type + real logo).
- **Videos:** the video brief `prompts/recurpost/video/00-video-master-brief.md` (30–40s + 15s cuts).

**Festive visual layer added on top of the brand palette:**
- Warm diya glow (#FFB547 at 30%) and soft bokeh lights on black backgrounds; yellow #FFCC43 stays the hero accent.
- Marigold orange (#F28C28) allowed ONLY for decorative festive elements (marigold strings, diya flames), never for text.
- Fireworks as thin yellow/white line bursts, used for transitions.
- Rangoli patterns in thin yellow line-art at 15–25% opacity as background texture.
