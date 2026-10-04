import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { MOCK_CATALOG } from './src/data/mockCatalog';
import { rankRecommendations } from './src/services/recommendation/scoring';
import { CurrentItchProfile, UserTasteProfile } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ==========================================
// API ROUTES
// ==========================================

// Health & System status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!(ai && apiKey),
    catalogSize: MOCK_CATALOG.length,
    timestamp: Date.now(),
  });
});

// Catalog list & search
app.get('/api/media', (req, res) => {
  const type = req.query.type as string | undefined;
  const q = req.query.q as string | undefined;

  let items = [...MOCK_CATALOG];
  if (type && type !== 'all') {
    items = items.filter((m) => m.type === type);
  }
  if (q && q.trim()) {
    const query = q.toLowerCase();
    items = items.filter(
      (m) =>
        m.title.toLowerCase().includes(query) ||
        m.tagline.toLowerCase().includes(query) ||
        m.genres.some((g) => g.toLowerCase().includes(query))
    );
  }

  res.json({ items });
});

// Analyze natural language user turn & extract itch signals
app.post('/api/discovery/analyze-turn', async (req, res) => {
  const { message, currentProfile, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If Gemini is available, use LLM for deep signal extraction
  if (ai) {
    try {
      const prompt = `You are Itch, an empathetic recommendation engine for anime, manga, books, and games.
The user is answering: "${message}".
Current Itch Profile: ${JSON.stringify(currentProfile || {})}.
Recent history: ${JSON.stringify(history || [])}.

Analyze the user's brain state, energy, stimulation cravings, cognitive tolerance, humor, and pacing.
Return a STRICT JSON object in this exact schema:
{
  "empathetic_reflection": "Short, human sentence (e.g. 'Got it—your brain is cooked, but you need a quick dopamine jolt without complicated lore.')",
  "slider_adjustments": {
    "stimulation": number (1-10 or null),
    "cognitive_load": number (1-10 or null),
    "commitment_tolerance": number (1-10 or null),
    "emotional_intensity": number (1-10 or null),
    "pacing": number (1-10 or null),
    "novelty": number (1-10 or null),
    "immersion": number (1-10 or null),
    "mystery": number (1-10 or null),
    "humor": number (1-10 or null),
    "stakes": number (1-10 or null),
    "comfort": number (1-10 or null)
  },
  "confidence": number between 0.1 and 1.0 (how confident you are that you know their exact itch),
  "ready_for_recommendation": boolean
}
IMPORTANT: Never mention ADHD, medical conditions, or diagnostic terms. Keep the tone warm, witty, and grounded.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err) {
      console.warn('Gemini turn analysis failed, falling back to heuristic:', err);
    }
  }

  // Heuristic Fallback
  const lower = message.toLowerCase();
  const adjustments: Record<string, number> = {};
  let reflection = "I hear you. Adjusting your itch profile.";
  let confidence = 0.55;

  if (lower.includes('fried') || lower.includes('tired') || lower.includes('exhausted') || lower.includes("don't make me think") || lower.includes('mindless')) {
    adjustments.cognitive_load = 2;
    adjustments.comfort = 8;
    reflection = "Understood—your brain is completely drained. Zero complex jargon allowed.";
    confidence = 0.75;
  }
  if (lower.includes('stimulation') || lower.includes('dopamine') || lower.includes('fast') || lower.includes('hook') || lower.includes('grab')) {
    adjustments.stimulation = 9;
    adjustments.pacing = 9;
    adjustments.hook_strength = 9;
    reflection = "You need an immediate dopamine hit that grabs your attention on page or minute one.";
    confidence = 0.78;
  }
  if (lower.includes('laugh') || lower.includes('comedy') || lower.includes('funny') || lower.includes('ridiculous')) {
    adjustments.humor = 9;
    adjustments.emotional_intensity = 3;
    reflection = "Dialing up the comedy and keeping things high-spirited.";
  }
  if (lower.includes('cry') || lower.includes('feel') || lower.includes('hurt me') || lower.includes('emotional')) {
    adjustments.emotional_intensity = 9;
    adjustments.comfort = 2;
    reflection = "Ready for some genuine emotional stakes and catharsis.";
  }
  if (lower.includes('20') || lower.includes('short') || lower.includes('one sitting') || lower.includes('tonight')) {
    adjustments.commitment_tolerance = 2;
    reflection = "Keeping the commitment tight—something you can start and finish tonight.";
    confidence = 0.82;
  }

  return res.json({
    empathetic_reflection: reflection,
    slider_adjustments: adjustments,
    confidence,
    ready_for_recommendation: confidence >= 0.75,
  });
});

// Interpret "No, but..." feedback
app.post('/api/feedback/no-but', async (req, res) => {
  const { feedback, currentProfile, currentMediaTitle } = req.body;

  if (!feedback || typeof feedback !== 'string') {
    return res.status(400).json({ error: 'Feedback string required' });
  }

  if (ai) {
    try {
      const prompt = `You are the recommendation intelligence behind Itch.
The user saw a recommendation for "${currentMediaTitle || 'a title'}" and gave this "No, but..." feedback:
"${feedback}"
Current Itch profile: ${JSON.stringify(currentProfile || {})}.

Interpret the feedback as directional signals on experience dimensions.
Return STRICT JSON:
{
  "summary": "1 short conversational sentence acknowledging the tweak (e.g. 'Understood—pulling back on the heavy melodrama and ramping up the laughs.')",
  "negative_signal": {
    "attribute": string (e.g. 'seriousness', 'runtime', 'pacing', 'darkness'),
    "direction": "too_high" | "too_low"
  },
  "slider_delta": {
    "stimulation": number (change, e.g. -2, +2, or 0),
    "cognitive_load": number,
    "emotional_intensity": number,
    "comfort": number,
    "pacing": number,
    "humor": number,
    "commitment_tolerance": number,
    "mystery": number,
    "novelty": number,
    "stakes": number
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err) {
      console.warn('Gemini feedback parsing failed, using heuristic:', err);
    }
  }

  // Heuristic "No, but..." interpreter
  const lower = feedback.toLowerCase();
  const delta: Record<string, number> = {};
  let summary = "Got it! Calibrating the recommendation engine based on your note.";
  let negative_signal = { attribute: 'general', direction: 'too_high' };

  if (lower.includes('too serious') || lower.includes('less serious') || lower.includes('lighter')) {
    negative_signal = { attribute: 'seriousness', direction: 'too_high' };
    delta.emotional_intensity = -3;
    delta.humor = 3;
    delta.comfort = 2;
    summary = "Got it—taking down the heavy gravity and prioritizing fun.";
  } else if (lower.includes('too long') || lower.includes('shorter') || lower.includes('commitment')) {
    negative_signal = { attribute: 'length', direction: 'too_high' };
    delta.commitment_tolerance = -3;
    summary = "Trimming down the runtime—aiming for something bite-sized.";
  } else if (lower.includes('comedy') || lower.includes('laugh') || lower.includes('funny')) {
    negative_signal = { attribute: 'humor', direction: 'too_low' };
    delta.humor = 4;
    delta.emotional_intensity = -2;
    summary = "Ramping up the humor.";
  } else if (lower.includes('darker') || lower.includes('grit') || lower.includes('mature')) {
    negative_signal = { attribute: 'darkness', direction: 'too_low' };
    delta.emotional_intensity = 3;
    delta.comfort = -3;
    delta.stakes = 2;
    summary = "Pushing the tone into darker, higher-stakes territory.";
  } else if (lower.includes('slow') || lower.includes('faster') || lower.includes('pacing')) {
    negative_signal = { attribute: 'pacing', direction: 'too_low' };
    delta.pacing = 3;
    delta.hook_strength = 2;
    summary = "Injecting adrenaline into the pacing.";
  }

  res.json({
    summary,
    negative_signal,
    slider_delta: delta,
  });
});

// Rank recommendations endpoint
app.post('/api/recommendations/rank', (req, res) => {
  const { itchProfile, userTaste } = req.body;
  const defaultProfile: CurrentItchProfile = {
    stimulation: 6,
    cognitive_load: 4,
    commitment_tolerance: 4,
    emotional_intensity: 5,
    pacing: 6,
    novelty: 6,
    immersion: 7,
    mystery: 5,
    humor: 5,
    predictability: 5,
    stakes: 5,
    character_attachment: 7,
    hook_strength: 7,
    comfort: 6,
    preferred_media: [],
  };

  const defaultTaste: UserTasteProfile = {
    id: 'guest',
    likes: [],
    dislikes: [],
    favorite_media_types: ['anime', 'manga', 'book', 'game'],
    pace_bias: 'any',
    cognitive_bias: 'any',
    interaction_history: {
      liked: [],
      disliked: [],
      finished: [],
      dropped: [],
      saved: [],
      feedback_notes: [],
    },
  };

  const ranked = rankRecommendations(
    MOCK_CATALOG,
    itchProfile || defaultProfile,
    userTaste || defaultTaste
  );

  res.json(ranked);
});

// Mount Vite or Static Frontend
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Itch server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
