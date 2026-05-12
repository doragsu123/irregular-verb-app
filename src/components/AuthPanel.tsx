import React, { useEffect, useState } from 'react';
import { User, signInWithPopup, signOut } from 'firebase/auth';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { auth, googleProvider } from '../firebase';

export default function AuthPanel() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Sign-in error:', e);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Sign-out error:', e);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full pl-3 pr-1 py-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mr-1">
            <UserIcon size={14} />
            <span className="hidden sm:inline-block max-w-[100px] truncate">{user.displayName}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title="ログアウト"
          >
            <LogOut size={14} />
          </button>
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-full transition-colors"
          title="Googleアカウントでログイン"
        >
          <LogIn size={14} />
          <span className="hidden sm:inline-block">ログイン</span>
        </button>
      )}
    </div>
  );
}
