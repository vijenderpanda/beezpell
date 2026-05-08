import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { BookOpen, GraduationCap, Users, KeyRound, ArrowLeft, Shield, FlaskConical, Play } from 'lucide-react';

const Login = () => {
  const [mode, setMode] = useState(null);
  const [classCode, setClassCode] = useState('');
  const [learnerName, setLearnerName] = useState('');
  const [pin, setPin] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const { loginWithGoogle, loginLearner, loginDemo, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleGoogleSSO = async (credential) => {
    const result = await loginWithGoogle(credential);
    if (result?.needsRoleChoice) {
      navigate('/choose-role', { state: { userId: result.user.id } });
    } else if (result?.needsOnboarding) {
      navigate('/guide/onboarding');
    } else if (result?.user) {
      navigate('/');
    }
  };

  const handleLearnerLogin = async (e) => {
    e.preventDefault();
    const result = await loginLearner(classCode, learnerName, pin);
    if (result?.user) navigate('/');
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const result = await loginDemo(adminUser, adminPass);
    if (result?.user) navigate('/');
  };

  // ── Dev Quick Login ──
  const quickLogin = async (type) => {
    try {
      if (type === 'guide') {
        await handleGoogleSSO('MOCK_GOOGLE_TOKEN');
      } else if (type === 'new-guide') {
        // Use the same loginWithGoogle but with a different mock token
        const result = await loginWithGoogle('MOCK_NEW_USER');
        if (result?.needsRoleChoice) {
          navigate('/choose-role', { state: { userId: result.user.id } });
        } else if (result?.needsOnboarding) {
          navigate('/guide/onboarding');
        } else if (result?.user) {
          navigate('/');
        } else {
          alert('Login failed — check server console for errors');
        }
      } else if (type === 'ayaana') {
        const r = await loginLearner('BEE-4GRD', 'Ayaana', '1111');
        if (r?.user) navigate('/');
      } else if (type === 'lily') {
        const r = await loginLearner('FAM-PRKR', 'Lily', '1234');
        if (r?.user) navigate('/');
      } else if (type === 'max') {
        const r = await loginLearner('FAM-PRKR', 'Max', '5678');
        if (r?.user) navigate('/');
      } else if (type === 'admin') {
        const r = await loginDemo('admin', 'admin123');
        if (r?.user) navigate('/');
      }
    } catch (err) {
      console.error('Quick login failed:', err);
      alert('Quick login failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="text-center mb-8 animate-spring">
        <div className="text-6xl mb-3">🐝</div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Word Journey Lab</h1>
        <p className="text-gray-400 mt-2 font-medium">Master spellings through stories</p>
      </div>

      <div className="w-full max-w-md">
        {/* ═══ MAIN MENU ═══ */}
        {!mode && (
          <div className="space-y-4 animate-spring">
            {/* Google Sign-In */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Guides & Learners</h3>
              <GoogleSignInButton onSuccess={handleGoogleSSO} />
            </Card>

            {/* Join with Classroom Code */}
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode('learner-join')}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-light rounded-2xl flex items-center justify-center text-2xl">🎓</div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">Join with a Classroom Code</h3>
                  <p className="text-sm text-gray-400">Your Guide gave you a 6-character code</p>
                </div>
                <KeyRound className="w-5 h-5 text-gray-300" />
              </div>
            </Card>

            {/* Dev Testing Panel */}
            <div className="pt-4">
              <button onClick={() => setMode('dev')} className="w-full flex items-center justify-center gap-2 text-xs text-gray-300 hover:text-primary transition-colors py-2">
                <FlaskConical className="w-3.5 h-3.5" /> Dev Testing Panel
              </button>
            </div>
          </div>
        )}

        {/* ═══ DEV TESTING PANEL ═══ */}
        {mode === 'dev' && (
          <div className="animate-spring">
            <button onClick={() => setMode(null)} className="flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-4 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <Card className="p-6 border-2 border-dashed border-amber-200">
              <div className="flex items-center gap-2 mb-5">
                <FlaskConical className="w-5 h-5 text-amber" />
                <h2 className="font-bold text-gray-800">Dev Testing Panel</h2>
                <span className="text-[10px] bg-amber-light text-amber px-2 py-0.5 rounded-full font-bold">DEV ONLY</span>
              </div>

              <div className="space-y-3">
                {/* Full Journey: New User */}
                <div className="p-3 bg-purple-50 rounded-xl">
                  <p className="text-xs font-bold text-purple-500 mb-2">🆕 FULL JOURNEY (new user)</p>
                  <button onClick={() => quickLogin('new-guide')}
                    className="w-full py-2.5 bg-purple-500 text-white rounded-lg font-bold text-sm hover:bg-purple-600 transition-all flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" /> Start Fresh → Role Choice → Onboarding
                  </button>
                  <p className="text-[10px] text-purple-400 mt-1.5">Creates a new user. You'll see: role tiles → onboarding questions → dashboard</p>
                </div>

                {/* Existing Guide */}
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <p className="text-xs font-bold text-emerald-600 mb-2">👩‍🏫 GUIDE (existing, skips onboarding)</p>
                  <button onClick={() => quickLogin('guide')}
                    className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-bold text-sm hover:bg-emerald-600 transition-all">
                    Login as Ms. Johnson → Guide Dashboard
                  </button>
                </div>

                {/* Learners */}
                <div className="p-3 bg-sky-50 rounded-xl">
                  <p className="text-xs font-bold text-sky-600 mb-2">🎓 LEARNERS</p>
                  <div className="space-y-2">
                    <button onClick={() => quickLogin('ayaana')}
                      className="w-full py-2 bg-sky-500 text-white rounded-lg font-bold text-sm hover:bg-sky-600 transition-all text-left px-4">
                      <span className="block">Ayaana (Age 10, Grade 4)</span>
                      <span className="text-sky-200 text-[10px]">Full 7 stages · keyboard · reverse enabled</span>
                    </button>
                    <button onClick={() => quickLogin('lily')}
                      className="w-full py-2 bg-pink-400 text-white rounded-lg font-bold text-sm hover:bg-pink-500 transition-all text-left px-4">
                      <span className="block">Lily (Age 6, Grade 1) 🧩</span>
                      <span className="text-pink-200 text-[10px]">Drag-drop tiles · no reverse · Easy only</span>
                    </button>
                    <button onClick={() => quickLogin('max')}
                      className="w-full py-2 bg-amber-400 text-white rounded-lg font-bold text-sm hover:bg-amber-500 transition-all text-left px-4">
                      <span className="block">Max (Age 8, Learning Support) 💛</span>
                      <span className="text-amber-200 text-[10px]">No reverse · no Tricky · support flag on</span>
                    </button>
                  </div>
                </div>

                {/* Admin */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs font-bold text-gray-500 mb-2">🛡️ ADMIN</p>
                  <button onClick={() => quickLogin('admin')}
                    className="w-full py-2 bg-gray-500 text-white rounded-lg font-bold text-sm hover:bg-gray-600 transition-all">
                    Login as Admin
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  <strong>Classroom codes:</strong> BEE-4GRD (Grade 4), FOX-5GRD (Grade 5), FAM-PRKR (Family)<br/>
                  <strong>Guide password:</strong> guide123 · <strong>Admin:</strong> admin / admin123
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* ═══ LEARNER JOIN FLOW ═══ */}
        {mode === 'learner-join' && (
          <div className="animate-spring">
            <button onClick={() => setMode(null)} className="flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-6 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <Card className="p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🎓</div>
                <h2 className="text-xl font-bold text-gray-800">Join Your Guide's Class</h2>
                <p className="text-sm text-gray-400 mt-1">Enter the 6-character code, your name, and your PIN</p>
              </div>

              <form onSubmit={handleLearnerLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Classroom Code</label>
                  <input type="text" value={classCode} onChange={e => setClassCode(e.target.value.toUpperCase())}
                    className="input-field text-center text-2xl font-mono tracking-[0.3em] uppercase" placeholder="ABC-123" maxLength={8} required autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Your Name</label>
                  <input type="text" value={learnerName} onChange={e => setLearnerName(e.target.value)}
                    className="input-field" placeholder="e.g. Ayaana" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Your PIN</label>
                  <input type="password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="input-field text-center text-2xl tracking-[0.5em]" placeholder="• • • •" maxLength={4} inputMode="numeric" required />
                </div>
                {error && <div className="p-3 bg-coral-light text-coral rounded-xl text-sm font-medium">{error}</div>}
                <Button type="submit" className="w-full py-4 text-lg" loading={loading}>
                  Join Class 🚀
                </Button>
              </form>
            </Card>
          </div>
        )}

        {/* ═══ ADMIN LOGIN ═══ */}
        {mode === 'admin' && (
          <div className="animate-spring">
            <button onClick={() => setMode(null)} className="flex items-center gap-1 text-gray-400 hover:text-gray-600 mb-6 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <Card className="p-8">
              <div className="text-center mb-6">
                <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h2 className="text-xl font-bold text-gray-800">Admin Access</h2>
              </div>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input type="text" value={adminUser} onChange={e => setAdminUser(e.target.value)}
                  className="input-field" placeholder="Username" required />
                <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)}
                  className="input-field" placeholder="Password" required />
                {error && <div className="p-3 bg-coral-light text-coral rounded-xl text-sm font-medium">{error}</div>}
                <Button type="submit" className="w-full" loading={loading}>Sign In</Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
