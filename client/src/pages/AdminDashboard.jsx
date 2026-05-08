import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { School, Users, BookOpen, Baby, Shield, ChevronDown, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { token, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    }, enabled: !!token
  });

  const { data: schools = [] } = useQuery({
    queryKey: ['admin-schools'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/schools', { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    }, enabled: !!token
  });

  const { data: families = [] } = useQuery({
    queryKey: ['admin-families'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/families', { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    }, enabled: !!token
  });

  const statCards = [
    { label: 'Schools', value: stats?.totalSchools || 0, icon: School, color: 'text-primary', bg: 'bg-primary-light' },
    { label: 'Teachers', value: stats?.totalTeachers || 0, icon: Users, color: 'text-amber', bg: 'bg-amber-light' },
    { label: 'Students', value: stats?.totalStudents || 0, icon: BookOpen, color: 'text-success', bg: 'bg-success-light' },
    { label: 'Parents', value: stats?.totalParents || 0, icon: Users, color: 'text-purple', bg: 'bg-purple-light' },
    { label: 'Children', value: stats?.totalChildren || 0, icon: Baby, color: 'text-coral', bg: 'bg-coral-light' },
    { label: 'Stories', value: stats?.totalStories || 0, icon: BookOpen, color: 'text-primary', bg: 'bg-primary-light' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-100 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><Shield className="w-5 h-5 text-gray-500" /></div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Admin Console</h1>
            <p className="text-xs text-gray-400">Beezpell Platform Management</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="text-gray-400 hover:text-gray-600"><LogOut className="w-5 h-5" /></button>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {statCards.map((s, i) => (
            <Card key={i} className="p-5">
              <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-400 font-bold uppercase">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Schools Section */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><School className="text-primary" /> Schools & Teachers</h2>
        <div className="space-y-4 mb-12">
          {schools.map(school => (
            <Card key={school.id} className="p-0 overflow-hidden">
              <div className="p-5 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center"><School className="w-5 h-5 text-primary" /></div>
                  <div>
                    <h3 className="font-bold text-gray-800">{school.name}</h3>
                    <p className="text-xs text-gray-400">{school.school_code} · {school.address}</p>
                  </div>
                </div>
                <span className="text-xs bg-primary-light text-primary px-3 py-1 rounded-full font-bold">{school.teachers?.length || 0} teachers</span>
              </div>
              {school.teachers?.map(teacher => (
                <div key={teacher.id} className="border-t border-gray-50">
                  <div className="p-4 pl-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-light rounded-full flex items-center justify-center text-sm">👩‍🏫</div>
                      <div>
                        <span className="font-bold text-gray-700 text-sm">{teacher.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{teacher.email}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{teacher.students?.length || 0} students</span>
                  </div>
                  {teacher.students?.length > 0 && (
                    <div className="pl-24 pb-3 flex flex-wrap gap-2">
                      {teacher.students.map(s => (
                        <span key={s.id} className="text-xs bg-gray-50 px-3 py-1 rounded-full text-gray-600 flex items-center gap-1">
                          {s.avatar || '🐝'} {s.name} <span className="text-gray-300">·</span> <span className="text-amber">⭐{s.stars}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </Card>
          ))}
          {schools.length === 0 && <Card className="p-8 text-center text-gray-500 italic">No schools registered yet.</Card>}
        </div>

        {/* Families Section */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="text-purple" /> Families</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {families.map(fam => (
            <Card key={fam.id} className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-light rounded-lg flex items-center justify-center">🏠</div>
                <div>
                  <h3 className="font-bold text-gray-800">{fam.name}</h3>
                  <p className="text-xs text-gray-400">Parent: {fam.parent?.name || 'Unknown'} · {fam.family_code}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {fam.children?.map(c => (
                  <span key={c.id} className="text-xs bg-purple-light px-3 py-1.5 rounded-full text-purple font-bold flex items-center gap-1">
                    {c.avatar || '🦋'} {c.name} <span className="text-purple/50">·</span> 💎{c.gems}
                  </span>
                ))}
                {(!fam.children || fam.children.length === 0) && <span className="text-xs text-gray-400 italic">No children added</span>}
              </div>
            </Card>
          ))}
          {families.length === 0 && <Card className="p-8 text-center text-gray-500 italic col-span-2">No families registered yet.</Card>}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
