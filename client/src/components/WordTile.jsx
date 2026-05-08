import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const WordTile = ({ word }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const colors = {
    story: 'bg-primary text-white',
    curriculum: 'bg-[#D97706] text-white', // Gold
    number: 'bg-purple text-white'
  };

  const sourceType = word.source_type || 'story';

  return (
    <div 
      className="relative w-32 h-16 perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      >
        {/* Front */}
        <div className={twMerge(
          "absolute inset-0 backface-hidden rounded-xl flex items-center justify-center font-bold text-lg shadow-md",
          colors[sourceType]
        )}>
          {word.word}
        </div>

        {/* Back */}
        <div className={twMerge(
          "absolute inset-0 backface-hidden rounded-xl flex flex-col items-center justify-center p-2 text-[10px] leading-tight text-center rotate-y-180",
          colors[sourceType],
          "opacity-90"
        )}>
          <p className="font-bold mb-1 uppercase tracking-tighter">{word.phonetic}</p>
          <p className="italic line-clamp-2">{word.definition}</p>
        </div>
      </motion.div>
    </div>
  );
};
