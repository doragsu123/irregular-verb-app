import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Verb, getFilteredVerbs } from '../data/verbs';
import type { VerbStat } from '../types';

interface TypingTestProps {
  onFinish: (score: number, total: number, results: { verbId: string, isCorrect: boolean }[]) => void;
  questionCount: number;
  verbFilter: string;
  verbStats: Record<string, VerbStat>;
  explanationTime: number;
  correctExplanationTime: number;
  onRemoveWeak?: (verbId: string) => void;
}

export default function TypingTest({ onFinish, questionCount, verbFilter, verbStats, explanationTime, correctExplanationTime, onRemoveWeak }: TypingTestProps) {
  const [questions, setQuestions] = useState<Verb[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [targetForm, setTargetForm] = useState<'base' | 'past' | 'pastParticiple'>('base');
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<{ verbId: string, isCorrect: boolean }[]>([]);
  const isTransitioning = useRef(false);

  useEffect(() => {
    const verbs = getFilteredVerbs(questionCount, verbFilter, verbStats);
    setQuestions(verbs);
    setupQuestion(verbs[0]);
  }, []);

  const setupQuestion = (verb: Verb) => {
    isTransitioning.current = false;
    const forms: ('base' | 'past' | 'pastParticiple')[] = ['base', 'past', 'pastParticiple'];
    const randomForm = forms[Math.floor(Math.random() * forms.length)];
    setTargetForm(randomForm);
    setUserInput('');
    setFeedback(null);
    
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackSetAt = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.isComposing) return;
      if (e.key === 'Enter' && feedback !== null && Date.now() - feedbackSetAt.current > 300) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        nextQuestion();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [feedback, currentIndex, questions]);

  const checkAnswer = () => {
    if (feedback !== null) return;
    const currentVerb = questions[currentIndex];
    const expected = currentVerb[targetForm];
    
    const expectedAnswers = expected.split('/').map(s => s.trim().toLowerCase());
    const normalizedActual = userInput.replace(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).trim().toLowerCase();
    const isCorrect = expectedAnswers.includes(normalizedActual) || normalizedActual === expected.toLowerCase();
    
    if (isCorrect) {
      setScore(prev => prev + 1);
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
            setTimeout(nextQuestion, correctExplanationTime * 1000);
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
      setCurrentIndex(prev => prev + 1);
      setupQuestion(questions[currentIndex + 1]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && userInput.trim()) {
      e.preventDefault();
      e.stopPropagation();
      checkAnswer();
    }
  };

  const handleStop = () => {
    const finalScore = resultsRef.current.filter(r => r.isCorrect).length;
    onFinish(finalScore, resultsRef.current.length, resultsRef.current);
  };

  if (questions.length === 0) return null;

  const currentVerb = questions[currentIndex];
  const formLabels = { base: '原形', past: '過去形', pastParticiple: '過去分詞' };

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
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-8">{formLabels[targetForm]}を入力</p>

          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={feedback !== null}
            className={`w-full text-center text-2xl font-mono py-3 border-b-2 outline-none transition-colors bg-transparent ${
              feedback === null ? 'border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-100 text-gray-900 dark:text-gray-100' :
              feedback === 'correct' ? 'border-green-500 text-green-600 dark:text-green-400' : 'border-red-500 text-red-600 dark:text-red-400'
            }`}
            autoComplete="off"
            spellCheck="false"
          />
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

      <button
        onClick={feedback !== null ? () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          nextQuestion();
        } : checkAnswer}
        disabled={feedback === null && !userInput.trim()}
        className="w-full py-4 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500 text-white dark:text-gray-900 rounded-xl font-medium transition-colors"
      >
        {feedback !== null ? '次へ (Enter)' : '回答する'}
      </button>
    </div>
  );
}
