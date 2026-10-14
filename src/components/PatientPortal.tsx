import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutGrid,
  Calendar,
  FileText,
  CreditCard,
  Clock,
  Sparkles,
  Stethoscope,
  MessageSquare,
  User as UserIcon,
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Video,
  LogOut,
  Camera,
  Upload,
  Trash2,
  Phone,
  Search,
  Building2,
  ShieldCheck,
  Send,
  Loader2,
  Lock,
  Plus,
  Activity,
  Heart,
  HeartPulse,
  Receipt,
  Download,
  Check,
  XCircle,
  Eye,
  FileCheck2,
  ExternalLink,
  Shield,
  FilePlus2,
  Landmark,
  BadgePercent,
  CheckCircle
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
  calculateAge,
  PatientInsurancePolicy,
  InsuranceProviderPlan,
  HospitalServiceItem
} from '../types';
import {
  INITIAL_INSURANCE_PROVIDERS,
  INITIAL_INSURANCE_POLICIES,
  INITIAL_HOSPITAL_SERVICES
} from '../mockData';
import { MpesaModal } from './MpesaModal';
import { TelemedicineRoom } from './TelemedicineRoom';
import { ReportViewerModal } from './ReportViewerModal';

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
  onBookAppointment: (appointmentData: any) => Promise<void>;
  onCancelAppointment: (appointmentId: string) => void;
  onPayInvoice: (invoiceId: string, receipt: string) => void;
  onLogout?: () => void;
  onNavigateToHome?: () => void;
  initialTab?: 'dashboard' | 'services' | 'ai_assistant' | 'appointments' | 'records' | 'billing' | 'queue' | 'doctors' | 'messages' | 'profile';
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
  onBookAppointment,
  onCancelAppointment,
  onPayInvoice,
  onLogout,
  onNavigateToHome,
  initialTab = 'dashboard'
}) => {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'services' | 'ai_assistant' | 'appointments' | 'records' | 'billing' | 'queue' | 'doctors' | 'messages' | 'profile'
  >(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Healthcare Services Filter & Search
  const [servicesSearch, setServicesSearch] = useState<string>('');
  const [servicesCategory, setServicesCategory] = useState<string>('All');

  // Hamburger Menu Drawer State
  const [isHamburgerOpen, setIsHamburgerOpen] = useState<boolean>(false);

  // Profile Avatar Modal & Upload
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState<string>('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Telemedicine Room State
  const [activeTelemedicineApt, setActiveTelemedicineApt] = useState<Appointment | null>(null);

  // Report Viewer Modal State
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportModalData, setReportModalData] = useState<{
    title: string;
    type: 'medical_report' | 'lab_report' | 'invoice' | 'prescription' | 'radiology';
    encounter?: ClinicalEncounter;
    labOrder?: LabOrder;
    invoice?: Invoice;
    prescription?: Prescription;
    radiologyOrder?: RadiologyOrder;
  }>({ title: '', type: 'medical_report' });

  // M-PESA Modal State
  const [mpesaModalOpen, setMpesaModalOpen] = useState<boolean>(false);
  const [mpesaAmount, setMpesaAmount] = useState<number>(1500);
  const [mpesaTitle, setMpesaTitle] = useState<string>('Hospital Consultation Fee');
  const [mpesaRef, setMpesaRef] = useState<string>('');
  const [mpesaTargetAction, setMpesaTargetAction] = useState<'booking' | 'invoice'>('booking');
  const [activeInvoiceToPay, setActiveInvoiceToPay] = useState<string | null>(null);

  // Booking Form State
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(departments[0]?.id || 'dept-opd');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || 'doc-1');
  const [appointmentDate, setAppointmentDate] = useState<string>('2026-09-24');
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00 AM');
  const [consultationType, setConsultationType] = useState<'in_person' | 'telemedicine'>('in_person');
  const [visitReason, setVisitReason] = useState<string>('General Consultation');
  const [bookingError, setBookingError] = useState<string>('');
  const [isBookingSubmitting, setIsBookingSubmitting] = useState<boolean>(false);

  // Doctor Search Query for "Find a Doctor" tab
  const [doctorSearch, setDoctorSearch] = useState<string>('');
  const [doctorDeptFilter, setDoctorDeptFilter] = useState<string>('all');

  // Medical Records Search & Category Filter
  const [recordSearch, setRecordSearch] = useState<string>('');
  const [recordCategoryFilter, setRecordCategoryFilter] = useState<'all' | 'lab' | 'radiology' | 'pharmacy' | 'diagnosis'>('all');
  const [recordSubtab, setRecordSubtab] = useState<'visits' | 'prescriptions' | 'labs' | 'radiology' | 'immunizations'>('visits');

  // Billing & Payments Subtab ('invoices' | 'insurance')
  const [billingSubtab, setBillingSubtab] = useState<'invoices' | 'insurance'>('invoices');

  // Insurance State
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProviderPlan[]>(INITIAL_INSURANCE_PROVIDERS);
  const [insurancePolicies, setInsurancePolicies] = useState<PatientInsurancePolicy[]>(() => {
    return INITIAL_INSURANCE_POLICIES.filter(p => p.patientId === patient.id || p.patientId === 'pat-1');
  });
  const [selectedInsurerId, setSelectedInsurerId] = useState<string>(INITIAL_INSURANCE_PROVIDERS[0]?.id || 'ins-prov-sha');
  const [policyNumberInput, setPolicyNumberInput] = useState<string>('');
  const [memberNumberInput, setMemberNumberInput] = useState<string>('');
  const [principalNameInput, setPrincipalNameInput] = useState<string>(patient.name);
  const [relationshipInput, setRelationshipInput] = useState<'Self' | 'Spouse' | 'Child' | 'Parent' | 'Dependent'>('Self');
  const [nationalIdInput, setNationalIdInput] = useState<string>(patient.nationalId);
  const [phoneInput, setPhoneInput] = useState<string>(patient.phone);
  const [planTierInput, setPlanTierInput] = useState<string>('SHA Primary Care & Essential Benefit Package');
  const [isSubmittingInsurance, setIsSubmittingInsurance] = useState<boolean>(false);
  const [insuranceFeedback, setInsuranceFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showSubmitPolicyForm, setShowSubmitPolicyForm] = useState<boolean>(false);

  // Fetch live insurance policies and providers on mount
  useEffect(() => {
    fetch('/api/insurance/providers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setInsuranceProviders(data);
        }
      })
      .catch(() => {});

    fetch('/api/insurance/policies')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const patientPolicies = data.filter((p: PatientInsurancePolicy) => p.patientId === patient.id || p.patientId === 'pat-1');
          if (patientPolicies.length > 0) {
            setInsurancePolicies(patientPolicies);
          }
        }
      })
      .catch(() => {});
  }, [patient.id]);

  // AI Assistant Chat State
  const [aiMessages, setAiMessages] = useState<{ sender: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      sender: 'assistant',
      text: `Hello ${patient.name}! I am your AI Health Assistant at TERRALINK Health. How can I assist you with your health, medications, lab results, or appointments today?`,
      time: 'Just now'
    }
  ]);
  const [aiInput, setAiInput] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Customer Care Messages State
  const [messagesList, setMessagesList] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState({
    name: patient.name,
    phone: patient.phone,
    email: patient.email,
    nationalId: patient.nationalId,
    dob: patient.dob,
    gender: patient.gender,
    bloodGroup: patient.bloodGroup || 'O+',
    maritalStatus: patient.maritalStatus || 'Single',
    address: patient.address || 'Nairobi, Kenya',
    county: patient.county || 'Nairobi County',
    emergencyContactName: patient.emergencyContact?.name || '',
    emergencyContactPhone: patient.emergencyContact?.phone || '',
    shaNumber: patient.shaNumber || patient.insurancePolicyNumber || ''
  });

  // Calculate Monogram Initials
  const patientInitials = patient.name
    ? patient.name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'ER';

  // Calculate Pending Bills Total
  const pendingInvoices = invoices.filter(i => i.status !== 'Paid');
  const pendingBillsTotal = pendingInvoices.reduce((sum, inv) => sum + (inv.amountKES || 0), 0);
  const totalMedicalRecordsCount = encounters.length + prescriptions.length + labOrders.length + radiologyOrders.length + immunizations.length;

  // Next upcoming appointment date
  const upcomingAppointments = appointments
    .filter(a => a.status === 'Confirmed' || a.status === 'Requested')
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());
  const nextVisitDate = upcomingAppointments[0]?.appointmentDate
    ? new Date(upcomingAppointments[0].appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Jul 25';

  // Load chat messages on mount
  useEffect(() => {
    fetch('/api/chat/messages')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessagesList(data);
      })
      .catch(() => {});
  }, []);

  // Handle Avatar Image File Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Data = evt.target?.result as string;
      saveNewAvatar(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const saveNewAvatar = async (url: string) => {
    const updated: PatientProfile = { ...patient, avatar: url };
    onUpdatePatient(updated);
    try {
      localStorage.setItem('terralink_current_patient_profile', JSON.stringify(updated));
      await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setAvatarUploadSuccess('Profile photo updated successfully!');
      setIsAvatarModalOpen(false);
      setCustomAvatarUrl('');
      setTimeout(() => setAvatarUploadSuccess(''), 4000);
    } catch {
      setAvatarUploadSuccess('Photo saved locally!');
      setIsAvatarModalOpen(false);
      setTimeout(() => setAvatarUploadSuccess(''), 4000);
    }
  };

  const removeAvatar = async () => {
    const updated: PatientProfile = { ...patient, avatar: undefined };
    onUpdatePatient(updated);
    try {
      localStorage.setItem('terralink_current_patient_profile', JSON.stringify(updated));
      await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setIsAvatarModalOpen(false);
    } catch {}
  };

  // Avatar Component Renderer
  const renderPatientAvatar = (className = 'w-9 h-9 text-xs') => {
    if (patient.avatar) {
      return (
        <img
          src={patient.avatar}
          alt={patient.name}
          className={`${className} object-cover rounded-full border border-slate-200`}
        />
      );
    }
    return (
      <div
        className={`${className} rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center border border-slate-200 select-none`}
      >
        {patientInitials}
      </div>
    );
  };

  // Handle Booking Appointment M-Pesa Flow
  const handleInitiateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');

    const doc = doctors.find(d => d.id === selectedDoctorId);
    const dept = departments.find(d => d.id === selectedDeptId);
    const fee = doc?.consultationFeeKES || dept?.consultationFeeKES || 1500;

    setMpesaAmount(fee);
    setMpesaTitle(`${dept?.name || 'Clinic'} Consultation (${doc?.name || 'Doctor'})`);
    setMpesaRef(`APT-${Date.now().toString().slice(-5)}`);
    setMpesaTargetAction('booking');
    setMpesaModalOpen(true);
  };

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
          reason: visitReason,
          mpesaReceipt: receipt
        });
        setIsBookingSubmitting(false);
        setIsBookingOpen(false);
        setActiveTab('appointments');
      } catch (err: any) {
        setIsBookingSubmitting(false);
        setBookingError(err.message || 'Failed to complete booking.');
      }
    } else if (mpesaTargetAction === 'invoice' && activeInvoiceToPay) {
      onPayInvoice(activeInvoiceToPay, receipt);
      setActiveInvoiceToPay(null);
    }
  };

  // Handle AI Chat Send
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
            name: patient.name,
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
          text: data.reply || 'Guidance received. Please consult your physician for verification.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setAiMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I am here to help. For immediate medical emergencies in Kenya, please dial 0713544101 or visit the Accident & Emergency wing immediately.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle Customer Care Message Send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || sendingMessage) return;

    const text = messageInput.trim();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: patient.id,
      senderName: patient.name,
      senderRole: 'patient',
      text: text,
      timestamp: new Date().toISOString()
    };

    setMessagesList(prev => [...prev, newMsg]);
    setMessageInput('');
    setSendingMessage(true);

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
    } catch {} finally {
      setSendingMessage(false);
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PatientProfile = {
      ...patient,
      name: profileForm.name,
      phone: profileForm.phone,
      email: profileForm.email,
      nationalId: profileForm.nationalId,
      dob: profileForm.dob,
      gender: profileForm.gender,
      bloodGroup: profileForm.bloodGroup,
      maritalStatus: profileForm.maritalStatus as any,
      address: profileForm.address,
      county: profileForm.county,
      emergencyContact: {
        name: profileForm.emergencyContactName,
        phone: profileForm.emergencyContactPhone,
        relationship: 'Primary Contact'
      },
      shaNumber: profileForm.shaNumber
    };

    onUpdatePatient(updated);
    try {
      localStorage.setItem('terralink_current_patient_profile', JSON.stringify(updated));
      await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      setIsEditingProfile(false);
      alert('Profile details updated successfully!');
    } catch {
      setIsEditingProfile(false);
    }
  };

  // Filter Doctors for "Find a Doctor" tab
  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(doctorSearch.toLowerCase()) ||
      doc.departmentName.toLowerCase().includes(doctorSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (doctorDeptFilter === 'all') return true;
    return doc.departmentId === doctorDeptFilter;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#221815] flex flex-col">
      
      {/* Hidden file input for quick photo uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileUpload}
      />

      {/* ================= WHITE HEADER MATCHING IMAGE 1 ================= */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-3 flex items-center justify-between shadow-2xs">
        {/* Left: Hamburger Menu Button */}
        <button
          onClick={() => setIsHamburgerOpen(true)}
          className="p-1.5 -ml-1.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        {/* Center: "Patient Portal" */}
        <h1 className="text-base font-bold text-slate-900 tracking-tight select-none">
          Patient Portal
        </h1>

        {/* Right: Patient Profile Icon */}
        <button
          onClick={() => setActiveTab('profile')}
          className="cursor-pointer transition-transform hover:scale-105"
          title="My Profile"
        >
          {renderPatientAvatar('w-8 h-8 text-xs')}
        </button>
      </header>

      {/* ================= NAVIGATION DRAWER MATCHING REFERENCE SCREENSHOT ================= */}
      {isHamburgerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsHamburgerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Light Cream Drawer Container */}
          <div className="relative w-72 max-w-[80vw] bg-[#FAF8F5] border-r border-[#EAE5DC] h-full shadow-2xl flex flex-col z-10 text-[#221815] animate-in slide-in-from-left duration-200">
            
            {/* Drawer Header */}
            <div className="p-4 flex items-center justify-between border-b border-[#EAE5DC] bg-[#FAF8F5]">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C8232C] text-white flex items-center justify-center shadow-xs">
                  <Activity className="w-5 h-5 stroke-[2.4]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#221815] tracking-tight leading-tight">TERRALINK Health</h3>
                  <p className="text-[11px] text-[#C8232C] font-bold leading-tight">Patient Portal</p>
                </div>
              </div>

              <button
                onClick={() => setIsHamburgerOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hotline 24/7 banner strip */}
            <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-between shadow-2xs">
              <span className="text-[11px] font-semibold text-stone-500">Hotline 24/7:</span>
              <a 
                href="tel:0713544101" 
                className="text-xs font-bold text-[#8F261F] flex items-center gap-1 hover:underline"
              >
                <Phone className="w-3.5 h-3.5 text-[#C8232C]" />
                <span>0713544101</span>
              </a>
            </div>

            {/* Navigation List - Queue Status REMOVED per user instructions */}
            <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto text-xs font-medium">
              
              {/* 1. Dashboard */}
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-[#C8232C] font-bold border border-[#EAE5DC] shadow-xs'
                    : 'text-[#221815] hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <LayoutGrid className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#C8232C]' : 'text-stone-600'}`} />
                  <span>Dashboard</span>
                </div>
                {activeTab === 'dashboard' && <ChevronRight className="w-3.5 h-3.5 text-[#C8232C]" />}
              </button>

              {/* 2. Healthcare Services (Featured) */}
              <button
                onClick={() => {
                  setActiveTab('services');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-white text-[#C8232C] font-bold border border-[#EAE5DC] shadow-xs'
                    : 'text-[#221815] hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Heart className={`w-4 h-4 ${activeTab === 'services' ? 'text-[#C8232C]' : 'text-stone-600'}`} />
                  <span>Healthcare Services</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-1.5 py-0.5 bg-[#FDF1F1] text-[#C8232C] text-[9px] font-bold rounded-full">
                    FEATURED
                  </span>
                  {activeTab === 'services' && <ChevronRight className="w-3.5 h-3.5 text-[#C8232C]" />}
                </div>
              </button>

              {/* 2. AI Assistant */}
              <button
                onClick={() => {
                  setActiveTab('ai_assistant');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'ai_assistant'
                    ? 'bg-white text-[#C8232C] font-bold border border-[#EAE5DC] shadow-xs'
                    : 'text-[#221815] hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className={`w-4 h-4 ${activeTab === 'ai_assistant' ? 'text-[#C8232C]' : 'text-stone-600'}`} />
                  <span>AI Assistant</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-1.5 py-0.5 bg-[#FDF1F1] text-[#C8232C] text-[9px] font-bold rounded-full">
                    NEW
                  </span>
                  {activeTab === 'ai_assistant' && <ChevronRight className="w-3.5 h-3.5 text-[#C8232C]" />}
                </div>
              </button>

              {/* 3. Appointments */}
              <button
                onClick={() => {
                  setActiveTab('appointments');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'appointments'
                    ? 'bg-white text-[#C8232C] font-bold border border-[#EAE5DC] shadow-xs'
                    : 'text-[#221815] hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Calendar className={`w-4 h-4 ${activeTab === 'appointments' ? 'text-[#C8232C]' : 'text-stone-600'}`} />
                  <span>Appointments</span>
                </div>
                {activeTab === 'appointments' && <ChevronRight className="w-3.5 h-3.5 text-[#C8232C]" />}
              </button>

              {/* 4. Medical Records */}
              <button
                onClick={() => {
                  setActiveTab('records');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'records'
                    ? 'bg-white text-[#C8232C] font-bold border border-[#EAE5DC] shadow-xs'
                    : 'text-[#221815] hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className={`w-4 h-4 ${activeTab === 'records' ? 'text-[#C8232C]' : 'text-stone-600'}`} />
                  <span>Medical Records</span>
                </div>
                {activeTab === 'records' && <ChevronRight className="w-3.5 h-3.5 text-[#C8232C]" />}
              </button>

              {/* 5. Billing & Payments */}
              <button
                onClick={() => {
                  setActiveTab('billing');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'billing'
                    ? 'bg-white text-[#C8232C] font-bold border border-[#EAE5DC] shadow-xs'
                    : 'text-[#221815] hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className={`w-4 h-4 ${activeTab === 'billing' ? 'text-[#C8232C]' : 'text-stone-600'}`} />
                  <span>Billing &amp; Payments (KES)</span>
                </div>
                {activeTab === 'billing' && <ChevronRight className="w-3.5 h-3.5 text-[#C8232C]" />}
              </button>

              {/* 6. Find a Doctor */}
              <button
                onClick={() => {
                  setActiveTab('doctors');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'doctors'
                    ? 'bg-white text-[#C8232C] font-bold border border-[#EAE5DC] shadow-xs'
                    : 'text-[#221815] hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Stethoscope className={`w-4 h-4 ${activeTab === 'doctors' ? 'text-[#C8232C]' : 'text-stone-600'}`} />
                  <span>Find a Doctor</span>
                </div>
                {activeTab === 'doctors' && <ChevronRight className="w-3.5 h-3.5 text-[#C8232C]" />}
              </button>

              {/* 7. Messages */}
              <button
                onClick={() => {
                  setActiveTab('messages');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'messages'
                    ? 'bg-white text-[#C8232C] font-bold border border-[#EAE5DC] shadow-xs'
                    : 'text-[#221815] hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className={`w-4 h-4 ${activeTab === 'messages' ? 'text-[#C8232C]' : 'text-stone-600'}`} />
                  <span>Messages</span>
                </div>
                {activeTab === 'messages' && <ChevronRight className="w-3.5 h-3.5 text-[#C8232C]" />}
              </button>

              {/* 8. Profile */}
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-white text-[#C8232C] font-bold border border-[#EAE5DC] shadow-xs'
                    : 'text-[#221815] hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <UserIcon className={`w-4 h-4 ${activeTab === 'profile' ? 'text-[#C8232C]' : 'text-stone-600'}`} />
                  <span>Profile</span>
                </div>
                {activeTab === 'profile' && <ChevronRight className="w-3.5 h-3.5 text-[#C8232C]" />}
              </button>

            </div>

            {/* Bottom of Drawer: Patient Monogram & Logout */}
            <div className="p-3.5 border-t border-[#EAE5DC] bg-[#F5F1E8] flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#C8232C] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                  {patientInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#221815] truncate">{patient.name || 'Faith Chebet'}</p>
                  <p className="text-[10px] text-stone-500 font-medium">Patient</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {onNavigateToHome && (
                  <button
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      onNavigateToHome();
                    }}
                    title="Hospital Website"
                    className="p-1.5 rounded-xl text-stone-600 hover:text-black hover:bg-white/80 transition-colors cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsHamburgerOpen(false);
                    onLogout?.();
                  }}
                  title="Log Out"
                  className="p-1.5 rounded-xl text-[#C8232C] hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MAIN ACTIVE TAB CONTENT ================= */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 space-y-4">
        
        {/* ================= TAB 1: DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            
            {/* 1. Welcome Greeting Header */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#221815] tracking-tight">
                Welcome back, {patient.name || 'Faith Chebet'} 👋
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Your TERRALINK Health account is ready. Track your care and access services below.
              </p>
            </div>

            {/* 2. Overview Cards: Upcoming Appointments, Bills, Medical Records, Next Visit */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              
              {/* Card 1: Upcoming Appointments */}
              <div
                onClick={() => setActiveTab('appointments')}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/60 shadow-xs hover:border-[#C8232C]/40 hover:shadow-sm transition-all cursor-pointer space-y-3"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center">
                  <Calendar className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#221815] block leading-none">
                    {upcomingAppointments.length || 1}
                  </span>
                  <span className="text-xs text-stone-500 font-medium block mt-1.5">
                    Upcoming Appointments
                  </span>
                </div>
              </div>

              {/* Card 2: Pending Bills */}
              <div
                onClick={() => setActiveTab('billing')}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/60 shadow-xs hover:border-[#C8232C]/40 hover:shadow-sm transition-all cursor-pointer space-y-3"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center">
                  <CreditCard className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-lg sm:text-2xl font-extrabold text-[#221815] block leading-none">
                    KES {pendingBillsTotal > 0 ? pendingBillsTotal.toLocaleString() : '8,500'}
                  </span>
                  <span className="text-xs text-stone-500 font-medium block mt-1.5">
                    Pending Bills
                  </span>
                </div>
              </div>

              {/* Card 3: Medical Records */}
              <div
                onClick={() => setActiveTab('records')}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/60 shadow-xs hover:border-[#0A4D8C]/40 hover:shadow-sm transition-all cursor-pointer space-y-3"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#F0F5FA] text-[#0A4D8C] flex items-center justify-center">
                  <FileText className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#221815] block leading-none">
                    {totalMedicalRecordsCount > 0 ? totalMedicalRecordsCount : 10}
                  </span>
                  <span className="text-xs text-stone-500 font-medium block mt-1.5">
                    Medical Records
                  </span>
                </div>
              </div>

              {/* Card 4: Next Visit */}
              <div
                onClick={() => setActiveTab('appointments')}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/60 shadow-xs hover:border-[#C8232C]/40 hover:shadow-sm transition-all cursor-pointer space-y-3"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center">
                  <Clock className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-extrabold text-[#221815] block leading-none">
                    {nextVisitDate}
                  </span>
                  <span className="text-xs text-stone-500 font-medium block mt-1.5">
                    Next Clinic Visit
                  </span>
                </div>
              </div>

            </div>

            {/* 3. Button for Book Appointment */}
            <div>
              <button
                onClick={() => {
                  setActiveTab('appointments');
                  setIsBookingOpen(true);
                }}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#C8232C] hover:bg-[#B81D24] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            </div>

            {/* 4. Live Queue & Clinical Wait Times */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/60 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center">
                    <Clock className="w-4 h-4 stroke-[2.4]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#221815]">Live Queue &amp; Clinical Wait Times</h3>
                    <p className="text-[11px] text-stone-500">Live queue monitor across hospital departments</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-Time</span>
                </span>
              </div>

              {/* Patient's Current Triage Ticket */}
              <div className="bg-[#FAF8F5] rounded-2xl p-3.5 border border-[#EAE5DC] flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-extrabold text-[#C8232C] bg-white px-2 py-0.5 rounded-lg border border-[#EAE5DC]">
                      Ticket #TL-104
                    </span>
                    <span className="text-xs font-bold text-[#221815]">Outpatient General Consultation</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Position: <strong className="text-[#221815]">2 patients ahead of you</strong> &bull; Estimated wait: ~10 mins
                  </p>
                  <p className="text-[10px] text-stone-500">
                    Assigned: Dr. David Ochieng &bull; Room 3 (Outpatient Wing)
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 block">
                    Called Next
                  </span>
                </div>
              </div>

              {/* Department Queue Glance */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-500 block truncate">Outpatient OPD</span>
                  <span className="text-xs font-bold text-[#221815] block mt-0.5">4 in line</span>
                  <span className="text-[10px] text-stone-400">~12 min wait</span>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-500 block truncate">Cardiology</span>
                  <span className="text-xs font-bold text-[#221815] block mt-0.5">1 in line</span>
                  <span className="text-[10px] text-stone-400">~5 min wait</span>
                </div>

                <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-semibold text-emerald-700 block truncate">Accident &amp; Emergency</span>
                  <span className="text-xs font-bold text-emerald-800 block mt-0.5">Immediate</span>
                  <span className="text-[10px] text-emerald-600">0 min wait</span>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-semibold text-stone-500 block truncate">Pediatrics</span>
                  <span className="text-xs font-bold text-[#221815] block mt-0.5">2 in line</span>
                  <span className="text-[10px] text-stone-400">~8 min wait</span>
                </div>
              </div>
            </div>

            {/* 5. Questions / Emergencies Card (Call Now & SMS Us - Redundant call strip above removed) */}
            <div className="bg-[#8F261F] text-white rounded-3xl p-5 shadow-sm space-y-3.5">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                    Questions, Emergencies, or Appointment Approvals?
                  </h3>
                  <p className="text-xs text-rose-100/90 mt-1 leading-relaxed">
                    Call or SMS our medical coordinators anytime at 0713544101.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <a
                  href="tel:0713544101"
                  className="px-4 py-2 rounded-full bg-[#C8232C] hover:bg-[#B81D24] text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm transition-transform active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
                <a
                  href="sms:0713544101"
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center space-x-1.5 border border-white/20 transition-transform active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>SMS Us</span>
                </a>
              </div>
            </div>

            {/* 6. Explore Our Services */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/60 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#C8232C] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Heart className="w-5 h-5 fill-white stroke-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm sm:text-base font-bold text-[#221815]">
                        Explore Our Services
                      </h3>
                      <span className="px-2 py-0.5 bg-[#FDF1F1] text-[#C8232C] text-[10px] font-bold rounded-full">
                        Featured
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Comprehensive clinical care, in-home nursing, specialized therapies, diagnostics, and 24/7 emergency dispatch.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service categories preview chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div 
                  onClick={() => setActiveTab('services')}
                  className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] hover:border-[#C8232C]/40 transition-all cursor-pointer group"
                >
                  <span className="font-bold text-[#221815] text-xs block group-hover:text-[#C8232C] transition-colors">Outpatient OPD</span>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">KES 1,500 &bull; SHA Covered</span>
                </div>
                <div 
                  onClick={() => setActiveTab('services')}
                  className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] hover:border-[#C8232C]/40 transition-all cursor-pointer group"
                >
                  <span className="font-bold text-[#221815] text-xs block group-hover:text-[#C8232C] transition-colors">Specialist Clinics</span>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Cardiology, Neuro, Ortho</span>
                </div>
                <div 
                  onClick={() => setActiveTab('services')}
                  className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] hover:border-[#C8232C]/40 transition-all cursor-pointer group"
                >
                  <span className="font-bold text-[#221815] text-xs block group-hover:text-[#C8232C] transition-colors">Home Care &amp; Nursing</span>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Clinical Dispatch</span>
                </div>
                <div 
                  onClick={() => setActiveTab('services')}
                  className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] hover:border-[#C8232C]/40 transition-all cursor-pointer group"
                >
                  <span className="font-bold text-[#221815] text-xs block group-hover:text-[#C8232C] transition-colors">Diagnostic Lab</span>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Lipid, Hemogram, etc.</span>
                </div>
                <div 
                  onClick={() => setActiveTab('services')}
                  className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] hover:border-[#C8232C]/40 transition-all cursor-pointer group"
                >
                  <span className="font-bold text-[#221815] text-xs block group-hover:text-[#C8232C] transition-colors">Digital Radiology</span>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">X-Ray, CT, Ultrasound</span>
                </div>
                <div 
                  onClick={() => setActiveTab('services')}
                  className="p-3 bg-[#FAF8F5] rounded-2xl border border-[#EAE5DC] hover:border-[#C8232C]/40 transition-all cursor-pointer group"
                >
                  <span className="font-bold text-[#221815] text-xs block group-hover:text-[#C8232C] transition-colors">Emergency ALS</span>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">24/7 Ambulance Dispatch</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={() => setActiveTab('services')}
                  className="px-5 py-2.5 rounded-full bg-[#C8232C] hover:bg-[#B81D24] text-white font-semibold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center space-x-1"
                >
                  <span>Explore All Services →</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('appointments');
                    setIsBookingOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-stone-200/70 text-[#221815] font-semibold text-xs border border-stone-200 transition-colors cursor-pointer"
                >
                  Book Appointment
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB: HEALTHCARE SERVICES (FEATURED) ================= */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            {/* Header banner */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200/60 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#C8232C] text-white flex items-center justify-center shadow-xs">
                    <Heart className="w-5 h-5 fill-white stroke-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base sm:text-lg font-bold text-[#221815]">Healthcare Services &amp; Home Care</h2>
                      <span className="px-2 py-0.5 bg-[#FDF1F1] text-[#C8232C] text-[10px] font-bold rounded-full">
                        FEATURED
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">
                      Standard clinical tariffs, SHA / NHIF Kenya coverage &amp; direct service dispatch
                    </p>
                  </div>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="space-y-2.5 pt-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search services, laboratory tests, procedures, imaging..."
                    value={servicesSearch}
                    onChange={(e) => setServicesSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8232C]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {['All', 'Consultation', 'Laboratory', 'Radiology & Imaging', 'Emergency & Ambulance', 'Home Care & Nursing'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setServicesCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                        servicesCategory === cat
                          ? 'bg-[#C8232C] text-white font-bold shadow-2xs'
                          : 'bg-[#FAF8F5] text-stone-600 hover:bg-stone-200/60 border border-[#EAE5DC]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Services List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(INITIAL_HOSPITAL_SERVICES || [])
                .filter((srv) => {
                  const matchesSearch = srv.name.toLowerCase().includes(servicesSearch.toLowerCase()) ||
                    srv.description.toLowerCase().includes(servicesSearch.toLowerCase()) ||
                    srv.code.toLowerCase().includes(servicesSearch.toLowerCase());
                  const matchesCategory = servicesCategory === 'All' || srv.category === servicesCategory ||
                    (servicesCategory === 'Home Care & Nursing' && (srv.category === 'Consultation' || srv.category === 'Physiotherapy & Rehab'));
                  return matchesSearch && matchesCategory;
                })
                .map((srv) => (
                  <div
                    key={srv.id}
                    className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/60 shadow-xs hover:border-[#C8232C]/30 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#0A4D8C] bg-[#F0F5FA] px-2 py-0.5 rounded-lg">
                          {srv.category}
                        </span>
                        <span className="text-xs font-mono font-bold text-stone-500">
                          {srv.code}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#221815] leading-snug">{srv.name}</h3>
                      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                        {srv.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-medium">Standard Tariff</span>
                        <span className="text-sm font-black text-[#221815]">
                          KES {srv.standardFeeKES.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {srv.shaCovered && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                            SHA Covered
                          </span>
                        )}
                        <button
                          onClick={() => {
                            setActiveTab('appointments');
                            setIsBookingOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-full bg-[#C8232C] hover:bg-[#B81D24] text-white text-xs font-semibold shadow-2xs transition-transform active:scale-95 cursor-pointer"
                        >
                          Book Service
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* In-Home Clinical Care Banner */}
            <div className="bg-[#FAF8F5] rounded-3xl p-5 border border-[#EAE5DC] space-y-3">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#0A4D8C] text-white flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#221815]">Need In-Home Nursing or Home Phlebotomy?</h3>
                  <p className="text-xs text-stone-600 mt-1">
                    TERRALINK Health dispatches licensed clinical officers and registered nurses for home wound care, medication administration, senior nursing, and lab sample collection across Nairobi.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <a
                  href="tel:0713544101"
                  className="px-4 py-2 rounded-full bg-[#0A4D8C] hover:bg-[#083E72] text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Dispatch (0713544101)</span>
                </a>
                <a
                  href="sms:0713544101"
                  className="px-4 py-2 rounded-full bg-white text-[#221815] border border-stone-200 text-xs font-semibold flex items-center space-x-1.5 hover:bg-stone-50 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Request by SMS</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: AI ASSISTANT ================= */}
        {activeTab === 'ai_assistant' && (
          <div className="bg-white rounded-3xl border border-[#EAE5DC] shadow-xs flex flex-col h-[75vh]">
            <div className="p-3.5 border-b border-[#EAE5DC] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C8232C] text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#221815]">AI Health Assistant</h3>
                  <p className="text-[10px] text-stone-500">Evidence-based advice &bull; Kenya Health Network</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs">
              {aiMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#C8232C] text-white rounded-br-xs'
                        : 'bg-stone-100 text-[#221815] rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-center space-x-2 text-stone-400 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C8232C]" />
                  <span>Thinking...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Pills */}
            <div className="px-3.5 py-2 border-t border-[#EAE5DC] flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {[
                'Explain my blood test results',
                'What are common asthma triggers?',
                'Which clinic should I visit?'
              ].map((pill, i) => (
                <button
                  key={i}
                  onClick={() => setAiInput(pill)}
                  className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 whitespace-nowrap transition-colors cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendAiMessage} className="p-3 border-t border-[#EAE5DC] flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your health question..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8232C]"
              />
              <button
                type="submit"
                disabled={!aiInput.trim() || aiLoading}
                className="p-2 rounded-xl bg-[#C8232C] hover:bg-[#B81D24] disabled:opacity-40 text-white cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 3: APPOINTMENTS ================= */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#221815]">Appointments</h2>
                <p className="text-xs text-stone-500">Manage bookings &amp; consultations</p>
              </div>
              <button
                onClick={() => setIsBookingOpen(!isBookingOpen)}
                className="px-3.5 py-1.5 rounded-xl bg-[#C8232C] hover:bg-[#B81D24] text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isBookingOpen ? 'Close Form' : 'Book Appointment'}</span>
              </button>
            </div>

            {/* Booking Form Card */}
            {isBookingOpen && (
              <form onSubmit={handleInitiateBooking} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5 text-xs">
                <h3 className="font-bold text-slate-900 text-sm">Book Specialist Consultation</h3>

                {bookingError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                    {bookingError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Clinical Department</label>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => {
                        setSelectedDeptId(e.target.value);
                        const firstDoc = doctors.find(d => d.departmentId === e.target.value);
                        if (firstDoc) setSelectedDoctorId(firstDoc.id);
                      }}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Doctor</label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                    >
                      {doctors
                        .filter(d => !selectedDeptId || d.departmentId === selectedDeptId)
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} &mdash; KES {d.consultationFeeKES}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Time Slot</label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Consultation Type</label>
                  <div className="flex space-x-3">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="consultationType"
                        checked={consultationType === 'in_person'}
                        onChange={() => setConsultationType('in_person')}
                      />
                      <span>In-Person Hospital Visit</span>
                    </label>
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="consultationType"
                        checked={consultationType === 'telemedicine'}
                        onChange={() => setConsultationType('telemedicine')}
                      />
                      <span>Telemedicine (Video Call)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reason for Consultation</label>
                  <input
                    type="text"
                    placeholder="Brief description of symptoms..."
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#C8232C] hover:bg-[#B81D24] text-white font-semibold flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Proceed to M-PESA Confirmation</span>
                  </button>
                </div>
              </form>
            )}

            {/* Appointments List */}
            <div className="space-y-3">
              {appointments.length > 0 ? (
                appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{apt.doctorName}</h4>
                        <p className="text-[11px] text-slate-500">{apt.departmentName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        apt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        apt.status === 'Cancelled' ? 'bg-rose-50 text-rose-700' :
                        'bg-rose-50 text-[#C8232C]'
                      }`}>
                        {apt.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span>📅 {apt.appointmentDate}</span>
                      <span>⏰ {apt.appointmentTime}</span>
                      <span>🏥 {apt.type === 'telemedicine' ? 'Telemedicine' : 'In-Person'}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">"{apt.reason}"</p>

                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                      {apt.type === 'telemedicine' && apt.status === 'Confirmed' && (
                        <button
                          onClick={() => setActiveTelemedicineApt(apt)}
                          className="px-3 py-1.5 rounded-xl bg-[#C8232C] hover:bg-[#B81D24] text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Video Consultation</span>
                        </button>
                      )}
                      {apt.status !== 'Cancelled' && (
                        <button
                          onClick={() => {
                            if (confirm('Cancel this appointment?')) {
                              onCancelAppointment(apt.id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-medium cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-100">
                  No appointments found. Click "Book Appointment" above.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 4: MEDICAL RECORDS (MATCHING REFERENCE IMAGE 2) ================= */}
        {activeTab === 'records' && (() => {
          // 10 Clinical Records from Reference Image 2
          const allClinicalRecords = [
            {
              id: 'rec-1',
              title: 'Upper Respiratory Infection',
              provider: 'Doctor',
              date: '2026-07-15',
              category: 'diagnosis' as const,
              categoryLabel: 'Diagnosis',
              badgeClass: 'bg-sky-100 text-sky-800 border border-sky-200',
              type: 'medical_report' as const,
              encounter: encounters.find(e => e.id === 'enc-101') || encounters[0]
            },
            {
              id: 'rec-2',
              title: 'Paracetamol 500mg Tabs',
              provider: 'Pharmacy',
              date: '2026-07-15',
              category: 'pharmacy' as const,
              categoryLabel: 'Pharmacy',
              badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
              type: 'prescription' as const,
              prescription: prescriptions.find(p => p.id === 'rx-201') || prescriptions[0]
            },
            {
              id: 'rec-3',
              title: 'Amoxicillin 250mg Suspension',
              provider: 'Pharmacy',
              date: '2026-07-15',
              category: 'pharmacy' as const,
              categoryLabel: 'Pharmacy',
              badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
              type: 'prescription' as const,
              prescription: prescriptions.find(p => p.id === 'rx-202') || prescriptions[1]
            },
            {
              id: 'rec-4',
              title: 'X-Ray Left Knee (AP/Lateral)',
              provider: 'Radiology',
              date: '2026-07-10',
              category: 'radiology' as const,
              categoryLabel: 'Reviewed',
              badgeClass: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
              type: 'radiology' as const,
              radiologyOrder: radiologyOrders.find(r => r.id === 'rad-500') || radiologyOrders[0]
            },
            {
              id: 'rec-5',
              title: 'Chest X-Ray PA',
              provider: 'Radiology',
              date: '2026-07-10',
              category: 'radiology' as const,
              categoryLabel: 'Normal',
              badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
              type: 'radiology' as const,
              radiologyOrder: radiologyOrders.find(r => r.id === 'rad-501') || radiologyOrders[1]
            },
            {
              id: 'rec-6',
              title: 'Complete Blood Count (CBC)',
              provider: 'Medical Laboratory',
              date: '2026-07-08',
              category: 'lab' as const,
              categoryLabel: 'Normal',
              badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
              type: 'lab_report' as const,
              labOrder: labOrders.find(l => l.id === 'lab-401') || labOrders[0]
            },
            {
              id: 'rec-7',
              title: 'Lipid Panel (Fasting)',
              provider: 'Medical Laboratory',
              date: '2026-07-08',
              category: 'lab' as const,
              categoryLabel: 'Borderline',
              badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
              type: 'lab_report' as const,
              labOrder: labOrders.find(l => l.id === 'lab-402') || labOrders[1]
            },
            {
              id: 'rec-8',
              title: 'Renal Function Tests (RFT)',
              provider: 'Medical Laboratory',
              date: '2026-07-08',
              category: 'lab' as const,
              categoryLabel: 'Normal',
              badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
              type: 'lab_report' as const,
              labOrder: labOrders.find(l => l.id === 'lab-403') || labOrders[2]
            },
            {
              id: 'rec-9',
              title: 'Discharge Summary - Inpatient Pneumonia',
              provider: 'Doctor',
              date: '2026-06-18',
              category: 'diagnosis' as const,
              categoryLabel: 'Discharge Summary',
              badgeClass: 'bg-purple-100 text-purple-800 border border-purple-200',
              type: 'medical_report' as const,
              encounter: encounters.find(e => e.id === 'enc-102') || encounters[1]
            },
            {
              id: 'rec-10',
              title: 'Amoxicillin-Clavulanic Acid 625mg',
              provider: 'Pharmacy',
              date: '2026-06-15',
              category: 'pharmacy' as const,
              categoryLabel: 'Pharmacy',
              badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
              type: 'prescription' as const,
              prescription: prescriptions.find(p => p.id === 'rx-203') || prescriptions[2]
            }
          ];

          // Filter by Category
          const categoryFiltered = recordCategoryFilter === 'all'
            ? allClinicalRecords
            : allClinicalRecords.filter(r => r.category === recordCategoryFilter);

          // Filter by Search Query
          const query = recordSearch.trim().toLowerCase();
          const displayedRecords = query
            ? categoryFiltered.filter(r =>
                r.title.toLowerCase().includes(query) ||
                r.provider.toLowerCase().includes(query) ||
                r.categoryLabel.toLowerCase().includes(query) ||
                r.date.includes(query)
              )
            : categoryFiltered;

          // Open detailed modal for report
          const handleOpenRecord = (rec: typeof allClinicalRecords[0]) => {
            setReportModalData({
              title: rec.title,
              type: rec.type,
              encounter: rec.encounter,
              prescription: rec.prescription,
              radiologyOrder: rec.radiologyOrder,
              labOrder: rec.labOrder
            });
            setReportModalOpen(true);
          };

          return (
            <div className="space-y-4">
              {/* Breadcrumb & Header */}
              <div>
                <p className="text-[11px] text-slate-500 font-medium mb-1">
                  Patient Portal &gt; <span className="text-slate-900 font-semibold">Medical Records</span>
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Medical Records
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  View results from Laboratory, Radiology, Pharmacy, and Doctors
                </p>
              </div>

              {/* Real-time Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={recordSearch}
                  onChange={(e) => setRecordSearch(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
                />
                {recordSearch && (
                  <button
                    onClick={() => setRecordSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills with Live Counts */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { key: 'all', label: `All (${allClinicalRecords.length})` },
                  { key: 'lab', label: `🧪 Lab Results (${allClinicalRecords.filter(r => r.category === 'lab').length})` },
                  { key: 'radiology', label: `🩻 X-Ray / Radiology (${allClinicalRecords.filter(r => r.category === 'radiology').length})` },
                  { key: 'pharmacy', label: `💊 Pharmacy (${allClinicalRecords.filter(r => r.category === 'pharmacy').length})` },
                  { key: 'diagnosis', label: `📋 Diagnosis (${allClinicalRecords.filter(r => r.category === 'diagnosis').length})` }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setRecordCategoryFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap cursor-pointer transition-colors ${
                      recordCategoryFilter === tab.key
                        ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Records List / Grid */}
              <div className="space-y-2.5">
                {displayedRecords.length > 0 ? (
                  displayedRecords.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => handleOpenRecord(rec)}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-sm hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      {/* Record Information */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-sky-700 transition-colors">
                            {rec.title}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${rec.badgeClass}`}>
                            {rec.categoryLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                          <span>{rec.provider}</span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="font-mono text-slate-600">{rec.date}</span>
                        </p>
                      </div>

                      {/* View Report Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRecord(rec);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 group-hover:bg-sky-50 group-hover:text-sky-700 group-hover:border-sky-200 text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="View Full Report"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-100">
                    No medical records found matching your search.
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ================= TAB 5: BILLING & PAYMENTS (MATCHING REFERENCE IMAGE 1 + INSURANCE SECTION) ================= */}
        {activeTab === 'billing' && (() => {
          // 5 Invoices matching Reference Image 1
          const invoicesList = [
            {
              id: 'INV-2026-001',
              title: 'Pediatrics Consultation + Vaccination',
              date: '2026-07-15',
              amountKES: 3500,
              status: 'Paid' as const,
              badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
              items: [{ description: 'Pediatrics Consultation + Vaccination', category: 'Consultation', amountKES: 3500 }],
              mpesaReceipt: 'QHK91A44LL'
            },
            {
              id: 'INV-2026-002',
              title: 'Orthopedic Consultation + X-Ray',
              date: '2026-07-10',
              amountKES: 8500,
              status: (invoices.find(i => i.id === 'INV-2026-002')?.status === 'Paid' ? 'Paid' : 'Pending') as 'Paid' | 'Pending',
              badgeClass: invoices.find(i => i.id === 'INV-2026-002')?.status === 'Paid'
                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                : 'bg-sky-50 text-sky-700 border border-sky-200',
              items: [{ description: 'Orthopedic Consultation + X-Ray', category: 'Consultation', amountKES: 8500 }],
              mpesaReceipt: invoices.find(i => i.id === 'INV-2026-002')?.mpesaReceipt
            },
            {
              id: 'INV-2026-003',
              title: 'Lab Work - CBC, Lipid Panel',
              date: '2026-07-08',
              amountKES: 4200,
              status: 'Paid' as const,
              badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
              items: [{ description: 'Lab Work - CBC, Lipid Panel', category: 'Laboratory', amountKES: 4200 }],
              mpesaReceipt: 'QHK88X92LM'
            },
            {
              id: 'INV-2026-004',
              title: 'Inpatient - Pneumonia Treatment (3 days)',
              date: '2026-06-15',
              amountKES: 45000,
              status: 'Paid' as const,
              badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
              items: [{ description: 'Inpatient - Pneumonia Treatment (3 days)', category: 'Procedure', amountKES: 45000 }],
              mpesaReceipt: 'QHK77P33JK'
            },
            {
              id: 'INV-2026-005',
              title: 'Cardiology Consultation',
              date: '2026-06-01',
              amountKES: 5000,
              status: (invoices.find(i => i.id === 'INV-2026-005')?.status === 'Paid' ? 'Paid' : 'Overdue') as 'Paid' | 'Overdue',
              badgeClass: invoices.find(i => i.id === 'INV-2026-005')?.status === 'Paid'
                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200',
              items: [{ description: 'Cardiology Consultation', category: 'Consultation', amountKES: 5000 }],
              mpesaReceipt: invoices.find(i => i.id === 'INV-2026-005')?.mpesaReceipt
            }
          ];

          // Compute Totals dynamically
          const totalOutstanding = invoicesList
            .filter(i => i.status !== 'Paid')
            .reduce((acc, i) => acc + i.amountKES, 0);

          const totalPaid = invoicesList
            .filter(i => i.status === 'Paid')
            .reduce((acc, i) => acc + i.amountKES, 0);

          // Handle Pay button
          const handlePayBill = (inv: typeof invoicesList[0]) => {
            setActiveInvoiceToPay(inv.id);
            setMpesaAmount(inv.amountKES);
            setMpesaTitle(inv.title);
            setMpesaRef(inv.id);
            setMpesaTargetAction('invoice');
            setMpesaModalOpen(true);
          };

          // Handle View Receipt / PDF
          const handleViewReceipt = (inv: typeof invoicesList[0]) => {
            const fullInvoice: Invoice = {
              id: inv.id,
              patientId: patient.id,
              patientName: patient.name,
              patientPhone: patient.phone,
              date: inv.date,
              dueDate: inv.date,
              status: inv.status === 'Paid' ? 'Paid' : 'Unpaid',
              items: inv.items as any,
              totalKES: inv.amountKES,
              paidAmountKES: inv.status === 'Paid' ? inv.amountKES : 0,
              balanceKES: inv.status === 'Paid' ? 0 : inv.amountKES,
              paymentMethod: 'M-PESA Express',
              mpesaReceipt: inv.mpesaReceipt || (inv.status === 'Paid' ? 'QHK91A44LL' : undefined)
            };
            setReportModalData({
              title: `Official Invoice & Receipt - ${inv.id}`,
              type: 'invoice',
              invoice: fullInvoice
            });
            setReportModalOpen(true);
          };

          // Handle Insurance Policy Submit
          const handleSubmitInsurancePolicy = async (e: React.FormEvent) => {
            e.preventDefault();
            setInsuranceFeedback(null);

            if (!policyNumberInput.trim() || !memberNumberInput.trim()) {
              setInsuranceFeedback({ type: 'error', message: 'Please enter both Policy Number and Member/Card Number.' });
              return;
            }

            const provider = insuranceProviders.find(p => p.id === selectedInsurerId) || insuranceProviders[0];

            setIsSubmittingInsurance(true);
            try {
              const newPolicyPayload = {
                patientId: patient.id,
                patientName: patient.name,
                patientNationalId: nationalIdInput || patient.nationalId,
                patientPhone: phoneInput || patient.phone,
                providerId: provider.id,
                providerName: provider.providerName,
                policyNumber: policyNumberInput.trim(),
                memberNumber: memberNumberInput.trim(),
                principalMemberName: principalNameInput.trim() || patient.name,
                relationshipToPrincipal: relationshipInput,
                planTierName: planTierInput || provider.planTiers[0]?.tierName || 'Standard Health Cover',
                inpatientLimitKES: provider.planTiers[0]?.inpatientLimitKES || 1800000,
                inpatientUsedKES: 0,
                outpatientLimitKES: provider.planTiers[0]?.outpatientLimitKES || 100000,
                outpatientUsedKES: 0,
                status: 'PENDING' as const
              };

              const res = await fetch('/api/insurance/policies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPolicyPayload)
              });

              const savedPolicy = res.ok ? await res.json() : {
                ...newPolicyPayload,
                id: `pol-${Date.now()}`,
                submittedAt: new Date().toISOString()
              };

              setInsurancePolicies(prev => [savedPolicy, ...prev]);
              setInsuranceFeedback({
                type: 'success',
                message: 'Your insurance request has been submitted and is currently PENDING verification by the insurer and hospital billing desk.'
              });
              setPolicyNumberInput('');
              setMemberNumberInput('');
              setShowSubmitPolicyForm(false);
            } catch (err: any) {
              setInsuranceFeedback({
                type: 'error',
                message: err.message || 'Failed to submit insurance verification request.'
              });
            } finally {
              setIsSubmittingInsurance(false);
            }
          };

          // Simulate Admin/Insurer Approval of Pending Policy
          const handleSimulateApproval = async (policyId: string) => {
            try {
              const res = await fetch(`/api/insurance/policies/${policyId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'ACTIVE', verifiedBy: 'TERRALINK Billing Desk & IRA Verification Gateway' })
              });

              if (res.ok) {
                const updated = await res.json();
                setInsurancePolicies(prev => prev.map(p => p.id === policyId ? updated : p));
              } else {
                setInsurancePolicies(prev => prev.map(p => p.id === policyId ? { ...p, status: 'ACTIVE' } : p));
              }
              setInsuranceFeedback({
                type: 'success',
                message: 'Insurance policy successfully verified and activated! Status changed to ACTIVE.'
              });
            } catch (e) {
              setInsurancePolicies(prev => prev.map(p => p.id === policyId ? { ...p, status: 'ACTIVE' } : p));
            }
          };

          const activePolicy = insurancePolicies.find(p => p.status === 'ACTIVE' || p.status === 'Approved & Verified') || insurancePolicies[0];
          const pendingPolicy = insurancePolicies.find(p => p.status === 'PENDING' || p.status === 'Pending Verification');

          return (
            <div className="space-y-4">
              {/* Breadcrumbs & Header */}
              <div>
                <p className="text-[11px] text-slate-500 font-medium mb-1">
                  Patient Portal &gt; <span className="text-slate-900 font-semibold">Billing &amp; Payments</span>
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      Billing &amp; Payments
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Invoices, instant M-PESA checkout, and IRA-licensed insurance
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-tab Switcher: Invoices & Receipts vs Insurance */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  onClick={() => setBillingSubtab('invoices')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    billingSubtab === 'invoices'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Invoices &amp; Receipts</span>
                </button>
                <button
                  onClick={() => setBillingSubtab('insurance')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    billingSubtab === 'insurance'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Insurance</span>
                  {pendingPolicy && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>
              </div>

              {/* ================= SUBTAB 1: INVOICES & RECEIPTS ================= */}
              {billingSubtab === 'invoices' && (
                <div className="space-y-4">
                  {/* 3 Summary Stat Cards matching Reference Image 1 */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Card 1: Total Outstanding */}
                    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-2xs space-y-1">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Total Outstanding
                      </span>
                      <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight font-mono">
                        KES {totalOutstanding.toLocaleString()}
                      </span>
                    </div>

                    {/* Card 2: Total Paid (2026) */}
                    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-2xs space-y-1">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Total Paid (2026)
                      </span>
                      <span className="text-base sm:text-lg font-bold text-emerald-600 block leading-tight font-mono">
                        KES {totalPaid.toLocaleString()}
                      </span>
                    </div>

                    {/* Card 3: Invoices */}
                    <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-2xs space-y-1">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Invoices
                      </span>
                      <span className="text-base sm:text-lg font-bold text-slate-900 block leading-tight font-mono">
                        {invoicesList.length}
                      </span>
                    </div>
                  </div>

                  {/* Section Title */}
                  <div className="pt-1">
                    <h3 className="text-sm font-bold text-slate-900">Invoices</h3>
                  </div>

                  {/* 5 Invoices List matching Reference Image 1 */}
                  <div className="space-y-2.5">
                    {invoicesList.map((inv) => (
                      <div
                        key={inv.id}
                        className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-200 transition-all"
                      >
                        {/* Left: Title, Number, Date, Amount */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {inv.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {inv.id} &bull; {inv.date}
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono mt-1">
                            KES {inv.amountKES.toLocaleString()}
                          </p>
                        </div>

                        {/* Right: Badge + Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              inv.status === 'Paid'
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : inv.status === 'Pending'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {inv.status}
                          </span>

                          {/* Pay Button for Pending/Overdue */}
                          {inv.status !== 'Paid' && (
                            <button
                              onClick={() => handlePayBill(inv)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                              title="Pay Invoice with M-PESA"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay</span>
                            </button>
                          )}

                          {/* Download / View Receipt Button [ ↓ ] */}
                          <button
                            onClick={() => handleViewReceipt(inv)}
                            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Download / View Official Receipt"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= SUBTAB 2: INSURANCE ================= */}
              {billingSubtab === 'insurance' && (
                <div className="space-y-4">
                  {/* Feedback Message */}
                  {insuranceFeedback && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
                        insuranceFeedback.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {insuranceFeedback.type === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span>{insuranceFeedback.message}</span>
                      </div>
                      <button
                        onClick={() => setInsuranceFeedback(null)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Active Insurance Card */}
                  {activePolicy && (
                    <div className="bg-gradient-to-br from-slate-900 via-[#072433] to-slate-900 rounded-2xl p-5 text-white shadow-md border border-slate-800 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-sky-400 uppercase tracking-wider font-bold">
                              Verified Coverage
                            </span>
                            <h4 className="text-base font-bold text-white tracking-tight">
                              {activePolicy.providerName}
                            </h4>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wide">
                          ACTIVE
                        </span>
                      </div>

                      {/* Policy & Member details */}
                      <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 rounded-xl p-3 border border-white/10">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Policy Number</span>
                          <span className="font-mono font-bold text-white text-xs sm:text-sm">
                            {activePolicy.policyNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Member / Card No</span>
                          <span className="font-mono font-bold text-white text-xs sm:text-sm">
                            {activePolicy.memberNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Principal Member</span>
                          <span className="font-medium text-slate-200">
                            {activePolicy.principalMemberName || patient.name}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Benefit Scheme Tier</span>
                          <span className="font-medium text-slate-200 truncate block">
                            {activePolicy.planTierName}
                          </span>
                        </div>
                      </div>

                      {/* Benefits Breakdown */}
                      <div className="space-y-2 pt-1 border-t border-white/10 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Inpatient Benefit:</span>
                          <span className="font-mono font-bold text-white">
                            KES {(activePolicy.inpatientLimitKES || 1800000).toLocaleString()} (Available)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Outpatient Benefit:</span>
                          <span className="font-mono font-bold text-white">
                            KES {(activePolicy.outpatientLimitKES || 100000).toLocaleString()} (Copay: KES 0)
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-sky-400">
                          <span>Direct Settlement:</span>
                          <span className="font-semibold">Pre-Authorized at TERRALINK Health</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pending Verification Card */}
                  {pendingPolicy && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4.5 text-amber-950 shadow-2xs space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                          <div>
                            <h4 className="text-sm font-bold text-amber-900">
                              Insurance Verification Underway
                            </h4>
                            <p className="text-[11px] text-amber-700">
                              Submitted: {pendingPolicy.submittedAt ? new Date(pendingPolicy.submittedAt).toLocaleDateString() : 'Today'}
                            </p>
                          </div>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                          PENDING
                        </span>
                      </div>

                      <div className="bg-white/80 rounded-xl p-3 text-xs space-y-1 border border-amber-200/60 font-mono">
                        <p><span className="text-slate-500 font-sans">Provider:</span> {pendingPolicy.providerName}</p>
                        <p><span className="text-slate-500 font-sans">Policy Number:</span> {pendingPolicy.policyNumber}</p>
                        <p><span className="text-slate-500 font-sans">Member Number:</span> {pendingPolicy.memberNumber}</p>
                      </div>

                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Your insurance request has been submitted to the TERRALINK Health Billing Desk and IRA electronic verification network. Status is <strong>PENDING</strong> and will automatically change to <strong>ACTIVE</strong> once approved by the insurer/admin.
                      </p>

                      {/* Quick Action to Test Instant Approval */}
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 italic">Instant verification preview:</span>
                        <button
                          onClick={() => handleSimulateApproval(pendingPolicy.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Simulate Insurer/Admin Approval</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Button to Toggle Link Policy Form */}
                  <div className="flex items-center justify-between pt-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Submit / Link Insurance Policy
                    </h3>
                    <button
                      onClick={() => setShowSubmitPolicyForm(prev => !prev)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{showSubmitPolicyForm ? 'Close Form' : 'Add Policy'}</span>
                    </button>
                  </div>

                  {/* Submission Form */}
                  {showSubmitPolicyForm && (
                    <form
                      onSubmit={handleSubmitInsurancePolicy}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3.5 animate-in fade-in duration-200"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          IRA-Licensed Medical Insurance Verification
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Select your insurer and enter policy details for clearance.
                        </p>
                      </div>

                      {/* Provider Select - SHA FIRST! */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Select Insurance Provider (IRA Licensed)
                        </label>
                        <select
                          value={selectedInsurerId}
                          onChange={(e) => {
                            setSelectedInsurerId(e.target.value);
                            const p = insuranceProviders.find(prov => prov.id === e.target.value);
                            if (p?.planTiers[0]) setPlanTierInput(p.planTiers[0].tierName);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                        >
                          {insuranceProviders.map((prov) => (
                            <option key={prov.id} value={prov.id}>
                              {prov.providerName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Policy Number */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Policy Number *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. SHA-NRB-8831920 or AAR-POL-9921"
                            value={policyNumberInput}
                            onChange={(e) => setPolicyNumberInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                          />
                        </div>

                        {/* Member Number */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Member / Card Number *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. MEM-00129841"
                            value={memberNumberInput}
                            onChange={(e) => setMemberNumberInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Principal Member Name */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Principal Member Full Name
                          </label>
                          <input
                            type="text"
                            value={principalNameInput}
                            onChange={(e) => setPrincipalNameInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                          />
                        </div>

                        {/* Relationship */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Relationship to Principal
                          </label>
                          <select
                            value={relationshipInput}
                            onChange={(e) => setRelationshipInput(e.target.value as any)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                          >
                            <option value="Self">Self (Principal Member)</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Child">Child / Dependent</option>
                            <option value="Parent">Parent</option>
                            <option value="Dependent">Other Dependent</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* National ID */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            National ID Number
                          </label>
                          <input
                            type="text"
                            value={nationalIdInput}
                            onChange={(e) => setNationalIdInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                          />
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Contact Phone (for Biometric / SMS OTP)
                          </label>
                          <input
                            type="text"
                            value={phoneInput}
                            onChange={(e) => setPhoneInput(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowSubmitPolicyForm(false)}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingInsurance}
                          className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingInsurance ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Submit for Verification</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of currently IRA-licensed Insurers Accepted at TERRALINK */}
                  <div className="pt-2 space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Currently Licensed Kenyan Insurers Accepted
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      {insuranceProviders.map((prov, i) => (
                        <div
                          key={prov.id}
                          className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-2xs flex items-center gap-2 text-slate-800 font-medium"
                        >
                          <span className="w-5 h-5 rounded-lg bg-sky-50 text-sky-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="truncate text-[11px]">{prov.providerName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ================= TAB 6: QUEUE STATUS (CLINICAL DEPARTMENTS) ================= */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Hospital Queues &amp; Departments</h2>
              <p className="text-xs text-slate-500">Live wait times, queue lengths &amp; on-duty doctors</p>
            </div>

            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{dept.name}</h4>
                      <p className="text-[11px] text-slate-500">{dept.location || 'Main Hospital Block'}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      {dept.code}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Est. Wait Time:</span>
                      <strong className="text-emerald-700">{dept.avgWaitTimeMinutes} mins</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Patients in Queue:</span>
                      <strong className="text-slate-800">{dept.currentQueueLength} active</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Head of Dept:</span>
                      <span className="text-slate-700 font-medium truncate block">{dept.headOfDepartment || 'On Duty Specialist'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Consultation Fee:</span>
                      <span className="text-slate-900 font-bold">KES {dept.consultationFeeKES}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => {
                        setSelectedDeptId(dept.id);
                        setIsBookingOpen(true);
                        setActiveTab('appointments');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold cursor-pointer"
                    >
                      Book Clinic
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 7: FIND A DOCTOR ================= */}
        {activeTab === 'doctors' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Find a Doctor</h2>
              <p className="text-xs text-slate-500">Hospital specialists and medical consultants</p>
            </div>

            {/* Search and Department Filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by doctor name or specialty..."
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setDoctorDeptFilter('all')}
                  className={`px-3 py-1 rounded-xl whitespace-nowrap cursor-pointer transition-colors ${
                    doctorDeptFilter === 'all'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  All Specialists
                </button>
                {departments.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDoctorDeptFilter(d.id)}
                    className={`px-3 py-1 rounded-xl whitespace-nowrap cursor-pointer transition-colors ${
                      doctorDeptFilter === d.id
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {d.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctors List */}
            <div className="space-y-3">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex items-center justify-between">
                    <div className="space-y-1 min-w-0 pr-3">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{doc.name}</h4>
                      <p className="text-xs text-[#0284c7] font-medium">{doc.specialty}</p>
                      <p className="text-[11px] text-slate-500">{doc.departmentName} &bull; Fee: KES {doc.consultationFeeKES}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedDeptId(doc.departmentId);
                        setSelectedDoctorId(doc.id);
                        setIsBookingOpen(true);
                        setActiveTab('appointments');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold cursor-pointer shrink-0 shadow-xs"
                    >
                      Book Appointment
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">No doctors match your criteria.</p>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 8: MESSAGES ================= */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col h-[75vh]">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">Hospital Care Desk &amp; Triage</h3>
                <p className="text-[10px] text-slate-400">Direct message with duty nursing staff</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Online" />
            </div>

            <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs">
              {messagesList.length > 0 ? (
                messagesList.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.senderRole === 'patient' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                        m.senderRole === 'patient'
                          ? 'bg-[#0284c7] text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <p className="font-semibold text-[10px] opacity-80 mb-0.5">{m.senderName}</p>
                      <p>{m.text || (m as any).message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-xs text-slate-400">
                  No messages yet. Ask a question to the hospital desk below.
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a message to the hospital desk..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0284c7]"
              />
              <button
                type="submit"
                disabled={!messageInput.trim() || sendingMessage}
                className="p-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-40 text-white cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ================= TAB 9: PROFILE ================= */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Patient Profile</h2>
                <p className="text-xs text-slate-500">Personal information &amp; identification</p>
              </div>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                {isEditingProfile ? 'Cancel' : 'Edit Details'}
              </button>
            </div>

            {/* Photo Avatar Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
              <div className="relative shrink-0">
                {renderPatientAvatar('w-16 h-16 text-lg')}
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center justify-center shadow-xs border-2 border-white cursor-pointer transition-transform hover:scale-110"
                  title="Change Photo"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">{patient.name}</h3>
                <p className="text-xs text-slate-500">National ID: <strong className="font-mono text-slate-800">{patient.nationalId}</strong></p>
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="text-xs text-[#0284c7] font-semibold hover:underline mt-1 cursor-pointer block"
                >
                  Change Profile Photo
                </button>
              </div>
            </div>

            {/* Profile Form / Display */}
            {!isEditingProfile ? (
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Phone</span>
                    <strong className="text-slate-800">{patient.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Email</span>
                    <strong className="text-slate-800 truncate block">{patient.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Date of Birth</span>
                    <strong className="text-slate-800">{patient.dob} ({calculateAge(patient.dob)} yrs)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Gender</span>
                    <strong className="text-slate-800">{patient.gender}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Blood Group</span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[11px] inline-block mt-0.5">
                      {patient.bloodGroup || 'O+'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Marital Status</span>
                    <strong className="text-slate-800">{patient.maritalStatus || 'Single'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">County</span>
                    <strong className="text-slate-800">{patient.county || 'Nairobi'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Emergency Contact</span>
                    <strong className="text-slate-800">{patient.emergencyContact?.name || 'Collins Kiprono'} ({patient.emergencyContact?.phone || '+254722889900'})</strong>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">SHA Universal Health Policy</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-mono text-xs font-bold text-slate-800">{patient.shaNumber || patient.insurancePolicyNumber || 'SHA-KEN-883192'}</span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Active Benefits</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">National ID</label>
                    <input
                      type="text"
                      required
                      value={profileForm.nationalId}
                      onChange={(e) => setProfileForm(p => ({ ...p, nationalId: e.target.value }))}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold cursor-pointer shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Logout CTA */}
            <div className="pt-2">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to log out from your Patient Portal?')) {
                    onLogout?.();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Patient Portal</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ================= AVATAR EDIT MODAL ================= */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Profile Photo</h3>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-center py-2">
              {renderPatientAvatar('w-20 h-20 text-xl')}
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4" />
                <span>Upload from Device</span>
              </button>

              <div className="space-y-1.5 pt-1">
                <input
                  type="url"
                  placeholder="Or enter image URL..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!customAvatarUrl.trim()}
                  onClick={() => saveNewAvatar(customAvatarUrl.trim())}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-semibold text-xs cursor-pointer"
                >
                  Apply URL
                </button>
              </div>

              {patient.avatar && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Custom Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TELEMEDICINE ROOM OVERLAY ================= */}
      {activeTelemedicineApt && (
        <TelemedicineRoom
          appointment={activeTelemedicineApt}
          patient={patient}
          onClose={() => setActiveTelemedicineApt(null)}
        />
      )}

      {/* ================= REPORT VIEWER MODAL ================= */}
      <ReportViewerModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title={reportModalData.title}
        patient={patient}
        type={reportModalData.type}
        encounter={reportModalData.encounter}
        labOrder={reportModalData.labOrder}
        invoice={reportModalData.invoice}
        prescription={reportModalData.prescription}
        radiologyOrder={reportModalData.radiologyOrder}
      />

      {/* ================= M-PESA MODAL ================= */}
      <MpesaModal
        isOpen={mpesaModalOpen}
        onClose={() => setMpesaModalOpen(false)}
        amountKES={mpesaAmount}
        serviceTitle={mpesaTitle}
        reference={mpesaRef}
        defaultPhone={patient.phone}
        onSuccess={handleMpesaSuccess}
      />

    </div>
  );
};
