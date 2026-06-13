import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserCheck, Star, Calendar, Plus, Pencil, Camera, X, Clock } from 'lucide-react';
import { OwnerTheme } from '../ownerTheme';
import { useOwnerData } from '../../../context/OwnerDataContext';
import ImageCropperModal from '../ImageCropperModal';
import {
  SCHEDULE_HOURS,
  WEEKDAY_KEYS,
  WEEKDAY_LABELS,
  defaultWeeklySchedule,
  isEmployeeWorkingAt,
  isEmployeeWorkingOnDate,
  type EmployeeWeeklySchedule,
  type OwnerEmployee,
  type WeekdayKey,
} from '../../../data/ownerSeed';

interface Props { theme: OwnerTheme; }

interface EmployeeForm {
  name: string;
  role: string;
  specialty: string;
  photoUrl: string;
  schedule: EmployeeWeeklySchedule;
}

function emptyForm(roleDefault: string): EmployeeForm {
  return {
    name: '',
    role: roleDefault,
    specialty: '',
    photoUrl: '',
    schedule: defaultWeeklySchedule(),
  };
}

function employeeToForm(employee: OwnerEmployee): EmployeeForm {
  return {
    name: employee.name,
    role: employee.role,
    specialty: employee.specialty,
    photoUrl: employee.photoUrl ?? '',
    schedule: { ...employee.schedule },
  };
}

