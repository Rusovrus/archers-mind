import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Toggle an exercise as favorite for the user.
 * Returns the new favorite state (true = added, false = removed).
 */
export async function toggleFavorite(
  uid: string,
  exerciseId: string,
  currentFavorites: string[]
): Promise<boolean> {
  const userRef = doc(db, 'users', uid);
  const isFav = currentFavorites.includes(exerciseId);

  await updateDoc(userRef, {
    favoriteExercises: isFav
      ? arrayRemove(exerciseId)
      : arrayUnion(exerciseId),
  });

  return !isFav;
}
