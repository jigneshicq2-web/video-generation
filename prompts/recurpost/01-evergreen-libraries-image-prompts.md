# RecurPost Meta Ads: Evergreen Content Libraries
## AI image-generation prompts (10 variations)

---

## HOW TO USE (read once)

1. Open a new chat with an image-capable model (ChatGPT image gen / Gemini "Nano Banana" / Ideogram / Higgsfield).
2. **Upload the RecurPost logo PNG (transparent background).**
3. Paste **BLOCK A: MASTER STYLE GUIDE** once, first.
4. Then paste **one** variation prompt (V1–V10). Generate. Review against the QC checklist (Block C).
5. For the next variation, paste the next prompt in the same chat (style guide stays in context), or start a new chat and repeat steps 2–3.

**Before first use, fill in the 6 hex codes in Block A.** I could not access recurpost.com from my environment, so the colours are placeholders. Get them from the brand guide, or use a colour picker on the website/logo. If you leave them blank, the prompt tells the model to sample colours from the uploaded logo, which is less reliable.

**Honest limitation:** AI image models still misspell text, especially Hinglish words and lines longer than about 8 words. Every prompt below keeps on-image text short and quotes it exactly. If a word comes out wrong after 2 retries, use the **text-free fallback** at the bottom of each prompt and add the typography in Canva/Figma. That route gives you pixel-perfect type every time.

**Product UI warning:** the model will invent a fake RecurPost dashboard. For a paid ad, a stylised mock is fine, but it must not show features RecurPost doesn't have. For best results, replace the generated UI with a real cropped screenshot afterwards.

---

## BLOCK A: MASTER STYLE GUIDE (paste first, once per chat)

