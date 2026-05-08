import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Gem, Flame, BookOpen, ChevronRight, LogOut, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const ChildHome = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: stories = [] } = useQuery({
    queryKey: ['child-stories'],
    queryFn: async () => {
      const res = await axios.get('/api/stories', { params: { class_code: user?.family_id } });
      // Also try to get family stories
      const res2 = await axios.get('/api/stories', { params: { created_by: user?.created_by } });
      const all = [...res.data, ...res2.data];
      const unique = [...new Map(all.map(s => [s.id, s])).values()];
      return unique;
    }
  });

  // Milestone tracker
  const gemGoals = [10, 25, 50, 100, 250];
  const currentGems = user?.gems || 0;
  const nextGoal = gemGoals.find(g => g > currentGems) || gemGoals[gemGoals.length - 1];
  const prevGoal = gemGoals[gemGoals.indexOf(nextGoal) - 1] || 0;
  const milestoneProgress = Math.min(100, ((currentGems - prevGoal) / (nextGoal - prevGoal)) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-light/30 to-background">
      <header className="px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl shadow-card">{user?.avatar || '🦋'}</div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hi, {user?.name}! 🌟</h1>
            <p className="text-xs text-gray-400">{user?.family?.name || 'My Adventure'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white px-4 py-2 rounded-full shadow-card">
            <Gem className="w-5 h-5 text-purple fill-purple" />
            <span className="font-bold text-purple text-lg">{currentGems}</span>
          </div>
          <div className="flex items-center gap-1 bg-white px-4 py-2 rounded-full shadow-card">
            <Flame className="w-5 h-5 text-coral" />
            <span className="font-bold text-coral text-lg">{user?.streak_days || 0}</span>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-400 hover:text-gray-600 ml-2"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-8">
        {/* Gem Milestone Tracker */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-purple-light/50 to-purple-light/20 border-2 border-purple-light">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-purple flex items-center gap-2"><Gem className="w-5 h-5 fill-purple" /> Gem Journey</h3>
            <span className="text-sm font-bold text-purple">{currentGems} / {nextGoal}</span>
          </div>
          <div className="w-full h-4 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple to-purple/70 rounded-full transition-all duration-1000" style={{ width: `${milestoneProgress}%` }} />
          </div>
          <p className="text-xs text-purple/60 mt-2 font-medium">
            {nextGoal - currentGems} more gems to reach your next treasure! 💎
          </p>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link to="/museum">
            <Card className="p-8 text-center hover:shadow-lg transition-all cursor-pointer bg-amber-light/30 border-2 border-amber-light h-full">
              <div className="text-4xl mb-3">🏛️</div>
              <h3 className="font-bold text-gray-800">Word Museum</h3>
              <p className="text-xs text-gray-400 mt-1">See your treasures</p>
            </Card>
          </Link>
          <Link to="/progress">
            <Card className="p-8 text-center hover:shadow-lg transition-all cursor-pointer bg-primary-light/30 border-2 border-primary-light h-full">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="font-bold text-gray-800">My Progress</h3>
              <p className="text-xs text-gray-400 mt-1">Your amazing journey</p>
            </Card>
          </Link>
        </div>

        {/* Stories */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><BookOpen className="text-purple" /> My Stories</h2>
        <div className="space-y-3">
          {stories.map(story => (
            <Link key={story.id} to={`/stories/${story.id}`}>
              <Card className="flex items-center gap-4 p-4 hover:shadow-lg transition-all cursor-pointer mb-3">
                <div className="w-16 h-16 bg-purple-light rounded-2xl flex items-center justify-center text-3xl">{story.cover_emoji || '📖'}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg">{story.title}</h4>
                  <p className="text-sm text-gray-400">{story.author}</p>
                </div>
                <Button variant="secondary" className="text-sm">Read & Play</Button>
              </Card>
            </Link>
          ))}
          {stories.length === 0 && (
            <Card className="p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-400 font-medium text-lg">Your parent will add stories for you soon!</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildHome;
