const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, '../../', process.env.DB_PATH)
  : path.join(__dirname, 'beezpell.db');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

const schema = `
-- =============================================
-- USERS: Guide or Learner (+ admin)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  password_hash TEXT,
  google_id TEXT UNIQUE,
  provider TEXT DEFAULT 'local',
  role TEXT NOT NULL DEFAULT 'learner',
  year_of_birth INTEGER,
  age INTEGER,
  grade INTEGER,
  avatar TEXT DEFAULT '🐝',
  avatar_url TEXT,
  pin TEXT,
  school_id TEXT,
  classroom_id TEXT,
  class_code TEXT,
  created_by TEXT,
  -- Learner settings
  learning_support INTEGER DEFAULT 0,
  reverse_enabled INTEGER DEFAULT 1,
  drag_drop_mode INTEGER DEFAULT 0,
  difficulty_default TEXT DEFAULT 'medium',
  -- Stats
  xp INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  gems INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active TEXT,
  -- Adaptive
  learning_style TEXT,
  reverse_aptitude REAL DEFAULT 0.0,
  preferred_tier TEXT,
  sessions_analysed INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  is_first_login INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- SCHOOLS
-- =============================================
CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  school_code TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- CLASSROOMS: one per grade per Guide
-- =============================================
CREATE TABLE IF NOT EXISTS classrooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  class_code TEXT UNIQUE NOT NULL,
  guide_id TEXT NOT NULL,
  school_id TEXT,
  grade INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- STORIES
-- =============================================
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  cover_emoji TEXT DEFAULT '📖',
  source_type TEXT NOT NULL,
  source_url TEXT,
  full_text TEXT NOT NULL,
  grade_level INTEGER,
  is_public INTEGER DEFAULT 0,
  class_code TEXT,
  classroom_id TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- WORD LISTS
-- =============================================
CREATE TABLE IF NOT EXISTS word_lists (
  id TEXT PRIMARY KEY,
  story_id TEXT,
  word TEXT NOT NULL,
  tier TEXT NOT NULL,
  grade_level INTEGER,
  source_type TEXT DEFAULT 'story',
  phonetic TEXT,
  syllables TEXT,
  syllable_count INTEGER,
  definition TEXT,
  example_sentence TEXT,
  vowel_positions TEXT,
  consonant_positions TEXT,
  reverse_word TEXT,
  difficulty_score REAL DEFAULT 0.5,
  memory_anchor TEXT,
  approved INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- WORD PROGRESS
-- =============================================
CREATE TABLE IF NOT EXISTS word_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  word_list_id TEXT NOT NULL,
  interval_days INTEGER DEFAULT 1,
  ease_factor REAL DEFAULT 2.5,
  repetitions INTEGER DEFAULT 0,
  next_review TEXT,
  forward_attempts INTEGER DEFAULT 0,
  forward_correct INTEGER DEFAULT 0,
  reverse_attempts INTEGER DEFAULT 0,
  reverse_correct INTEGER DEFAULT 0,
  best_time_ms INTEGER,
  avg_time_ms INTEGER,
  hint_count INTEGER DEFAULT 0,
  mastered INTEGER DEFAULT 0,
  mastered_at TEXT,
  UNIQUE(user_id, word_list_id)
);

-- =============================================
-- QUIZ SESSIONS
-- =============================================
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  story_id TEXT,
  tier TEXT,
  mode TEXT DEFAULT 'forward',
  total_words INTEGER NOT NULL,
  correct_count INTEGER DEFAULT 0,
  reverse_correct INTEGER DEFAULT 0,
  forward_correct INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  stars_earned INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  hint_used_count INTEGER DEFAULT 0,
  completed INTEGER DEFAULT 0,
  context_type TEXT,
  context_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- SESSION ATTEMPTS (per-stage results)
-- =============================================
CREATE TABLE IF NOT EXISTS session_attempts (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  word_list_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  direction TEXT NOT NULL,
  user_answer TEXT,
  correct INTEGER NOT NULL,
  hint_used INTEGER DEFAULT 0,
  time_taken_ms INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================
-- BADGES
-- =============================================
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL,
  context TEXT DEFAULT 'all'
);

-- =============================================
-- USER BADGES
-- =============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, badge_id)
);

-- =============================================
-- LEADERBOARD ENTRIES
-- =============================================
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  context_type TEXT NOT NULL,
  context_id TEXT NOT NULL,
  stars INTEGER DEFAULT 0,
  total_score REAL DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  avg_time_ms REAL DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  period TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, context_type, context_id, period)
);

-- =============================================
-- ADAPTIVE EVENTS
-- =============================================
CREATE TABLE IF NOT EXISTS adaptive_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
`;

function initDb() {
  db.exec(schema);
  console.log('Database schema initialized.');
}

module.exports = { db, initDb };