```
You are a senior performance-marketing graphic designer with 10+ years designing high-converting Meta (Facebook/Instagram) feed ads for B2B SaaS brands. You will generate static ad images for RecurPost, a social media scheduling tool for agencies. I will send one ad brief at a time. Apply EVERYTHING in this style guide to every ad unless the brief explicitly overrides it.

=== CANVAS ===
- Format: 4:5 portrait, 1080 x 1350 px (Meta feed optimal). If I say "square", use 1080 x 1080.
- Safe zone: keep ALL text and the logo at least 64 px from every edge. Keep the bottom 120 px free of critical text (Instagram UI overlays it).
- Layout grid: 12-column, 64 px outer margins, 24 px gutters. Everything aligns to this grid. Clean, generous negative space; never cluttered.

=== BRAND COLOURS (use ONLY these, plus pure white #FFFFFF) ===
- PRIMARY (brand main):        #______   (fill in)
- PRIMARY_DARK (deep bg/text): #______   (fill in)
- ACCENT (CTA, highlights):    #______   (fill in)
- LIGHT_BG (soft background):  #______   (fill in)
- TEXT_DARK (body text):       #______   (fill in)
- ALERT (pain/problem red):    #______   (fill in, use sparingly)
If any hex above is blank, sample the brand colours from the uploaded RecurPost logo and build a harmonious palette from them: one dominant brand colour, one deep shade of it, one contrasting accent for CTAs, an off-white background. Colour ratio per ad: 60% background, 30% primary, 10% accent. Never use gradients with more than 2 stops. No neon, no rainbow.

=== TYPOGRAPHY (most important; get this right) ===
- Typeface: one modern geometric sans-serif family only, in the style of "Inter", "Plus Jakarta Sans" or "Poppins". Never serif, never script/handwritten (unless the brief asks for a handwritten annotation), never decorative.
- Hierarchy (sizes relative to a 1080 px wide canvas):
  - HEADLINE: Bold/ExtraBold (700-800), 72-96 px, line-height 1.05-1.1, letter-spacing -1% to -2%, max 3 lines, max ~8 words per line.
  - HIGHLIGHT WORDS: the 1-3 words marked [HIGHLIGHT] in the brief are set in ACCENT colour OR on an ACCENT-coloured rounded rectangle behind the text (4-6 px corner radius, 8-12 px padding). Never both treatments at once.
  - SUBHEADLINE: Medium (500), 34-42 px, line-height 1.3, TEXT_DARK (or white on dark bg), max 2 lines.
  - SUPPORTING / LABELS: Regular-Medium (400-500), 24-30 px.
  - CTA BUTTON TEXT: SemiBold (600), 28-32 px, sentence case.
- Text alignment: left-aligned by default (more readable). Centre only when the brief says so.
- Contrast: every text element must pass WCAG AA contrast against its background (dark text on light bg or white text on dark bg). Never place text on a busy part of a photo; add a solid or 80%-opacity colour panel behind it if needed.
- TEXT ACCURACY RULES:
  1. Render ONLY the text strings I put in "double quotes" in the brief. Do not add any other words, taglines, fake URLs, lorem ipsum or random letters anywhere in the image.
  2. Spell every quoted string EXACTLY, character for character, including Hinglish words (e.g. "Har", "mahine", "likhoge"). Do not "correct" Hinglish to Hindi or English.
  3. No text inside UI mockups except the specific labels given in the brief; any other UI text must be rendered as neutral grey placeholder bars, not letters.
  4. No orphan words (a single word alone on the last line). Rebalance line breaks instead.

=== LOGO ===
- Use the EXACT uploaded RecurPost logo file. Do not redraw, restyle, recolour, stretch, add effects or invent a new logo.
- Default placement: top-left, height 48-56 px, inside the safe zone. On dark backgrounds use the white/reversed version if it reads better; otherwise place the logo on a small white rounded pill.
- The logo appears exactly ONCE.

=== CTA BUTTON ===
- Rounded pill (fully rounded ends), ACCENT fill, white or PRIMARY_DARK text (whichever has higher contrast), 88-100 px tall, subtle 8% drop shadow, optional small right-arrow icon ">" after the text.
- Default placement: bottom-left or bottom-centre, above the 120 px bottom margin.

=== UI MOCKUPS (when a brief asks for product UI) ===
- Clean, modern SaaS dashboard aesthetic: white cards, 16-24 px rounded corners, soft shadows (y=8, blur=24, 8-10% opacity), thin 1 px light-grey borders, PRIMARY as the only UI accent colour.
- Device frames: modern flat laptop or iPhone with thin bezels, no real-brand logos (no Apple logo).
- "Pop-out" technique: one key UI card breaks OUT of the device frame, overlaps the frame edge, sits slightly larger (110%) with a stronger shadow. This is the hero element.
- Social platform icons may be shown as generic simplified glyphs in their recognisable shape/colour (LinkedIn, Instagram, Facebook, X, Google Business). Keep them small.

=== PHOTOGRAPHY / PEOPLE (when a brief asks for people) ===
- Photorealistic, editorial, natural light, shallow depth of field, shot on 50mm, realistic skin texture, no plastic AI skin, correct hands with five fingers.
- People are South Asian (Indian) agency professionals aged 26-40, smart-casual (shirts, overshirts, blazers), modern office or home-office setting, unless the brief says otherwise.
- Expressions must be readable at thumbnail size (clearly stressed OR clearly relieved/confident).
- No celebrity likenesses, no real people, no watermarks, no stock-photo logos.

=== OVERALL AESTHETIC ===
Premium, clean, confident B2B SaaS, in the style of a top-tier Indian D2C/SaaS performance ad: bold headline, one clear visual idea, one CTA. It must be readable in 1.5 seconds on a phone at thumbnail size. Flat-modern with soft depth (light shadows), not skeuomorphic, not 3D-clay, not cartoonish (unless the brief asks for illustration).

=== GLOBAL NEGATIVE PROMPT (never do this) ===
misspelled text, extra words, gibberish text, fake URLs, watermark, multiple logos, distorted logo, redrawn logo, serif fonts, script fonts, comic sans, cluttered layout, more than one CTA, text touching edges, low contrast text, text over busy photo areas, neon colours, rainbow gradients, clip-art, emoji overload, deformed hands, extra fingers, plastic skin, celebrity faces, Apple logo, real competitor logos, blurry, jpeg artefacts, frames/borders around the whole ad.

Confirm you understand by replying "Style guide locked. Send brief V1." Do not generate an image yet.
```

