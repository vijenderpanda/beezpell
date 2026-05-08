import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { WordTile } from '../components/WordTile';
import { Button } from '../components/Button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Museum = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: masteredWords, isLoading } = useQuery({
    queryKey: ['mastered-words'],
    queryFn: async () => {
      const res = await axios.get('/api/words/mastered', {
        params: { user_id: user.id }
      });
      return res.data;
    }
  });

  // Group words into shelves of 5
  const shelves = [];
  if (masteredWords) {
    for (let i = 0; i < masteredWords.length; i += 5) {
      shelves.push(masteredWords.slice(i, i + 5));
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] p-8"> {/* Warm cream background */}
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <Button variant="ghost" onClick={() => navigate('/')} className="-ml-4 gap-2">
            <ChevronLeft className="w-5 h-5" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Word Museum</h1>
          <div className="text-primary font-bold">{masteredWords?.length || 0} words mastered</div>
        </header>

        {isLoading ? (
          <p className="text-center text-gray-400">Opening the vault...</p>
        ) : (
          <div className="space-y-16 pt-8">
            {shelves.length === 0 ? (
              <div className="text-center py-20 opacity-30">
                <div className="text-8xl mb-4">🏛️</div>
                <p className="text-xl italic">Your museum is empty. Master some words to fill it!</p>
              </div>
            ) : (
              shelves.map((shelf, idx) => (
                <div key={idx} className="relative pt-8">
                  {/* Words on shelf */}
                  <div className="flex justify-around items-end gap-4 px-4 mb-2">
                    {shelf.map(word => (
                      <WordTile key={word.id} word={word} />
                    ))}
                  </div>
                  
                  {/* Wooden Shelf (Pure CSS) */}
                  <div className="relative h-6 w-full">
                    {/* Top surface */}
                    <div className="absolute inset-0 bg-[#8B4513] rounded-t-lg shadow-inner border-t border-[#A0522D]" />
                    {/* Front edge */}
                    <div className="absolute -bottom-2 left-0 right-0 h-2 bg-[#5D2E0A] rounded-b-lg shadow-lg" />
                    {/* Decorative supports */}
                    <div className="absolute -bottom-6 left-12 w-4 h-6 bg-[#5D2E0A] rounded-b-md" />
                    <div className="absolute -bottom-6 right-12 w-4 h-6 bg-[#5D2E0A] rounded-b-md" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Museum;
