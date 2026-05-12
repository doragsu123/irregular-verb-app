import React, { useState, useMemo, useRef } from 'react';
import { Search, TrendingUp, CheckCircle2, XCircle, CircleDashed, Volume2, Play, Settings, Square } from 'lucide-react';
import { verbs } from '../data/verbs';
import type { Progress } from '../types';

interface VerbListProps {
  progress: Progress;
  voiceURI: string | null;
}

export default function VerbList({ progress, voiceURI }: VerbListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [patternFilter, setPatternFilter] = useState<string>('all');
  const [intervalSec, setIntervalSec] = useState<number>(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [playingVerbId, setPlayingVerbId] = useState<string | null>(null);
  const activeSequenceRef = useRef<string | null>(null);

  const availablePatterns = useMemo(() => {
    const patterns = new Set(verbs.map(v => v.pattern));
    return Array.from(patterns).sort();
  }, []);

  const filteredVerbs = verbs.filter(v =>
    (patternFilter === 'all' || v.pattern === patternFilter) &&
    (v.base.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.past.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.pastParticiple.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.japanese.includes(searchTerm))
  );

  const patternStats = useMemo(() => {
    const stats: Record<string, { correct: number, total: number }> = {};
    verbs.forEach(verb => {
      if (!stats[verb.pattern]) {
        stats[verb.pattern] = { correct: 0, total: 0 };
      }
      const verbStat = progress.verbStats[verb.id];
      if (verbStat) {
        stats[verb.pattern].correct += verbStat.correct;
        stats[verb.pattern].total += verbStat.total;
      }
    });
    return stats;
  }, [progress]);

  const getMastery = (verbId: string) => {
    const stat = progress.verbStats[verbId];
    if (!stat || stat.total === 0) return { label: '未学習', color: 'text-gray-400', bg: 'bg-gray-50', icon: <CircleDashed size={14} /> };
    const accuracy = stat.correct / stat.total;
    if (accuracy >= 0.8 && stat.total >= 2) return { label: '得意', color: 'text-green-700', bg: 'bg-green-50', icon: <CheckCircle2 size={14} /> };
    if (accuracy <= 0.5 && stat.total >= 2) return { label: '苦手', color: 'text-red-700', bg: 'bg-red-50', icon: <XCircle size={14} /> };
    return { label: '学習中', color: 'text-blue-700', bg: 'bg-blue-50', icon: <TrendingUp size={14} /> };
  };

  const playSound = (text: string) => {
    if (!window.speechSynthesis) return;
    const textToPlay = text.split('/')[0].trim(); // Play only the first option if there are multiple
    const utterance = new SpeechSynthesisUtterance(textToPlay);
    utterance.lang = 'en-US';
    
    if (voiceURI) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.voiceURI === voiceURI);
      if (voice) utterance.voice = voice;
    }
    
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const playWord = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }
      const textToPlay = text.split('/')[0].trim();
      const utterance = new SpeechSynthesisUtterance(textToPlay);
      utterance.lang = 'en-US';
      
      if (voiceURI) {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.voiceURI === voiceURI);
        if (voice) utterance.voice = voice;
      }
      
      utterance.rate = 0.9;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    });
  };

  const playSequence = async (verb: typeof verbs[0]) => {
    window.speechSynthesis.cancel();
    
    if (playingVerbId === verb.id) {
      setPlayingVerbId(null);
      activeSequenceRef.current = null;
      return;
    }

    const sequenceId = Math.random().toString();
    activeSequenceRef.current = sequenceId;
    setPlayingVerbId(verb.id);
    
    const forms = [verb.base, verb.past, verb.pastParticiple];
    for (let i = 0; i < forms.length; i++) {
      if (activeSequenceRef.current !== sequenceId) break;
      await playWord(forms[i]);
      if (i < forms.length - 1 && activeSequenceRef.current === sequenceId) {
        await new Promise(resolve => setTimeout(resolve, intervalSec * 1000));
      }
    }
    
    if (activeSequenceRef.current === sequenceId) {
      setPlayingVerbId(null);
      activeSequenceRef.current = null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4">パターン別の学習状況</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-2">
          {Object.entries(patternStats).map(([pattern, stat]: [string, any]) => {
            const accuracy = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
            return (
              <div key={pattern} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-center border border-gray-100 dark:border-gray-800">
                <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{pattern}</div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {stat.total > 0 ? `${accuracy}%` : '-'}
                </div>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{stat.total}問</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">動詞活用変化一覧表</h2>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="relative flex-1 w-full relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 dark:text-gray-500" size={20} />
            </div>
            <input
              type="text"
              placeholder="英単語や日本語で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div className="w-full sm:w-auto flex gap-3">
             <select
              value={patternFilter}
              onChange={(e) => setPatternFilter(e.target.value)}
              className="flex-1 sm:w-auto px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 text-gray-900 dark:text-gray-100 cursor-pointer"
             >
               <option value="all">すべての型</option>
               {availablePatterns.map((pattern) => (
                 <option key={pattern} value={pattern}>{pattern}型</option>
               ))}
             </select>
            <div className="relative">
              <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title="連続再生の設定"
            >
              <Settings size={20} />
            </button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 z-10">
                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">連続再生の間隔</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.5"
                    value={intervalSec}
                    onChange={(e) => setIntervalSec(parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12 text-right">{intervalSec.toFixed(1)}秒</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                <th className="pb-3 font-medium pl-4 w-12">番号</th>
                <th className="pb-3 font-medium">状況</th>
                <th className="pb-3 font-medium">原形</th>
                <th className="pb-3 font-medium">過去形</th>
                <th className="pb-3 font-medium">過去分詞</th>
                <th className="pb-3 font-medium">日本語</th>
                <th className="pb-3 font-medium">型</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredVerbs.map((verb) => {
                const mastery = getMastery(verb.id);
                const verbIndex = verbs.findIndex(v => v.id === verb.id) + 1;
                return (
                  <tr key={verb.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 pl-4 text-gray-400 dark:text-gray-500 font-mono">{verbIndex}</td>
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2">
                        <div className={`inline-flex items-center justify-center w-20 gap-1 px-1 py-1 rounded-md text-xs font-medium ${mastery.bg} ${mastery.color}`}>
                          {mastery.icon}
                          <span>{mastery.label}</span>
                        </div>
                        <button
                          onClick={() => playSequence(verb)}
                          className={`p-1.5 rounded-full transition-colors ${
                            playingVerbId === verb.id 
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                              : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                          }`}
                          title="3活用を連続再生"
                        >
                          {playingVerbId === verb.id ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3">
                      <button 
                        onClick={() => playSound(verb.base)}
                        className="font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left flex items-center gap-1 group"
                      >
                        <span>{verb.base}</span>
                        <Volume2 size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 dark:text-blue-400" />
                      </button>
                    </td>
                    <td className="py-3">
                      <button 
                        onClick={() => playSound(verb.past)}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left flex items-center gap-1 group"
                      >
                        <span>{verb.past}</span>
                        <Volume2 size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 dark:text-blue-400" />
                      </button>
                    </td>
                    <td className="py-3">
                      <button 
                        onClick={() => playSound(verb.pastParticiple)}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left flex items-center gap-1 group"
                      >
                        <span>{verb.pastParticiple}</span>
                        <Volume2 size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 dark:text-blue-400" />
                      </button>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{verb.japanese}</td>
                    <td className="py-3 text-gray-400 dark:text-gray-500 text-xs">{verb.pattern}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredVerbs.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              見つかりませんでした
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
