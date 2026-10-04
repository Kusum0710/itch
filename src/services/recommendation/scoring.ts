import { CurrentItchProfile, MediaExperienceFingerprint, MediaItem, ScoredMediaItem, UserTasteProfile } from '../../types';

export interface ScoringWeights {
  currentItchMatch: number;      // default 0.35
  experienceMatch: number;       // default 0.25
  semanticSimilarity: number;    // default 0.20
  longTermTaste: number;         // default 0.15
  discoveryBonus: number;        // default 0.05
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  currentItchMatch: 0.35,
  experienceMatch: 0.25,
  semanticSimilarity: 0.20,
  longTermTaste: 0.15,
  discoveryBonus: 0.05,
};

/**
 * Calculates normalized similarity (0 to 1) between two 1-10 scalar dimensions.
 */
function dimensionSimilarity(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.max(0, 1 - diff / 9);
}

/**
 * Calculates the Experience Match across all shared fingerprint dimensions.
 */
export function calculateExperienceMatch(
  itch: CurrentItchProfile,
  exp: MediaExperienceFingerprint
): number {
  const keys: (keyof MediaExperienceFingerprint)[] = [
    'stimulation',
    'cognitive_load',
    'emotional_intensity',
    'comfort',
    'novelty',
    'immersion',
    'pacing',
    'mystery',
    'humor',
    'character_attachment',
    'predictability',
    'stakes',
    'hook_strength',
  ];

  let totalSim = 0;
  for (const k of keys) {
    const itchVal = itch[k as keyof CurrentItchProfile] as number ?? 5;
    const expVal = exp[k] ?? 5;
    totalSim += dimensionSimilarity(itchVal, expVal);
  }

  return totalSim / keys.length;
}

/**
 * Calculates Current Itch Match, putting heavier emphasis on extreme cravings
 * (e.g. "Brain is fried" or "Need stimulation right now").
 */
export function calculateCurrentItchMatch(
  itch: CurrentItchProfile,
  exp: MediaExperienceFingerprint
): number {
  // Key critical dimensions that dominate immediate fatigue / energy state
  const criticalKeys: { key: keyof MediaExperienceFingerprint; weight: number }[] = [
    { key: 'stimulation', weight: 1.5 },
    { key: 'cognitive_load', weight: 1.8 },
    { key: 'commitment', weight: 1.4 },
    { key: 'pacing', weight: 1.3 },
    { key: 'hook_strength', weight: 1.3 },
    { key: 'emotional_intensity', weight: 1.2 },
    { key: 'comfort', weight: 1.1 },
  ];

  let weightedSum = 0;
  let totalWeight = 0;

  for (const { key, weight } of criticalKeys) {
    const itchVal = (key === 'commitment' ? itch.commitment_tolerance : itch[key as keyof CurrentItchProfile]) as number ?? 5;
    const expVal = exp[key] ?? 5;

    // Non-linear penalty if cognitive load demands way more than user's capacity
    let sim = dimensionSimilarity(itchVal, expVal);
    if (key === 'cognitive_load' && itchVal <= 3 && expVal >= 7) {
      sim *= 0.4; // heavy penalty for demanding high brain-power when user is exhausted
    }
    if (key === 'commitment' && itchVal <= 3 && expVal >= 7) {
      sim *= 0.5; // heavy penalty for long commitment when user wants a quick hit
    }

    weightedSum += sim * weight;
    totalWeight += weight;
  }

  return weightedSum / totalWeight;
}

/**
 * Calculates semantic similarity using keyword/theme matching against itch tendencies.
 */
export function calculateSemanticSimilarity(
  itch: CurrentItchProfile,
  item: MediaItem
): number {
  let score = 0.5; // baseline

  const allTags = [
    ...item.genres,
    ...item.themes,
    item.tagline.toLowerCase(),
    item.description.toLowerCase(),
  ].map((t) => t.toLowerCase());

  // Check fast/snappy keywords
  if (itch.pacing >= 7 || itch.hook_strength >= 8) {
    if (allTags.some((t) => t.includes('action') || t.includes('fast') || t.includes('thriller') || t.includes('roguelike'))) {
      score += 0.2;
    }
  }

  // Check humor keywords
  if (itch.humor >= 7) {
    if (allTags.some((t) => t.includes('comedy') || t.includes('humor') || t.includes('absurd') || t.includes('snarky'))) {
      score += 0.2;
    }
  }

  // Check cozy/comfort keywords
  if (itch.comfort >= 8 || itch.cognitive_load <= 3) {
    if (allTags.some((t) => t.includes('slice of life') || t.includes('cozy') || t.includes('gentle') || t.includes('wholesome'))) {
      score += 0.2;
    }
  }

  // Check mystery/puzzle keywords
  if (itch.mystery >= 7) {
    if (allTags.some((t) => t.includes('mystery') || t.includes('detective') || t.includes('puzzle') || t.includes('secrets'))) {
      score += 0.2;
    }
  }

  return Math.min(1.0, score);
}

