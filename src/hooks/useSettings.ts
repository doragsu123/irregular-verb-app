import { useState, useEffect } from 'react';

const setCookie = (name: string, value: string, days: number = 365) => {
  try {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
  } catch (e) {
    console.error('Failed to set cookie', e);
  }
};

const getCookie = (name: string): string | null => {
  try {
    if (typeof document === 'undefined') return null;
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
  } catch (e) {
    console.error('Failed to get cookie', e);
  }
  return null;
};

export function useSettings() {
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [testType, setTestType] = useState<string>('');
  const [verbFilter, setVerbFilter] = useState<string>('all');
  
  const [explanationTime, setExplanationTime] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('verbMasterExplanationTime');
      return stored ? parseInt(stored, 10) : 3;
    } catch {
      return 3;
    }
  });

  const [correctExplanationTime, setCorrectExplanationTime] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('verbMasterCorrectExplanationTime');
      return stored ? parseInt(stored, 10) : 1;
    } catch {
      return 1;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('verbMasterDarkMode') === 'true';
    } catch (e) {
      return false;
    }
  });

  const [voiceURI, setVoiceURI] = useState<string | null>(() => {
    try {
      let savedVoice = getCookie('verbMasterVoiceURI');
      if (!savedVoice) {
        savedVoice = localStorage.getItem('verbMasterVoiceURI');
        if (savedVoice) setCookie('verbMasterVoiceURI', savedVoice);
      }
      return savedVoice;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('verbMasterDarkMode', 'true');
      } catch (e) {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('verbMasterDarkMode', 'false');
      } catch (e) {}
    }
  }, [isDarkMode]);

  const handleExplanationTimeChange = (time: number) => {
    setExplanationTime(time);
    try {
      localStorage.setItem('verbMasterExplanationTime', time.toString());
    } catch {}
  };

  const handleCorrectExplanationTimeChange = (time: number) => {
    setCorrectExplanationTime(time);
    try {
      localStorage.setItem('verbMasterCorrectExplanationTime', time.toString());
    } catch {}
  };

  const handleVoiceChange = (uri: string) => {
    setVoiceURI(uri);
    setCookie('verbMasterVoiceURI', uri);
    try {
      localStorage.setItem('verbMasterVoiceURI', uri);
    } catch (e) {}
  };

  return {
    questionCount,
    setQuestionCount,
    testType,
    setTestType,
    verbFilter,
    setVerbFilter,
    explanationTime,
    setExplanationTime: handleExplanationTimeChange,
    correctExplanationTime,
    setCorrectExplanationTime: handleCorrectExplanationTimeChange,
    isDarkMode,
    setIsDarkMode,
    voiceURI,
    setVoiceURI: handleVoiceChange,
  };
}
