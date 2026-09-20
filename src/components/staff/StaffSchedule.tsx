import React, { useState } from 'react';
import { Calendar, Clock, Video, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Appointment } from '../../types';

interface StaffScheduleProps {
  appointments: Appointment[];
  onSelectPatient: (patientId: string) => void;
  onNavigateTab: (tab: 'consultation') => void;
}

export const StaffSchedule: React.FC<StaffScheduleProps> = ({
  appointments,
  onSelectPatient,
  onNavigateTab
}) => {
  // 6-day availability toggle states
  const [availableDays, setAvailableDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
  });

  const toggleDay = (dayKey: keyof typeof availableDays) => {
    setAvailableDays(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }));
  };

  // 10 scheduled slots matching screenshots
  const timelineSlots = [
    { time: '08:00 - 08:30', patientId: 'P001', name: 'Mary Wambui', reason: 'Chest pain', status: 'In Progress', type: 'In-Person' },
    { time: '08:30 - 09:00', patientId: 'P002', name: 'John Mwangi', reason: 'HTN Follow-up', status: 'Waiting', type: 'In-Person' },
    { time: '09:00 - 09:30', patientId: 'P003', name: 'Sarah Achieng', reason: 'Prenatal visit', status: 'Scheduled', type: 'Telemedicine' },
    { time: '09:30 - 10:00', patientId: 'P004', name: 'Peter Ouma', reason: 'Diabetic review', status: 'Scheduled', type: 'In-Person' },
    { time: '10:00 - 10:30', patientId: 'P005', name: 'Grace Njoki', reason: 'High fever', status: 'Scheduled', type: 'In-Person' },
    { time: '10:30 - 11:00', patientId: 'BREAK-01', name: 'Tea Break', reason: 'Hospital Clinical Rest', status: 'Rest', type: 'Break' },
    { time: '11:00 - 11:30', patientId: 'P006', name: 'Daniel Kibet', reason: 'Back pain', status: 'Scheduled', type: 'Telemedicine' },
    { time: '11:30 - 12:00', patientId: 'P008', name: 'Ann Otieno', reason: 'Skin rash', status: 'Scheduled', type: 'In-Person' },
    { time: '14:00 - 14:30', patientId: 'P009', name: 'Joseph Njoroge', reason: 'Annual checkup', status: 'Scheduled', type: 'In-Person' },
    { time: '14:30 - 15:00', patientId: 'P010', name: 'Catherine Wangari', reason: 'Lab review', status: 'Scheduled', type: 'Telemedicine' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          My Schedule
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Roster calendar, availability configuration, and appointment sessions
        </p>
      </div>

      {/* CARD 1: Set Your Available Days */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <span>🗓️</span>
          <span>Set Your Available Days</span>
        </h2>

        {/* 6 Day Interactive Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { key: 'monday', label: 'Monday' },
            { key: 'tuesday', label: 'Tuesday' },
            { key: 'wednesday', label: 'Wednesday' },
            { key: 'thursday', label: 'Thursday' },
            { key: 'friday', label: 'Friday' },
            { key: 'saturday', label: 'Saturday' },
          ].map((day) => {
            const isAvailable = availableDays[day.key as keyof typeof availableDays];
            return (
              <div
                key={day.key}
                onClick={() => toggleDay(day.key as keyof typeof availableDays)}
                className={`p-3.5 rounded-xl border flex flex-col justify-between h-24 cursor-pointer transition-all ${
                  isAvailable
                    ? 'bg-emerald-50/50 border-emerald-300 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{day.label}</span>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                    isAvailable ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
                      isAvailable ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <span className={`text-[11px] font-semibold ${
                  isAvailable ? 'text-emerald-700' : 'text-slate-400'
                }`}>
                  {isAvailable ? 'Available' : 'Off Duty'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Sunday Closed Notice */}
        <div className="mt-4 p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Sunday: Hospital is closed. No appointments can be scheduled.</span>
        </div>
      </div>

      {/* CARD 2: Today's Schedule Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900">
            Today's Schedule — Friday, July 24, 2026
          </h2>
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full">
            10 Appointments
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {timelineSlots.map((slot, index) => {
            const isBreak = slot.type === 'Break';
            const isInProgress = slot.status === 'In Progress';
            const isWaiting = slot.status === 'Waiting';

            return (
              <div
                key={index}
                className={`py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl transition-colors ${
                  isBreak 
                    ? 'bg-amber-50/50' 
                    : 'hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-28 shrink-0 flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.time}</span>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">
                        {slot.name}
                      </span>
                      {slot.patientId !== 'BREAK-01' && (
                        <span className="text-xs text-slate-400 font-medium">
                          ({slot.patientId})
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isInProgress
                          ? 'bg-blue-100 text-blue-700'
                          : isWaiting
                            ? 'bg-[#023545] text-white'
                            : isBreak
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-slate-100 text-slate-600'
                      }`}>
                        {slot.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {slot.reason} · <span className="font-medium text-slate-700">{slot.type}</span>
                    </p>
                  </div>
                </div>

                {!isBreak && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectPatient(slot.patientId);
                      onNavigateTab('consultation');
                    }}
                    className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-[#023545] hover:bg-[#0b4c5e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Open Consult
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