---

## BLOCK B: VARIATION PROMPTS

> Paste one at a time after the style guide. Each prompt is self-contained in layout but relies on Block A for typography/colour/logo rules.

---

### V1: "The monthly content treadmill" (Spokesperson + UI pop-out)

```
AD BRIEF V1: Evergreen Content Libraries, "Monthly content treadmill"
Apply the locked style guide. Canvas 1080x1350.

CONCEPT: An agency owner is tired of rewriting every client's content every month. RecurPost libraries keep posting automatically.

LAYOUT (top to bottom):
1. Top-left: RecurPost logo (uploaded file).
2. Headline block, left-aligned, top 30% of canvas:
   Line 1: "Har mahine 20 clients ka"
   Line 2: "content phir se likhoge?"
   [HIGHLIGHT] = "phir se" (ACCENT colour).
3. Right 55% of canvas, middle: a confident Indian male agency owner (early 30s, trimmed beard, dark overshirt over a white tee, black-framed glasses), waist-up, turned 3/4 towards the left, smiling with mild amusement, index finger pointing left at the UI mockup.
4. Left 50%, middle, overlapping slightly behind the person's pointing hand: a laptop showing the RecurPost dashboard. POP-OUT CARD breaking out of the laptop screen: a white card titled "Content Library" with 3 stacked category rows, each with a coloured dot and a circular "repeat" (loop arrow) icon on the right. Row labels exactly: "Tips", "Testimonials", "Offers". Below the rows, a small PRIMARY-coloured pill reading "Auto-repeat: ON".
5. Subheadline under the UI, left-aligned: "Library ek baar banao. RecurPost khud post karta rahega."
6. Bottom-left CTA pill: "Start Free Trial >"

BACKGROUND: LIGHT_BG with a very soft radial glow of PRIMARY at 8% opacity behind the person.
MOOD: confident, witty, relieving. Not stressed.
ONLY render these text strings: "Har mahine 20 clients ka", "content phir se likhoge?", "Content Library", "Tips", "Testimonials", "Offers", "Auto-repeat: ON", "Library ek baar banao. RecurPost khud post karta rahega.", "Start Free Trial".

TEXT-FREE FALLBACK (if text keeps breaking): Generate the same image with the person, laptop and pop-out card, but leave the headline area, subheadline area and CTA area as empty LIGHT_BG space and render the card rows as grey placeholder bars. I will add the text in Canva.
```

---

### V2: "Your best post died after 1 day" (Before/after split)

```
AD BRIEF V2: Evergreen Content Libraries, "Wasted winners"
Apply the locked style guide. Canvas 1080x1350.

CONCEPT: Agencies publish a great post once and then it's buried forever. RecurPost recycles winners automatically.

LAYOUT:
1. Top-left: RecurPost logo.
2. Headline, left-aligned, top 25%:
   "Your best post got 1 day of attention."
   Line 2 (slightly smaller, same weight): "Then you buried it."
   [HIGHLIGHT] = "buried it" (ALERT colour text).
3. Middle 50%: a vertical split into two equal rounded panels (24 px radius, 24 px gap):
   LEFT PANEL (label pill at top: "Without RecurPost", grey pill): desaturated greyscale scene: a single social post card lying flat at the bottom of a pile of faded post cards, like a graveyard of content. A tiny calendar tag on the card: "Posted once".
   RIGHT PANEL (label pill at top: "With RecurPost", PRIMARY pill): full colour: the SAME post card glowing, travelling on a circular loop arrow around a mini calendar, with 3 small date chips on the loop: "Mon", "Wed", "Fri". Small upward engagement sparkline next to it.
4. Below panels, subheadline, left-aligned: "Evergreen posts recycle on autopilot. Winners keep working."
5. Bottom-left CTA pill: "Recycle Your Best Posts >"

BACKGROUND: white. Left panel bg light grey (#EEEEEE), right panel bg LIGHT_BG.
STYLE: clean flat-3D illustration for the panels (soft shadows, rounded shapes), NOT photographic.
ONLY render: "Your best post got 1 day of attention.", "Then you buried it.", "Without RecurPost", "Posted once", "With RecurPost", "Mon", "Wed", "Fri", "Evergreen posts recycle on autopilot. Winners keep working.", "Recycle Your Best Posts".

TEXT-FREE FALLBACK: same composition, empty headline/sub/CTA zones, panel labels as blank pills.
```

