import React from 'react';

interface ResultProps {
  score: number;
  total: number;
  testType: string;
  onRestart: () => void;
}

export default function Result({ score, total, testType, onRestart }: ResultProps) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  
  let message = '';
  if (total === 0) message = 'お疲れ様でした';
  else if (percentage === 100) message = '完璧です！';
  else if (percentage >= 80) message = '素晴らしい！';
  else if (percentage >= 60) message = 'その調子！';
  else message = '復習しましょう';

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center mt-12">
      <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-6">{testType} 結果</h2>
      
      <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
        {score}<span className="text-2xl text-gray-400 dark:text-gray-500">/{total}</span>
      </div>
      
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-8">{message}</p>

      <button
        onClick={onRestart}
        className="w-full py-4 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 rounded-xl font-medium transition-colors"
      >
        ホームに戻る
      </button>
    </div>
  );
}
