/**
 * useImageUpload.ts
 * Hook reutilizable para subir imágenes a Firebase Storage.
 * Soporta foto de perfil (1:1) y portada (16:9) de barbería/salón.
 */

import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { useCallback, useState } from 'react';
import { auth, storage } from '../lib/firebase';

export type UploadSlot = 'profileImage' | 'coverImage';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

const MAX_SIZE_MB = 5;

/** Converts a canvas crop area to a Blob at the given MIME type and quality. */
export async function cropCanvasToBlob(
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number; unit: string },
  outputWidth: number,
  outputHeight: number,
  quality = 0.88,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/jpeg',
        quality,
      );
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}

export function useImageUpload(role: string) {
  const [states, setStates] = useState<Record<UploadSlot, UploadState>>({
    profileImage: { uploading: false, progress: 0, error: null },
    coverImage: { uploading: false, progress: 0, error: null },
  });

  const setSlotState = useCallback((slot: UploadSlot, patch: Partial<UploadState>) => {
    setStates((prev) => ({ ...prev, [slot]: { ...prev[slot], ...patch } }));
  }, []);

  /** Validates file size. Returns error string or null. */
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `La imagen no puede superar ${MAX_SIZE_MB} MB`;
    }
    if (!file.type.startsWith('image/')) {
      return 'El archivo debe ser una imagen';
    }
    return null;
  };

  /**
   * Uploads a Blob to Firebase Storage and returns the download URL.
   * Path: shops/{uid}/{role}/{slot}.jpg
   */
  const uploadBlob = useCallback(
    (blob: Blob, slot: UploadSlot): Promise<string> => {
      return new Promise((resolve, reject) => {
        const uid = auth.currentUser?.uid;
        if (!uid) return reject(new Error('No hay usuario autenticado'));

        const path = `shops/${uid}/${role}/${slot}.jpg`;
        const storageRef = ref(storage, path);
        const task = uploadBytesResumable(storageRef, blob, { contentType: 'image/jpeg' });

        setSlotState(slot, { uploading: true, progress: 0, error: null });

        task.on(
          'state_changed',
          (snap) => {
            const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
            setSlotState(slot, { progress: pct });
          },
          (err) => {
            setSlotState(slot, { uploading: false, error: err.message });
            reject(err);
          },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            setSlotState(slot, { uploading: false, progress: 100 });
            resolve(url);
          },
        );
      });
    },
    [role, setSlotState],
  );

  const clearError = useCallback((slot: UploadSlot) => {
    setSlotState(slot, { error: null });
  }, [setSlotState]);

  return { states, uploadBlob, validateFile, clearError };
}
