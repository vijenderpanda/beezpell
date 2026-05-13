import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { GraduationCap, ArrowRight, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';

const LearnerOnboarding = () => {
  const [grade, setGrade] = useState('4');
  const [classCode, setClassCode] = useState('');
  const { onboardLearner, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e, skipClassCode = false) => {
    e.preventDefault();
    
    const codeToSubmit = skipClassCode ? '' : classCode;
    
    const result = await onboardLearner(grade, codeToSubmit);
    if (result?.success) {
      navigate('/learner');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8 animate-spring">
        <div className="text-6xl mb-3">🎓</div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Let's set up your profile!</h1>
        <p className="text-gray-500 font-medium">Just a few quick questions to personalize your journey.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="p-6 sm:p-8">
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            
            {/* Grade Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                What grade are you in?
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="input-field text-lg py-3 bg-white"
                required
              >
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
              </select>
            </div>

            <hr className="border-gray-100" />

            {/* Classroom Code */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                Classroom Code <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <p className="text-xs text-gray-400 mb-3">
                If your Guide (Teacher or Parent) gave you a 6-character code, enter it here.
              </p>
              <input
                type="text"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                className="input-field text-center text-xl font-mono tracking-[0.3em] uppercase"
                placeholder="ABC-123"
                maxLength={8}
              />
            </div>

            {error && (
              <div className="p-3 bg-coral-light text-coral rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="pt-4 flex flex-col gap-3">
              <Button type="submit" className="w-full py-4 text-lg gap-2" loading={loading}>
                Finish Setup <ArrowRight className="w-5 h-5" />
              </Button>
              
              {!classCode && (
                <button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, true)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold py-2 transition-colors flex justify-center items-center gap-1"
                >
                  I don't have a code <SkipForward className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default LearnerOnboarding;
