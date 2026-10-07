# RecurPost Meta Ads: Pricing (billed per profile, not per seat)
## 10 variations + AI image-generation prompts

---

## SETUP

Use `00-master-style-guide.md`: upload the right logo, paste **Block A** once, then paste the variation prompts below one at a time. Check every output against **Block C** in the same file.

## ⚠️ VERIFY PRICING BEFORE GENERATING ANYTHING

Every number here comes from **third-party pricing pages** found by search (recurpost.com was blocked from my environment):
- Agency plan **$79/month** with **20 social profiles** and **3 users**
- Extra social profile **$4/month**
- Extra team member **$4/month**
- Billing is **per profile, not per seat**

A wrong price in a paid ad is a credibility problem and can breach Meta's ad policy. Before generating:
1. Confirm current prices on the live pricing page.
2. Decide the currency for the audience. For Indian agencies, if INR pricing exists, swap every `$` figure to `₹`.
3. Find-and-replace these tokens throughout this file:
   - `{PLAN_PRICE}` → e.g. `$79`
   - `{PROFILES}` → e.g. `20`
   - `{EXTRA_PROFILE}` → e.g. `$4`
   - `{EXTRA_SEAT}` → e.g. `$4`
   - `{PER_PROFILE}` → `{PLAN_PRICE} ÷ {PROFILES}`, e.g. `$3.95`

**Competitor rule:** no competitor names or competitor prices in any ad. Inventing or misquoting them is a legal and Meta-policy risk. The contrast is always the *pricing model* ("per-seat tools"), never a named brand.

---

## THE 10 VARIATIONS (strategy summary)

| # | Angle / pain | Headline | Format | Bg |
|---|---|---|---|---|
| 1 | Per-seat tax | "Hiring one more person shouldn't raise your software bill." | Type-led + seat icons | Light |
| 2 | Price anchor | "{PROFILES} client profiles. {PLAN_PRICE}/month." | Giant-number type | Black |
| 3 | Unit economics | "{PLAN_PRICE} ÷ {PROFILES} = {PER_PROFILE} per profile" | Equation infographic | Light |
| 4 | Model comparison | "Per-seat pricing grows with your team. Ours doesn't." | Two-line chart | Light |
| 5 | Reverse psychology | "Don't click this ad... if you love paying per seat." | Type-only | Black |
| 6 | Team growth | "Team badhao. Bill nahi." | Spokesperson + team | Light |
| 7 | Margin squeeze | "Tool ka bill aapka retainer margin kha raha hai?" | Emotional photo | Black |
| 8 | One clean invoice | "Your whole social stack. One small invoice." | Invoice mockup | Light |
| 9 | Scale step by step | "Client #21? Add a profile for {EXTRA_PROFILE}." | Pricing-ladder infographic | Light |
| 10 | Self-qualification | "Kitne clients handle karte ho?" | Slider / calculator UI | Black |

Mix: 3 Hinglish / 7 English · 6 light / 4 dark · 8 distinct visual formats.

---

## BLOCK B: VARIATION PROMPTS

---

### V1: "Hiring one more person shouldn't raise your software bill." (Type-led + seat icons)
Logo to upload: black wordmark.

```
AD BRIEF V1: Pricing, "Per-seat tax"
Apply the locked style guide. Canvas 1080x1350. Light background.

LAYOUT:
1. Top-left: RecurPost logo.
2. Headline, left-aligned, top 30%, Bold 80 px, 3 lines:
   "Hiring one more person shouldn't raise your software bill."
   [HIGHLIGHT] = "shouldn't" (yellow highlighter box, black text).
3. Centre 40%: INFOGRAPHIC of a row of 6 simple office-chair icons (flat, black outline). Above the first 5 chairs, small grey price tags with "+$" (no numbers). Above the 6th chair, a yellow tag with black text "Welcome aboard". A thin grey label beneath the row: "Per-seat tools charge for every chair."
   Below it, a single yellow rounded card (black text): "RecurPost bills per social profile, not per seat."
4. Bottom-left CTA pill (yellow, black text): "See Agency Pricing >"

BACKGROUND: white with subtle dot grid. No people, no photos.
ONLY render: "Hiring one more person shouldn't raise your software bill.", "+$", "Welcome aboard", "Per-seat tools charge for every chair.", "RecurPost bills per social profile, not per seat.", "See Agency Pricing".

TEXT-FREE FALLBACK: chairs and blank tags; text in Canva.
```

---

### V2: "{PROFILES} client profiles. {PLAN_PRICE}/month." (Giant-number type, dark)
Logo to upload: white wordmark.

