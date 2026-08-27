import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Archive, 
  RotateCcw, 
  Edit, 
  X, 
  Building2,
  Users
} from 'lucide-react';
import { Department } from '../types';

export interface SlotConfig {
  id: string;
  departmentId: string;
  departmentName: string;
  dayOfWeek: string;
  shift: 'Morning' | 'Afternoon' | 'Evening' | 'Full-Day';
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  maxPatientsPerSlot: number;
  isActive: boolean;
  isArchived?: boolean;
}

interface AdminSlotsProps {
  departments: Department[];
  onRefresh?: () => void;
}

export const AdminSlotsManagement: React.FC<AdminSlotsProps> = ({ departments, onRefresh }) => {
  const [slots, setSlots] = useState<SlotConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDeptId, setFormDeptId] = useState(departments[0]?.id || 'dept-cardio');
  const [formDay, setFormDay] = useState('Monday - Friday');
  const [formShift, setFormShift] = useState<'Morning' | 'Afternoon' | 'Evening' | 'Full-Day'>('Morning');
  const [formStart, setFormStart] = useState('08:30 AM');
  const [formEnd, setFormEnd] = useState('12:30 PM');
  const [formDuration, setFormDuration] = useState(20);
  const [formMaxPatients, setFormMaxPatients] = useState(12);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/slots?includeArchived=true');
      if (res.ok) {
        const data = await res.json();
        setSlots(data);
      }
    } catch (err) {
      console.error('Fetch slots error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormDeptId(departments[0]?.id || 'dept-cardio');
    setFormDay('Monday - Friday');
    setFormShift('Morning');
    setFormStart('08:30 AM');
    setFormEnd('12:30 PM');
    setFormDuration(20);
    setFormMaxPatients(12);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot: SlotConfig) => {
    setEditingId(slot.id);
    setFormDeptId(slot.departmentId);
    setFormDay(slot.dayOfWeek);
    setFormShift(slot.shift);
    setFormStart(slot.startTime);
    setFormEnd(slot.endTime);
    setFormDuration(slot.slotDurationMinutes);
    setFormMaxPatients(slot.maxPatientsPerSlot);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedDept = departments.find(d => d.id === formDeptId);
    const payload = {
      departmentId: formDeptId,
      departmentName: matchedDept?.name || 'Specialist Clinic',
      dayOfWeek: formDay,
      shift: formShift,
      startTime: formStart,
      endTime: formEnd,
      slotDurationMinutes: formDuration,
      maxPatientsPerSlot: formMaxPatients,
      isActive: true
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/slots/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setSlots(prev => prev.map(s => s.id === editingId ? updated : s));
          setToastMsg('Slot schedule configuration updated.');
        }
      } else {
        const res = await fetch('/api/slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setSlots(prev => [created, ...prev]);
          setToastMsg('New clinic appointment slot shift configured.');
        }
      }
      setIsModalOpen(false);
      setTimeout(() => setToastMsg(''), 4000);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Save slot error:', err);
    }
  };

  const handleToggleArchive = async (slot: SlotConfig) => {
    const newArchived = !slot.isArchived;
    try {
      const res = await fetch(`/api/slots/${slot.id}`, {
        method: newArchived ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: newArchived ? undefined : JSON.stringify({ isArchived: false })
      });
      if (res.ok) {
        setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, isArchived: newArchived } : s));
        setToastMsg(newArchived ? 'Slot schedule archived.' : 'Slot schedule restored.');
        setTimeout(() => setToastMsg(''), 4000);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Archive slot error:', err);
    }
  };

  const filteredSlots = slots.filter(s => showArchived ? s.isArchived : !s.isArchived);

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between text-xs font-bold animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-6 border border-white shadow-xl shadow-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center font-bold text-xl shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Clinic Appointment Slots & Shift Planner</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {slots.filter(s => !s.isArchived).length} Active Shifts
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Configure clinic operating shifts, consultation duration windows, and patient capacities
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
              showArchived 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Showing Archived' : 'View Archived'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md shadow-teal-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Configure Shift Slot</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Operating Days</th>
                <th className="py-3 px-4">Shift & Hours</th>
                <th className="py-3 px-4">Slot Duration</th>
                <th className="py-3 px-4">Max Capacity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    {loading ? 'Loading slot configurations...' : 'No slot configurations found.'}
                  </td>
                </tr>
              ) : (
                filteredSlots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {slot.departmentName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {slot.dayOfWeek}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-semibold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] mr-1.5 font-bold">
                        {slot.shift}
                      </span>
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td className="py-3.5 px-4 text-teal-700 font-bold">
                      {slot.slotDurationMinutes} mins / patient
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-bold">
                      {slot.maxPatientsPerSlot} patients max
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEdit(slot)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleArchive(slot)}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                        >
                          {slot.isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="text-sm font-bold">
                {editingId ? 'Edit Appointment Slot Shift' : 'Configure Clinic Appointment Slot Shift'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Department</label>
                <select
                  value={formDeptId}
                  onChange={(e) => setFormDeptId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Operating Days</label>
                  <input
                    type="text"
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value)}
                    placeholder="e.g. Mon, Wed, Fri"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Shift Type</label>
                  <select
                    value={formShift}
                    onChange={(e) => setFormShift(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    <option value="Morning">Morning Shift</option>
                    <option value="Afternoon">Afternoon Shift</option>
                    <option value="Evening">Evening Clinic</option>
                    <option value="Full-Day">Full-Day 24/7</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Time</label>
                  <input
                    type="text"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">End Time</label>
                  <input
                    type="text"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    placeholder="e.g. 12:30 PM"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Slot Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Max Patients / Shift</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formMaxPatients}
                    onChange={(e) => setFormMaxPatients(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Save Shift Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
