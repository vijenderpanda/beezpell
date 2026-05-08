import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BookOpen, Star, Trophy, Flame, ChevronRight, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const StudentHome = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: stories = [] } = useQuery({
    queryKey: ['student-stories'],
    queryFn: async () => {
      const res = await axios.get('/api/stories', { params: { class_code: user?.class_code } });
      return res.data;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-2xl">{user?.avatar || '🐝'}</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Hey, {user?.name}! 👋</h1>
            <p className="text-xs text-gray-400">{user?.classroom?.name || 'Your Classroom'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 mr-4">
            <div className="flex items-center gap-1 bg-amber-light px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 text-amber fill-amber" />
              <span className="font-bold text-amber text-sm">{user?.stars || 0}</span>
            </div>
            <div className="flex items-center gap-1 bg-primary-light px-3 py-1.5 rounded-full">
              <Flame className="w-4 h-4 text-primary" />
              <span className="font-bold text-primary text-sm">{user?.streak_days || 0}</span>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-400 hover:text-gray-600"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="p-6 bg-amber-light/30 border-2 border-amber-light text-center">
            <Star className="w-10 h-10 text-amber mx-auto mb-2 fill-amber" />
            <div className="text-3xl font-bold text-amber">{user?.stars || 0}</div>
            <div className="text-xs text-amber/70 font-bold uppercase">Stars Earned</div>
          </Card>
          <Card className="p-6 bg-primary-light/30 border-2 border-primary-light text-center">
            <Flame className="w-10 h-10 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary">{user?.streak_days || 0}</div>
            <div className="text-xs text-primary/70 font-bold uppercase">Day Streak</div>
          </Card>
          <Link to={user?.classroom_id ? `/leaderboard/classroom/${user.classroom_id}` : '#'}>
            <Card className="p-6 bg-purple-light/30 border-2 border-purple-light text-center hover:shadow-lg transition-all cursor-pointer h-full">
              <Trophy className="w-10 h-10 text-purple mx-auto mb-2" />
              <div className="text-lg font-bold text-purple">Leaderboard</div>
              <div className="text-xs text-purple/70 font-bold uppercase">See Rankings</div>
            </Card>
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><BookOpen className="text-primary" /> Your Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map(story => (
            <Link key={story.id} to={`/stories/${story.id}`}>
              <Card className="flex items-center gap-4 p-4 hover:shadow-lg transition-all cursor-pointer">
                <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center text-2xl">{story.cover_emoji || '📖'}</div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{story.title}</h4>
                  <p className="text-xs text-gray-400">{story.author} · Grade {story.grade_level}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </Card>
            </Link>
          ))}
          {stories.length === 0 && <Card className="p-8 text-center text-gray-500 italic col-span-2">No stories yet. Your teacher will add stories soon!</Card>}
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
