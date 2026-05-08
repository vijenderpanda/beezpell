import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Book, GraduationCap, Plus, ChevronRight } from 'lucide-react';
import oxfordWords from '../data/oxford-words.json';
import { Link } from 'react-router-dom';

const Library = () => {
  const [activeTab, setActiveTab] = useState('stories');
  const { user } = useAuthStore();

  const { data: stories, isLoading } = useQuery({
    queryKey: ['stories', user?.id],
    queryFn: async () => {
      // If student, get public + class stories
      // If guide, get public + their own created stories
      const params = { is_public: 1 };
      
      if (user?.role === 'learner' && user?.class_code) {
        params.class_code = user.class_code;
      } else if (user?.id) {
        params.created_by = user.id;
      }

      const res = await axios.get('/api/stories', { params });
      return res.data;
    }
  });

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <header className="app-header">
        <h1 className="text-xl font-bold">Library</h1>
        {user?.role !== 'student' && (
          <Link to="/add-story">
            <Button className="gap-2 px-4 py-2 text-sm">
              <Plus className="w-4 h-4" /> Add Story
            </Button>
          </Link>
        )}
      </header>

      <div className="page-container pt-4 sm:pt-8">
        <div className="mb-6 sm:mb-8">
          <p className="text-gray-500 text-sm sm:text-base">Find your next adventure or practice your words.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              activeTab === 'stories' ? 'bg-primary text-white' : 'bg-white text-gray-400'
            }`}
          >
            Stories
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              activeTab === 'curriculum' ? 'bg-primary text-white' : 'bg-white text-gray-400'
            }`}
          >
            Curriculum
          </button>
        </div>

        {activeTab === 'stories' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <p>Loading stories...</p>
            ) : (
              stories?.map((story) => (
                <Link key={story.id} to={`/stories/${story.id}`}>
                  <Card className="flex items-center gap-6 p-4 hover:shadow-lg transition-all cursor-pointer">
                    <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center text-4xl">
                      {story.cover_emoji || '📖'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{story.title}</h3>
                      <p className="text-gray-500 text-sm">{story.author}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          Grade {story.grade_level}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-300" />
                  </Card>
                </Link>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {[1, 2, 3, 4, 5].map((grade) => (
              <div key={grade}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <GraduationCap className="text-primary" /> Grade {grade}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {['easy', 'medium', 'hard'].map((tier) => (
                    <Card key={tier} className="p-6">
                      <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                        tier === 'easy' ? 'bg-success-light' : 
                        tier === 'medium' ? 'bg-amber-light' : 'bg-purple-light'
                      }`}>
                        <Book className={`w-6 h-6 ${
                          tier === 'easy' ? 'text-success' : 
                          tier === 'medium' ? 'text-amber' : 'text-purple'
                        }`} />
                      </div>
                      <h3 className="text-lg font-bold capitalize mb-1">{tier} Tier</h3>
                      <p className="text-gray-400 text-sm mb-6">
                        {oxfordWords[`grade${grade}`][tier].length} words to master
                      </p>
                      <Button variant="secondary" className="w-full">Start Tier</Button>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
