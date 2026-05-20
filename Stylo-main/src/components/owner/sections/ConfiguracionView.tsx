/**
 * ConfiguracionView.tsx
 * Panel de ajustes del negocio (barbería / salón).
 * Incluye: foto de perfil, portada con recorte, info del negocio,
 * horarios, notificaciones y paleta de colores.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save, Camera, Globe, Bell, Palette, RotateCcw, Lock,
  Upload, ImageIcon, CheckCircle2, AlertCircle, Loader2, X,
} from 'lucide-react';
import { OwnerTheme, BARBER_PALETTES, SALON_PALETTES } from '../ownerTheme';
import { useAuth } from '../../../context/AuthContext';
import { useOwnerData } from '../../../context/OwnerDataContext';
import ImageCropperModal from '../ImageCropperModal';
import { useImageUpload } from '../../../hooks/useImageUpload';
import type { UploadSlot } from '../../../hooks/useImageUpload';

interface Props {
  theme: OwnerTheme;
  onPaletteChange?: (id: string) => void;
  currentPalette?: string;
}

// ── Small helpers ─────────────────────────────────────────────────────────────

const MAX_MB = 5;

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ConfiguracionView({ theme: t, onPaletteChange, currentPalette }: Props) {
  const { profile, signOut } = useAuth();
  const { settings, saveSettings, resetData } = useOwnerData();
  const { states: uploadStates, uploadBlob, validateFile, clearError } = useImageUpload(t.role);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState(settings);

  useEffect(() => { setForm(settings); }, [settings]);

  // ── Image state ─────────────────────────────────────────────────────────────
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperSlot, setCropperSlot] = useState<UploadSlot>('profileImage');
  const [rawImageSrc, setRawImageSrc] = useState('');          // original file as dataURL
  const [croppedPreview, setCroppedPreview] = useState<Record<UploadSlot, string>>({
    profileImage: settings.profileImage ?? '',
    coverImage: settings.coverImage ?? '',
  });
  
  // Custom Toast state
  const [toastMsg, setToastMsg] = useState<{title: string, type: 'success'|'error'} | null>(null);

  const showToast = (title: string, type: 'success' | 'error') => {
    setToastMsg({ title, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef   = useRef<HTMLInputElement>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSave = () => {
    saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Open native file picker for a given slot
  const openPicker = (slot: UploadSlot) => {
    clearError(slot);
    if (slot === 'profileImage') profileInputRef.current?.click();
    else coverInputRef.current?.click();
  };

  // File selected → validate → open cropper
  const onFileChange = useCallback(
    (slot: UploadSlot, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // reset input so same file can be re-selected
      e.target.value = '';

      const err = validateFile(file);
      if (err) {
        // Show error inline — abusing the slot error state via a quick trick
        alert(err);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setRawImageSrc(reader.result as string);
        setCropperSlot(slot);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    },
    [validateFile],
  );

  // Cropper confirmed → convert dataURL to blob → upload → save URL in form
  const onCropConfirm = useCallback(
    async (croppedDataUrl: string) => {
      setCropperOpen(false);

      // Show local preview immediately
      setCroppedPreview((prev) => ({ ...prev, [cropperSlot]: croppedDataUrl }));

      const blob = dataUrlToBlob(croppedDataUrl);
      try {
        const url = await uploadBlob(blob, cropperSlot);
        // Persist URL in settings form and save right away so it's reflected everywhere
        setForm((prev) => ({ ...prev, [cropperSlot]: url }));
        saveSettings({ ...form, [cropperSlot]: url });
        showToast(cropperSlot === 'profileImage' ? 'Foto de perfil actualizada exitosamente' : 'Portada actualizada exitosamente', 'success');
      } catch (e: any) {
        showToast(`Error al subir imagen: ${e.message}`, 'error');
      }
    },
    [cropperSlot, uploadBlob, form, saveSettings],
  );

  // Remove an image
  const removeImage = (slot: UploadSlot) => {
    setCroppedPreview((prev) => ({ ...prev, [slot]: '' }));
    setForm((prev) => ({ ...prev, [slot]: '' }));
    saveSettings({ ...form, [slot]: '' });
  };

  // ── Sub-components ──────────────────────────────────────────────────────────

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };

  const Field = ({
    label, value, onChange, type = 'text',
  }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
    <div>
      <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1.5">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none resize-none"
          style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none"
          style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
        />
      )}
    </div>
  );

  const Toggle = ({
    label, desc, value, onChange,
  }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) => (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
      <div>
        <p style={{ color: t.text }} className="text-sm font-bold">{label}</p>
        <p style={muted} className="text-xs">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-12 h-6 rounded-full transition-all relative flex-shrink-0"
        style={{ background: value ? t.accent : t.border }}
      >
        <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm" style={{ left: value ? '26px' : '2px' }} />
      </button>
    </div>
  );

  // ── Image upload card ───────────────────────────────────────────────────────

  const ImageCard = ({
    slot,
    label,
    hint,
    aspect,
    isCircular,
  }: {
    slot: UploadSlot;
    label: string;
    hint: string;
    aspect: number;
    isCircular: boolean;
  }) => {
    const us = uploadStates[slot];
    const preview = croppedPreview[slot] || form[slot] || '';

    return (
      <div className="space-y-3">
        <label style={muted} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
          <ImageIcon size={10} />
          {label}
        </label>

        {/* Preview area */}
        <div className="relative group">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt={label}
                className="w-full object-cover"
                style={{
                  borderRadius: isCircular ? '50%' : '1rem',
                  aspectRatio: isCircular ? '1 / 1' : '16 / 9',
                  border: `2px solid ${t.accent}`,
                  maxHeight: isCircular ? 120 : 160,
                  maxWidth: isCircular ? 120 : '100%',
                  display: isCircular ? 'block' : 'block',
                }}
              />
              {/* Remove button */}
              <button
                onClick={() => removeImage(slot)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                style={{ background: 'rgba(239,68,68,0.9)' }}
              >
                <X size={12} color="#fff" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openPicker(slot)}
              className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-8 transition-all hover:scale-[1.01]"
              style={{ borderColor: t.accentMid, background: t.accentLight }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: t.accentLight }}>
                <Upload size={20} style={{ color: t.accent }} />
              </div>
              <p style={{ color: t.accent }} className="text-xs font-black">{label}</p>
              <p style={muted} className="text-[10px] text-center">{hint}</p>
            </button>
          )}
        </div>

        {/* Upload progress */}
        <AnimatePresence>
          {us.uploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-1">
                <Loader2 size={12} style={{ color: t.accent }} className="animate-spin" />
                <span style={{ color: t.textMuted }} className="text-[11px] font-medium">
                  Subiendo... {us.progress}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.accentLight }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: t.accent }}
                  initial={{ width: 0 }}
                  animate={{ width: `${us.progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success flash */}
        <AnimatePresence>
          {!us.uploading && us.progress === 100 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <CheckCircle2 size={13} color="#22c55e" />
              <span className="text-[11px] font-bold" style={{ color: '#22c55e' }}>Imagen guardada</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {us.error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 p-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertCircle size={13} color="#ef4444" className="flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold" style={{ color: '#ef4444' }}>Error al subir</p>
                <p className="text-[10px]" style={{ color: '#ef4444' }}>{us.error}</p>
              </div>
              <button onClick={() => clearError(slot)}>
                <X size={12} color="#ef4444" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Change button (shows when preview exists) */}
        {preview && !us.uploading && (
          <button
            onClick={() => openPicker(slot)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all hover:scale-[1.02]"
            style={{ background: t.accentLight, color: t.accent, border: `1px solid ${t.accentMid}` }}
          >
            <Camera size={13} />
            {slot === 'profileImage' ? 'Cambiar foto' : 'Cambiar portada'}
          </button>
        )}

        {/* Hidden file inputs */}
        <input
          ref={slot === 'profileImage' ? profileInputRef : coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileChange(slot, e)}
        />
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
            style={{ 
              background: t.isDark ? '#1a1a1a' : '#fff', 
              border: `2px solid ${toastMsg.type === 'success' ? '#22c55e' : '#ef4444'}` 
            }}
          >
            {toastMsg.type === 'success' ? (
              <CheckCircle2 size={24} color="#22c55e" />
            ) : (
              <AlertCircle size={24} color="#ef4444" />
            )}
            <p style={{ color: t.text }} className="text-sm font-black">{toastMsg.title}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        open={cropperOpen}
        imageSrc={rawImageSrc}
        aspect={cropperSlot === 'profileImage' ? 1 : 16 / 9}
        slot={cropperSlot}
        theme={t}
        onConfirm={onCropConfirm}
        onClose={() => setCropperOpen(false)}
      />

      <div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Ajustes</p>
          <h2 style={{ color: t.text }} className="text-3xl font-black">Configuración</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Card: Imágenes del negocio ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 rounded-2xl p-6"
            style={card}
          >
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <ImageIcon size={12} />
              {t.role === 'barbero' ? 'Imágenes de la Barbería' : 'Imágenes del Salón'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile image */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {/* Large profile preview */}
                  <div className="flex-shrink-0">
                    {(croppedPreview.profileImage || form.profileImage) ? (
                      <img
                        src={croppedPreview.profileImage || form.profileImage}
                        alt="Foto de perfil"
                        className="w-20 h-20 rounded-2xl object-cover"
                        style={{ border: `2px solid ${t.accent}` }}
                      />
                    ) : (
                      <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black flex-shrink-0"
                        style={{ background: t.accentLight, color: t.accent }}
                      >
                        {(form.shopName ?? '?')[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: t.text }} className="text-sm font-black mb-0.5">Foto de Perfil</p>
                    <p style={muted} className="text-[11px] mb-3">
                      Visible en el listado de clientes. Recorte circular 1:1.
                    </p>
                    <ImageCard
                      slot="profileImage"
                      label="Foto de perfil"
                      hint={`JPG / PNG · Máx ${MAX_MB} MB · Se recortará en círculo`}
                      aspect={1}
                      isCircular
                    />
                  </div>
                </div>
              </div>

              {/* Cover image */}
              <div className="space-y-2">
                <p style={{ color: t.text }} className="text-sm font-black mb-0.5">Portada / Banner</p>
                <p style={muted} className="text-[11px] mb-3">
                  Aparece en la parte superior del perfil. Recorte 16:9 banner.
                </p>
                {/* Cover preview large */}
                {(croppedPreview.coverImage || form.coverImage) && (
                  <div className="relative group mb-3">
                    <img
                      src={croppedPreview.coverImage || form.coverImage}
                      alt="Portada"
                      className="w-full rounded-2xl object-cover"
                      style={{ aspectRatio: '16/9', border: `2px solid ${t.accent}` }}
                    />
                    <button
                      onClick={() => removeImage('coverImage')}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background: 'rgba(239,68,68,0.9)' }}
                    >
                      <X size={13} color="#fff" />
                    </button>
                  </div>
                )}
                <ImageCard
                  slot="coverImage"
                  label="Cambiar portada"
                  hint={`JPG / PNG · Máx ${MAX_MB} MB · Formato 16:9 banner`}
                  aspect={16 / 9}
                  isCircular={false}
                />
              </div>
            </div>
          </motion.div>

          {/* ── Card: Perfil personal ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl p-6" style={card}>
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-5 flex items-center gap-2">
              <Camera size={12} /> Perfil Personal
            </p>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0" style={{ background: t.accentLight, color: t.accent }}>
                {profile?.nombre?.charAt(0) || 'U'}
              </div>
              <div>
                <p style={{ color: t.text }} className="text-sm font-bold">{profile?.nombre}</p>
                <p style={muted} className="text-xs">{profile?.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <Field label="Nombre completo" value={form.nombre || profile?.nombre || ''} onChange={(v) => setForm((p) => ({ ...p, nombre: v }))} />
              <Field label="Teléfono" value={form.telefono || profile?.telefono || ''} onChange={(v) => setForm((p) => ({ ...p, telefono: v }))} type="tel" />
            </div>
          </motion.div>

          {/* ── Card: Info del negocio ── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl p-6" style={card}>
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-5 flex items-center gap-2">
              <Globe size={12} /> Información del Negocio
            </p>
            <div className="space-y-4">
              <Field
                label={t.role === 'barbero' ? 'Nombre de la Barbería' : 'Nombre del Salón'}
                value={form.shopName}
                onChange={(v) => setForm((p) => ({ ...p, shopName: v }))}
              />
              <Field label="Dirección" value={form.address} onChange={(v) => setForm((p) => ({ ...p, address: v }))} />
              <Field label="Descripción" value={form.bio} onChange={(v) => setForm((p) => ({ ...p, bio: v }))} type="textarea" />
            </div>
          </motion.div>

          {/* ── Card: Horario ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl p-6" style={card}>
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-5 flex items-center gap-2">
              <Bell size={12} /> Horario de Atención
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Apertura" value={form.openTime} onChange={(v) => setForm((p) => ({ ...p, openTime: v }))} type="time" />
              <Field label="Cierre" value={form.closeTime} onChange={(v) => setForm((p) => ({ ...p, closeTime: v }))} type="time" />
            </div>
          </motion.div>

          {/* ── Card: Notificaciones ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-6" style={card}>
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bell size={12} /> Notificaciones
            </p>
            <Toggle label="Email" desc="Recibe citas y cambios por correo" value={form.notifEmail} onChange={(v) => setForm((p) => ({ ...p, notifEmail: v }))} />
            <Toggle label="WhatsApp" desc="Alertas instantáneas por WhatsApp" value={form.notifWhatsapp} onChange={(v) => setForm((p) => ({ ...p, notifWhatsapp: v }))} />
            <Toggle label="SMS" desc="Mensajes de texto para recordatorios" value={form.notifSMS} onChange={(v) => setForm((p) => ({ ...p, notifSMS: v }))} />
          </motion.div>

          {/* ── Card: Apariencia ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2 rounded-2xl p-6" style={card}>
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-5 flex items-center gap-2">
              <Palette size={12} /> Apariencia de la Interfaz
            </p>
            <div className="flex flex-wrap gap-4">
              {(t.role === 'barbero' ? BARBER_PALETTES : SALON_PALETTES).map((p) => {
                const isActive = (currentPalette || (t.role === 'barbero' ? 'gold' : 'rose')) === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onPaletteChange?.(p.id)}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl transition-all hover:scale-105"
                    style={{ background: isActive ? p.accentLight : 'transparent', border: `1.5px solid ${isActive ? p.accent : t.border}` }}
                  >
                    <div className="w-12 h-12 rounded-full" style={{ background: p.accent }} />
                    <span style={{ color: t.text }} className="text-xs font-bold">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm"
            style={{ background: saved ? '#22c55e' : t.accent, color: '#fff' }}
          >
            {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
            {saved ? '¡Guardado!' : 'Guardar Cambios'}
          </motion.button>
          <button
            onClick={resetData}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all hover:scale-105"
            style={{ background: t.accentLight, color: t.accent, border: `1px solid ${t.border}` }}
          >
            <RotateCcw size={16} /> Restaurar datos demo
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all hover:scale-105"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Lock size={16} /> Cerrar Sesión
          </button>
        </div>
      </div>
    </>
  );
}
