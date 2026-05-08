import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '../components/Button';
import { ChevronLeft, Play } from 'lucide-react';

const StoryReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: story, isLoading } = useQuery({
    queryKey: ['story', id],
    queryFn: async () => {
      const res = await axios.get(`/api/stories/${id}`);
      return res.data;
    }
  });

  if (isLoading) return <div className="p-8">Reading story...</div>;
  if (!story) return <div className="p-8">Story not found</div>;

  // Highlight quiz words in text


  const renderText = (text, words) => {
    if (!words) return text;
    let parts = [text];
    
    words.forEach(wordObj => {
      const regex = new RegExp(`\\b(${wordObj.word})\\b`, 'gi');
      parts = parts.flatMap(part => {
        if (typeof part !== 'string') return part;
        const matches = [...part.matchAll(regex)];
        if (matches.length === 0) return part;
        
        let lastIndex = 0;
        const subParts = [];
        matches.forEach(match => {
          subParts.push(part.slice(lastIndex, match.index));
          subParts.push(
            <span 
              key={`${wordObj.id}-${match.index}`} 
              className={`underline decoration-2 ${
                wordObj.tier === 'easy' ? 'decoration-success-light' :
                wordObj.tier === 'medium' ? 'decoration-amber-light' : 'decoration-purple-light'
              }`}
            >
              {match[1]}
            </span>
          );
          lastIndex = match.index + match[0].length;
        });
        subParts.push(part.slice(lastIndex));
        return subParts;
      });
    });
    
    return parts;
  };

  const startQuiz = () => {
    navigate('/quiz', {
      state: {
        words: story.words,
        sourceType: 'story',
        storyId: story.id,
        tier: 'mixed'
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-12">
          <Link to="/library">
            <Button variant="ghost" className="mb-6 -ml-4 gap-2">
              <ChevronLeft className="w-5 h-5" /> Library
            </Button>
          </Link>
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-4">{story.title}</h1>
          <p className="text-xl text-gray-500 font-serif italic">By {story.author}</p>
        </header>

        <article className="prose prose-lg max-w-none font-serif text-2xl leading-relaxed text-gray-800 whitespace-pre-wrap">
          {renderText(story.full_text, story.words)}
        </article>

        {story.words && story.words.length > 0 ? (
          <div className="sticky bottom-8 mt-24 flex justify-center">
            <Button onClick={startQuiz} className="gap-2 shadow-2xl px-12 py-6 text-xl">
              <Play className="w-6 h-6 fill-current" /> Start Quiz
            </Button>
          </div>
        ) : (
          <div className="mt-24 p-6 bg-red-50 text-red-600 rounded-xl text-center font-semibold">
            We couldn't find any spelling words to practice in this story. Please try adding a different story.
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryReader;
