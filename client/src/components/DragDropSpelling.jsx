import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

/**
 * Drag-and-drop alphabet tile spelling for under-8 and learning-support Learners.
 * Shows A-Z palette + empty letter slots. Tap a letter to place it.
 */
const DragDropSpelling = ({ targetWord, onComplete }) => {
  const [slots, setSlots] = useState(Array(targetWord.length).fill(''));
  const [activeSlot, setActiveSlot] = useState(0);

  const handleLetterTap = useCallback((letter) => {
    if (activeSlot >= targetWord.length) return;
    
    const newSlots = [...slots];
    newSlots[activeSlot] = letter;
    setSlots(newSlots);
    setActiveSlot(activeSlot + 1);
  }, [slots, activeSlot, targetWord.length]);

  const handleBackspace = () => {
    if (activeSlot <= 0) return;
    const newSlots = [...slots];
    newSlots[activeSlot - 1] = '';
    setSlots(newSlots);
    setActiveSlot(activeSlot - 1);
  };

  const handleClear = () => {
    setSlots(Array(targetWord.length).fill(''));
    setActiveSlot(0);
  };

  const handleSubmit = () => {
    const answer = slots.join('');
    const correct = answer.toLowerCase() === targetWord.toLowerCase();
    onComplete(answer, correct);
  };

  const isFilled = slots.every(s => s !== '');

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Letter slots */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8">
        {slots.map((letter, i) => (
          <motion.div
            key={i}
            animate={i === activeSlot ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`
              w-14 h-16 md:w-16 md:h-20 rounded-xl flex items-center justify-center
              text-2xl md:text-3xl font-bold uppercase transition-all duration-200
              ${letter 
                ? 'bg-white border-2 border-primary-light shadow-card text-gray-800' 
                : i === activeSlot 
                  ? 'bg-primary-light border-2 border-primary animate-pulse' 
                  : 'bg-gray-100 border-2 border-gray-200'
              }
            `}
          >
            {letter}
          </motion.div>
        ))}
      </div>

      {/* A-Z Tile Palette */}
      <div className="bg-white rounded-2xl p-4 shadow-card">
        <div className="flex flex-wrap justify-center gap-2">
          {ALPHABET.map((letter) => (
            <motion.button
              key={letter}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleLetterTap(letter)}
              disabled={activeSlot >= targetWord.length}
              className={`
                w-10 h-12 md:w-12 md:h-14 rounded-xl font-bold text-lg md:text-xl uppercase
                transition-all duration-150
                ${activeSlot >= targetWord.length
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-700 hover:bg-primary hover:text-white hover:shadow-md active:bg-primary-dark cursor-pointer'
                }
              `}
            >
              {letter}
            </motion.button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={handleBackspace}
            disabled={activeSlot <= 0}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Undo
          </button>
          <button
            onClick={handleClear}
            disabled={activeSlot <= 0}
            className="px-4 py-2 rounded-xl bg-coral-light text-coral font-bold text-sm hover:bg-coral hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Clear All
          </button>
          <AnimatePresence>
            {isFilled && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleSubmit}
                className="px-8 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark shadow-lg transition-all"
              >
                Check ✓
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DragDropSpelling;
