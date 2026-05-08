import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import LeaderboardComponent from '../components/Leaderboard';
import { Users, Gem, Plus, BookOpen, Trophy, LogOut, Copy, Check, ChevronRight, Trash2, X } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const AVATARS = ['🦋', '🐢', '🐰', '🐱', '🐶', '🦊', '🐻', '🐼', '🦁', '🐸', '🦄', '🐝'];

const ParentDashboard = () => {
  const { user, token, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('children');
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChild, setNewChild] = useState({ name: '', grade: '1', avatar: '🦋', pin: '' });
  const [copied, setCopied] = useState(false);

  const { data: family } = useQuery({
    queryKey: ['parent-family'],
    queryFn: async () => {
      const res = await axios.get('/api/families', { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    }, enabled: !!token
  });

  const { data: stories = [] } = useQuery({
    queryKey: ['parent-stories', user?.id],
    queryFn: async () => {
      const res = await axios.get('/api/stories', { params: { created_by: user?.id } });
      return res.data;
    }, enabled: !!user?.id
  });

  const addChildMut = useMutation({
    mutationFn: async (data) => {
      const res = await axios.post(`/api/families/${family.id}/children`, data, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['parent-family']);
      setShowAddChild(false);
      setNewChild({ name: '', grade: '1', avatar: '🦋', pin: '' });
    }
  });

  const children = family?.children || [];
  const copyCode = () => { navigator.clipboard.writeText(family?.family_code); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const tabs = [
    { key: 'children', label: 'My Children', icon: Users },
    { key: 'stories', label: 'Stories', icon: BookOpen },
    { key: 'leaderboard', label: 'Family Board', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-light rounded-xl flex items-center justify-center text-xl">🏠</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{family?.name || 'Family Space'}</h1>
            <p className="text-xs text-gray-400">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {family && (
            <button onClick={copyCode} className="flex items-center gap-2 px-4 py-2 bg-purple-light rounded-xl hover:bg-purple hover:text-white transition-all group">
              <span className="text-xs font-bold text-gray-400 group-hover:text-white/70 uppercase">Family Code</span>
              <span className="font-mono font-bold text-purple group-hover:text-white tracking-wider">{family.family_code}</span>
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-purple group-hover:text-white" />}
            </button>
          )}
          <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-400 hover:text-gray-600 p-2"><LogOut className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-8">
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${activeTab === t.key ? 'bg-white shadow text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Children Tab */}
        {activeTab === 'children' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">My Children</h3>
              <Button onClick={() => setShowAddChild(true)} className="gap-2"><Plus className="w-4 h-4" /> Add Child</Button>
            </div>

            {/* Add Child Modal */}
            {showAddChild && (
              <Card className="mb-6 p-6 border-2 border-purple-light">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg">Add a Child</h4>
                  <button onClick={() => setShowAddChild(false)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Name</label>
                    <input type="text" value={newChild.name} onChange={e => setNewChild({...newChild, name: e.target.value})} className="input-field" placeholder="e.g. Lily" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Grade</label>
                    <select value={newChild.grade} onChange={e => setNewChild({...newChild, grade: e.target.value})} className="input-field">
                      {[1,2,3,4,5,6,7,8].map(g => <option key={g} value={g}>Grade {g}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Choose Avatar</label>
                  <div className="flex gap-2 flex-wrap">
                    {AVATARS.map(a => (
                      <button key={a} onClick={() => setNewChild({...newChild, avatar: a})}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${newChild.avatar === a ? 'bg-purple-light ring-2 ring-purple scale-110' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">4-Digit PIN</label>
                  <input type="text" inputMode="numeric" maxLength={4} value={newChild.pin} onChange={e => setNewChild({...newChild, pin: e.target.value.replace(/\D/g,'')})}
                    className="input-field font-mono tracking-[0.5em] text-2xl text-center w-40" placeholder="••••" />
                </div>
                <Button onClick={() => addChildMut.mutate(newChild)} loading={addChildMut.isPending} disabled={!newChild.name || newChild.pin.length !== 4}>Add Child</Button>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map(child => (
                <Card key={child.id} className="p-6 text-center hover:shadow-lg transition-all">
                  <div className="w-16 h-16 bg-purple-light rounded-full flex items-center justify-center text-3xl mx-auto mb-3">{child.avatar || '🦋'}</div>
                  <h4 className="font-bold text-lg text-gray-800 mb-1">{child.name}</h4>
                  <p className="text-xs text-gray-400 mb-4">Grade {child.grade}</p>
                  <div className="flex justify-center gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-purple flex items-center gap-1 justify-center"><Gem className="w-4 h-4" /> {child.gems || 0}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">Gems</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-primary">🔥 {child.streak_days || 0}</div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">Streak</div>
                    </div>
                  </div>
                </Card>
              ))}
              {children.length === 0 && <Card className="p-8 text-center text-gray-500 italic col-span-3">Add your first child to get started!</Card>}
            </div>
          </>
        )}

        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Family Stories</h3>
              <Link to="/add-story"><Button className="gap-2"><Plus className="w-4 h-4" /> Add Story</Button></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stories.map(story => (
                <Link key={story.id} to={`/stories/${story.id}`}>
                  <Card className="flex items-center gap-4 p-4 hover:shadow-lg transition-all cursor-pointer">
                    <div className="w-14 h-14 bg-purple-light rounded-xl flex items-center justify-center text-2xl">{story.cover_emoji || '📖'}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{story.title}</h4>
                      <p className="text-xs text-gray-400">{story.author} · Grade {story.grade_level}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </Card>
                </Link>
              ))}
              {stories.length === 0 && <Card className="p-8 text-center text-gray-500 italic col-span-2">No stories yet. Add a story for your children!</Card>}
            </div>
          </>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && family && (
          <>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">💎 Family Leaderboard</h3>
            <LeaderboardComponent contextType="family" contextId={family.id} token={token} />
          </>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
