const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');

router.get('/', async (req, res) => {
  // Kept for legacy compatibility — families are now classrooms
  res.json([]);
});

module.exports = router;
