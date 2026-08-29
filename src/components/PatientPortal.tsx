import React, { useState, useEffect, useRef } from 'react';
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
  EyeOff,
  XCircle,
  HelpCircle,
  Menu,
  X,
  Settings,
  Lock,
  Bell,
  Camera,
  Upload,
  Trash2,
  LogOut,
  Key,
  Check,
  RefreshCw,
  Sliders,
  ChevronDown,
  Bed,
  Building,
  Receipt,
  Plus,
  FileCheck2
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
  InsuranceProviderPlan,
  InpatientAdmission,
  calculateAge,
  MaritalStatus
} from '../types';
import { INITIAL_INSURANCE_PROVIDERS, INITIAL_INSURANCE_POLICIES, INITIAL_ADMISSIONS } from '../mockData';
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
  onLogout?: () => void;
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
  onPayInvoice,
  onLogout
}) => {
  // Navigation tabs - all arranged items + admissions + telemedicine
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'profile' | 'admissions' | 'book' | 'appointments' | 'emr' | 'queue' | 'insurance' | 'billing' | 'ai_assistant' | 'settings' | 'customer_care' | 'telemedicine'
  >('dashboard');

  // Admissions & Inpatient State
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>(() => {
    const patientAdmissions = INITIAL_ADMISSIONS.filter(a => a.patientId === patient.id);
    return patientAdmissions.length > 0 ? patientAdmissions : INITIAL_ADMISSIONS;
  });
  const [selectedAdmissionReason, setSelectedAdmissionReason] = useState<string>('Acute Abdominal Pain / Surgical Observation');
  const [admissionUrgency, setAdmissionUrgency] = useState<'Elective' | 'Urgent' | 'Emergency' | 'Maternity / Delivery'>('Urgent');
  const [admissionPreferredWard, setAdmissionPreferredWard] = useState<string>('St. Luke Surgical Wing');
  const [admissionSymptoms, setAdmissionSymptoms] = useState<string>('Severe acute abdominal colic, vomiting, and localized rebound tenderness.');
  const [admissionReferringDoc, setAdmissionReferringDoc] = useState<string>('Dr. Patrick Omondi (Emergency Triage / Outpatient)');
  const [isSubmittingAdmission, setIsSubmittingAdmission] = useState<boolean>(false);
  const [admissionSubmitSuccess, setAdmissionSubmitSuccess] = useState<string>('');
  const [admissionSubmitError, setAdmissionSubmitError] = useState<string>('');
  const [admissionViewMode, setAdmissionViewMode] = useState<'overview' | 'request_form'>('overview');

  // SHA Card Upload State
  const shaFileInputRef = useRef<HTMLInputElement | null>(null);
  const [shaUploadNotice, setShaUploadNotice] = useState<string>('');

  // Fetch Live Admissions for Patient
  useEffect(() => {
    const fetchPatientAdmissions = async () => {
      try {
        const res = await fetch(`/api/admissions?patientId=${patient.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAdmissions(data);
          }
        }
      } catch (err) {
        console.warn('Admissions sync note:', err);
      }
    };
    fetchPatientAdmissions();
  }, [patient.id]);

  // Hamburger Drawer State
  const [isHamburgerOpen, setIsHamburgerOpen] = useState<boolean>(false);
  const [isSettingsMenuExpanded, setIsSettingsMenuExpanded] = useState<boolean>(true);
  const [settingsSubtab, setSettingsSubtab] = useState<'password' | 'notifications'>('password');

  // Profile Image Edit State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState<string>('');

  // Settings: Password Change State
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  // Settings: Notification Preferences State
  const [notifPrefs, setNotifPrefs] = useState<{
    smsAlerts: boolean;
    emailReports: boolean;
    queueAlerts: boolean;
    refillReminders: boolean;
    insuranceAlerts: boolean;
    emergencyTraumaAlerts: boolean;
  }>(() => patient.notificationPreferences || {
    smsAlerts: true,
    emailReports: true,
    queueAlerts: true,
    refillReminders: true,
    insuranceAlerts: true,
    emergencyTraumaAlerts: true
  });
  const [notifSaveSuccess, setNotifSaveSuccess] = useState<string>('');
  const [isSavingNotifs, setIsSavingNotifs] = useState<boolean>(false);

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

  // Image Upload / Avatar Methods
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Selected photo exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const base64Url = evt.target?.result as string;
      if (base64Url) {
        await saveNewAvatar(base64Url);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveNewAvatar = async (avatarUrl: string) => {
    const updated: PatientProfile = { ...patient, avatar: avatarUrl };
    onUpdatePatient(updated);
    try {
      localStorage.setItem('terralink_current_patient_profile', JSON.stringify(updated));
      await fetch(`/api/users/${patient.userId || patient.id}/avatar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarUrl })
      });
      await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarUrl })
      });
      setAvatarUploadSuccess('Profile picture updated successfully!');
      setTimeout(() => setAvatarUploadSuccess(''), 3500);
    } catch (err) {
      console.warn('Avatar background sync:', err);
    }
    setIsAvatarModalOpen(false);
    setCustomAvatarUrl('');
  };

  const removeAvatar = async () => {
    const updated: PatientProfile = { ...patient, avatar: undefined };
    onUpdatePatient(updated);
    try {
      localStorage.setItem('terralink_current_patient_profile', JSON.stringify(updated));
      await fetch(`/api/users/${patient.userId || patient.id}/avatar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: '' })
      });
      await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: '' })
      });
      setAvatarUploadSuccess('Profile picture removed. Monogram initials will be displayed.');
      setTimeout(() => setAvatarUploadSuccess(''), 3500);
    } catch (err) {
      console.warn('Avatar remove background sync:', err);
    }
    setIsAvatarModalOpen(false);
  };

  // Password Change Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeStatus({ type: 'idle', message: '' });

    if (!newPasswordInput || newPasswordInput.length < 6) {
      setPasswordChangeStatus({
        type: 'error',
        message: 'New password must be at least 6 characters long.'
      });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeStatus({
        type: 'error',
        message: 'New passwords do not match. Please re-enter.'
      });
      return;
    }

    setPasswordChangeStatus({ type: 'loading', message: 'Saving new password...' });

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: patient.userId || patient.id,
          identifier: patient.email || patient.phone || patient.nationalId,
          currentPassword: currentPasswordInput || undefined,
          newPassword: newPasswordInput
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setPasswordChangeStatus({
        type: 'success',
        message: 'Your password has been changed successfully and memorized in system records!'
      });
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } catch (err: any) {
      setPasswordChangeStatus({
        type: 'error',
        message: err.message || 'Error updating password.'
      });
    }
  };

  // Save Notification Preferences Handler
  const handleSaveNotificationPreferences = async () => {
    setIsSavingNotifs(true);
    setNotifSaveSuccess('');
    const updated: PatientProfile = {
      ...patient,
      notificationPreferences: notifPrefs
    };
    onUpdatePatient(updated);
    try {
      localStorage.setItem('terralink_current_patient_profile', JSON.stringify(updated));
      await fetch(`/api/users/${patient.userId || patient.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationPreferences: notifPrefs })
      });
      setNotifSaveSuccess('Notification preferences saved successfully!');
      setTimeout(() => setNotifSaveSuccess(''), 4000);
    } catch (err) {
      console.warn(err);
      setNotifSaveSuccess('Preferences saved locally!');
      setTimeout(() => setNotifSaveSuccess(''), 4000);
    } finally {
      setIsSavingNotifs(false);
    }
  };

  // Render Patient Avatar Component (Uploaded picture or clean initials monogram)
  const renderPatientAvatar = (className = "w-16 h-16 text-lg") => {
    if (patient.avatar) {
      return (
        <img 
          src={patient.avatar} 
          alt={patient.name} 
          className={`${className} object-cover rounded-2xl border border-white/80 shadow-md`}
        />
      );
    }
    const initials = patient.name
      ? patient.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : 'PT';

    return (
      <div className={`${className} rounded-2xl bg-gradient-to-br from-teal-700 to-slate-900 text-white font-black flex items-center justify-center border border-white/80 shadow-md tracking-wider select-none`}>
        {initials}
      </div>
    );
  };

  // Handle Request Admission from Home
  const handleRequestAdmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAdmission(true);
    setAdmissionSubmitError('');
    setAdmissionSubmitSuccess('');

    try {
      const calculatedAgeVal = calculateAge(patient.dob);
      const res = await fetch('/api/admissions/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          patientName: patient.name,
          patientPhone: patient.phone,
          patientNationalId: patient.nationalId,
          bloodGroup: patient.bloodGroup || 'O+',
          age: calculatedAgeVal,
          gender: patient.gender || 'Female',
          reason: selectedAdmissionReason,
          urgency: admissionUrgency,
          preferredWard: admissionPreferredWard,
          symptoms: admissionSymptoms || 'Acute symptom presentation requiring inpatient admission.',
          referringDoctor: admissionReferringDoc || 'Outpatient / Self Request',
          insuranceScheme: patient.insurancePolicyNumber ? `SHA / NHIF (${patient.insurancePolicyNumber})` : 'Social Health Authority (SHA)',
          shaNumber: patient.shaNumber || patient.insurancePolicyNumber,
          shaDocumentUrl: patient.shaDocumentUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit admission request.');
      }

      if (data.admission) {
        setAdmissions(prev => [data.admission, ...prev.filter(a => a.id !== data.admission.id)]);
      }

      setAdmissionSubmitSuccess('Pre-admission file created successfully with status = PENDING. Central Hospital Reception has placed your record in the active intake queue.');
      setAdmissionViewMode('overview');
      setTimeout(() => setAdmissionSubmitSuccess(''), 6000);
    } catch (err: any) {
      setAdmissionSubmitError(err.message || 'Error submitting admission request.');
    } finally {
      setIsSubmittingAdmission(false);
    }
  };

  // Handle Cancel Pending Admission Request
  const handleCancelAdmission = async (admissionId: string) => {
    if (!confirm('Are you sure you want to cancel this pending pre-admission request?')) return;
    try {
      const res = await fetch(`/api/admissions/${admissionId}/cancel`, { method: 'PATCH' });
      if (res.ok) {
        setAdmissions(prev => prev.map(a => a.id === admissionId ? { ...a, status: 'CANCELLED' as const } : a));
      }
    } catch (err) {
      console.warn(err);
    }
  };

  // Handle Upload SHA Document / Card
  const handleUploadShaCard = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Document exceeds 8MB limit. Please upload a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const docUrl = evt.target?.result as string;
      const updated: PatientProfile = {
        ...patient,
        shaDocumentName: file.name,
        shaDocumentUrl: docUrl,
        shaNumber: patient.shaNumber || patient.insurancePolicyNumber || `SHA-KE-${Math.floor(10000000 + Math.random() * 90000000)}`
      };
      onUpdatePatient(updated);
      try {
        localStorage.setItem('terralink_current_patient_profile', JSON.stringify(updated));
        await fetch(`/api/patients/${patient.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
        setShaUploadNotice(`SHA Document (${file.name}) uploaded & verified successfully.`);
        setTimeout(() => setShaUploadNotice(''), 4500);
      } catch (err) {
        console.warn(err);
      }
    };
    reader.readAsDataURL(file);
  };

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
      {/* Hidden file input for fast avatar photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileUpload}
      />

      {/* ================= HAMBURGER DRAWER OVERLAY & SIDEBAR ================= */}
      {isHamburgerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsHamburgerOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Container */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 overflow-y-auto animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-5 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white flex items-center justify-between border-b border-teal-900/50">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 font-bold text-xs">
                  TL
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-widest uppercase text-teal-300">PATIENT PORTAL</h3>
                  <p className="text-[10px] text-slate-300 font-medium">TerraLink Health Hospital</p>
                </div>
              </div>
              <button 
                onClick={() => setIsHamburgerOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Patient Mini Summary Card */}
            <div className="p-4 bg-teal-50/50 border-b border-teal-100 flex items-center space-x-3">
              <div className="relative">
                {renderPatientAvatar("w-12 h-12 text-sm")}
                <button
                  type="button"
                  onClick={() => {
                    setIsHamburgerOpen(false);
                    setIsAvatarModalOpen(true);
                  }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs border border-white text-[9px] cursor-pointer"
                  title="Change Photo"
                >
                  <Camera className="w-2.5 h-2.5" />
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{patient.name}</h4>
                <p className="text-[11px] text-slate-500 font-mono">ID: {patient.nationalId}</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-semibold text-emerald-700">Active Patient</span>
                </div>
              </div>
            </div>

            {/* Menu Items List */}
            <div className="flex-1 p-3 space-y-1 overflow-y-auto text-xs font-semibold">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Main Navigation
              </div>

              {/* 1. Dashboard */}
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Activity className="w-4 h-4 text-teal-600" />
                <span>Dashboard</span>
              </button>

              {/* 2. My Profile */}
              <button
                onClick={() => {
                  setActiveTab('profile');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <UserIcon className="w-4 h-4 text-teal-600" />
                <span>My Profile</span>
              </button>

              {/* 3. Request Admission & Inpatient Stay */}
              <button
                onClick={() => {
                  setActiveTab('admissions');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admissions'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Bed className="w-4 h-4 text-teal-600" />
                  <span>Request Admission</span>
                </div>
                {admissions.some(a => a.status === 'ADMITTED') ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                    Inpatient
                  </span>
                ) : admissions.some(a => a.status === 'PENDING') ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    Pending
                  </span>
                ) : null}
              </button>

              {/* 4. Book Doctor */}
              <button
                onClick={() => {
                  setActiveTab('book');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'book'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-teal-600" />
                <span>Book Doctor</span>
              </button>

              {/* 5. My Visits */}
              <button
                onClick={() => {
                  setActiveTab('appointments');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'appointments'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  <span>My Visits</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'appointments' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {appointments.length}
                </span>
              </button>

              {/* 5. Medical Records */}
              <button
                onClick={() => {
                  setActiveTab('emr');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'emr'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Medical Records</span>
              </button>

              {/* 6. Department Queues */}
              <button
                onClick={() => {
                  setActiveTab('queue');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'queue'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Department Queues</span>
              </button>

              {/* 7. Insurance */}
              <button
                onClick={() => {
                  setActiveTab('insurance');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'insurance'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Insurance</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'insurance' ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-800'
                }`}>
                  {policies.length}
                </span>
              </button>

              {/* 8. Invoice */}
              <button
                onClick={() => {
                  setActiveTab('billing');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'billing'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  <span>Invoice</span>
                </div>
                {invoices.filter(i => i.status !== 'Paid').length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    {invoices.filter(i => i.status !== 'Paid').length} Unpaid
                  </span>
                )}
              </button>

              {/* 9. Terra Guidance */}
              <button
                onClick={() => {
                  setActiveTab('ai_assistant');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'ai_assistant'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Bot className="w-4 h-4 text-teal-600" />
                <span>Terra Guidance</span>
              </button>

              {/* 10. Settings Dropdown & Items */}
              <div className="pt-2 border-t border-slate-100">
                <div 
                  onClick={() => setIsSettingsMenuExpanded(!isSettingsMenuExpanded)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-800 hover:bg-slate-100 cursor-pointer font-bold select-none"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="w-4 h-4 text-teal-600" />
                    <span>Settings</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isSettingsMenuExpanded ? 'rotate-180' : ''}`} />
                </div>

                {isSettingsMenuExpanded && (
                  <div className="pl-6 pr-2 py-1 space-y-1">
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setSettingsSubtab('password');
                        setIsHamburgerOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                        activeTab === 'settings' && settingsSubtab === 'password'
                          ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Key className="w-3.5 h-3.5 text-teal-600" />
                      <span>Change Password</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setSettingsSubtab('notifications');
                        setIsHamburgerOpen(false);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-xs ${
                        activeTab === 'settings' && settingsSubtab === 'notifications'
                          ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5 text-teal-600" />
                      <span>Notifications</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 11. Help and Support */}
              <button
                onClick={() => {
                  setActiveTab('customer_care');
                  setIsHamburgerOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'customer_care'
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-teal-600" />
                <span>Help and Support</span>
              </button>
            </div>

            {/* Logout Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/70">
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to log out from your Patient Portal?')) {
                    setIsHamburgerOpen(false);
                    onLogout?.();
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer hover:scale-[1.01]"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= AVATAR EDIT MODAL ================= */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Update Profile Photo</h3>
                  <p className="text-[11px] text-slate-500">Upload your personal photo or provide an image URL</p>
                </div>
              </div>
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Avatar Preview */}
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="p-1 rounded-2xl bg-white border-2 border-teal-500/30 shadow-lg">
                {renderPatientAvatar("w-24 h-24 text-2xl")}
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {patient.avatar ? 'Custom Photo Active' : 'Monogram Initials Active'}
              </span>
            </div>

            {/* Upload Options */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-teal-500/20 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo from Device</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2.5 text-[10px] text-slate-400 font-bold uppercase">or image link</span>
              </div>

              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://example.com/my-photo.jpg"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                />
                <button
                  type="button"
                  disabled={!customAvatarUrl.trim()}
                  onClick={() => saveNewAvatar(customAvatarUrl.trim())}
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs cursor-pointer transition-all"
                >
                  Apply Photo URL
                </button>
              </div>

              {patient.avatar && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="w-full py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Custom Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {avatarUploadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{avatarUploadSuccess}</span>
        </div>
      )}

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

      {/* Patient Top Identity Banner - Frosted Glass Card with Hamburger Button & Editable Avatar */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] p-5 sm:p-6 text-slate-800 shadow-xl shadow-slate-200/50 border border-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-sky-200/30 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center space-x-3.5">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsHamburgerOpen(true)}
              className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-teal-700 text-white hover:bg-teal-800 flex items-center space-x-2 font-bold text-xs cursor-pointer shadow-md shadow-teal-700/20 transition-all shrink-0 hover:scale-105"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline font-bold">Menu</span>
            </button>

            {/* Editable Profile Picture */}
            <div className="relative group shrink-0">
              {renderPatientAvatar("w-16 h-16 text-lg")}
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition-all hover:scale-110"
                title="Change Profile Photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{patient.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {calculateAge(patient.dob)} yrs
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Blood: {patient.bloodGroup || 'O+'}
                </span>
                {patient.maritalStatus && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {patient.maritalStatus}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Verified Patient
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                National ID: <strong className="text-slate-900 font-mono">{patient.nationalId}</strong> • Phone: <strong className="text-slate-900">{patient.phone}</strong> • Gender: <strong className="text-slate-900">{patient.gender || 'Female'}</strong>
              </p>
              <p className="text-[11px] text-teal-800 font-medium mt-1 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>SHA / NHIF: <strong className="font-mono">{patient.shaNumber || patient.insurancePolicyNumber || 'SHA-KEN-994102'}</strong> (Active Benefits)</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('admissions')}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-lg shadow-teal-500/25 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Bed className="w-4 h-4" />
              <span>Request Admission</span>
            </button>
            <button
              onClick={() => setActiveTab('book')}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-2xl text-xs flex items-center space-x-1.5 border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Book Doctor</span>
            </button>
            <button
              onClick={() => setIsHamburgerOpen(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center space-x-1.5 border border-slate-200/80 transition-all cursor-pointer"
              title="All Portal Modules"
            >
              <Sliders className="w-3.5 h-3.5 text-teal-600" />
              <span className="capitalize">{activeTab.replace('_', ' ')}</span>
            </button>
          </div>
        </div>
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
                <span>LAUNCH A TRIAGE</span>
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

      {/* ================= TAB: INPATIENT ADMISSIONS & PRE-ADMISSION QUEUE ================= */}
      {activeTab === 'admissions' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 shadow-xl shadow-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-600 text-white flex items-center justify-center shadow-lg shadow-teal-600/25 shrink-0">
                <Bed className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Inpatient Care & Admission Portal</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                    KMPDC Protocol
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Request hospital admission, track bed allocation, monitor daily inpatient bills, and view discharge summaries.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setAdmissionViewMode(admissionViewMode === 'overview' ? 'request_form' : 'overview')}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  admissionViewMode === 'request_form'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20'
                }`}
              >
                {admissionViewMode === 'request_form' ? (
                  <>
                    <Activity className="w-4 h-4" />
                    <span>View Inpatient Records</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Request New Admission</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Submission Notice Alerts */}
          {admissionSubmitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{admissionSubmitSuccess}</span>
            </div>
          )}

          {admissionSubmitError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{admissionSubmitError}</span>
            </div>
          )}

          {/* 1. ADMISSION REQUEST FORM (When Mode === 'request_form') */}
          {admissionViewMode === 'request_form' && (
            <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white p-6 sm:p-8 shadow-xl shadow-slate-200/40 space-y-6">
              <div className="border-b border-slate-200/60 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">Pre-Admission Request Form</h4>
                  <p className="text-xs text-slate-500">
                    Step 2: Submit clinical details for central hospital reception intake & bed verification.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  Pre-Admission
                </span>
              </div>

              {/* SHA / Profile Checklist Card */}
              <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 text-xs text-teal-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold flex items-center space-x-1.5 text-teal-950">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Step 1 Verified: Patient Profile & SHA Cover</span>
                  </span>
                  <p className="text-[11px] text-teal-800">
                    Patient: <strong>{patient.name}</strong> • Age: <strong>{calculateAge(patient.dob)} yrs</strong> • Blood: <strong>{patient.bloodGroup || 'O+'}</strong> • SHA/NHIF: <strong className="font-mono">{patient.shaNumber || patient.insurancePolicyNumber || 'SHA-KE-VERIFIED'}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="px-3 py-1.5 bg-white text-teal-800 hover:bg-teal-100 rounded-xl font-bold border border-teal-200 text-xs cursor-pointer shrink-0"
                >
                  Update Profile / SHA
                </button>
              </div>

              <form onSubmit={handleRequestAdmission} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Admission Reason */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">
                      Clinical Reason for Admission *
                    </label>
                    <select
                      value={selectedAdmissionReason}
                      onChange={(e) => setSelectedAdmissionReason(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20"
                      required
                    >
                      <option value="Acute Abdominal Pain / Surgical Observation">Acute Abdominal Pain / Surgical Observation</option>
                      <option value="Maternity / Labor & Delivery">Maternity / Labor & Delivery</option>
                      <option value="Severe Respiratory Infection / Oxygen Therapy">Severe Respiratory Infection / Oxygen Therapy</option>
                      <option value="Orthopedic Trauma / Fracture Stabilization">Orthopedic Trauma / Fracture Stabilization</option>
                      <option value="Cardiovascular / Chest Pain Telemetry">Cardiovascular / Chest Pain Telemetry</option>
                      <option value="Pediatric Inpatient Care">Pediatric Inpatient Care</option>
                      <option value="Post-Operative Inpatient Recovery">Post-Operative Inpatient Recovery</option>
                      <option value="General Inpatient Medical Care">General Inpatient Medical Care</option>
                    </select>
                  </div>

                  {/* Urgency Level */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">
                      Urgency Level *
                    </label>
                    <select
                      value={admissionUrgency}
                      onChange={(e) => setAdmissionUrgency(e.target.value as any)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20"
                      required
                    >
                      <option value="Urgent">Urgent (Requires bed within 1-2 hours)</option>
                      <option value="Emergency">Emergency (Immediate intake via A&E)</option>
                      <option value="Maternity / Delivery">Maternity / Labor & Delivery</option>
                      <option value="Elective">Elective / Scheduled Procedure</option>
                    </select>
                  </div>

                  {/* Preferred Ward */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">
                      Preferred Inpatient Ward / Wing *
                    </label>
                    <select
                      value={admissionPreferredWard}
                      onChange={(e) => setAdmissionPreferredWard(e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-teal-500/20"
                      required
                    >
                      <option value="St. Luke Surgical Wing">St. Luke Surgical Wing</option>
                      <option value="St. Jude General Medical Ward">St. Jude General Medical Ward</option>
                      <option value="Maternity & Neonatal Wing">Maternity & Neonatal Wing</option>
                      <option value="Pediatric Care Ward">Pediatric Care Ward</option>
                      <option value="ICU & High Dependency Unit (HDU)">ICU & High Dependency Unit (HDU)</option>
                      <option value="Executive Private Suite">Executive Private Suite</option>
                    </select>
                  </div>

                  {/* Referring Doctor / Clinic */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1.5">
                      Referring Doctor / Outpatient Clinic
                    </label>
                    <input
                      type="text"
                      value={admissionReferringDoc}
                      onChange={(e) => setAdmissionReferringDoc(e.target.value)}
                      placeholder="e.g. Dr. Patrick Omondi (Emergency Triage)"
                      className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                </div>

                {/* Symptoms / Complaints */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    Presenting Symptoms & Clinical Complaints *
                  </label>
                  <textarea
                    rows={3}
                    value={admissionSymptoms}
                    onChange={(e) => setAdmissionSymptoms(e.target.value)}
                    placeholder="Describe your current pain, duration of symptoms, fever, or doctor's prior notes..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:ring-2 focus:ring-teal-500/20 leading-relaxed"
                    required
                  />
                </div>

                {/* Admission Submission Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200/60">
                  <p className="text-[11px] text-slate-500">
                    By requesting admission, your record is queued immediately for Hospital Reception bed allocation.
                  </p>
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setAdmissionViewMode('overview')}
                      className="flex-1 sm:flex-initial px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-xs cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingAdmission}
                      className="flex-1 sm:flex-initial px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25 cursor-pointer transition-all hover:scale-[1.02]"
                    >
                      {isSubmittingAdmission ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Admission Request</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* 2. ADMISSION CARDS LIST / WORKFLOW STAGES */}
          {admissionViewMode === 'overview' && (
            <div className="space-y-6">
              {admissions.length === 0 ? (
                <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-12 text-center text-slate-500 shadow-xl shadow-slate-200/40 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto border border-teal-100">
                    <Bed className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">No Admission Records Found</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      You can request an inpatient admission directly from home. Central Reception will review bed availability and call you for intake.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdmissionViewMode('request_form')}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer inline-flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Request Inpatient Admission</span>
                  </button>
                </div>
              ) : (
                admissions.map((adm) => {
                  const isPending = adm.status === 'PENDING';
                  const isAdmitted = adm.status === 'ADMITTED';
                  const isDischarged = adm.status === 'DISCHARGED';

                  return (
                    <div
                      key={adm.id}
                      className="bg-white/70 backdrop-blur-2xl rounded-[2rem] border border-white p-6 sm:p-7 shadow-xl shadow-slate-200/40 space-y-5"
                    >
                      {/* Top Bar of Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md ${
                            isAdmitted
                              ? 'bg-emerald-600 shadow-emerald-600/20'
                              : isPending
                              ? 'bg-amber-500 shadow-amber-500/20'
                              : 'bg-slate-700 shadow-slate-700/20'
                          }`}>
                            <Bed className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base">{adm.reason}</h4>
                              <span className="font-mono text-xs text-slate-500">#{adm.id}</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Preferred Ward: <strong className="text-slate-800">{adm.preferredWard || adm.wardName || 'Surgical Wing'}</strong> • Urgency: <strong className="text-slate-800">{adm.urgency || 'Urgent'}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1.5 animate-pulse">
                              <Clock className="w-3.5 h-3.5" />
                              <span>PENDING RECEPTION QUEUE</span>
                            </span>
                          )}
                          {isAdmitted && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center space-x-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              <span>CURRENTLY ADMITTED</span>
                            </span>
                          )}
                          {isDischarged && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 flex items-center space-x-1.5">
                              <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                              <span>DISCHARGED & CLEARED</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* STAGE A: PENDING PRE-ADMISSION FILE (Workflow Steps 2 & 3) */}
                      {isPending && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <p className="font-bold flex items-center space-x-1.5 text-amber-900">
                                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                                <span>Hospital Reception is Reviewing Your Pre-Admission File</span>
                              </p>
                              <p className="text-[11px] text-amber-800 leading-relaxed">
                                Our central admissions intake desk has received your request. An intake coordinator will confirm ward bed availability and call you at <strong>{adm.patientPhone || patient.phone}</strong> for rapid admission.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCancelAdmission(adm.id)}
                              className="px-3.5 py-2 bg-white hover:bg-rose-50 text-rose-700 rounded-xl font-bold border border-rose-200 text-xs cursor-pointer shrink-0 transition-all"
                            >
                              Cancel Request
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Requested On</span>
                              <span className="font-semibold text-slate-800">{new Date(adm.createdAt || Date.now()).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Insurance Cover</span>
                              <span className="font-semibold text-slate-800">{adm.insuranceScheme || 'SHA / NHIF Verified'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Referring Doctor</span>
                              <span className="font-semibold text-slate-800">{adm.referringDoctor || 'Outpatient Triage'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STAGE B: ACTIVE INPATIENT STAY (Workflow Step 5) */}
                      {isAdmitted && (
                        <div className="space-y-5 text-xs">
                          {/* Bed & Attending Clinical Team */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-gradient-to-tr from-teal-50/80 to-emerald-50/80 p-4 rounded-2xl border border-teal-200/80">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-teal-800 block">Assigned Bed Number</span>
                              <span className="font-black text-sm text-teal-950 flex items-center space-x-1.5 mt-0.5">
                                <Bed className="w-4 h-4 text-teal-700" />
                                <span>{adm.assignedBedNumber || (adm as any).bedNumber || 'BED-SURG-04'}</span>
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-teal-800 block">Inpatient Ward</span>
                              <span className="font-bold text-xs text-teal-950 block mt-0.5">{adm.assignedWard || (adm as any).wardName || 'St. Luke Surgical Wing'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-teal-800 block">Attending Physician</span>
                              <span className="font-bold text-xs text-teal-950 block mt-0.5">{adm.attendingDoctorName || (adm as any).attendingDoctor || 'Dr. Patrick Omondi'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-teal-800 block">Primary Care Nurse</span>
                              <span className="font-bold text-xs text-teal-950 block mt-0.5">{adm.attendingNurseName || (adm as any).nurseInCharge || 'Sister Faith Chebet'}</span>
                            </div>
                          </div>

                          {/* Live Inpatient Bill & Daily Bed Charges */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                              <div>
                                <h5 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                                  <CreditCard className="w-4 h-4 text-teal-600" />
                                  <span>Live Running Inpatient Bill & Daily Charges</span>
                                </h5>
                                <p className="text-[11px] text-slate-500">
                                  Daily Bed Rate: KES {(adm.dailyBedRateKES || (adm as any).dailyRateKES || 4500).toLocaleString()}/day • Duration: {(adm as any).daysStayed || 2} Days
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Total Bill</span>
                                <span className="text-base sm:text-lg font-black text-teal-700 font-mono">
                                  KES {(adm.dailyAccruedBillKES || (adm as any).currentTotalBillKES || 24500).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Itemized Running Ledger */}
                            <div className="space-y-1.5">
                              {(adm.itemizedCharges && adm.itemizedCharges.length > 0 ? adm.itemizedCharges : [
                                { item: 'Inpatient Ward Bed & Accommodation (2 Days @ KES 4,500)', category: 'Bed Rate', costKES: 9000 },
                                { item: 'Nursing Care & Vitals Monitoring (Continuous)', category: 'Nursing', costKES: 3500 },
                                { item: 'Consultant Doctor Ward Rounds & Daily Review', category: 'Physician', costKES: 4000 },
                                { item: 'Inpatient IV Fluids & Antibiotic Regimen', category: 'Pharmacy', costKES: 4500 },
                                { item: 'Emergency Full Hemogram & CRP Lab Test', category: 'Laboratory', costKES: 3500 }
                              ]).map((c, i) => (
                                <div key={i} className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                  <span className="text-slate-700">{c.item}</span>
                                  <span className="font-bold font-mono text-slate-900">KES {c.costKES.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>

                            {/* Payment / SHA Coverage Box */}
                            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                              <div className="text-[11px] text-teal-900">
                                SHA / NHIF Benefit Scheme Coverage: <strong>Active (Estimated KES {(adm.shaCoveredKES || 18000).toLocaleString()} Covered)</strong>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setMpesaAmount(adm.currentTotalBillKES || 24500);
                                  setMpesaTitle(`Inpatient Bill Settlement (#${adm.id})`);
                                  setMpesaRef(`INP-${adm.id}`);
                                  setMpesaTargetAction('invoice');
                                  setMpesaModalOpen(true);
                                }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pay Inpatient Bill via M-PESA</span>
                              </button>
                            </div>
                          </div>

                          {/* Live Inpatient Lab Results Ready */}
                          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5">
                                <FlaskConical className="w-4 h-4 text-teal-600" />
                                <span>Inpatient Lab & Diagnostic Results Ready</span>
                              </h5>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Live Telemetry
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {(adm.labResultsReady && adm.labResultsReady.length > 0 ? adm.labResultsReady : [
                                { testName: 'Full Hemogram & White Blood Cell Count', date: 'Today, 07:30 AM', status: 'Ready', summary: 'WBC 11.2 (Mild leukocytosis resolving with IV antibiotics)' },
                                { testName: 'Serum Electrolytes & Renal Function (U&E)', date: 'Today, 08:15 AM', status: 'Ready', summary: 'Creatinine 82 µmol/L, Potassium 4.1 mmol/L (Normal range)' },
                                { testName: 'C-Reactive Protein (CRP) Quantitative', date: 'Yesterday, 04:00 PM', status: 'Ready', summary: 'CRP down to 18 mg/L (Inflammatory marker decreasing)' },
                                { testName: 'Abdominal Ultrasound Scan Review', date: 'Yesterday, 02:30 PM', status: 'Ready', summary: 'Mild appendix hyperemia, no free fluid or abscess noted' }
                              ]).map((lab, i) => (
                                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900 text-xs">{lab.testName}</span>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                      {lab.status}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600">{lab.summary}</p>
                                  <span className="text-[10px] text-slate-400 block">{lab.date}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STAGE C: POST-DISCHARGE SUMMARY + BILL + RECEIPT (Workflow Step After Discharge) */}
                      {isDischarged && (
                        <div className="space-y-4 text-xs">
                          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm flex items-center space-x-1.5 text-teal-900">
                                <FileCheck2 className="w-4 h-4 text-teal-600" />
                                <span>Official Hospital Discharge Summary & Clearance</span>
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                Discharged: {adm.dischargedAt ? new Date(adm.dischargedAt).toLocaleDateString() : (adm.dischargeDate || new Date().toISOString().split('T')[0])}
                              </span>
                            </div>
                            <p className="text-xs text-teal-900 leading-relaxed">
                              <strong>Clinical Outcome:</strong> {
                                typeof adm.dischargeSummary === 'string'
                                  ? adm.dischargeSummary
                                  : adm.dischargeSummary?.dischargeNotes || adm.dischargeSummary?.finalDiagnosis || (adm as any).inpatientDiagnosis || 'Patient treated for acute surgical presentation with IV antibiotics and supportive care. Condition stable, vital signs normal, ambulating comfortably and cleared for home recovery.'
                              }
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                              <div>
                                <strong>Home Medications:</strong> {
                                  Array.isArray(adm.dischargeSummary?.homeMedications)
                                    ? adm.dischargeSummary.homeMedications.join(', ')
                                    : (typeof (adm as any).dischargeMedications === 'string'
                                        ? (adm as any).dischargeMedications
                                        : 'Amoxicillin/Clavulanate 625mg PO BID x 5 days, Paracetamol 1g PO TID PRN.')
                                }
                              </div>
                              <div>
                                <strong>Follow-up Clinic Date:</strong> {
                                  (typeof adm.dischargeSummary === 'object' && adm.dischargeSummary?.followUpDate)
                                    ? adm.dischargeSummary.followUpDate
                                    : ((adm as any).followUpDate || '2 Weeks at Surgical Outpatient Clinic')
                                }
                              </div>
                            </div>
                          </div>

                          {/* Final Bill + M-PESA Receipt Card */}
                          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-1">
                              <h5 className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                                <Receipt className="w-4 h-4 text-teal-600" />
                                <span>Final Hospital Bill & Official M-PESA Receipt</span>
                              </h5>
                              <span className="text-xs font-mono font-bold text-emerald-700">
                                Receipt Ref: {adm.finalBill?.mpesaReceiptNumber || (adm as any).mpesaReceiptRef || 'QHK892LK19'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Inpatient Bill</span>
                                <span className="font-bold text-slate-800">KES {(adm.finalBill?.totalKES || (adm as any).finalGrossBillKES || adm.dailyAccruedBillKES || 32000).toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">SHA / NHIF Covered Amount</span>
                                <span className="font-bold text-emerald-700">- KES {(adm.finalBill?.shaCoverageKES || (adm as any).shaCoveredKES || 22000).toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Paid via M-PESA</span>
                                <span className="font-black text-teal-700">KES {(adm.finalBill?.patientPayableKES || (adm as any).netPaidKES || 10000).toLocaleString()} (CLEARED)</span>
                              </div>
                            </div>

                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  alert(`Official Discharge Summary & Clearance Receipt #${adm.id} downloaded.`);
                                }}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition-all"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download Discharge Summary & Receipt</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB: PATIENT PROFILE ================= */}
      {activeTab === 'profile' && (
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 sm:p-8 shadow-xl shadow-slate-200/40 max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-200/60 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Personal Patient Information & Identity</h3>
              <p className="text-xs text-slate-500">Manage contact details, blood group, marital status, and SHA health card.</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Verified ID
            </span>
          </div>

          {/* Profile Picture Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900/5 via-sky-900/5 to-teal-900/5 border border-teal-600/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                {renderPatientAvatar("w-20 h-20 text-xl")}
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition-all hover:scale-110"
                  title="Upload New Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{patient.name}</h4>
                <p className="text-xs text-slate-500">
                  {patient.avatar ? 'Custom profile photo uploaded' : 'Default initials monogram active'}
                </p>
                <p className="text-[11px] text-teal-700 font-medium mt-0.5">
                  Formats: JPG, PNG, WEBP (Max 5MB) • No AI Generation
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl cursor-pointer transition-all"
              >
                Edit URL
              </button>
              {patient.avatar && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl cursor-pointer transition-all"
                  title="Remove Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* SHA Upload Notice Alert */}
          {shaUploadNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{shaUploadNotice}</span>
            </div>
          )}

          {/* Social Health Authority (SHA / NHIF) Registration & Upload Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-3 gap-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                  SHA
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Social Health Authority (SHA / NHIF) Registration</h4>
                  <p className="text-[11px] text-slate-500">Upload your SHA/NHIF membership card for automated inpatient admission & insurance claims</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                Verified SHA Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">SHA / SHIF Membership Number</label>
                <input
                  type="text"
                  placeholder="e.g. SHA-KEN-994102"
                  value={patient.shaNumber || patient.insurancePolicyNumber || ''}
                  onChange={(e) => onUpdatePatient({ ...patient, shaNumber: e.target.value, insurancePolicyNumber: e.target.value })}
                  className="w-full p-3 bg-white border border-slate-200 rounded-2xl font-mono text-slate-800 font-semibold focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">SHA Card / Document Upload</label>
                <input
                  type="file"
                  ref={shaFileInputRef}
                  onChange={handleUploadShaCard}
                  accept=".pdf,image/*"
                  className="hidden"
                />
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => shaFileInputRef.current?.click()}
                    className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{patient.shaDocumentName ? 'Replace SHA Card' : 'Upload SHA Card'}</span>
                  </button>
                  {patient.shaDocumentName && (
                    <button
                      type="button"
                      onClick={() => alert(`Viewing uploaded SHA Document: ${patient.shaDocumentName}`)}
                      className="py-3 px-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl font-bold text-xs cursor-pointer"
                      title="View SHA Card"
                    >
                      <Eye className="w-4 h-4 text-teal-600" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {patient.shaDocumentName ? `Uploaded: ${patient.shaDocumentName}` : 'Accepted formats: PDF, JPG, PNG (Max 8MB)'}
                </p>
              </div>
            </div>
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

            {/* Editable Blood Group Dropdown */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Blood Group (Displays on Profile & Badge) *
              </label>
              <select
                value={patient.bloodGroup || 'O+'}
                onChange={(e) => onUpdatePatient({ ...patient, bloodGroup: e.target.value })}
                className="w-full p-3 bg-white/90 border border-slate-200 rounded-2xl font-bold text-rose-700 focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="A+">A+ (A Positive)</option>
                <option value="A-">A- (A Negative)</option>
                <option value="B+">B+ (B Positive)</option>
                <option value="B-">B- (B Negative)</option>
                <option value="AB+">AB+ (AB Positive)</option>
                <option value="AB-">AB- (AB Negative)</option>
                <option value="O+">O+ (O Positive)</option>
                <option value="O-">O- (O Negative)</option>
              </select>
            </div>

            {/* Editable Marital Status Dropdown */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Marital Status *
              </label>
              <select
                value={patient.maritalStatus || 'Single'}
                onChange={(e) => onUpdatePatient({ ...patient, maritalStatus: e.target.value as MaritalStatus })}
                className="w-full p-3 bg-white/90 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </select>
            </div>

            {/* Dynamic Calculated Age & DOB */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">Date of Birth</label>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  Age: {calculateAge(patient.dob)} yrs old
                </span>
              </div>
              <input
                type="date"
                value={patient.dob}
                onChange={(e) => onUpdatePatient({ ...patient, dob: e.target.value })}
                className="w-full p-3 bg-white/90 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Gender</label>
              <select
                value={patient.gender || 'Female'}
                onChange={(e) => onUpdatePatient({ ...patient, gender: e.target.value as any })}
                className="w-full p-3 bg-white/90 border border-slate-200 rounded-2xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
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

            <div className="md:col-span-2">
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
              onClick={async () => {
                try {
                  localStorage.setItem('terralink_current_patient_profile', JSON.stringify(patient));
                  await fetch(`/api/patients/${patient.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(patient)
                  });
                  alert('Patient profile, blood group, calculated age, marital status, and SHA details updated successfully!');
                } catch (err) {
                  alert('Patient profile saved locally.');
                }
              }}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-teal-500/20 cursor-pointer hover:scale-[1.02] flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 10: SETTINGS (PASSWORD CHANGE & NOTIFICATIONS) ================= */}
      {activeTab === 'settings' && (
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white p-6 sm:p-8 shadow-xl shadow-slate-200/40 max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-200/60 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Account Security & Notification Settings</h3>
              <p className="text-xs text-slate-500">Update your login password and configure live SMS / email health notifications.</p>
            </div>
            <Settings className="w-5 h-5 text-teal-600" />
          </div>

          {/* Subtab navigation */}
          <div className="flex space-x-2 bg-slate-100/80 p-1.5 rounded-2xl text-xs font-bold border border-slate-200/60">
            <button
              type="button"
              onClick={() => setSettingsSubtab('password')}
              className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                settingsSubtab === 'password'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
            <button
              type="button"
              onClick={() => setSettingsSubtab('notifications')}
              className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                settingsSubtab === 'notifications'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notification Preferences</span>
            </button>
          </div>

          {/* SUBTAB 1: CHANGE PASSWORD */}
          {settingsSubtab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Security Notice</span>
                </p>
                <p className="text-[11px] text-amber-800">
                  Changing your password will update your credentials for your national ID / email / phone login. Choose a strong password containing at least 6 characters.
                </p>
              </div>

              {passwordChangeStatus.message && (
                <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2 ${
                  passwordChangeStatus.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {passwordChangeStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordChangeStatus.message}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Current Password (Optional if first time)</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPasswordInput}
                      onChange={(e) => setCurrentPasswordInput(e.target.value)}
                      placeholder="Enter current password if known"
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl font-medium text-slate-800 pr-11 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">New Password *</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="Enter new password (min. 6 characters)"
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl font-medium text-slate-800 pr-11 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Confirm New Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl font-medium text-slate-800 pr-11 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordChangeStatus.type === 'loading'}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-md shadow-teal-500/20 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {passwordChangeStatus.type === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  <span>Update & Memorize Password</span>
                </button>
              </div>
            </form>
          )}

          {/* SUBTAB 2: NOTIFICATIONS */}
          {settingsSubtab === 'notifications' && (
            <div className="space-y-4">
              {notifSaveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{notifSaveSuccess}</span>
                </div>
              )}

              <div className="space-y-3">
                {[
                  {
                    key: 'smsAlerts',
                    label: 'SMS Notifications (M-PESA & Verification Codes)',
                    desc: `Direct SMS sent to ${patient.phone} for token verifications and receipts.`
                  },
                  {
                    key: 'emailReports',
                    label: 'Email Diagnostic Reports & Discharge Summaries',
                    desc: `Receive signed lab and radiology PDF reports at ${patient.email}.`
                  },
                  {
                    key: 'queueAlerts',
                    label: 'Live Queue & Waiting Room Call-outs',
                    desc: 'Real-time alert when your token is called at Triage, Doctor room, or Pharmacy.'
                  },
                  {
                    key: 'refillReminders',
                    label: 'Prescription Refill & Medication Adherence Reminders',
                    desc: 'Automated 3-day refill notifications for chronic and maintenance prescriptions.'
                  },
                  {
                    key: 'insuranceAlerts',
                    label: 'SHIF / NHIF Pre-Authorization & Billing Alerts',
                    desc: 'Instant updates regarding claim submissions, co-pays, and scheme balances.'
                  },
                  {
                    key: 'emergencyTraumaAlerts',
                    label: 'Emergency & Red-Flag Escalation Alerts',
                    desc: 'High-priority SMS & in-app alerts if emergency doctor requires immediate admission.'
                  }
                ].map((item) => {
                  const isChecked = (notifPrefs as any)[item.key] ?? true;
                  return (
                    <div 
                      key={item.key} 
                      onClick={() => setNotifPrefs(prev => ({ ...prev, [item.key]: !isChecked }))}
                      className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 flex items-center justify-between gap-4 cursor-pointer hover:border-teal-500/40 transition-all select-none"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.label}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <div className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                        isChecked ? 'bg-teal-600' : 'bg-slate-300'
                      }`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          isChecked ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={isSavingNotifs}
                  onClick={handleSaveNotificationPreferences}
                  className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-xs flex items-center space-x-2 shadow-md shadow-teal-500/20 cursor-pointer transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSavingNotifs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                  <span>Save Notification Preferences</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
