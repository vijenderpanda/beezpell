import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BookOpen, Play, Star, Zap, Flame, Library, Volume2, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const LearnerHome = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState(user?.difficulty_default || 'medium');

  // Get the latest story from this learner's classroom
  const { data: latestStory } = useQuery({
    queryKey: ['latest-story', user?.classroom_id],
    queryFn: async () => {
      const res = await axios.get('/api/stories', { params: { classroom_id: user.classroom_id } });
      return res.data?.[0] || null;
    },
    enabled: !!user?.classroom_id,
  });

  // Difficulty levels available based on age + learning support
  const difficultyLevels = (() => {
    const levels = [{ key: 'easy', label: 'Easy', desc: '4-7 letters', emoji: '🌱' }];
    if (!user?.learning_support && (user?.age >= 7 || !user?.age)) {
      levels.push({ key: 'medium', label: 'Medium', desc: '6-10 letters', emoji: '🌿' });
    }
    if (!user?.learning_support && (user?.age >= 9 || !user?.age)) {
      levels.push({ key: 'tricky', label: 'Tricky', desc: '8+ letters', emoji: '🌳' });
    }
    return levels;
  })();

  const startQuiz = () => {
    if (!latestStory) return;
    // Filter words by selected difficulty
    const tierMap = { easy: 'easy', medium: 'medium', tricky: 'hard' };
    const filteredWords = latestStory.words?.filter(w => {
      if (difficulty === 'easy') return w.tier === 'easy';
      if (difficulty === 'medium') return ['easy', 'medium'].includes(w.tier);
      return true; // tricky shows all
    }) || latestStory.words || [];

    navigate('/quiz', {
      state: {
        words: filteredWords.length > 0 ? filteredWords : latestStory.words,
        sourceType: 'story',
        storyId: latestStory.id,
        tier: difficulty,
        guideName: user?.created_by_name || '',
      }
    });
  };

  // Fetch story with words
  const { data: storyWithWords } = useQuery({
    queryKey: ['story-words', latestStory?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/stories/${latestStory.id}`);
      return res.data;
    },
    enabled: !!latestStory?.id,
  });

  const story = storyWithWords || latestStory;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 sm:px-6 py-3 sm:py-5 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-2xl sm:text-3xl">{user?.avatar || '🐝'}</div>
          <div>
            <h2 className="font-bold text-gray-800 text-sm sm:text-base">{user?.name}</h2>
            <p className="text-[10px] sm:text-xs text-gray-400">Grade {user?.grade || '?'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="stat-pill bg-amber-light">
            <Star className="w-3.5 h-3.5 text-amber" />
            <span className="font-bold text-amber text-xs sm:text-sm">{user?.stars || 0}</span>
          </div>
          <div className="stat-pill bg-primary-light">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="font-bold text-primary text-xs sm:text-sm">{user?.xp || 0} XP</span>
          </div>
          {user?.streak_days > 0 && (
            <div className="stat-pill bg-coral-light">
              <Flame className="w-3.5 h-3.5 text-coral" />
              <span className="font-bold text-coral text-xs sm:text-sm">{user.streak_days}🔥</span>
            </div>
          )}
          <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-300 hover:text-gray-500 ml-1 sm:ml-2 touch-target flex items-center justify-center">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12 safe-bottom">
        {/* Story Banner */}
        {story && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 mb-6 bg-gradient-to-r from-primary-light to-white border-l-4 border-primary">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{story.cover_emoji || '📖'}</div>
                <div className="flex-1">
                  <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">📚 New from your Guide</p>
                  <h3 className="text-lg font-bold text-gray-800">{story.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">By {story.author} · {story.words?.length || '?'} words to learn</p>
                  <button onClick={() => navigate(`/stories/${story.id}`)}
                    className="text-sm text-primary font-bold mt-2 hover:underline">Read the story →</button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Difficulty Selector */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Difficulty</h3>
          <div className="flex gap-3">
            {difficultyLevels.map(level => (
              <button
                key={level.key}
                onClick={() => setDifficulty(level.key)}
                className={`flex-1 p-3 rounded-xl text-center transition-all ${
                  difficulty === level.key
                    ? 'bg-white shadow-card border-2 border-primary'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-white hover:shadow-sm'
                }`}
              >
                <div className="text-2xl mb-1">{level.emoji}</div>
                <div className="font-bold text-sm text-gray-700">{level.label}</div>
                <div className="text-xs text-gray-400">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Quiz — the primary CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Button
            onClick={startQuiz}
            disabled={!story?.words?.length}
            className="w-full py-4 sm:py-6 text-lg sm:text-xl gap-2 sm:gap-3 shadow-2xl"
          >
            <Play className="w-7 h-7 fill-current" />
            Start Word Journey
          </Button>
          {!story?.words?.length && (
            <p className="text-center text-sm text-gray-400 mt-2">Waiting for your Guide to upload a story...</p>
          )}
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/library')}>
            <div className="flex items-center gap-3">
              <Library className="w-5 h-5 text-primary" />
              <span className="font-bold text-gray-700 text-sm">My Library</span>
            </div>
          </Card>
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/progress')}>
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber" />
              <span className="font-bold text-gray-700 text-sm">My Progress</span>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LearnerHome;
