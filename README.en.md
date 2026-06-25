<div align="center">

# ▲ Ascend — Gamified Habit & Reward System

[🇫🇷 Français](README.md) · **🇬🇧 English**

Turn discipline into rewards. **Ascend** is a premium, dark-mode productivity app where you **earn points** for completing habits, **lose them** for skipping, **level up** over time, and spend your balance in a personal **reward shop**.

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22c55e)

</div>

> Built **from scratch** with a custom design system — glassmorphism, gradients, bespoke SVG charts and smooth motion throughout. No component framework, no chart library.

## 🔗 Live demo

👉 **[Open the demo](https://YOUR-USERNAME.github.io/ascend/)** — _replace `YOUR-USERNAME` with your GitHub handle after deploying (see [Deployment](#-deploy-to-github-pages))._

> _Tip: drop a screenshot or GIF of the dashboard and the 🇫🇷 ⇄ 🇬🇧 language toggle here._

---

## ✨ Features

- **Motivating dashboard** — animated point balance, level & XP progression, completion ring, streaks, momentum chart, today's quick-actions, recent-activity timeline, and contextual motivational copy.
- **Habit system** — name, description, category, emoji, frequency (daily / weekly / monthly / yearly), positive & negative point stakes, notes. Recurring **or** one-time tasks. Mark complete / skip, edit, delete, and full per-habit history.
- **Points & levels** — every completion earns points and lifetime XP; skips deduct. Balance updates instantly with count-up animations. Lifetime XP drives a level + title progression (Initiate → Legend).
- **Reward shop** — create rewards with cost, category, description and optional cover image. Affordable rewards unlock a redeem button (with confetti 🎉); others show live progress toward affordability. Full redemption history.
- **Penalties** — define real-world consequences that trigger when your balance drops below a threshold or skips pile up in a 7-day window. Active penalties surface on the dashboard and in toasts.
- **Analytics** — completion rate, current & longest streak, points earned vs lost, weekly point-flow bar chart, most-completed / most-skipped habits, and a per-habit success-rate breakdown. Range filter (30d / 90d / 1y).
- **Calendar & heatmap** — month grid with per-day net score and completion/skip counts, a day-detail panel, and a GitHub-style consistency heatmap.
- **Bilingual — English / Français** — switch the entire interface language from Settings. The choice is instant (no reload), persists across sessions, and localizes dates, weekday/month names and relative times too.
- **Polished UX** — toast notifications, promise-based confirmation dialogs, empty states, loading splash, page transitions, search / filter / sort, responsive desktop + mobile layouts, and keyboard-friendly modals (Esc to close).
- **Local persistence** — everything is saved to `localStorage`. Export / import a JSON backup, load demo data, or reset from Settings. No account, no server — your data never leaves the browser.

## 🛠 Tech stack

| Concern | Choice |
| --- | --- |
| Framework | **React 18** + **TypeScript** (strict) |
| Build | **Vite 5** |
| State | **Zustand** with `persist` middleware |
| Animation | **Framer Motion** |
| Icons | **lucide-react** |
| Charts | **Hand-rolled SVG** (no chart dependency) |
| Styling | **CSS Modules** + a design-token system (no utility-class framework) |
| i18n | **Custom** — type-safe EN/FR dictionaries, no dependency |

## 🚀 Getting started

```bash
# install
npm install

# run the dev server (http://localhost:5173)
npm run dev

# type-check + production build
npm run build

# preview the production build
npm run preview
```

> First launch seeds ~7 weeks of realistic demo data so every chart, streak and heatmap is populated. Clear it any time from **Settings → Data → Clear all data**.

## 🚢 Deploy to GitHub Pages

The repo ships a GitHub Actions workflow (`.github/workflows/deploy.yml`) that **builds and publishes** the site automatically on every push to `main`.

1. Push the project to GitHub.
2. On GitHub: **Settings → Pages → Build and deployment → Source: `GitHub Actions`**.
3. The workflow runs on its own. When it finishes (the **Actions** tab), the site is live at:
   `https://YOUR-USERNAME.github.io/ascend/`

> Vite is configured with `base: './'`, so the app works under any repo subpath — no changes needed.

## 🧱 Architecture

```
src/
├─ main.tsx               # entry; mounts <App>, imports global styles
├─ App.tsx                # providers, aurora background, splash, toasts
├─ styles/                # design tokens + global base & animated aurora canvas
├─ types/                 # domain model (Habit, Reward, LogEntry, Punishment…)
├─ lib/                   # pure helpers — date, format, levels, image, id, cx, constants
├─ i18n/                  # en/fr dictionaries + useT() hook (translation + localized dates)
├─ store/                 # Zustand store, pure selectors, derived hooks, demo seed
├─ hooks/                 # useCountUp, useMediaQuery, useElementSize
├─ components/
│  ├─ ui/                 # design-system primitives (Button, Card, Modal, Toast…)
│  ├─ charts/             # AreaChart, BarChart, Heatmap (reusable SVG)
│  ├─ common/             # SectionHeader, StatCard, Confetti
│  └─ layout/             # AppShell, Sidebar, Topbar, MobileNav, UIProvider, Splash
└─ features/              # one folder per surface (dashboard, habits, rewards,
                          #   analytics, calendar, punishments, settings)
```

### Design principles

- **Single source of truth for style.** Components reference CSS variables from `tokens.css`; no hard-coded colors or magic numbers.
- **Pure, testable logic.** All analytics live in `selectors.ts` as pure functions over raw collections; components memoize them.
- **Derived, not duplicated state.** The point balance and level are computed from logs and redemptions rather than stored, so they can never drift.
- **Reusable primitives.** Every screen is composed from the same `ui/` kit and `charts/` components — no inline styles, no copy-pasted widgets.
- **Type-safe i18n.** `fr.ts` must provide every key in `en.ts` or the TypeScript build fails — a missing translation can't ship.

## ⌨️ Notes

- Each log entry snapshots the habit name & icon, so history and analytics survive habit edits and deletions.
- Streaks use a frequency-aware period index, so weekly/monthly habits streak correctly — not just daily ones.
- Reward cover images are downscaled on-device (canvas) before being stored, keeping `localStorage` small.

---

<div align="center">

Made for momentum. ▲

</div>
