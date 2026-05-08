const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../db/supabase');

// Get stories (with optional filters)
router.get('/', async (req, res) => {
  const { created_by, classroom_id, class_code, is_public } = req.query;
  let query = supabase.from('stories').select('*').order('created_at', { ascending: false });

  if (created_by) query = query.eq('created_by', created_by);
  if (classroom_id) query = query.eq('classroom_id', classroom_id);
  if (class_code) query = query.eq('class_code', class_code);
  if (is_public) query = query.eq('is_public', 1);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// Get single story with words
router.get('/:id', async (req, res) => {
  const { data: story } = await supabase.from('stories').select('*').eq('id', req.params.id).single();
  if (!story) return res.status(404).json({ error: 'Story not found' });

  const { data: words } = await supabase.from('word_lists').select('*').eq('story_id', story.id);
  res.json({ ...story, words: words || [] });
});

// Create story
router.post('/', async (req, res) => {
  const { title, author, source_type, url, text, grade_level, is_public, class_code, classroom_id, created_by } = req.body;

  // Handle text extraction
  let final_text = text || '';
  if (source_type === 'url' && url) {
    try {
      const fetch = require('node-fetch');
      const cheerio = require('cheerio');
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
      const html = await response.text();
      const $ = cheerio.load(html);
      $('script, style, nav, footer, header, aside, iframe, form').remove();
      final_text = $('article, main, .content, .post, .story, body').first().text().replace(/\s+/g, ' ').trim().slice(0, 50000);
    } catch (err) {
      console.error('URL scrape error:', err.message);
      if (!text) return res.status(400).json({ error: 'Could not fetch URL content' });
    }
  }

  if (!final_text || final_text.length < 20) return res.status(400).json({ error: 'Story text too short' });

  const storyId = uuidv4();
  const isPublicInt = (is_public === 'true' || is_public === true || is_public === 1) ? 1 : 0;

  const { error: storyErr } = await supabase.from('stories').insert({
    id: storyId, title, author, source_type: source_type || 'pasted', source_url: url || null,
    full_text: final_text, grade_level, is_public: isPublicInt, class_code: class_code || null,
    classroom_id: classroom_id || null, created_by
  });
  if (storyErr) return res.status(500).json({ error: storyErr.message });

  // Extract words
  const { extractSpellingWords, analyzeWords } = require('../services/claude');
  const candidates = extractSpellingWords(final_text, parseInt(grade_level) || 4);
  console.log(`📝 Extracted ${candidates.length} candidates from "${title}"`);

  const analyzed = await analyzeWords(candidates, grade_level, final_text);
  let wordCount = 0;

  for (const w of analyzed) {
    const { error } = await supabase.from('word_lists').insert({
      id: uuidv4(), story_id: storyId, word: w.word, tier: w.tier, grade_level: parseInt(grade_level) || 4,
      phonetic: w.phonetic, syllables: w.syllables, syllable_count: w.syllable_count,
      definition: w.definition, example_sentence: w.example_sentence,
      difficulty_score: w.difficulty_score || 0.5, memory_anchor: '✨'
    });
    if (!error) wordCount++;
  }

  console.log(`📖 ${title}: ${wordCount} words saved`);
  res.status(201).json({ id: storyId, title, wordCount });
});

// Delete story
router.delete('/:id', async (req, res) => {
  await supabase.from('word_lists').delete().eq('story_id', req.params.id);
  await supabase.from('stories').delete().eq('id', req.params.id);
  res.json({ success: true });
});

module.exports = router;
