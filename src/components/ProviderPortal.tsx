import React, { useState } from 'react';
import { 
  Users, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  FileText, 
  Activity, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Video, 
  AlertTriangle, 
  Search, 
  Save, 
  Eye, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Scan,
  HeartPulse,
  DollarSign
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
  Invoice 
} from '../types';
import { TelemedicineRoom } from './TelemedicineRoom';
import { ReportViewerModal } from './ReportViewerModal';

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
  onUpdateAppointmentStatus
}) => {
  // Provider Sub-role switch for easy exploration
  const [providerRole, setProviderRole] = useState<'doctor' | 'lab_tech' | 'radiologist' | 'pharmacist' | 'nurse'>(
    currentUser.role as any || 'doctor'
  );

  // Active subtab
  const [activeTab, setActiveTab] = useState<
    'queue' | 'chart' | 'encounter_form' | 'lab_workbench' | 'radiology_workbench' | 'pharmacy_dispense' | 'schedule'
  >('queue');

  // Selected Patient for chart / clinical encounter
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Active Telemedicine call
  const [activeTelemedicineApt, setActiveTelemedicineApt] = useState<Appointment | null>(null);

  // Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState<{
    title: string;
    type: 'medical_report' | 'lab_report' | 'invoice';
    encounter?: ClinicalEncounter;
    labOrder?: LabOrder;
    invoice?: Invoice;
  }>({ title: '', type: 'medical_report' });

  // Doctor SOAP Encounter State
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [hpi, setHpi] = useState('');
  const [examNotes, setExamNotes] = useState('');
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [primaryIcd, setPrimaryIcd] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [admissionStatus, setAdmissionStatus] = useState<'Outpatient' | 'Admitted to Ward' | 'Admitted to HDU' | 'Admitted to ICU'>('Outpatient');
  const [selectedReferralDept, setSelectedReferralDept] = useState('');
  
  // Vitals for encounter
  const [bpSys, setBpSys] = useState(120);
  const [bpDia, setBpDia] = useState(80);
  const [hr, setHr] = useState(72);
  const [temp, setTemp] = useState(36.6);
  const [spo2, setSpo2] = useState(99);
  const [weightKg, setWeightKg] = useState(68);

  // Fast order modal / drawer states
  const [newLabTestName, setNewLabTestName] = useState('Full Hemogram / Complete Blood Count (CBC)');
  const [newLabSampleType, setNewLabSampleType] = useState('Whole Blood (EDTA)');
  const [newLabPriority, setNewLabPriority] = useState<'Routine' | 'STAT / Emergency'>('Routine');
  
  const [newRadModality, setNewRadModality] = useState<'X-Ray' | 'CT' | 'MRI' | 'Ultrasound'>('X-Ray');
  const [newRadBodyPart, setNewRadBodyPart] = useState('Chest PA View');
  const [newRadPriority, setNewRadPriority] = useState<'Routine' | 'Urgent / Emergency'>('Routine');

  const [newDrugName, setNewDrugName] = useState('Amoxicillin/Clavulanate (Augmentin)');
  const [newDrugDosage, setNewDrugDosage] = useState('625mg');
  const [newDrugFreq, setNewDrugFreq] = useState('Twice daily (BD)');
  const [newDrugDuration, setNewDrugDuration] = useState('7 days');
  const [newDrugInstructions, setNewDrugInstructions] = useState('Take with food after meals');
  const [newDrugPriceKES, setNewDrugPriceKES] = useState(1200);

  // Lab Tech Result Entry State
  const [activeLabOrderId, setActiveLabOrderId] = useState<string>(labOrders.find(l => l.status === 'Sample Collected')?.id || labOrders[0]?.id || '');
  const activeLabOrder = labOrders.find(l => l.id === activeLabOrderId) || labOrders[0];
  const [labResultRows, setLabResultRows] = useState<{ parameter: string; value: string; unit: string; referenceRange: string; flag: 'Normal' | 'High' | 'Low' | 'Critical' }[]>([
    { parameter: 'White Blood Cell (WBC)', value: '6.4', unit: 'x10^9/L', referenceRange: '4.0 - 10.0', flag: 'Normal' },
    { parameter: 'Hemoglobin (Hb)', value: '13.8', unit: 'g/dL', referenceRange: '12.0 - 15.5', flag: 'Normal' },
    { parameter: 'Platelets', value: '250', unit: 'x10^9/L', referenceRange: '150 - 450', flag: 'Normal' },
    { parameter: 'Neutrophils %', value: '58', unit: '%', referenceRange: '40 - 75', flag: 'Normal' }
  ]);
  const [labTechNotes, setLabTechNotes] = useState('Controls calibrated. Specimen analyzed with Mindray BC-6800 Automated Hematology Analyzer.');

  // Radiologist Entry State
  const [activeRadOrderId, setActiveRadOrderId] = useState<string>(radiologyOrders[0]?.id || '');
  const activeRadOrder = radiologyOrders.find(r => r.id === activeRadOrderId) || radiologyOrders[0];
  const [radFindings, setRadFindings] = useState('Bilateral lung fields clear. Cardiothoracic ratio normal (<50%). No pleural effusion or pneumothorax.');
  const [radImpression, setRadImpression] = useState('Normal Chest Radiograph.');

  // Pharmacist Dispense State
  const [activeRxId, setActiveRxId] = useState<string>(prescriptions[0]?.id || '');
  const activeRx = prescriptions.find(p => p.id === activeRxId) || prescriptions[0];
  const [dispenseBatch, setDispenseBatch] = useState('GSK-2026-08');

  // Doctor list of their appointments
  const doctorAppointments = appointments.filter(a => a.status !== 'Cancelled');

  // Handle Save Doctor Encounter
  const handleCreateEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint.trim() || !primaryDiagnosis.trim()) {
      alert('Please fill out Chief Complaint and Primary Diagnosis.');
      return;
    }

    await onSaveEncounter({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      departmentId: 'dept-opd',
      departmentName: 'General Outpatient & Family Medicine',
      visitDate: new Date().toISOString().split('T')[0],
      visitType: 'Outpatient',
      vitals: {
        bloodPressureSystolic: bpSys,
        bloodPressureDiastolic: bpDia,
        heartRateBpm: hr,
        temperatureCelsius: temp,
        oxygenSaturationPercent: spo2,
        weightKg: weightKg,
        bmi: parseFloat((weightKg / (1.7 * 1.7)).toFixed(1))
      },
      chiefComplaint,
      historyOfPresentIllness: hpi,
      examinationNotes: examNotes,
      diagnoses: [
        {
          code: primaryIcd || 'J06.9',
          name: primaryDiagnosis,
          type: 'Primary'
        }
      ],
      treatmentPlan,
      admissionStatus,
      referralDepartment: selectedReferralDept || undefined
    });

    alert('Clinical Encounter saved successfully to Patient EHR.');
    setActiveTab('chart');
  };

  // Handle Lab Tech Result Release
  const handleReleaseLabResults = async () => {
    if (!activeLabOrder) return;
    await onSaveLabResults(activeLabOrder.id, labResultRows, labTechNotes, currentUser.name);
    alert(`Laboratory test #${activeLabOrder.id} signed and released to patient EHR!`);
  };

  // Handle Radiologist Report Release
  const handleReleaseRadReport = async () => {
    if (!activeRadOrder) return;
    await onSaveRadiologyReport(activeRadOrder.id, radFindings, radImpression, currentUser.name);
    alert(`Radiology scan #${activeRadOrder.id} signed and released to patient EHR!`);
  };

  // Handle Pharmacist Dispense
  const handleDispenseRx = async () => {
    if (!activeRx) return;
    await onDispensePrescription(activeRx.id, currentUser.name, dispenseBatch);
    alert(`Prescription #${activeRx.id} successfully marked as Dispensed!`);
  };

  // Handle Fast Add Lab Order by Doctor
  const handleAddDoctorLabOrder = async () => {
    await onCreateLabOrder({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      testName: newLabTestName,
      testCategory: 'Hematology',
      priceKES: 1200,
      priority: newLabPriority,
      sampleType: newLabSampleType
    });
    alert(`Lab investigation '${newLabTestName}' ordered for ${selectedPatient.name}`);
  };

  // Handle Fast Add Radiology Order by Doctor
  const handleAddDoctorRadOrder = async () => {
    await onCreateRadiologyOrder({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      modality: newRadModality,
      bodyPart: newRadBodyPart,
      priceKES: 2500,
      priority: newRadPriority,
      clinicalIndication: chiefComplaint || 'Clinical evaluation'
    });
    alert(`Radiology order '${newRadModality} - ${newRadBodyPart}' sent to Imaging Dept`);
  };

  // Handle Fast Add Prescription by Doctor
  const handleAddDoctorPrescription = async () => {
    await onCreatePrescription({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      medications: [
        {
          drugName: newDrugName,
          dosage: newDrugDosage,
          frequency: newDrugFreq,
          duration: newDrugDuration,
          route: 'Oral',
          instructions: newDrugInstructions,
          priceKES: newDrugPriceKES
        }
      ]
    });
    alert(`Prescription for '${newDrugName}' sent to Hospital Central Pharmacy.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Telemedicine Video Room overlay if active */}
      {activeTelemedicineApt && (
        <TelemedicineRoom
          appointment={activeTelemedicineApt}
          currentUserRole="doctor"
          currentUserName={currentUser.name}
          onEndCall={() => setActiveTelemedicineApt(null)}
          onSaveConsultationNote={async (noteData) => {
            await onSaveEncounter({
              patientId: activeTelemedicineApt.patientId,
              patientName: activeTelemedicineApt.patientName,
              doctorId: currentUser.id,
              doctorName: currentUser.name,
              departmentId: activeTelemedicineApt.departmentId,
              departmentName: activeTelemedicineApt.departmentName,
              visitDate: new Date().toISOString().split('T')[0],
              visitType: 'Telemedicine',
              vitals: {
                bloodPressureSystolic: 120,
                bloodPressureDiastolic: 80,
                heartRateBpm: 72,
                temperatureCelsius: 36.6,
                oxygenSaturationPercent: 99,
                weightKg: 70,
                bmi: 24.2
              },
              chiefComplaint: noteData.chiefComplaint || 'Telemedicine Consultation',
              historyOfPresentIllness: 'Virtual review via TERRALINK WebRTC Suite',
              examinationNotes: noteData.examinationNotes || 'Patient alert and oriented',
              diagnoses: noteData.diagnoses || [{ code: 'Z00.00', name: 'General Health Review', type: 'Primary' }],
              treatmentPlan: noteData.treatmentPlan || 'Review in 2 weeks',
              admissionStatus: 'Outpatient'
            });
          }}
        />
      )}

      {/* Report Viewer Modal */}
      <ReportViewerModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title={reportModalData.title}
        type={reportModalData.type}
        patient={selectedPatient}
        encounter={reportModalData.encounter}
        labOrder={reportModalData.labOrder}
        invoice={reportModalData.invoice}
      />

      {/* Provider Header Banner */}
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-emerald-950/90 backdrop-blur-2xl rounded-3xl p-6 text-white shadow-xl border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold text-xl backdrop-blur-md shadow-inner">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold tracking-tight">{currentUser.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider backdrop-blur-md">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Department: <strong className="text-white">{currentUser.department || 'Outpatient & Family Medicine'}</strong> • License: <strong className="text-emerald-300 font-mono">{currentUser.licenseNumber || 'KMPDC/2026/0491'}</strong>
            </p>
          </div>
        </div>

        {/* Quick Role Switcher for Clinical Demo Inspection */}
        <div className="flex items-center gap-1.5 bg-slate-950/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Clinical Role:</span>
          {[
            { id: 'doctor', label: 'Doctor / MD', icon: Stethoscope },
            { id: 'lab_tech', label: 'Lab Tech', icon: FlaskConical },
            { id: 'radiologist', label: 'Radiology', icon: Scan },
            { id: 'pharmacist', label: 'Pharmacy', icon: Pill },
            { id: 'nurse', label: 'Triage/Nurse', icon: HeartPulse }
          ].map((r) => {
            const isSelected = providerRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => {
                  setProviderRole(r.id as any);
                  if (r.id === 'lab_tech') setActiveTab('lab_workbench');
                  else if (r.id === 'radiologist') setActiveTab('radiology_workbench');
                  else if (r.id === 'pharmacist') setActiveTab('pharmacy_dispense');
                  else setActiveTab('queue');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-600/90 text-white shadow-md backdrop-blur-md border border-emerald-400/40' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <r.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider Sub-Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-sky-200/50 text-xs font-semibold">
        {providerRole === 'doctor' && (
          <>
            <button
              onClick={() => setActiveTab('queue')}
              className={`py-2.5 px-4 rounded-2xl flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'queue' ? 'bg-emerald-600/90 text-white font-bold shadow-md backdrop-blur-md border border-emerald-400/30' : 'bg-white/50 hover:bg-white/80 text-slate-700 border border-white/60 backdrop-blur-md shadow-xs'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Today's Clinic Queue ({doctorAppointments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('chart')}
              className={`py-2.5 px-4 rounded-2xl flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'chart' ? 'bg-emerald-600/90 text-white font-bold shadow-md backdrop-blur-md border border-emerald-400/30' : 'bg-white/50 hover:bg-white/80 text-slate-700 border border-white/60 backdrop-blur-md shadow-xs'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Patient EMR Chart ({selectedPatient.name})</span>
            </button>

            <button
              onClick={() => setActiveTab('encounter_form')}
              className={`py-2.5 px-4 rounded-2xl flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'encounter_form' ? 'bg-emerald-600/90 text-white font-bold shadow-md backdrop-blur-md border border-emerald-400/30' : 'bg-white/50 hover:bg-white/80 text-slate-700 border border-white/60 backdrop-blur-md shadow-xs'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New SOAP Encounter / Orders</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`py-2.5 px-4 rounded-2xl flex items-center space-x-2 transition-all cursor-pointer ${
                activeTab === 'schedule' ? 'bg-emerald-600/90 text-white font-bold shadow-md backdrop-blur-md border border-emerald-400/30' : 'bg-white/50 hover:bg-white/80 text-slate-700 border border-white/60 backdrop-blur-md shadow-xs'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Doctor Clinic Schedule</span>
            </button>
          </>
        )}

        {providerRole === 'lab_tech' && (
          <button
            onClick={() => setActiveTab('lab_workbench')}
            className="py-2.5 px-4 rounded-2xl bg-emerald-600/90 text-white font-bold flex items-center space-x-2 shadow-md backdrop-blur-md border border-emerald-400/30"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Laboratory Testing Workbench ({labOrders.length} Orders)</span>
          </button>
        )}

        {providerRole === 'radiologist' && (
          <button
            onClick={() => setActiveTab('radiology_workbench')}
            className="py-2.5 px-4 rounded-2xl bg-blue-600/90 text-white font-bold flex items-center space-x-2 shadow-md backdrop-blur-md border border-blue-400/30"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Radiology & PACS Imaging Workbench ({radiologyOrders.length} Scans)</span>
          </button>
        )}

        {providerRole === 'pharmacist' && (
          <button
            onClick={() => setActiveTab('pharmacy_dispense')}
            className="py-2.5 px-4 rounded-2xl bg-teal-600/90 text-white font-bold flex items-center space-x-2 shadow-md backdrop-blur-md border border-teal-400/30"
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Central Pharmacy Dispensing Desk ({prescriptions.length} Prescriptions)</span>
          </button>
        )}

        {providerRole === 'nurse' && (
          <button
            onClick={() => setActiveTab('queue')}
            className="py-2.5 px-4 rounded-2xl bg-emerald-600/90 text-white font-bold flex items-center space-x-2 shadow-md backdrop-blur-md border border-emerald-400/30"
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Triage & Patient Vitals Station</span>
          </button>
        )}
      </div>

      {/* ================= VIEW 1: DOCTOR CLINICAL QUEUE ================= */}
      {activeTab === 'queue' && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/50 pb-3 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Today's Patient Consultations & Telemedicine Schedule</h3>
              <p className="text-xs text-slate-500">Manage patient intake, launch WebRTC video rooms, and open comprehensive medical charts.</p>
            </div>
            
            {/* Quick Patient Switcher Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-600 font-semibold">Active Patient:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="p-1.5 bg-white/70 border border-white/80 rounded-xl text-xs font-semibold text-slate-800 backdrop-blur-md focus:bg-white focus:outline-hidden"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.nationalId})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-200/50">
            {doctorAppointments.map((apt) => (
              <div key={apt.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/40 hover:bg-white/70 p-4 rounded-2xl my-2 border border-white/60 backdrop-blur-md transition-all shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{apt.patientName}</span>
                    <span className="text-xs font-mono text-slate-500">(ID: {apt.patientNationalId})</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      apt.type === 'Telemedicine' ? 'bg-purple-100/80 text-purple-800 border border-purple-200' : 'bg-blue-100/80 text-blue-800 border border-blue-200'
                    }`}>
                      {apt.type}
                    </span>
                    <span className="px-2.5 py-0.5 bg-emerald-100/80 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold">
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Reason: <strong>{apt.reason}</strong> • Time: <strong>{apt.appointmentTime}</strong>
                  </p>
                  <p className="text-xs font-mono text-emerald-700 font-semibold">
                    M-PESA Fee: KES {apt.consultationFeeKES.toLocaleString()} (Verified {apt.mpesaReceipt})
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedPatientId(apt.patientId);
                      setActiveTab('chart');
                    }}
                    className="px-3.5 py-2 bg-white/80 hover:bg-white text-slate-800 font-semibold rounded-xl text-xs flex items-center space-x-1.5 border border-white/80 shadow-xs backdrop-blur-md cursor-pointer transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Open Patient Chart</span>
                  </button>

                  {apt.type === 'Telemedicine' ? (
                    <button
                      onClick={() => setActiveTelemedicineApt(apt)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-purple-600/20 cursor-pointer transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Start Video Consult</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedPatientId(apt.patientId);
                        setActiveTab('encounter_form');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Consult Patient</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= VIEW 2: COMPREHENSIVE PATIENT CHART ================= */}
      {activeTab === 'chart' && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg space-y-6">
          
          {/* Patient Overview Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/60 pb-4 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900">{selectedPatient.name}</h3>
                <span className="px-2 py-0.5 bg-white/70 border border-white/80 text-slate-800 font-mono text-xs rounded-lg font-bold">
                  {selectedPatient.nationalId}
                </span>
                <span className="px-2 py-0.5 bg-rose-100/80 border border-rose-200 text-rose-800 text-xs rounded-lg font-bold">
                  Blood: {selectedPatient.bloodGroup}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                DOB: {selectedPatient.dob} ({selectedPatient.gender}) • Phone: {selectedPatient.phone} • Insurance: {selectedPatient.insuranceProvider || 'SHIF / Cash'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setReportModalData({
                    title: `Patient Medical Summary - ${selectedPatient.name}`,
                    type: 'medical_report',
                    encounter: encounters.find(e => e.patientId === selectedPatient.id)
                  });
                  setReportModalOpen(true);
                }}
                className="px-3.5 py-2 bg-slate-900/90 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs backdrop-blur-md cursor-pointer transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Print Official Summary</span>
              </button>
              
              <button
                onClick={() => setActiveTab('encounter_form')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Clinical Note / Orders</span>
              </button>
            </div>
          </div>

          {/* Critical Clinical Alerts: Allergies & Chronic Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 text-xs text-rose-900 backdrop-blur-md shadow-xs">
              <strong className="block font-bold mb-1 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Drug & Food Allergies</span>
              </strong>
              <p className="text-rose-800/90">{selectedPatient.allergies.join(', ') || 'No known drug allergies (NKDA)'}</p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 backdrop-blur-md shadow-xs">
              <strong className="block font-bold mb-1 flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-amber-600" />
                <span>Documented Chronic Conditions</span>
              </strong>
              <p className="text-amber-800/90">{selectedPatient.chronicConditions.join(', ') || 'None recorded'}</p>
            </div>
          </div>

          {/* Quick Doctor Order Actions */}
          <div className="bg-white/40 border border-white/60 rounded-2xl p-5 space-y-3 backdrop-blur-md shadow-xs">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Fast Direct Doctor Orders</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Order Lab Test Button */}
              <div className="bg-white/70 p-3.5 rounded-2xl border border-white/80 space-y-2.5 backdrop-blur-md shadow-xs">
                <span className="font-bold text-xs text-slate-800 block">1. Order Laboratory Test</span>
                <select
                  value={newLabTestName}
                  onChange={(e) => setNewLabTestName(e.target.value)}
                  className="w-full p-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                >
                  <option value="Full Hemogram / Complete Blood Count (CBC)">CBC / Full Hemogram</option>
                  <option value="Fasting Lipid Profile">Fasting Lipid Profile</option>
                  <option value="Liver Function Tests (LFTs)">Liver Function Tests (LFTs)</option>
                  <option value="Renal / Kidney Function Tests (RFTs)">Renal Function Tests (RFTs)</option>
                  <option value="Malaria Blood Slide / Rapid Diagnostic Test">Malaria RDT / BS</option>
                  <option value="HbA1c Glycated Hemoglobin">HbA1c Glycated Hemoglobin</option>
                  <option value="Urinalysis Complete Profile">Urinalysis Complete Profile</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddDoctorLabOrder}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
                >
                  Send to Lab
                </button>
              </div>

              {/* Order Radiology Scan */}
              <div className="bg-white/70 p-3.5 rounded-2xl border border-white/80 space-y-2.5 backdrop-blur-md shadow-xs">
                <span className="font-bold text-xs text-slate-800 block">2. Order Radiology / Scan</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={newRadModality}
                    onChange={(e) => setNewRadModality(e.target.value as any)}
                    className="p-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                  >
                    <option value="X-Ray">X-Ray</option>
                    <option value="CT">CT Scan</option>
                    <option value="MRI">MRI</option>
                    <option value="Ultrasound">Ultrasound</option>
                  </select>
                  <input
                    type="text"
                    value={newRadBodyPart}
                    onChange={(e) => setNewRadBodyPart(e.target.value)}
                    placeholder="Body region"
                    className="p-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddDoctorRadOrder}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
                >
                  Send to Radiology
                </button>
              </div>

              {/* Order Prescription */}
              <div className="bg-white/70 p-3.5 rounded-2xl border border-white/80 space-y-2.5 backdrop-blur-md shadow-xs">
                <span className="font-bold text-xs text-slate-800 block">3. Prescribe Medication</span>
                <select
                  value={newDrugName}
                  onChange={(e) => setNewDrugName(e.target.value)}
                  className="w-full p-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
                >
                  <option value="Amoxicillin/Clavulanate (Augmentin)">Augmentin 625mg</option>
                  <option value="Salbutamol Inhaler (Ventolin 100mcg)">Salbutamol Inhaler</option>
                  <option value="Azithromycin 500mg">Azithromycin 500mg</option>
                  <option value="Paracetamol 1000mg">Paracetamol 1000mg</option>
                  <option value="Metformin 500mg">Metformin 500mg</option>
                  <option value="Amlodipine 5mg">Amlodipine 5mg</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddDoctorPrescription}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
                >
                  Send to Pharmacy
                </button>
              </div>

            </div>
          </div>

          {/* Past Encounters Timeline */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Past Clinical Encounters & Diagnoses</h4>
            <div className="space-y-3">
              {(encounters || []).filter(e => e.patientId === selectedPatient.id).map((enc) => (
                <div key={enc.id} className="border border-white/70 rounded-2xl p-4 space-y-2.5 bg-white/50 backdrop-blur-md shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-slate-900">{enc.doctorName}</strong>
                      <span className="text-slate-500"> ({enc.departmentName}) • Visit Date: {enc.visitDate}</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-bold rounded-full text-[10px]">
                      {enc.admissionStatus || 'Outpatient'}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 font-mono text-[11px] bg-white/70 p-2.5 rounded-xl border border-white/80">
                    <div>BP: <strong>{enc.vitals?.bloodPressureSystolic}/{enc.vitals?.bloodPressureDiastolic}</strong></div>
                    <div>HR: <strong>{enc.vitals?.heartRateBpm} bpm</strong></div>
                    <div>SpO2: <strong>{enc.vitals?.oxygenSaturationPercent}%</strong></div>
                    <div>Temp: <strong>{enc.vitals?.temperatureCelsius}°C</strong></div>
                  </div>

                  <p className="text-xs text-slate-700"><strong>Chief Complaint:</strong> {enc.chiefComplaint}</p>
                  <p className="text-xs text-slate-700">
                    <strong>ICD-10 Diagnoses:</strong> {(enc.diagnoses || []).map(d => `${d.code} (${d.name})`).join(', ') || 'None recorded'}
                  </p>
                  <p className="text-xs text-slate-700"><strong>Plan:</strong> {enc.treatmentPlan}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= VIEW 3: NEW SOAP CLINICAL ENCOUNTER FORM ================= */}
      {activeTab === 'encounter_form' && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-200/60 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">New Clinical Encounter (SOAP Format)</h3>
              <p className="text-xs text-slate-500">Patient: <strong className="text-slate-800">{selectedPatient.name}</strong> ({selectedPatient.nationalId})</p>
            </div>
            <button
              onClick={() => setActiveTab('chart')}
              className="text-xs text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-white/60 hover:bg-white rounded-xl border border-white/70 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateEncounter} className="space-y-5 text-xs">
            
            {/* Vitals Recording */}
            <div className="bg-white/40 p-4 rounded-2xl border border-white/60 space-y-3 backdrop-blur-md">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Triage Vitals</h4>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 font-mono">
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans">BP Systolic</label>
                  <input
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(parseInt(e.target.value) || 120)}
                    className="w-full p-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans">BP Diastolic</label>
                  <input
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(parseInt(e.target.value) || 80)}
                    className="w-full p-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={hr}
                    onChange={(e) => setHr(parseInt(e.target.value) || 72)}
                    className="w-full p-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans">Temp (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temp}
                    onChange={(e) => setTemp(parseFloat(e.target.value) || 36.6)}
                    className="w-full p-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans">SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(parseInt(e.target.value) || 99)}
                    className="w-full p-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-sans">Weight (Kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                    className="w-full p-2 bg-white/80 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Subjective */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Subjective: Chief Complaint & History of Present Illness *
              </label>
              <textarea
                rows={2}
                required
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="e.g. 3-day history of dry cough, chest tightness, and mild fever..."
                className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md shadow-xs"
              />
            </div>

            {/* Objective */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Objective: Physical Examination Findings
              </label>
              <textarea
                rows={2}
                value={examNotes}
                onChange={(e) => setExamNotes(e.target.value)}
                placeholder="e.g. Chest: Bilateral expiratory polyphonic wheezes on auscultation. CVS: S1+S2 present, no murmurs..."
                className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md shadow-xs"
              />
            </div>

            {/* Assessment & ICD-10 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-800 mb-1">
                  Assessment: Working Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  value={primaryDiagnosis}
                  onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Bronchial Asthma Exacerbation"
                  className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md shadow-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  ICD-10 Code
                </label>
                <input
                  type="text"
                  value={primaryIcd}
                  onChange={(e) => setPrimaryIcd(e.target.value)}
                  placeholder="e.g. J45.901"
                  className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md shadow-xs"
                />
              </div>
            </div>

            {/* Plan & Admission */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Plan: Treatment & Follow-up Instructions
                </label>
                <textarea
                  rows={3}
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  placeholder="1. Nebulize with Salbutamol 5mg STAT&#10;2. Prescribe oral Prednisolone 40mg daily x 5 days&#10;3. Review in chest clinic in 1 week"
                  className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md shadow-xs"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Admission / Disposition Status
                  </label>
                  <select
                    value={admissionStatus}
                    onChange={(e) => setAdmissionStatus(e.target.value as any)}
                    className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                  >
                    <option value="Outpatient">Outpatient (Discharge Home)</option>
                    <option value="Admitted to Ward">Admit to General Ward</option>
                    <option value="Admitted to HDU">Admit to High Dependency Unit (HDU)</option>
                    <option value="Admitted to ICU">Admit to Intensive Care Unit (ICU)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Internal Specialist Referral (Optional)
                  </label>
                  <select
                    value={selectedReferralDept}
                    onChange={(e) => setSelectedReferralDept(e.target.value)}
                    className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:bg-white focus:outline-hidden"
                  >
                    <option value="">No Referral Needed</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('chart')}
                className="px-5 py-2.5 bg-white/70 hover:bg-white text-slate-700 rounded-2xl font-semibold border border-white/80 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Clinical Encounter Note</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ================= VIEW 4: LABORATORY TECHNICIAN WORKBENCH ================= */}
      {activeTab === 'lab_workbench' && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg space-y-6">
          <div className="border-b border-slate-200/60 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Laboratory Diagnostic Testing & Result Entry Workbench</h3>
              <p className="text-xs text-slate-500">Record specimen measurements, calibrate biological reference ranges, and sign lab certificates.</p>
            </div>
            <span className="px-3 py-1 bg-blue-100/80 border border-blue-200 text-blue-800 rounded-full font-bold text-xs backdrop-blur-md">
              ISO 15189 Validated
            </span>
          </div>

          {/* Orders List / Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {labOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => setActiveLabOrderId(ord.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all backdrop-blur-md shadow-xs ${
                  activeLabOrderId === ord.id 
                    ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20' 
                    : 'border-white/70 bg-white/40 hover:bg-white/70'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-900">{ord.testName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    ord.status === 'Results Ready' ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200' : 'bg-amber-100/80 text-amber-800 border border-amber-200'
                  }`}>
                    {ord.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1.5">Patient: <strong>{ord.patientName}</strong></p>
                <p className="text-[10px] text-slate-400">Ordered by {ord.doctorName} • Priority: {ord.priority}</p>
              </div>
            ))}
          </div>

          {/* Active Lab Result Entry Form */}
          {activeLabOrder && (
            <div className="border border-white/70 rounded-3xl p-5 bg-white/50 space-y-4 text-xs backdrop-blur-md shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{activeLabOrder.testName} - Result Entry Form</h4>
                  <p className="text-slate-500">Patient: {activeLabOrder.patientName} • Specimen: {activeLabOrder.sampleType}</p>
                </div>
                <span className="font-mono font-bold text-slate-700 px-2.5 py-1 bg-white/70 rounded-xl border border-white/80">Lab ID: #{activeLabOrder.id}</span>
              </div>

              {/* Parameters Table */}
              <div className="bg-white/80 rounded-2xl border border-white/80 overflow-hidden backdrop-blur-md shadow-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200/60">
                    <tr>
                      <th className="py-2.5 px-3">Test Parameter</th>
                      <th className="py-2.5 px-3">Observed Value</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Reference Range</th>
                      <th className="py-2.5 px-3 text-right">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {labResultRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.parameter}
                            onChange={(e) => {
                              const updated = [...labResultRows];
                              updated[idx].parameter = e.target.value;
                              setLabResultRows(updated);
                            }}
                            className="w-full p-1 bg-transparent font-medium text-slate-800"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.value}
                            onChange={(e) => {
                              const updated = [...labResultRows];
                              updated[idx].value = e.target.value;
                              setLabResultRows(updated);
                            }}
                            className="w-24 p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 font-mono shadow-inner"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.unit}
                            onChange={(e) => {
                              const updated = [...labResultRows];
                              updated[idx].unit = e.target.value;
                              setLabResultRows(updated);
                            }}
                            className="w-20 p-1 bg-transparent text-slate-500 font-mono text-[11px]"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.referenceRange}
                            onChange={(e) => {
                              const updated = [...labResultRows];
                              updated[idx].referenceRange = e.target.value;
                              setLabResultRows(updated);
                            }}
                            className="w-28 p-1 bg-transparent text-slate-500 font-mono text-[11px]"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <select
                            value={row.flag}
                            onChange={(e) => {
                              const updated = [...labResultRows];
                              updated[idx].flag = e.target.value as any;
                              setLabResultRows(updated);
                            }}
                            className={`p-1 rounded-lg text-[11px] font-bold ${
                              row.flag === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Low">Low</option>
                            <option value="Critical">Critical Alert</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Technologist Notes */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Medical Laboratory Scientist Clinical Remarks & Quality Control Notes
                </label>
                <textarea
                  rows={2}
                  value={labTechNotes}
                  onChange={(e) => setLabTechNotes(e.target.value)}
                  className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden backdrop-blur-md"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleReleaseLabResults}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Digitally Sign & Release to Doctor / EHR</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 5: RADIOLOGY & PACS WORKBENCH ================= */}
      {activeTab === 'radiology_workbench' && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg space-y-6">
          <div className="border-b border-slate-200/60 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Radiology Diagnostic Reporting & DICOM Viewer</h3>
              <p className="text-xs text-slate-500">Review imaging scans, input radiological findings, and provide clinical impressions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Scans Queue</h4>
              {radiologyOrders.map((rad) => (
                <div
                  key={rad.id}
                  onClick={() => setActiveRadOrderId(rad.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all backdrop-blur-md shadow-xs ${
                    activeRadOrderId === rad.id ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20' : 'border-white/70 bg-white/40 hover:bg-white/70'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900">{rad.modality} - {rad.bodyPart}</span>
                    <span className="px-2.5 py-0.5 bg-blue-100/80 border border-blue-200 text-blue-800 rounded-full font-bold text-[10px]">{rad.status}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Patient: {rad.patientName} • Indication: {rad.clinicalIndication}</p>
                </div>
              ))}

              {activeRadOrder?.imageUrl && (
                <div className="pt-2">
                  <span className="font-bold text-xs text-slate-800 block mb-1.5">Digitized Medical Scan:</span>
                  <img
                    src={activeRadOrder.imageUrl}
                    alt="DICOM Scan"
                    className="w-full h-56 object-cover rounded-2xl border border-white/80 shadow-md"
                  />
                </div>
              )}
            </div>

            {/* Findings entry */}
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Radiology Clinical Report</h4>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Radiological Findings</label>
                <textarea
                  rows={4}
                  value={radFindings}
                  onChange={(e) => setRadFindings(e.target.value)}
                  className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden backdrop-blur-md shadow-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Impression & Diagnosis</label>
                <textarea
                  rows={2}
                  value={radImpression}
                  onChange={(e) => setRadImpression(e.target.value)}
                  className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden backdrop-blur-md shadow-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleReleaseRadReport}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Publish Radiology Report to Patient Record</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 6: CENTRAL PHARMACY DISPENSING ================= */}
      {activeTab === 'pharmacy_dispense' && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg space-y-6">
          <div className="border-b border-slate-200/60 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Pharmacy Dispensing Desk</h3>
              <p className="text-xs text-slate-500">Verify doctor prescriptions, validate drug interaction checks, assign batch numbers, and dispense.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Active Prescriptions</h4>
              {(prescriptions || []).map((rx) => (
                <div
                  key={rx.id}
                  onClick={() => setActiveRxId(rx.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all backdrop-blur-md shadow-xs ${
                    activeRxId === rx.id ? 'border-teal-500 bg-teal-50/70 ring-2 ring-teal-500/20' : 'border-white/70 bg-white/40 hover:bg-white/70'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-900">Prescription #{rx.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      rx.status === 'Dispensed' ? 'bg-emerald-100/80 border border-emerald-200 text-emerald-800' : 'bg-amber-100/80 border border-amber-200 text-amber-800'
                    }`}>
                      {rx.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Patient: {rx.patientName} • Prescribed by {rx.doctorName}</p>
                  <p className="text-xs font-mono text-slate-700">Total KES: <strong>{rx.totalPriceKES.toLocaleString()}</strong></p>
                </div>
              ))}
            </div>

            {/* Dispense details */}
            {activeRx && (
              <div className="border border-white/70 rounded-3xl p-5 bg-white/50 space-y-4 text-xs backdrop-blur-md shadow-xs">
                <h4 className="font-bold text-sm text-slate-900">Dispense Medication Batch</h4>
                
                <div className="space-y-2">
                  {(activeRx.medications || []).map((med, idx) => (
                    <div key={idx} className="bg-white/80 p-3.5 rounded-2xl border border-white/80 shadow-xs">
                      <strong className="text-slate-900 block">{med.drugName} ({med.dosage})</strong>
                      <p className="text-slate-600">{med.frequency} • {med.duration} • {med.instructions}</p>
                      <span className="text-emerald-700 font-mono font-bold block mt-1">Price: KES {med.priceKES.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Assign Manufacturer Batch Number</label>
                  <input
                    type="text"
                    value={dispenseBatch}
                    onChange={(e) => setDispenseBatch(e.target.value)}
                    placeholder="e.g. BATCH-2026-AUG-99"
                    className="w-full p-2.5 bg-white/80 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white"
                  />
                </div>

                <button
                  type="button"
                  disabled={activeRx.status === 'Dispensed'}
                  onClick={handleDispenseRx}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{activeRx.status === 'Dispensed' ? 'Already Dispensed' : 'Confirm Drug Dispensing'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW 7: DOCTOR CLINIC SCHEDULE ================= */}
      {activeTab === 'schedule' && (
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-lg max-w-3xl mx-auto space-y-5">
          <div className="border-b border-slate-200/60 pb-3">
            <h3 className="text-base font-bold text-slate-900">Doctor Weekly Availability Schedule</h3>
            <p className="text-xs text-slate-500">Configure clinic hours. Sunday clinic closure is enforced hospital-wide.</p>
          </div>

          <div className="space-y-3 text-xs">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
              const isSunday = day === 'Sunday';
              return (
                <div
                  key={day}
                  className={`p-4 rounded-2xl border flex items-center justify-between backdrop-blur-md shadow-xs ${
                    isSunday ? 'bg-white/30 border-white/50 text-slate-400' : 'bg-white/60 border-white/70 text-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-sm w-28">{day}</span>
                    {isSunday ? (
                      <span className="px-2.5 py-0.5 bg-rose-100/80 border border-rose-200 text-rose-800 rounded-full font-bold text-[10px]">
                        Hospital Mandatory Closed (Outpatient)
                      </span>
                    ) : (
                      <span className="text-slate-600 font-medium">08:00 AM - 05:00 PM (Active Clinic)</span>
                    )}
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500">
                    {isSunday ? '0 Slots' : '16 Slots / Day'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex justify-end">
            <button
              type="button"
              onClick={() => alert('Doctor clinic schedule updated.')}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              Save Schedule Settings
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
