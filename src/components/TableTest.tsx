import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { Verb, getFilteredVerbs, verbs } from '../data/verbs';
import { VerbStat } from '../types';

interface TableTestProps {
  onFinish: (score: number, total: number, results: {verbId: string, isCorrect: boolean}[]) => void;
  count: number;
  mode: 'random' | 'weak' | 'custom';
  verbStats: Record<string, VerbStat>;
  customVerbs?: Verb[];
  onToggleWeak?: (verbId: string) => void;
  onRemoveWeak?: (verbId: string) => void;
}

interface CellState {
  value: string;
  isCorrect?: boolean;
}

interface RowState {
  past: CellState;
  pastParticiple: CellState;
}

export default function TableTest({ onFinish, count, mode, verbStats, customVerbs, onToggleWeak, onRemoveWeak }: TableTestProps) {
  const [questions, setQuestions] = useState<Verb[]>([]);
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [testResults, setTestResults] = useState<{ verbId: string, isCorrect: boolean }[]>([]);

  useEffect(() => {
    let selected: Verb[] = [];
    if (mode === 'custom' && customVerbs) {
      selected = customVerbs;
    } else {
      const filter = mode === 'weak' ? 'weak' : 'all';
      // In TableTest, we don't want duplicate verbs even if count > total verbs
      // Also, if count is 0 (endless/all), we want ALL verbs, not 1000 with duplicates.
      if (count === 0) {
        selected = getFilteredVerbs(verbs.length, filter, verbStats);
      } else {
        selected = getFilteredVerbs(count, filter, verbStats);
      }
      
      // Deduplicate
      selected = selected.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    }
    setQuestions(selected);

    const initialRowStates: Record<string, RowState> = {};
    selected.forEach(verb => {
      initialRowStates[verb.id] = {
        past: { value: '' },
        pastParticiple: { value: '' }
      };
    });
    setRowStates(initialRowStates);
  }, [count, mode, verbStats, customVerbs]);

  const handleDisplayValueChange = (verbId: string, field: 'past' | 'pastParticiple', value: string) => {
    if (isSubmitted) return;
    setRowStates(prev => ({
      ...prev,
      [verbId]: {
        ...prev[verbId],
        [field]: { value }
      }
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, verbId: string) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      onToggleWeak?.(verbId);
    }
  };

  const handleSubmit = () => {
    let newScore = 0;
    const finalResults = questions.map(verb => {
      const state = rowStates[verb.id];
      const pastAnswers = verb.past.toLowerCase().split('/').map(s => s.trim());
      const ppAnswers = verb.pastParticiple.toLowerCase().split('/').map(s => s.trim());
      
      const isPastCorrect = pastAnswers.includes(state.past.value.trim().toLowerCase()) || state.past.value.trim().toLowerCase() === verb.past.toLowerCase();
      const isPpCorrect = ppAnswers.includes(state.pastParticiple.value.trim().toLowerCase()) || state.pastParticiple.value.trim().toLowerCase() === verb.pastParticiple.toLowerCase();
      const isCorrect = isPastCorrect && isPpCorrect;
      
      if (isCorrect) newScore++;
      
      setRowStates(prev => ({
        ...prev,
        [verb.id]: {
          ...prev[verb.id],
          past: { ...prev[verb.id].past, isCorrect: isPastCorrect },
          pastParticiple: { ...prev[verb.id].pastParticiple, isCorrect: isPpCorrect }
        }
      }));
      
      return { verbId: verb.id, isCorrect };
    });
    
    setTestResults(finalResults);
    setFinalScore(newScore);
    setIsSubmitted(true);
    
    if (mode === 'weak' && onRemoveWeak) {
      setTimeout(() => {
        finalResults.forEach(r => {
          if (r.isCorrect) {
            const stat = verbStats[r.verbId];
            if (stat && stat.isManualWeak) {
              const currentManualCount = stat.manualCorrectCount || 0;
              if (currentManualCount + 1 >= 2) {
                const verbBase = questions.find(v => v.id === r.verbId)?.base || '';
                const answer = window.confirm(`「${verbBase}」 は2回連続で正解しました！もう解けますか？\n（[OK]を押すと苦手マークを解除します）`);
                if (answer) {
                  onRemoveWeak(r.verbId);
                }
              }
            }
          }
        });
      }, 100);
    }
  };

  const handleNext = () => {
    onFinish(finalScore, questions.length, testResults);
  };

  if (questions.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr className="text-sm text-gray-500 dark:text-gray-400">
                <th className="py-3 px-4 font-medium w-1/5">日本語</th>
                <th className="py-3 px-4 font-medium w-1/5">原形</th>
                <th className="py-3 px-4 font-medium w-1/4">過去形</th>
                <th className="py-3 px-4 font-medium w-1/4">過去分詞形</th>
                <th className="py-3 px-4 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {questions.map((verb) => {
                const state = rowStates[verb.id];
                if (!state) return null;
                
                const isPastCorrect = state.past.isCorrect;
                const isPpCorrect = state.pastParticiple.isCorrect;
                
                const bothCorrect = isPastCorrect && isPpCorrect;
                const evaluated = isSubmitted;

                return (
                  <tr key={verb.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4">{verb.japanese}</td>
                    <td className="py-3 px-4 font-medium flex items-center gap-2">
                       {verb.base}
                       {verbStats[verb.id]?.isManualWeak && (
                         <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded" title="手動設定した苦手マーク">苦手</span>
                       )}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={state.past.value}
                        onChange={(e) => handleDisplayValueChange(verb.id, 'past', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, verb.id)}
                        placeholder="入力"
                        disabled={isSubmitted}
                        className={`w-full p-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                           evaluated 
                             ? isPastCorrect 
                                ? 'border-green-500 text-green-700 dark:text-green-400 dark:border-green-500/50 bg-green-50 dark:bg-green-900/20' 
                                : 'border-red-500 text-red-700 dark:text-red-400 dark:border-red-500/50 bg-red-50 dark:bg-red-900/20'
                             : 'border-gray-300 dark:border-gray-600 outline-none'
                        }`}
                      />
                      {evaluated && !isPastCorrect && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">正解: {verb.past}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={state.pastParticiple.value}
                        onChange={(e) => handleDisplayValueChange(verb.id, 'pastParticiple', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, verb.id)}
                        placeholder="入力"
                        disabled={isSubmitted}
                        className={`w-full p-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                           evaluated 
                             ? isPpCorrect 
                                ? 'border-green-500 text-green-700 dark:text-green-400 dark:border-green-500/50 bg-green-50 dark:bg-green-900/20' 
                                : 'border-red-500 text-red-700 dark:text-red-400 dark:border-red-500/50 bg-red-50 dark:bg-red-900/20'
                             : 'border-gray-300 dark:border-gray-600 outline-none'
                        }`}
                      />
                      {evaluated && !isPpCorrect && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">正解: {verb.pastParticiple}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {evaluated && (
                        bothCorrect ? (
                          <Check className="text-green-500 mx-auto" size={20} />
                        ) : (
                          <X className="text-red-500 mx-auto" size={20} />
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex justify-center flex-col items-center gap-4">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors text-lg"
          >
            答え合わせ
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm transition-colors text-lg"
          >
            結果を見る
          </button>
        )}
      </div>
    </div>
  );
}
