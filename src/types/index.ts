export type MediaType = 'anime' | 'manga' | 'book' | 'game';

export interface MediaExperienceFingerprint {
  stimulation: number;          // 1 (ambient/chill) - 10 (overdrive)
  cognitive_load: number;       // 1 (brain-off) - 10 (destroy me)
  emotional_intensity: number;  // 1 (lighthearted) - 10 (heart-wrenching)
  comfort: number;              // 1 (unsettling/gritty) - 10 (pure warm blanket)
  novelty: number;              // 1 (familiar comfort tropes) - 10 (surreal/bizarre)
  immersion: number;            // 1 (casual pick-up) - 10 (total world absorption)
  pacing: number;               // 1 (meditative slow-burn) - 10 (relentless adrenaline)
  mystery: number;              // 1 (open-faced) - 10 (puzzle box)
  humor: number;                // 1 (grim/serious) - 10 (unhinged absurdity)
  character_attachment: number; // 1 (plot/mechanics focus) - 10 (ride-or-die cast)
  predictability: number;       // 1 (shock twists) - 10 (cozy formula)
  world_building: number;       // 1 (intimate room) - 10 (vast lore bible)
  hook_strength: number;        // 1 (slow simmer) - 10 (instant chokehold)
  commitment: number;           // 1 (single snack) - 10 (multi-year hyperfixation)
  stakes: number;               // 1 (low stakes cozy) - 10 (multiversal collapse)
}

export interface MediaItem {
  id: string;
  source: 'anilist' | 'thetvdb' | 'googlebooks' | 'openlibrary' | 'igdb' | 'curated';
  source_id: string;
  title: string;
  type: MediaType;
  tagline: string;
  description: string;
  release_date: string;
  status: 'Finished' | 'Releasing' | 'Classic' | 'Stand-alone';
  runtime_estimate: string;
  cover_image: string;
  backdrop_image?: string;
  genres: string[];
  themes: string[];
  content_warnings?: string[];
  experience: MediaExperienceFingerprint;
  metadata: {
    creator?: string;
    publisher?: string;
    rating?: number;
    year?: number;
    platform_or_format?: string;
  };
}

export interface CurrentItchProfile {
  stimulation: number;          // 1 - 10
  cognitive_load: number;       // 1 - 10
  commitment_tolerance: number; // 1 - 10
  emotional_intensity: number;  // 1 - 10
  pacing: number;               // 1 - 10
  novelty: number;              // 1 - 10
  immersion: number;            // 1 - 10
  mystery: number;              // 1 - 10
  humor: number;                // 1 - 10
  predictability: number;       // 1 - 10
  stakes: number;               // 1 - 10
  character_attachment: number; // 1 - 10
  hook_strength: number;        // 1 - 10
  comfort: number;              // 1 - 10
  world_building?: number;      // 1 - 10
  desired_session_length?: 'bite_sized' | 'short' | 'medium' | 'deep_dive';
  preferred_media: MediaType[]; // empty array = 'Everything'
}

export interface UserTasteProfile {
  id: string;
  likes: string[];
  dislikes: string[];
  favorite_media_types: MediaType[];
  pace_bias: 'any' | 'slow_burn' | 'relentless';
  cognitive_bias: 'any' | 'brain_off' | 'thinker';
  interaction_history: {
    liked: string[];
    disliked: string[];
    finished: string[];
    dropped: string[];
    saved: string[];
    feedback_notes: {
      mediaId: string;
      mediaTitle: string;
      type: 'no_but' | 'loved' | 'dropped';
      note: string;
      inferredAdjustment: Record<string, string | number>;
      timestamp: number;
    }[];
  };
}

export interface DiscoveryQuestion {
  id: string;
  dimension: keyof CurrentItchProfile | 'general_vibe' | 'media_preference';
  prompt: string;
  subtext?: string;
  options: {
    id: string;
    label: string;
    icon?: string;
    subtitle?: string;
    sliderEffects: Partial<CurrentItchProfile>;
  }[];
}

export interface ConversationTurn {
  id: string;
  sender: 'ai' | 'user';
  message: string;
  questionId?: string;
  selectedOptionId?: string;
  inferredDelta?: Partial<CurrentItchProfile>;
  timestamp: number;
}

export interface ScoredMediaItem {
  media: MediaItem;
  overall_score: number; // 0 - 100
  breakdown: {
    current_itch_match: number;
    experience_match: number;
    semantic_similarity: number;
    long_term_taste: number;
    discovery_bonus: number;
  };
  explanation: string;
  why_this: string;
  possible_mismatch?: string;
  role: 'best_match' | 'backup' | 'wildcard';
}

export interface RecommendationSession {
  id: string;
  created_at: number;
  itch_profile: CurrentItchProfile;
  turns: ConversationTurn[];
  recommendations: {
    bestMatch: ScoredMediaItem;
    backup: ScoredMediaItem;
    wildcard: ScoredMediaItem;
  };
  status: 'active' | 'refined' | 'saved' | 'completed';
}

export interface NegativeSignal {
  dimension?: keyof CurrentItchProfile;
  direction?: 'too_high' | 'too_low';
  attribute?: string;
  rawText: string;
}
