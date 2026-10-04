# Itch — Experience-First Recommendation Engine

> **“You don't have to know what you want. We'll figure it out.”**

**Itch** is an AI-powered recommendation system for **anime, manga, books, and games**.

Traditional recommendation systems ask generic questions like *"What genre do you like?"* or *"What are your top 5 anime?"* That often yields a massive list of titles that technically match the genre tags but completely miss what your brain is actually craving right now.

Itch discovers your desired **experience**—calibrating cognitive effort tolerance, stimulation cravings, pacing, and commitment horizon—then ranks cross-medium candidates using a multi-stage scoring pipeline.

---

## 🌟 Core Highlights

- **Adaptive Conversational Discovery**: No 20-question questionnaires. Itch asks **one question at a time**, dynamically adapting the next prompt based on your previous answer, energy, and brain state.
- **Experience Sliders (AI Guesses → You Adjust)**:
  - **Core Sliders**:
    - *Energy & Stimulation*: 🌿 Calm / Ambient ────── ⚡ Explosive / Overdrive
    - *Mental Effort*: 🫠 Brain-off ────── 🧠 Make me think
    - *Commitment Horizon*: ☕ One sitting ────── 🚀 New obsession
  - **8 Advanced Sliders**: Emotional Intensity, Pacing, Novelty, Immersion, Mystery, Humor, Predictability, and Stakes.
  - Meaningful qualitative step positions (no arbitrary numbers like 7.3/10).
- **The Triad Recommendation**: You are never buried under endless cards. Itch presents:
  1. **★ Your Best Match**: Exactly one hero title that fits the session itch.
  2. **Backup**: A safer, universally acclaimed alternative.
  3. **Wildcard**: A surprising cross-medium recommendation that scratches the exact same emotional frequency.
- **“Why This?” Explanations**: Grounded strictly in your session state and slider values (e.g., *"Your attention is fried, but you still need stimulation without high cognitive friction"*). Zero medical or diagnostic claims.
- **“No, but…” Feedback Loop**: Respond naturally to any recommendation (*“No, too serious”*, *“Too long”*, *“Give me more comedy”*, *“Something like this but darker”*). The engine extracts directional signals, recalibrates the sliders live, and updates the triad without blacklisting titles.
- **Long-Term Taste vs. Current Session**: What you generally like (complex world-building, dark humor) is kept separate from what you need right now (mindless comfort because you are exhausted). Current fatigue never pollutes your long-term profile.
- **Unified Cross-Media Fingerprint**: Represents Anime, Manga, Books, and Games under a common 15-dimensional psychological experience model.
- **Instant Demo Mode**: Fully functional out of the box with an extensive curated catalog, local vector/distance scoring, and heuristic fallbacks—no API keys required to test the entire flow.

---

## 🏗️ Architecture & Tech Stack

```
itch/
├── index.html                   # HTML entry point with synchronized metadata
├── metadata.json                # AI Studio capability & app descriptor
├── package.json                 # Dependencies & scripts
├── server.ts                    # Express server with @google/genai proxy & Vite dev middleware
├── src/
│   ├── App.tsx                  # Root layout & view router
│   ├── components/
│   │   ├── common/              # Shared UI components
│   │   ├── discovery/           # One-question conversational discovery flow
│   │   ├── layout/              # Header and Footer (Zero-pill discipline)
│   │   ├── media/               # Media detail modal & 15-D fingerprint inspection
│   │   ├── recommendations/     # Hero Best Match, Backup, Wildcard, & Feedback modal
│   │   └── sliders/             # Interactive experience sliders with animated tracks
│   ├── context/
│   │   └── ItchContext.tsx      # Central state (ItchProfile, Taste, Library, History)
│   ├── data/
│   │   └── mockCatalog.ts       # 36+ curated titles across Anime, Manga, Books, Games
│   ├── db/
│   │   └── schema.sql           # Production Supabase PostgreSQL schema with pgvector
│   ├── pages/
│   │   ├── ExplorePage.tsx      # Catalog search & experience tag filtering
│   │   ├── HistoryPage.tsx      # Past session logs & 1-click Re-itch
│   │   ├── HomePage.tsx         # Craving landing page & jump-starts
│   │   ├── LibraryPage.tsx      # Saved, Finished, and Not For Me shelves
│   │   ├── ProfilePage.tsx      # Learned taste, affinities, and pet peeves
│   │   ├── RecommendationPage.tsx # Best Match + Backup + Wildcard results
│   │   ├── SettingsPage.tsx     # Engine status, local storage reset, privacy stance
│   │   └── SlidersPage.tsx      # Full-screen experience sliders
│   ├── services/
│   │   ├── ai/                  # Adaptive question pool & Gemini turn analyzer
│   │   ├── apiClient.ts         # Client API wrapper with seamless local fallbacks
│   │   ├── providers/           # MediaProvider abstraction (Curated, AniList, Books, IGDB)
│   │   └── recommendation/      # Multi-stage ranking engine & distance formulas
│   └── types/
│       └── index.ts             # Domain interfaces (CurrentItchProfile, MediaItem, etc.)
└── vite.config.ts               # Vite configuration with Tailwind CSS v4
```

