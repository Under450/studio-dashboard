# Claude Code Build Prompt — Social Dashboard

## What you're building

A polished, self-hosted social media content dashboard called **"Studio"** — a single-page React app that lives alongside a self-hosted Postiz instance. The user batches all their content creation on Saturday: creates images, writes posts, generates hashtags, schedules everything for the week, and manages engagement — all from one interface.

---

## ⚠️ CORS — Read This First (Before Any API Work)

**This project lost days to CORS. Do not repeat that.**

Browsers block cross-origin requests. If Studio (e.g. `localhost:5173`) calls any local backend (e.g. Postiz on `localhost:4007`) directly, the browser will refuse the request with a CORS error — even though both are on localhost. The symptom is usually a connection dot showing red/offline, or a fetch that silently fails.

**The fix is a Vite dev-server proxy. Set it up the moment you add any local API call.**

In `vite.config.ts`, add a `server.proxy` block:

```typescript
server: {
  proxy: {
    '/postiz': {
      target: 'http://localhost:4007',   // the local backend port
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/postiz/, ''),
    },
  },
},
```

Then in your API client (`src/lib/postiz.ts` or equivalent), route all dev calls through the proxy prefix instead of the direct URL:

```typescript
function proxyUrl(path: string, directUrl: string): string {
  if (import.meta.env.DEV) return `/postiz${path}`;   // Vite proxies this — no CORS
  return `${directUrl}${path}`;                        // production: direct call
}
```

**Rules:**
- In dev mode (`import.meta.env.DEV`), always use the proxy prefix path, never the direct URL.
- In production (built + served), use the direct URL — CORS doesn't apply when served from the same origin or via a reverse proxy.
- The same pattern applies to any other local backend (Claude API proxy, Canva backend, etc.) — just add another proxy entry with a different prefix.
- Check this is working before writing any UI that depends on API data. A quick `fetch('/postiz/api/auth/ping')` in the browser console confirms the proxy is live.

---

## Design Direction

This is the most important part. The design must feel like a **premium, contemporary tool** — think Linear, Vercel dashboard, or Raycast. Not the typical AI slop (no purple gradients, no rounded-everything, no Inter font wall-to-wall, no pastel card grids).

Specific design rules:
- **Font**: Geist (import from Google Fonts or use system-ui stack). Tight tracking on headings.
- **Colour palette**: Near-black `#0a0a0a` sidebar, off-white `#fafaf9` main content area, `#f4f4f2` panel backgrounds, slate text hierarchy. Single accent colour: `#e8ff4d` (sharp yellow-green) used sparingly — active states, CTAs only.
- **Layout**: Fixed left sidebar (240px) with nav icons + labels. Main content area takes the rest. No top navbar.
- **Panels**: Each of the 4 panels fills the main area when selected from the sidebar — not a grid of cards. Each panel is a focused workspace.
- **Typography**: Large, confident section titles (28–32px, weight 600). Small, muted labels (11px, uppercase, tracked). No decorative elements.
- **Borders**: 1px `#e4e4e2` on light surfaces. Subtle shadows only — `0 1px 3px rgba(0,0,0,0.06)`.
- **Buttons**: Primary = black bg, white text, no border-radius > 6px. Ghost = transparent, 1px border.
- **States**: Hover transitions 150ms. Active sidebar item has accent left border (3px `#e8ff4d`) + slightly lighter bg.
- **No emojis in the UI** — use clean SVG icons (lucide-react).

---

## Tech Stack

```
React 18 + TypeScript
Vite
Tailwind CSS
shadcn/ui (for primitives: Dialog, Select, Calendar, Tooltip only)
lucide-react (icons)
date-fns (date formatting)
```

---

## Repo Structure

```
studio-dashboard/
├── docker-compose.yml          # adds Studio alongside Postiz
├── Dockerfile
├── .env.example
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx                 # sidebar + panel router
    ├── config.ts               # reads all env vars
    ├── panels/
    │   ├── CreateImage.tsx     # Canva launcher panel
    │   ├── CreatePost.tsx      # caption composer + hashtag gen
    │   ├── Schedule.tsx        # calendar + Postiz queue push
    │   └── Engagement.tsx      # comment reply drafter
    ├── lib/
    │   ├── postiz.ts           # Postiz REST API client
    │   ├── claude.ts           # Claude API (hashtags + replies)
    │   └── canva.ts            # Canva deep link builder
    ├── components/
    │   ├── Sidebar.tsx
    │   ├── PanelShell.tsx      # consistent panel wrapper
    │   └── ui/                 # shadcn primitives
    └── types/
        └── index.ts
```

---

## Environment Variables

```env
VITE_POSTIZ_URL=http://localhost:3000
VITE_POSTIZ_API_KEY=
VITE_CLAUDE_API_KEY=
VITE_CANVA_CLIENT_ID=
```

---

## Panel Specifications

### 1. Sidebar (`Sidebar.tsx`)
- Fixed, 240px wide, `#0a0a0a` background
- App name "Studio" top-left, small + tracked
- Nav items: Create Image, Create Post, Schedule, Engagement — each with a lucide icon
- Active item: 3px left border in `#e8ff4d`, bg `#161616`
- Bottom: small "Connected to Postiz" status dot (green/red based on API ping)