export default function EmpleadosView({ theme: t }: Props) {
  const { employees, appointments, today, addEmployee, updateEmployee, toggleEmployeeActive, role } = useOwnerData();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeForm>(() => emptyForm(role === 'barbero' ? 'Barbero' : 'Estilista'));
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultRole = role === 'barbero' ? 'Barbero' : 'Estilista';
  const todayAppts = appointments.filter((a) => a.date === today && a.status !== 'cancelled');
  const activeEmployees = employees.filter((e) => e.active);

  const scheduleHours = useMemo(() => {
    const hours = new Set<string>();
    activeEmployees.forEach((e) => {
      if (!isEmployeeWorkingOnDate(e, today)) return;
      const dayKey = WEEKDAY_KEYS.find((k) => {
        const d = new Date(`${today}T12:00:00`);
        const map: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        return map[d.getDay()] === k;
      });
      if (!dayKey) return;
      const sched = e.schedule[dayKey];
      SCHEDULE_HOURS.forEach((h) => {
        if (h >= sched.startTime && h < sched.endTime) hours.add(h);
      });
    });
    return Array.from(hours).sort();
  }, [activeEmployees, today]);

  const schedule = useMemo(() => {
    const map: Record<string, Record<string, string | null>> = {};
    activeEmployees.forEach((e, ei) => {
      map[e.id] = {};
      scheduleHours.forEach((hour) => {
        if (!isEmployeeWorkingAt(e, today, hour)) {
          map[e.id][hour] = null;
          return;
        }
        const match = todayAppts.find((a, ai) => a.time.startsWith(hour.slice(0, 2)) && ai % activeEmployees.length === ei);
        map[e.id][hour] = match
          ? `${match.clientName.split(' ')[0]} ${match.clientName.split(' ')[1]?.[0] || ''}.`
          : null;
      });
    });
    return map;
  }, [activeEmployees, todayAppts, scheduleHours, today]);

  const card = { background: t.cardBg, border: `1px solid ${t.border}` };
  const muted = { color: t.textMuted };
  const accent = { color: t.accent };

  const openNew = () => {
    setEditId(null);
    setForm(emptyForm(defaultRole));
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const employee = employees.find((e) => e.id === id);
    if (!employee) return;
    setEditId(id);
    setForm(employeeToForm(employee));
    setShowModal(true);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = (croppedDataUrl: string) => {
    setForm((prev) => ({ ...prev, photoUrl: croppedDataUrl }));
    setCropperOpen(false);
    setRawImageSrc('');
  };

  const updateDaySchedule = (day: WeekdayKey, patch: Partial<EmployeeWeeklySchedule[WeekdayKey]>) => {
    setForm((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: { ...prev.schedule[day], ...patch },
      },
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      role: form.role.trim() || defaultRole,
      specialty: form.specialty.trim(),
      photoUrl: form.photoUrl || undefined,
      schedule: form.schedule,
    };
    if (editId) {
      updateEmployee(editId, payload);
    } else {
      addEmployee(payload);
    }
    setShowModal(false);
  };

  const renderAvatar = (employee: OwnerEmployee, size = 'lg') => {
    const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-sm';
    if (employee.photoUrl) {
      return (
        <img
          src={employee.photoUrl}
          alt={employee.name}
          className={`${sizeClass} rounded-2xl object-cover`}
        />
      );
    }
    return (
      <div
        className={`${sizeClass} rounded-2xl flex items-center justify-center font-black`}
        style={{ background: t.accentLight, color: t.accent }}
      >
        {employee.avatar}
      </div>
    );
  };

  const enabledDaysCount = (schedule: EmployeeWeeklySchedule) =>
    WEEKDAY_KEYS.filter((d) => schedule[d].enabled).length;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p style={muted} className="text-xs font-bold uppercase tracking-widest mb-1">Equipo</p>
        <h2 style={{ color: t.text }} className="text-3xl font-black">Empleados</h2>
        <p style={muted} className="text-sm mt-1">
          Añade empleados, define su foto y configura qué días y horas trabajan.
        </p>
      </motion.div>

      <div className="flex gap-4 mb-6 overflow-x-auto pb-1">
        <div className="rounded-2xl px-5 py-4 flex-shrink-0" style={card}>
          <p style={muted} className="text-[10px] font-black uppercase tracking-widest mb-1">Activos</p>
          <p style={{ color: t.text }} className="text-2xl font-black">{activeEmployees.length}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          onClick={openNew}
          className="rounded-2xl px-5 py-4 flex items-center gap-2 flex-shrink-0"
          style={{ background: t.accent, color: '#fff' }}
        >
          <Plus size={16} />
          <span className="text-xs font-black uppercase tracking-wider">Nuevo Empleado</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {employees.map((e, i) => {
          const worksToday = isEmployeeWorkingOnDate(e, today);
          const empToday = worksToday
            ? todayAppts.filter((_, ai) => ai % Math.max(activeEmployees.length, 1) === i).length
            : 0;
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="rounded-2xl p-6"
              style={card}
            >
              <div className="flex items-start justify-between mb-4">
                {renderAvatar(e)}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(e.id)}
                    className="p-2 rounded-lg"
                    style={{ background: t.accentLight, color: t.accent }}
                    title="Editar empleado"
                  >
                    <Pencil size={14} />
                  </button>
                  <span
                    className="text-[10px] font-black px-2 py-1 rounded-full"
                    style={{
                      background: e.active ? 'rgba(34,197,94,0.15)' : 'rgba(161,161,170,0.15)',
                      color: e.active ? '#22c55e' : '#71717a',
                    }}
                  >
                    {e.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <h3 style={{ color: t.text }} className="font-black text-lg">{e.name}</h3>
              <p style={accent} className="text-xs font-bold mb-1">{e.role}</p>
              {e.specialty && <p style={muted} className="text-xs mb-3">{e.specialty}</p>}
              <p style={muted} className="text-[10px] font-bold mb-4">
                {enabledDaysCount(e.schedule)} día{enabledDaysCount(e.schedule) !== 1 ? 's' : ''} laborable{enabledDaysCount(e.schedule) !== 1 ? 's' : ''}/semana
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span style={muted} className="text-xs flex items-center gap-1">
                    <Calendar size={12} /> Citas hoy
                  </span>
                  <span style={{ color: t.text }} className="text-sm font-black">
                    {worksToday ? empToday : 'No labora'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={muted} className="text-xs flex items-center gap-1"><Star size={12} /> Rating</span>
                  <span style={accent} className="text-sm font-black">{e.rating} ★</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={muted} className="text-xs flex items-center gap-1"><UserCheck size={12} /> Desde</span>
                  <span style={muted} className="text-xs font-bold">{e.since}</span>
                </div>
              </div>
              <button
                onClick={() => toggleEmployeeActive(e.id)}
                className="w-full mt-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider"
                style={{ background: t.accentLight, color: t.accent }}
              >
                {e.active ? 'Desactivar' : 'Activar'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {activeEmployees.length > 0 && scheduleHours.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden" style={card}>
          <div className="p-5" style={{ borderBottom: `1px solid ${t.border}` }}>
            <p style={muted} className="text-[10px] font-black uppercase tracking-widest">
              Agenda del día — {today}
            </p>
            <p style={muted} className="text-xs mt-1">Solo se muestran horas y empleados que laboran hoy.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                  <th className="p-3 text-left text-[10px] font-black uppercase" style={muted}>Hora</th>
                  {activeEmployees.filter((e) => isEmployeeWorkingOnDate(e, today)).map((e) => (
                    <th key={e.id} className="p-3 text-left text-[10px] font-black uppercase" style={muted}>
                      {e.name.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleHours.map((hour, hi) => (
                  <tr key={hour} style={{ borderBottom: hi < scheduleHours.length - 1 ? `1px solid ${t.border}` : 'none' }}>
                    <td className="p-3 text-xs font-black" style={muted}>{hour}</td>
                    {activeEmployees
                      .filter((e) => isEmployeeWorkingOnDate(e, today))
                      .map((e) => {
                        const client = schedule[e.id]?.[hour];
                        const works = isEmployeeWorkingAt(e, today, hour);
                        return (
                          <td key={e.id} className="p-3">
                            {!works ? (
                              <span style={muted} className="text-xs opacity-50">—</span>
                            ) : client ? (
                              <motion.span
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-xs font-bold px-3 py-1 rounded-lg inline-block"
                                style={{ background: t.accentLight, color: t.accent }}
                              >
                                {client}
                              </motion.span>
                            ) : (
                              <span style={muted} className="text-xs">Libre</span>
                            )}
                          </td>
                        );
                      })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      <ImageCropperModal
        open={cropperOpen}
        imageSrc={rawImageSrc}
        aspect={1}
        slot="profileImage"
        theme={t}
        onConfirm={handleCropConfirm}
        onClose={() => { setCropperOpen(false); setRawImageSrc(''); }}
      />

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              className="w-full max-w-lg rounded-3xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto"
              style={{ background: t.isDark ? '#1a1a1a' : '#fff', border: `1px solid ${t.border}` }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full"
                style={{ background: t.accentLight, color: t.accent }}
              >
                <X size={16} />
              </button>

              <h3 style={{ color: t.text }} className="font-black text-2xl mb-6 pr-8">
                {editId ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>

              <div className="flex items-center gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 group"
                  style={{ background: t.accentLight, border: `2px dashed ${t.border}` }}
                >
                  {form.photoUrl ? (
                    <img src={form.photoUrl} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: t.accent }}>
                      <Camera size={24} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Camera size={18} color="#fff" />
                  </div>
                </button>
                <div>
                  <p style={{ color: t.text }} className="text-sm font-black">Foto del empleado</p>
                  <p style={muted} className="text-xs mt-1">Opcional. Recorte cuadrado como en configuración.</p>
                </div>
              </div>

              {[
                { key: 'name' as const, label: 'Nombre', placeholder: 'Nombre completo' },
                { key: 'role' as const, label: 'Cargo', placeholder: defaultRole },
                { key: 'specialty' as const, label: 'Especialidad', placeholder: 'Ej. Fades, Color, Uñas...' },
              ].map((field) => (
                <div key={field.key} className="mb-4">
                  <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={form[field.key]}
                    onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                    required={field.key === 'name'}
                  />
                </div>
              ))}

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} style={accent} />
                  <label style={{ color: t.text }} className="text-sm font-black">Horario semanal</label>
                </div>
                <p style={muted} className="text-xs mb-4">
                  Activa cada día por separado. Si un día está desactivado, no aparecerá en Horarios para este empleado.
                </p>
                <div className="space-y-3">
                  {WEEKDAY_KEYS.map((day) => {
                    const daySched = form.schedule[day];
                    return (
                      <div
                        key={day}
                        className="rounded-2xl p-4"
                        style={{
                          background: daySched.enabled ? t.accentLight : (t.isDark ? 'rgba(255,255,255,0.03)' : '#F9F9FB'),
                          border: `1px solid ${t.border}`,
                          opacity: daySched.enabled ? 1 : 0.7,
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span style={{ color: t.text }} className="text-sm font-black">{WEEKDAY_LABELS[day]}</span>
                          <button
                            type="button"
                            onClick={() => updateDaySchedule(day, { enabled: !daySched.enabled })}
                            className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider"
                            style={{
                              background: daySched.enabled ? t.accent : 'rgba(161,161,170,0.2)',
                              color: daySched.enabled ? '#fff' : '#71717a',
                            }}
                          >
                            {daySched.enabled ? 'Labora' : 'No labora'}
                          </button>
                        </div>
                        {daySched.enabled && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1">
                                Desde
                              </label>
                              <select
                                value={daySched.startTime}
                                onChange={(e) => updateDaySchedule(day, { startTime: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                              >
                                {SCHEDULE_HOURS.map((h) => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label style={muted} className="text-[10px] font-black uppercase tracking-widest block mb-1">
                                Hasta
                              </label>
                              <select
                                value={daySched.endTime}
                                onChange={(e) => updateDaySchedule(day, { endTime: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                                style={{ background: t.inputBg, border: `1px solid ${t.border}`, color: t.text }}
                              >
                                {SCHEDULE_HOURS.filter((h) => h > daySched.startTime).map((h) => (
                                  <option key={h} value={h}>{h}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-black"
                  style={{ background: t.accentLight, color: t.accent }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.name.trim()}
                  className="flex-1 py-3 rounded-2xl text-sm font-black disabled:opacity-50"
                  style={{ background: t.accent, color: '#fff' }}
                >
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
