import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import type { Screen, Progress } from '../types';
import QuickActions from './Home/QuickActions';
import SettingsPanel from './Home/SettingsPanel';
import TrainingModes from './Home/TrainingModes';

interface HomeProps {
  onSelectMode: (mode: Screen) => void;
  progress: Progress;
  onImportProgress: (progress: Progress) => void;
  questionCount: number;
  setQuestionCount: (count: number) => void;
  explanationTime: number;
  setExplanationTime: (time: number) => void;
  correctExplanationTime: number;
  setCorrectExplanationTime: (time: number) => void;
  verbFilter: string;
  setVerbFilter: (filter: string) => void;
  onStartWeaknessTest: () => void;
}

export default function Home({
  onSelectMode,
  progress,
  onImportProgress,
  questionCount,
  setQuestionCount,
  explanationTime,
  setExplanationTime,
  correctExplanationTime,
  setCorrectExplanationTime,
  verbFilter,
  setVerbFilter,
  onStartWeaknessTest,
}: HomeProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(progress, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verb-master-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (typeof parsed.totalTests === 'number' && typeof parsed.verbStats === 'object') {
          onImportProgress(parsed);
          alert('学習データをインポートしました！');
        } else {
          alert('無効なデータ形式です。');
        }
      } catch (error) {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
        <div>
          <QuickActions onStartWeaknessTest={onStartWeaknessTest} onSelectMode={onSelectMode} />
          <SettingsPanel
            questionCount={questionCount}
            setQuestionCount={setQuestionCount}
            explanationTime={explanationTime}
            setExplanationTime={setExplanationTime}
            correctExplanationTime={correctExplanationTime}
            setCorrectExplanationTime={setCorrectExplanationTime}
            verbFilter={verbFilter}
            setVerbFilter={setVerbFilter}
          />
        </div>
        <div>
          <TrainingModes onSelectMode={onSelectMode} />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-center gap-6">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <Download size={16} />
          <span>エクスポート</span>
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer">
          <Upload size={16} />
          <span>インポート</span>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
            ref={fileInputRef}
          />
        </label>
      </div>
    </div>
  );
}
