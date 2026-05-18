
'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';

interface UserProfile {
  id?: string;
  username: string;
  email: string;
  profileImage: string;
  profileImageUrl?: string;
  bio: string;
  generationCount: number;
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
  const { user, isUserLoading: authLoading } = useUser();
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
    
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile({
          ...data,
          id: docSnap.id,
          generationCount: data.generationCount || 0
        });
        setProfileLoading(false);
      } else {
        // Self-healing for missing profiles (Email or Google users)
        const defaultUsername = user.email?.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_') || `user_${user.uid.slice(0, 5)}`;
        const newProfile = {
          username: defaultUsername,
          email: user.email || "",
          profileImage: user.photoURL || "",
          bio: "New creator on ColorCanvas!",
          generationCount: 0,
          createdAt: serverTimestamp(),
        };
        // Don't await inside effect to avoid blocking, just fire and wait for snapshot
        setDoc(docRef, newProfile).catch(console.error);
      }
    }, (error) => {
      console.error("AuthContext Profile sync error:", error);
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