---

### V3: "Client asked why nothing was posted" (Emotional pain, photo)

```
AD BRIEF V3: Evergreen Content Libraries, "Empty client feed"
Apply the locked style guide. Canvas 1080x1350.

CONCEPT: The agency's worst moment: the client notices their feed went quiet. RecurPost libraries never run dry.

LAYOUT:
1. Top-left: RecurPost logo on a small white pill.
2. Headline, left-aligned, top 28%, on a solid PRIMARY_DARK band spanning full width (text white):
   Line 1: "Client ne pucha:"
   Line 2: "\"Last week post kyun nahi gaya?\""
   [HIGHLIGHT] = "kyun nahi gaya?" (ACCENT colour).
3. Middle-to-bottom 60%: photorealistic image of a stressed Indian female account manager (late 20s, hair tied back, beige blazer), sitting at a desk at night, laptop open, holding her phone, looking at it with visible anxiety, hand on forehead. Warm desk lamp light, dark blue office background, shallow depth of field.
4. Floating over the photo, upper-right of her phone, a large WhatsApp-style chat bubble (generic green-white chat UI, NO WhatsApp logo) from a contact named "Client", message text: "Last week ek bhi post nahi gaya??", timestamp "11:42 PM", double grey ticks.
5. Bottom area: a white rounded card (90% opacity) containing:
   Sub-line: "RecurPost libraries kabhi khaali nahi hote."
   CTA pill inside the card, right-aligned: "Never Miss a Post >"

MOOD: tension, relatable dread. The solution card provides relief.
ONLY render: "Client ne pucha:", "\"Last week post kyun nahi gaya?\"", "Client", "Last week ek bhi post nahi gaya??", "11:42 PM", "RecurPost libraries kabhi khaali nahi hote.", "Never Miss a Post".

TEXT-FREE FALLBACK: same photo and empty chat bubble and empty card; I'll add text.
```

---

### V4: "Old way vs New way" (Comparison split)

```
AD BRIEF V4: Evergreen Content Libraries, "Old way vs New way"
Apply the locked style guide. Canvas 1080x1350.

CONCEPT: Manual monthly scheduling vs schedule-once evergreen libraries.

LAYOUT: Two horizontal stacked panels, each a full-width rounded card (24 px radius), 24 px gap, on a PRIMARY_DARK background.
1. Top-left above the panels: RecurPost logo (white version or on white pill).

TOP PANEL (white card, ~42% height):
 - Small pill label top-left: "Old Way" (light red/pink pill, ALERT text).
 - Headline left side, TEXT_DARK, Bold 64 px: "Schedule 600 posts. Every. Single. Month."
 - Right side visual: an overflowing stack of paper calendar pages and sticky notes, slightly messy, a tired coffee mug. Flat-3D illustration, muted colours.

BOTTOM PANEL (LIGHT_BG card, ~42% height):
 - Small pill label top-left: "New Way" (light green pill, green text).
 - Headline left side, Bold 64 px: "Schedule once. It keeps posting."
   [HIGHLIGHT] = "Schedule once." (PRIMARY colour)
 - Right side visual: a clean single calendar card auto-filling with coloured post chips, a circular loop/repeat icon in PRIMARY, a small toggle reading "Recurring: ON".

Below panels, bottom row inside the dark background:
 - Left: two small white check-icon lines: "Category-based schedules" and "Auto-recycling evergreen posts"
 - Right: CTA pill: "See How It Works >"

ONLY render: "Old Way", "Schedule 600 posts. Every. Single. Month.", "New Way", "Schedule once. It keeps posting.", "Recurring: ON", "Category-based schedules", "Auto-recycling evergreen posts", "See How It Works".

TEXT-FREE FALLBACK: keep both panels and illustrations; empty text zones; blank pill labels.
```

---

