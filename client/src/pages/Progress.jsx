import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Flame, Trophy, Calendar, Zap, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Progress = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: journey, isLoading } = useQuery({
    queryKey: ['journey', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await axios.get('/api/words/journey', { params: { user_id: user.id } });
      return res.data;
    },
    enabled: !!user?.id
  });

  // Heatmap calculation
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const activity = journey?.activity?.find(a => a.date === dateStr);
    return {
      date: dateStr,
      active: !!activity
    };
  }).reverse();

  const level = Math.floor((user?.xp || 0) / 100) + 1;
  const nextLevelXp = level * 100;
  const currentLevelXp = user?.xp || 0;
  const progressPercent = ((currentLevelXp % 100) / 100) * 100;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <Button variant="ghost" onClick={() => navigate('/')} className="-ml-4 gap-2">
            <ChevronLeft className="w-5 h-5" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Your Journey</h1>
          <div className="w-10" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* XP & Level */}
          <Card className="col-span-2 flex items-center gap-8 p-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="58" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                <circle 
                  cx="64" cy="64" r="58" fill="none" stroke="#D97706" strokeWidth="12" 
                  strokeDasharray="364" 
                  strokeDashoffset={364 - (364 * progressPercent) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-amber">{level}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Level</span>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-1 text-gray-800">Word Seeker</h2>
              <p className="text-gray-500 font-medium">{user?.xp || 0} Total XP</p>
              <div className="mt-4 flex gap-2">
                <div className="px-3 py-1 bg-amber-light text-amber rounded-full text-xs font-bold">
                  {nextLevelXp - currentLevelXp} XP to Level {level + 1}
                </div>
              </div>
            </div>
          </Card>

          {/* Streak */}
          <Card className="bg-primary text-white p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Flame className="w-10 h-10 fill-white" />
            </div>
            <div className="text-5xl font-bold mb-1">{user?.streak_days || 0}</div>
            <div className="text-sm font-bold uppercase tracking-widest opacity-80">Day Streak</div>
          </Card>
        </div>

        {/* Activity Heatmap */}
        <Card className="mb-12 p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Calendar className="text-primary w-5 h-5" /> Last 30 Days
          </h3>
          <div className="flex flex-wrap gap-2">
            {days.map((day, i) => (
              <div 
                key={i}
                title={day.date}
                className={`w-6 h-6 rounded-sm transition-colors ${
                  day.active ? 'bg-primary' : 'bg-gray-100'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-4 italic">Every teal square is a day you discovered a treasure.</p>
        </Card>

        {/* Badges Grid */}
        <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Trophy className="text-amber w-6 h-6" /> Badge Collection
        </h3>
        {isLoading ? (
          <p>Loading badges...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {journey?.badges?.map((badge, i) => (
              <Card 
                key={i} 
                className={`p-4 flex flex-col items-center text-center transition-all ${
                  badge.earned ? 'opacity-100 scale-100 shadow-md' : 'opacity-30 grayscale scale-95 border border-dashed shadow-none'
                }`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-[10px] font-bold uppercase tracking-tight leading-tight">{badge.name}</div>
              </Card>
            ))}
            {(!journey?.badges || journey.badges.length === 0) && (
              <div className="col-span-full text-center text-gray-500 italic py-4">
                No badges found. Master some words to earn them!
              </div>
            )}
          </div>
        )}

        {/* Adaptive Insights */}
        <Card className="mt-12 bg-purple-light/30 border-2 border-purple-light p-8">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple">
            <Zap className="w-5 h-5 fill-purple" /> Magical Insights
          </h3>
          <p className="text-purple/80 leading-relaxed italic">
            "You seem to have a superpower for seeing whole words at once! Your reverse spelling is exceptionally fast, which means you're building a very strong visual word museum in your mind."
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
