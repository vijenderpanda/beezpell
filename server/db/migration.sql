-- =============================================
-- Word Journey Lab v2 — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor)
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT,
  google_id TEXT UNIQUE,
  provider TEXT DEFAULT 'local',
  role TEXT NOT NULL DEFAULT 'learner',
  year_of_birth INT,
  age INT,
  grade INT,
  avatar TEXT DEFAULT '🐝',
  avatar_url TEXT,
  pin TEXT,
  school_id TEXT,
  classroom_id TEXT,
  class_code TEXT,
  created_by TEXT,
  learning_support INT DEFAULT 0,
  reverse_enabled INT DEFAULT 1,
  drag_drop_mode INT DEFAULT 0,
  difficulty_default TEXT DEFAULT 'medium',
  xp INT DEFAULT 0,
  stars INT DEFAULT 0,
  gems INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  last_active TIMESTAMPTZ,
  learning_style TEXT,
  reverse_aptitude REAL DEFAULT 0.0,
  preferred_tier TEXT,
  sessions_analysed INT DEFAULT 0,
  is_active INT DEFAULT 1,
  is_first_login INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SCHOOLS
-- =============================================
CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  address TEXT,
  school_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CLASSROOMS
-- =============================================
CREATE TABLE IF NOT EXISTS classrooms (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  class_code TEXT UNIQUE NOT NULL,
  guide_id TEXT NOT NULL,
  school_id TEXT,
  grade INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- STORIES
-- =============================================
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  author TEXT,
  cover_emoji TEXT DEFAULT '📖',
  source_type TEXT NOT NULL,
  source_url TEXT,
  full_text TEXT NOT NULL,
  grade_level INT,
  is_public INT DEFAULT 0,
  class_code TEXT,
  classroom_id TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WORD LISTS
-- =============================================
CREATE TABLE IF NOT EXISTS word_lists (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  story_id TEXT,
  word TEXT NOT NULL,
  tier TEXT NOT NULL,
  grade_level INT,
  source_type TEXT DEFAULT 'story',
  phonetic TEXT,
  syllables TEXT,
  syllable_count INT,
  definition TEXT,
  example_sentence TEXT,
  vowel_positions TEXT,
  consonant_positions TEXT,
  reverse_word TEXT,
  difficulty_score REAL DEFAULT 0.5,
  memory_anchor TEXT,
  approved INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- WORD PROGRESS
-- =============================================
CREATE TABLE IF NOT EXISTS word_progress (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  word_list_id TEXT NOT NULL,
  interval_days INT DEFAULT 1,
  ease_factor REAL DEFAULT 2.5,
  repetitions INT DEFAULT 0,
  next_review TIMESTAMPTZ,
  forward_attempts INT DEFAULT 0,
  forward_correct INT DEFAULT 0,
  reverse_attempts INT DEFAULT 0,
  reverse_correct INT DEFAULT 0,
  best_time_ms INT,
  avg_time_ms INT,
  hint_count INT DEFAULT 0,
  mastered INT DEFAULT 0,
  mastered_at TIMESTAMPTZ,
  UNIQUE(user_id, word_list_id)
);

-- =============================================
-- QUIZ SESSIONS
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  story_id TEXT,
  tier TEXT,
  mode TEXT DEFAULT 'forward',
  total_words INT NOT NULL,
  correct_count INT DEFAULT 0,
  reverse_correct INT DEFAULT 0,
  forward_correct INT DEFAULT 0,
  xp_earned INT DEFAULT 0,
  stars_earned INT DEFAULT 0,
  duration_seconds INT,
  hint_used_count INT DEFAULT 0,
  completed INT DEFAULT 0,
  context_type TEXT,
  context_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SESSION ATTEMPTS
-- =============================================
CREATE TABLE IF NOT EXISTS session_attempts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  session_id TEXT NOT NULL,
  word_list_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  direction TEXT NOT NULL,
  user_answer TEXT,
  correct INT NOT NULL,
  hint_used INT DEFAULT 0,
  time_taken_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BADGES
-- =============================================
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  condition_type TEXT NOT NULL,
  condition_value INT NOT NULL,
  context TEXT DEFAULT 'all'
);

-- =============================================
-- USER BADGES
-- =============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- =============================================
-- LEADERBOARD ENTRIES
-- =============================================
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  context_type TEXT NOT NULL,
  context_id TEXT NOT NULL,
  stars INT DEFAULT 0,
  total_score REAL DEFAULT 0,
  correct_count INT DEFAULT 0,
  total_attempts INT DEFAULT 0,
  avg_time_ms REAL DEFAULT 0,
  streak_days INT DEFAULT 0,
  period TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, context_type, context_id, period)
);

-- =============================================
-- ADAPTIVE EVENTS
-- =============================================
CREATE TABLE IF NOT EXISTS adaptive_events (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security (RLS) — disable for now (service key bypasses)
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON classrooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON stories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON word_lists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON word_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON quiz_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON session_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON badges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON user_badges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON leaderboard_entries FOR ALL USING (true) WITH CHECK (true);
