'use client';

import { useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { User, Locale } from '@/types/user';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setState({
            firebaseUser,
            user: { uid: firebaseUser.uid, ...userDoc.data() } as User,
            loading: false,
            error: null,
          });
        } else {
          setState({
            firebaseUser,
            user: null,
            loading: false,
            error: null,
          });
        }
      } else {
        setState({
          firebaseUser: null,
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string, locale: Locale) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName });

      const newUser: Partial<User> = {
        email,
        displayName,
        preferredLanguage: locale,
        onboardingCompleted: false,
        profile: {
          skillLevel: 'intermediate',
          bowType: 'recurve',
          yearsOfPractice: 0,
          goals: [],
        },
        preferences: {
          notificationsEnabled: true,
          dailyReminderTime: '19:00',
          streakCount: 0,
        },
        stats: {
          totalSessions: 0,
          totalExercisesCompleted: 0,
          totalMinutesMeditation: 0,
        },
      };

      await setDoc(doc(db, 'users', credential.user.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      });

      return credential.user;
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message }));
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return credential.user;
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message }));
      throw err;
    }
  };

  const signInWithGoogle = async (locale: Locale) => {
    try {
      const credential = await signInWithPopup(auth, googleProvider);

      const userDocRef = doc(db, 'users', credential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          email: credential.user.email,
          displayName: credential.user.displayName || 'Arcaș',
          photoURL: credential.user.photoURL,
          preferredLanguage: locale,
          onboardingCompleted: false,
          profile: {
            skillLevel: 'intermediate',
            bowType: 'recurve',
            yearsOfPractice: 0,
            goals: [],
          },
          preferences: {
            notificationsEnabled: true,
            dailyReminderTime: '19:00',
            streakCount: 0,
          },
          stats: {
            totalSessions: 0,
            totalExercisesCompleted: 0,
            totalMinutesMeditation: 0,
          },
          createdAt: serverTimestamp(),
          lastActiveAt: serverTimestamp(),
        });
      }

      return credential.user;
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message }));
      throw err;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setState((s) => ({ ...s, error: err.message }));
      throw err;
    }
  };

  return {
    ...state,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };
}