### 2. Create Image Panel (`CreateImage.tsx`)
- Title: "Create Image"
- Subtitle: "Design your assets in Canva, then bring them back here."
- Platform selector: row of toggle buttons (Instagram Post, Instagram Story, LinkedIn, X/Twitter, TikTok) — each stores the correct pixel dimensions
- When a platform is selected, show its dimensions (e.g. "1080 × 1080px")
- Large CTA button: "Open in Canva" — calls `canva.ts` which builds a deep link to `https://www.canva.com/design/new/` with the right dimensions as URL params
- Below the button: a drag-and-drop zone labelled "Drop your finished image here" — accepts PNG/JPG, stores in component state, shows a preview thumbnail
- The dropped image gets passed to Create Post panel via shared state/context

### 3. Create Post Panel (`CreatePost.tsx`)
- Title: "Create Post"
- Left column (60%):
  - Textarea for caption (min-height 160px, auto-grows)
  - Character counter that turns amber at 80% of platform limit, red at 100%
  - Platform limit varies: X=280, LinkedIn=3000, Instagram=2200, TikTok=2200
- Right column (40%):
  - Platform checkboxes (X, LinkedIn, Instagram, TikTok, Facebook) — each with its icon
  - Hashtag section: "Generate Hashtags" button → calls `claude.ts` → streams 15–20 hashtags back, displayed as removable chips
  - Image preview if one was passed from Create Image panel
- Bottom bar: "Save Draft" (ghost) + "Move to Schedule →" (primary black button)

**`claude.ts` — hashtag generation:**
```typescript
// POST to https://api.anthropic.com/v1/messages
// model: claude-opus-4-6
// prompt: given the caption text and selected platforms,
//         return 15-20 relevant hashtags as a JSON array.
//         Mix: 3-4 broad (>1M posts), 8-10 niche (50k-500k posts),
//         3-4 hyper-niche (<50k posts). No # prefix in the array.
```

### 4. Schedule Panel (`Schedule.tsx`)
- Title: "Schedule"
- On mount: call `postiz.ts → getChannels()` → `GET /api/channels` on the Postiz instance. Display connected channels in a horizontal row with platform icons.
- Left: a week-view calendar (7 columns, current week). Existing scheduled posts shown as small chips (fetched from Postiz on mount).
- Right: scheduling form
  - Post preview (caption truncated + image thumb)
  - Channel multi-select (checkboxes from fetched channels)
  - Date + time picker (shadcn Calendar + time input)
  - "Queue Post" button → calls `postiz.ts → createPost()`
- `postiz.ts → createPost()`:
```typescript
// POST {VITE_POSTIZ_URL}/api/posts
// Headers: { Authorization: `Bearer ${VITE_POSTIZ_API_KEY}` }
// Body: { content, publishDate, channels[], media[] }
```
- On success: show a toast "Queued for [date] on [n] channels" and refresh the calendar view.

### 5. Engagement Panel (`Engagement.tsx`)
- Title: "Engagement"
- Subtitle: "Paste comments from any platform. Get replies drafted in your voice."
- Large textarea: "Paste comments here — one per line, or as a block"
- "Draft Replies" button → calls `claude.ts → draftReplies()`
- **`claude.ts → draftReplies()`**:
```typescript
// Splits input by newline into individual comments
// Sends all to Claude API in one call:
// System: "You are drafting social media replies on behalf of the account owner.
//          Replies should be warm, genuine, concise (1-2 sentences max),
//          never sycophantic. Match the energy of each comment."
// Returns: array of { comment, reply }
```
- Results displayed as a clean list: original comment (muted) + drafted reply below it (prominent) + "Copy" icon button on each reply
- "Copy All" button at top right copies all replies formatted for pasting

---

## docker-compose.yml

Add Studio as a service that builds from the repo root and proxies to the Postiz container:

```yaml
services:
  studio:
    build: .
    ports:
      - "3001:3001"
    environment:
      - VITE_POSTIZ_URL=http://postiz:3000
    depends_on:
      - postiz
```

Include a `Dockerfile` using `node:20-alpine`, builds the Vite app, serves with `serve` on port 3001.

---

## Implementation Notes

- Use React Context (`AppContext`) to share state between panels — specifically: `currentPost` (caption, platforms, image) that flows from Create Post → Schedule.
- Postiz API calls should all have error handling that shows a non-intrusive inline error (not a modal) if the Postiz URL isn't reachable — with a link to docs.
- All Claude API calls should stream responses where possible (use `stream: true` on the messages endpoint).
- The app should work in a degraded mode if no API keys are set — panels still render, buttons are disabled with a "Connect API key in .env" tooltip.
- Mobile: sidebar collapses to a bottom tab bar at <768px. Panels stack vertically.

---

## What "done" looks like

1. `pnpm dev` runs the app at localhost:3001 with no errors
2. All 4 panels render correctly with the design spec
3. Sidebar navigation works
4. Create Post hashtag generation works with a real Claude API key
5. Schedule panel fetches channels from a running Postiz instance
6. `docker-compose up` starts both Studio and Postiz together
7. README documents the setup steps and .env variables

---

## Context from prior research session

This was designed in a Cowork session where we evaluated 7 social media tools (Postiz, Mixpost, Buffer, Publer, Typefully, Later, Taplio), chose Postiz as the self-hosted scheduler, identified Canva (free MCP) + Cloudinary (free tier) + Claude API as the supporting tools, and decided against Hugging Face/Replicate for image editing due to cost. The Saturday workflow: batch-create 14 assets → generate captions + hashtags → schedule across the week → manage engagement daily. Total stack cost ~$25–35/mo, mostly Claude Pro.
