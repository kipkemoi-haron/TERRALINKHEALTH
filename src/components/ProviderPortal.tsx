import React, { useState, useRef } from 'react';
import { 
  Menu, 
  X, 
  Camera, 
  Upload, 
  Trash2, 
  Bed, 
  Scan, 
  Pill, 
  CheckCircle2, 
  AlertCircle, 
  UserCircle,
  FileCheck2,
  Clock,
  FlaskConical,
  LogOut
} from 'lucide-react';
import { 
  User, 
  PatientProfile, 
  Department, 
  Doctor, 
  Appointment, 
  ClinicalEncounter, 
  Prescription, 
  LabOrder, 
  RadiologyOrder, 
  Invoice,
  InpatientAdmission
} from '../types';
import { StaffDrawer, StaffPortalTab } from './staff/StaffDrawer';
import { StaffDashboard } from './staff/StaffDashboard';
import { StaffPatients } from './staff/StaffPatients';
import { StaffConsultation } from './staff/StaffConsultation';
import { StaffSchedule } from './staff/StaffSchedule';
import { StaffLabOrders } from './staff/StaffLabOrders';
import { TelemedicineRoom } from './TelemedicineRoom';

interface ProviderPortalProps {
  currentUser: User;
  patients: PatientProfile[];
  departments: Department[];
  doctors: Doctor[];
  appointments: Appointment[];
  encounters: ClinicalEncounter[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  radiologyOrders: RadiologyOrder[];
  invoices: Invoice[];
  onSaveEncounter: (encounterData: any) => Promise<void>;
  onSaveLabResults: (labOrderId: string, results: any[], notes: string, techName: string) => Promise<void>;
  onSaveRadiologyReport: (orderId: string, findings: string, impression: string, radiologistName: string) => Promise<void>;
  onDispensePrescription: (rxId: string, dispensedBy: string, batchNumber: string) => Promise<void>;
  onCreateLabOrder: (orderData: any) => Promise<void>;
  onCreateRadiologyOrder: (orderData: any) => Promise<void>;
  onCreatePrescription: (rxData: any) => Promise<void>;
  onUpdateAppointmentStatus: (aptId: string, status: any) => Promise<void>;
  onUpdateUser?: (updated: User) => void;
  onNavigatePortal?: (portal: 'home' | 'patient' | 'provider' | 'admin') => void;
  onDownloadApp?: () => void;
  onLogout?: () => void;
}

export const ProviderPortal: React.FC<ProviderPortalProps> = ({
  currentUser,
  patients,
  departments,
  doctors,
  appointments,
  encounters,
  prescriptions,
  labOrders,
  radiologyOrders,
  invoices,
  onSaveEncounter,
  onSaveLabResults,
  onSaveRadiologyReport,
  onDispensePrescription,
  onCreateLabOrder,
  onCreateRadiologyOrder,
  onCreatePrescription,
  onUpdateAppointmentStatus,
  onUpdateUser,
  onNavigatePortal,
  onDownloadApp,
  onLogout
}) => {
  // Navigation State - defaults to 'dashboard' matching Image 1
  const [activeTab, setActiveTab] = useState<StaffPortalTab>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Selected Patient for Consultation
  const [selectedPatientId, setSelectedPatientId] = useState('P001');

  // Selected Alert Lab Order for Modal
  const criticalOrder = labOrders.find(l => l.criticalAlert) || labOrders[0];
  const [selectedAlertOrder, setSelectedAlertOrder] = useState<LabOrder | undefined>(undefined);

  // Live Telemedicine Video Room State
  const [isLiveTelemedicineOpen, setIsLiveTelemedicineOpen] = useState(false);
  const [activeTelemedicinePatient, setActiveTelemedicinePatient] = useState('Mary Wambui');

  // Profile Avatar Modal States
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(currentUser.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Secondary Workbench States (Radiology, Admissions, Pharmacy)
  const [activeRadOrderId, setActiveRadOrderId] = useState<string>(radiologyOrders[0]?.id || '');
  const activeRadOrder = radiologyOrders.find(r => r.id === activeRadOrderId) || radiologyOrders[0];
  const [radFindings, setRadFindings] = useState('Bilateral lung fields clear. Cardiothoracic ratio normal (<50%). No acute consolidation or pneumothorax.');
  const [radImpression, setRadImpression] = useState('Normal Chest PA radiograph.');
  
  const [activeRxId, setActiveRxId] = useState<string>(prescriptions[0]?.id || '');
  const activeRx = prescriptions.find(p => p.id === activeRxId) || prescriptions[0];
  const [dispenseBatch, setDispenseBatch] = useState('GSK-2026-08');

  // Inpatient mock admissions list
  const [admissionsList, setAdmissionsList] = useState<InpatientAdmission[]>([
    {
      id: 'adm-001',
      patientId: 'P001',
      patientName: 'Mary Wambui',
      ward: 'Acute Medical Ward 3A',
      bedNumber: 'Bed 14',
      admittedDate: '2026-07-24',
      admittingDoctor: 'Dr. Amina Wanjiku',
      admissionReason: 'Subacute chest pain observation and telemetry monitoring',
      status: 'Admitted',
      dailyChargeKES: 4500
    },
    {
      id: 'adm-002',
      patientId: 'P005',
      patientName: 'Grace Njoki',
      ward: 'Pediatric Observation Bay',
      bedNumber: 'Cot 03',
      admittedDate: '2026-07-24',
      admittingDoctor: 'Dr. Grace Akinyi',
      admissionReason: 'Severe pediatric febrile monitoring',
      status: 'Admitted',
      dailyChargeKES: 3500
    }
  ]);

  // Compute Initials
  const initials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'MB';

  // Handle Avatar Update
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setLocalAvatar(dataUrl);
      const updated = { ...currentUser, avatar: dataUrl };
      onUpdateUser?.(updated);
      setAvatarUploading(false);
      setIsAvatarModalOpen(false);
    };
    reader.onerror = () => {
      alert('Error reading the image file.');
      setAvatarUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatarUrl = () => {
    if (!avatarUrlInput.trim()) return;
    setLocalAvatar(avatarUrlInput.trim());
    const updated = { ...currentUser, avatar: avatarUrlInput.trim() };
    onUpdateUser?.(updated);
    setIsAvatarModalOpen(false);
    setAvatarUrlInput('');
  };

  const handleRemoveAvatar = () => {
    setLocalAvatar(undefined);
    const updated = { ...currentUser, avatar: undefined };
    onUpdateUser?.(updated);
    setIsAvatarModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#221815] flex flex-col font-sans">
      {/* Top Bar matching uniform theme */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#EAE5DC] px-4 sm:px-6 h-14 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3">
          {/* Mobile Hamburger Menu Trigger */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden p-2 -ml-2 text-[#0A4D8C] hover:text-[#C8232C] rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Open Navigation Menu"
            id="btn-open-staff-menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="text-sm sm:text-base font-bold text-[#221815] whitespace-nowrap">
            Healthcare Provider
          </span>
        </div>

        {/* Right Actions & Avatar */}
        <div className="flex items-center space-x-3">
          {onNavigatePortal && (
            <button
              type="button"
              onClick={() => onNavigatePortal('home')}
              className="hidden md:inline-flex px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 cursor-pointer whitespace-nowrap"
            >
              Hospital Home
            </button>
          )}
          <button
            type="button"
            onClick={() => onLogout?.()}
            className="hidden md:inline-flex px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-[#C8232C] cursor-pointer whitespace-nowrap"
          >
            Sign Out
          </button>
          <button
            type="button"
            onClick={() => setIsAvatarModalOpen(true)}
            className="w-8 h-8 rounded-full bg-[#FAF8F5] text-[#0A4D8C] font-bold text-xs flex items-center justify-center border border-[#EAE5DC] hover:ring-2 hover:ring-[#C8232C]/30 transition-all cursor-pointer overflow-hidden shrink-0"
            title="Profile & Settings"
          >
            {localAvatar || currentUser.avatar ? (
              <img
                src={localAvatar || currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </button>
        </div>
      </header>

      {/* Desktop / Tablet Clinical Workspace Tab Bar */}
      <nav className="hidden md:flex items-center gap-1.5 overflow-x-auto px-6 py-2 bg-white border-b border-[#EAE5DC] text-xs">
        {(
          [
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'patients', label: 'Patients' },
            { id: 'consultation', label: 'Consultation' },
            { id: 'schedule', label: 'My Schedule' },
            { id: 'lab_orders', label: 'Lab Orders' },
            { id: 'admissions_queue', label: 'Inpatient Admissions' },
            { id: 'radiology_workbench', label: 'Radiology & Scans' },
            { id: 'pharmacy_dispense', label: 'Pharmacy Dispense' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0A4D8C] text-white shadow-2xs'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Staff Left Slide-out Drawer */}
      <StaffDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsDrawerOpen(false);
        }}
        currentUser={{ ...currentUser, avatar: localAvatar || currentUser.avatar }}
        onNavigatePortal={onNavigatePortal}
        onDownloadApp={onDownloadApp}
        onLogout={onLogout}
        onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <StaffDashboard
            userName={currentUser.name || 'Marko Bare'}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSelectPatient={(pId) => {
              setSelectedPatientId(pId);
              setActiveTab('consultation');
            }}
            onOpenLabAlert={(order) => {
              setSelectedAlertOrder(order);
              setActiveTab('lab_orders');
            }}
            appointments={appointments}
            criticalLabOrder={criticalOrder}
          />
        )}

        {/* TAB 2: PATIENTS */}
        {activeTab === 'patients' && (
          <StaffPatients
            patients={patients}
            onSelectPatient={(pId) => {
              setSelectedPatientId(pId);
            }}
            onNavigateTab={() => setActiveTab('consultation')}
          />
        )}

        {/* TAB 3: CONSULTATION */}
        {activeTab === 'consultation' && (
          <StaffConsultation
            selectedPatientId={selectedPatientId}
            onSelectPatientId={(pId) => setSelectedPatientId(pId)}
            onSaveEncounter={onSaveEncounter}
            onCreatePrescription={onCreatePrescription}
            onStartLiveTelemedicine={(pName) => {
              setActiveTelemedicinePatient(pName);
              setIsLiveTelemedicineOpen(true);
            }}
          />
        )}

        {/* TAB 4: MY SCHEDULE */}
        {activeTab === 'schedule' && (
          <StaffSchedule
            appointments={appointments}
            onSelectPatient={(pId) => {
              setSelectedPatientId(pId);
            }}
            onNavigateTab={() => setActiveTab('consultation')}
          />
        )}

        {/* TAB 5: LAB ORDERS & RESULTS */}
        {activeTab === 'lab_orders' && (
          <StaffLabOrders
            labOrders={labOrders}
            onSaveLabResults={onSaveLabResults}
            selectedAlertOrder={selectedAlertOrder}
            onClearAlertOrder={() => setSelectedAlertOrder(undefined)}
          />
        )}

        {/* SECONDARY TAB: INPATIENT ADMISSIONS QUEUE */}
        {activeTab === 'admissions_queue' && (
          <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Inpatient Admissions & Ward Census
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Hospital bed allocations, ward transfers, and round notes
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="divide-y divide-slate-100">
                {admissionsList.map((adm) => (
                  <div key={adm.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-base">{adm.patientName}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {adm.ward} · {adm.bedNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Reason: <strong className="text-slate-800">{adm.admissionReason}</strong> · Admitted: {adm.admittedDate}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Admitting Physician: {adm.admittingDoctor} · Daily Bed Rate: KES {adm.dailyChargeKES?.toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientId(adm.patientId);
                        setActiveTab('consultation');
                      }}
                      className="px-4 py-2 rounded-xl bg-[#023545] hover:bg-[#0b4c5e] text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
                    >
                      Inpatient Chart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECONDARY TAB: RADIOLOGY & PACS */}
        {activeTab === 'radiology_workbench' && (
          <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Radiology Diagnostic Reporting & Scans
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Digital PACS workstation, modality viewer, and clinical impressions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Imaging Queue
                </span>
                {radiologyOrders.map((rad) => (
                  <div
                    key={rad.id}
                    onClick={() => setActiveRadOrderId(rad.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-xs ${
                      activeRadOrderId === rad.id
                        ? 'border-[#023545] bg-teal-50/50 ring-2 ring-[#023545]/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{rad.procedureName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {rad.modality}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Patient: <strong className="text-slate-700">{rad.patientName}</strong>
                    </p>
                  </div>
                ))}
              </div>

              {activeRadOrder && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{activeRadOrder.procedureName}</h3>
                    <p className="text-xs text-slate-500">Patient: {activeRadOrder.patientName}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Radiological Findings
                    </label>
                    <textarea
                      rows={3}
                      value={radFindings}
                      onChange={(e) => setRadFindings(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Diagnostic Impression
                    </label>
                    <input
                      type="text"
                      value={radImpression}
                      onChange={(e) => setRadImpression(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await onSaveRadiologyReport(
                        activeRadOrder.id,
                        radFindings,
                        radImpression,
                        currentUser.name || 'Dr. Marko Bare'
                      );
                      alert('Radiology diagnostic report certified.');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#023545] hover:bg-[#0b4c5e] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Sign & Release Radiology Report
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECONDARY TAB: PHARMACY DISPENSE */}
        {activeTab === 'pharmacy_dispense' && (
          <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Pharmacy Medication Dispense Queue
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">
                E-Prescription verification and pharmaceutical batch issuance
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs divide-y divide-slate-100">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">{rx.patientName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Pending Dispense
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {rx.medications.map((m, i) => (
                        <span key={i} className="mr-2">
                          • {m.drugName} ({m.dosage}, {m.frequency})
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      await onDispensePrescription(rx.id, currentUser.name || 'Staff Marko Bare', dispenseBatch);
                      alert(`Prescription dispensed under batch ${dispenseBatch}.`);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer"
                  >
                    Dispense Medications
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* LIVE TELEMEDICINE VIDEO CALL MODAL */}
      {isLiveTelemedicineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col h-[85vh]">
            <div className="p-4 bg-slate-800/80 text-white flex items-center justify-between border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                  TL
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    Virtual Teleconsultation Room — {activeTelemedicinePatient}
                  </h3>
                  <p className="text-[11px] text-emerald-400">
                    Encrypted WebRTC Session · HD Video & Audio Connected
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLiveTelemedicineOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-hidden">
              <TelemedicineRoom
                roomId={`room-consult-${selectedPatientId}`}
                userName={currentUser.name || 'Marko Bare'}
                userRole="doctor"
                patientName={activeTelemedicinePatient}
                onEndCall={() => setIsLiveTelemedicineOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* PROFILE PHOTO EDIT / UPLOAD MODAL */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsAvatarModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Staff Profile Photo
              </h3>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center py-2">
              {localAvatar || currentUser.avatar ? (
                <img
                  src={localAvatar || currentUser.avatar}
                  alt={currentUser.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-teal-50 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#023545] text-white flex items-center justify-center text-3xl font-bold border-4 border-teal-50 shadow-md">
                  {initials}
                </div>
              )}
              <p className="font-bold text-slate-900 mt-2 text-sm">
                {currentUser.name}
              </p>
              <p className="text-xs text-slate-500">
                {currentUser.role.toUpperCase()} · Terralink Health
              </p>
            </div>

            {/* Direct File Upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="w-full py-2.5 rounded-xl bg-[#023545] hover:bg-[#0b4c5e] text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{avatarUploading ? 'Uploading...' : 'Upload Image from Computer'}</span>
            </button>

            {/* Direct Image URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Or Paste Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
                <button
                  type="button"
                  onClick={handleSaveAvatarUrl}
                  className="px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Remove photo */}
            {(localAvatar || currentUser.avatar) && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="w-full py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo & Use Monogram</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
