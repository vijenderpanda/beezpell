import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ChevronRight, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Guide onboarding — One question per screen, all skippable.
 * Per Jamil: maximum 3 questions to log in. Step-by-step. Like Instagram quizzes.
 * School is optional profile info, NOT a required entity.
 */
const GuideOnboarding = () => {
  const [step, setStep] = useState(0);
  const [yearOfBirth, setYearOfBirth] = useState('');
  const [learnerCount, setLearnerCount] = useState(null);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const navigate = useNavigate();
  const { onboardGuide, user, loading } = useAuthStore();

  const nextStep = () => setStep(s => s + 1);

  const handleFinish = async () => {
    // Create one classroom per selected grade (or a default one if skipped)
    const grades = selectedGrades.length > 0 ? selectedGrades : [4]; // default Grade 4
    const firstGrade = grades[0];
    const result = await onboardGuide(null, `Grade ${firstGrade}`, firstGrade);
    
    if (result?.success) {
      navigate('/guide');
    }
  };

  const steps = [
    // Step 0: Year of birth (skippable)
    () => (
      <motion.div key="yob" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} className="text-center max-w-md mx-auto">
        <div className="text-5xl mb-6">🎂</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">What year were you born?</h2>
        <p className="text-gray-400 mb-8 text-sm">Just the year. This helps us tailor the experience.</p>
        <input
          type="number"
          value={yearOfBirth}
          onChange={e => setYearOfBirth(e.target.value)}
          placeholder="e.g. 1985"
          className="input-field text-center text-2xl w-48 mx-auto mb-8"
          min="1950" max="2010"
          autoFocus
        />
        <div className="flex gap-3 justify-center">
          <button onClick={nextStep} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-medium">
            <SkipForward className="w-4 h-4" /> Skip
          </button>
          <Button onClick={nextStep} className="px-8 gap-2" disabled={!yearOfBirth}>
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    ),

    // Step 1: How many learners? (skippable)
    () => (
      <motion.div key="count" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} className="text-center max-w-md mx-auto">
        <div className="text-5xl mb-6">👩‍🏫</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">How many learners do you want to empower?</h2>
        <p className="text-gray-400 mb-8 text-sm">This is just to set things up — you can always change later.</p>
        <div className="flex gap-3 justify-center flex-wrap mb-8">
          {[
            { value: 1, label: '1', emoji: '👤' },
            { value: 3, label: '2-5', emoji: '👥' },
            { value: 10, label: '6-15', emoji: '👨‍👩‍👧‍👦' },
            { value: 20, label: '15+', emoji: '🏫' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => { setLearnerCount(opt.value); nextStep(); }}
              className={`w-20 h-24 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2 ${
                learnerCount === opt.value 
                  ? 'border-primary bg-primary-light shadow-md' 
                  : 'border-gray-200 bg-white hover:border-primary hover:bg-primary-light'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-sm font-bold text-gray-700">{opt.label}</span>
            </button>
          ))}
        </div>
        <button onClick={nextStep} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-medium mx-auto">
          <SkipForward className="w-4 h-4" /> Skip
        </button>
      </motion.div>
    ),

    // Step 2: Which grade(s)? (skippable)
    () => (
      <motion.div key="grades" initial={{opacity:0,x:50}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-50}} className="text-center max-w-md mx-auto">
        <div className="text-5xl mb-6">📊</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Which grade do your learners attend?</h2>
        <p className="text-gray-400 mb-8 text-sm">Select all that apply. A classroom code will be created for each grade.</p>
        <div className="flex gap-3 justify-center flex-wrap mb-8">
          {[1, 2, 3, 4, 5, 6].map(grade => (
            <button
              key={grade}
              onClick={() => {
                setSelectedGrades(prev => 
                  prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
                );
              }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold transition-all border-2 ${
                selectedGrades.includes(grade)
                  ? 'border-primary bg-primary text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary hover:bg-primary-light'
              }`}
            >
              {grade}
            </button>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={handleFinish} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-medium">
            <SkipForward className="w-4 h-4" /> Skip
          </button>
          <Button onClick={handleFinish} className="px-8 gap-2" loading={loading}>
            Let's Go! 🚀
          </Button>
        </div>
      </motion.div>
    ),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex flex-col items-center justify-center p-6">
      {/* Progress dots */}
      <div className="flex gap-2 mb-8">
        {steps.map((_, i) => (
          <div key={i} className={`w-3 h-3 rounded-full transition-all ${
            i === step ? 'bg-primary scale-125' : i < step ? 'bg-primary opacity-30' : 'bg-gray-200'
          }`} />
        ))}
      </div>

      <Card className="p-10 max-w-lg w-full">
        <AnimatePresence mode="wait">
          {step < steps.length ? steps[step]() : null}
        </AnimatePresence>
      </Card>

      <p className="text-xs text-gray-300 mt-6">
        {user?.name ? `Welcome, ${user.name}!` : ''} Every question is skippable.
      </p>
    </div>
  );
};

export default GuideOnboarding;
