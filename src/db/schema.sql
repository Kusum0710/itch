-- =========================================================================
-- ITCH DATABASE SCHEMA (Supabase PostgreSQL + pgvector)
-- =========================================================================

-- Enable pgvector extension for semantic similarity retrieval
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. MEDIA CATALOG
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(50) NOT NULL, -- 'anilist', 'thetvdb', 'googlebooks', 'igdb', 'curated'
    source_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('anime', 'manga', 'book', 'game')),
    tagline TEXT,
    description TEXT,
    release_date DATE,
    status VARCHAR(50),
    runtime VARCHAR(100),
    cover_image TEXT,
    backdrop_image TEXT,
    genres TEXT[] DEFAULT '{}',
    themes TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (source, source_id)
);

-- 3. MEDIA EXPERIENCE FINGERPRINT (Scale 1 to 10)
CREATE TABLE IF NOT EXISTS media_experience (
    media_id UUID PRIMARY KEY REFERENCES media(id) ON DELETE CASCADE,
    stimulation SMALLINT NOT NULL CHECK (stimulation BETWEEN 1 AND 10),
    cognitive_load SMALLINT NOT NULL CHECK (cognitive_load BETWEEN 1 AND 10),
    emotional_intensity SMALLINT NOT NULL CHECK (emotional_intensity BETWEEN 1 AND 10),
    comfort SMALLINT NOT NULL CHECK (comfort BETWEEN 1 AND 10),
    novelty SMALLINT NOT NULL CHECK (novelty BETWEEN 1 AND 10),
    immersion SMALLINT NOT NULL CHECK (immersion BETWEEN 1 AND 10),
    pacing SMALLINT NOT NULL CHECK (pacing BETWEEN 1 AND 10),
    mystery SMALLINT NOT NULL CHECK (mystery BETWEEN 1 AND 10),
    humor SMALLINT NOT NULL CHECK (humor BETWEEN 1 AND 10),
    character_attachment SMALLINT NOT NULL CHECK (character_attachment BETWEEN 1 AND 10),
    predictability SMALLINT NOT NULL CHECK (predictability BETWEEN 1 AND 10),
    world_building SMALLINT NOT NULL CHECK (world_building BETWEEN 1 AND 10),
    hook_strength SMALLINT NOT NULL CHECK (hook_strength BETWEEN 1 AND 10),
    commitment SMALLINT NOT NULL CHECK (commitment BETWEEN 1 AND 10),
    stakes SMALLINT NOT NULL CHECK (stakes BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. MEDIA EMBEDDINGS (pgvector 768 for gemini-embedding-2-preview or 1536 for OpenAI)
CREATE TABLE IF NOT EXISTS media_embeddings (
    media_id UUID PRIMARY KEY REFERENCES media(id) ON DELETE CASCADE,
    embedding vector(768),
    content_chunk TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast cosine vector similarity search
CREATE INDEX IF NOT EXISTS idx_media_embeddings_cosine
ON media_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 5. USER PREFERENCES (Long-term taste)
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    preference_data JSONB NOT NULL DEFAULT '{
      "likes": [],
      "dislikes": [],
      "favorite_media_types": ["anime", "manga", "book", "game"],
      "pace_bias": "any",
      "cognitive_bias": "any"
    }'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. RECOMMENDATION SESSIONS
CREATE TABLE IF NOT EXISTS recommendation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    session_state JSONB DEFAULT '{"status": "in_progress"}'::jsonb,
    current_itch_profile JSONB NOT NULL,
    best_match_id UUID REFERENCES media(id),
    backup_id UUID REFERENCES media(id),
    wildcard_id UUID REFERENCES media(id)
);

-- 7. USER INTERACTIONS & FEEDBACK
CREATE TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media(id) ON DELETE CASCADE,
    session_id UUID REFERENCES recommendation_sessions(id) ON DELETE SET NULL,
    interaction_type VARCHAR(50) NOT NULL CHECK (
      interaction_type IN ('liked', 'disliked', 'started', 'abandoned', 'finished', 'saved', 'rated', 'skipped', 'no_but')
    ),
    feedback JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Helper RPC function for semantic retrieval + experience distance matching
CREATE OR REPLACE FUNCTION match_media_by_itch(
    query_embedding vector(768),
    itch_stimulation INT,
    itch_cognitive_load INT,
    itch_emotional_intensity INT,
    itch_pacing INT,
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE (
    media_id UUID,
    title VARCHAR,
    media_type VARCHAR,
    similarity FLOAT,
    experience_distance FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id AS media_id,
        m.title,
        m.type AS media_type,
        1 - (me.embedding <=> query_embedding) AS similarity,
        SQRT(
            POWER(e.stimulation - itch_stimulation, 2) +
            POWER(e.cognitive_load - itch_cognitive_load, 2) +
            POWER(e.emotional_intensity - itch_emotional_intensity, 2) +
            POWER(e.pacing - itch_pacing, 2)
        ) AS experience_distance
    FROM media m
    JOIN media_experience e ON e.media_id = m.id
    LEFT JOIN media_embeddings me ON me.media_id = m.id
    WHERE (1 - (me.embedding <=> query_embedding)) > match_threshold
    ORDER BY similarity DESC, experience_distance ASC
    LIMIT match_count;
END;
$$;