### V5: "Don't click this ad" (Reverse psychology, type-only)

```
AD BRIEF V5: Evergreen Content Libraries, "Don't click"
Apply the locked style guide. Canvas 1080x1350.

CONCEPT: Pattern-interrupt reverse-psychology ad. Pure typography is the hero. Minimal visuals.

LAYOUT (centre-aligned for this ad only):
1. Background: solid PRIMARY_DARK with a very subtle radial glow of PRIMARY in the centre (10% opacity). Faint 1 px dot-grid texture at 5% opacity.
2. Top-centre: RecurPost logo (white/reversed version).
3. Upper-middle: a small ACCENT-coloured rectangle label behind text (like a highlighter): "Don't click this ad..."
4. Centre: main statement, white, Bold 76 px, centre-aligned, 4 lines max:
   "...if you enjoy rescheduling the same posts every month."
   [HIGHLIGHT] = "the same posts" (ACCENT colour text, no box).
5. Below: smaller white Medium 34 px at 80% opacity: "Everyone else: RecurPost recycles them for you."
6. Lower-middle: a large ACCENT pill button reading "DON'T CLICK", with a realistic white hand-cursor icon (pointing finger) hovering over its lower-right edge as if about to click.

NO photos, NO UI, NO people. Typography and the button only.
ONLY render: "Don't click this ad...", "...if you enjoy rescheduling the same posts every month.", "Everyone else: RecurPost recycles them for you.", "DON'T CLICK".

TEXT-FREE FALLBACK: not recommended for this ad. Build it directly in Canva (it's 100% type).
```

---

### V6: "5 people, 30 clients. Kaise?" (Curiosity + scale visual)

```
AD BRIEF V6: Evergreen Content Libraries, "Scale without hiring"
Apply the locked style guide. Canvas 1080x1350.

CONCEPT: Small agency team handling many clients because repetitive scheduling is automated.

LAYOUT:
1. Top-left: RecurPost logo.
2. Headline, left-aligned, top 22%, very large Bold 104 px, two lines:
   "5 log. 30 clients."
   Line 2: "Kaise?"
   [HIGHLIGHT] = "Kaise?" (ACCENT colour).
3. Centre 55%: photorealistic shot of a small, relaxed Indian agency team of 5 (mixed genders, 25-35, smart casual) around a modern wooden table with laptops, laughing/collaborating, bright daylight office with plants. Shot slightly from above, natural light.
4. Floating around the team, in an orbit/ring shape: about 12 small white rounded "client" bubbles, each containing a simple ABSTRACT generic brand mark (simple geometric shapes in different muted colours; NOT real brand logos, NO text inside). A subtle dotted PRIMARY line connects the bubbles in a ring around the team.
5. One larger white pop-out card on the right edge of the ring: title "Evergreen Libraries", with a loop icon and a small line "Posting on repeat" plus a green dot.
6. Bottom: subheadline left: "Libraries handle the repeat work. Your team does strategy."
   CTA pill right: "Scale Without Hiring >"

ONLY render: "5 log. 30 clients.", "Kaise?", "Evergreen Libraries", "Posting on repeat", "Libraries handle the repeat work. Your team does strategy.", "Scale Without Hiring".

TEXT-FREE FALLBACK: team photo + bubble ring + empty card; empty text zones.
```

---

### V7: "Your SMM isn't lazy" (Meme-style split, illustration)

