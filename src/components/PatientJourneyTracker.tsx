import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileText, 
  CreditCard, 
  Pill, 
  Stethoscope, 
  FlaskConical, 
  ShieldCheck, 
  MapPin, 
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { PatientProfile, Appointment, ClinicalEncounter, Prescription, LabOrder, Invoice } from '../types';

interface PatientJourneyTrackerProps {
  patient: PatientProfile;
  activeAppointment?: Appointment;
  encounters: ClinicalEncounter[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  invoices: Invoice[];
  onOpenBooking: () => void;
  onOpenRecords: (tab: string) => void;
  onOpenBilling: () => void;
  onOpenNurseChat: () => void;
}

export const PatientJourneyTracker: React.FC<PatientJourneyTrackerProps> = ({
  patient,
  activeAppointment,
  encounters,
  prescriptions,
  labOrders,
  invoices,
  onOpenBooking,
  onOpenRecords,
  onOpenBilling,
  onOpenNurseChat
}) => {
  // Determine current active step dynamically
  const hasUnpaid = invoices.some(i => i.status !== 'Paid');
  const hasPendingPrescription = prescriptions.some(p => p.status === 'Active');
  const hasPendingLab = labOrders.some(l => l.status === 'Pending' || l.status === 'Processing');
  const hasRecentEncounter = encounters.length > 0;
  
  // Journey Steps: 1: Check-in, 2: Triage, 3: Consultation, 4: Diagnostics/Labs, 5: Pharmacy & Discharge
  const [selectedStep, setSelectedStep] = useState<number>(3);

  const steps = [
    {
      id: 1,
      title: 'Digital Check-In',
      code: 'CK-4029',
      location: 'Reception Counter 3',
      status: 'Completed',
      time: '08:45 AM',
      description: 'Identity verification, SHIF policy validation, and electronic token allocation.',
      badge: 'Completed',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 2,
      title: 'AI & Nurse Triage',
      code: 'TR-102',
      location: 'Triage Bay Alpha',
      status: 'Completed',
      time: '09:05 AM',
      description: 'Vitals logged: BP 122/78 mmHg, SpO2 98%, HR 72 bpm. Triage Level: Standard (Green).',
      badge: 'Green (Standard)',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200'
    },
    {
      id: 3,
      title: 'Specialist Consultation',
      code: activeAppointment ? `APT-${activeAppointment.id.slice(-4)}` : 'CONS-204',
      location: 'Consultation Suite 204',
      status: 'In Progress',
      time: '09:30 AM',
      description: activeAppointment 
        ? `Consultation with ${activeAppointment.doctorName || 'Attending Specialist'} (${activeAppointment.departmentName || 'Cardiology'}).`
        : 'Specialist clinical assessment, examination, and treatment plan.',
      badge: 'Current Stage',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-300 font-bold animate-pulse'
    },
    {
      id: 4,
      title: 'Diagnostics & Labs',
      code: 'LAB-904',
      location: 'Diagnostic Wing B',
      status: hasPendingLab ? 'In Progress' : labOrders.length > 0 ? 'Completed' : 'Scheduled',
      time: '10:15 AM',
      description: `${labOrders.length} lab investigation(s) & imaging scans ordered with synced equipment reservations.`,
      badge: hasPendingLab ? 'Processing' : 'Sample Collected',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      id: 5,
      title: 'Pharmacy & Discharge',
      code: 'PH-310',
      location: 'Main Pharmacy Counter 4',
      status: hasPendingPrescription ? 'Pending Dispense' : 'Ready',
      time: '11:00 AM',
      description: 'E-Prescription dispense, dosage consultation, and electronic discharge summary.',
      badge: hasUnpaid ? 'Pending Payment' : 'Ready for Pickup',
      badgeColor: hasUnpaid ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  ];

  const currentStepData = steps.find(s => s.id === selectedStep) || steps[2];

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 sm:p-6 border border-white/80 shadow-lg shadow-slate-200/50 space-y-5">
      {/* Header with live token & ETA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30 font-black text-sm">
            <Sparkles className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Hospital Journey Tracker
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100/70 text-teal-800 border border-teal-300/60">
                Live Flow
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real-time progress monitoring from electronic check-in to pharmacy medication discharge
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-1.5 text-slate-700 font-semibold">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>Estimated Flow: <strong>45 mins total</strong></span>
          </div>
          <button
            onClick={onOpenNurseChat}
            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold transition-all cursor-pointer"
          >
            Chat with Nurse
          </button>
        </div>
      </div>

      {/* Visual Stepper / Progress Flow */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative z-10">
          {steps.map((step, idx) => {
            const isSelected = selectedStep === step.id;
            const isCompleted = step.status === 'Completed';
            const isInProgress = step.status === 'In Progress';

            return (
              <div
                key={step.id}
                onClick={() => setSelectedStep(step.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-400/20'
                    : isCompleted
                    ? 'bg-white/80 border-slate-200 hover:border-slate-300'
                    : 'bg-slate-50/70 border-slate-200/60 hover:bg-white'
                }`}
              >
                {/* Step indicator bar */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : isInProgress 
                        ? 'bg-amber-500 text-white animate-pulse' 
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{step.time}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">{step.title}</h4>
                  <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5 truncate">
                    <MapPin className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                    <span>{step.location}</span>
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-teal-700 font-bold">{step.code}</span>
                  <span className="text-slate-400 font-semibold">{isSelected ? 'Active View' : 'View'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Step Detail Drawer */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/60 via-slate-50/80 to-white border border-teal-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-950 uppercase tracking-wider">
              Step {currentStepData.id} • {currentStepData.title}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-teal-700 font-semibold">{currentStepData.location}</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {currentStepData.id === 3 && (
            <button
              onClick={onOpenBooking}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Manage Consultation</span>
            </button>
          )}

          {currentStepData.id === 4 && (
            <button
              onClick={() => onOpenRecords('labs')}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>View Lab Reports</span>
            </button>
          )}

          {currentStepData.id === 5 && (
            <button
              onClick={onOpenBilling}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay & Pick Meds</span>
            </button>
          )}

          <button
            onClick={() => onOpenRecords('visits')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer flex items-center space-x-1"
          >
            <FileText className="w-3.5 h-3.5 text-teal-600" />
            <span>Health Wallet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
