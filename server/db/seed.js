/**
 * Seed script for Supabase PostgreSQL
 * Run: node server/db/seed.js
 * Requires SUPABASE_URL and SUPABASE_SERVICE_KEY in .env
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const hash = (pw) => bcrypt.hashSync(pw, 10);

async function seed() {
  console.log('🌱 Seeding Supabase database...\n');

  // IDs
  const adminId = uuidv4();
  const guideId = uuidv4();
  const guide2Id = uuidv4();
  const schoolId = uuidv4();
  const class4Id = uuidv4();
  const class5Id = uuidv4();
  const class3Id = uuidv4();
  const learner1Id = uuidv4();
  const learner2Id = uuidv4();
  const learner3Id = uuidv4();
  const learner4Id = uuidv4();
  const learner5Id = uuidv4();

  // ═══ ADMIN ═══
  await supabase.from('users').insert({
    id: adminId, name: 'Admin', username: 'admin', email: 'admin@wordjourney.com',
    password_hash: hash('admin123'), role: 'admin', is_first_login: 0
  });
  console.log('✅ Admin created (admin / admin123)');

  // ═══ SCHOOL (optional entity) ═══
  await supabase.from('schools').insert({
    id: schoolId, name: 'Greenfield Academy', school_code: 'SCH-GRFLD', address: '42 Oak Road, London'
  });

  // ═══ GUIDES ═══
  await supabase.from('users').insert({
    id: guideId, name: 'Ms. Johnson', username: 'ms_johnson', email: 'johnson@school.com',
    password_hash: hash('guide123'), google_id: 'mock-guide-google-id', role: 'guide',
    year_of_birth: 1985, school_id: schoolId, classroom_id: class4Id, is_first_login: 0
  });
  await supabase.from('users').insert({
    id: guide2Id, name: 'Sarah Parker', username: 'sarah_parker', email: 'sarah@home.com',
    password_hash: hash('guide123'), google_id: 'mock-guide2-google-id', role: 'guide',
    year_of_birth: 1990, classroom_id: class3Id, is_first_login: 0
  });
  console.log('✅ Guides created (Ms. Johnson, Sarah Parker)');

  // ═══ CLASSROOMS ═══
  await supabase.from('classrooms').insert([
    { id: class4Id, name: 'Grade 4', class_code: 'BEE-4GRD', guide_id: guideId, school_id: schoolId, grade: 4 },
    { id: class5Id, name: 'Grade 5', class_code: 'FOX-5GRD', guide_id: guideId, school_id: schoolId, grade: 5 },
    { id: class3Id, name: 'Parker Family', class_code: 'FAM-PRKR', guide_id: guide2Id, grade: 3 },
  ]);
  console.log('✅ Classrooms created (BEE-4GRD, FOX-5GRD, FAM-PRKR)');

  // ═══ LEARNERS ═══
  const learners = [
    { id: learner1Id, name: 'Ayaana', username: 'ayaana', pin: '1111', classroom_id: class4Id, class_code: 'BEE-4GRD', grade: 4, age: 10, year_of_birth: 2016, difficulty_default: 'medium', reverse_enabled: 1, drag_drop_mode: 0, created_by: guideId },
    { id: learner2Id, name: 'Zain', username: 'zain', pin: '2222', classroom_id: class4Id, class_code: 'BEE-4GRD', grade: 4, age: 10, year_of_birth: 2016, difficulty_default: 'medium', reverse_enabled: 1, drag_drop_mode: 0, created_by: guideId },
    { id: learner3Id, name: 'Priya', username: 'priya', pin: '3333', classroom_id: class5Id, class_code: 'FOX-5GRD', grade: 5, age: 11, year_of_birth: 2015, difficulty_default: 'medium', reverse_enabled: 1, drag_drop_mode: 0, created_by: guideId },
    { id: learner4Id, name: 'Lily', username: 'lily', pin: '1234', classroom_id: class3Id, class_code: 'FAM-PRKR', grade: 1, age: 6, year_of_birth: 2020, difficulty_default: 'easy', reverse_enabled: 0, drag_drop_mode: 1, created_by: guide2Id },
    { id: learner5Id, name: 'Max', username: 'max', pin: '5678', classroom_id: class3Id, class_code: 'FAM-PRKR', grade: 3, age: 8, year_of_birth: 2018, difficulty_default: 'medium', learning_support: 1, reverse_enabled: 0, drag_drop_mode: 0, created_by: guide2Id },
  ];

  for (const l of learners) {
    await supabase.from('users').insert({ ...l, role: 'learner', is_first_login: 0, xp: 0, stars: 0 });
  }
  console.log('✅ Learners created (Ayaana, Zain, Priya, Lily, Max)');

  // ═══ SAMPLE STORIES ═══
  const story1Id = uuidv4();
  const story2Id = uuidv4();

  await supabase.from('stories').insert([
    {
      id: story1Id, title: 'The Enchanted Forest', author: 'Story Bot', cover_emoji: '🌳',
      source_type: 'pasted', full_text: 'In the enchanted forest, mysterious creatures roamed among the ancient trees. The peculiar fox observed everything with extraordinary perception. Magnificent butterflies demonstrated remarkable agility...',
      grade_level: 4, classroom_id: class4Id, created_by: guideId
    },
    {
      id: story2Id, title: 'Ocean Adventures', author: 'Story Bot', cover_emoji: '🌊',
      source_type: 'pasted', full_text: 'The submarine descended into the breathtaking underwater kingdom. Spectacular coral formations created a magnificent landscape. Marine biologists discovered an extraordinary species...',
      grade_level: 3, classroom_id: class3Id, created_by: guide2Id
    },
  ]);

  // ═══ WORD LISTS ═══
  const words1 = [
    { word: 'enchanted', tier: 'medium', phonetic: '/ɪnˈtʃɑːntɪd/', syllables: 'en-chan-ted', syllable_count: 3, definition: 'Under a spell; magical', example_sentence: 'The enchanted forest glowed under the moonlight.', memory_anchor: '✨' },
    { word: 'mysterious', tier: 'hard', phonetic: '/mɪˈstɪəriəs/', syllables: 'mys-te-ri-ous', syllable_count: 4, definition: 'Difficult to understand or explain', example_sentence: 'A mysterious figure appeared at the edge of the forest.', memory_anchor: '🔮' },
    { word: 'creatures', tier: 'medium', phonetic: '/ˈkriːtʃəz/', syllables: 'crea-tures', syllable_count: 2, definition: 'Living things, especially animals', example_sentence: 'Strange creatures lived in the enchanted forest.', memory_anchor: '🦊' },
    { word: 'ancient', tier: 'medium', phonetic: '/ˈeɪnʃənt/', syllables: 'an-cient', syllable_count: 2, definition: 'Very old; from long ago', example_sentence: 'The ancient trees had stood for hundreds of years.', memory_anchor: '🏛️' },
    { word: 'peculiar', tier: 'hard', phonetic: '/pɪˈkjuːliə/', syllables: 'pe-cu-liar', syllable_count: 3, definition: 'Strange or unusual', example_sentence: 'The peculiar fox had bright blue eyes.', memory_anchor: '🤔' },
    { word: 'extraordinary', tier: 'hard', phonetic: '/ɪkˈstrɔːdnri/', syllables: 'ex-tra-or-di-na-ry', syllable_count: 6, definition: 'Very unusual or remarkable', example_sentence: 'The fox showed extraordinary intelligence.', memory_anchor: '🌟' },
    { word: 'forest', tier: 'easy', phonetic: '/ˈfɒrɪst/', syllables: 'for-est', syllable_count: 2, definition: 'A large area with many trees', example_sentence: 'We walked through the dark forest.', memory_anchor: '🌲' },
    { word: 'observed', tier: 'medium', phonetic: '/əbˈzɜːvd/', syllables: 'ob-served', syllable_count: 2, definition: 'Watched carefully', example_sentence: 'The scientist observed the experiment.', memory_anchor: '👁️' },
  ];

  const words2 = [
    { word: 'submarine', tier: 'medium', phonetic: '/ˌsʌbməˈriːn/', syllables: 'sub-ma-rine', syllable_count: 3, definition: 'A ship that travels underwater', example_sentence: 'The submarine dove deep into the ocean.', memory_anchor: '🚢' },
    { word: 'breathtaking', tier: 'hard', phonetic: '/ˈbreθteɪkɪŋ/', syllables: 'breath-ta-king', syllable_count: 3, definition: 'Amazingly beautiful', example_sentence: 'The view was absolutely breathtaking.', memory_anchor: '😮' },
    { word: 'spectacular', tier: 'hard', phonetic: '/spekˈtækjʊlə/', syllables: 'spec-tac-u-lar', syllable_count: 4, definition: 'Very impressive', example_sentence: 'They saw a spectacular sunset.', memory_anchor: '🎆' },
    { word: 'ocean', tier: 'easy', phonetic: '/ˈəʊʃn/', syllables: 'o-cean', syllable_count: 2, definition: 'A very large body of salt water', example_sentence: 'The ocean stretched to the horizon.', memory_anchor: '🌊' },
    { word: 'coral', tier: 'easy', phonetic: '/ˈkɒrəl/', syllables: 'cor-al', syllable_count: 2, definition: 'Hard material formed by tiny sea creatures', example_sentence: 'The coral reef was full of colourful fish.', memory_anchor: '🪸' },
    { word: 'discovered', tier: 'medium', phonetic: '/dɪˈskʌvəd/', syllables: 'dis-co-vered', syllable_count: 3, definition: 'Found something for the first time', example_sentence: 'They discovered a new species of fish.', memory_anchor: '🔍' },
  ];

  for (const w of words1) {
    await supabase.from('word_lists').insert({ id: uuidv4(), story_id: story1Id, ...w, grade_level: 4, difficulty_score: w.tier === 'easy' ? 0.3 : w.tier === 'medium' ? 0.5 : 0.8 });
  }
  for (const w of words2) {
    await supabase.from('word_lists').insert({ id: uuidv4(), story_id: story2Id, ...w, grade_level: 3, difficulty_score: w.tier === 'easy' ? 0.3 : w.tier === 'medium' ? 0.5 : 0.8 });
  }
  console.log('✅ Stories + words seeded');

  // ═══ BADGES ═══
  const badges = [
    { name: 'First Word', description: 'Complete your first word journey', icon: '🌱', rarity: 'common', condition_type: 'words_completed', condition_value: 1 },
    { name: 'Word Explorer', description: 'Complete 10 word journeys', icon: '🗺️', rarity: 'rare', condition_type: 'words_completed', condition_value: 10 },
    { name: 'Spelling Star', description: 'Get 5 perfect spellings in a row', icon: '⭐', rarity: 'epic', condition_type: 'streak', condition_value: 5 },
    { name: 'Reverse Master', description: 'Spell 10 words backwards correctly', icon: '🔄', rarity: 'legendary', condition_type: 'reverse_correct', condition_value: 10 },
  ];
  for (const b of badges) {
    await supabase.from('badges').insert({ id: uuidv4(), ...b });
  }
  console.log('✅ Badges seeded');

  console.log('\n🎉 Seeding complete!\n');
  console.log('Demo accounts:');
  console.log('  Admin:    admin / admin123');
  console.log('  Guide:    Sign in with Google (mock) or ms_johnson / guide123');
  console.log('  Learner:  BEE-4GRD / Ayaana / 1111');
  console.log('  Young:    FAM-PRKR / Lily / 1234');
  console.log('  Support:  FAM-PRKR / Max / 5678');
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
