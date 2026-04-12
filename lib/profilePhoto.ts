import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';

const MAX_SIZE = 512;
const QUALITY = 0.85;

/** Resize image client-side using canvas, returns a Blob */
function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Scale down to MAX_SIZE keeping aspect ratio
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.round(height * (MAX_SIZE / width));
          width = MAX_SIZE;
        } else {
          width = Math.round(width * (MAX_SIZE / height));
          height = MAX_SIZE;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/jpeg',
        QUALITY
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  const blob = await resizeImage(file);
  const storageRef = ref(storage, `users/${uid}/profile.jpg`);

  await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
  const url = await getDownloadURL(storageRef);

  // Update Firestore user document
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { photoURL: url });

  return url;
}

export async function deleteProfilePhoto(uid: string): Promise<void> {
  const storageRef = ref(storage, `users/${uid}/profile.jpg`);

  try {
    await deleteObject(storageRef);
  } catch {
    // File may not exist — ignore
  }

  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { photoURL: null });
}
