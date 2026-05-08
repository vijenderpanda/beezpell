const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');

router.get('/stats', async (req, res) => {
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: storyCount } = await supabase.from('stories').select('*', { count: 'exact', head: true });
  const { count: sessionCount } = await supabase.from('quiz_sessions').select('*', { count: 'exact', head: true });

  res.json({ users: userCount || 0, stories: storyCount || 0, sessions: sessionCount || 0 });
});

router.get('/users', async (req, res) => {
  const { data } = await supabase.from('users').select('id, name, username, email, role, grade, xp, stars, streak_days, last_active, created_at').order('created_at', { ascending: false });
  res.json(data || []);
});

module.exports = router;
