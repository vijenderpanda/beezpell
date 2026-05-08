import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Heart, Copy, Check } from 'lucide-react';

const ParentOnboarding = () => {
  const [familyName, setFamilyName] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const { onboardParent, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onboardParent(familyName);
    if (result.success) {
      setFamilyCode(result.familyCode);
      setStep(2);
    }
  };

  const copyCode = () => { navigator.clipboard.writeText(familyCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-lg">
        {step === 1 && (
          <div className="animate-spring">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-purple-light rounded-full flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-purple" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Create Your Family Space</h1>
              <p className="text-gray-500 mt-2 text-sm">A cozy place for your children to learn</p>
            </div>
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Family Name</label>
                  <input type="text" value={familyName} onChange={e => setFamilyName(e.target.value)} className="input-field" placeholder="e.g. The Parker Family" required />
                </div>
                {error && <div className="p-3 bg-coral-light text-coral rounded-xl text-sm font-medium">{error}</div>}
                <Button type="submit" className="w-full" loading={loading}>Create Family Space 🏠</Button>
              </form>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="animate-spring text-center">
            <div className="text-6xl mb-6">🏠</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Space Created!</h1>
            <p className="text-gray-500 mb-8">Your children can use this code to log in</p>
            <Card className="p-8 inline-block mx-auto">
              <div className="text-4xl font-mono font-black text-purple tracking-[0.2em] mb-4">{familyCode}</div>
              <Button onClick={copyCode} variant="secondary" className="gap-2">
                {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Code</>}
              </Button>
            </Card>
            <div className="mt-8">
              <Button onClick={() => navigate('/parent')} className="px-12">Go to Dashboard</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentOnboarding;
