
'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';

interface UserProfile {
  username: string;
  email: string;
  profileImage: string;
  bio: string;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const docRef = doc(db, 'users', user.uid);
    
    // Use onSnapshot for real-time profile updates across the entire app
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
        setProfileLoading(false);
      } else {
        // Self-healing for missing profiles
        const newProfile = {
          username: user.displayName?.toLowerCase().replace(/\s+/g, '_') || `user_${user.uid.slice(0, 5)}`,
          email: user.email || "",
          profileImage: user.photoURL || "",
          bio: "New creator on ColorCanvas!",
          createdAt: serverTimestamp(),
        };
        await setDoc(docRef, newProfile);
        // Snapshot will trigger again automatically
      }
    }, (error) => {
      console.error("AuthContext Snapshot error:", error);
      setProfileLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  const value = useMemo(() => ({
    user,
    profile,
    loading: authLoading || profileLoading,
  }), [user, profile, authLoading, profileLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
