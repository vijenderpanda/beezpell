import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Card } from './Card';
import { Trophy, Star, Gem, Clock, Target, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const RANK_BADGES = ['👑', '🥈', '🥉'];

const LeaderboardComponent = ({ contextType, contextId, token }) => {
  const [period, setPeriod] = useState('alltime');
  const isClassroom = contextType === 'classroom';
  const CurrencyIcon = isClassroom ? Star : Gem;
  const currencyLabel = isClassroom ? 'Stars' : 'Gems';
  const currencyColor = isClassroom ? 'text-amber' : 'text-purple';

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['leaderboard', contextType, contextId, period],
    queryFn: async () => {
      const res = await axios.get(`/api/leaderboard/${contextType}/${contextId}`, {
        params: { period },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return res.data;
    },
    enabled: !!contextId
  });

  return (
    <div>
      {/* Period Toggle */}
      <div className="flex gap-2 mb-6">
        {['weekly', 'alltime'].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${period === p ? (isClassroom ? 'bg-primary text-white' : 'bg-purple text-white') : 'bg-white text-gray-400 hover:text-gray-600'}`}>
            {p === 'weekly' ? '🗓️ This Week' : '🏆 All Time'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading leaderboard...</div>
      ) : entries.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-gray-400 font-medium">No scores yet. Start a quiz to appear here!</p>
        </Card>
      ) : (
        <>
          {/* Podium for top 3 */}
          {entries.length >= 3 && (
            <div className="flex items-end justify-center gap-3 mb-8 h-48">
              {[entries[1], entries[0], entries[2]].map((e, i) => {
                const heights = ['h-28', 'h-40', 'h-20'];
                const ranks = [2, 1, 3];
                const bgColors = isClassroom 
                  ? ['bg-gray-100', 'bg-amber-light', 'bg-orange-50']
                  : ['bg-purple-light/50', 'bg-purple-light', 'bg-purple-light/30'];
                return (
                  <motion.div key={e.user_id} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.15 }}
                    className={`${heights[i]} w-28 ${bgColors[i]} rounded-t-2xl flex flex-col items-center justify-end pb-3 relative`}>
                    <div className="absolute -top-5 text-2xl">{RANK_BADGES[ranks[i] - 1]}</div>
                    <div className="text-2xl mb-1">{e.avatar || '🐝'}</div>
                    <div className="text-xs font-bold text-gray-700 truncate w-full text-center px-1">{e.name}</div>
                    <div className={`text-xs font-bold ${currencyColor} flex items-center gap-1`}>
                      <CurrencyIcon className="w-3 h-3" /> {isClassroom ? e.stars : e.gems}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <Card className="overflow-hidden p-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400 w-12">#</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Name</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">{currencyLabel}</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Accuracy</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Avg Speed</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-widest text-gray-400">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {entries.map((e) => (
                  <tr key={e.user_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-400">
                      {e.rank <= 3 ? <span className="text-lg">{RANK_BADGES[e.rank - 1]}</span> : e.rank}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-sm">{e.avatar || '🐝'}</div>
                        <span className="font-bold text-gray-800">{e.name}</span>
                      </div>
                    </td>
                    <td className={`p-4 font-bold ${currencyColor} flex items-center gap-1`}>
                      <CurrencyIcon className="w-4 h-4" /> {isClassroom ? e.stars : e.gems}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: `${e.total_attempts > 0 ? Math.round((e.correct_count / e.total_attempts) * 100) : 0}%` }} />
                        </div>
                        <span className="text-sm font-bold text-gray-600">{e.total_attempts > 0 ? Math.round((e.correct_count / e.total_attempts) * 100) : 0}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" /> {e.avg_time_ms ? (e.avg_time_ms / 1000).toFixed(1) + 's' : '-'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-primary font-bold text-sm">
                        <Flame className="w-3 h-3" /> {e.streak_days || 0}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
};

export default LeaderboardComponent;
