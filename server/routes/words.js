const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');

router.get('/', async (req, res) => {
  const { data } = await supabase.from('word_lists').select('*').order('created_at', { ascending: false }).limit(100);
  res.json(data || []);
});

router.get('/story/:storyId', async (req, res) => {
  const { data } = await supabase.from('word_lists').select('*').eq('story_id', req.params.storyId);
  res.json(data || []);
});

module.exports = router;
