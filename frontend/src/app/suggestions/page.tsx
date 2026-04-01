"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Wind, Music, Sun, Coffee, BookOpen, Smile, Zap } from 'lucide-react';
import { getHistory, getDominantEmotion, getSuggestion, getEmotionBreakdown, EmotionEntry } from '@/lib/emotionStore';

const activities = [
  { icon: Wind, label: '4-7-8 Breathing', desc: 'Inhale 4s, hold 7s, exhale 8s. Repeat 4 times.', color: 'blue', forEmotions: ['angry', 'fear', 'sad'] },
  { icon: Music, label: 'Music Therapy', desc: 'Play 15 mins of your favourite upbeat playlist.', color: 'green', forEmotions: ['sad', 'neutral', 'disgust'] },
  { icon: Sun, label: 'Sunlight Break', desc: 'Step outside for 5 mins of natural light exposure.', color: 'yellow', forEmotions: ['sad', 'neutral', 'contempt'] },
  { icon: Coffee, label: 'Hydrate & Reset', desc: 'Drink a glass of water. Dehydration affects mood.', color: 'orange', forEmotions: ['angry', 'disgust', 'contempt'] },
  { icon: BookOpen, label: 'Gratitude Journal', desc: 'Write 3 things you are grateful for right now.', color: 'violet', forEmotions: ['sad', 'fear', 'angry'] },
  { icon: Smile, label: 'Smile Exercise', desc: 'Hold a genuine smile for 60 seconds — it signals calm to your brain.', color: 'green', forEmotions: ['neutral', 'sad'] },
  { icon: Zap, label: 'Power Posture', desc: 'Stand tall for 2 mins with hands on hips to boost confidence.', color: 'purple', forEmotions: ['fear', 'sad', 'neutral'] },
  { icon: Heart, label: 'Self-Compassion Check', desc: 'Say aloud: "I\'m doing my best and that is enough."', color: 'pink', forEmotions: ['sad', 'fear', 'disgust', 'angry'] },
];

const emotionTips: Record<string, { quote: string; author: string }> = {
  happy: { quote: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
  sad: { quote: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
  angry: { quote: "For every minute you are angry, you lose sixty seconds of happiness.", author: "Ralph Waldo Emerson" },
  fear: { quote: "You gain strength, courage and confidence by every experience in which you really stop to look fear in the face.", author: "Eleanor Roosevelt" },
  neutral: { quote: "The present moment is your point of power.", author: "Louise Hay" },
  surprise: { quote: "Wonder is the beginning of wisdom.", author: "Socrates" },
  disgust: { quote: "When something feels wrong, trust yourself to walk away and reset.", author: "" },
  contempt: { quote: "Understanding is the first step to acceptance.", author: "J.K. Rowling" },
};

export default function WellbeingPage() {
  const [history, setHistory] = useState<EmotionEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
    const handler = () => setHistory(getHistory());
    window.addEventListener('emosense_update', handler);
    return () => window.removeEventListener('emosense_update', handler);
  }, []);

  const dominant = getDominantEmotion(history).toLowerCase();
  const suggestion = getSuggestion(dominant);
  const tip = emotionTips[dominant] || emotionTips['neutral'];
  const isEmpty = history.length === 0;

  const recommended = activities.filter(a => a.forEmotions.includes(dominant));
  const others = activities.filter(a => !a.forEmotions.includes(dominant));

  return (
    <div className="p-8 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">Wellbeing Centre</h1>
        <p className="text-slate-500">
          {isEmpty
            ? 'Personalised recommendations will appear after your first Live Detection session.'
            : `Based on your dominant mood: ${dominant.charAt(0).toUpperCase() + dominant.slice(1)}`}
        </p>
      </header>

      {/* Primary suggestion banner */}
      {!isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass-card p-8 mb-8 border-l-4 border-${suggestion.color}-500`}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">AI Wellbeing Suggestion</div>
              <h2 className={`text-2xl font-bold mb-3 text-${suggestion.color}-500`}>{suggestion.title}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{suggestion.body}</p>
            </div>
            <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-xl shadow-violet-500/30">
              <Heart size={36} className="text-white" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Inspirational Quote */}
      {!isEmpty && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8 text-center"
        >
          <p className="text-lg italic text-slate-700 dark:text-slate-300 mb-3">"{tip.quote}"</p>
          {tip.author && <p className="text-sm text-slate-400 font-medium">— {tip.author}</p>}
        </motion.div>
      )}

      {/* Recommended Activities */}
      <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">
        {isEmpty ? 'All Wellbeing Activities' : `Recommended for ${dominant.charAt(0).toUpperCase() + dominant.slice(1)} Mood`}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {(isEmpty ? activities : recommended.length ? recommended : activities).map((act, i) => {
          const Icon = act.icon;
          return (
            <motion.div
              key={act.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card p-5 cursor-pointer hover:shadow-lg transition-shadow group"
            >
              <div className={`w-12 h-12 rounded-xl bg-${act.color}-500/10 text-${act.color}-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-white mb-2">{act.label}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{act.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Other activities */}
      {!isEmpty && others.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Other Activities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {others.map((act, i) => {
              const Icon = act.icon;
              return (
                <motion.div
                  key={act.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-5 opacity-70 hover:opacity-100 transition-opacity"
                >
                  <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-3`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1 text-sm">{act.label}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{act.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