```
AD BRIEF V2: Pricing, "Price anchor"
Apply the locked style guide. Canvas 1080x1350. BLACK background.

LAYOUT:
1. Top-left: RecurPost logo (white wordmark).
2. Centre-left, stacked giant type:
   Line 1, white Bold 120 px: "{PROFILES} client profiles."
   Line 2, YELLOW ExtraBold 180 px: "{PLAN_PRICE}"
   Line 3, white Medium 48 px directly under the price: "/month. Not per seat."
3. Right side: the logo's circular-arrow clock motif drawn large in thin yellow outline (25% opacity), partially behind the price.
4. Below: a row of 3 small white check-icon items, Medium 30 px: "Scheduling", "Approvals", "White-label reports".
5. Bottom-left CTA pill (yellow, black text): "Start Free Trial >"

BACKGROUND: #1F1F1F with soft vignette. No photos, no people.
ONLY render: "{PROFILES} client profiles.", "{PLAN_PRICE}", "/month. Not per seat.", "Scheduling", "Approvals", "White-label reports", "Start Free Trial".

TEXT-FREE FALLBACK: not recommended. Build in Canva (number accuracy is critical).
```

---

### V3: "{PLAN_PRICE} ÷ {PROFILES} = {PER_PROFILE} per profile" (Equation infographic)
Logo to upload: black wordmark.

```
AD BRIEF V3: Pricing, "Unit economics"
Apply the locked style guide. Canvas 1080x1350. Light background.

CONCEPT: Agency owners think in per-client cost. Show it as simple maths.

LAYOUT:
1. Top-left: RecurPost logo.
2. Top 34%: giant equation, black Bold 110 px, left-aligned:
   Line 1: "{PLAN_PRICE} ÷ {PROFILES}"
   Line 2: "= {PER_PROFILE}"
   Line 3, Medium 48 px: "per social profile / month"
   [HIGHLIGHT] = "= {PER_PROFILE}" (yellow highlighter box, black text).
3. Middle 34%: a grid of {PROFILES} small white rounded tiles (5 per row), each with a generic social glyph and a tiny abstract client mark (simple geometric shape, NO text, NO real brand logos); one tile popped out larger with a yellow border and a small tag "{PER_PROFILE}".
4. Subheadline, Medium 36 px: "Less than a cup of coffee per client profile."
5. Bottom-left CTA pill: "See Agency Pricing >"
6. Tiny grey footnote bottom-right, 20 px: "Agency plan. Prices as of [MONTH YEAR]."

BACKGROUND: #FFF8E6. No people.
ONLY render: "{PLAN_PRICE} ÷ {PROFILES}", "= {PER_PROFILE}", "per social profile / month", "{PER_PROFILE}", "Less than a cup of coffee per client profile.", "See Agency Pricing", "Agency plan. Prices as of [MONTH YEAR]."

TEXT-FREE FALLBACK: tile grid only; build the maths in Canva.
```

---

### V4: "Per-seat pricing grows with your team. Ours doesn't." (Two-line chart)
Logo to upload: black wordmark.

```
AD BRIEF V4: Pricing, "Model comparison"
Apply the locked style guide. Canvas 1080x1350. Light background.

CONCEPT: Show the pricing MODEL, not competitor prices. ILLUSTRATIVE lines only, no figures on axes.

LAYOUT:
1. Top-left: RecurPost logo.
2. Headline, left-aligned, top 24%, Bold 80 px:
   Line 1: "Per-seat pricing grows with your team."
   Line 2: "Ours doesn't."
   [HIGHLIGHT] = "Ours doesn't." (yellow highlighter box, black text).
3. Centre 46%: a clean white chart card (rounded, soft shadow). X-axis label: "Team size". Y-axis label: "Monthly bill". NO numbers on either axis.
   - Line A (grey #9A9A9A, dashed) climbing steeply upward, labelled at its end: "Per-seat tools".
   - Line B (thick black, with yellow dot markers) staying nearly flat, labelled at its end: "RecurPost".
   - The widening gap between the lines is softly filled with yellow at 20% and labelled in black: "Your savings".
4. Subheadline, Medium 34 px: "Billed per social profile. Add teammates for a small add-on."
5. Bottom-left CTA pill: "Compare the Model >"
6. Tiny grey footnote, 20 px: "Illustrative. See pricing page for details."

ONLY render: "Per-seat pricing grows with your team.", "Ours doesn't.", "Team size", "Monthly bill", "Per-seat tools", "RecurPost", "Your savings", "Billed per social profile. Add teammates for a small add-on.", "Compare the Model", "Illustrative. See pricing page for details."

TEXT-FREE FALLBACK: chart lines and fill only; labels in Figma.
```

---

