import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import ChooseRole from './pages/ChooseRole';
import LearnerHome from './pages/LearnerHome';
import Library from './pages/Library';
import StoryReader from './pages/StoryReader';
import AddStory from './pages/AddStory';
import Quiz from './pages/Quiz';
import Museum from './pages/Museum';
import Progress from './pages/Progress';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherOnboarding from './pages/TeacherOnboarding';
import AdminDashboard from './pages/AdminDashboard';
import LearnerOnboarding from './pages/LearnerOnboarding';

// Aliases — TeacherDashboard = GuideDashboard, TeacherOnboarding = GuideOnboarding
const GuideDashboard = TeacherDashboard;
const GuideOnboarding = TeacherOnboarding;

// ── Protected Route ──
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user, checkAuth } = useAuthStore();
  useEffect(() => { checkAuth(); }, []);
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

// ── Role-based home redirect ──
const RoleRedirect = () => {
  const { user, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => { checkAuth(); }, []);
  useEffect(() => {
    if (!user) return;
    switch (user.role) {
      case 'admin': navigate('/admin', { replace: true }); break;
      case 'guide': navigate('/guide', { replace: true }); break;
      case 'learner': navigate('/learner', { replace: true }); break;
      default: navigate('/login', { replace: true });
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center animate-spring">
        <div className="text-5xl mb-4">🐝</div>
        <p className="text-gray-400 font-medium">Loading your journey...</p>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/choose-role" element={<ChooseRole />} />

        {/* Role-based home */}
        <Route path="/" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />

        {/* Guide (formerly Teacher/Parent) */}
        <Route path="/guide" element={<ProtectedRoute allowedRoles={['guide']}><GuideDashboard /></ProtectedRoute>} />
        <Route path="/guide/onboarding" element={<ProtectedRoute allowedRoles={['guide']}><GuideOnboarding /></ProtectedRoute>} />

        {/* Learner (formerly Student/Child) */}
        <Route path="/learner" element={<ProtectedRoute allowedRoles={['learner']}><LearnerHome /></ProtectedRoute>} />
        <Route path="/learner/onboarding" element={<ProtectedRoute allowedRoles={['learner']}><LearnerOnboarding /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
        <Route path="/stories/:id" element={<ProtectedRoute><StoryReader /></ProtectedRoute>} />
        <Route path="/add-story" element={<ProtectedRoute allowedRoles={['guide']}><AddStory /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/museum" element={<ProtectedRoute><Museum /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />

        {/* Legacy redirects */}
        <Route path="/teacher" element={<Navigate to="/guide" />} />
        <Route path="/student" element={<Navigate to="/learner" />} />
        <Route path="/child" element={<Navigate to="/learner" />} />
        <Route path="/parent" element={<Navigate to="/guide" />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
