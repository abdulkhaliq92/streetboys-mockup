# Street Boys — Website & Restaurant System Mockups

Clickable mockups for [Street Boys](https://www.streetboys.net/), Kouvolan Kauppahalli:
the public website, the restaurant management system (owner dashboard, till/POS, kitchen display,
front desk, delivery dispatch, menu & stock) and the Android phone apps (Cult App, driver, owner).

Plain static HTML — no build step. Open `index.html` locally or deploy as-is.

## Deploy on Vercel
1. In Vercel: **Add New… → Project → Import** this GitHub repository.
2. Framework preset: **Other**. Leave Build Command and Output Directory empty (root `./`).
3. Deploy. The start page is `/`, screens live under `/screens/`.

Every push to `main` redeploys automatically.

## Structure
| Path | What |
|---|---|
| `index.html` | Start page with all 17 screens |
| `screens/` | One page per screen (`home.html` is the website home) |
| `screenshots/` | Full-page PNGs (website pages also in Finnish, `*-FI.png`) |
| `assets/` | Logo (SVG), photos, self-hosted fonts, `dc-runtime.js` player |
| `source/` | Original design-canvas files (`.dc.html` + `canvas.json`) |

## Interactive bits
- FI / EN language switch on all website pages (remembered between pages)
- All navigation between screens
- Till / POS: categories, add items, quantities, pay
- Table booking confirmation
- Call / SMS / directions use `tel:`, `sms:` and Google Maps links

## Notes
- Menu and prices come from the current streetboys.net menu boards.
- Dashboard figures, customer/staff names and the phone number +358 40 123 4567 are placeholders.
- Photos are screen captures of the live site — swap in the original files for production.
