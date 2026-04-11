import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { touchStreak } from '@/lib/streak';
import { Session, NewSession } from '@/types/session';

function sessionsRef(uid: string) {
  return collection(db, 'users', uid, 'sessions');
}

export async function createSession(uid: string, data: NewSession): Promise<string> {
  const ref = doc(sessionsRef(uid));
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  });

  // Increment total sessions in user stats
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'stats.totalSessions': increment(1),
    lastActiveAt: serverTimestamp(),
  });

  await touchStreak(uid);

  return ref.id;
}

export async function getSessions(uid: string): Promise<Session[]> {
  const q = query(sessionsRef(uid), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Session[];
}

export async function getSession(uid: string, sessionId: string): Promise<Session | null> {
  const ref = doc(db, 'users', uid, 'sessions', sessionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Session;
}

export async function deleteSession(uid: string, sessionId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'sessions', sessionId);
  await deleteDoc(ref);

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'stats.totalSessions': increment(-1),
  });
}

export async function getTodaySessions(uid: string): Promise<Session[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const q = query(
    sessionsRef(uid),
    where('date', '>=', Timestamp.fromDate(startOfDay)),
    where('date', '<', Timestamp.fromDate(endOfDay)),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as Session[];
}
