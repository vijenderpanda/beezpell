const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../db/supabase');

// Start a new quiz session
router.post('/session', async (req, res) => {
  const { user_id, source_type, story_id, tier, total_words } = req.body;
  const id = uuidv4();

  const { error } = await supabase.from('quiz_sessions').insert({
    id, user_id, source_type, story_id: story_id || null, tier: tier || null, total_words
  });
  if (error) { console.error('Quiz session error:', error); return res.status(500).json({ error: error.message }); }

  res.status(201).json({ id });
});

// Submit a word attempt
router.post('/attempt', async (req, res) => {
  const { session_id, user_id, word_list_id, stage, direction, user_answer, correct, hint_used, time_taken_ms } = req.body;
  const attemptId = uuidv4();

  await supabase.from('session_attempts').insert({
    id: attemptId, session_id, word_list_id, stage: stage || direction, direction,
    user_answer: user_answer || '', correct: correct ? 1 : 0, hint_used: hint_used ? 1 : 0, time_taken_ms
  });

  // Resolve user_id from session if not sent
  let userId = user_id;
  if (!userId && session_id) {
    const { data: session } = await supabase.from('quiz_sessions').select('user_id').eq('id', session_id).single();
    userId = session?.user_id;
  }

  // Update Word Progress (SM-2)
  if (direction === 'forward' && userId) {
    const { data: progress } = await supabase.from('word_progress').select('*').eq('user_id', userId).eq('word_list_id', word_list_id).single();

    if (!progress) {
      await supabase.from('word_progress').insert({ id: uuidv4(), user_id: userId, word_list_id });
    }

    // Simple progress update (increment attempts/correct)
    if (progress) {
      await supabase.from('word_progress').update({
        forward_attempts: (progress.forward_attempts || 0) + 1,
        forward_correct: (progress.forward_correct || 0) + (correct ? 1 : 0),
      }).eq('id', progress.id);
    }
  } else if (direction === 'reverse' && userId) {
    const { data: progress } = await supabase.from('word_progress').select('*').eq('user_id', userId).eq('word_list_id', word_list_id).single();
    if (progress) {
      await supabase.from('word_progress').update({
        reverse_attempts: (progress.reverse_attempts || 0) + 1,
        reverse_correct: (progress.reverse_correct || 0) + (correct ? 1 : 0),
      }).eq('id', progress.id);
    }
  }

  res.json({ success: true });
});

// Complete session
router.post('/session/:id/complete', async (req, res) => {
  const { xp_earned, stars_earned, duration_seconds, correct_count, forward_correct, reverse_correct } = req.body;

  await supabase.from('quiz_sessions').update({
    completed: 1, xp_earned, stars_earned: stars_earned || 0, duration_seconds, correct_count, forward_correct, reverse_correct
  }).eq('id', req.params.id);

  // Update user XP + stars
  const { data: session } = await supabase.from('quiz_sessions').select('user_id').eq('id', req.params.id).single();
  if (session) {
    const { data: user } = await supabase.from('users').select('xp, stars').eq('id', session.user_id).single();
    if (user) {
      await supabase.from('users').update({
        xp: (user.xp || 0) + (xp_earned || 0),
        stars: (user.stars || 0) + (stars_earned || 0)
      }).eq('id', session.user_id);
    }
  }

  res.json({ success: true });
});

module.exports = router;
