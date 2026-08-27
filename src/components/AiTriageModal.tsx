import React, { useState } from 'react';
import { 
  AlertTriangle, 
  HeartPulse, 
  Activity, 
  ShieldAlert, 
  Phone, 
  CheckCircle2, 
  X, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Stethoscope, 
  Flame,
  FileText
} from 'lucide-react';
import { PatientProfile } from '../types';

interface AiTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onRouteToDepartment: (deptId: string, urgency: 'Emergency' | 'Priority' | 'Routine') => void;
}

export const AiTriageModal: React.FC<AiTriageModalProps> = ({
  isOpen,
  onClose,
  patient,
  onRouteToDepartment
}) => {
  if (!isOpen) return null;

  // Triage input state
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('Today (Sudden Onset)');
  const [painLevel, setPainLevel] = useState<number>(4);
  const [heartRate, setHeartRate] = useState<number>(78);
  const [systolicBP, setSystolicBP] = useState<number>(120);
  const [diastolicBP, setDiastolicBP] = useState<number>(80);
  const [spo2, setSpo2] = useState<number>(98);
  const [temperature, setTemperature] = useState<number>(36.8);
  const [hasDifficultyBreathing, setHasDifficultyBreathing] = useState(false);
  const [hasChestPressure, setHasChestPressure] = useState(false);
  const [hasSevereBleeding, setHasSevereBleeding] = useState(false);
  const [hasHighFever, setHasHighFever] = useState(false);

  // Result state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState<{
    level: 'CRITICAL_RED' | 'URGENT_YELLOW' | 'ROUTINE_GREEN';
    score: number;
    title: string;
    department: string;
    deptId: string;
    action: string;
    clinicalNote: string;
    waitTime: string;
    recommendations: string[];
  } | null>(null);

  const handleRunTriage = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      let isCritical = 
        hasChestPressure || 
        hasDifficultyBreathing || 
        hasSevereBleeding || 
        spo2 < 92 || 
        systolicBP > 180 || 
        systolicBP < 85 || 
        painLevel >= 9;

      let isUrgent = 
        hasHighFever || 
        painLevel >= 6 || 
        temperature >= 38.8 || 
        heartRate > 110 || 
        spo2 <= 95;

      const symLower = symptoms.toLowerCase();

      // Check department matching
      let targetDept = 'Emergency & Trauma (24/7)';
      let targetDeptId = 'dept-emergency';

      if (symLower.includes('chest') || symLower.includes('heart') || symLower.includes('palpitation')) {
        targetDept = 'Cardiology & Heart Center';
        targetDeptId = 'dept-cardio';
      } else if (symLower.includes('bone') || symLower.includes('fracture') || symLower.includes('joint') || symLower.includes('knee') || symLower.includes('back pain')) {
        targetDept = 'Orthopedics & Joint Surgery';
        targetDeptId = 'dept-ortho';
      } else if (symLower.includes('child') || symLower.includes('baby') || symLower.includes('infant') || symLower.includes('pediatric')) {
        targetDept = 'Pediatrics & Child Wellness';
        targetDeptId = 'dept-peds';
      } else if (symLower.includes('pregnancy') || symLower.includes('maternity') || symLower.includes('labor') || symLower.includes('pelvic')) {
        targetDept = 'Obstetrics & Gynaecology (OB/GYN)';
        targetDeptId = 'dept-obgyn';
      } else if (symLower.includes('x-ray') || symLower.includes('scan') || symLower.includes('mri') || symLower.includes('ct')) {
        targetDept = 'Radiology & Advanced Imaging';
        targetDeptId = 'dept-radiology';
      }

      if (isCritical) {
        setTriageResult({
          level: 'CRITICAL_RED',
          score: 95,
          title: 'Emergency Red-Flag Auto-Escalation',
          department: 'Emergency & Trauma (24/7)',
          deptId: 'dept-emergency',
          action: 'Immediate Resuscitation & Emergency Physician Alert',
          clinicalNote: 'Critical physiological flags detected (Cardiovascular / Respiratory distress / Severe Vitals Deviation). Automatic trauma notification dispatched to Trauma Bay.',
          waitTime: 'Immediate (< 2 mins)',
          recommendations: [
            'Alert Emergency Triage Desk immediately via hotline 0713544101',
            'Prepare Trauma Bay 1 & crash cart equipment',
            'Initiate continuous high-flow oxygen and 12-lead ECG monitoring'
          ]
        });
      } else if (isUrgent) {
        setTriageResult({
          level: 'URGENT_YELLOW',
          score: 65,
          title: 'Priority Yellow-Flag Fast Track',
          department: targetDept,
          deptId: targetDeptId,
          action: 'Priority Specialist Consultation & Vitals Stabilization',
          clinicalNote: 'Moderate pain index and acute clinical signs. Fast-tracked ahead of routine outpatient queue to minimize clinical risk.',
          waitTime: '5 - 10 mins',
          recommendations: [
            'Assigned to Priority Queue Counter',
            'Pre-consultation nursing observation & diagnostic workup',
            'Synchronized with specialized imaging / lab diagnostic bays'
          ]
        });
      } else {
        setTriageResult({
          level: 'ROUTINE_GREEN',
          score: 25,
          title: 'Standard Green-Flag Outpatient Routine',
          department: targetDept,
          deptId: targetDeptId,
          action: 'Standard Specialist Clinical Booking & Evaluation',
          clinicalNote: 'Vitals stable. Standard outpatient booking recommended with live waiting time tracking and synced doctor availability.',
          waitTime: '10 - 20 mins',
          recommendations: [
            'Confirm digital appointment booking with attending specialist',
            'View live queue waiting times on dashboard',
            'Access health wallet timeline for previous medical encounters'
          ]
        });
      }

      setIsAnalyzing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold tracking-tight">
                  AI-Driven Clinical Triage & Red-Flag Scanner
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30">
                  KDPA Compliant
                </span>
              </div>
              <p className="text-xs text-teal-200/80">
                Patient: <strong className="text-white">{patient.name}</strong> • Blood: <strong>{patient.bloodGroup}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {!triageResult ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200/80 text-teal-900 flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Enter your current symptoms and vital readings below. Our intelligent triage engine automatically evaluates physiological indicators, flags emergencies, and reserves appropriate hospital equipment.
                </p>
              </div>

              {/* Symptoms Input */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Primary Symptoms & Chief Complaint *
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Chest tightness radiating to left shoulder with lightheadedness, or sudden knee swelling after a fall..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              {/* Red-Flag Checkboxes */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/70 space-y-2.5">
                <span className="font-bold text-rose-900 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Check any Red-Flag Clinical Indicators:</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={hasChestPressure} 
                      onChange={(e) => setHasChestPressure(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500" 
                    />
                    <span className="text-rose-950 font-semibold">Crushing Chest Pain / Pressure</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={hasDifficultyBreathing} 
                      onChange={(e) => setHasDifficultyBreathing(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500" 
                    />
                    <span className="text-rose-950 font-semibold">Severe Shortness of Breath</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={hasSevereBleeding} 
                      onChange={(e) => setHasSevereBleeding(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500" 
                    />
                    <span className="text-rose-950 font-semibold">Uncontrolled Bleeding or Trauma</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={hasHighFever} 
                      onChange={(e) => setHasHighFever(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500" 
                    />
                    <span className="text-rose-950 font-semibold">High Spiking Fever &gt; 39°C</span>
                  </label>
                </div>
              </div>

              {/* Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">
                    Pain Scale (1 - 10)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={painLevel}
                    onChange={(e) => setPainLevel(Number(e.target.value))}
                    className="w-full font-bold text-sm bg-transparent focus:outline-none text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">0: None, 10: Extreme</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">
                    BP (Systolic / Dia)
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      value={systolicBP}
                      onChange={(e) => setSystolicBP(Number(e.target.value))}
                      className="w-12 font-bold text-sm bg-transparent focus:outline-none text-slate-900"
                    />
                    <span className="text-slate-400">/</span>
                    <input
                      type="number"
                      value={diastolicBP}
                      onChange={(e) => setDiastolicBP(Number(e.target.value))}
                      className="w-12 font-bold text-sm bg-transparent focus:outline-none text-slate-900"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">mmHg</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">
                    Oxygen SpO2 (%)
                  </label>
                  <input
                    type="number"
                    min={70}
                    max={100}
                    value={spo2}
                    onChange={(e) => setSpo2(Number(e.target.value))}
                    className={`w-full font-bold text-sm bg-transparent focus:outline-none ${
                      spo2 < 92 ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400">Normal: 95-100%</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full font-bold text-sm bg-transparent focus:outline-none text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Normal: 36.5 - 37.5</span>
                </div>
              </div>
            </div>
          ) : (
            /* Triage Result Display */
            <div className="space-y-4 animate-fade-in">
              <div className={`p-5 rounded-3xl border ${
                triageResult.level === 'CRITICAL_RED'
                  ? 'bg-rose-500 text-white border-rose-600 shadow-xl shadow-rose-500/30 animate-pulse'
                  : triageResult.level === 'URGENT_YELLOW'
                  ? 'bg-amber-50 text-amber-950 border-amber-300 shadow-md'
                  : 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-md'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-5 h-5" />
                    <span className="font-black text-sm uppercase tracking-wider">
                      {triageResult.title}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-xs">
                    Triage Severity: {triageResult.score}/100
                  </span>
                </div>

                <p className="text-xs leading-relaxed opacity-95">
                  {triageResult.clinicalNote}
                </p>

                <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>Recommended Dept: <strong>{triageResult.department}</strong></div>
                  <div>Estimated Queue Wait: <strong>{triageResult.waitTime}</strong></div>
                </div>
              </div>

              {/* Protocol Recommendations */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">
                  Actionable Protocol Steps:
                </span>
                <ul className="space-y-1.5 text-slate-600">
                  {triageResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {triageResult.level === 'CRITICAL_RED' && (
                <div className="p-3.5 rounded-2xl bg-rose-100 border border-rose-300 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs">
                    <Phone className="w-4 h-4 text-rose-700" />
                    <span>Emergency Hotline: <strong>0713544101 (24/7 Direct)</strong></span>
                  </div>
                  <a
                    href="tel:0713544101"
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Call ER Team Now
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          {!triageResult ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-all cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRunTriage}
                disabled={isAnalyzing}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzing ? 'Evaluating Vitals...' : 'Run AI Triage Evaluation'}</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setTriageResult(null)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-all cursor-pointer text-xs"
              >
                Re-evaluate
              </button>

              <button
                type="button"
                onClick={() => {
                  onRouteToDepartment(
                    triageResult.deptId, 
                    triageResult.level === 'CRITICAL_RED' ? 'Emergency' : triageResult.level === 'URGENT_YELLOW' ? 'Priority' : 'Routine'
                  );
                  onClose();
                }}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <span>Proceed to {triageResult.department}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
