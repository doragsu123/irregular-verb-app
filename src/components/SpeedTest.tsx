import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Verb, getFilteredVerbs, generateDummyOptions } from '../data/verbs';
import type { VerbStat } from '../types';

interface SpeedTestProps {
  onFinish: (score: number, total: number, results: { verbId: string, isCorrect: boolean }[]) => void;
  questionCount: number;
  verbFilter: string;
  verbStats: Record<string, VerbStat>;
  explanationTime: number;
  correctExplanationTime: number;
  isUntimed?: boolean;
  onRemoveWeak?: (verbId: string) => void;
}

export default function SpeedTest({ onFinish, questionCount, verbFilter, verbStats, explanationTime, correctExplanationTime, isUntimed = false, onRemoveWeak }: SpeedTestProps) {
  const [questions, setQuestions] = useState<Verb[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [options, setOptions] = useState<string[]>([]);
  const [targetForm, setTargetForm] = useState<'past' | 'pastParticiple'>('past');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const resultsRef = useRef<{ verbId: string, isCorrect: boolean }[]>([]);
  const isTransitioning = useRef(false);

  useEffect(() => {
    const verbs = getFilteredVerbs(questionCount, verbFilter, verbStats);
    setQuestions(verbs);
    setupQuestion(verbs[0]);
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
          nextQuestion(false); // wasCorrect doesn't matter here since it's already recorded
        }
        return;
      }
      const key = parseInt(e.key);
      if (!isNaN(key) && key >= 1 && key <= options.length) {
        handleSelect(options[key - 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options, feedback, currentIndex]);

  useEffect(() => {
    if (feedback !== null || isUntimed) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [currentIndex, feedback]);

  const setupQuestion = (verb: Verb) => {
    isTransitioning.current = false;
    const form = Math.random() > 0.5 ? 'past' : 'pastParticiple';
    setTargetForm(form);
    const dummies = generateDummyOptions(verb, form);
    const allOptions = [...dummies, verb[form]].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setTimeLeft(10);
    setFeedback(null);
    setSelectedOption(null);
  };

  const handleTimeout = () => {
    if (feedback !== null) return;
    setFeedback('incorrect');
    resultsRef.current.push({ verbId: questions[currentIndex].id, isCorrect: false });
    if (explanationTime > 0) {
      timeoutRef.current = setTimeout(() => nextQuestion(false), explanationTime * 1000);
    }
  };

  const handleSelect = (option: string) => {
    if (feedback !== null) return;
    setSelectedOption(option);
    const currentVerb = questions[currentIndex];
    const isCorrect = option === currentVerb[targetForm];
    
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
            timeoutRef.current = setTimeout(() => nextQuestion(true), correctExplanationTime * 1000);
          }
        }, 100);
      } else {
        if (correctExplanationTime > 0) {
          timeoutRef.current = setTimeout(() => nextQuestion(true), correctExplanationTime * 1000);
        }
      }
    } else {
      setFeedback('incorrect');
      feedbackSetAt.current = Date.now();
      if (explanationTime > 0) {
        timeoutRef.current = setTimeout(() => nextQuestion(false), explanationTime * 1000);
      }
    }
    resultsRef.current.push({ verbId: currentVerb.id, isCorrect });
  };

  const nextQuestion = (wasCorrect: boolean) => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    if (currentIndex + 1 >= questions.length) {
      // score state might be stale, so calculate from ref
      const finalScore = resultsRef.current.filter(r => r.isCorrect).length;
      onFinish(finalScore, questions.length, resultsRef.current);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setupQuestion(questions[currentIndex + 1]);
    }
  };

  const handleStop = () => {
    const finalScore = resultsRef.current.filter(r => r.isCorrect).length;
    onFinish(finalScore, resultsRef.current.length, resultsRef.current);
  };

  if (questions.length === 0) return null;

  const currentVerb = questions[currentIndex];
  const formLabel = targetForm === 'past' ? '過去形' : '過去分詞';

  return (
    <div className="max-w-md mx-auto">
      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6 px-2 h-5">
        <div className="flex items-center gap-4">
          <span>{currentIndex + 1} {questionCount === 0 ? '問目' : `/ ${questions.length}`}</span>
          <button 
            onClick={handleStop} 
            className="text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            終了する
          </button>
        </div>
        {!isUntimed && (
          <span className={timeLeft <= 3 ? 'text-red-500 font-bold' : ''}>残り {timeLeft}秒</span>
        )}
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
          <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">{currentVerb.base}</h3>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 inline-block px-3 py-1 rounded-full">
            {formLabel}は？
          </p>
        </div>

        {feedback !== null && (
          <div className="relative z-20 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-left">
            {feedback === 'incorrect' && <p className="text-sm font-bold text-red-500 mb-1">不正解... (正解: {currentVerb[targetForm]})</p>}
            {feedback === 'correct' && <p className="text-sm font-bold text-green-500 mb-1">正解！</p>}
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {currentVerb.base} - {currentVerb.past} - {currentVerb.pastParticiple}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              この動詞は {currentVerb.pattern} 型の不規則変化をします。
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 italic bg-gray-50 dark:bg-gray-900 p-2 rounded">
              "{currentVerb.example}"
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option, index) => {
          let btnClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700";
          if (feedback !== null) {
            if (option === currentVerb[targetForm]) {
              btnClass = "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400";
            } else if (option === selectedOption) {
              btnClass = "bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400";
            } else {
              btnClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600";
            }
          }
          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={feedback !== null}
              className={`relative py-4 px-2 text-base font-medium rounded-xl border transition-colors ${btnClass}`}
            >
              <span className="absolute top-2 left-3 text-xs opacity-40 font-mono">{index + 1}</span>
              {option}
            </button>
          );
        })}
      </div>

      {feedback !== null && (
        <div className="mt-6">
          <button
            onClick={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              nextQuestion(false);
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
