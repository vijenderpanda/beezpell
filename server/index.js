require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const storiesRoutes = require('./routes/stories');
const quizRoutes = require('./routes/quiz');
const wordsRoutes = require('./routes/words');
const classroomsRoutes = require('./routes/classrooms');
const familiesRoutes = require('./routes/families');
const leaderboardRoutes = require('./routes/leaderboard');
const schoolsRoutes = require('./routes/schools');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stories', storiesRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/words', wordsRoutes);
app.use('/api/classrooms', classroomsRoutes);
app.use('/api/families', familiesRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/schools', schoolsRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke on the server!' });
});

// Export for both local dev and Vercel serverless
module.exports = app;

// Only listen when running directly (not when imported by Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`🐝 Beezpell server running on port ${PORT}`);
  });
}
