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

  res.json({ ...classroom, students: (students || []).map(s => ({ ...s, password_hash: undefined, pin: undefined })) });
});

module.exports = router;
