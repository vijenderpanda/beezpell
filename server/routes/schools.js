const express = require('express');
const router = express.Router();
const { supabase } = require('../db/supabase');

router.get('/', async (req, res) => {
  const { data } = await supabase.from('schools').select('*');
  res.json(data || []);
});

module.exports = router;
