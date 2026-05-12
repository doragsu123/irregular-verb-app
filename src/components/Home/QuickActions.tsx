import React from 'react';
import { Target, BookOpen, ChevronRight } from 'lucide-react';
import type { Screen } from '../../types';

interface QuickActionsProps {
  onStartWeaknessTest: () => void;
  onSelectMode: (mode: Screen) => void;
}

export default function QuickActions({ onStartWeaknessTest, onSelectMode }: QuickActionsProps) {
  return (
    <div className="space-y-6">
      <button
        onClick={onStartWeaknessTest}
        className="w-full flex items-center justify-between p-6 bg-red-600 dark:bg-red-700 text-white rounded-2xl hover:bg-red-700 dark:hover:bg-red-600 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-4">
          <Target size={24} />
          <div className="text-left">
            <span className="block font-bold text-lg">苦手克服テスト</span>
            <span className="block text-sm text-red-100 mt-1">正答率が低い単語を優先して出題します</span>
          </div>
        </div>
        <ChevronRight size={24} className="opacity-70" />
      </button>

      <button
        onClick={() => onSelectMode('list')}
        className="w-full flex items-center justify-between p-6 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-4">
          <BookOpen size={24} />
          <div className="text-left">
            <span className="block font-bold text-lg">学習状況と動詞一覧表</span>
            <span className="block text-sm text-gray-400 mt-1">苦手なパターンや単語の習熟度を確認する</span>
          </div>
        </div>
        <ChevronRight size={24} className="opacity-70" />
      </button>
    </div>
  );
}
