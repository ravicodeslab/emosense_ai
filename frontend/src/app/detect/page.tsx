"use client";

import { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Camera, Radio, Activity, Lightbulb } from 'lucide-react';
import axios from 'axios';
import { logEmotion } from '@/lib/emotionStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function DetectPage() {
  const webcamRef = useRef<Webcam>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [emotion, setEmotion] = useState<{ emotion: string, confidence: number } | null>(null);
  const [error, setError] = useState('');

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const res = await axios.post(`${API_URL}/emotion/detect`, { image_base64: imageSrc });
      const detectedEmotion = res.data.emotion;
      const confidence = res.data.confidence;
      setEmotion({ emotion: detectedEmotion, confidence });
      if (detectedEmotion && detectedEmotion !== 'none') {
        logEmotion(detectedEmotion, confidence);
      }
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Detection failed. Please ensure the backend is running & face is visible.');
    }
  }, [webcamRef]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDetecting) {
      interval = setInterval(() => {
        capture();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isDetecting, capture]);

  const emotionColors: Record<string, string> = {
    happy: 'text-green-500 bg-green-500/10 border-green-500/20',
    sad: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    angry: 'text-red-500 bg-red-500/10 border-red-500/20',
    neutral: 'text-slate-500 bg-slate-500/10 border-slate-500/20',
    fear: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    surprise: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    disgust: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  };

  const currentTheme = emotion
    ? emotionColors[emotion.emotion.toLowerCase()] || emotionColors['neutral']
    : 'text-slate-500 bg-slate-500/10 border-slate-500/20';

  return (
    <div className="p-8 h-full">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-white">Live Emotion Detection</h1>
          <p className="text-slate-500">Analyze real-time emotional states using our AI engine.</p>
        </div>
        <button
          onClick={() => setIsDetecting(!isDetecting)}
          className={`px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all min-w-[160px] ${
            isDetecting
              ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
              : 'bg-violet-600 text-white shadow-lg py-3 hover:bg-violet-500 shadow-violet-500/20'
          }`}
        >
          {isDetecting
            ? <><Radio size={18} className="animate-pulse" /> Stop Stream</>
            : <><Camera size={18} /> Start Stream</>
          }
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Webcam */}
        <div className="lg:col-span-2 relative glass-card overflow-hidden flex items-center justify-center min-h-[400px] lg:min-h-[500px] bg-slate-900 border-none shadow-2xl">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover opacity-90"
            videoConstraints={{ facingMode: "user" }}
          />

          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-xs font-semibold tracking-wider text-white border border-white/10 shadow-lg z-10">
            <span className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></span>
            {isDetecting ? 'LIVE SECURE FEED' : 'IDLE'}
          </div>

          {!isDetecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center shadow-2xl backdrop-blur-xl">
                <Camera size={56} className="mx-auto mb-4 text-white/40" />
                <p className="text-white text-lg font-medium tracking-wide">Stream Offline</p>
                <p className="text-white/50 text-sm mt-2 font-light">Click start to begin continuous analysis</p>
              </div>
            </div>
          )}

          {error && isDetecting && (
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-red-500/90 backdrop-blur-md text-white text-sm rounded-xl text-center shadow-2xl border border-red-400 z-30 font-medium">
              {error}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-slate-200 dark:border-slate-800/50 shadow-xl">
            <h2 className="text-sm font-bold mb-4 text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} />
              Real-time Output
            </h2>

            {emotion ? (
              <motion.div
                key={emotion.emotion}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`p-6 rounded-2xl border ${currentTheme} transition-all duration-500 shadow-inner`}
              >
                <div className="text-xs font-semibold opacity-70 mb-2 uppercase tracking-widest">Dominant</div>
                <div className="text-5xl font-black capitalize mb-6 tracking-tight">{emotion.emotion}</div>
                <div className="w-full bg-black/5 dark:bg-black/20 rounded-full h-3 overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${emotion.confidence}%` }}
                    className="h-full bg-current opacity-70 rounded-full"
                    transition={{ type: "spring", stiffness: 50 }}
                  />
                </div>
                <div className="text-sm font-semibold opacity-90 text-right">{emotion.confidence.toFixed(1)}% Confidence</div>
              </motion.div>
            ) : (
              <div className="px-6 py-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-slate-400 text-sm italic">
                <Radio size={32} className="mb-3 opacity-20" />
                Awaiting connection
              </div>
            )}
          </div>

          <div className="glass-card p-6 shadow-xl border border-slate-200 dark:border-slate-800/50">
            <h2 className="text-sm font-bold mb-4 text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Lightbulb size={16} />
              AI Recommendation
            </h2>
            {!emotion ? (
              <p className="text-slate-400 text-sm">System will offer suggestions based on psychological inputs.</p>
            ) : emotion.emotion.toLowerCase() === 'angry' ? (
              <div className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-red-500 block mb-1">Cool Down Phase</span>
                Your inputs indicate high tension. Please pause your current task and take a brief moment to reset.
              </div>
            ) : emotion.emotion.toLowerCase() === 'sad' ? (
              <div className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-blue-500 block mb-1">Self-Care Prompt</span>
                It looks like you're feeling down. Listening to upbeat music or taking a walk can boost your mood instantly.
              </div>
            ) : emotion.emotion.toLowerCase() === 'happy' ? (
              <div className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-green-500 block mb-1">Optimal State</span>
                You are currently in a highly productive and positive state. Great work!
              </div>
            ) : (
              <div className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-slate-500 block mb-1">Baseline Routine</span>
                Emotional state is stable. Remember to practice the 20-20-20 rule to prevent eye strain.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
