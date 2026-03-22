# Studio Dashboard

A polished, self-hosted social media content dashboard. Batch-create on Saturday, auto-post all week.

## What it is

Studio is a single-page React app that sits alongside a self-hosted [Postiz](https://postiz.com) instance. It gives you four focused workspaces:

- **Create Image** — launch Canva with the right dimensions pre-set for each platform
- **Create Post** — write captions, select platforms, generate hashtags via Claude AI
- **Schedule** — pick date/time and push directly to your Postiz queue
- **Engagement** — paste comments, get AI-drafted replies in your voice

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- lucide-react icons
- date-fns
- Claude API (hashtags + engagement replies)
- Postiz REST API (scheduling)
- Canva deep links (image creation)

## Setup

### 1. Clone & install

```bash
git clone https://github.com/Under450/studio-dashboard
cd studio-dashboard
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your keys — see [Environment Variables](#environment-variables) below.

### 3. Run

```bash
pnpm dev
```

App runs at `http://localhost:3001`

### 4. Run alongside Postiz (Docker)

```bash
docker-compose up
```

This starts both Studio and Postiz together.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_POSTIZ_URL` | Yes | Your Postiz instance URL (e.g. `http://localhost:3000`) |
| `VITE_POSTIZ_API_KEY` | Yes | Postiz API key (Settings → API in Postiz) |
| `VITE_CLAUDE_API_KEY` | Yes | Anthropic API key — for hashtags + reply drafting |
| `VITE_CANVA_CLIENT_ID` | Optional | Canva app client ID — enables OAuth, otherwise uses deep links |

---

## Design System

- **Font**: Geist / system-ui
- **Background**: `#0a0a0a` sidebar, `#fafaf9` content area
- **Accent**: `#e8ff4d` (used sparingly — active states, CTAs)
- **Icons**: lucide-react only, no emojis
- **Buttons**: Primary = black bg, white text. Ghost = transparent + 1px border.

---

## Panels

### Create Image
Selects the correct canvas dimensions for the chosen platform, then opens Canva. Finished images can be dragged back into the Create Post panel.

**Supported dimensions:**
| Platform | Size |
|---|---|
| Instagram Post | 1080 × 1080px |
| Instagram Story | 1080 × 1920px |
| LinkedIn | 1200 × 627px |
| X / Twitter | 1600 × 900px |
| TikTok | 1080 × 1920px |

### Create Post
Caption composer with per-platform character limits (X: 280, LinkedIn: 3000, Instagram: 2200). "Generate Hashtags" calls Claude API and returns 15–20 hashtags mixed across broad, niche, and hyper-niche ranges.

### Schedule
Fetches your connected channels from Postiz, shows a week-view calendar of existing posts, and pushes new posts via `POST /api/posts`.

### Engagement
Paste a block of comments (one per line or as a block). Claude drafts a reply for each one in your voice — concise, genuine, never sycophantic.

---

## Saturday Workflow

1. Open Studio
2. For each of your 14 assets: Create Image → Create Post → Schedule
3. Done — Postiz handles the rest all week

Total Saturday session: ~30–45 minutes.

---

## Build Prompt for Claude Code

See [`CLAUDE_CODE_PROMPT.md`](./CLAUDE_CODE_PROMPT.md) for the full spec used to build this app. Use it to rebuild, extend, or hand off to Claude Code for further development.

---

## Roadmap

- [ ] Cloudinary integration for auto-resize per platform
- [ ] Bulk import (drop 14 images at once, batch-generate captions)
- [ ] Analytics panel (pull Postiz performance data)
- [ ] Hashtag performance tracking
- [ ] n8n trigger (watch folder → auto-start workflow)
