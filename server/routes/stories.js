const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../db/supabase');

const multer = require('multer');
const pdf = require('pdf-parse');
const upload = multer({ storage: multer.memoryStorage() });

// Helper to extract text from buffer (PDF/TXT)
async function extractTextFromFile(file) {
  if (file.mimetype === 'application/pdf') {
    const data = await pdf(file.buffer);
    return data.text;
  }
  return file.buffer.toString('utf-8');
}

// Unified Ingest Route (handles URL, Text, and File)
router.post('/ingest', upload.single('file'), async (req, res) => {
  try {
    const { title, author, source_type, url, full_text, grade_level, is_public, class_code, classroom_id, created_by } = req.body;
    
    let textToAnalyze = full_text || '';

    // 1. Handle File Upload (PDF/TXT)
    if (source_type === 'doc' && req.file) {
      textToAnalyze = await extractTextFromFile(req.file);
    } 
    // 2. Handle URL Scraping
    else if (source_type === 'url' && url) {
      try {
        const fetch = require('node-fetch');
        const cheerio = require('cheerio');
        const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
        const html = await response.text();
        const $ = cheerio.load(html);
        $('script, style, nav, footer, header, aside, iframe, form').remove();
        textToAnalyze = $('article, main, .content, .post, .story, body').first().text().replace(/\s+/g, ' ').trim();
      } catch (err) {
        console.error('URL scrape error:', err.message);
        return res.status(400).json({ error: 'Could not fetch URL content' });
      }
    }

    if (!textToAnalyze || textToAnalyze.length < 20) {
      return res.status(400).json({ error: 'Story text too short or could not be extracted' });
    }

    const storyId = uuidv4();
    const isPublicInt = (is_public === 'true' || is_public === true || is_public === 1) ? 1 : 0;

    // Save Story to Supabase
    const { error: storyErr } = await supabase.from('stories').insert({
      id: storyId, title, author, source_type: source_type || 'pasted', source_url: url || null,
      full_text: textToAnalyze.slice(0, 50000), grade_level: parseInt(grade_level) || 4, 
      is_public: isPublicInt, class_code: class_code || null,
      classroom_id: classroom_id || null, created_by
    });

    if (storyErr) throw storyErr;

    // AI Word Extraction
    const { extractSpellingWords, analyzeWords } = require('../services/claude');
    const candidates = extractSpellingWords(textToAnalyze, parseInt(grade_level) || 4);
    const analyzed = await analyzeWords(candidates, grade_level, textToAnalyze);

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

    res.status(201).json({ id: storyId, title, wordCount });
  } catch (err) {
    console.error('Ingest error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Legacy POST / for backward compatibility
router.post('/', async (req, res) => {
  res.redirect(307, '/api/stories/ingest');
});

// Delete story
router.delete('/:id', async (req, res) => {
  await supabase.from('word_lists').delete().eq('story_id', req.params.id);
  await supabase.from('stories').delete().eq('id', req.params.id);
  res.json({ success: true });
});

module.exports = router;
