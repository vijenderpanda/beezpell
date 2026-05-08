const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
const { supabase } = require('../db/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'beezpell-dev-secret-change-me';
const signToken = (user) => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
const safeUser = (u) => { if (!u) return null; const { password_hash, pin, ...safe } = u; return safe; };

function verifyGoogleToken(token) {
  return new Promise((resolve, reject) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const payload = JSON.parse(data);
          if (payload.error_description) return reject(new Error(payload.error_description));
          resolve(payload);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// ══════════════════════════════════════════════
// GOOGLE SSO
// ══════════════════════════════════════════════
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing Google credential' });

  try {
    let payload;
    if (credential === 'MOCK_GOOGLE_TOKEN') {
      payload = { sub: 'mock-guide-google-id', email: 'johnson@school.com', name: 'Ms. Johnson', picture: '' };
      console.log('🔧 Mock SSO login (existing Guide):', payload.email);
    } else if (credential === 'MOCK_NEW_USER') {
      const rnd = Math.random().toString(36).slice(2, 7);
      payload = { sub: `mock-new-${rnd}`, email: `newuser_${rnd}@test.com`, name: `Test User ${rnd.toUpperCase()}`, picture: '' };
      console.log('🆕 Mock SSO login (NEW user):', payload.email);
    } else {
      payload = await verifyGoogleToken(credential);
    }
    const { sub: googleId, email, name, picture } = payload;

    // Find by google_id
    let { data: user } = await supabase.from('users').select('*').eq('google_id', googleId).single();

    if (!user) {
      // Find by email
      const { data: emailUser } = await supabase.from('users').select('*').eq('email', email).single();
      if (emailUser) {
        await supabase.from('users').update({ google_id: googleId, avatar_url: picture, provider: 'google' }).eq('id', emailUser.id);
        const { data: updated } = await supabase.from('users').select('*').eq('id', emailUser.id).single();
        user = updated;
      } else {
        // Create new user
        const id = uuidv4();
        const username = email.split('@')[0] + '_' + Math.random().toString(36).slice(2, 6);
        const { data: created, error: createErr } = await supabase.from('users').insert({
          id, name, username, email, google_id: googleId, provider: 'google', role: 'guide', avatar_url: picture, is_first_login: 1
        }).select().single();
        if (createErr) throw createErr;
        user = created;
      }
    }

    await supabase.from('users').update({ last_active: new Date().toISOString() }).eq('id', user.id);

    const needsRoleChoice = user.is_first_login === 1;
    const needsOnboarding = user.role === 'guide' && !user.classroom_id && !user.is_first_login;

    res.json({ user: safeUser(user), token: signToken(user), needsRoleChoice, needsOnboarding });
  } catch (err) {
    console.error('Google SSO error:', err.message, err.stack);
    res.status(401).json({ error: err.message || 'Google authentication failed' });
  }
});

// ══════════════════════════════════════════════
// CHOOSE ROLE
// ══════════════════════════════════════════════
router.post('/choose-role', async (req, res) => {
  const { userId, role } = req.body;
  if (!['guide', 'learner'].includes(role)) return res.status(400).json({ error: 'Role must be guide or learner' });

  await supabase.from('users').update({ role, is_first_login: 0 }).eq('id', userId);
  const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();

  res.json({ user: safeUser(user), token: signToken(user) });
});

// ══════════════════════════════════════════════
// LEARNER LOGIN
// ══════════════════════════════════════════════
router.post('/learner-login', async (req, res) => {
  const { class_code, name, pin } = req.body;
  if (!class_code || !name || !pin) return res.status(400).json({ error: 'Class code, name, and PIN are required' });

  const { data: classroom } = await supabase.from('classrooms').select('*').eq('class_code', class_code.toUpperCase()).single();
  if (!classroom) return res.status(404).json({ error: 'Classroom not found. Check your code.' });

  let { data: user } = await supabase.from('users').select('*').ilike('name', name.trim()).eq('classroom_id', classroom.id).single();

  if (user) {
    if (user.pin !== pin) return res.status(401).json({ error: 'Wrong PIN. Try again.' });
  } else {
    const id = uuidv4();
    const username = name.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Math.random().toString(36).slice(2, 5);
    const grade = classroom.grade || 4;
    const age = grade + 5;
    const reverseEnabled = age >= 8 ? 1 : 0;
    const dragDrop = age < 8 ? 1 : 0;
    const difficulty = age < 7 ? 'easy' : 'medium';

    const { data: created, error: createErr } = await supabase.from('users').insert({
      id, name: name.trim(), username, role: 'learner', pin, classroom_id: classroom.id, class_code: classroom.class_code,
      grade, age, year_of_birth: 2026 - age, difficulty_default: difficulty, reverse_enabled: reverseEnabled,
      drag_drop_mode: dragDrop, is_first_login: 0, created_by: classroom.guide_id
    }).select().single();
    if (createErr) throw createErr;
    user = created;
  }

  await supabase.from('users').update({ last_active: new Date().toISOString() }).eq('id', user.id);
  const { data: guide } = await supabase.from('users').select('name').eq('id', classroom.guide_id).single();

  res.json({ user: safeUser(user), token: signToken(user), classroom, guideName: guide?.name || 'Your Guide' });
});

// ══════════════════════════════════════════════
// GUIDE ONBOARDING
// ══════════════════════════════════════════════
router.post('/onboard-guide', async (req, res) => {
  const { userId, classroomName, grade } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const genCode = () => Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const classCode = genCode();
  const classId = uuidv4();
  const gradeNum = parseInt(grade) || 4;

  try {
    await supabase.from('classrooms').insert({ id: classId, name: classroomName || `Grade ${gradeNum}`, class_code: classCode, guide_id: userId, grade: gradeNum });
    await supabase.from('users').update({ classroom_id: classId, is_first_login: 0 }).eq('id', userId);
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();

    res.json({ success: true, user: safeUser(user), token: signToken(user), classroom: { id: classId, name: classroomName || `Grade ${gradeNum}`, class_code: classCode, grade: gradeNum } });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Failed to create classroom' });
  }
});

// ══════════════════════════════════════════════
// DEMO LOGIN
// ══════════════════════════════════════════════
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const { data: user } = await supabase.from('users').select('*').eq('username', username).single();
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!user.password_hash) return res.status(400).json({ error: 'Use Google sign-in or classroom code' });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid password' });

  await supabase.from('users').update({ last_active: new Date().toISOString() }).eq('id', user.id);
  res.json({ user: safeUser(user), token: signToken(user) });
});

// ══════════════════════════════════════════════
// ME
// ══════════════════════════════════════════════
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    const { data: user } = await supabase.from('users').select('*').eq('id', decoded.id).single();
    if (!user) return res.status(404).json({ error: 'User not found' });

    let classroom = null;
    if (user.classroom_id) {
      const { data } = await supabase.from('classrooms').select('*').eq('id', user.classroom_id).single();
      classroom = data;
    }

    let classrooms = [];
    if (user.role === 'guide') {
      const { data } = await supabase.from('classrooms').select('*').eq('guide_id', user.id);
      classrooms = data || [];
    }

    res.json({ user: safeUser(user), classroom, classrooms });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