```
AD BRIEF V7: Evergreen Content Libraries, "Team burnout"
Apply the locked style guide. Canvas 1080x1350.

CONCEPT: The social media manager is burnt out from scheduling the same post again and again. Relatable, meme-energy humour.

LAYOUT:
1. Top-left: RecurPost logo.
2. Headline, left-aligned, top 24%, two parts:
   "Your social media manager isn't lazy."
   Second line, Medium weight, smaller (44 px): "They're scheduling the same post for the 9th time."
   [HIGHLIGHT] = "9th time" (ALERT colour).
3. Middle 55%: two side-by-side rounded panels (meme split):
   LEFT panel (grey-desaturated bg), label pill top: "Before". Illustration: an exhausted young social media manager (Indian, mid-20s, hoodie) slumped at a desk with dark under-eye circles, staring at a screen showing the same post card duplicated 9 times in a grid, a "Copy-Paste" sticky note on the monitor. Expressive, slightly exaggerated cartoon style (clean vector illustration, bold outlines, flat colour), funny not sad.
   RIGHT panel (LIGHT_BG), label pill top: "After RecurPost". Same character, now relaxed, leaning back with a coffee, smiling, screen showing a single post card with a circular repeat icon and "Auto-repeat" chip.
4. Bottom: subheadline: "Automate the repetition. Keep the talent."
   CTA pill: "Free Your Team >"

ONLY render: "Your social media manager isn't lazy.", "They're scheduling the same post for the 9th time.", "Before", "Copy-Paste", "After RecurPost", "Auto-repeat", "Automate the repetition. Keep the talent.", "Free Your Team".

TEXT-FREE FALLBACK: both illustration panels intact, empty text zones, blank labels.
```

---

### V8: "Sunday ko laptop khula hai?" (Lifestyle aspiration)

```
AD BRIEF V8: Evergreen Content Libraries, "Take Sundays back"
Apply the locked style guide. Canvas 1080x1350.

CONCEPT: The agency owner works weekends to keep client feeds alive. With RecurPost libraries, posting continues while they're offline.

LAYOUT:
1. Top-left: RecurPost logo on white pill.
2. Headline, left-aligned, top 26%, white text on a solid PRIMARY_DARK block that covers the top 34% of canvas:
   Line 1: "Agency owner ho,"
   Line 2: "phir bhi Sunday ko laptop khula hai?"
   [HIGHLIGHT] = "Sunday" (ACCENT colour).
3. Bottom 66%: photorealistic lifestyle photo: an Indian male agency owner (mid-30s, linen shirt, sunglasses pushed up on head) relaxing on a sun lounger at a calm beach or poolside, golden-hour light, completely relaxed, laptop CLOSED on the side table next to a fresh coconut drink. He is glancing at his phone and smiling.
4. Floating near his phone (upper-right of the photo): an iOS-style push-notification card (white, rounded, soft shadow) with a small app-icon square (use the RecurPost logo mark), title "RecurPost", text "12 posts published today across 8 clients", time label "now".
5. Bottom-left over photo, on a semi-opaque white rounded card: "Libraries post while you're offline."
   CTA pill next to it: "Take Sundays Back >"

ONLY render: "Agency owner ho,", "phir bhi Sunday ko laptop khula hai?", "RecurPost", "12 posts published today across 8 clients", "now", "Libraries post while you're offline.", "Take Sundays Back".

TEXT-FREE FALLBACK: photo + empty notification card + empty bottom card.
```

---

### V9: "Which post goes out today?" (Calendar infographic)

```
AD BRIEF V9: Evergreen Content Libraries, "Content mix chaos"
Apply the locked style guide. Canvas 1080x1350.

CONCEPT: Agencies juggle content types per client. RecurPost category schedules decide automatically.

LAYOUT:
1. Top-left: RecurPost logo.
2. Headline, left-aligned, top 24%:
   Line 1: "Tips, testimonials, offers..."
   Line 2: "which one goes out today?"
   [HIGHLIGHT] = "today?" (ACCENT colour).
3. Centre 50%: a clean INFOGRAPHIC: a large white rounded weekly calendar card (Mon to Sun columns, 3 rows for weeks) with soft shadow.
   - Column headers exactly: "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun".
   - Cells are filled with colour-coded rounded chips in a repeating pattern:
     PRIMARY chips = Tips (on Tue in all 3 weeks),
     ACCENT chips = Testimonials (on Fri in all 3 weeks),
     a third harmonious colour = Offers (on Sun in all 3 weeks),
     a light grey chip = Blog (on Mon and Thu).
   - Chips contain NO text, only colour. The pattern must visibly repeat week after week (that's the point).
   - A thin circular loop arrow in PRIMARY wraps around the right edge of the calendar.
4. Directly under the calendar, a legend row with 4 colour dots + labels: "Tips", "Testimonials", "Offers", "Blog".
5. Bottom: subheadline: "Category schedules decide. On repeat. Automatically."
   CTA pill: "Build Your Content Mix >"

BACKGROUND: LIGHT_BG with subtle 1 px grid lines at 4% opacity.
STYLE: flat, crisp, data-viz clean, no people.
ONLY render: "Tips, testimonials, offers...", "which one goes out today?", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Tips", "Testimonials", "Offers", "Blog", "Category schedules decide. On repeat. Automatically.", "Build Your Content Mix".

TEXT-FREE FALLBACK: calendar with coloured chips and legend dots only; empty text zones (best built in Figma for perfect alignment).
```

