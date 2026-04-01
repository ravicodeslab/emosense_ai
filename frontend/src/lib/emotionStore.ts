// Shared emotion history store using localStorage + custom event for cross-page sync

export interface EmotionEntry {
  emotion: string;
  confidence: number;
  timestamp: number; // Unix ms
}

const STORAGE_KEY = 'emosense_history';
const MAX_ENTRIES = 200;

export function logEmotion(emotion: string, confidence: number) {
  const entry: EmotionEntry = { emotion, confidence, timestamp: Date.now() };
  const history = getHistory();
  history.push(entry);
  if (history.length > MAX_ENTRIES) history.splice(0, history.length - MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  window.dispatchEvent(new CustomEvent('emosense_update', { detail: entry }));
}

export function getHistory(): EmotionEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getDominantEmotion(history: EmotionEntry[]): string {
  if (!history.length) return 'None';
  const counts: Record<string, number> = {};
  history.forEach(e => { counts[e.emotion] = (counts[e.emotion] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function getEmotionBreakdown(history: EmotionEntry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  history.forEach(e => { counts[e.emotion] = (counts[e.emotion] || 0) + 1; });
  return counts;
}

export function getMoodScore(emotion: string): number {
  const scores: Record<string, number> = {
    happy: 95, surprise: 75, neutral: 60, contempt: 40,
    sad: 25, fear: 20, disgust: 15, angry: 10, none: 50
  };
  return scores[emotion.toLowerCase()] ?? 50;
}

export function getSuggestion(emotion: string): { title: string; body: string; color: string } {
  const suggestions: Record<string, { title: string; body: string; color: string }> = {
    happy: { title: '🌟 Optimal State', body: "You're in a great mood! Channel this energy into your most challenging tasks.", color: 'green' },
    sad: { title: '💙 Self-Care Prompt', body: "Feeling down? Try listening to upbeat music, reaching out to a friend, or taking a short walk outside.", color: 'blue' },
    angry: { title: '🌬️ Cool Down Phase', body: "Take 5 deep breaths. Step away from screens for 5 minutes to reset your nervous system.", color: 'red' },
    fear: { title: '🛡️ Grounding Exercise', body: "Try the 5-4-3-2-1 technique: name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.", color: 'purple' },
    surprise: { title: '✨ Stay Curious', body: "You seem engaged and alert! Great time to explore something new or tackle a creative challenge.", color: 'yellow' },
    disgust: { title: '🔄 Reset & Refocus', body: "Something is bothering you. Take a break, hydrate, and return with a fresh perspective.", color: 'orange' },
    contempt: { title: '🤝 Reflection Moment', body: "Consider what's causing friction. Journaling your thoughts for 5 minutes can provide clarity.", color: 'slate' },
    neutral: { title: '⚡ Maintain Focus', body: "You're in a calm, focused state. Apply the 20-20-20 rule: every 20 min, look 20 ft away for 20 sec.", color: 'violet' },
    none: { title: '📷 No Face Detected', body: "Move closer to the camera and ensure good lighting for accurate emotion analysis.", color: 'slate' },
  };
  return suggestions[emotion.toLowerCase()] ?? suggestions['neutral'];
}
