import React from 'react';
import { Filter, Hash, BookOpen } from 'lucide-react';

interface SettingsPanelProps {
  questionCount: number;
  setQuestionCount: (count: number) => void;
  explanationTime: number;
  setExplanationTime: (time: number) => void;
  correctExplanationTime: number;
  setCorrectExplanationTime: (time: number) => void;
  verbFilter: string;
  setVerbFilter: (filter: string) => void;
}

export default function SettingsPanel({
  questionCount,
  setQuestionCount,
  explanationTime,
  setExplanationTime,
  correctExplanationTime,
  setCorrectExplanationTime,
  verbFilter,
  setVerbFilter,
}: SettingsPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm mt-6">
      <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
        <Filter size={16} /> テスト設定
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Hash size={12} /> 問題数
          </label>
          <div className="flex gap-2">
            {[10, 20, 50, 0].map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  questionCount === count
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {count === 0 ? 'エンドレス/全問' : `${count}問`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <Filter size={12} /> 出題範囲
          </label>
          <select
            value={verbFilter}
            onChange={(e) => setVerbFilter(e.target.value)}
            className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-900 dark:focus:border-gray-400 transition-colors"
          >
            <option value="all">すべて</option>
            <option value="weak">苦手な単語優先</option>
            <option value="A-A-A">A-A-A型のみ</option>
            <option value="A-B-A">A-B-A型のみ</option>
            <option value="A-B-B">A-B-B型のみ</option>
            <option value="A-B-C">A-B-C型のみ</option>
            <option value="A-A-B">A-A-B型のみ</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <BookOpen size={12} /> 解説表示時間 (不正解時)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 0].map((time) => (
              <button
                key={time}
                onClick={() => setExplanationTime(time)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  explanationTime === time
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {time === 0 ? '手動' : `${time}秒`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
            <BookOpen size={12} /> 解説表示時間 (正解時)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 5, 0].map((time) => (
              <button
                key={time}
                onClick={() => setCorrectExplanationTime(time)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  correctExplanationTime === time
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {time === 0 ? '手動' : `${time}秒`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
