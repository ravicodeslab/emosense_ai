"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Smile, TrendingUp, Clock, RefreshCw, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getHistory, getDominantEmotion, getMoodScore, getEmotionBreakdown, clearHistory, EmotionEntry, getSuggestion } from '@/lib/emotionStore';

const EMOTION_COLORS: Record<string, string> = {
  happy: '#22c55e', neutral: '#64748b', sad: '#3b82f6',
  angry: '#ef4444', fear: '#a855f7', surprise: '#eab308',
  disgust: '#f97316', contempt: '#94a3b8', none: '#334155'
};

function buildChartData(history: EmotionEntry[]) {
  const groups: Record<string, number[]> = {};
  history.forEach(e => {
    const key = new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(getMoodScore(e.emotion));
  });
  return Object.entries(groups).slice(-12).map(([time, scores]) => ({
    time,
    score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }));
}

export default function DashboardPage() {
  const [history, setHistory] = useState<EmotionEntry[]>([]);

  const refresh = () => setHistory(getHistory());

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('emosense_update', handler);
    return () => window.removeEventListener('emosense_update', handler);
  }, []);

  const dominant = getDominantEmotion(history);
  const breakdown = getEmotionBreakdown(history);
  const chartData = buildChartData(history);
  const avgScore = history.length
    ? Math.round(history.reduce((a, e) => a + getMoodScore(e.emotion), 0) / history.length)
    : 0;
  const stressCount = history.filter(e => ['angry', 'fear', 'disgust'].includes(e.emotion)).length;
  const suggestion = getSuggestion(dominant);

  const pieData = Object.entries(breakdown)
    .filter(([k]) => k !== 'none')
    .map(([name, value]) => ({ name, value }));

  const isEmpty = history.length === 0;

  return (
    <div className="p-8 pb-20">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-slate-800 dark:text-white">Emotion Dashboard</h1>
          <p className="text-slate-500">{isEmpty ? 'No data yet — go to Live Detect to start.' : `Tracking ${history.length} detections in this session.`}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl glass border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-violet-500 transition-colors">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={() => { clearHistory(); refresh(); }} className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl glass border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <Trash2 size={15} /> Clear
          </button>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { icon: Smile, label: 'Dominant Mood', value: isEmpty ? '—' : dominant, color: 'text-green-500', bg: 'bg-green-500/10' },
          { icon: Activity, label: 'Stress Events', value: isEmpty ? '—' : `${stressCount}`, color: 'text-red-500', bg: 'bg-red-500/10' },
          { icon: TrendingUp, label: 'Avg Mood Score', value: isEmpty ? '—' : `${avgScore}%`, color: 'text-violet-500', bg: 'bg-violet-500/10' },
          { icon: Clock, label: 'Detections', value: isEmpty ? '—' : `${history.length}`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-6"
          >
            <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold mt-1 capitalize text-slate-800 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Mood Trajectory</h2>
          {isEmpty ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm italic">
              Start Live Detection to see your mood chart here.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={10} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Breakdown + Suggestion */}
        <div className="space-y-6">
          {!isEmpty && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Emotion Mix</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name" labelLine={false}>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={EMOTION_COLORS[entry.name] || '#8b5cf6'} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '10px', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">AI Insight</h2>
            {isEmpty ? (
              <p className="text-slate-400 text-sm">Run Live Detection first to get personalized AI insights.</p>
            ) : (
              <div className={`p-4 rounded-xl bg-${suggestion.color}-500/10 border border-${suggestion.color}-500/20`}>
                <h4 className={`font-semibold text-${suggestion.color}-500 mb-2`}>{suggestion.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{suggestion.body}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