/**
 * Calculates long-term taste affinity.
 */
export function calculateLongTermTaste(
  taste: UserTasteProfile,
  item: MediaItem
): number {
  let score = 0.6; // baseline neutral

  const itemTraits = [
    ...item.genres.map((g) => g.toLowerCase()),
    ...item.themes.map((t) => t.toLowerCase()),
  ];

  // Check likes
  for (const like of taste.likes) {
    if (itemTraits.some((trait) => trait.includes(like.toLowerCase()))) {
      score += 0.1;
    }
  }

  // Check dislikes
  for (const dislike of taste.dislikes) {
    if (itemTraits.some((trait) => trait.includes(dislike.toLowerCase()))) {
      score -= 0.25;
    }
  }

  // Check interaction history
  if (taste.interaction_history.liked.includes(item.id)) {
    score += 0.15;
  }
  if (taste.interaction_history.disliked.includes(item.id) || taste.interaction_history.dropped.includes(item.id)) {
    score -= 0.4;
  }

  return Math.max(0.1, Math.min(1.0, score));
}

/**
 * Generates an empathetic, grounded "Why this?" explanation based on actual itch values.
 */
export function generateRecommendationExplanation(
  itch: CurrentItchProfile,
  item: MediaItem,
  role: 'best_match' | 'backup' | 'wildcard'
): { explanation: string; why_this: string; possible_mismatch?: string } {
  let whyParts: string[] = [];

  if (itch.cognitive_load <= 3 && item.experience.cognitive_load <= 4) {
    whyParts.push(`Your brain doesn't have the bandwidth for high cognitive friction right now, and this is effortless to absorb without feeling hollow.`);
  } else if (itch.cognitive_load >= 7 && item.experience.cognitive_load >= 7) {
    whyParts.push(`You asked to be mentally challenged, and this respects your intellect with layered ideas and zero hand-holding.`);
  }

  if (itch.stimulation >= 8 && item.experience.stimulation >= 8) {
    whyParts.push(`You wanted direct stimulation and momentum; it hooks you in the opening minutes and keeps the adrenaline running.`);
  } else if (itch.comfort >= 8 && item.experience.comfort >= 8) {
    whyParts.push(`You're craving comfort and reassurance; this wraps you in a gentle, warm atmosphere that lowers your heart rate.`);
  }

  if (itch.commitment_tolerance <= 3 && item.experience.commitment <= 3) {
    whyParts.push(`You wanted zero commitment pressure—you can complete or enjoy this in a single evening or short burst.`);
  } else if (itch.commitment_tolerance >= 7) {
    whyParts.push(`You have the appetite for a sprawling, immersive world that you can completely sink into.`);
  }

  if (whyParts.length === 0) {
    whyParts.push(`This aligns cleanly with the balance of energy, pacing, and tone you dialed in.`);
  }

  const why_this = whyParts.join(' ');

  let roleExplanation = '';
  if (role === 'best_match') {
    roleExplanation = `Fits your immediate brain state closer than anything else in the catalog right now.`;
  } else if (role === 'backup') {
    roleExplanation = `A universally loved, reliable alternative with slightly smoother edges if you want a safer bet.`;
  } else {
    roleExplanation = `A wildcard curveball from ${item.type.toUpperCase()}: might sound different on paper, but scratches the exact same emotional frequency.`;
  }

  // Generate warning/possible mismatch
  let possible_mismatch: string | undefined = undefined;
  if (item.content_warnings && item.content_warnings.length > 0) {
    possible_mismatch = `Heads up: contains ${item.content_warnings.join(', ').toLowerCase()}.`;
  } else if (item.experience.pacing <= 3 && itch.pacing >= 6) {
    possible_mismatch = `Pacing is on the leisurely side; give it a scene to settle in.`;
  } else if (item.experience.emotional_intensity >= 8 && itch.emotional_intensity <= 5) {
    possible_mismatch = `Carries a heavy emotional punch near the climax.`;
  }

  return {
    explanation: roleExplanation,
    why_this,
    possible_mismatch,
  };
}

/**
 * Main 6-stage recommendation pipeline.
 */
