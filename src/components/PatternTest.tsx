import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Verb, VerbPattern, getFilteredVerbs } from '../data/verbs';
import type { VerbStat } from '../types';

interface PatternTestProps {
  onFinish: (score: number, total: number, results: { verbId: string, isCorrect: boolean }[]) => void;
  questionCount: number;
  verbFilter: string;
  verbStats: Record<string, VerbStat>;
  explanationTime: number;
  correctExplanationTime: number;
  onRemoveWeak?: (verbId: string) => void;
}

export default function PatternTest({ onFinish, questionCount, verbFilter, verbStats, explanationTime, correctExplanationTime, onRemoveWeak }: PatternTestProps) {
  const [questions, setQuestions] = useState<Verb[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<VerbPattern | null>(null);
  const resultsRef = useRef<{ verbId: string, isCorrect: boolean }[]>([]);
  const isTransitioning = useRef(false);

  const patterns: { id: VerbPattern; label: string; example: string }[] = [
    { id: 'A-A-A', label: 'A-A-A型', example: 'cut - cut - cut' },
    { id: 'A-B-B', label: 'A-B-B型', example: 'buy - bought - bought' },
    { id: 'A-B-A', label: 'A-B-A型', example: 'run - ran - run' },
    { id: 'A-B-C', label: 'A-B-C型', example: 'go - went - gone' },
    { id: 'A-A-B', label: 'A-A-B型', example: 'beat - beat - beaten' },
  ];

  useEffect(() => {
    const verbs = getFilteredVerbs(questionCount, verbFilter, verbStats);
    setQuestions(verbs);
    setupQuestion();
  }, []);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackSetAt = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.isComposing) return;
      if (feedback !== null) {
        if (e.key === 'Enter' && Date.now() - feedbackSetAt.current > 300) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          nextQuestion();
        }
        return;
      }
      const key = e.key;
      if (['1', '2', '3', '4', '5'].includes(key)) {
        const index = parseInt(key) - 1;
        if (index < patterns.length) {
          handleSelect(patterns[index].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedback, questions, currentIndex]);

  const setupQuestion = () => {
    isTransitioning.current = false;
    setFeedback(null);
    setSelectedPattern(null);
  };

  const handleSelect = (pattern: VerbPattern) => {
    if (feedback !== null) return;
    setSelectedPattern(pattern);
    const currentVerb = questions[currentIndex];
    const isCorrect = pattern === currentVerb.pattern;
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setFeedback('correct');
      feedbackSetAt.current = Date.now();
      
      const stat = verbStats[currentVerb.id];
      const isWeakThreshold = verbFilter === 'weak' && stat?.isManualWeak && (stat.manualCorrectCount || 0) + 1 >= 2;
      
      if (isWeakThreshold && onRemoveWeak) {
        setTimeout(() => {
          const answer = window.confirm(`「${currentVerb.base}」 は2回連続で正解しました！もう解けますか？\n（[OK]を押すと苦手マークを解除します）`);
          if (answer) {
            onRemoveWeak(currentVerb.id);
          }
          if (correctExplanationTime > 0) {
            timeoutRef.current = setTimeout(nextQuestion, correctExplanationTime * 1000);
          }
        }, 100);
      } else {
        if (correctExplanationTime > 0) {
          timeoutRef.current = setTimeout(nextQuestion, correctExplanationTime * 1000);
        }
      }
    } else {
      setFeedback('incorrect');
      feedbackSetAt.current = Date.now();
      if (explanationTime > 0) {
        timeoutRef.current = setTimeout(nextQuestion, explanationTime * 1000);
      }
    }
    resultsRef.current.push({ verbId: currentVerb.id, isCorrect });
  };

  const nextQuestion = () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    if (currentIndex + 1 >= questions.length) {
      const finalScore = resultsRef.current.filter(r => r.isCorrect).length;
      onFinish(finalScore, questions.length, resultsRef.current);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setupQuestion();
    }
  };

  const handleStop = () => {
    const finalScore = resultsRef.current.filter(r => r.isCorrect).length;
    onFinish(finalScore, resultsRef.current.length, resultsRef.current);
  };

  if (questions.length === 0) return null;
  const currentVerb = questions[currentIndex];

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6 px-2">
        <div className="flex items-center gap-4">
          <span>{currentIndex + 1} {questionCount === 0 ? '問目' : `/ ${questions.length}`}</span>
          <button 
            onClick={handleStop} 
            className="text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            終了する
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center mb-6 relative overflow-hidden">
        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            >
              <div className="text-[12rem] text-green-500/20 dark:text-green-400/20 font-bold leading-none select-none">〇</div>
            </motion.div>
          )}
          {feedback === 'incorrect' && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: 30 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
            >
              <div className="text-[12rem] text-red-500/20 dark:text-red-400/20 font-bold leading-none select-none">×</div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {feedback === 'correct' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-4 right-4 text-green-500 font-bold text-xl"
            >
              〇
            </motion.div>
          )}
          {feedback === 'incorrect' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-4 right-4 text-red-500 font-bold text-xl"
            >
              ×
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="relative z-20">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{currentVerb.japanese}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{currentVerb.base}</h3>
        </div>
        
        {feedback !== null && (
          <div className="relative z-20 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-left">
            {feedback === 'incorrect' && <p className="text-sm font-bold text-red-500 mb-1">不正解... (正解: {currentVerb.pattern} 型)</p>}
            {feedback === 'correct' && <p className="text-sm font-bold text-green-500 mb-1">正解！</p>}
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {currentVerb.base} - {currentVerb.past} - {currentVerb.pastParticiple}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic bg-gray-50 dark:bg-gray-900 p-2 rounded">
              "{currentVerb.example}"
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {patterns.map((pattern, index) => {
          let btnClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700";
          if (feedback !== null) {
            if (pattern.id === currentVerb.pattern) {
              btnClass = "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400";
            } else if (pattern.id === selectedPattern) {
              btnClass = "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400";
            } else {
              btnClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600";
            }
          }
          return (
            <button
              key={pattern.id}
              onClick={() => handleSelect(pattern.id)}
              disabled={feedback !== null}
              className={`py-4 px-2 rounded-xl border transition-colors flex flex-col items-center gap-1 relative ${btnClass}`}
            >
              <span className="absolute top-2 left-3 text-xs text-gray-400 dark:text-gray-500">{index + 1}</span>
              <span className="font-bold text-sm">{pattern.label}</span>
              <span className="text-xs opacity-70">{pattern.example}</span>
            </button>
          );
        })}
      </div>

      {feedback !== null && (
        <div className="mt-6">
          <button
            onClick={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              nextQuestion();
            }}
            className="w-full py-4 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 rounded-xl font-medium transition-colors shadow-sm"
          >
            次へ (Enter)
          </button>
        </div>
      )}
    </div>
  );
}
