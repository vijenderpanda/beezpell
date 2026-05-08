import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import LeaderboardComponent from '../components/Leaderboard';
import { Users, Copy, GraduationCap, ArrowUpRight, BookOpen, Trophy, Plus, LogOut, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: classrooms = [] } = useQuery({
    queryKey: ['teacher-classrooms'],
    queryFn: async () => {
      const res = await axios.get('/api/classrooms', { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    }, enabled: !!token
  });

  const selectedClassroom = classrooms[0];

  const { data: classData } = useQuery({
    queryKey: ['classroom-detail', selectedClassroom?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/classrooms/${selectedClassroom.id}`, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    }, enabled: !!selectedClassroom?.id
  });

  const { data: stories = [] } = useQuery({
    queryKey: ['teacher-stories', user?.id],
    queryFn: async () => {
      const res = await axios.get('/api/stories', { params: { created_by: user.id } });
      return res.data;
    }, enabled: !!user?.id
  });

  const students = classData?.students || [];
  const totalStudents = students.length;
  const avgAccuracy = Math.round(students.reduce((a, s) => a + (s.accuracy || 0), 0) / (totalStudents || 1));
  const totalMastered = students.reduce((a, s) => a + (s.mastered || 0), 0);
  const activeStreaks = students.filter(s => s.streak_days > 0).length;

  const copyCode = (code) => { navigator.clipboard.writeText(code); };
  const tabs = [
    { key: 'overview', label: 'Overview', icon: GraduationCap },
    { key: 'students', label: 'Learners', icon: Users },
    { key: 'stories', label: 'Stories', icon: BookOpen },
    { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar-style header */}
      <header className="app-header">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-light rounded-xl flex items-center justify-center text-lg sm:text-xl shrink-0">📚</div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Guide Dashboard</h1>
            <p className="text-[10px] sm:text-xs text-gray-400 truncate">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {selectedClassroom && (
            <button onClick={() => copyCode(selectedClassroom.class_code)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-primary-light rounded-xl hover:bg-primary hover:text-white transition-all group touch-target">
              <span className="hidden sm:inline text-xs font-bold text-gray-400 group-hover:text-white/70 uppercase">Code</span>
              <span className="font-mono font-bold text-primary group-hover:text-white tracking-wider text-xs sm:text-base">{selectedClassroom.class_code}</span>
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary group-hover:text-white" />
            </button>
          )}
          <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-400 hover:text-gray-600 p-2 touch-target"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="page-container pt-4 sm:pt-8">
        {/* Tabs — horizontal scroll on mobile */}
        <div className="flex gap-1 mb-6 sm:mb-8 bg-gray-100 p-1 rounded-xl overflow-x-auto hide-scrollbar">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap ${activeTab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              <t.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
              {[
                { label: 'My Learners', value: totalStudents, icon: Users, color: 'text-primary', bg: 'bg-primary-light' },
                { label: 'Avg. Accuracy', value: `${avgAccuracy}%`, icon: ArrowUpRight, color: 'text-success', bg: 'bg-success-light' },
                { label: 'Words Mastered', value: totalMastered, icon: GraduationCap, color: 'text-amber', bg: 'bg-amber-light' },
                { label: 'Active Streaks', value: activeStreaks, icon: Users, color: 'text-purple', bg: 'bg-purple-light' },
              ].map((stat, i) => (
                <Card key={i} className="p-4 sm:p-6">
                  <div className={`w-9 h-9 sm:w-12 sm:h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-2 sm:mb-4`}>
                    <stat.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <div className="text-lg sm:text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</div>
                </Card>
              ))}
            </div>
            <Card className="p-4 sm:p-8 bg-primary-light/30 border-2 border-primary-light">
              <h3 className="font-bold text-base sm:text-lg mb-2">📋 Quick Actions</h3>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-3 sm:mt-4">
                <Link to="/add-story"><Button className="gap-2 w-full sm:w-auto"><Plus className="w-4 h-4" /> Add Story</Button></Link>
                <Button variant="secondary" onClick={() => setActiveTab('leaderboard')} className="gap-2 w-full sm:w-auto"><Trophy className="w-4 h-4" /> View Leaderboard</Button>
              </div>
            </Card>
          </>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <>
            <h3 className="text-2xl font-bold mb-6">Student Roster</h3>
            <Card className="overflow-x-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-400">Student</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-400">Stars</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-400">Words Mastered</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-400">Accuracy</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-400">Streak</th>
                    <th className="p-5 text-xs font-bold uppercase tracking-widest text-gray-400">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5"><div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-lg">{s.avatar || '🐝'}</div>
                        <span className="font-bold text-gray-800">{s.name}</span>
                      </div></td>
                      <td className="p-5 font-bold text-amber">⭐ {s.stars || 0}</td>
                      <td className="p-5 font-bold text-primary">{s.mastered || 0}</td>
                      <td className="p-5"><div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-success" style={{ width: `${s.accuracy}%` }} /></div>
                        <span className="text-sm font-bold text-gray-600">{s.accuracy}%</span>
                      </div></td>
                      <td className="p-5 text-primary font-bold">🔥 {s.streak_days || 0}</td>
                      <td className="p-5 text-sm text-gray-400">{s.last_active ? new Date(s.last_active).toLocaleDateString() : 'Never'}</td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500 italic">No students yet. Share your class code!</td></tr>
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">My Stories</h3>
              <Link to="/add-story"><Button className="gap-2"><Plus className="w-4 h-4" /> Add Story</Button></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stories.map(story => (
                <Link key={story.id} to={`/stories/${story.id}`}>
                  <Card className="flex items-center gap-4 p-4 hover:shadow-lg transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center text-2xl">{story.cover_emoji || '📖'}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{story.title}</h4>
                      <p className="text-xs text-gray-400">Grade {story.grade_level} · {story.source_type}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </Card>
                </Link>
              ))}
              {stories.length === 0 && <Card className="p-8 text-center text-gray-500 italic col-span-2">No stories yet. Add your first story!</Card>}
            </div>
          </>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && selectedClassroom && (
          <>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">⭐ Classroom Leaderboard</h3>
            <LeaderboardComponent contextType="classroom" contextId={selectedClassroom.id} token={token} />
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
