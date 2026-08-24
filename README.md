# Meridian — Urban Planning Intelligence (prototype)

A UX/UI prototype for a B2B SaaS that helps residential property developers scan
Belgium (Brussels + Flanders) and surface the parcels with the strongest
development potential — instead of manually researching zoning, permits, and
comparable projects one site at a time.

This is a **front-end prototype with realistic mock data**, not a connected
product. It exists to demonstrate the intended experience:
**Search → Results → Opportunity**.

## Screens

- **Discover** (`/`) — natural-language search, an interactive territory map
  scored by opportunity, and a ranked shortlist.
- **Opportunity detail** (`/opportunity/:id`) — score, development potential,
  planning intelligence, why-it-works / watch-outs, comparable permits.
- **Intelligence** (`/intelligence`) — planning metrics per municipality
  (approval rate, decision time, density trend, friendliness score), with
  side-by-side comparison.
- **Alerts** (`/alerts`) — an event-driven feed (new opportunities, approvals
  nearby, regulation changes, score changes).
- **Saved** (`/saved`) — a personal watchlist, persisted in the browser.

## Design intent

Extremely simple outside, sophisticated inside: natural-language search
replaces filter panels, the Opportunity Score is the primary navigation
device, and technical depth (raw permit data, sub-scores, constraints) stays
behind progressive disclosure (`Filters`, `View full analysis`,
`View all N comparables`) rather than on the surface.

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a production build;
`npm run preview` serves it locally.

## Data

All communes, parcels, permits, and feed events in `src/data/` are fictional
but realistic, built from Belgian place names (Uccle, Waterloo, Overijse,
Tervuren, Zaventem, Kraainem, Rhode-Saint-Genèse, Watermael-Boitsfort,
Brussels). Nothing is fetched from a real registry — this is intentional for
a prototype focused on product experience rather than data integration.
