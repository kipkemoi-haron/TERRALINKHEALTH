import React, { useState } from 'react';
import { 
  FileText, 
  Pill, 
  FlaskConical, 
  Activity, 
  CreditCard, 
  ShieldCheck, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  Eye, 
  Sparkles,
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { 
  PatientProfile, 
  ClinicalEncounter, 
  Prescription, 
  LabOrder, 
  RadiologyOrder, 
  ImmunizationRecord, 
  Invoice 
} from '../types';

interface HealthWalletTimelineProps {
  patient: PatientProfile;
  encounters: ClinicalEncounter[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  radiologyOrders: RadiologyOrder[];
  immunizations: ImmunizationRecord[];
  invoices: Invoice[];
  onViewReport: (data: any) => void;
  onOpenAutoScheduler: () => void;
}

export const HealthWalletTimeline: React.FC<HealthWalletTimelineProps> = ({
  patient,
  encounters,
  prescriptions,
  labOrders,
  radiologyOrders,
  immunizations,
  invoices,
  onViewReport,
  onOpenAutoScheduler
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Normalize all records into a single chronological timeline
  const timelineItems: Array<{
    id: string;
    type: 'encounter' | 'prescription' | 'lab' | 'radiology' | 'immunization' | 'invoice';
    date: string;
    time?: string;
    title: string;
    subtitle: string;
    badge: string;
    badgeColor: string;
    doctorName?: string;
    details: string;
    rawItem: any;
  }> = [];

  encounters.forEach(e => {
    timelineItems.push({
      id: `enc-${e.id}`,
      type: 'encounter',
      date: e.date,
      time: e.time || '10:00 AM',
      title: e.diagnosis || 'Clinical Consultation',
      subtitle: `${e.departmentName || 'Specialist Clinic'} • ${e.doctorName}`,
      badge: e.type || 'In-Person Consultation',
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
      doctorName: e.doctorName,
      details: e.clinicalNotes || e.symptoms?.join(', ') || 'Comprehensive specialist examination and treatment plan.',
      rawItem: e
    });
  });

  prescriptions.forEach(p => {
    timelineItems.push({
      id: `rx-${p.id}`,
      type: 'prescription',
      date: p.prescribedDate,
      title: `E-Prescription: ${p.medications.map(m => m.name).join(', ')}`,
      subtitle: `Prescribed by ${p.doctorName}`,
      badge: p.status === 'Active' ? 'Active Regimen' : 'Completed',
      badgeColor: p.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200',
      doctorName: p.doctorName,
      details: p.medications.map(m => `${m.name} (${m.dosage} - ${m.frequency})`).join(' • '),
      rawItem: p
    });
  });

  labOrders.forEach(l => {
    timelineItems.push({
      id: `lab-${l.id}`,
      type: 'lab',
      date: l.orderDate,
      title: `Lab Diagnostics: ${l.tests.map(t => t.name).join(', ')}`,
      subtitle: `Ordered by ${l.doctorName} • ${l.sampleType} Sample`,
      badge: l.status === 'Completed' ? 'Results Verified' : 'Sample Processing',
      badgeColor: l.status === 'Completed' ? 'bg-sky-50 text-sky-800 border-sky-200' : 'bg-amber-50 text-amber-800 border-amber-200',
      doctorName: l.doctorName,
      details: l.tests.map(t => `${t.name}: ${t.result || 'Pending'} (${t.unit || ''})`).join(' | '),
      rawItem: l
    });
  });

  radiologyOrders.forEach(r => {
    timelineItems.push({
      id: `rad-${r.id}`,
      type: 'radiology',
      date: r.orderDate,
      title: `Radiology & Imaging: ${r.modality} (${r.bodyPart})`,
      subtitle: `Radiologist: ${r.radiologistName || 'Lead Specialist'}`,
      badge: r.status === 'Completed' ? 'Scans Available' : 'Scheduled',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      details: r.findings || r.impression || 'High-resolution DICOM imaging series completed.',
      rawItem: r
    });
  });

  immunizations.forEach(im => {
    timelineItems.push({
      id: `imm-${im.id}`,
      type: 'immunization',
      date: im.administeredDate,
      title: `Vaccine: ${im.vaccineName} (${im.doseNumber})`,
      subtitle: `Administered by ${im.administeredBy}`,
      badge: 'Certified',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      details: `Batch: ${im.batchNumber} • Ministry of Health KE Verified Immunization Certificate`,
      rawItem: im
    });
  });

  invoices.forEach(inv => {
    timelineItems.push({
      id: `inv-${inv.id}`,
      type: 'invoice',
      date: inv.issueDate,
      title: `Invoice #${inv.invoiceNumber} (KES ${inv.totalAmountKES.toLocaleString()})`,
      subtitle: `Due: ${inv.dueDate} • M-PESA / SHIF Linked`,
      badge: inv.status === 'Paid' ? 'Paid & Receipted' : 'Payment Due',
      badgeColor: inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200',
      details: inv.items.map(i => `${i.description} (KES ${i.amountKES})`).join(', '),
      rawItem: inv
    });
  });

  // Sort descending by date
  timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredItems = timelineItems.filter(item => {
    const matchesFilter = filterType === 'all' || item.type === filterType;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesFilter;
    return matchesFilter && (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.details.toLowerCase().includes(q) ||
      item.date.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 sm:p-7 border border-white/80 shadow-lg shadow-slate-200/50 space-y-6">
      {/* Top Banner with Auto-Scheduler Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Unified Health Wallet & EMR Timeline
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {timelineItems.length} Total Records
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Encrypted, tamper-proof chronological history of consultations, labs, radiology, and pharmacy prescriptions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAutoScheduler}
            className="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Schedule Follow-Up</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search health records, doctors, prescriptions..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none text-xs font-semibold">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'encounter', label: 'Consultations' },
            { id: 'prescription', label: 'Medications (Rx)' },
            { id: 'lab', label: 'Lab Reports' },
            { id: 'radiology', label: 'Scans & Imaging' },
            { id: 'immunization', label: 'Vaccines' },
            { id: 'invoice', label: 'Invoices & Receipts' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-teal-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No health wallet records found matching your filters.
          </div>
        ) : (
          filteredItems.map((item) => {
            const iconMap = {
              encounter: Stethoscope,
              prescription: Pill,
              lab: FlaskConical,
              radiology: Activity,
              immunization: ShieldCheck,
              invoice: CreditCard
            };
            const Icon = iconMap[item.type] || FileText;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-teal-500 shadow-xs flex items-center justify-center text-teal-600 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all">
                  <Icon className="w-3 h-3" />
                </div>

                {/* Timeline Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-medium">
                      <Calendar className="w-3 h-3 text-teal-600" />
                      <span>{item.date}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {item.details}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      ID: <strong className="font-mono text-slate-600">{item.id}</strong>
                    </span>

                    <button
                      onClick={() => onViewReport({
                        title: item.title,
                        type: item.type === 'lab' ? 'lab_report' : item.type === 'invoice' ? 'invoice' : 'medical_report',
                        encounter: item.type === 'encounter' ? item.rawItem : undefined,
                        labOrder: item.type === 'lab' ? item.rawItem : undefined,
                        invoice: item.type === 'invoice' ? item.rawItem : undefined
                      })}
                      className="px-3 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] border border-teal-200 transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Certified Document</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
