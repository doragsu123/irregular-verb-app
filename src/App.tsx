import React, { useState } from 'react';
import { ChevronLeft, Sun, Moon } from 'lucide-react';
import Home from './components/Home';
import SpeedTest from './components/SpeedTest';
import FillInTheBlankTest from './components/FillInTheBlankTest';
import TypingTest from './components/TypingTest';
import ListeningTest from './components/ListeningTest';
import PatternTest from './components/PatternTest';
import TableTest from './components/TableTest';
import TableTestChoice from './components/TableTestChoice';
import Result from './components/Result';
import VerbList from './components/VerbList';
import VoiceSelect from './components/VoiceSelect';
import AuthPanel from './components/AuthPanel';
import { useProgress } from './hooks/useProgress';
import { useSettings } from './hooks/useSettings';
import type { Screen } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [lastScore, setLastScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [currentTestType, setCurrentTestType] = useState<string>('');
  const [selectedVerbsForTable, setSelectedVerbsForTable] = useState<any[]>([]);
  
  const { progress, handleImportProgress, addTestResult, toggleManualWeak, removeManualWeak } = useProgress();
  const { 
    questionCount, 
    setQuestionCount, 
    verbFilter, 
    setVerbFilter, 
    explanationTime, 
    setExplanationTime, 
    correctExplanationTime,
    setCorrectExplanationTime,
    isDarkMode, 
    setIsDarkMode, 
    voiceURI, 
    setVoiceURI 
  } = useSettings();

  const handleFinish = (score: number, total: number, type: string, results?: { verbId: string, isCorrect: boolean }[]) => {
    setLastScore(score);
    setTotalQuestions(total);
    setCurrentTestType(type);
    
    addTestResult(score, total, results);
    
    setCurrentScreen('result');
  };

  const handleStartWeaknessTest = () => {
    setVerbFilter('weak');
    setCurrentScreen('speed');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-gray-200 dark:selection:bg-gray-700 transition-colors duration-200">
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6 h-10">
          <div className="flex items-center gap-4">
            {currentScreen !== 'home' && currentScreen !== 'result' ? (
              <button 
                onClick={() => setCurrentScreen('home')}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 text-sm font-medium transition-colors"
              >
                <ChevronLeft size={20} />
                <span>ホームに戻る</span>
              </button>
            ) : <div />}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="ダークモード切替"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <VoiceSelect selectedVoiceURI={voiceURI} onChange={setVoiceURI} />
            <AuthPanel />
          </div>
        </div>
        {currentScreen === 'home' && <Home onSelectMode={setCurrentScreen} progress={progress} onImportProgress={handleImportProgress} questionCount={questionCount} setQuestionCount={setQuestionCount} explanationTime={explanationTime} setExplanationTime={setExplanationTime} correctExplanationTime={correctExplanationTime} setCorrectExplanationTime={setCorrectExplanationTime} verbFilter={verbFilter} setVerbFilter={setVerbFilter} onStartWeaknessTest={handleStartWeaknessTest} />}
        {currentScreen === 'speed' && <SpeedTest onFinish={(s, t, r) => handleFinish(s, t, '4択スピードテスト', r)} questionCount={questionCount} verbFilter={verbFilter} verbStats={progress.verbStats} explanationTime={explanationTime} correctExplanationTime={correctExplanationTime} onRemoveWeak={removeManualWeak} />}
        {currentScreen === 'multipleChoice' && <SpeedTest isUntimed onFinish={(s, t, r) => handleFinish(s, t, '4択テスト', r)} questionCount={questionCount} verbFilter={verbFilter} verbStats={progress.verbStats} explanationTime={explanationTime} correctExplanationTime={correctExplanationTime} onRemoveWeak={removeManualWeak} />}
        {currentScreen === 'fill' && <FillInTheBlankTest onFinish={(s, t, r) => handleFinish(s, t, '穴埋めテスト', r)} questionCount={questionCount} verbFilter={verbFilter} verbStats={progress.verbStats} explanationTime={explanationTime} correctExplanationTime={correctExplanationTime} onRemoveWeak={removeManualWeak} />}
        {currentScreen === 'typing' && <TypingTest onFinish={(s, t, r) => handleFinish(s, t, 'キーボード入力', r)} questionCount={questionCount} verbFilter={verbFilter} verbStats={progress.verbStats} explanationTime={explanationTime} correctExplanationTime={correctExplanationTime} onRemoveWeak={removeManualWeak} />}
        {currentScreen === 'listening' && <ListeningTest onFinish={(s, t, r) => handleFinish(s, t, 'リスニング', r)} voiceURI={voiceURI} questionCount={questionCount} verbFilter={verbFilter} verbStats={progress.verbStats} explanationTime={explanationTime} correctExplanationTime={correctExplanationTime} onRemoveWeak={removeManualWeak} />}
        {currentScreen === 'pattern' && <PatternTest onFinish={(s, t, r) => handleFinish(s, t, 'パターン仕分け', r)} questionCount={questionCount} verbFilter={verbFilter} verbStats={progress.verbStats} explanationTime={explanationTime} correctExplanationTime={correctExplanationTime} onRemoveWeak={removeManualWeak} />}
        {currentScreen === 'table_random' && <TableTest mode="random" verbStats={progress.verbStats} count={questionCount} onFinish={(s, t, r) => handleFinish(s, t, '表形式テスト(ランダム)', r)} onToggleWeak={toggleManualWeak} onRemoveWeak={removeManualWeak} />}
        {currentScreen === 'table_weak' && <TableTest mode="weak" verbStats={progress.verbStats} count={questionCount} onFinish={(s, t, r) => handleFinish(s, t, '表形式テスト(苦手優先)', r)} onToggleWeak={toggleManualWeak} onRemoveWeak={removeManualWeak} />}
        {currentScreen === 'table_choice' && <TableTestChoice onStart={(selected) => { setSelectedVerbsForTable(selected); setCurrentScreen('table_test_custom'); }} />}
        {currentScreen === 'table_test_custom' && <TableTest mode="custom" customVerbs={selectedVerbsForTable} verbStats={progress.verbStats} count={selectedVerbsForTable.length} onFinish={(s, t, r) => handleFinish(s, t, '表形式テスト(選択式)', r)} onToggleWeak={toggleManualWeak} onRemoveWeak={removeManualWeak} />}
        {currentScreen === 'list' && <VerbList progress={progress} voiceURI={voiceURI} />}
        {currentScreen === 'result' && <Result score={lastScore} total={totalQuestions} testType={currentTestType} onRestart={() => setCurrentScreen('home')} />}
      </main>
    </div>
  );
}
