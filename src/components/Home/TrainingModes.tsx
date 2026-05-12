import React, { useState } from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import type { Screen } from '../../types';

interface TrainingModesProps {
  onSelectMode: (mode: Screen) => void;
}

export default function TrainingModes({ onSelectMode }: TrainingModesProps) {
  const [view, setView] = useState<'main' | 'table'>('main');

  const mainModes = [
    { id: 'table_menu', title: '表形式テスト', description: '表形式で過去形と過去分詞を穴埋めするテスト' },
    { id: 'multipleChoice', title: '4択テスト', description: '制限時間なしで正しい活用形を選ぶ' },
    { id: 'speed', title: '4択スピードテスト', description: '制限時間内に正しい活用形を選ぶ' },
    { id: 'fill', title: '穴埋めテスト', description: '隠された活用形を推測する' },
    { id: 'typing', title: 'キーボード入力', description: 'スペルを正確に入力する' },
    { id: 'listening', title: 'リスニング', description: '音声を聞いてスペルを入力する' },
    { id: 'pattern', title: 'パターン仕分け', description: 'A-B-Cなどの変化パターンを分類する' },
  ];

  const tableModes = [
    { id: 'table_random', title: '表形式(ランダム)', description: 'ランダムな動詞でテスト' },
    { id: 'table_weak', title: '表形式(苦手優先)', description: '苦手な動詞を優先してテスト' },
    { id: 'table_choice', title: '表形式(選択式)', description: '自分で動詞を選んでテスト' },
  ];

  const handleSelect = (id: string) => {
    if (id === 'table_menu') {
      setView('table');
    } else {
      onSelectMode(id as Screen);
    }
  };

  const getModes = () => {
    if (view === 'table') return tableModes;
    return mainModes;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        {view === 'table' && (
          <button 
            onClick={() => setView('main')}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 dark:text-gray-400"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">
          {view === 'table' ? '表形式テストメニュー' : '学習モード'}
        </h2>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {getModes().map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleSelect(mode.id)}
            className="flex items-center p-4 h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors text-left shadow-sm"
          >
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">{mode.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{mode.description}</p>
            </div>
            <ChevronRight className="text-gray-400 dark:text-gray-500" size={20} />
          </button>
        ))}
      </div>
    </div>
  );
}
