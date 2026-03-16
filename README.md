# Lemma

A personal math study OS. Track reading progress, organise topic notes, log practice problems, and keep a daily study journal — all in one place, running locally.

## ✨ Features

- **Dashboard** — streak counter, active book progress, open questions, and recent activity at a glance
- **Library** — manage textbooks with page/chapter tracking and reading status
- **Topic Notes** — write detailed notes per topic with confidence levels, linked pages, and examples
- **Problem Log** — track solved and unsolved problems with attempt notes, solutions, and revisit dates
- **Daily Reflection** — journal entries that drive the study streak
- **Open Questions** — quick-capture for things you don't understand yet, resolvable from the dashboard
- **Study Streak** — increments each day you write a journal entry; longest streak tracked
- **Dark mode** — toggleable from the sidebar, persisted in localStorage
- **Book Reader** — in-browser PDF viewer linked to your active book and current page
- **Markdown + LaTeX** — topic notes and problem solutions render rich text and math notation

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Architecture**: local-first, single user, no authentication

## 🗂 Project Structure

```
lemma/
├── books/              # Drop your PDF textbooks here (gitignored)
├── client/             # React frontend
│   └── src/
│       ├── api/        # Fetch wrappers for each entity
│       ├── components/ # UI primitives, forms, dashboard widgets
│       ├── hooks/      # Data hooks (useBooks, useTopics, etc.)
│       ├── pages/      # Dashboard, Library, Topics, Problems, Journal
│       └── types/      # Shared TypeScript interfaces
└── server/             # Express backend
    ├── prisma/         # Schema, migrations, seed data
    └── src/
        ├── controllers/
        ├── routes/
        └── services/   # Business logic (streak, isActive invariant, etc.)
```

## ⚙️ Requirements

- Node.js ≥ 18
- npm
- PostgreSQL (local install or hosted)

## 🚀 Getting Started

```bash
git clone <repo-url>
cd lemma
make install
cp server/.env.example server/.env
make migrate
make seed
```

Then in two separate terminals:

```bash
make dev-server   # http://localhost:3001
make dev-client   # http://localhost:5173
```

Or use two terminals manually:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open `http://localhost:5173`.

### Reset and re-seed

```bash
make reset
```

Resets the configured PostgreSQL database, re-runs migrations, and re-seeds.

### Production build

```bash
make build
```

Compiles the server TypeScript and builds the client bundle to `client/dist/`.

## 📖 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET/POST | `/api/books` | List or create books |
| PUT/DELETE | `/api/books/:id` | Update or delete a book |
| GET/POST | `/api/topics` | List or create topics |
| PUT/DELETE | `/api/topics/:id` | Update or delete a topic |
| GET/POST | `/api/problems` | List (with filters) or create problems |
| PUT/DELETE | `/api/problems/:id` | Update or delete a problem |
| GET/POST | `/api/journal` | List or create journal entries |
| PUT/DELETE | `/api/journal/:id` | Update or delete a journal entry |
| GET/POST | `/api/questions` | List or create questions |
| PUT/DELETE | `/api/questions/:id` | Update or delete a question |
| GET | `/api/dashboard/summary` | Aggregated dashboard data |

## 📈 Roadmap

### ✅ v1.0 — Complete

- [x] Dashboard with streak, active book, and recent activity
- [x] Library with reading progress tracking
- [x] Topic notes with confidence levels and book/page linking
- [x] Problem log with status, difficulty, solutions, and revisit dates
- [x] Daily journal with study streak
- [x] Open questions with quick-add and resolve from dashboard
- [x] Dark mode
- [x] Seed data based on real textbooks

### v1.1 — Planned

- [ ] Full-text search across topics and problems
- [ ] Reading progress chart over time
- [ ] Weekly study stats (pages read, problems solved, time logged)
- [ ] JSON export/import for backup
- [x] Markdown rendering in notes and solutions
- [x] In-browser PDF viewer (linked to current page)

### v1.2 — Ideas

- [ ] Spaced repetition queue for revisit-flagged problems
- [ ] Per-topic problem count and confidence trend
- [ ] Pomodoro-style session timer

## ▶️ Motivation

General note-taking apps don't model the way you actually study math from a textbook. Notion doesn't know you're on page 87 of Abbott, or that you keep getting epsilon-delta arguments wrong, or that you haven't reviewed compactness in five days.

Lemma is built around the workflow of working through a rigorous math text: read a section, take notes, attempt problems, reflect on what stuck and what didn't, and flag the things you don't understand yet. Everything is linked — a topic knows which book it came from, a problem knows which topic it belongs to, a journal entry knows what you were reading that day.

## 📜 License

GNU General Public License v3.0 — see [LICENSE](LICENSE) for details.