### V5: "Don't click this ad..." (Reverse psychology, type-only)
Logo to upload: white wordmark.

```
AD BRIEF V5: Pricing, "Don't click"
Apply the locked style guide. Canvas 1080x1350. BLACK background.

LAYOUT (centre-aligned for this ad only):
1. Background: #1F1F1F, faint dot grid 5%, soft yellow radial glow (8%) at centre.
2. Top-centre: RecurPost logo (white wordmark).
3. Upper-middle: yellow highlighter box with BLACK text, Bold 44 px: "Don't click this ad..."
4. Centre: white Bold 80 px, max 4 lines: "...if you love paying extra every time you hire."
   [HIGHLIGHT] = "every time you hire." (YELLOW text).
5. Below, white 80%, Medium 34 px: "Everyone else: RecurPost bills per social profile, not per seat."
6. Lower-middle: large yellow pill, black text "DON'T CLICK", realistic white hand-cursor hovering at its lower-right edge.

NO photos, NO UI, NO people.
ONLY render: "Don't click this ad...", "...if you love paying extra every time you hire.", "Everyone else: RecurPost bills per social profile, not per seat.", "DON'T CLICK".

TEXT-FREE FALLBACK: not recommended. Build in Canva.
```

---

### V6: "Team badhao. Bill nahi." (Spokesperson + team)
Logo to upload: black wordmark.

```
AD BRIEF V6: Pricing, "Team growth"
Apply the locked style guide. Canvas 1080x1350. Light background.

LAYOUT:
1. Top-left: RecurPost logo.
2. Headline, left-aligned, top 24%, Bold 108 px, two lines:
   Line 1: "Team badhao."
   Line 2: "Bill nahi."
   [HIGHLIGHT] = "Bill nahi." (yellow highlighter box, black text).
3. Right 60%, middle-bottom: photorealistic photo of a confident Indian male agency owner (early 30s, trimmed beard, black overshirt over white tee, black-framed glasses) in the front, arms crossed, smiling; behind him, slightly out of focus, 4 young team members (mixed genders, 23-30) at laptops in a bright modern office, one waving.
4. Left side, mid-height, floating white rounded card (soft shadow): a simple bill summary:
   row "Plan · {PROFILES} profiles" → "{PLAN_PRICE}"
   row "Extra teammate" → "{EXTRA_SEAT}"
   a yellow bottom bar with black text "Billed per profile"
5. Subheadline, Medium 34 px: "Agency pricing jo team ke saath nahi phoolti."
6. Bottom-left CTA pill (yellow, black text): "See Agency Pricing >"

ONLY render: "Team badhao.", "Bill nahi.", "Plan · {PROFILES} profiles", "{PLAN_PRICE}", "Extra teammate", "{EXTRA_SEAT}", "Billed per profile", "Agency pricing jo team ke saath nahi phoolti.", "See Agency Pricing".

TEXT-FREE FALLBACK: photo + blank bill card; text in Canva.
```

---

### V7: "Tool ka bill aapka retainer margin kha raha hai?" (Emotional photo, dark)
Logo to upload: white wordmark.

```
AD BRIEF V7: Pricing, "Margin squeeze"
Apply the locked style guide. Canvas 1080x1350. Dark.

LAYOUT:
1. Top-left: RecurPost logo (white wordmark).
2. Headline, left-aligned, top 26%, white Bold 80 px, 3 lines:
   "Tool ka bill aapka retainer margin kha raha hai?"
   [HIGHLIGHT] = "retainer margin" (YELLOW text).
3. Bottom 66%: photorealistic photo: a worried Indian female agency owner (mid-30s, glasses, black blazer) at her desk in the evening, looking at a laptop showing a generic subscriptions page, a calculator and printed invoices in front of her, one hand on her temple. Moody, warm desk lamp, dark office. #1F1F1F gradient at top for text.
4. Floating right, mid-height: a white rounded card: small pie-chart icon where a yellow slice grows larger, title "Keep more of every retainer", line "{PROFILES} profiles · {PLAN_PRICE}/mo · not per seat".
5. Bottom: CTA pill (yellow, black text): "Protect Your Margin >"

ONLY render: "Tool ka bill aapka retainer margin kha raha hai?", "Keep more of every retainer", "{PROFILES} profiles · {PLAN_PRICE}/mo · not per seat", "Protect Your Margin".

TEXT-FREE FALLBACK: photo + blank card.
```

---

### V8: "Your whole social stack. One small invoice." (Invoice mockup)
Logo to upload: black wordmark.

