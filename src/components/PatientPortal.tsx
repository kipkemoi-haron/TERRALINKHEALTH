import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Activity, 
  Pill, 
  FlaskConical, 
  CreditCard, 
  MessageSquare, 
  Bot, 
  Video, 
  ShieldAlert, 
  User as UserIcon, 
  Search, 
  Filter, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Phone, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Send,
  Loader2,
  CalendarCheck,
  HeartPulse,
  Eye,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { 
  PatientProfile, 
  Department, 
  Doctor, 
  Appointment, 
  ClinicalEncounter, 
  Prescription, 
  LabOrder, 
  RadiologyOrder, 
  ImmunizationRecord, 
  Invoice, 
  MpesaPayment,
  ChatMessage,
  PatientInsurancePolicy,
  InsuranceProviderPlan
} from '../types';
import { INITIAL_INSURANCE_PROVIDERS, INITIAL_INSURANCE_POLICIES } from '../mockData';
import { MpesaModal } from './MpesaModal';
import { TelemedicineRoom } from './TelemedicineRoom';
import { ReportViewerModal } from './ReportViewerModal';
import { PatientJourneyTracker } from './PatientJourneyTracker';
import { AiTriageModal } from './AiTriageModal';
import { HealthWalletTimeline } from './HealthWalletTimeline';
import { NurseDirectChatModal } from './NurseDirectChatModal';
import { AutoSchedulerModal } from './AutoSchedulerModal';

interface PatientPortalProps {
  patient: PatientProfile;
  onUpdatePatient: (updated: PatientProfile) => void;
  departments: Department[];
  doctors: Doctor[];
  appointments: Appointment[];
  encounters: ClinicalEncounter[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  radiologyOrders: RadiologyOrder[];
  immunizations: ImmunizationRecord[];
  invoices: Invoice[];
  mpesaPayments: MpesaPayment[];
  insurancePolicies?: PatientInsurancePolicy[];
  insuranceProviders?: InsuranceProviderPlan[];
  onBookAppointment: (appointmentData: any) => Promise<void>;
  onCancelAppointment: (appointmentId: string) => void;
  onPayInvoice: (invoiceId: string, receipt: string) => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  patient,
  onUpdatePatient,
  departments,
  doctors,
  appointments,
  encounters,
  prescriptions,
  labOrders,
  radiologyOrders,
  immunizations,
  invoices,
  mpesaPayments,
  insurancePolicies: initialPolicies,
  insuranceProviders: initialProviders,
  onBookAppointment,
  onCancelAppointment,
  onPayInvoice
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'book' | 'appointments' | 'emr' | 'queue' | 'insurance' | 'telemedicine' | 'billing' | 'ai_assistant' | 'customer_care' | 'profile'
  >('dashboard');

  // Insurance State
  const [policies, setPolicies] = useState<PatientInsurancePolicy[]>(() => {
    if (initialPolicies && initialPolicies.length > 0) return initialPolicies;
    const patientSeed = INITIAL_INSURANCE_POLICIES.filter(p => p.patientId === patient.id);
    return patientSeed.length > 0 ? patientSeed : INITIAL_INSURANCE_POLICIES.slice(0, 1);
  });
  const [providers, setProviders] = useState<InsuranceProviderPlan[]>(() => initialProviders || INITIAL_INSURANCE_PROVIDERS);
  
  // New Policy Form State
  const [newPolicyProviderCode, setNewPolicyProviderCode] = useState<string>('SHA-KENYA');
  const [newPolicyTierName, setNewPolicyTierName] = useState<string>('Primary Care Benefit Package');
  const [newPolicyNumber, setNewPolicyNumber] = useState<string>('');
  const [newMemberNumber, setNewMemberNumber] = useState<string>('');
  const [newPrincipalName, setNewPrincipalName] = useState<string>(patient.name);
  const [newRelationship, setNewRelationship] = useState<string>('Self');
  const [isSubmittingPolicy, setIsSubmittingPolicy] = useState<boolean>(false);
  const [policySubmitSuccess, setPolicySubmitSuccess] = useState<string>('');
  const [policySubmitError, setPolicySubmitError] = useState<string>('');

  // Booking wizard state
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'In-Person' | 'Telemedicine'>('In-Person');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('09:30 AM');
  const [visitReason, setVisitReason] = useState<string>('');
  const [bookingError, setBookingError] = useState<string>('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  // M-PESA modal state
  const [mpesaModalOpen, setMpesaModalOpen] = useState(false);
  const [mpesaAmount, setMpesaAmount] = useState(1500);
  const [mpesaTitle, setMpesaTitle] = useState('');
  const [mpesaRef, setMpesaRef] = useState('');
  const [mpesaTargetAction, setMpesaTargetAction] = useState<'booking' | 'invoice'>('booking');
  const [activeInvoiceToPay, setActiveInvoiceToPay] = useState<string | null>(null);

  // Active video call
  const [activeTelemedicineApt, setActiveTelemedicineApt] = useState<Appointment | null>(null);

  // Document viewer modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalData, setReportModalData] = useState<{
    title: string;
    type: 'medical_report' | 'lab_report' | 'invoice';
    encounter?: ClinicalEncounter;
    labOrder?: LabOrder;
    invoice?: Invoice;
  }>({ title: '', type: 'medical_report' });

  // EMR subtabs (including unified timeline)
  const [emrSubtab, setEmrSubtab] = useState<'timeline' | 'visits' | 'prescriptions' | 'labs' | 'radiology' | 'allergies' | 'immunizations'>('timeline');

  // Smart Patient Modals State
  const [isAiTriageOpen, setIsAiTriageOpen] = useState(false);
  const [isNurseChatOpen, setIsNurseChatOpen] = useState(false);
  const [isAutoSchedulerOpen, setIsAutoSchedulerOpen] = useState(false);

  // Customer care chat state
  const [careMessages, setCareMessages] = useState<ChatMessage[]>([]);
  const [careInput, setCareInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  // Gemini AI Assistant state
  const [aiMessages, setAiMessages] = useState<{ sender: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      sender: 'assistant',
      text: `Jambo ${patient.name}! I am TERRA-AI, your virtual health advisor at TERRALINKHEALTH.\n\nI can help you understand medical tests, clarify symptoms, guide you on which hospital department to visit, or answer common healthcare questions.\n\n*(Note: I provide evidence-based health guidance and do not replace a doctor's examination. In emergencies, please visit A&E immediately).*`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Department search & filter for queue
  const [deptSearch, setDeptSearch] = useState('');

  // Fetch initial chat & insurance policies
  useEffect(() => {
    fetch('/api/chat/messages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCareMessages(data);
      })
      .catch(err => console.warn('Chat load err:', err));

    // Fetch live insurance policies
    fetch(`/api/insurance/policies?patientId=${patient.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPolicies(data);
        }
      })
      .catch(err => console.warn('Insurance load err:', err));

    // Fetch providers
    fetch('/api/insurance/providers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProviders(data);
        }
      })
      .catch(err => console.warn('Providers load err:', err));
  }, [patient.id]);

  // Handle New Insurance Card Link Submission
  const handleLinkInsurancePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setPolicySubmitError('');
    setPolicySubmitSuccess('');

    if (!newPolicyNumber.trim() || !newMemberNumber.trim()) {
      setPolicySubmitError('Please provide both the Policy Number and Member ID.');
      return;
    }

    const matchedProvider = providers.find(p => p.providerCode === newPolicyProviderCode) || providers[0];
    const matchedTier = matchedProvider?.planTiers.find(t => t.tierName === newPolicyTierName) || matchedProvider?.planTiers[0];

    setIsSubmittingPolicy(true);

    try {
      const res = await fetch('/api/insurance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          patientName: patient.name,
          patientNationalId: patient.nationalId,
          providerName: matchedProvider.providerName,
          providerCode: matchedProvider.providerCode,
          policyNumber: newPolicyNumber.trim(),
          memberNumber: newMemberNumber.trim(),
          principalMemberName: newPrincipalName.trim() || patient.name,
          relationshipToPrincipal: newRelationship,
          planTier: matchedTier?.tierName || newPolicyTierName,
          monthlyPremiumKES: matchedTier?.monthlyPremiumKES || 1500,
          annualPremiumKES: matchedTier?.annualPremiumKES || 18000,
          annualInpatientLimitKES: matchedTier?.inpatientLimitKES || 2000000,
          annualOutpatientLimitKES: matchedTier?.outpatientLimitKES || 150000,
          copayKES: matchedTier?.copayKES || 0
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to link insurance policy.');
      }

      setPolicies(prev => [data.policy, ...prev]);
      setPolicySubmitSuccess(`Successfully linked ${matchedProvider.providerName} policy #${newPolicyNumber}! Hospital billing desk will approve your policy.`);
      setNewPolicyNumber('');
      setNewMemberNumber('');
    } catch (err: any) {
      setPolicySubmitError(err.message || 'Error submitting insurance policy.');
    } finally {
      setIsSubmittingPolicy(false);
    }
  };

  // Filtered doctors for selected department
  const filteredDoctors = selectedDeptId
    ? doctors.filter(d => d.departmentId === selectedDeptId)
    : doctors;

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);
  const selectedDept = departments.find(d => d.id === selectedDeptId);

  // Trigger Booking Payment Step
  const handleInitiateBookingPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    if (!selectedDeptId) {
      setBookingError('Please select a hospital clinical department.');
      return;
    }
    if (!selectedDoctorId) {
      setBookingError('Please choose a specialized doctor.');
      return;
    }
    if (!appointmentDate) {
      setBookingError('Please select an appointment date.');
      return;
    }

    // Check Sunday closed rule
    const d = new Date(appointmentDate);
    if (d.getDay() === 0) {
      setBookingError('All hospital outpatient clinics are closed on Sundays. Please choose a Monday through Saturday slot.');
      return;
    }

    const fee = selectedDoctor ? selectedDoctor.consultationFeeKES : 1500;
    setMpesaAmount(fee);
    setMpesaTitle(`${selectedDept?.name} Consultation (${selectedDoctor?.name})`);
    setMpesaRef(`APT-${Date.now().toString().slice(-5)}`);
    setMpesaTargetAction('booking');
    setMpesaModalOpen(true);
  };

  // M-PESA success callback
  const handleMpesaSuccess = async (receipt: string) => {
    setMpesaModalOpen(false);

    if (mpesaTargetAction === 'booking') {
      setIsBookingSubmitting(true);
      try {
        await onBookAppointment({
          patientId: patient.id,
          patientName: patient.name,
          patientPhone: patient.phone,
          patientNationalId: patient.nationalId,
          doctorId: selectedDoctorId,
          departmentId: selectedDeptId,
          appointmentDate,
          appointmentTime,
          type: consultationType,
          reason: visitReason || 'Specialist Consultation',
          mpesaReceipt: receipt
        });
        setIsBookingSubmitting(false);
        setActiveTab('appointments');
        alert(`Appointment successfully confirmed! M-PESA Ref: ${receipt}`);
      } catch (err: any) {
        setIsBookingSubmitting(false);
        setBookingError(err.message || 'Failed to complete booking.');
      }
    } else if (mpesaTargetAction === 'invoice' && activeInvoiceToPay) {
      onPayInvoice(activeInvoiceToPay, receipt);
      alert(`Invoice paid successfully! M-PESA Ref: ${receipt}`);
    }
  };

  // Handle AI Chat
  const handleSendAiMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || aiLoading) return;

