import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { BookOpen, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * First-time role selection after Google SSO.
 * Two large tiles: Guide and Learner.
 * One-time only — on subsequent logins, user goes straight to their dashboard.
 */
const ChooseRole = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { chooseRole, loading } = useAuthStore();
  const userId = location.state?.userId;

  const handleChoose = async (role) => {
    if (!userId) return;
    await chooseRole(userId, role);
    if (role === 'guide') {
      navigate('/guide/onboarding');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="text-center mb-8 sm:mb-10">
        <div className="text-4xl sm:text-5xl mb-3">🐝</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Welcome to Word Journey Lab!</h1>
        <p className="text-sm sm:text-base text-gray-500">How would you like to use the platform?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl w-full">
        {/* Guide Tile */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="p-6 sm:p-8 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-primary group touch-target"
            onClick={() => handleChoose('guide')}
          >
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-light rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary group-hover:text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">I'm a Guide</h2>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                Empower yourself to teach young minds spelling and vocabulary.
              </p>
              <div className="mt-4 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                {['Teacher', 'Parent', 'Tutor'].map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-gray-50 text-gray-400 text-[10px] sm:text-xs font-bold rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Learner Tile */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="p-8 cursor-pointer hover:shadow-xl transition-all border-2 border-transparent hover:border-amber group"
            onClick={() => handleChoose('learner')}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-light rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber group-hover:text-white transition-all">
                <GraduationCap className="w-10 h-10 text-amber group-hover:text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">I'm a Learner</h2>
              <p className="text-gray-500 leading-relaxed">
                Read stories, master spellings, climb the leaderboard.
                Your word journey starts here!
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {['Read Stories', 'Spell Words', 'Earn Stars', 'Compete'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-400 text-xs font-bold rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <p className="text-xs text-gray-300 mt-8 text-center max-w-md">
        Guides can upload stories, create classroom codes, and manage learners.
        Learners play spelling games and track their progress. You can change this later.
      </p>
    </div>
  );
};

export default ChooseRole;
