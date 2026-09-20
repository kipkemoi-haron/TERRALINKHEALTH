import React from 'react';
import { 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Video, 
  ArrowRight,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { PatientProfile, Appointment, LabOrder } from '../../types';

interface StaffDashboardProps {
  userName: string;
  onNavigateTab: (tab: 'patients' | 'consultation' | 'schedule' | 'lab_orders') => void;
  onSelectPatient: (patientId: string) => void;
  onOpenLabAlert: (labOrder: LabOrder) => void;
  appointments: Appointment[];
  criticalLabOrder?: LabOrder;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  userName,
  onNavigateTab,
  onSelectPatient,
  onOpenLabAlert,
  appointments,
  criticalLabOrder
}) => {
  // 5 Waiting Patients matching screenshot
  const waitingPatientsList = [
    {
      id: 'P001',
      name: 'Mary Wambui',
      ageGender: '34 F',
      complaint: 'Chest pain',
      priority: 'Urgent',
      status: 'Waiting'
    },
    {
      id: 'P003',
      name: 'Sarah Achieng',
      ageGender: '28 F',
      complaint: 'Prenatal visit',
      priority: 'Normal',
      status: 'Waiting'
    },
    {
      id: 'P004',
      name: 'Peter Ouma',
      ageGender: '67 M',
      complaint: 'Diabetic review',
      priority: 'Normal',
      status: 'Waiting'
    },
    {
      id: 'P005',
      name: 'Grace Njoki',
      ageGender: '5 F',
      complaint: 'High fever',
      priority: 'Urgent',
      status: 'Waiting'
    },
    {
      id: 'P006',
      name: 'Daniel Kibet',
      ageGender: '41 M',
      complaint: 'Back pain',
      priority: 'Normal',
      status: 'Waiting'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Good Morning, {userName || 'Marko Bare'} 👋
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Friday, July 24, 2026
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('consultation')}
          className="inline-flex items-center justify-center space-x-2 bg-[#023545] hover:bg-[#0b4c5e] text-white font-medium px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer self-start sm:self-auto active:scale-98"
          id="btn-start-teleconsult"
        >
          <Video className="w-4 h-4" />
          <span>Start Teleconsult</span>
        </button>
      </div>

      {/* 4 Metric Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Today's Appointments */}
        <div 
          onClick={() => onNavigateTab('schedule')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-blue-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">12</span>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Today's Appointments
          </p>
        </div>

        {/* Metric 2: Waiting Patients */}
        <div 
          onClick={() => onNavigateTab('patients')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-amber-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">5</span>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Waiting Patients
          </p>
        </div>

        {/* Metric 3: Completed Today */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">5</span>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Completed Today
          </p>
        </div>

        {/* Metric 4: Critical Alerts */}
        <div 
          onClick={() => onNavigateTab('lab_orders')}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-rose-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">1</span>
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Critical Alerts
          </p>
        </div>
      </div>

      {/* Waiting Patients List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Waiting Patients
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('patients')}
            className="text-xs sm:text-sm font-semibold text-[#023545] hover:text-[#0b4c5e] flex items-center space-x-1 hover:underline cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {waitingPatientsList.map((patient) => (
            <div 
              key={patient.id}
              className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center space-x-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                    {patient.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    · {patient.ageGender}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    patient.priority === 'Urgent'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {patient.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complaint: <strong className="text-slate-700 font-medium">{patient.complaint}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectPatient(patient.id);
                  onNavigateTab('consultation');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#023545] hover:bg-[#0b4c5e] text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                Attend
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Lab Alert Notification Card */}
      <div className="bg-rose-50/90 border border-rose-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-rose-900 text-sm sm:text-base">
                Critical Lab Alert
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800 uppercase">
                STAT
              </span>
            </div>
            <p className="text-xs sm:text-sm text-rose-800 mt-0.5">
              Patient <strong>Mary Wambui</strong> — ⚠️ Potassium level: <strong>6.2 mEq/L</strong> (Critical High). Immediate review required.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (criticalLabOrder) {
              onOpenLabAlert(criticalLabOrder);
            } else {
              onNavigateTab('lab_orders');
            }
          }}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0 self-end sm:self-center"
        >
          Review
        </button>
      </div>
    </div>
  );
};
