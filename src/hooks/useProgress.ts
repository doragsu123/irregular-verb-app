import { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc, writeBatch, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../firestoreErrorHandler';
import type { Progress, VerbStat } from '../types';

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

const DEFAULT_PROGRESS: Progress = {
  totalTests: 0,
  totalQuestions: 0,
  correctAnswers: 0,
  verbStats: {},
};

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const initialLoadDone = useRef(false);

  useEffect(() => {
    let saved = getCookie('verbMasterProgress');
    if (!saved) {
      try {
        saved = localStorage.getItem('verbMasterProgress');
        if (saved) setCookie('verbMasterProgress', saved);
      } catch (e) {}
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.verbStats) parsed.verbStats = {};
        setProgress(parsed);
      } catch (e) {
        console.error('Failed to parse progress', e);
      }
    }
    initialLoadDone.current = true;
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsCloudSyncing(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            // Load from cloud
            const userData = userDocSnap.data();
            const verbStatsRef = collection(db, `users/${user.uid}/verbStats`);
            const verbStatsSnap = await getDocs(verbStatsRef);
            
            const verbStats: Record<string, VerbStat> = {};
            verbStatsSnap.forEach(doc => {
              const data = doc.data();
              verbStats[doc.id] = { 
                correct: data.correct, 
                total: data.total,
                isManualWeak: data.isManualWeak,
                manualCorrectCount: data.manualCorrectCount
              };
            });
            
            const cloudProgress: Progress = {
              totalTests: userData.totalTests || 0,
              totalQuestions: userData.totalQuestions || 0,
              correctAnswers: userData.correctAnswers || 0,
              verbStats,
            };
            setProgress(cloudProgress);
            updateLocalProgress(cloudProgress);
          } else {
            // Cloud is empty, push local progress
            setProgress((currentProg) => {
              syncToCloud(user.uid, currentProg);
              return currentProg;
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        } finally {
          setIsCloudSyncing(false);
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  const updateLocalProgress = (newProgress: Progress) => {
    const progressStr = JSON.stringify(newProgress);
    setCookie('verbMasterProgress', progressStr);
    try {
      localStorage.setItem('verbMasterProgress', progressStr);
    } catch (e) {}
  };

  const syncToCloud = async (userId: string, targetProgress: Progress, newResults?: { verbId: string; isCorrect: boolean }[]) => {
    try {
      const batch = writeBatch(db);
      
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      const nowStr = new Date().toISOString();
      const userPayload = {
        email: auth.currentUser?.email || '',
        totalTests: targetProgress.totalTests,
        totalQuestions: targetProgress.totalQuestions,
        correctAnswers: targetProgress.correctAnswers,
        updatedAt: nowStr
      };

      if (!userDocSnap.exists()) {
        batch.set(userDocRef, userPayload);
      } else {
        batch.update(userDocRef, userPayload);
      }

      if (newResults) {
        newResults.forEach(r => {
          const stat = targetProgress.verbStats[r.verbId];
          if (stat) {
            const statRef = doc(db, `users/${userId}/verbStats`, r.verbId);
            batch.set(statRef, {
              userId,
              verbId: r.verbId,
              correct: stat.correct,
              total: stat.total,
              isManualWeak: stat.isManualWeak ?? false,
              manualCorrectCount: stat.manualCorrectCount ?? 0,
              updatedAt: nowStr
            }, { merge: true });
          }
        });
      } else {
        // Full sync
        Object.entries(targetProgress.verbStats).forEach(([verbId, stat]) => {
          const statRef = doc(db, `users/${userId}/verbStats`, verbId);
          batch.set(statRef, {
            userId,
            verbId,
            correct: stat.correct,
            total: stat.total,
            isManualWeak: stat.isManualWeak ?? false,
            manualCorrectCount: stat.manualCorrectCount ?? 0,
            updatedAt: nowStr
          }, { merge: true });
        });
      }

      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
    }
  };

  const updateProgress = (newProgress: Progress, results?: { verbId: string; isCorrect: boolean }[]) => {
    setProgress(newProgress);
    updateLocalProgress(newProgress);
    
    const user = auth.currentUser;
    if (user && initialLoadDone.current) {
      syncToCloud(user.uid, newProgress, results);
    }
  };

  const handleImportProgress = (newProgress: Progress) => {
    // When importing, we treat all verbs as new results to upsert to cloud
    const results = Object.keys(newProgress.verbStats).map(verbId => ({
      verbId,
      isCorrect: false // we just trigger upsert via syncToCloud with merging
    }));
    updateProgress(newProgress, results);
  };

  const addTestResult = (score: number, total: number, results?: { verbId: string; isCorrect: boolean }[]) => {
    if (total === 0) return;
    
    const newVerbStats = { ...progress.verbStats };
    if (results) {
      results.forEach((r) => {
        if (!newVerbStats[r.verbId]) {
          newVerbStats[r.verbId] = { correct: 0, total: 0 };
        }
        newVerbStats[r.verbId].total += 1;
        if (r.isCorrect) {
          newVerbStats[r.verbId].correct += 1;
          if (newVerbStats[r.verbId].isManualWeak) {
            newVerbStats[r.verbId].manualCorrectCount = (newVerbStats[r.verbId].manualCorrectCount || 0) + 1;
          }
        } else {
          if (newVerbStats[r.verbId].isManualWeak) {
            newVerbStats[r.verbId].manualCorrectCount = 0; // reset on fail
          }
        }
      });
    }

    const newProgress = {
      totalTests: progress.totalTests + 1,
      totalQuestions: progress.totalQuestions + total,
      correctAnswers: progress.correctAnswers + score,
      verbStats: newVerbStats,
    };
    
    updateProgress(newProgress, results);
  };

  const toggleManualWeak = (verbId: string) => {
    const newVerbStats = { ...progress.verbStats };
    if (!newVerbStats[verbId]) {
      newVerbStats[verbId] = { correct: 0, total: 0 };
    }
    const currentlyWeak = !!newVerbStats[verbId].isManualWeak;
    newVerbStats[verbId].isManualWeak = !currentlyWeak;
    newVerbStats[verbId].manualCorrectCount = 0; // Reset count
    
    const newProgress = { ...progress, verbStats: newVerbStats };
    updateProgress(newProgress, [{ verbId, isCorrect: false }]); // send dummy result to trigger sync
  };
  
  const removeManualWeak = (verbId: string) => {
    const newVerbStats = { ...progress.verbStats };
    if (newVerbStats[verbId]) {
       newVerbStats[verbId].isManualWeak = false;
       newVerbStats[verbId].manualCorrectCount = 0;
       const newProgress = { ...progress, verbStats: newVerbStats };
       updateProgress(newProgress, [{ verbId, isCorrect: false }]);
    }
  };

  return { progress, handleImportProgress, addTestResult, toggleManualWeak, removeManualWeak, isCloudSyncing };
}