```
AD BRIEF V8: Pricing, "One clean invoice"
Apply the locked style guide. Canvas 1080x1350. Light background.

CONCEPT: One simple invoice covers scheduling, approvals, reports and inbox, instead of a pile of tools.

LAYOUT:
1. Top-left: RecurPost logo.
2. Headline, left-aligned, top 22%, Bold 84 px:
   Line 1: "Your whole social stack."
   Line 2: "One small invoice."
   [HIGHLIGHT] = "One small invoice." (yellow highlighter box, black text).
3. Centre 52%: a realistic paper invoice, slightly angled on a light desk surface with a soft shadow, a pen beside it. Invoice header: a small black "RECURPOST" text-free logo area (render as a black bar, NOT a redrawn logo), title "Invoice". Line items, left label and right amount:
   "Agency plan · {PROFILES} profiles" ... "{PLAN_PRICE}"
   "Scheduling + recycling" ... "Included"
   "Client approvals" ... "Included"
   "White-label reports" ... "Included"
   "Social inbox" ... "Included"
   Total row in bold, on a yellow highlight band: "Total" ... "{PLAN_PRICE}/mo"
4. Bottom-left CTA pill: "See What's Included >"

ONLY render: "Your whole social stack.", "One small invoice.", "Invoice", "Agency plan · {PROFILES} profiles", "{PLAN_PRICE}", "Scheduling + recycling", "Client approvals", "White-label reports", "Social inbox", "Included", "Total", "{PLAN_PRICE}/mo", "See What's Included".

NOTE: confirm every "Included" item is in the plan you advertise before running.
TEXT-FREE FALLBACK: blank invoice on desk; line items in Canva.
```

---

### V9: "Client #21? Add a profile for {EXTRA_PROFILE}." (Pricing ladder infographic)
Logo to upload: black wordmark.

```
AD BRIEF V9: Pricing, "Scale step by step"
Apply the locked style guide. Canvas 1080x1350. Light background.

LAYOUT:
1. Top-left: RecurPost logo.
2. Headline, left-aligned, top 24%, Bold 84 px:
   Line 1: "Client #21?"
   Line 2: "Add a profile for {EXTRA_PROFILE}."
   [HIGHLIGHT] = "{EXTRA_PROFILE}" (yellow highlighter box, black text).
3. Centre 46%: a STAIRCASE infographic rising left to right, built from white rounded blocks with soft shadows. The first big block is labelled "{PROFILES} profiles · {PLAN_PRICE}/mo". Each following small step adds one thin block labelled "+1 profile · {EXTRA_PROFILE}". A small flat illustration of a person (agency owner, smart casual) climbing the steps confidently. The top step is yellow.
4. Subheadline, Medium 36 px: "Grow one client at a time. No plan jumps."
5. Bottom-left CTA pill: "See Agency Pricing >"

BACKGROUND: #FFF8E6, subtle dot grid.
ONLY render: "Client #21?", "Add a profile for {EXTRA_PROFILE}.", "{PROFILES} profiles · {PLAN_PRICE}/mo", "+1 profile · {EXTRA_PROFILE}", "Grow one client at a time. No plan jumps.", "See Agency Pricing".

NOTE: "No plan jumps" assumes add-on profiles are always available; verify before running.
TEXT-FREE FALLBACK: staircase + figure; labels in Figma.
```

---

### V10: "Kitne clients handle karte ho?" (Slider / calculator UI, dark)
Logo to upload: white wordmark.

```
AD BRIEF V10: Pricing, "Self-qualification"
Apply the locked style guide. Canvas 1080x1350. BLACK background.

CONCEPT: An interactive-looking pricing slider makes the viewer mentally plug in their own number.

LAYOUT:
1. Top-left: RecurPost logo (white wordmark).
2. Headline, left-aligned, top 22%, white Bold 92 px:
   "Kitne clients handle karte ho?"
   [HIGHLIGHT] = "Kitne clients" (YELLOW text).
3. Centre 46%: a large white rounded calculator card (soft glow):
   - label "Social profiles" above a horizontal slider: grey track, yellow filled portion, round black knob positioned at the value "{PROFILES}" shown in a black tooltip bubble above the knob.
   - tick labels under the track: "5", "20", "50".
   - below, big result: "{PLAN_PRICE}" in black ExtraBold 110 px, then "/month" in grey Medium 36 px.
   - small grey line: "Billed per profile, not per seat"
4. Bottom-left CTA pill (yellow, black text): "Calculate Your Price >"

ONLY render: "Kitne clients handle karte ho?", "Social profiles", "{PROFILES}", "5", "20", "50", "{PLAN_PRICE}", "/month", "Billed per profile, not per seat", "Calculate Your Price".

TEXT-FREE FALLBACK: calculator card with slider shapes only; numbers in Canva.
```
