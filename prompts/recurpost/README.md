# RecurPost Meta Ad Image Prompts

Copy-paste prompts for generating RecurPost Meta (Facebook/Instagram) feed ads with an AI image model.

## How to use
1. Open `00-master-style-guide.md`. Upload the RecurPost logo (black wordmark for light ads, white wordmark for dark ads), paste **Block A** once per chat.
2. Open a feature file and paste one variation prompt (V1-V10) at a time.
3. Check each output against **Block C** (QC checklist + fix-it prompts) in `00-master-style-guide.md`.

Brand: Yellow `#FFCC43`, Black `#1F1F1F`, White `#FFFFFF`. Never yellow text on white.

## Files
| File | Feature | Notes |
|---|---|---|
| `00-master-style-guide.md` | Shared style guide, how-to, QC | Paste Block A first, always |
| `01-evergreen-libraries-image-prompts.md` | Evergreen content libraries / recycling | Core USP; test first |
| `02-white-label-reports-image-prompts.md` | White-label reports | Reports show a fictional agency brand |
| `03-client-approvals-image-prompts.md` | Approve by link, no login | UI shows "Approve" only |
| `04-client-connect-image-prompts.md` | Clients connect own accounts | No passwords shown, ever |
| `05-per-profile-pricing-image-prompts.md` | Per-profile (not per-seat) pricing | **Replace `{PRICE}` tokens after verifying live pricing** |
| `06-social-inbox-image-prompts.md` | Unified inbox + AI-drafted replies | AI shown as draft, human sends |
| `07-workspaces-image-prompts.md` | One workspace per client brand | V4/V9 need per-workspace access verified |
| `08-instagram-dm-automation-image-prompts.md` | Keyword DM auto-replies + CTA buttons | V8 needs comment-trigger verified |
| `09-bulk-scheduling-ai-content-image-prompts.md` | CSV bulk upload, AI captions/images, best time, Canva | Example figures labelled |

## Before running any ad
- Every feature claim came from third-party sources (recurpost.com was not reachable when these were written). Each file has a **Claim guardrail** section. Verify against the live product.
- Example numbers (hours, post counts, ₹ values) are illustrative; swap in real customer data when you have it.
