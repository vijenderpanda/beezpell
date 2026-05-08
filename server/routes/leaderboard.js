const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');

router.get('/', async (req, res) => {
  const { context_type, context_id, period } = req.query;
  let query = supabase.from('leaderboard_entries').select('*, users(name, avatar, grade)').order('total_score', { ascending: false });

  if (context_type) query = query.eq('context_type', context_type);
  if (context_id) query = query.eq('context_id', context_id);
  if (period) query = query.eq('period', period || 'weekly');

  const { data, error } = await query.limit(50);
  res.json(data || []);
});

module.exports = router;
