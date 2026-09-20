import React, { useState } from 'react';
import { Search, User, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import { PatientProfile } from '../../types';

interface StaffPatientsProps {
  patients: PatientProfile[];
  onSelectPatient: (patientId: string) => void;
  onNavigateTab: (tab: 'consultation') => void;
}

interface PatientDisplayItem {
  id: string;
  name: string;
  ageGender: string;
  complaint: string;
  status: 'Waiting' | 'In Progress' | 'Scheduled' | 'Completed';
  priority: 'Urgent' | 'Normal';
  actionLabel: string;
}

export const StaffPatients: React.FC<StaffPatientsProps> = ({
  patients,
  onSelectPatient,
  onNavigateTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Waiting' | 'In Progress' | 'Scheduled'>('All');

  // Baseline patient directory matching screenshots
  const standardList: PatientDisplayItem[] = [
    { id: 'P001', name: 'Mary Wambui', ageGender: '34 F', complaint: 'Chest pain', status: 'Waiting', priority: 'Urgent', actionLabel: 'Attend' },
    { id: 'P002', name: 'John Mwangi', ageGender: '52 M', complaint: 'HTN Follow-up', status: 'In Progress', priority: 'Normal', actionLabel: 'Continue' },
    { id: 'P003', name: 'Sarah Achieng', ageGender: '28 F', complaint: 'Prenatal visit', status: 'Waiting', priority: 'Normal', actionLabel: 'Attend' },
    { id: 'P004', name: 'Peter Ouma', ageGender: '67 M', complaint: 'Diabetic review', status: 'Waiting', priority: 'Normal', actionLabel: 'Attend' },
    { id: 'P005', name: 'Grace Njoki', ageGender: '5 F', complaint: 'High fever', status: 'Waiting', priority: 'Urgent', actionLabel: 'Attend' },
    { id: 'P006', name: 'Daniel Kibet', ageGender: '41 M', complaint: 'Back pain', status: 'Waiting', priority: 'Normal', actionLabel: 'Attend' },
    { id: 'P007', name: 'Alice Kamau', ageGender: '29 F', complaint: 'Routine checkup', status: 'Scheduled', priority: 'Normal', actionLabel: 'View' },
    { id: 'P008', name: 'Ann Otieno', ageGender: '35 F', complaint: 'Skin rash', status: 'Scheduled', priority: 'Normal', actionLabel: 'View' },
    { id: 'P009', name: 'Joseph Njoroge', ageGender: '48 M', complaint: 'Annual checkup', status: 'Scheduled', priority: 'Normal', actionLabel: 'View' },
    { id: 'P010', name: 'Catherine Wangari', ageGender: '39 F', complaint: 'Lab review', status: 'Scheduled', priority: 'Normal', actionLabel: 'View' },
  ];

  const filtered = standardList.filter(p => {
    const matchesFilter = activeFilter === 'All' || p.status === activeFilter;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.complaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Patients
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Clinical directory and patient queue management
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#023545] shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Waiting', 'In Progress', 'Scheduled'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === filter
                  ? 'bg-[#023545] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Patients Card Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((p) => {
          const isWaiting = p.status === 'Waiting';
          const isInProgress = p.status === 'In Progress';

          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      ID: {p.id} · {p.ageGender}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isWaiting 
                        ? 'bg-[#023545] text-white' 
                        : isInProgress 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-slate-100 text-slate-700'
                    }`}>
                      {p.status}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      p.priority === 'Urgent' 
                        ? 'bg-rose-100 text-rose-700' 
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {p.priority}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mt-2.5">
                  Complaint: <strong className="text-slate-800">{p.complaint}</strong>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Outpatient General Clinic
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPatient(p.id);
                    onNavigateTab('consultation');
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    p.actionLabel === 'Attend' || p.actionLabel === 'Continue'
                      ? 'bg-[#023545] hover:bg-[#0b4c5e] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {p.actionLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