---

### V10: "Client ka blog: 1 share. Bas?" (Flow diagram)

```
AD BRIEF V10: Evergreen Content Libraries, "RSS to evergreen"
Apply the locked style guide. Canvas 1080x1350.

CONCEPT: The agency writes blogs for clients that get shared once and die. RecurPost RSS imports them into libraries and keeps recirculating them.

LAYOUT:
1. Top-left: RecurPost logo.
2. Headline, left-aligned, top 22%:
   Line 1: "Client ka blog likha."
   Line 2: "1 share. Bas?"
   [HIGHLIGHT] = "Bas?" (ALERT colour).
3. Centre 55%: a horizontal-to-circular FLOW DIAGRAM, clean flat-3D icons with soft shadows, connected by thick PRIMARY arrows:
   Step 1 (left): a document/blog-page icon card, label "Blog".
   Arrow ->
   Step 2: an orange RSS-signal icon card, label "RSS".
   Arrow ->
   Step 3 (centre, largest, POP-OUT hero card in white with PRIMARY border): a stacked-layers "library" icon with a circular loop arrow around it, label "Evergreen Library".
   Arrow -> fanning out to
   Step 4 (right): 5 small round social glyph icons in a vertical arc (LinkedIn, Instagram, Facebook, X, Google Business; generic simplified shapes in their brand colours).
   A large circular dashed arrow returns from Step 4 back to Step 3, labelled "On repeat".
4. Bottom: subheadline: "Connect RSS once. Every new blog keeps recirculating."
   CTA pill: "Connect Your RSS >"

BACKGROUND: white with a very soft PRIMARY-tinted glow behind the hero card.
STYLE: crisp infographic, generous spacing, no people.
ONLY render: "Client ka blog likha.", "1 share. Bas?", "Blog", "RSS", "Evergreen Library", "On repeat", "Connect RSS once. Every new blog keeps recirculating.", "Connect Your RSS".

TEXT-FREE FALLBACK: icons, arrows and cards only; empty labels and text zones.
```

---

## BLOCK C: QC CHECKLIST (check every output before using it)

- [ ] Every word spelled exactly as quoted (zoom in on Hinglish words)
- [ ] No extra/invented text, URLs or gibberish anywhere (check UI cards and backgrounds)
- [ ] Logo is the uploaded file, undistorted, appears once
- [ ] Headline readable at phone-thumbnail size (shrink the image to 25% and look)
- [ ] Only brand colours; CTA is the single most saturated element
- [ ] Nothing critical in the bottom 120 px or within 64 px of the edges
- [ ] Hands, faces and eyes look natural (no extra fingers)
- [ ] UI mock doesn't claim a feature RecurPost doesn't have
- [ ] Meta text check: text area isn't overwhelming the image (aim for under ~25% of canvas for photo ads; the type-only V5 is the exception)

## Fix-it follow-up prompts (paste into the same chat)

- Text error: `Regenerate with identical composition. Fix ONLY this text, spelled exactly: "<correct text>". Change nothing else.`
- Logo distorted: `Regenerate with identical composition, but place the uploaded logo file exactly as provided: no redrawing, no recolouring, original proportions.`
- Too cluttered: `Same concept, but remove 30% of visual elements, increase negative space, make the headline 15% larger.`
- Weak contrast: `Increase contrast: put the headline on a solid PRIMARY_DARK panel with white text.`
- Square version: `Recompose this exact ad for 1080x1080 square; keep all text and hierarchy, rebalance spacing.`
