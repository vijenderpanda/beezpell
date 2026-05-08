import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const VOWELS = 'aeiou';

export const LetterBox = ({ 
  letter = '', 
  status = 'empty', // empty, typed, correct, wrong, reveal
  isVowel = false,
  className 
}) => {
  // Determine color based on character if not explicitly provided
  const checkVowel = isVowel || (letter && VOWELS.includes(letter.toLowerCase()));

  const baseStyles = "w-12 h-16 md:w-16 md:h-20 rounded-xl flex items-center justify-center text-3xl md:text-4xl font-bold transition-all duration-180";
  
  const statusStyles = {
    empty: checkVowel ? 'bg-primary-light border-2 border-transparent' : 'bg-gray-100 border-2 border-transparent',
    active: checkVowel ? 'bg-primary-light border-2 border-primary animate-pulse' : 'bg-gray-100 border-2 border-gray-300 animate-pulse',
    typed: 'bg-white border-2 border-primary-light shadow-card',
    correct: 'bg-success-light text-success border-2 border-success animate-spring',
    wrong: 'bg-coral-light text-coral border-2 border-coral',
    reveal: checkVowel ? 'bg-primary-light text-primary border-2 border-transparent' : 'bg-gray-100 text-gray-400 border-2 border-transparent'
  };

  return (
    <div className={twMerge(baseStyles, statusStyles[status], className)}>
      {letter.toUpperCase()}
    </div>
  );
};
