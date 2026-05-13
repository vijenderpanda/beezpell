const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');

// Get classrooms for a guide
router.get('/', async (req, res) => {
  const { guide_id } = req.query;
  const authHeader = req.headers.authorization;
  let userId = guide_id;

  if (!userId && authHeader) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'beezpell-dev-secret-change-me');
      userId = decoded.id;
    } catch (e) {}
  }

  if (!userId) return res.json([]);
  const { data } = await supabase.from('classrooms').select('*').eq('guide_id', userId);
  res.json(data || []);
});

// Get classroom detail with students
router.get('/:id', async (req, res) => {
  const { data: classroom } = await supabase.from('classrooms').select('*').eq('id', req.params.id).single();
  if (!classroom) return res.status(404).json({ error: 'Classroom not found' });

  const { data: students } = await supabase.from('users').select('*').eq('classroom_id', classroom.id).eq('role', 'learner');

  const studentIds = (students || []).map(s => s.id);
  
  let progressData = [];
  if (studentIds.length > 0) {
    const { data } = await supabase.from('word_progress').select('user_id, forward_attempts, forward_correct, reverse_attempts, reverse_correct, mastered').in('user_id', studentIds);
    progressData = data || [];
  }

  const enrichedStudents = (students || []).map(s => {
    const sProgress = progressData.filter(p => p.user_id === s.id);
    
    let totalAttempts = 0;
    let totalCorrect = 0;
    let masteredCount = 0;

    sProgress.forEach(p => {
      totalAttempts += (p.forward_attempts || 0) + (p.reverse_attempts || 0);
      totalCorrect += (p.forward_correct || 0) + (p.reverse_correct || 0);
      // If the row is explicitly mastered, or they got it right at least twice
      if (p.mastered === 1 || (p.forward_correct || 0) >= 2) {
        masteredCount++;
      }
    });

    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    return { 
      ...s, 
      mastered: masteredCount,
      accuracy,
      password_hash: undefined, 
      pin: undefined 
    };
  });

  res.json({ ...classroom, students: enrichedStudents });
});

module.exports = router;
