import { CurrentItchProfile, MediaItem, ScoredMediaItem, UserTasteProfile } from '../types';
import { MOCK_CATALOG } from '../data/mockCatalog';
import { rankRecommendations } from './recommendation/scoring';

export interface TurnAnalysisResult {
  empathetic_reflection: string;
  slider_adjustments: Partial<CurrentItchProfile>;
  confidence: number;
  ready_for_recommendation: boolean;
}

export interface FeedbackAnalysisResult {
  summary: string;
  negative_signal: {
    attribute: string;
    direction: 'too_high' | 'too_low';
  };
  slider_delta: Partial<Record<keyof CurrentItchProfile, number>>;
}

export async function analyzeDiscoveryTurn(
  message: string,
  currentProfile: CurrentItchProfile,
  history: Array<{ sender: string; message: string }>
): Promise<TurnAnalysisResult> {
  try {
    const res = await fetch('/api/discovery/analyze-turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, currentProfile, history }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API error, using client fallback', e);
  }

  // Client-side fallback
  const lower = message.toLowerCase();
  const adjustments: Partial<CurrentItchProfile> = {};
  let reflection = "I'm hearing what you need right now.";
  let confidence = 0.6;

  if (lower.includes('fried') || lower.includes('tired') || lower.includes('exhausted')) {
    adjustments.cognitive_load = 2;
    adjustments.comfort = 8;
    reflection = "Understood. Low cognitive burden, maximum ease.";
    confidence = 0.8;
  } else if (lower.includes('restless') || lower.includes('stimulation') || lower.includes('dopamine')) {
    adjustments.stimulation = 9;
    adjustments.pacing = 9;
    adjustments.hook_strength = 9;
    reflection = "Locking in: high stimulation, immediate hook.";
    confidence = 0.8;
  }

  return {
    empathetic_reflection: reflection,
    slider_adjustments: adjustments,
    confidence,
    ready_for_recommendation: confidence >= 0.75,
  };
}

export async function interpretNoButFeedback(
  feedback: string,
  currentProfile: CurrentItchProfile,
  currentMediaTitle: string
): Promise<FeedbackAnalysisResult> {
  try {
    const res = await fetch('/api/feedback/no-but', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback, currentProfile, currentMediaTitle }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API error for no-but feedback, using fallback', e);
  }

  // Client-side fallback
  const lower = feedback.toLowerCase();
  const delta: Partial<Record<keyof CurrentItchProfile, number>> = {};
  let summary = "Adjusting the recommendation profile.";
  let negative_signal: { attribute: string; direction: 'too_high' | 'too_low' } = {
    attribute: 'general',
    direction: 'too_high',
  };

  if (lower.includes('too serious') || lower.includes('lighter')) {
    negative_signal = { attribute: 'seriousness', direction: 'too_high' };
    delta.emotional_intensity = -3;
    delta.humor = 3;
    delta.comfort = 2;
    summary = "Softening the gravity—looking for lighter vibes.";
  } else if (lower.includes('too long') || lower.includes('shorter')) {
    negative_signal = { attribute: 'runtime', direction: 'too_high' };
    delta.commitment_tolerance = -3;
    summary = "Shortening the commitment horizon.";
  } else if (lower.includes('more comedy') || lower.includes('funny')) {
    negative_signal = { attribute: 'humor', direction: 'too_low' };
    delta.humor = 4;
    summary = "Pumping up the laughs.";
  } else if (lower.includes('darker')) {
    negative_signal = { attribute: 'darkness', direction: 'too_low' };
    delta.emotional_intensity = 3;
    delta.stakes = 2;
    summary = "Steering toward darker, grittier territory.";
  }

  return {
    summary,
    negative_signal,
    slider_delta: delta,
  };
}

export async function fetchCatalog(type?: string, query?: string): Promise<MediaItem[]> {
  try {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (query) params.set('q', query);

    const res = await fetch(`/api/media?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data.items || [];
    }
  } catch {
    // fallback
  }

  let items = [...MOCK_CATALOG];
  if (type && type !== 'all') {
    items = items.filter((m) => m.type === type);
  }
  if (query && query.trim()) {
    const q = query.toLowerCase();
    items = items.filter((m) => m.title.toLowerCase().includes(q) || m.tagline.toLowerCase().includes(q));
  }
  return items;
}

export function rankClientSide(
  itchProfile: CurrentItchProfile,
  userTaste: UserTasteProfile,
  candidates: MediaItem[] = MOCK_CATALOG
): {
  bestMatch: ScoredMediaItem;
  backup: ScoredMediaItem;
  wildcard: ScoredMediaItem;
  allRanked: ScoredMediaItem[];
} {
  return rankRecommendations(candidates, itchProfile, userTaste);
}