export function rankRecommendations(
  candidates: MediaItem[],
  itch: CurrentItchProfile,
  taste: UserTasteProfile,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): {
  bestMatch: ScoredMediaItem;
  backup: ScoredMediaItem;
  wildcard: ScoredMediaItem;
  allRanked: ScoredMediaItem[];
} {
  // STAGE 1: Hard filtering
  const filtered = candidates.filter((item) => {
    // Media type filter
    if (itch.preferred_media && itch.preferred_media.length > 0) {
      if (!itch.preferred_media.includes(item.type)) return false;
    }

    // Exclude previously dropped or strongly disliked
    if (taste.interaction_history.disliked.includes(item.id)) return false;

    // Hard constraint on commitment if user strictly wants bite-sized
    if (itch.desired_session_length === 'bite_sized' && item.experience.commitment > 4) {
      return false;
    }

    return true;
  });

  const pool = filtered.length >= 3 ? filtered : candidates; // fallback if filters too strict

  // STAGE 2-5: Scoring
  const scoredItems: ScoredMediaItem[] = pool.map((item) => {
    const current_itch_match = calculateCurrentItchMatch(itch, item.experience);
    const experience_match = calculateExperienceMatch(itch, item.experience);
    const semantic_similarity = calculateSemanticSimilarity(itch, item);
    const long_term_taste = calculateLongTermTaste(taste, item);
    const discovery_bonus = item.experience.novelty >= 7 ? 0.9 : 0.4;

    const rawScore =
      weights.currentItchMatch * current_itch_match +
      weights.experienceMatch * experience_match +
      weights.semanticSimilarity * semantic_similarity +
      weights.longTermTaste * long_term_taste +
      weights.discoveryBonus * discovery_bonus;

    const overall_score = Math.round(Math.min(99, Math.max(62, rawScore * 100)));

    return {
      media: item,
      overall_score,
      breakdown: {
        current_itch_match: Math.round(current_itch_match * 100),
        experience_match: Math.round(experience_match * 100),
        semantic_similarity: Math.round(semantic_similarity * 100),
        long_term_taste: Math.round(long_term_taste * 100),
        discovery_bonus: Math.round(discovery_bonus * 100),
      },
      explanation: '',
      why_this: '',
      role: 'best_match',
    };
  });

  // Sort descending by overall score
  scoredItems.sort((a, b) => b.overall_score - a.overall_score);

  // STAGE 6: Triad Selection (Best Match, Backup, Wildcard)
  const bestMatchCandidate = scoredItems[0];
  const { explanation: bestExpl, why_this: bestWhy, possible_mismatch: bestWarn } =
    generateRecommendationExplanation(itch, bestMatchCandidate.media, 'best_match');

  const bestMatch: ScoredMediaItem = {
    ...bestMatchCandidate,
    role: 'best_match',
    explanation: bestExpl,
    why_this: bestWhy,
    possible_mismatch: bestWarn,
  };

  // Find Backup: Must be high scoring, slightly higher comfort or different medium
  const backupCandidate = scoredItems.find(
    (item) =>
      item.media.id !== bestMatch.media.id &&
      (item.media.experience.comfort >= 6 || item.media.metadata.rating! >= 8.5)
  ) || scoredItems[1] || bestMatch;

  const { explanation: bkpExpl, why_this: bkpWhy, possible_mismatch: bkpWarn } =
    generateRecommendationExplanation(itch, backupCandidate.media, 'backup');

  const backup: ScoredMediaItem = {
    ...backupCandidate,
    role: 'backup',
    explanation: bkpExpl,
    why_this: bkpWhy,
    possible_mismatch: bkpWarn,
  };

  // Find Wildcard: Prefer high novelty or a different medium from best match
  const wildcardCandidate = scoredItems.find(
    (item) =>
      item.media.id !== bestMatch.media.id &&
      item.media.id !== backup.media.id &&
      (item.media.type !== bestMatch.media.type || item.media.experience.novelty >= 8)
  ) || scoredItems[2] || scoredItems[1] || bestMatch;

  const { explanation: wildExpl, why_this: wildWhy, possible_mismatch: wildWarn } =
    generateRecommendationExplanation(itch, wildcardCandidate.media, 'wildcard');

  const wildcard: ScoredMediaItem = {
    ...wildcardCandidate,
    role: 'wildcard',
    explanation: wildExpl,
    why_this: wildWhy,
    possible_mismatch: wildWarn,
  };

  return {
    bestMatch,
    backup,
    wildcard,
    allRanked: scoredItems,
  };
}