### Technologies

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion.
- **Backend / API**: Node.js, Express, `tsx`.
- **AI Intelligence**: `@google/genai` TypeScript SDK using `gemini-3.8-flash` on the server for conversational intent analysis, empathetic reflection, and “No, but…” parsing.
- **Database**: Supabase PostgreSQL with `pgvector` vector embeddings extension.

---

## 🧮 Recommendation Pipeline

Candidates pass through a 6-stage ranking pipeline:

1. **Stage 1: Hard Filtering**: Filters media type (when restricted), runtime bounds, and user exclusions.
2. **Stage 2: Semantic Retrieval**: Cosine similarity against thematic tags, genres, and itch search queries.
3. **Stage 3: Experience Matching**: Normalized distance comparison across the 15 experience dimensions:
   $$\text{ExperienceScore} = \frac{1}{N} \sum_{i=1}^{N} \left(1 - \frac{|Itch_i - Media_i|}{9}\right)$$
4. **Stage 4: Long-Term Personalization**: Boosts for user affinities, penalties for pet peeves, interaction history weight.
5. **Stage 5: Context Weighting**: Non-linear penalties on critical fatigue bottlenecks (e.g. if cognitive effort tolerance is $\le 3$, penalizes high-effort titles).
6. **Stage 6: Triad Selection**:
   $$\text{FinalScore} = 0.35 \cdot S_{\text{itch}} + 0.25 \cdot S_{\text{exp}} + 0.20 \cdot S_{\text{semantic}} + 0.15 \cdot S_{\text{taste}} + 0.05 \cdot S_{\text{novelty}}$$
   - **Best Match**: Highest scoring candidate.
   - **Backup**: High-confidence, universally loved or higher-comfort alternative.
   - **Wildcard**: High-novelty cross-medium candidate matching the same core emotional frequency.

---

## 🗄️ Database Schema (`src/db/schema.sql`)

Designed for **Supabase PostgreSQL** with `pgvector`:

- `users`: User identifier and timestamps.
- `media`: Unified media catalog (id, source, source_id, title, type, runtime, cover_image, genres, themes, metadata).
- `media_experience`: 15 scalar columns (1–10) capturing cognitive load, stimulation, pacing, immersion, stakes, etc.
- `media_embeddings`: Vector embeddings column (`vector(768)`) with `ivfflat` cosine index for semantic vector search.
- `user_preferences`: Long-term taste JSON (`likes`, `dislikes`, `favorite_media_types`).
- `recommendation_sessions`: Session history storing ephemeral `current_itch_profile` alongside recommended items.
- `interactions`: User feedback events (`liked`, `disliked`, `finished`, `dropped`, `no_but`).
- `match_media_by_itch()`: Stored RPC function combining vector cosine distance with euclidean experience distance.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd itch

# Install dependencies
npm install
```

### Environment Variables

Configure `.env` (optional for local demo mode):

```env
# Gemini API Key for server-side AI turn analysis
GEMINI_API_KEY="your-gemini-api-key"

# Port (defaults to 3000)
PORT=3000
```

*Note: If no `GEMINI_API_KEY` is provided, Itch runs automatically in **Demo Mode** using its built-in heuristic NLP analyzer and scoring engine.*

### Running the App

```bash
# Start the full-stack development server (Express + Vite middlewares)
npm run dev

# Build for production
npm run build

# Typecheck and lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 Design Philosophy

- **Zero-Pill Discipline**: Metadata is rendered with clean typographic separators (`·`, `/`), never garish pill enclosures or candy tags.
- **Calm & Cinematic**: Dark theme with warm ember accents (`amber-400`), deep slate surfaces, and clean spacing.
- **No AI Robot Clutter**: Witty, empathetic human language (*“What's your brain asking for?”*, *“I think I found your itch”*) instead of robotic prompts (*“Please input your query”*).
- **Responsive**: Mobile-first touch targets and desktop-wide layouts.

---

## 📄 License

Apache-2.0

