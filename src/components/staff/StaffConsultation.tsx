import React, { useState } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  ChevronDown, 
  Save, 
  Plus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Activity,
  Heart,
  Thermometer,
  ShieldAlert,
  PhoneCall
} from 'lucide-react';
import { PatientProfile, ClinicalEncounter, Prescription } from '../../types';

interface StaffConsultationProps {
  selectedPatientId: string;
  onSelectPatientId: (id: string) => void;
  onSaveEncounter: (encounterData: any) => Promise<void>;
  onCreatePrescription: (rxData: any) => Promise<void>;
  onStartLiveTelemedicine?: (patientName: string) => void;
}

export const StaffConsultation: React.FC<StaffConsultationProps> = ({
  selectedPatientId,
  onSelectPatientId,
  onSaveEncounter,
  onCreatePrescription,
  onStartLiveTelemedicine
}) => {
  // Available patients for selector
  const patientOptions = [
    { id: 'P001', name: 'Mary Wambui', complaint: 'Chest pain', age: 34, gender: 'Female', allergies: 'Penicillin', priority: 'Urgent', vitals: { temp: '37.1 °C', spo2: '98%', bp: '120/80 mmHg', hr: '76 bpm' } },
    { id: 'P002', name: 'John Mwangi', complaint: 'HTN Follow-up', age: 52, gender: 'Male', allergies: 'NKDA', priority: 'Normal', vitals: { temp: '36.6 °C', spo2: '99%', bp: '138/88 mmHg', hr: '72 bpm' } },
    { id: 'P003', name: 'Sarah Achieng', complaint: 'Prenatal visit', age: 28, gender: 'Female', allergies: 'None', priority: 'Normal', vitals: { temp: '36.8 °C', spo2: '99%', bp: '115/75 mmHg', hr: '80 bpm' } },
    { id: 'P004', name: 'Peter Ouma', complaint: 'Diabetic review', age: 67, gender: 'Male', allergies: 'Sulfa drugs', priority: 'Normal', vitals: { temp: '36.5 °C', spo2: '97%', bp: '128/82 mmHg', hr: '68 bpm' } },
    { id: 'P005', name: 'Grace Njoki', complaint: 'High fever', age: 5, gender: 'Female', allergies: 'None', priority: 'Urgent', vitals: { temp: '39.2 °C', spo2: '97%', bp: '100/65 mmHg', hr: '110 bpm' } },
    { id: 'P006', name: 'Daniel Kibet', complaint: 'Back pain', age: 41, gender: 'Male', allergies: 'None', priority: 'Normal', vitals: { temp: '36.7 °C', spo2: '98%', bp: '122/80 mmHg', hr: '74 bpm' } },
  ];

  const currentPatient = patientOptions.find(p => p.id === selectedPatientId) || patientOptions[0];

  // Teleconsult local controls
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [callActive, setCallActive] = useState(false);

  // Documentation Sub-Tabs
  const [activeDocTab, setActiveDocTab] = useState<'notes' | 'diagnosis' | 'prescription'>('notes');

  // Notes state
  const [hpi, setHpi] = useState('Patient reports acute retrosternal chest pressure onset 2 hours ago while climbing stairs. Radiates to left shoulder. No diaphoresis or syncopal episodes reported.');
  const [examNotes, setExamNotes] = useState('Chest auscultation: Normal vesicular breath sounds bilaterally, no crepitations. Heart sounds S1 S2 present, no murmurs. Peripheral pulses intact.');
  const [treatmentPlan, setTreatmentPlan] = useState('1. Order STAT 12-Lead ECG.\n2. Serum Troponin I and Electrolytes.\n3. Aspirin 300mg oral stat.\n4. Close monitoring in Acute Observation Bay.');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Diagnosis state
  const [selectedIcd, setSelectedIcd] = useState('R07.9');
  const [diagnosisName, setDiagnosisName] = useState('Chest pain, unspecified');
  const [diagnosisNotes, setDiagnosisNotes] = useState('Differential includes atypical angina vs musculoskeletal costochondritis. Acute coronary syndrome workup in progress.');

  // Prescription state
  const [prescriptionsList, setPrescriptionsList] = useState<Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>>([
    { drugName: 'Aspirin (Dispersible)', dosage: '300mg', frequency: 'Stat dose', duration: '1 Day', instructions: 'Chew and swallow with water immediately' },
    { drugName: 'Glyceryl Trinitrate (GTN)', dosage: '0.5mg', frequency: 'Sublingual as needed', duration: '3 Days', instructions: 'Dissolve 1 tablet under tongue for chest tightness' }
  ]);
  const [newDrug, setNewDrug] = useState({ drugName: '', dosage: '', frequency: 'Twice Daily', duration: '5 Days', instructions: 'Take after meals' });

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await onSaveEncounter({
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        chiefComplaint: currentPatient.complaint,
        hpi,
        physicalExam: examNotes,
        plan: treatmentPlan,
        diagnosis: diagnosisName,
        icd10: selectedIcd
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleAddDrug = () => {
    if (!newDrug.drugName.trim()) return;
    setPrescriptionsList([...prescriptionsList, { ...newDrug }]);
    setNewDrug({ drugName: '', dosage: '', frequency: 'Twice Daily', duration: '5 Days', instructions: 'Take after meals' });
  };

  const handleSendPrescription = async () => {
    try {
      await onCreatePrescription({
        patientId: currentPatient.id,
        patientName: currentPatient.name,
        medications: prescriptionsList,
        doctorNotes: `Prescribed during OPD consult on 2026-07-24 for ${currentPatient.complaint}.`
      });
      alert('Prescription successfully transmitted to Terralink Hospital Pharmacy Dispense queue.');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header and Patient Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Consultation
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Active clinical encounter & teleconsultation desk
          </p>
        </div>

        {/* Patient Selector Dropdown */}
        <div className="relative min-w-[280px]">
          <select
            value={currentPatient.id}
            onChange={(e) => onSelectPatientId(e.target.value)}
            className="w-full bg-white border border-slate-200/90 text-slate-900 font-semibold text-sm rounded-xl px-4 py-2.5 shadow-xs focus:ring-2 focus:ring-[#023545] focus:outline-none appearance-none cursor-pointer pr-10"
          >
            {patientOptions.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.complaint}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* CARD 1: Telemedicine Session Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#023545] text-white">
            Patient: {currentPatient.name}
          </span>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setMicEnabled(!micEnabled)}
              className={`p-2 rounded-xl transition-colors ${
                micEnabled 
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                  : 'bg-rose-100 text-rose-700'
              }`}
              title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setVideoEnabled(!videoEnabled)}
              className={`p-2 rounded-xl transition-colors ${
                videoEnabled 
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                  : 'bg-rose-100 text-rose-700'
              }`}
              title={videoEnabled ? 'Disable Camera' : 'Enable Camera'}
            >
              {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200/60 rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-teal-50 text-[#023545] flex items-center justify-center mb-3 shadow-xs">
            <Video className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">
            Telemedicine Session
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-5">
            {callActive 
              ? 'Active video session live. Camera feed streaming.' 
              : 'Click "Start Video Call" to connect with patient'}
          </p>

          <button
            type="button"
            onClick={() => {
              if (onStartLiveTelemedicine) {
                onStartLiveTelemedicine(currentPatient.name);
              } else {
                setCallActive(!callActive);
              }
            }}
            className={`inline-flex items-center space-x-2 font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer ${
              callActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>{callActive ? 'End Video Call' : 'Start Video Call'}</span>
          </button>
        </div>
      </div>

      {/* CARD 2: Patient Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Patient Summary
        </h2>

        {/* Demographics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pb-4 border-b border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Name</span>
            <span className="font-semibold text-slate-800 text-sm">{currentPatient.name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Age & Gender</span>
            <span className="font-semibold text-slate-800 text-sm">{currentPatient.age} yrs / {currentPatient.gender}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Chief Complaint</span>
            <span className="font-semibold text-slate-800 text-sm">{currentPatient.complaint}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Priority</span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
              currentPatient.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {currentPatient.priority}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Allergies</span>
            <span className="font-semibold text-rose-600 text-sm">{currentPatient.allergies}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Coverage</span>
            <span className="font-semibold text-slate-800 text-sm">SHA / NHIF</span>
          </div>
        </div>

        {/* Vitals Strip */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-3">
            <Thermometer className="w-4 h-4 text-amber-600" />
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Temperature</p>
              <p className="font-bold text-slate-900 text-sm">{currentPatient.vitals.temp}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-3">
            <Activity className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-[11px] text-slate-400 font-medium">SpO2 Oxygen</p>
              <p className="font-bold text-slate-900 text-sm">{currentPatient.vitals.spo2}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-3">
            <Heart className="w-4 h-4 text-rose-600" />
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Blood Pressure</p>
              <p className="font-bold text-slate-900 text-sm">{currentPatient.vitals.bp}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-3">
            <Activity className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Heart Rate</p>
              <p className="font-bold text-slate-900 text-sm">{currentPatient.vitals.hr}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: Clinical Documentation Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        {/* Sub-Tabs: Consultation Notes | Diagnosis | Prescription */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-5">
          <button
            type="button"
            onClick={() => setActiveDocTab('notes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDocTab === 'notes'
                ? 'bg-[#023545] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Consultation Notes
          </button>
          <button
            type="button"
            onClick={() => setActiveDocTab('diagnosis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDocTab === 'diagnosis'
                ? 'bg-[#023545] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Diagnosis
          </button>
          <button
            type="button"
            onClick={() => setActiveDocTab('prescription')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDocTab === 'prescription'
                ? 'bg-[#023545] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Prescription
          </button>
        </div>

        {/* Tab 1: Consultation Notes */}
        {activeDocTab === 'notes' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                History of Present Illness (HPI)
              </label>
              <textarea
                rows={3}
                value={hpi}
                onChange={(e) => setHpi(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#023545]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Physical Examination Findings
              </label>
              <textarea
                rows={3}
                value={examNotes}
                onChange={(e) => setExamNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#023545]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Treatment & Management Plan
              </label>
              <textarea
                rows={3}
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#023545]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Clinical notes saved to EMR chart.</span>
                </span>
              ) : <div />}

              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-5 py-2.5 rounded-xl bg-[#023545] hover:bg-[#0b4c5e] text-white font-semibold text-xs flex items-center space-x-2 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Diagnosis */}
        {activeDocTab === 'diagnosis' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ICD-10 Code
                </label>
                <select
                  value={selectedIcd}
                  onChange={(e) => {
                    setSelectedIcd(e.target.value);
                    if (e.target.value === 'R07.9') setDiagnosisName('Chest pain, unspecified');
                    if (e.target.value === 'I20.9') setDiagnosisName('Angina pectoris, unspecified');
                    if (e.target.value === 'I10') setDiagnosisName('Essential (primary) hypertension');
                    if (e.target.value === 'E11.9') setDiagnosisName('Type 2 diabetes mellitus without complications');
                    if (e.target.value === 'J06.9') setDiagnosisName('Acute upper respiratory infection, unspecified');
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#023545]"
                >
                  <option value="R07.9">R07.9 — Chest pain, unspecified</option>
                  <option value="I20.9">I20.9 — Angina pectoris, unspecified</option>
                  <option value="I10">I10 — Essential (primary) hypertension</option>
                  <option value="E11.9">E11.9 — Type 2 diabetes mellitus</option>
                  <option value="J06.9">J06.9 — Acute upper respiratory infection</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Primary Clinical Diagnosis
                </label>
                <input
                  type="text"
                  value={diagnosisName}
                  onChange={(e) => setDiagnosisName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#023545]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Diagnostic Impression & Rationale
              </label>
              <textarea
                rows={3}
                value={diagnosisNotes}
                onChange={(e) => setDiagnosisNotes(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#023545]"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-5 py-2.5 rounded-xl bg-[#023545] hover:bg-[#0b4c5e] text-white font-semibold text-xs flex items-center space-x-2 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Diagnosis</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Prescription */}
        {activeDocTab === 'prescription' && (
          <div className="space-y-4">
            {/* Add Medication Form */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Add Medication
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  placeholder="Drug Name (e.g. Paracetamol)"
                  value={newDrug.drugName}
                  onChange={(e) => setNewDrug({ ...newDrug, drugName: e.target.value })}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 500mg)"
                  value={newDrug.dosage}
                  onChange={(e) => setNewDrug({ ...newDrug, dosage: e.target.value })}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Frequency (e.g. 3 times daily)"
                  value={newDrug.frequency}
                  onChange={(e) => setNewDrug({ ...newDrug, frequency: e.target.value })}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Duration (e.g. 5 days)"
                    value={newDrug.duration}
                    onChange={(e) => setNewDrug({ ...newDrug, duration: e.target.value })}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddDrug}
                    className="px-3 bg-[#023545] hover:bg-[#0b4c5e] text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Prescribed Items Table */}
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
              {prescriptionsList.map((item, idx) => (
                <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs gap-3">
                  <div>
                    <span className="font-bold text-slate-900">{item.drugName}</span>
                    <span className="text-slate-500 ml-2">· {item.dosage} · {item.frequency} for {item.duration}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">{item.instructions}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrescriptionsList(prescriptionsList.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSendPrescription}
                className="px-5 py-2.5 rounded-xl bg-[#023545] hover:bg-[#0b4c5e] text-white font-semibold text-xs flex items-center space-x-2 shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send Prescription to Pharmacy</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
