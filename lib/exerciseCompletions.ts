import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  increment,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ExerciseCompletion, ExerciseCategory } from '@/types/exercise';

function completionsRef(uid: string) {
  return collection(db, 'users', uid, 'exerciseCompletions');
}

export async function saveCompletion(
  uid: string,
  data: {
    exerciseId: string;
    category: ExerciseCategory;
    duration: number;
  }
): Promise<string> {
  const ref = doc(completionsRef(uid));
  await setDoc(ref, {
    ...data,
    completedAt: serverTimestamp(),
  });

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'stats.totalExercisesCompleted': increment(1),
    'stats.totalMinutesMeditation': increment(Math.round(data.duration / 60)),
    lastActiveAt: serverTimestamp(),
  });

  return ref.id;
}

export async function getCompletions(uid: string): Promise<ExerciseCompletion[]> {
  const q = query(completionsRef(uid), orderBy('completedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ExerciseCompletion[];
}

export async function getTodayCompletions(uid: string): Promise<ExerciseCompletion[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const q = query(
    completionsRef(uid),
    where('completedAt', '>=', Timestamp.fromDate(startOfDay)),
    where('completedAt', '<', Timestamp.fromDate(endOfDay)),
    orderBy('completedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ExerciseCompletion[];
}
