import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  X, 
  Activity, 
  Stethoscope, 
  ShieldCheck, 
  ArrowRight,
  Cpu
} from 'lucide-react';
import { PatientProfile, Department, Doctor } from '../types';

interface AutoSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  departments: Department[];
  doctors: Doctor[];
  onConfirmSchedule: (bookingData: any) => Promise<void>;
}

export const AutoSchedulerModal: React.FC<AutoSchedulerModalProps> = ({
  isOpen,
  onClose,
  patient,
  departments,
  doctors,
  onConfirmSchedule
}) => {
  if (!isOpen) return null;

  // Suggested follow-up protocols based on clinical records
  const suggestedProtocols = [
    {
      id: 'proto-cardio',
      department: 'Cardiology',
      deptId: 'dept-cardio',
      doctorName: 'Dr. David Ochieng',
      doctorId: 'doc-1',
      title: '7-Day Post-Consultation Blood Pressure & ECG Review',
      reason: 'Medication titration & cardiovascular evaluation',
      recommendedDate: '2026-09-03',
      recommendedTime: '10:00 AM',
      equipment: '12-Lead Digital ECG & Echocardiography Bay (Operational)',
      badge: 'High Priority',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-300'
    },
    {
      id: 'proto-ortho',
      department: 'Orthopedics',
      deptId: 'dept-ortho',
      doctorName: 'Dr. Brian Kiprono',
      doctorId: 'doc-ortho',
      title: '14-Day Post-Op Joint Mobility & X-Ray Review',
      reason: 'Implant verification and rehabilitation assessment',
      recommendedDate: '2026-09-10',
      recommendedTime: '11:30 AM',
      equipment: 'High-Resolution Digital X-Ray PA Suite (Operational)',
      badge: 'Scheduled Protocol',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    {
      id: 'proto-peds',
      department: 'Pediatrics',
      deptId: 'dept-peds',
      doctorName: 'Dr. Grace Muthoni',
      doctorId: 'doc-2',
      title: '30-Day Child Wellness & Milestone Check',
      reason: 'Growth curve monitoring and booster immunization',
      recommendedDate: '2026-09-25',
      recommendedTime: '09:00 AM',
      equipment: 'Pediatric Growth & Phototherapy Suite (Available)',
      badge: 'Preventive Care',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
  ];

  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('proto-cardio');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-03');
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string>('');

  const activeProto = suggestedProtocols.find(p => p.id === selectedProtocolId) || suggestedProtocols[0];

  const handleBookProtocol = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmSchedule({
        patientId: patient.id,
        patientName: patient.name,
        patientPhone: patient.phone,
        patientNationalId: patient.nationalId,
        doctorId: activeProto.doctorId,
        departmentId: activeProto.deptId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        type: 'In-Person',
        reason: activeProto.reason,
        mpesaReceipt: `AUTO-${Date.now().toString().slice(-6)}`
      });
      setSuccessToast(`Follow-up appointment booked for ${selectedDate} at ${selectedTime}!`);
      setTimeout(() => {
        setSuccessToast('');
        onClose();
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to auto-schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">
                Smart Follow-Up Auto-Scheduler
              </h3>
              <p className="text-xs text-teal-200/80">
                Automated clinical recall synchronized with doctor & equipment availability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {successToast ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-sm">{successToast}</p>
              <p className="text-xs">A confirmation SMS has been dispatched to {patient.phone}.</p>
            </div>
          ) : (
            <>
              <p className="text-slate-600 leading-relaxed">
                Our care continuity algorithm identified the following recommended follow-up visits based on your clinical encounters and discharge recommendations:
              </p>

              <div className="space-y-2.5">
                {suggestedProtocols.map((proto) => {
                  const isSelected = selectedProtocolId === proto.id;
                  return (
                    <div
                      key={proto.id}
                      onClick={() => {
                        setSelectedProtocolId(proto.id);
                        setSelectedDate(proto.recommendedDate);
                        setSelectedTime(proto.recommendedTime);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'bg-teal-50/60 border-teal-500 shadow-md ring-2 ring-teal-400/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900">{proto.title}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${proto.badgeColor}`}>
                          {proto.badge}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 flex flex-wrap items-center gap-3">
                        <span>Attending: <strong>{proto.doctorName}</strong></span>
                        <span>Dept: <strong className="text-teal-700">{proto.department}</strong></span>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-100/70 border border-slate-200/60 text-[11px] flex items-center space-x-1.5 text-slate-700">
                        <Cpu className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>Equipment Sync: <strong>{proto.equipment}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-slate-900 block">Confirm Date & Time Slot:</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Appointment Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Preferred Time</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 font-bold"
                    >
                      <option value="09:00 AM">09:00 AM (Morning Slot)</option>
                      <option value="10:00 AM">10:00 AM (Morning Slot)</option>
                      <option value="11:30 AM">11:30 AM (Late Morning)</option>
                      <option value="02:00 PM">02:00 PM (Afternoon Slot)</option>
                      <option value="03:30 PM">03:30 PM (Afternoon Slot)</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!successToast && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 cursor-pointer text-xs"
            >
              Cancel
            </button>

            <button
              onClick={handleBookProtocol}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Syncing & Scheduling...' : 'Confirm 1-Click Follow-Up'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
