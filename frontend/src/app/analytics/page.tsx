"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { getHistory, getDominantEmotion, getMoodScore, getEmotionBreakdown, EmotionEntry } from '@/lib/emotionStore';

const EMOTION_COLORS: Record<string, string> = {
  happy: '#22c55e', neutral: '#64748b', sad: '#3b82f6',
  angry: '#ef4444', fear: '#a855f7', surprise: '#eab308',
  disgust: '#f97316', contempt: '#94a3b8'
};

export default function AnalyticsPage() {
  const [history, setHistory] = useState<EmotionEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
    const handler = () => setHistory(getHistory());
    window.addEventListener('emosense_update', handler);
    return () => window.removeEventListener('emosense_update', handler);
  }, []);

  const breakdown = getEmotionBreakdown(history);
  const dominant = getDominantEmotion(history);

  // Bar chart data: count per emotion
  const barData = Object.entries(breakdown)
    .filter(([k]) => k !== 'none')
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }));

  // Timeline: mood score over detections (sampled up to 30)
  const sample = history.filter(e => e.emotion !== 'none');
  const step = Math.max(1, Math.floor(sample.length / 30));
  const lineData = sample.filter((_, i) => i % step === 0).map((e, i) => ({
    index: i + 1,
    score: getMoodScore(e.emotion),
    emotion: e.emotion,
    time: new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  const isEmpty = history.length === 0;

  return (
    <div className="p-8 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">Emotion Analytics</h1>
        <p className="text-slate-500">{isEmpty ? 'No data yet — start Live Detection first.' : `Analysing ${history.length} data points from this session.`}</p>
      </header>

      {isEmpty ? (
        <div className="glass-card p-16 flex flex-col items-center text-center">
          <div className="text-6xl mb-6">📊</div>
          <h2 className="text-xl font-bold mb-2 text-slate-700 dark:text-white">No Session Data Yet</h2>
          <p className="text-slate-500 max-w-sm">Head to the <strong>Live Detect</strong> page and run the webcam for a few seconds. Your emotion analytics will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(breakdown).filter(([k]) => k !== 'none').slice(0, 4).map(([emotion, count], i) => (
              <motion.div
                key={emotion}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card p-5"
              >
                <div className="w-3 h-3 rounded-full mb-3" style={{ backgroundColor: EMOTION_COLORS[emotion] || '#8b5cf6' }} />
                <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{emotion}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{count}×</p>
                <p className="text-xs text-slate-400 mt-1">{Math.round((count / history.filter(e => e.emotion !== 'none').length) * 100)}% of session</p>
              </motion.div>
            ))}
          </div>

          {/* Emotion Frequency Bar Chart */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Emotion Frequency</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}
                    fill="#8b5cf6"
                    label={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mood Score Timeline */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Mood Score Timeline</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    formatter={(v: any, _: any, p: any) => [`${v} (${p.payload.emotion})`, 'Mood Score']}
                  />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Session log */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Recent Detections</h2>
            <div className="overflow-auto max-h-64 space-y-2 pr-1">
              {[...history].reverse().slice(0, 30).map((e, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EMOTION_COLORS[e.emotion] || '#64748b' }} />
                    <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-200">{e.emotion}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{e.confidence.toFixed(1)}%</span>
                    <span>{new Date(e.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
