import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CompetitionDebrief, NewDebrief } from '@/types/competition';

function debriefsRef(uid: string) {
  return collection(db, 'users', uid, 'debriefs');
}

export async function saveDebrief(uid: string, data: NewDebrief): Promise<string> {
  const ref = doc(debriefsRef(uid));
  await setDoc(ref, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getDebriefs(uid: string): Promise<CompetitionDebrief[]> {
  const q = query(debriefsRef(uid), orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as CompetitionDebrief[];
}
