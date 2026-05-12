import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Verb, getFilteredVerbs } from '../data/verbs';
import type { VerbStat } from '../types';

interface FillInTheBlankTestProps {
  onFinish: (score: number, total: number, results: { verbId: string, isCorrect: boolean }[]) => void;
  questionCount: number;
  verbFilter: string;
  verbStats: Record<string, VerbStat>;
  explanationTime: number;
  correctExplanationTime: number;
  onRemoveWeak?: (verbId: string) => void;
}

export default function FillInTheBlankTest({ onFinish, questionCount, verbFilter, verbStats, explanationTime, correctExplanationTime, onRemoveWeak }: FillInTheBlankTestProps) {
  const [questions, setQuestions] = useState<Verb[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hiddenIndices, setHiddenIndices] = useState<number[]>([]);
  const [userInputs, setUserInputs] = useState<{ [key: number]: string }>({});
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resultsRef = useRef<{ verbId: string, isCorrect: boolean }[]>([]);
  const isTransitioning = useRef(false);

  useEffect(() => {
    const verbs = getFilteredVerbs(questionCount, verbFilter, verbStats);
    setQuestions(verbs);
    setupQuestion(verbs[0]);
  }, []);

  const setupQuestion = (verb: Verb) => {
    isTransitioning.current = false;
    const numHidden = Math.random() > 0.7 ? 2 : 1;
    const indices: number[] = [];
    while (indices.length < numHidden) {
      const r = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
      if (!indices.includes(r)) indices.push(r);
    }
    setHiddenIndices(indices.sort());
    setUserInputs({});
    setFeedback(null);
    
    setTimeout(() => {
      const firstInput = inputRefs.current.find(ref => !!ref);
      if (firstInput) firstInput.focus();
    }, 100);
  };

  const handleInputChange = (index: number, value: string) => {
    setUserInputs(prev => ({ ...prev, [index]: value }));
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
    const forms = [currentVerb.japanese, currentVerb.base, currentVerb.past, currentVerb.pastParticiple];
    
    let isCorrect = true;
    for (const idx of hiddenIndices) {
      const expected = forms[idx];
      const actual = userInputs[idx] || '';
      const normalizedActual = actual.replace(/[Ａ-Ｚａ-ｚ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).trim().toLowerCase();
      const expectedAnswers = expected.split('/').map(s => s.trim().toLowerCase());
      if (!expectedAnswers.includes(normalizedActual) && normalizedActual !== expected.toLowerCase()) {
        isCorrect = false;
        break;
      }
    }

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

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter') {
      if (feedback === null) {
        e.preventDefault();
        e.stopPropagation();
        const allFilled = hiddenIndices.every(idx => userInputs[idx]?.trim());
        if (allFilled) {
          checkAnswer();
        }
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentPos = hiddenIndices.indexOf(currentIndex);
      if (currentPos > 0) {
        const prevIndex = hiddenIndices[currentPos - 1];
        inputRefs.current[prevIndex]?.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentPos = hiddenIndices.indexOf(currentIndex);
      if (currentPos < hiddenIndices.length - 1) {
        const nextIndex = hiddenIndices[currentPos + 1];
        inputRefs.current[nextIndex]?.focus();
      }
    }
  };

  const handleStop = () => {
    const finalScore = resultsRef.current.filter(r => r.isCorrect).length;
    onFinish(finalScore, resultsRef.current.length, resultsRef.current);
  };

  if (questions.length === 0) return null;

  const currentVerb = questions[currentIndex];
  const forms = [currentVerb.japanese, currentVerb.base, currentVerb.past, currentVerb.pastParticiple];
  const labels = ['日本語', '原形', '過去形', '過去分詞'];

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

      <motion.div
        animate={feedback === 'incorrect' ? { x: [-10, 10, -10, 10, 0] } : feedback === 'correct' ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.4 }}
        className={`rounded-2xl border p-6 mb-6 relative overflow-hidden transition-colors duration-300 ${
          feedback === 'correct'
            ? 'bg-green-50/50 dark:bg-green-900/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
            : feedback === 'incorrect'
            ? 'bg-red-50/50 dark:bg-red-900/20 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}
      >
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
        
        <div className="flex flex-col gap-4 mt-4 relative z-20">
          {forms.map((form, index) => {
            const isHidden = hiddenIndices.includes(index);
            return (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                <span className="text-sm text-gray-500 dark:text-gray-400 w-20 text-left">{labels[index]}</span>
                {isHidden ? (
                  <div className="flex-1 ml-4 flex flex-col">
                    <input
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      value={userInputs[index] || ''}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      disabled={feedback !== null}
                      className={`w-full text-right text-lg font-medium outline-none bg-transparent ${
                        feedback === 'correct' ? 'text-green-600 dark:text-green-400' : feedback === 'incorrect' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                      }`}
                      placeholder="入力..."
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>
                ) : (
                  <span className="flex-1 ml-4 text-right text-lg font-medium text-gray-900 dark:text-gray-100">{form}</span>
                )}
              </div>
            );
          })}
        </div>

        {feedback !== null && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-left">
            {feedback === 'incorrect' && <p className="text-sm font-bold text-red-500 mb-1">不正解... (正解は以下の通りです)</p>}
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
      </motion.div>

      <button
        onClick={feedback !== null ? () => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          nextQuestion();
        } : checkAnswer}
        disabled={feedback === null && hiddenIndices.some(idx => !userInputs[idx]?.trim())}
        className="w-full py-4 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500 text-white dark:text-gray-900 rounded-xl font-medium transition-colors"
      >
        {feedback !== null ? '次へ (Enter)' : '回答する'}
      </button>
    </div>
  );
}
