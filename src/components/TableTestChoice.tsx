import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Verb, verbs } from '../data/verbs';

interface TableTestChoiceProps {
  onStart: (selectedVerbs: Verb[]) => void;
}

export default function TableTestChoice({ onStart }: TableTestChoiceProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [patternFilter, setPatternFilter] = useState<string>('all');
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');

  const availablePatterns = useMemo(() => {
    const patterns = new Set(verbs.map(v => v.pattern));
    return Array.from(patterns).sort();
  }, []);

  const filteredVerbs = verbs.filter(v => 
    (patternFilter === 'all' || v.pattern === patternFilter) &&
    (v.base.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.past.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.pastParticiple.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.japanese.includes(searchTerm))
  );

  const toggleVerb = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectRange = () => {
    const start = parseInt(rangeStart, 10);
    const end = parseInt(rangeEnd, 10);
    
    if (isNaN(start) || isNaN(end) || start < 1 || start > verbs.length || end < start || end > verbs.length) {
       alert(`1から${verbs.length}までの有効な範囲を入力してください。`);
       return;
    }
    
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      for (let i = start - 1; i < end; i++) {
        if (verbs[i]) {
          newSet.add(verbs[i].id);
        }
      }
      return newSet;
    });
  };

  const deselectRange = () => {
    const start = parseInt(rangeStart, 10);
    const end = parseInt(rangeEnd, 10);
    
    if (isNaN(start) || isNaN(end) || start < 1 || start > verbs.length || end < start || end > verbs.length) {
       alert(`1から${verbs.length}までの有効な範囲を入力してください。`);
       return;
    }
    
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      for (let i = start - 1; i < end; i++) {
        if (verbs[i]) {
          newSet.delete(verbs[i].id);
        }
      }
      return newSet;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      filteredVerbs.forEach(v => newSet.add(v.id));
      return newSet;
    });
  };

  const deselectAllFiltered = () => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      filteredVerbs.forEach(v => newSet.delete(v.id));
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(verbs.map(v => v.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleStart = () => {
    if (selectedIds.size === 0) return;
    const selectedVerbs = verbs.filter(v => selectedIds.has(v.id));
    onStart(selectedVerbs);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">テストする動詞を選択</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={selectAllFiltered} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">表示中を全選択</button>
          <button onClick={deselectAllFiltered} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">表示中を全解除</button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center"></div>
          <button onClick={selectAll} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">すべてを選択</button>
          <button onClick={deselectAll} className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">すべてを解除</button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">番号範囲:</span>
            <input 
              type="number" 
              min={1} 
              max={verbs.length} 
              value={rangeStart}
              onChange={(e) => setRangeStart(e.target.value)}
              className="w-16 px-2 py-1 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
            <span className="text-gray-500 dark:text-gray-400">～</span>
            <input 
              type="number" 
              min={1} 
              max={verbs.length} 
              value={rangeEnd}
              onChange={(e) => setRangeEnd(e.target.value)}
              className="w-16 px-2 py-1 text-center bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={verbs.length.toString()}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button 
              onClick={selectRange}
              className="flex-1 sm:flex-none px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              範囲を選択
            </button>
            <button 
              onClick={deselectRange}
              className="flex-1 sm:flex-none px-4 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
            >
              範囲を解除
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 dark:text-gray-500" size={20} />
            </div>
            <input
              type="text"
              placeholder="英単語や日本語で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          <div className="w-full sm:w-auto">
             <select
               value={patternFilter}
               onChange={(e) => setPatternFilter(e.target.value)}
               className="w-full sm:w-auto px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-400 text-gray-900 dark:text-gray-100 appearance-none"
             >
               <option value="all">すべての変化</option>
               {availablePatterns.map(p => (
                 <option key={p} value={p}>{p}型</option>
               ))}
             </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
          {filteredVerbs.length > 0 ? filteredVerbs.map(verb => {
            const verbIndex = verbs.findIndex(v => v.id === verb.id) + 1;
            return (
            <label key={verb.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedIds.has(verb.id)}
                onChange={() => toggleVerb(verb.id)}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="w-8 text-right text-gray-400 dark:text-gray-500 font-mono text-sm self-start mt-0.5">
                {verbIndex}.
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-gray-100">{verb.base}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{verb.japanese}</div>
              </div>
            </label>
          )}) : (
            <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
              条件に一致する動詞がありません
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center flex-col items-center gap-2">
        <button
          onClick={handleStart}
          disabled={selectedIds.size === 0}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors text-lg disabled:opacity-50"
        >
          テスト開始 ({selectedIds.size}語)
        </button>
        {selectedIds.size === 0 && (
          <p className="text-sm text-red-500">1つ以上の動詞を選択してください</p>
        )}
      </div>
    </div>
  );
}
