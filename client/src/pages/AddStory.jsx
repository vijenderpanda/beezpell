import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ChevronLeft, Wand2, FileText, Link as LinkIcon, Upload, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const AddStory = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    full_text: '',
    url: '',
    grade_level: '4',
    is_public: true
  });
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('text'); // text, url, doc

  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('author', formData.author);
      payload.append('full_text', formData.full_text);
      payload.append('url', formData.url);
      payload.append('source_type', mode);
      payload.append('grade_level', parseInt(formData.grade_level));
      payload.append('is_public', formData.is_public);
      payload.append('created_by', user.id);
      payload.append('class_code', user.class_code || '');
      
      // Teacher context: associate story with classroom
      if (user.role === 'teacher' && user.classroom_id) {
        payload.append('classroom_id', user.classroom_id);
      }
      // Parent context: associate story with family
      if (user.role === 'parent' && user.family?.id) {
        payload.append('family_id', user.family.id);
      }
      
      if (mode === 'doc' && file) {
        payload.append('file', file);
      }

      const res = await axios.post('/api/stories/ingest', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert(`✅ Story added with ${res.data.wordCount || 0} spelling words!`);
      navigate(-1);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to ingest story');
    } finally {
      setLoading(false);
    }
  };

  const { data: myStories, refetch } = useQuery({
    queryKey: ['my-stories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await axios.get('/api/stories', { params: { created_by: user.id } });
      return res.data;
    },
    enabled: !!user?.id
  });

  return (
    <div className="min-h-screen bg-background safe-bottom">
      <header className="app-header">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="gap-2 touch-target"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </Button>
        <h1 className="text-lg sm:text-xl font-bold">Add Story</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="page-container pt-4 sm:pt-8">
        <Card className="p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Story Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. The Brave Little Bee"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Author
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Maya Angelou"
                  required
                />
              </div>
            </div>

            {/* Mode Selection */}
            <div className="flex gap-4 mb-6 bg-gray-50 p-2 rounded-xl">
              <button 
                type="button"
                onClick={() => setMode('text')}
                className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${mode === 'text' ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <FileText className="w-4 h-4" /> Text
              </button>
              <button 
                type="button"
                onClick={() => setMode('url')}
                className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${mode === 'url' ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LinkIcon className="w-4 h-4" /> URL
              </button>
              <button 
                type="button"
                onClick={() => setMode('doc')}
                className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${mode === 'doc' ? 'bg-white shadow text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Upload className="w-4 h-4" /> Document
              </button>
            </div>

            {mode === 'text' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Story Text
                </label>
                <textarea
                  value={formData.full_text}
                  onChange={(e) => setFormData({ ...formData, full_text: e.target.value })}
                  className="input-field h-64 py-4"
                  placeholder="Paste the story content here..."
                  required={mode === 'text'}
                />
              </div>
            )}

            {mode === 'url' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/story"
                  required={mode === 'url'}
                />
                <p className="text-xs text-gray-400 mt-2">Beezpell will automatically extract the readable text from this page.</p>
              </div>
            )}

            {mode === 'doc' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Upload Document (PDF, Word, TXT)
                </label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50">
                  <input 
                    type="file" 
                    accept=".pdf,.txt"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required={mode === 'doc'}
                  />
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-bold mb-1">
                    {file ? file.name : "Click to browse or drag file here"}
                  </p>
                  <p className="text-sm text-gray-400">Supports .pdf, .txt</p>
                </div>
              </div>
            )}


            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="font-semibold text-gray-700">Target Grade:</label>
                <select
                  value={formData.grade_level}
                  onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                  className="px-4 py-2 rounded-xl border-2 border-gray-100 bg-white"
                >
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
                <label htmlFor="is_public" className="text-gray-600 font-medium">Make public for everyone</label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full gap-2 py-4 text-lg" 
              loading={loading}
            >
              <Wand2 className="w-5 h-5" /> Analyze & Add Story
            </Button>
          </form>
        </Card>

        {/* My Uploaded Stories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">My Uploaded Stories</h2>
          <Card className="overflow-hidden p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Story Title</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Grade</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Type</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Visibility</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myStories?.map(story => (
                  <tr key={story.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{story.title}</td>
                    <td className="p-4 text-sm text-gray-600">Grade {story.grade_level}</td>
                    <td className="p-4 text-sm text-gray-600 capitalize">{story.source_type}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${story.is_public ? 'bg-success-light text-success' : 'bg-gray-100 text-gray-500'}`}>
                        {story.is_public ? 'Public' : 'Private'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
                {(!myStories || myStories.length === 0) && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 italic">You haven't uploaded any stories yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddStory;
