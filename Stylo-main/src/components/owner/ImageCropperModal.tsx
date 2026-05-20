/**
 * ImageCropperModal.tsx
 * Modal de recorte de imágenes para STEYLOOK.
 * - Foto de perfil: recorte 1:1 (cuadrado/circular)
 * - Portada: recorte 16:9 (banner horizontal)
 * Usa react-image-crop para la interfaz de selección del área.
 */

import React, { useCallback, useRef, useState } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { AnimatePresence, motion } from 'motion/react';
import { X, Crop as CropIcon, RotateCw, Check } from 'lucide-react';
import type { OwnerTheme } from './ownerTheme';

interface Props {
  open: boolean;
  imageSrc: string;
  aspect: number;      // 1 for profile, 16/9 for cover
  slot: 'profileImage' | 'coverImage';
  theme: OwnerTheme;
  onConfirm: (croppedDataUrl: string, crop: Crop) => void;
  onClose: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 85 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

export default function ImageCropperModal({ open, imageSrc, aspect, slot, theme: t, onConfirm, onClose }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }, [aspect]);

  const handleConfirm = useCallback(() => {
    if (!imgRef.current || !completedCrop) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');

    // Output resolution
    const outputW = slot === 'profileImage' ? 400 : 1200;
    const outputH = slot === 'profileImage' ? 400 : 675; // 1200/16*9

    canvas.width = outputW;
    canvas.height = outputH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputW,
      outputH,
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    onConfirm(dataUrl, completedCrop);
  }, [completedCrop, slot, onConfirm]);

  const isProfile = slot === 'profileImage';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="crop-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: t.isDark ? '#111' : '#fff',
              border: `1px solid ${t.border}`,
              maxHeight: '90dvh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{ borderBottom: `1px solid ${t.border}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: t.accentLight }}
                >
                  <CropIcon size={16} style={{ color: t.accent }} />
                </div>
                <div>
                  <p style={{ color: t.text }} className="text-sm font-black">
                    {isProfile ? 'Recortar foto de perfil' : 'Recortar portada'}
                  </p>
                  <p style={{ color: t.textMuted }} className="text-[10px] font-bold">
                    {isProfile ? 'Proporción 1:1 — cuadrada' : 'Proporción 16:9 — banner horizontal'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Crop area */}
            <div
              className="flex-1 overflow-auto flex items-center justify-center p-4"
              style={{ background: '#000', minHeight: 240 }}
            >
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                circularCrop={isProfile}
                keepSelection
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Recortar"
                  onLoad={onImageLoad}
                  style={{ maxHeight: '55dvh', maxWidth: '100%', display: 'block' }}
                />
              </ReactCrop>
            </div>

            {/* Hint */}
            <div
              className="px-6 py-3 flex-shrink-0 flex items-center gap-2"
              style={{ borderTop: `1px solid ${t.border}` }}
            >
              <RotateCw size={12} style={{ color: t.textMuted }} />
              <p style={{ color: t.textMuted }} className="text-[11px] font-medium">
                Arrastra y ajusta el área de recorte. La imagen se guardará optimizada.
              </p>
            </div>

            {/* Footer buttons */}
            <div
              className="flex gap-3 px-6 py-4 flex-shrink-0"
              style={{ borderTop: `1px solid ${t.border}` }}
            >
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-black text-sm transition-all hover:scale-[1.02]"
                style={{ background: t.accentLight, color: t.textMuted, border: `1px solid ${t.border}` }}
              >
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirm}
                disabled={!completedCrop?.width}
                className="flex-[2] py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: t.accent, color: '#fff' }}
              >
                <Check size={16} />
                {isProfile ? 'Usar esta foto' : 'Usar esta portada'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
