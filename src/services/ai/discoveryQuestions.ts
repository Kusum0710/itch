import { CurrentItchProfile, DiscoveryQuestion } from '../../types';

export const DISCOVERY_QUESTIONS: DiscoveryQuestion[] = [
  // 1. Brain state / Cognitive capacity (Starting anchor)
  {
    id: 'brain_state',
    dimension: 'cognitive_load',
    prompt: "How's your brain feeling right now?",
    subtext: "Be honest—there's zero shame in wanting complete mindless fluff.",
    options: [
      {
        id: 'fried',
        label: '🪫 Fried',
        subtitle: 'Please do not make me think.',
        sliderEffects: { cognitive_load: 2, stimulation: 4, comfort: 8, pacing: 6 },
      },
      {
        id: 'restless',
        label: '😵 Restless',
        subtitle: 'Bored and fidgety; need dopamine.',
        sliderEffects: { cognitive_load: 3, stimulation: 9, pacing: 9, hook_strength: 9 },
      },
      {
        id: 'fine',
        label: '😐 Just fine',
        subtitle: 'Normal bandwidth. Open to standard flow.',
        sliderEffects: { cognitive_load: 5, stimulation: 6, pacing: 6 },
      },
      {
        id: 'curious',
        label: '🧠 Curious & alert',
        subtitle: 'Ready to unravel a thread.',
        sliderEffects: { cognitive_load: 8, mystery: 8, immersion: 8 },
      },
      {
        id: 'stimulation_craving',
        label: '⚡ I NEED stimulation',
        subtitle: 'Fast, loud, punchy, or absurd.',
        sliderEffects: { stimulation: 10, pacing: 9, hook_strength: 10, stakes: 7 },
      },
    ],
  },

  // 2. Desired experience / Psychological payoff
  {
    id: 'desired_payoff',
    dimension: 'general_vibe',
    prompt: 'What kind of payoff would feel satisfying right now?',
    subtext: 'What do you want to feel when you look up from it?',
    options: [
      {
        id: 'comfort',
        label: 'Warm comfort',
        subtitle: 'Like a blanket and hot tea.',
        sliderEffects: { comfort: 10, emotional_intensity: 4, stakes: 2, pacing: 3 },
      },
      {
        id: 'dopamine',
        label: 'Quick dopamine',
        subtitle: 'Rapid gratification, fast feedback.',
        sliderEffects: { stimulation: 9, pacing: 9, cognitive_load: 3, hook_strength: 9 },
      },
      {
        id: 'curiosity',
        label: 'Curiosity & wonder',
        subtitle: 'Make me say "wait, what happens next?!"',
        sliderEffects: { mystery: 9, novelty: 8, immersion: 8 },
      },
      {
        id: 'emotion',
        label: 'Heartstring tug',
        subtitle: 'I want to care about characters deeply.',
        sliderEffects: { emotional_intensity: 8, character_attachment: 9 },
      },
      {
        id: 'weird',
        label: 'Something weird & fresh',
        subtitle: 'Break my tropes. Surprise me.',
        sliderEffects: { novelty: 10, predictability: 1, stimulation: 8 },
      },
      {
        id: 'escape',
        label: 'Total escape',
        subtitle: 'Suck me into a foreign universe.',
        sliderEffects: { immersion: 10, world_building: 9, commitment_tolerance: 6 },
      },
    ],
  },

  // 3. Commitment tolerance
  {
    id: 'commitment',
    dimension: 'commitment_tolerance',
    prompt: 'How much commitment can you handle tonight?',
    subtext: 'Low stakes single sitting, or a multi-week deep dive?',
    options: [
      {
        id: 'bite_sized',
        label: '20–30 minutes',
        subtitle: 'Quick hit, zero obligation to return.',
        sliderEffects: { commitment_tolerance: 2, desired_session_length: 'bite_sized' },
      },
      {
        id: 'tonight',
        label: 'One sitting / Tonight',
        subtitle: 'A movie, novella, or a tight 6–10 ep arc.',
        sliderEffects: { commitment_tolerance: 4, desired_session_length: 'short' },
      },
      {
        id: 'few_days',
        label: 'A few days / Weekend',
        subtitle: 'A gripping season, novel, or campaign.',
        sliderEffects: { commitment_tolerance: 6, desired_session_length: 'medium' },
      },
      {
        id: 'obsession',
        label: 'I want a new obsession',
        subtitle: 'Take over my life. I have zero self-control.',
        sliderEffects: { commitment_tolerance: 9, immersion: 9, desired_session_length: 'deep_dive' },
      },
    ],
  },

  // 4. Emotional intensity
  {
    id: 'emotional_intensity',
    dimension: 'emotional_intensity',
    prompt: 'Do you want to feel something heavy, or keep it light?',
    subtext: "Are we laughing, vibing, or crying into a pillow?",
    options: [
      {
        id: 'keep_light',
        label: 'Keep it light & easy',
        subtitle: 'No angst, no existential dread.',
        sliderEffects: { emotional_intensity: 2, comfort: 8, humor: 8 },
      },
      {
        id: 'make_me_laugh',
        label: 'Make me laugh',
        subtitle: 'Humor, banter, or outright absurdity.',
        sliderEffects: { humor: 9, emotional_intensity: 4, cognitive_load: 3 },
      },
      {
        id: 'make_me_care',
        label: 'Make me care',
        subtitle: 'Tender moments, real stakes, warm heart.',
        sliderEffects: { emotional_intensity: 7, character_attachment: 8 },
      },
      {
        id: 'hurt_me',
        label: 'Emotionally wreck me',
        subtitle: 'Give me catharsis and bittersweet ache.',
        sliderEffects: { emotional_intensity: 10, comfort: 1, stakes: 7 },
      },
      {
        id: 'just_entertain',
        label: 'Just pure fun spectacle',
        subtitle: 'Stunt scenes, clever turns, thrills.',
        sliderEffects: { stimulation: 8, emotional_intensity: 5, pacing: 8 },
      },
    ],
  },

  // 5. Pacing / Hook type
  {
    id: 'hook_type',
    dimension: 'pacing',
    prompt: 'What kind of hook are you looking for?',
    subtext: 'How quickly does it need to earn your attention?',
    options: [
      {
        id: 'grab_immediately',
        label: 'Grab me in 60 seconds',
        subtitle: 'Zero slow burn allowed right now.',
        sliderEffects: { hook_strength: 10, pacing: 9 },
      },
      {
        id: 'slowly_pull',
        label: 'Atmospheric slow simmer',
        subtitle: 'Let the world breathe before things ignite.',
        sliderEffects: { hook_strength: 4, pacing: 3, immersion: 8 },
      },
      {
        id: 'mystery_hook',
        label: 'Drop an impossible question',
        subtitle: 'Hook me through curiosity and secrets.',
        sliderEffects: { mystery: 9, cognitive_load: 6 },
      },
    ],
  },

  // 6. Ambivalence / Targeted Tie-Breaker
  {
    id: 'comfort_vs_stimulation',
    dimension: 'stimulation',
    prompt: "I've narrowed down your frequency, but tell me:",
    subtext: "Are we soothing your nervous system, or waking it up?",
    options: [
      {
        id: 'soothe',
        label: '🌿 Soothe it (Cozy / Quiet / Low-key)',
        subtitle: 'Lower my heart rate.',
        sliderEffects: { comfort: 9, stimulation: 3, stakes: 2 },
      },
      {
        id: 'wake_up',
        label: '⚡ Wake it up (Electric / Snappy / Dopamine)',
        subtitle: 'Jolt me out of my rut.',
        sliderEffects: { stimulation: 9, pacing: 8, hook_strength: 9 },
      },
    ],
  },
];

export const INITIAL_ITCH_PROFILE: CurrentItchProfile = {
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
  desired_session_length: 'short',
  preferred_media: [], // empty = Everything
};