    const userText = aiInput.trim();
    const newMsg = {
      sender: 'user' as const,
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, newMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/gemini/health-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          patientContext: {
            id: patient.id,
            nationalId: patient.nationalId,
            name: patient.name,
            dob: patient.dob,
            gender: patient.gender,
            bloodGroup: patient.bloodGroup,
            allergies: patient.allergies,
            chronicConditions: patient.chronicConditions
          }
        })
      });
      const data = await res.json();
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: data.reply || 'Guidance received. Please consult your physician for confirmation.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Notice: If you are in acute pain or distress, please proceed to Accident & Emergency immediately or call our ambulance helpline on 0713544101.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle Customer Care message
  const handleSendCareMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careInput.trim() || loadingChat) return;

    const text = careInput.trim();
    setCareInput('');
    setLoadingChat(true);

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: patient.id,
          senderName: patient.name,
          senderRole: 'patient',
          text
        })
      });
      const data = await res.json();
      setCareMessages(prev => [...prev, data]);
      
      // Auto-reload replies after 2s
      setTimeout(() => {
        fetch('/api/chat/messages')
          .then(r => r.json())
          .then(d => { if (Array.isArray(d)) setCareMessages(d); });
      }, 2000);
    } catch (err) {
      console.warn('Chat send err:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Telemedicine Fullscreen Overlay if Active */}
      {activeTelemedicineApt && (
        <TelemedicineRoom
          appointment={activeTelemedicineApt}
          currentUserRole="patient"
          currentUserName={patient.name}
          onEndCall={() => setActiveTelemedicineApt(null)}
        />
      )}

      {/* Report Viewer Modal */}
      <ReportViewerModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title={reportModalData.title}
        type={reportModalData.type}
        patient={patient}
        encounter={reportModalData.encounter}
        labOrder={reportModalData.labOrder}
        invoice={reportModalData.invoice}
      />

      {/* AI Clinical Triage Modal */}
      <AiTriageModal
        isOpen={isAiTriageOpen}
        onClose={() => setIsAiTriageOpen(false)}
        patient={patient}
        onRouteToDepartment={(deptId, urgency) => {
          setSelectedDeptId(deptId);
          setActiveTab('book');
        }}
      />

      {/* Direct Nurse Chat Modal */}
      <NurseDirectChatModal
        isOpen={isNurseChatOpen}
        onClose={() => setIsNurseChatOpen(false)}
        patient={patient}
      />

      {/* Auto Scheduler Follow-up Modal */}
      <AutoSchedulerModal
        isOpen={isAutoSchedulerOpen}
        onClose={() => setIsAutoSchedulerOpen(false)}
        patient={patient}
        departments={departments}
        doctors={doctors}
        onConfirmSchedule={onBookAppointment}
      />

      {/* M-PESA Payment Modal */}
      <MpesaModal
        isOpen={mpesaModalOpen}
        onClose={() => setMpesaModalOpen(false)}
        amountKES={mpesaAmount}
        serviceTitle={mpesaTitle}
        reference={mpesaRef}
        defaultPhone={patient.phone}
        onSuccess={handleMpesaSuccess}
      />

      {/* Patient Top Identity Banner - Frosted Glass Card */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] p-6 text-slate-800 shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-sky-200/30 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/80 border border-white p-1 backdrop-blur-md shadow-md flex-shrink-0">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300" 
                alt={patient.name} 
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{patient.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  Verified Patient
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                National ID: <strong className="text-slate-900 font-mono">{patient.nationalId}</strong> • Phone: <strong className="text-slate-900">{patient.phone}</strong> • Blood Group: <strong className="text-rose-600 font-bold">{patient.bloodGroup}</strong>
              </p>
              <p className="text-[11px] text-teal-800 font-medium mt-1 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>NHIF / SHIF Policy: <strong>{patient.insurancePolicyNumber || 'SHIF-NRB-8831920'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('book')}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl text-xs flex items-center space-x-1.5 shadow-lg shadow-teal-500/25 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className="px-5 py-2.5 bg-white/70 hover:bg-white text-slate-800 font-semibold rounded-2xl text-xs flex items-center space-x-1.5 border border-white/90 backdrop-blur-md shadow-xs transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Live Queue Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Sub-Navigation Tabs - Glass Pills */}
      <div className="flex overflow-x-auto p-1.5 gap-2 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 text-xs font-semibold scrollbar-none shadow-xs">
        {[
          { id: 'dashboard', label: 'My Dashboard', icon: Activity },
          { id: 'book', label: 'Book Doctor', icon: CalendarCheck },
          { id: 'appointments', label: `My Visits (${appointments.length})`, icon: Calendar },
          { id: 'emr', label: 'Medical Records (EMR)', icon: FileText },
          { id: 'queue', label: 'Department Queues', icon: Clock },
          { id: 'insurance', label: `Insurance & Premiums (${policies.length})`, icon: ShieldCheck },
          { id: 'billing', label: `Invoices & M-PESA (${invoices.filter(i => i.status !== 'Paid').length})`, icon: CreditCard },
          { id: 'ai_assistant', label: 'TERRA AI Guidance', icon: Bot },
          { id: 'customer_care', label: 'Helpdesk Chat', icon: MessageSquare },
          { id: 'profile', label: 'My Profile', icon: UserIcon }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-4 rounded-xl flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 font-bold' 
                  : 'bg-white/60 hover:bg-white text-slate-700 border border-white/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: DASHBOARD ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* 1. VISUAL PATIENT JOURNEY TRACKER (From Check-in to Pharmacy) */}
          <PatientJourneyTracker
            patient={patient}
            activeAppointment={appointments[0]}
            encounters={encounters}
            prescriptions={prescriptions}
            labOrders={labOrders}
            invoices={invoices}
            onOpenBooking={() => setActiveTab('book')}
            onOpenRecords={(sub) => {
              setEmrSubtab(sub as any);
              setActiveTab('emr');
            }}
            onOpenBilling={() => setActiveTab('billing')}
            onOpenNurseChat={() => setIsNurseChatOpen(true)}
          />

          {/* 2. AI-DRIVEN TRIAGE & EMERGENCY ESCALATION BAR */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-xl border border-teal-500/30 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center space-x-3.5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0 shadow-inner">
                <HeartPulse className="w-6 h-6 animate-pulse text-teal-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm sm:text-base font-bold tracking-tight text-white">
                    AI Clinical Triage & Red-Flag Emergency Scanner
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/30 text-teal-300 border border-teal-400/30">
                    24/7 Smart Engine
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Input acute symptoms, evaluate vitals, and automatically alert trauma doctors or receive priority fast-track routing.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0 relative z-10 w-full md:w-auto justify-end">
              <button
                onClick={() => setIsNurseChatOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-teal-200 hover:text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Duty Nurse</span>
              </button>

              <button
                onClick={() => setIsAiTriageOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/30 transition-all cursor-pointer hover:scale-102 flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Launch AI Triage</span>
              </button>
            </div>
          </div>

          {/* 3. ESSENTIAL 6 DEPARTMENTS: LIVE WAIT TIMES & EQUIPMENT SYNC */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/80 p-6 shadow-sm shadow-slate-200/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Essential Clinical Departments: Live Wait Times & Equipment Availability
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Telemetry
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Real-time queue length, doctor on-duty status, and verified medical equipment availability
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAutoSchedulerOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition-all cursor-pointer flex items-center space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Auto-Scheduler</span>
                </button>
                <button 
                  onClick={() => setActiveTab('queue')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-900"
                >
                  Full Board &rarr;
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  id: 'dept-cardio',
                  name: 'Cardiology & Heart Center',
                  code: 'CARD-01',
                  doctor: 'Dr. David Ochieng (Consultant Cardiologist)',
                  waitMins: '8 mins',
                  waitColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                  queueCount: 4,
                  equipment: 'Siemens Artis Q Cath Lab & 12-Lead ECG Suite',
                  equipmentStatus: 'Operational',
                  room: 'Suite 204'
                },
                {
                  id: 'dept-ortho',
                  name: 'Orthopedics & Joint Surgery',
                  code: 'ORTH-02',
                  doctor: 'Dr. Brian Kiprono (Orthopedic Surgeon)',
                  waitMins: '12 mins',
                  waitColor: 'text-teal-700 bg-teal-50 border-teal-200',
                  queueCount: 6,
                  equipment: 'GE C-Arm Fluoroscopy & Cast Prep Suite',
                  equipmentStatus: 'Operational',
                  room: 'Suite 108'
                },
                {
                  id: 'dept-peds',
                  name: 'Pediatrics & Child Wellness',
                  code: 'PEDS-03',
                  doctor: 'Dr. Grace Muthoni (Pediatric Specialist)',
                  waitMins: '5 mins',
                  waitColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                  queueCount: 2,
                  equipment: 'Draeger Infant Phototherapy & Resuscitation Pods',
                  equipmentStatus: 'Available',
                  room: 'Suite 112'
                },
                {
                  id: 'dept-obgyn',
                  name: 'Obstetrics & Gynaecology (OB/GYN)',
                  code: 'OBGY-04',
                  doctor: 'Dr. Beatrice Muthoni (Lead Obstetrician)',
                  waitMins: '10 mins',
                  waitColor: 'text-teal-700 bg-teal-50 border-teal-200',
                  queueCount: 3,
                  equipment: 'Voluson E10 4D HD-Live Ultrasound & Delivery Suite',
                  equipmentStatus: 'Operational',
                  room: 'Maternity Wing'
                },
                {
                  id: 'dept-radiology',
                  name: 'Radiology & Advanced Imaging',
                  code: 'RAD-05',
                  doctor: 'Dr. Daniel Mutua (Chief Radiologist)',
                  waitMins: '15 mins',
                  waitColor: 'text-amber-700 bg-amber-50 border-amber-200',
                  queueCount: 5,
                  equipment: 'Siemens 3.0T Magnetom MRI & 128-Slice Somatom CT',
                  equipmentStatus: 'Available',
                  room: 'Imaging Wing'
                },
                {
                  id: 'dept-emergency',
                  name: 'Emergency & Trauma Center (24/7)',
                  code: 'EMRG-00',
                  doctor: 'Dr. Kevin Otieno (Emergency Trauma Lead)',
                  waitMins: 'Instant (< 2 min)',
                  waitColor: 'text-rose-700 bg-rose-50 border-rose-200 font-bold animate-pulse',
                  queueCount: 1,
                  equipment: 'Trauma Resus Bay, Zoll Defibrillator, Life Support',
                  equipmentStatus: '24/7 Standby',
                  room: 'Ground Floor A&E'
                }
              ].map((d) => (
                <div 
                  key={d.id} 
                  className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">{d.name}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded-md">
                        {d.code}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {d.doctor}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500">
                        Live Wait: <strong className={`px-2 py-0.5 rounded-md border text-[10px] ${d.waitColor}`}>{d.waitMins}</strong>
                      </span>
                      <span className="text-slate-500 font-medium">
                        Active Queue: <strong className="text-slate-800">{d.queueCount} patients</strong>
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-600 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-bold uppercase">Equipment Sync:</span>
                      <span className="text-emerald-700 font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        <span>{d.equipmentStatus}</span>
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium truncate">{d.equipment}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setIsNurseChatOpen(true)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-all cursor-pointer"
                    >
                      Nurse Chat
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDeptId(d.id);
                        setActiveTab('book');
                      }}
                      className="px-3 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                    >
                      Book Clinic
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metric Cards - Frosted Glass Panels */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-white/70 shadow-sm shadow-slate-200/40 hover:bg-white/60 transition-all">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-medium">Upcoming Visits</span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{appointments.filter(a => a.status === 'Booked' || a.status === 'Checked-In').length}</p>
              <p className="text-[11px] text-teal-700 mt-1 font-medium truncate">Next: {appointments[0]?.appointmentDate || 'No pending visit'}</p>
            </div>

            <div className="bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-white/70 shadow-sm shadow-slate-200/40 hover:bg-white/60 transition-all">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-medium">Active Prescriptions</span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <Pill className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{prescriptions.length}</p>
              <p className="text-[11px] text-slate-500 mt-1">Dispensed & Active</p>
            </div>

            <div className="bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-white/70 shadow-sm shadow-slate-200/40 hover:bg-white/60 transition-all">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-medium">Lab & Scan Results</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <FlaskConical className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{labOrders.filter(l => l.status === 'Results Ready').length + radiologyOrders.length}</p>
              <p className="text-[11px] text-sky-700 mt-1 font-medium">All Reports Signed</p>
            </div>

            <div className="bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-white/70 shadow-sm shadow-slate-200/40 hover:bg-white/60 transition-all">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                <span className="font-medium">Outstanding Bills</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                KES {invoices.reduce((acc, curr) => acc + curr.balanceKES, 0).toLocaleString()}
              </p>
              <p className="text-[11px] text-teal-700 mt-1 font-medium">M-PESA Instant Pay Ready</p>
            </div>
          </div>

          {/* Next Appointment Card & Fast Telemedicine Launcher */}
          {appointments.length > 0 && (
            <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 shadow-xl shadow-slate-200/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <CalendarCheck className="w-4 h-4 text-teal-600" />
                  <span>Next Scheduled Hospital Appointment</span>
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  appointments[0].type === 'Telemedicine' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}>
                  {appointments[0].type} Consultation
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/40 backdrop-blur-md p-5 rounded-2xl border border-white/80">
                <div>
                  <span className="text-slate-400 text-xs block font-medium">Specialist Clinician</span>
                  <strong className="text-slate-900 text-sm font-semibold">{appointments[0].doctorName}</strong>
                  <p className="text-xs text-slate-500">{appointments[0].departmentName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block font-medium">Date & Time Slot</span>
                  <strong className="text-slate-900 text-sm">{appointments[0].appointmentDate} at {appointments[0].appointmentTime}</strong>
                  <p className="text-xs text-teal-700 font-medium">Payment KES {appointments[0].consultationFeeKES.toLocaleString()} Verified ({appointments[0].mpesaReceipt})</p>
                </div>
                <div className="flex items-center md:justify-end">
                  {appointments[0].type === 'Telemedicine' ? (
                    <button
                      onClick={() => setActiveTelemedicineApt(appointments[0])}
                      className="w-full md:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Video Consultation</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('queue')}
                      className="w-full md:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer hover:scale-[1.02]"
                    >
                      <Clock className="w-4 h-4 text-teal-400" />
                      <span>View Department Queue</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Grid - Frosted Glass Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Action 1: Book specialist */}
            <div 
              onClick={() => setActiveTab('book')}
              className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/80 hover:bg-white/80 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/10 transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3.5 border border-teal-100 group-hover:scale-110 transition-transform shadow-xs">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">Book a Specialized Clinic</h4>
              <p className="text-xs text-slate-600 mt-1">Select from Pediatrics, Cardiology, Orthopedics, Ob/Gyn, OPD & pay via M-PESA.</p>
              <span className="text-xs font-semibold text-teal-700 mt-3.5 inline-flex items-center space-x-1">
                <span>Start Booking</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Action 2: View EMR */}
            <div 
              onClick={() => setActiveTab('emr')}
              className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/80 hover:bg-white/80 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10 transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mb-3.5 border border-sky-100 group-hover:scale-110 transition-transform shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-700 transition-colors">My Medical History & Labs</h4>
              <p className="text-xs text-slate-600 mt-1">Access diagnoses, lab blood counts, chest X-rays, and download official medical reports.</p>
              <span className="text-xs font-semibold text-sky-700 mt-3.5 inline-flex items-center space-x-1">
                <span>Open Records</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Action 3: AI Assistant */}
            <div 
              onClick={() => setActiveTab('ai_assistant')}
              className="bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-white/80 hover:bg-white/80 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/10 transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform shadow-lg shadow-teal-500/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors">TERRA-AI Health Assistant</h4>
              <p className="text-xs text-slate-600 mt-1">Get non-diagnostic triage guidance, clarify symptoms, and understand lab test results.</p>
              <span className="text-xs font-semibold text-teal-700 mt-3.5 inline-flex items-center space-x-1">
                <span>Ask AI Assistant</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>

          </div>

          {/* Live Hospital Queue Snapshot */}
          <div className="bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/70 p-6 shadow-sm shadow-slate-200/40">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Live Hospital Department Queue & Estimated Waiting Times</h3>
                <p className="text-xs text-slate-500">Real-time status updated across Nairobi Central Hospital wings</p>
              </div>
              <button 
                onClick={() => setActiveTab('queue')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800"
              >
                View All Departments &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {(departments || []).slice(0, 4).map((d) => (
                <div key={d.id} className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/80 shadow-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-xs text-slate-800">{d.name}</span>
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-700 font-mono text-[10px] font-bold rounded-md border border-teal-100">
                      {d.code}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>In Queue: <strong className="text-slate-800">{d.currentQueueLength} patients</strong></span>
                    <span>Wait: <strong className="text-teal-700 font-bold">~{d.avgWaitTimeMinutes} mins</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 2: BOOK DOCTOR ================= */}
      {activeTab === 'book' && (
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 sm:p-8 shadow-xl shadow-slate-200/40 max-w-4xl mx-auto">
          
          <div className="border-b border-slate-200/60 pb-4 mb-6">
            <h3 className="text-lg font-bold text-slate-900">Book Doctor Appointment with M-PESA Payment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your required department to find matching certified doctors. All Sunday clinic slots are closed.
            </p>
          </div>

          {bookingError && (
            <div className="mb-5 bg-rose-50/80 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-center space-x-2.5 backdrop-blur-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          <form onSubmit={handleInitiateBookingPayment} className="space-y-6">
            
            {/* Step 1: Select Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                1. Select Hospital Department / Specialty *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {departments.filter(d => d.category === 'Clinical' || d.category === 'Surgical' || d.category === 'Therapeutic').map((dept) => {
                  const isSelected = selectedDeptId === dept.id;
                  return (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => {
                        setSelectedDeptId(dept.id);
                        setSelectedDoctorId(''); // reset doctor when department changes
                      }}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-teal-600 bg-teal-50/90 text-teal-900 ring-2 ring-teal-500/25 shadow-sm' 
                          : 'border-white/80 hover:border-slate-300 bg-white/60 hover:bg-white text-slate-700'
                      }`}
                    >
                      <span className="font-bold text-xs block truncate">{dept.name}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">Fee: KES {dept.consultationFeeKES.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Matching Doctor */}
            {selectedDeptId && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  2. Choose Doctor in {selectedDept?.name} *
                </label>
                {filteredDoctors.length === 0 ? (
                  <div className="p-5 bg-white/50 rounded-2xl border border-white text-xs text-slate-500 text-center">
                    No individual doctors listed for this clinic. Please consult General OPD or triage.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredDoctors.map((doc) => {
                      const isSelected = selectedDoctorId === doc.id;
                      return (
                        <div
                          key={doc.id}
                          onClick={() => setSelectedDoctorId(doc.id)}
                          className={`p-4 rounded-2xl border flex items-start space-x-3.5 cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-500/25 shadow-sm' 
                              : 'border-white/80 hover:border-slate-300 bg-white/60 hover:bg-white'
                          }`}
                        >
                          <img 
                            src={doc.avatar} 
                            alt={doc.name} 
                            className="w-12 h-12 rounded-2xl object-cover border border-white shadow-xs flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-slate-900">{doc.name}</h4>
                              <span className="text-[11px] font-bold text-teal-700">KES {doc.consultationFeeKES.toLocaleString()}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 truncate">{doc.title}</p>
                            <p className="text-[10px] text-slate-400 mt-1">Days: {doc.availableDays.join(', ')} (Sundays Closed)</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Consultation Mode & Date/Time */}
            {selectedDoctorId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    3. Consultation Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConsultationType('In-Person')}
                      className={`p-3.5 rounded-2xl border text-center font-semibold text-xs transition-all ${
                        consultationType === 'In-Person' 
                          ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-500/20 shadow-xs' 
                          : 'border-white/80 bg-white/60 hover:bg-white text-slate-700'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                      <span>In-Person Hospital Visit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultationType('Telemedicine')}
                      className={`p-3.5 rounded-2xl border text-center font-semibold text-xs transition-all ${
                        consultationType === 'Telemedicine' 
                          ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20 shadow-xs' 
                          : 'border-white/80 bg-white/60 hover:bg-white text-slate-700'
                      }`}
                    >
                      <Video className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                      <span>Virtual Video Consultation</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    4. Select Date & Slot (Mon - Sat Only) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="p-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden"
                    />
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="p-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden"
                    >
                      {['08:30 AM', '09:30 AM', '10:30 AM', '11:30 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Sundays are strictly closed for outpatient services.</p>
                </div>
              </div>
            )}

            {/* Step 4: Reason for Consultation */}
            {selectedDoctorId && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  5. Reason for Consultation & Symptoms
                </label>
                <textarea
                  rows={2}
                  value={visitReason}
                  onChange={(e) => setVisitReason(e.target.value)}
                  placeholder="Describe your current symptoms, medical concerns, or review reasons..."
                  className="w-full p-3.5 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden"
                />
              </div>
            )}

            {/* Step 5: Pay & Confirm Button */}
            {selectedDoctorId && (
              <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 block">Total Consultation Fee:</span>
                  <span className="text-xl font-bold text-teal-700">KES {selectedDoctor?.consultationFeeKES.toLocaleString()}</span>
                  <span className="text-xs text-slate-500 block">Payable via Integrated Safaricom M-PESA STK Push</span>
                </div>

                <button
                  type="submit"
                  disabled={isBookingSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
                >
                  {isBookingSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Confirming Booking...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay KES {selectedDoctor?.consultationFeeKES.toLocaleString()} & Confirm Booking</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

          </form>

        </div>
      )}

      {/* ================= TAB 3: MY APPOINTMENTS ================= */}
      {activeTab === 'appointments' && (
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 shadow-xl shadow-slate-200/40 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">My Hospital Appointments</h3>
              <p className="text-xs text-slate-500">Track booked consultations, attend video visits, or reschedule.</p>
            </div>
            <button
              onClick={() => setActiveTab('book')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md shadow-teal-500/20 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book New</span>
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No appointments found. Click "Book New" to schedule a doctor consultation.
            </div>
          ) : (
            <div className="divide-y divide-white/80">
              {appointments.map((apt) => (
                <div key={apt.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/40 backdrop-blur-sm p-4 rounded-2xl mb-2 border border-white/60">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{apt.doctorName}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        apt.type === 'Telemedicine' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-teal-50 text-teal-700 border border-teal-200'
                      }`}>
                        {apt.type}
                      </span>
                      <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 font-semibold rounded-full text-[10px]">
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{apt.departmentName} • {apt.reason}</p>
                    <p className="text-xs font-mono text-slate-700">
                      📅 Date: <strong>{apt.appointmentDate}</strong> at <strong>{apt.appointmentTime}</strong> • Fee: <strong>KES {apt.consultationFeeKES.toLocaleString()}</strong> (Paid - M-PESA {apt.mpesaReceipt})
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {apt.type === 'Telemedicine' && (
                      <button
                        onClick={() => setActiveTelemedicineApt(apt)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Start Video Call</span>
                      </button>
                    )}
                    {apt.status === 'Booked' && (
                      <button
                        onClick={() => onCancelAppointment(apt.id)}
                        className="px-3.5 py-2 bg-white/80 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: ELECTRONIC MEDICAL RECORDS (EMR) ================= */}
      {activeTab === 'emr' && (
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 shadow-xl shadow-slate-200/40 space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-3 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Complete Electronic Health Record (EHR)</h3>
              <p className="text-xs text-slate-500">Verified clinical notes, diagnoses, laboratory test results, X-rays, and prescriptions.</p>
            </div>
            <button
              onClick={() => {
                setReportModalData({
                  title: 'Comprehensive Patient Medical Summary',
                  type: 'medical_report',
                  encounter: encounters[0]
                });
                setReportModalOpen(true);
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Download Medical Summary (PDF)</span>
            </button>
          </div>

          {/* EMR Subtabs */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-200/60 pb-2 text-xs font-semibold">
            {[
              { id: 'timeline', label: `Unified Health Wallet Timeline` },
              { id: 'visits', label: `Clinical Encounters (${encounters.length})` },
              { id: 'prescriptions', label: `Prescriptions & Pharmacy (${prescriptions.length})` },
              { id: 'labs', label: `Laboratory Results (${labOrders.length})` },
              { id: 'radiology', label: `Radiology & Imaging (${radiologyOrders.length})` },
              { id: 'allergies', label: 'Allergies & Chronic Conditions' },
              { id: 'immunizations', label: `Immunization History (${immunizations.length})` }
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setEmrSubtab(sub.id as any)}
                className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  emrSubtab === sub.id ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20 font-bold' : 'bg-white/60 text-slate-600 hover:bg-white border border-white/60'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Subtab: Unified Health Wallet Timeline */}
          {emrSubtab === 'timeline' && (
            <HealthWalletTimeline
              patient={patient}
              encounters={encounters}
              prescriptions={prescriptions}
              labOrders={labOrders}
              radiologyOrders={radiologyOrders}
              immunizations={immunizations}
              invoices={invoices}
              onViewReport={(data) => {
                setReportModalData(data);
                setReportModalOpen(true);
              }}
              onOpenAutoScheduler={() => setIsAutoSchedulerOpen(true)}
            />
          )}

          {/* Subtab: Visits / Encounters */}
          {emrSubtab === 'visits' && (
            <div className="space-y-4">
              {encounters.map((enc) => (
                <div key={enc.id} className="bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{enc.doctorName}</span>
                      <span className="text-xs text-slate-500"> • {enc.departmentName} ({enc.visitType})</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                      <span className="text-xs font-mono text-slate-600 font-semibold">{enc.visitDate}</span>
                      <button
                        onClick={() => {
                          setReportModalData({
                            title: `Encounter Report - ${enc.visitDate}`,
                            type: 'medical_report',
                            encounter: enc
                          });
                          setReportModalOpen(true);
                        }}
                        className="p-1.5 text-slate-500 hover:text-slate-900 bg-white/80 rounded-lg border border-slate-200"
                        title="Print this visit report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px] bg-white/80 p-3 rounded-xl border border-slate-200/60">
                    <div>BP: <strong className="text-slate-900">{enc.vitals.bloodPressureSystolic}/{enc.vitals.bloodPressureDiastolic} mmHg</strong></div>
                    <div>HR: <strong className="text-slate-900">{enc.vitals.heartRateBpm} bpm</strong></div>
                    <div>SpO2: <strong className="text-slate-900">{enc.vitals.oxygenSaturationPercent}%</strong></div>
                    <div>Temp: <strong className="text-slate-900">{enc.vitals.temperatureCelsius}°C</strong></div>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="text-slate-700"><strong className="text-slate-900">Chief Complaint:</strong> {enc.chiefComplaint}</p>
                    <p className="text-slate-700"><strong className="text-slate-900">Clinical Diagnoses:</strong> {(enc.diagnoses || []).map(d => `${d.code} - ${d.name}`).join('; ') || 'None recorded'}</p>
                    <p className="text-slate-700"><strong className="text-slate-900">Treatment Plan:</strong> {enc.treatmentPlan}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtab: Prescriptions */}
          {emrSubtab === 'prescriptions' && (
            <div className="space-y-4">
              {(prescriptions || []).map((rx) => (
                <div key={rx.id} className="bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <div>
                      <span className="font-bold text-xs text-slate-900">Prescription #{rx.id}</span>
                      <span className="text-xs text-slate-500"> • Prescribed by {rx.doctorName} on {rx.prescribedDate}</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-[10px] font-bold">
                      {rx.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(rx.medications || []).map((med, idx) => (
                      <div key={idx} className="bg-white/80 p-3.5 rounded-xl border border-slate-200/60 text-xs flex justify-between items-start">
                        <div>
                          <strong className="text-slate-900 font-bold block">{med.drugName}</strong>
                          <p className="text-slate-600 mt-0.5">{med.dosage} • {med.frequency} for {med.duration} ({med.route})</p>
                          <p className="text-slate-500 italic mt-0.5">Instructions: {med.instructions}</p>
                          {med.batchNumber && (
                            <span className="text-[10px] font-mono text-teal-700 block mt-1">Dispensed Batch: {med.batchNumber}</span>
                          )}
                        </div>
                        <span className="font-bold font-mono text-slate-900">KES {med.priceKES.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 pt-1">
                    <span>Dispensed by: <strong>{rx.dispensedBy || 'Central Pharmacy'}</strong></span>
                    <span>Total: <strong className="text-slate-900 font-mono">KES {rx.totalPriceKES.toLocaleString()}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtab: Labs */}
          {emrSubtab === 'labs' && (
            <div className="space-y-4">
              {(labOrders || []).map((lab) => (
                <div key={lab.id} className="bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <div>
                      <span className="font-bold text-xs text-slate-900">{lab.testName}</span>
                      <span className="text-xs text-slate-500"> ({lab.testCategory}) • Ordered by {lab.doctorName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-[10px] font-bold">
                        {lab.status}
                      </span>
                      {lab.results && lab.results.length > 0 && (
                        <button
                          onClick={() => {
                            setReportModalData({
                              title: `Laboratory Certificate - ${lab.testName}`,
                              type: 'lab_report',
                              labOrder: lab
                            });
                            setReportModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 bg-white/80 rounded-lg border border-slate-200"
                          title="Print official lab report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {lab.results && lab.results.length > 0 ? (
                    <div className="bg-white/80 rounded-xl border border-slate-200/60 overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3.5">Parameter</th>
                            <th className="py-2.5 px-3.5">Result</th>
                            <th className="py-2.5 px-3.5">Unit</th>
                            <th className="py-2.5 px-3.5">Ref Range</th>
                            <th className="py-2.5 px-3.5 text-right">Flag</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                          {(lab.results || []).map((r, i) => (
                            <tr key={i}>
                              <td className="py-2 px-3.5 font-sans text-slate-800 font-medium">{r.parameter}</td>
                              <td className="py-2 px-3.5 font-bold text-slate-900">{r.value}</td>
                              <td className="py-2 px-3.5 text-slate-500">{r.unit}</td>
                              <td className="py-2 px-3.5 text-slate-500">{r.referenceRange}</td>
                              <td className="py-2 px-3.5 text-right font-sans">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  r.flag === 'Normal' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}>
                                  {r.flag}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Sample collected and in processing at central laboratory.</p>
                  )}

                  {lab.technicianNotes && (
                    <p className="text-xs text-slate-600 italic bg-white/70 p-2.5 rounded-xl border border-slate-200">
                      <strong>Technologist Note:</strong> {lab.technicianNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Subtab: Radiology */}
          {emrSubtab === 'radiology' && (
            <div className="space-y-4">
              {(radiologyOrders || []).map((rad) => (
                <div key={rad.id} className="bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl p-5 space-y-3 shadow-xs">
                  <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                    <div>
                      <span className="font-bold text-xs text-slate-900">{rad.modality} - {rad.bodyPart}</span>
                      <span className="text-xs text-slate-500"> • Ordered by {rad.doctorName}</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold">
                      {rad.status}
                    </span>
                  </div>

                  {rad.findings && (
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong className="text-slate-900 block mb-0.5">Radiological Findings:</strong>
                        <p className="text-slate-700 bg-white/80 p-3 rounded-xl border border-slate-200 leading-relaxed">{rad.findings}</p>
                      </div>
                      <div>
                        <strong className="text-slate-900 block mb-0.5">Impression:</strong>
                        <p className="text-teal-900 bg-teal-50 p-3 rounded-xl border border-teal-200 font-medium">{rad.impression}</p>
                      </div>
                    </div>
                  )}

                  {rad.imageUrl && (
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-slate-700 block mb-1.5">Digitized Medical Imaging Scan:</span>
                      <img 
                        src={rad.imageUrl} 
                        alt={rad.bodyPart} 
                        className="w-full max-w-sm h-48 object-cover rounded-2xl border border-white shadow-sm"
                      />
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 pt-1">
                    <span>Reporting Radiologist: <strong>{rad.radiologistName || 'Dr. Miriam Wangari, MMed (Rad)'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subtab: Allergies */}
          {emrSubtab === 'allergies' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-5 backdrop-blur-sm">
                <h4 className="font-bold text-rose-900 text-xs flex items-center space-x-1.5 mb-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Recorded Drug & Environmental Allergies</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-rose-800">
                  {(patient?.allergies || []).map((all, i) => (
                    <li key={i} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{all}</span>
                    </li>
                  ))}
                  {(!patient?.allergies || patient.allergies.length === 0) && (
                    <li className="text-slate-500 italic">No known drug or environmental allergies recorded.</li>
                  )}
                </ul>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 backdrop-blur-sm">
                <h4 className="font-bold text-amber-900 text-xs flex items-center space-x-1.5 mb-2.5">
                  <HeartPulse className="w-4 h-4 text-amber-600" />
                  <span>Documented Chronic Conditions</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-800">
                  {(patient?.chronicConditions || []).map((cond, i) => (
                    <li key={i} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{cond}</span>
                    </li>
                  ))}
                  {(!patient?.chronicConditions || patient.chronicConditions.length === 0) && (
                    <li className="text-slate-500 italic">No chronic medical conditions documented.</li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Subtab: Immunizations */}
          {emrSubtab === 'immunizations' && (
            <div className="space-y-3">
              <div className="border border-slate-200/70 bg-white/80 rounded-2xl overflow-hidden text-xs shadow-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3.5">Vaccine Name</th>
                      <th className="py-2.5 px-3.5">Target Disease</th>
                      <th className="py-2.5 px-3.5">Dose #</th>
                      <th className="py-2.5 px-3.5">Administered Date</th>
                      <th className="py-2.5 px-3.5">Facility</th>
                      <th className="py-2.5 px-3.5 text-right">Batch #</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(immunizations || []).map((imm) => (
                      <tr key={imm.id}>
                        <td className="py-2.5 px-3.5 font-semibold text-slate-900">{imm.vaccineName}</td>
                        <td className="py-2.5 px-3.5 text-slate-600">{imm.targetDisease}</td>
                        <td className="py-2.5 px-3.5 font-mono">{imm.doseNumber}</td>
                        <td className="py-2.5 px-3.5 font-mono">{imm.dateAdministered}</td>
                        <td className="py-2.5 px-3.5 text-slate-600">{imm.facility}</td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-700 text-right">{imm.batchNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 5: DEPARTMENT QUEUE & ESTIMATED WAITING TIMES ================= */}
      {activeTab === 'queue' && (
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 shadow-xl shadow-slate-200/40 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-3 gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Department Queue & Waiting Time Monitor</h3>
              <p className="text-xs text-slate-500">Live operational telemetry across all hospital departments in Nairobi County.</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search department..."
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments
              .filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase()) || d.code.toLowerCase().includes(deptSearch.toLowerCase()))
              .map((dept) => (
                <div key={dept.id} className="p-5 rounded-2xl border border-white/80 bg-white/50 backdrop-blur-md hover:bg-white hover:shadow-md hover:shadow-slate-200/50 transition-all space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-xs text-slate-900">{dept.name}</span>
                      <p className="text-[11px] text-slate-500">{dept.location}</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 font-mono text-[10px] font-bold rounded-md">
                      {dept.code}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Current Queue</span>
                      <strong className="text-slate-900 text-sm font-mono">{dept.currentQueueLength} Patients</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Est. Wait</span>
                      <strong className="text-teal-700 text-sm font-mono">~{dept.avgWaitTimeMinutes} Mins</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 pt-1">
                    Operating: <span className="font-medium text-slate-700">{dept.operatingHours}</span>
                  </p>
                </div>
              ))}
          </div>

        </div>
      )}

      {/* ================= TAB: INSURANCE INTEGRATION & PREMIUMS ================= */}
      {activeTab === 'insurance' && (
        <div className="space-y-6">
          
          {/* Top Insurance Overview Banner */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 shadow-xl shadow-slate-200/40 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Hospital Direct Insurance Integration</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  My Health Insurance Policies & Real-Time Coverage Approvals
                </h3>
                <p className="text-xs text-slate-600">
                  Link your SHA or private insurance card. Once approved by TERRALINKHEALTH billing desk, all eligible inpatient admissions, surgeries, and outpatient consultations are billed cashless.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3 py-1.5 rounded-xl bg-teal-600/10 text-teal-800 font-bold text-xs border border-teal-200 font-mono">
                  {policies.length} {policies.length === 1 ? 'Policy Linked' : 'Policies Linked'}
                </span>
              </div>
            </div>

            {/* Active Linked Policy Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {policies.map((pol) => {
                const inpatientAvailable = Math.max(0, pol.annualInpatientLimitKES - (pol.inpatientUsedKES || 0));
                const outpatientAvailable = Math.max(0, pol.annualOutpatientLimitKES - (pol.outpatientUsedKES || 0));
                const inpatientPct = Math.min(100, Math.round(((pol.inpatientUsedKES || 0) / pol.annualInpatientLimitKES) * 100));
                const outpatientPct = Math.min(100, Math.round(((pol.outpatientUsedKES || 0) / pol.annualOutpatientLimitKES) * 100));

                const isApproved = pol.status === 'Approved & Verified' || pol.status === 'Pre-Authorized';
                const isPending = pol.status === 'Pending Verification';

                return (
                  <div
                    key={pol.id}
                    className="p-6 rounded-3xl bg-white/75 border border-white shadow-md hover:shadow-lg transition-all space-y-4 relative overflow-hidden"
                  >
                    {/* Top Row: Provider & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                          {pol.providerCode}
                        </span>
                        <h4 className="text-base font-bold text-slate-900">{pol.providerName}</h4>
                        <p className="text-xs text-slate-600 font-medium">{pol.planTier}</p>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                          isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {pol.status}
                      </span>
                    </div>

                    {/* Member & Policy Identifiers */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Policy Number</span>
                        <strong className="font-mono text-slate-900">{pol.policyNumber}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Member Number</span>
                        <strong className="font-mono text-slate-900">{pol.memberNumber}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Principal / Relation</span>
                        <strong className="text-slate-900 truncate block">{pol.principalMemberName} ({pol.relationshipToPrincipal})</strong>
                      </div>
                    </div>

                    {/* Premiums Summary */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs">
                      <div>
                        <span className="text-[10px] text-teal-800 font-medium block">Monthly Premium</span>
                        <strong className="text-slate-900 font-mono text-sm">KES {pol.monthlyPremiumKES.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-teal-800 font-medium block">Annual Premium</span>
                        <strong className="text-slate-900 font-mono text-sm">KES {pol.annualPremiumKES.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-teal-800 font-medium block">Visit Co-Pay</span>
                        <strong className="text-teal-900 font-mono text-sm">
                          {pol.copayKES > 0 ? `KES ${pol.copayKES}` : 'Zero Co-pay'}
                        </strong>
                      </div>
                    </div>

                    {/* Coverage Limit Utilization Bars */}
                    <div className="space-y-3 pt-1">
                      {/* Inpatient Limit */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">Inpatient Benefit Limit</span>
                          <span className="font-mono text-slate-900">
                            Available: <strong className="text-emerald-700">KES {inpatientAvailable.toLocaleString()}</strong> / KES {pol.annualInpatientLimitKES.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${inpatientPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Outpatient Limit */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-700">Outpatient Benefit Limit</span>
                          <span className="font-mono text-slate-900">
                            Available: <strong className="text-teal-700">KES {outpatientAvailable.toLocaleString()}</strong> / KES {pol.annualOutpatientLimitKES.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className="bg-teal-500 h-full rounded-full transition-all"
                            style={{ width: `${outpatientPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pre-Authorization Code if present */}
                    {pol.preAuthCode && (
                      <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span>Hospital Pre-Auth Granted: {pol.preAuthCode}</span>
                          </span>
                          <span className="font-mono">KES {(pol.preAuthAmountKES || 0).toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] text-blue-800">
                          Authorized for: {pol.preAuthProcedure || 'Inpatient Admission & Specialized Surgery'}
                        </p>
                      </div>
                    )}

                    {/* Approval Footnote */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Valid Thru: <strong className="text-slate-700 font-mono">{pol.expiryDate}</strong></span>
                      {pol.verifiedBy ? (
                        <span className="text-emerald-700 font-medium flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved by: {pol.verifiedBy}</span>
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium">Awaiting Billing Desk Verification</span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to Link / Register New Insurance Card */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 shadow-xl shadow-slate-200/40 space-y-5">
            <div className="border-b border-slate-200/60 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Link an Additional Insurance Policy / NHIF-SHA Scheme
              </h3>
              <p className="text-xs text-slate-500">
                Enter your card details below. The hospital billing officer will approve the policy for cashless visits.
              </p>
            </div>

            {policySubmitSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{policySubmitSuccess}</span>
              </div>
            )}

            {policySubmitError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{policySubmitError}</span>
              </div>
            )}

            <form onSubmit={handleLinkInsurancePolicy} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Provider Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Insurance Underwriter</label>
                <select
                  value={newPolicyProviderCode}
                  onChange={(e) => {
                    setNewPolicyProviderCode(e.target.value);
                    const prov = providers.find(p => p.providerCode === e.target.value);
                    if (prov && prov.planTiers[0]) {
                      setNewPolicyTierName(prov.planTiers[0].tierName);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {providers.map(p => (
                    <option key={p.providerCode} value={p.providerCode}>
                      {p.providerName} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tier Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Scheme Tier</label>
                <select
                  value={newPolicyTierName}
                  onChange={(e) => setNewPolicyTierName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {providers
                    .find(p => p.providerCode === newPolicyProviderCode)
                    ?.planTiers.map(t => (
                      <option key={t.tierCode} value={t.tierName}>
                        {t.tierName}
                      </option>
                    ))}
                </select>
              </div>

              {/* Policy Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Policy / Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. POL-SHA-992019"
                  value={newPolicyNumber}
                  onChange={(e) => setNewPolicyNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold font-mono text-slate-800 shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Member ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Member ID / National ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MEM-48201"
                  value={newMemberNumber}
                  onChange={(e) => setNewMemberNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold font-mono text-slate-800 shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Principal Member */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Principal Member Name</label>
                <input
                  type="text"
                  value={newPrincipalName}
                  onChange={(e) => setNewPrincipalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Relationship */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Relationship to Principal</label>
                <select
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="Self">Self (Principal)</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child / Dependent">Child / Dependent</option>
                  <option value="Parent">Parent</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 lg:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingPolicy}
                  className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-teal-500/25 flex items-center space-x-2 transition-all cursor-pointer"
                >
                  {isSubmittingPolicy ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting to Billing Desk...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Policy for Approval</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

      {/* ================= TAB 6: BILLING & M-PESA PAYMENTS ================= */}
      {activeTab === 'billing' && (
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 shadow-xl shadow-slate-200/40 space-y-5">
          
          <div className="border-b border-slate-200/60 pb-3">
            <h3 className="text-base font-bold text-slate-900">Hospital Invoices & Online M-PESA Settlement (KES)</h3>
            <p className="text-xs text-slate-500">All services, pharmacy prescriptions, and consultations are billed in Kenyan Shillings.</p>
          </div>

          <div className="space-y-3">
            {(invoices || []).map((inv) => (
              <div key={inv.id} className="p-5 rounded-2xl border border-white/80 bg-white/50 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs font-mono text-slate-900">{inv.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.status === 'Paid' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {inv.status}
                    </span>
                    <span className="text-xs text-slate-500">Date: {inv.date}</span>
                  </div>
                  <p className="text-xs text-slate-700">
                    Items: {(inv.items || []).map(it => it.description).join(', ') || 'General consultation & clinical review'}
                  </p>
                  <p className="text-xs font-mono text-slate-600">
                    Total: <strong>KES {inv.totalKES.toLocaleString()}</strong> • Paid: <strong>KES {inv.paidAmountKES.toLocaleString()}</strong> • Balance: <strong className="text-rose-600 font-bold">KES {inv.balanceKES.toLocaleString()}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setReportModalData({
                        title: `Official Invoice - ${inv.id}`,
                        type: 'invoice',
                        invoice: inv
                      });
                      setReportModalOpen(true);
                    }}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-xs flex items-center space-x-1 border border-slate-200 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Print</span>
                  </button>

                  {inv.balanceKES > 0 && (
                    <button
                      onClick={() => {
                        setActiveInvoiceToPay(inv.id);
                        setMpesaAmount(inv.balanceKES);
                        setMpesaTitle(`Settle Hospital Invoice #${inv.id}`);
                        setMpesaRef(inv.id);
                        setMpesaTargetAction('invoice');
                        setMpesaModalOpen(true);
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-teal-500/25 flex items-center space-x-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay KES {inv.balanceKES.toLocaleString()} via M-PESA</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Payment History Log */}
          <div className="pt-4 border-t border-slate-200/60">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
              M-PESA Transaction Receipts Archive
            </h4>
            <div className="border border-slate-200/70 bg-white/80 rounded-2xl overflow-hidden text-xs shadow-xs">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3.5 font-sans">M-PESA Receipt</th>
                    <th className="py-2.5 px-3.5 font-sans">Date & Time</th>
                    <th className="py-2.5 px-3.5 font-sans">Reference / Service</th>
                    <th className="py-2.5 px-3.5 font-sans text-right">Amount (KES)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(mpesaPayments || []).map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3.5 font-bold text-teal-800">{p.mpesaReceiptNumber}</td>
                      <td className="py-2.5 px-3.5 text-slate-600">{p.transactionDate}</td>
                      <td className="py-2.5 px-3.5 text-slate-700 font-sans">{p.reference} ({p.serviceType})</td>
                      <td className="py-2.5 px-3.5 text-slate-900 font-bold text-right">KES {p.amountKES.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 7: TERRA AI HEALTH ASSISTANT ================= */}
      {activeTab === 'ai_assistant' && (
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 flex flex-col h-[650px] overflow-hidden">
          
          {/* AI Header */}
          <div className="p-4.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">TERRA-AI Health Companion & Triage Guidance</h3>
                <p className="text-[11px] text-teal-300">Powered by Gemini 3.7 Flash • Non-diagnostic clinical advisory</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-400/30">
              Kenya Healthcare Ready
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white/30 backdrop-blur-sm text-xs">
            {aiMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl p-4.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none shadow-md shadow-teal-600/20'
                      : 'bg-white/80 border border-white/90 text-slate-800 rounded-bl-none shadow-xs backdrop-blur-md'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
            {aiLoading && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white/80 p-3 rounded-2xl border border-white/90 w-fit backdrop-blur-md">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                <span>TERRA-AI is reviewing medical guidance...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-3 bg-white/50 backdrop-blur-md border-t border-slate-200/60 flex overflow-x-auto gap-2 text-[11px]">
            {[
              "Trace my complete hospital records & lab results",
              "Help me achieve my personalized health goals",
              "What does my Full Hemogram test mean?",
              "Explain my active prescriptions & instructions",
              "Child has mild cough and fever. Which clinic should I book?",
              "How to prepare for Fasting Lipid Profile test?"
            ].map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAiInput(p)}
                className="px-3.5 py-1.5 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 rounded-xl border border-white shadow-xs whitespace-nowrap transition-colors cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendAiMessage} className="p-3.5 bg-white/70 backdrop-blur-md border-t border-slate-200/60 flex space-x-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask TERRA-AI a health question or symptom advice..."
              className="flex-1 px-4.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              type="submit"
              disabled={aiLoading || !aiInput.trim()}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-teal-500/20 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

        </div>
      )}

      {/* ================= TAB 8: CUSTOMER CARE HELPDESK CHAT ================= */}
      {activeTab === 'customer_care' && (
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white shadow-xl shadow-slate-200/40 flex flex-col h-[600px] overflow-hidden">
          
          <div className="p-4.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Hospital Customer Care & Operator Desk</h3>
                <p className="text-[11px] text-slate-300">Live support for admissions, billing, ambulance, or insurance inquiries</p>
              </div>
            </div>
            <div className="text-right text-xs">
              <span className="text-teal-400 font-semibold block">● Operator Online</span>
              <span className="text-[10px] text-slate-400">Direct Line: 0713544101</span>
            </div>
          </div>

          <div className="flex-1 p-4.5 overflow-y-auto space-y-3 bg-white/30 backdrop-blur-sm text-xs">
            {careMessages.map((msg) => {
              const isPatient = msg.senderRole === 'patient' || msg.senderId === patient.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-3xl p-4 ${
                      isPatient 
                        ? 'bg-teal-600 text-white rounded-br-none shadow-md shadow-teal-600/20' 
                        : 'bg-white/80 border border-white/90 text-slate-800 rounded-bl-none shadow-xs backdrop-blur-md'
                    }`}
                  >
                    <span className="text-[10px] font-bold block mb-1 opacity-80">{msg.senderName}</span>
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendCareMessage} className="p-3.5 bg-white/70 backdrop-blur-md border-t border-slate-200/60 flex space-x-2">
            <input
              type="text"
              value={careInput}
              onChange={(e) => setCareInput(e.target.value)}
              placeholder="Type your message to the hospital care team..."
              className="flex-1 px-4.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              type="submit"
              disabled={loadingChat || !careInput.trim()}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-teal-500/20 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

        </div>
      )}

      {/* ================= TAB 9: PATIENT PROFILE ================= */}
      {activeTab === 'profile' && (
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 sm:p-8 shadow-xl shadow-slate-200/40 max-w-3xl mx-auto space-y-5">
          <div className="border-b border-slate-200/60 pb-3">
            <h3 className="text-base font-bold text-slate-900">Personal Patient Information & Next of Kin</h3>
            <p className="text-xs text-slate-500">Manage contact details, emergency contacts, and insurance scheme data.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Full Legal Name</label>
              <input
                type="text"
                disabled
                value={patient.name}
                className="w-full p-3 bg-white/40 border border-slate-200 rounded-2xl font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Kenyan National ID Number</label>
              <input
                type="text"
                disabled
                value={patient.nationalId}
                className="w-full p-3 bg-white/40 border border-slate-200 rounded-2xl font-mono text-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Phone Number (M-PESA)</label>
              <input
                type="text"
                value={patient.phone}
                onChange={(e) => onUpdatePatient({ ...patient, phone: e.target.value })}
                className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={patient.email}
                onChange={(e) => onUpdatePatient({ ...patient, email: e.target.value })}
                className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Date of Birth & Gender</label>
              <input
                type="text"
                disabled
                value={`${patient.dob} (${patient.gender})`}
                className="w-full p-3 bg-white/40 border border-slate-200 rounded-2xl font-medium text-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Residential Address / County</label>
              <input
                type="text"
                value={patient.address}
                onChange={(e) => onUpdatePatient({ ...patient, address: e.target.value })}
                className="w-full p-3 bg-white/80 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="md:col-span-2 pt-3 border-t border-slate-200/60">
              <h4 className="font-bold text-slate-900 text-xs mb-2.5">Emergency Contact Person (Next of Kin)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Contact Name"
                  value={patient.emergencyContact?.name || ''}
                  onChange={(e) => onUpdatePatient({
                    ...patient,
                    emergencyContact: { ...patient.emergencyContact, name: e.target.value }
                  })}
                  className="p-3 bg-white/80 border border-slate-200 rounded-2xl text-xs text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g. Spouse / Sibling)"
                  value={patient.emergencyContact?.relationship || ''}
                  onChange={(e) => onUpdatePatient({
                    ...patient,
                    emergencyContact: { ...patient.emergencyContact, relationship: e.target.value }
                  })}
                  className="p-3 bg-white/80 border border-slate-200 rounded-2xl text-xs text-slate-800"
                />
                <input
                  type="tel"
                  placeholder="Emergency Phone"
                  value={patient.emergencyContact?.phone || ''}
                  onChange={(e) => onUpdatePatient({
                    ...patient,
                    emergencyContact: { ...patient.emergencyContact, phone: e.target.value }
                  })}
                  className="p-3 bg-white/80 border border-slate-200 rounded-2xl text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="button"
              onClick={() => alert('Patient profile updated successfully.')}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-semibold text-xs transition-all shadow-md shadow-teal-500/20 cursor-pointer hover:scale-[1.02]"
            >
              Save Profile Changes
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
