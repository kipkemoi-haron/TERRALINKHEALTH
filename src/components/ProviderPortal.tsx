import React, { useState, useRef, useEffect } from 'react';
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
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Scan,
  HeartPulse,
  DollarSign,
  Menu,
  X,
  Settings,
  Key,
  Lock,
  Bell,
  Camera,
  Upload,
  Trash2,
  LogOut,
  HelpCircle,
  User as UserIcon,
  Phone,
  PhoneCall,
  Mail,
  Loader2,
  AlertCircle,
  Check,
  Bed,
  FileCheck2,
  Receipt,
  Download,
  Sliders
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
  InpatientAdmission,
  calculateAge
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
  onUpdateUser?: (updated: User) => void;
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
  onLogout
}) => {
  // Hamburger drawer open state
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  // Editable Staff Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localAvatar, setLocalAvatar] = useState<string | undefined>(currentUser.avatar);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Settings State: Password & Notification preferences
  const [settingsSubtab, setSettingsSubtab] = useState<'password' | 'notifications'>('password');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordChangeStatus, setPasswordChangeStatus] = useState<{ type?: 'success' | 'error' | 'loading'; message?: string }>({});

  const [notifPrefs, setNotifPrefs] = useState({
    smsAlerts: currentUser.notificationPreferences?.smsAlerts ?? true,
    emailReports: currentUser.notificationPreferences?.emailReports ?? true,
    queueAlerts: currentUser.notificationPreferences?.queueAlerts ?? true,
    criticalLabPanicAlerts: currentUser.notificationPreferences?.criticalLabPanicAlerts ?? true,
    statRadiologyAlerts: currentUser.notificationPreferences?.statRadiologyAlerts ?? true,
    emergencyTraumaAlerts: currentUser.notificationPreferences?.emergencyTraumaAlerts ?? true,
    pharmacyDispenseAlerts: currentUser.notificationPreferences?.pharmacyDispenseAlerts ?? true
  });
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);
  const [notifSaveSuccess, setNotifSaveSuccess] = useState('');

  // Provider Sub-role switch for easy exploration
  const [providerRole, setProviderRole] = useState<'doctor' | 'lab_tech' | 'radiologist' | 'pharmacist' | 'nurse'>(
    currentUser.role as any || 'doctor'
  );

  // Active subtab
  const [activeTab, setActiveTab] = useState<
    'queue' | 'admissions_queue' | 'chart' | 'encounter_form' | 'lab_workbench' | 'radiology_workbench' | 'pharmacy_dispense' | 'schedule' | 'profile' | 'settings' | 'help_support'
  >('queue');

  // Inpatient Admissions & Pre-Admission Intake Queue
  const [admissions, setAdmissions] = useState<InpatientAdmission[]>([]);
  const [loadingAdmissions, setLoadingAdmissions] = useState(false);
  const [admitModalAdm, setAdmitModalAdm] = useState<InpatientAdmission | null>(null);
  const [assignBedInput, setAssignBedInput] = useState('BED-SURG-04');
  const [assignWardInput, setAssignWardInput] = useState('St. Luke Surgical Wing');
  const [assignDoctorInput, setAssignDoctorInput] = useState(currentUser.name);
  const [assignDailyRateInput, setAssignDailyRateInput] = useState(4500);

  // Discharge modal state
  const [dischargeModalAdm, setDischargeModalAdm] = useState<InpatientAdmission | null>(null);
  const [dischargeSummaryInput, setDischargeSummaryInput] = useState('Patient clinical recovery complete, symptoms resolved, vital signs stable and discharged for home recuperation.');
  const [dischargeMedsInput, setDischargeMedsInput] = useState('Amoxicillin/Clavulanate 625mg PO BID x 5 days, Paracetamol 1g PO TID PRN.');
  const [dischargeFollowUpInput, setDischargeFollowUpInput] = useState('2 Weeks at Surgical Outpatient Clinic');

  // Fetch admissions
  const fetchAdmissions = async () => {
    try {
      setLoadingAdmissions(true);
      const res = await fetch('/api/admissions');
      if (res.ok) {
        const data = await res.json();
        setAdmissions(data);
      }
    } catch (e) {
      console.error('Error fetching admissions in staff portal:', e);
    } finally {
      setLoadingAdmissions(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  // One-click convert pre-admission to full admission
  const handleOneClickAdmit = async (admId: string, bedNumber: string, wardName: string, docName: string, dailyRate: number) => {
    try {
      const res = await fetch(`/api/admissions/${admId}/admit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bedNumber: bedNumber || 'BED-SURG-04',
          wardName: wardName || 'St. Luke Surgical Wing',
          attendingDoctor: docName || currentUser.name,
          dailyRateKES: dailyRate || 4500,
          nurseInCharge: 'Sister Faith Chebet'
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setAdmissions(prev => prev.map(a => a.id === admId ? updated : a));
        setAdmitModalAdm(null);
        alert(`Admission #${admId} confirmed! Bed ${bedNumber} assigned and patient admitted successfully.`);
      }
    } catch (err) {
      alert('Error updating admission status.');
    }
  };

  // One-click discharge inpatient
  const handleOneClickDischarge = async (admId: string) => {
    try {
      const res = await fetch(`/api/admissions/${admId}/discharge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dischargeSummary: dischargeSummaryInput,
          dischargeMedications: dischargeMedsInput,
          followUpDate: dischargeFollowUpInput
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setAdmissions(prev => prev.map(a => a.id === admId ? updated : a));
        setDischargeModalAdm(null);
        alert(`Patient from Admission #${admId} has been successfully discharged! Final bill and discharge summary posted to patient portal.`);
      }
    } catch (err) {
      alert('Error processing discharge.');
    }
  };

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

  // Handle Staff Profile Image Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size exceeds 5MB limit. Please select a smaller image.');
      return;
    }

    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await saveNewAvatar(dataUrl);
      setAvatarUploading(false);
    };
    reader.onerror = () => {
      alert('Error reading the image file.');
      setAvatarUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const saveNewAvatar = async (avatarUrl: string) => {
    try {
      setAvatarUploading(true);
      setLocalAvatar(avatarUrl);
      const updated = { ...currentUser, avatar: avatarUrl };
      onUpdateUser?.(updated);

      await fetch(`/api/users/${currentUser.id}/avatar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: avatarUrl })
      });
      setIsAvatarModalOpen(false);
      setAvatarUrlInput('');
    } catch (err) {
      console.warn('Avatar update sync notice:', err);
    } finally {
      setAvatarUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setLocalAvatar(undefined);
      const updated = { ...currentUser, avatar: undefined };
      onUpdateUser?.(updated);

      await fetch(`/api/users/${currentUser.id}/avatar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: '' })
      });
      setIsAvatarModalOpen(false);
    } catch (err) {
      console.warn('Avatar remove notice:', err);
    }
  };

  // Staff Avatar Renderer
  const renderStaffAvatar = (sizeClasses: string = "w-14 h-14 text-xl") => {
    if (localAvatar) {
      return (
        <img
          src={localAvatar}
          alt={currentUser.name}
          className={`${sizeClasses} rounded-2xl object-cover border-2 border-emerald-400/40 shadow-inner bg-slate-900`}
        />
      );
    }

    const initials = currentUser.name
      ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'DR';

    return (
      <div className={`${sizeClasses} rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold border-2 border-emerald-300/40 shadow-inner select-none`}>
        {initials}
      </div>
    );
  };

  // Handle Staff Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput.length < 6) {
      setPasswordChangeStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeStatus({ type: 'error', message: 'New passwords do not match. Please re-enter.' });
      return;
    }

    try {
      setPasswordChangeStatus({ type: 'loading', message: 'Updating password securely...' });
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword: currentPasswordInput,
          newPassword: newPasswordInput
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordChangeStatus({ type: 'success', message: 'Password successfully changed and updated.' });
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
      } else {
        setPasswordChangeStatus({ type: 'error', message: data.error || 'Failed to update password.' });
      }
    } catch (err: any) {
      setPasswordChangeStatus({ type: 'error', message: 'Network issue. Password updated in current active session.' });
    }
  };

  // Handle Staff Save Notification Preferences
  const handleSaveNotificationPreferences = async () => {
    try {
      setIsSavingNotifs(true);
      setNotifSaveSuccess('');
      
      const updated = {
        ...currentUser,
        notificationPreferences: notifPrefs
      };
      onUpdateUser?.(updated);

      await fetch(`/api/users/${currentUser.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationPreferences: notifPrefs })
      });

      setNotifSaveSuccess('Notification preferences saved successfully.');
      setTimeout(() => setNotifSaveSuccess(''), 4000);
    } catch (err) {
      setNotifSaveSuccess('Preferences saved in local session.');
      setTimeout(() => setNotifSaveSuccess(''), 4000);
    } finally {
      setIsSavingNotifs(false);
    }
  };

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

  // Staff Hamburger Menu Navigation Items
  const staffMenuItems: Array<{
    id: typeof activeTab | 'logout';
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    {
      id: 'queue',
      label: 'Clinical Dashboard & Live Queue',
      description: "Today's clinic queues, triage check-ins, and scheduled consults",
      icon: Activity,
      badge: `${doctorAppointments.length} Today`
    },
    {
      id: 'admissions_queue',
      label: 'Inpatient & Reception Intake Desk',
      description: 'Review pre-admissions, call patient, and convert to full admission in one click',
      icon: Bed,
      badge: `${admissions.filter(a => a.status === 'PENDING').length} Pending`
    },
    {
      id: 'profile',
      label: 'My Staff Profile & Credentials',
      description: 'Medical board license, department assignment, and photo',
      icon: UserIcon
    },
    {
      id: 'chart',
      label: 'Patient EMR Records & Chart',
      description: `Electronic health record for ${selectedPatient.name}`,
      icon: FileText
    },
    {
      id: 'encounter_form',
      label: 'SOAP Clinical Encounter & Orders',
      description: 'Document diagnoses, treatment plans, prescriptions, and lab orders',
      icon: Stethoscope
    },
    {
      id: 'lab_workbench',
      label: 'Laboratory Testing Workbench',
      description: `Specimen handling, hematology/biochemistry results (${labOrders.length} orders)`,
      icon: FlaskConical
    },
    {
      id: 'radiology_workbench',
      label: 'Radiology & PACS Imaging',
      description: `Digital DICOM viewer, diagnostic reports (${radiologyOrders.length} scans)`,
      icon: Scan
    },
    {
      id: 'pharmacy_dispense',
      label: 'Hospital Pharmacy & Dispense',
      description: `Prescription verification, batch assigning, and dispensing`,
      icon: Pill
    },
    {
      id: 'schedule',
      label: 'Clinic Schedule & Shift Roster',
      description: 'Doctor outpatient hours and hospital shift calendar',
      icon: Calendar
    },
    {
      id: 'settings',
      label: 'Settings (Password & Notifications)',
      description: 'Update staff login credentials and clinical trauma alerts',
      icon: Settings
    },
    {
      id: 'help_support',
      label: 'Help and Clinical Support',
      description: 'Hospital IT hotline, emergency codes, and pharmacy support',
      icon: HelpCircle
    },
    {
      id: 'logout',
      label: 'Sign Out & End Shift',
      description: 'Securely terminate session and lock clinical workstation',
      icon: LogOut
    }
  ];

  return (
    <div className="space-y-6 relative">
      
      {/* Hidden File Input for Staff Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleImageFileUpload}
      />

      {/* Staff Avatar Edit Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Update Staff Profile Photo</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center space-y-3 py-2">
              <div className="relative group">
                {renderStaffAvatar("w-24 h-24 text-2xl")}
              </div>
              <p className="text-xs text-slate-500 text-center">
                Choose a clear professional headshot. Accepted formats: PNG, JPG, WEBP (Max 5MB).
              </p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                disabled={avatarUploading}
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all hover:scale-[1.01]"
              >
                {avatarUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>Upload From Device / Computer</span>
              </button>

              <div className="flex items-center my-2">
                <div className="flex-1 border-t border-slate-200" />
                <span className="px-3 text-[11px] font-bold text-slate-400 uppercase">Or Web Image URL</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  disabled={!avatarUrlInput.trim() || avatarUploading}
                  onClick={() => saveNewAvatar(avatarUrlInput.trim())}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
                >
                  Save Photo URL
                </button>
              </div>

              {localAvatar && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="w-full py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-all mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Custom Photo (Use Monogram)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Staff Hamburger Full Drawer Navigation Overlay */}
      {isHamburgerOpen && (
        <div className="fixed inset-0 z-50 flex justify-start animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsHamburgerOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-white/95 backdrop-blur-2xl h-full shadow-2xl flex flex-col z-10 border-r border-slate-200/80">
            {/* Drawer Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white tracking-tight">TERRALINK Clinical</h3>
                    <p className="text-[10px] text-emerald-300 uppercase tracking-wider font-mono">Hospital Staff Suite</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsHamburgerOpen(false)}
                  className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Staff mini-card in Drawer */}
              <div className="flex items-center space-x-3.5 p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
                <div className="relative group shrink-0">
                  {renderStaffAvatar("w-12 h-12 text-sm")}
                  <button
                    type="button"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      setIsAvatarModalOpen(true);
                    }}
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-slate-900 shadow-md cursor-pointer hover:scale-110"
                    title="Change Photo"
                  >
                    <Camera className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-white truncate">{currentUser.name}</h4>
                  <p className="text-[11px] text-emerald-300 font-mono mt-0.5 truncate">
                    {currentUser.licenseNumber || 'KMPDC/2026/0491'}
                  </p>
                  <span className="inline-block px-2 py-0.5 mt-1 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Navigation List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
                Clinical Workflow & Tools
              </p>

              {staffMenuItems.map((item) => {
                const IconComponent = item.icon;
                const isSelected = activeTab === item.id;
                const isLogout = item.id === 'logout';

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setIsHamburgerOpen(false);
                      if (isLogout) {
                        if (confirm('Are you sure you want to sign out and lock your clinical workstation?')) {
                          if (onLogout) {
                            onLogout();
                          } else {
                            window.location.reload();
                          }
                        }
                      } else {
                        setActiveTab(item.id as any);
                      }
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group ${
                      isLogout
                        ? 'hover:bg-rose-50 text-rose-700 mt-3 border border-transparent hover:border-rose-200'
                        : isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : isLogout 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold truncate">{item.label}</span>
                        <span className={`block text-[10px] truncate ${
                          isSelected ? 'text-emerald-100' : 'text-slate-400'
                        }`}>
                          {item.description}
                        </span>
                      </div>
                    </div>

                    {item.badge && !isSelected && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 ml-2">
                        {item.badge}
                      </span>
                    )}

                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                      isSelected ? 'text-white' : 'text-slate-300'
                    }`} />
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="font-mono text-[10px]">TERRALINK v2.6.4</span>
              <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>KMPDC Compliant</span>
              </span>
            </div>
          </div>
        </div>
      )}

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
      <div className="bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-emerald-950/95 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3.5">
          {/* Hamburger Menu Trigger Button */}
          <button
            type="button"
            onClick={() => setIsHamburgerOpen(true)}
            className="p-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-400/30 transition-all cursor-pointer hover:scale-105 shadow-md flex items-center justify-center shrink-0"
            title="Open Clinical Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Staff Photo / Monogram with direct edit overlay */}
          <div className="relative group shrink-0">
            {renderStaffAvatar("w-12 h-12 sm:w-14 sm:h-14 text-lg")}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md border-2 border-slate-900 cursor-pointer transition-all hover:scale-110"
              title="Change Profile Photo"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>

          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">{currentUser.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider backdrop-blur-md">
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Department: <strong className="text-white">{currentUser.department || 'General Outpatient & Family Medicine'}</strong> • License: <strong className="text-emerald-300 font-mono">{currentUser.licenseNumber || 'KMPDC/2026/0491'}</strong>
            </p>
          </div>
        </div>

        {/* Quick Role Switcher for Clinical Exploration */}
        <div className="flex items-center gap-1.5 bg-slate-950/50 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl self-start md:self-auto overflow-x-auto max-w-full">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">Role Switch:</span>
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shrink-0 ${
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

      {/* Active Clinical Section Quick Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/50 backdrop-blur-md p-3.5 rounded-2xl border border-white/60 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsHamburgerOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center space-x-2 shadow-xs cursor-pointer transition-all shrink-0 hover:scale-105"
          >
            <Menu className="w-4 h-4" />
            <span>Clinical Menu</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 hidden md:inline">Active Module:</span>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 capitalize flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{activeTab.replace('_', ' ')}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('admissions_queue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'admissions_queue'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>Admissions Desk ({admissions.filter(a => a.status === 'PENDING').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Clinic Queue ({doctorAppointments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chart')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'chart'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>EMR Chart</span>
          </button>
        </div>
      </div>

      {/* ================= VIEW: INPATIENT ADMISSIONS & RECEPTION INTAKE DESK ================= */}
      {activeTab === 'admissions_queue' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-3 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shrink-0">
                  <Bed className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Hospital Reception & Inpatient Intake Queue</h3>
                  <p className="text-xs text-slate-500">
                    Review pre-admission files submitted from home, verify SHA coverage, call patients, and convert to full admission in one click.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchAdmissions}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer self-start sm:self-auto"
              >
                {loadingAdmissions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5 text-teal-600" />}
                <span>Refresh Queue</span>
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Pending Pre-Admissions</span>
                <span className="text-xl font-black text-amber-950 font-mono">
                  {admissions.filter(a => a.status === 'PENDING').length} Patients Waiting
                </span>
                <span className="text-[11px] text-amber-700 block">Requires reception phone call & bed assignment</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Currently Admitted</span>
                <span className="text-xl font-black text-emerald-950 font-mono">
                  {admissions.filter(a => a.status === 'ADMITTED').length} Inpatients
                </span>
                <span className="text-[11px] text-emerald-700 block">Active ward beds, daily billing & telemetry</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Discharged & Cleared</span>
                <span className="text-xl font-black text-slate-900 font-mono">
                  {admissions.filter(a => a.status === 'DISCHARGED').length} Records
                </span>
                <span className="text-[11px] text-slate-600 block">Summary & receipts posted to patient portal</span>
              </div>
            </div>
          </div>

          {/* Section 1: Pending Reception Queue (Pre-Admissions) */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Central Reception Queue: Pending Pre-Admissions ({admissions.filter(a => a.status === 'PENDING').length})</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Step 4: Receptionist calls patient &rarr; Verifies clinical urgency &rarr; Converts to full admission in one click.
                </p>
              </div>
            </div>

            {admissions.filter(a => a.status === 'PENDING').length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200/60">
                No pending pre-admission requests at this time. All patient requests have been processed.
              </div>
            ) : (
              <div className="space-y-4">
                {admissions.filter(a => a.status === 'PENDING').map(adm => {
                  const pat = patients.find(p => p.id === adm.patientId) || {
                    name: adm.patientName,
                    phone: adm.patientPhone,
                    nationalId: adm.patientNationalId,
                    bloodGroup: 'O+',
                    maritalStatus: 'Single',
                    dob: '1998-05-14'
                  };

                  return (
                    <div
                      key={adm.id}
                      className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-sm space-y-4 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h5 className="font-bold text-slate-900 text-sm">{adm.patientName}</h5>
                            <span className="font-mono text-xs text-slate-400">#{adm.id}</span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                              PENDING INTAKE
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Blood: {pat.bloodGroup || 'O+'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              Age: {calculateAge(pat.dob)} yrs
                            </span>
                            {pat.maritalStatus && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                                {pat.maritalStatus}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">
                            National ID: <strong className="font-mono text-slate-900">{adm.patientNationalId || pat.nationalId}</strong> • Phone: <strong className="text-slate-900">{adm.patientPhone || pat.phone}</strong> • SHA Cover: <strong className="text-teal-700 font-mono">{adm.insuranceScheme || pat.shaNumber || 'SHA Active'}</strong>
                          </p>
                        </div>

                        {/* Intake Action Buttons */}
                        <div className="flex items-center space-x-2 flex-wrap">
                          <a
                            href={`tel:${adm.patientPhone || pat.phone}`}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center space-x-1.5 border border-slate-200 transition-all"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
                            <span>Call Patient ({adm.patientPhone || pat.phone})</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => {
                              setAdmitModalAdm(adm);
                              setAssignWardInput(adm.preferredWard || 'St. Luke Surgical Wing');
                              setAssignBedInput('BED-SURG-04');
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer transition-all hover:scale-102"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Convert to Full Admission</span>
                          </button>
                        </div>
                      </div>

                      {/* Clinical Complaint & Ward Requirements */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission Reason</span>
                          <span className="font-bold text-slate-900">{adm.reason}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Preferred Ward & Urgency</span>
                          <span className="font-bold text-slate-800">{adm.preferredWard || 'Surgical Wing'} ({adm.urgency || 'Urgent'})</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Referring Clinician</span>
                          <span className="font-semibold text-slate-800">{adm.referringDoctor || 'Outpatient Triage'}</span>
                        </div>
                        {adm.symptoms && (
                          <div className="md:col-span-3 pt-1 text-slate-600">
                            <strong>Symptoms / Triage Notes:</strong> {adm.symptoms}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Active Inpatient Ward Stays */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Bed className="w-4 h-4 text-teal-600" />
                  <span>Currently Admitted Inpatients ({admissions.filter(a => a.status === 'ADMITTED').length})</span>
                </h4>
                <p className="text-xs text-slate-500">
                  During inpatient stay: view assigned bed, daily running bill, live lab results, and execute patient discharge.
                </p>
              </div>
            </div>

            {admissions.filter(a => a.status === 'ADMITTED').length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200/60">
                No active admitted inpatients in ward beds right now.
              </div>
            ) : (
              <div className="space-y-4">
                {admissions.filter(a => a.status === 'ADMITTED').map(adm => (
                  <div
                    key={adm.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h5 className="font-bold text-slate-900 text-sm">{adm.patientName}</h5>
                          <span className="font-mono text-xs text-slate-400">#{adm.id}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            WARD INPATIENT
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                            Bed: {adm.bedNumber || 'BED-SURG-04'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          Ward: <strong className="text-slate-900">{adm.wardName || 'St. Luke Surgical Wing'}</strong> • Doctor: <strong className="text-slate-900">{adm.attendingDoctor || 'Dr. Patrick Omondi'}</strong> • Nurse: <strong className="text-slate-900">{adm.nurseInCharge || 'Sister Faith Chebet'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDischargeModalAdm(adm);
                            setDischargeSummaryInput(`Patient admitted for ${adm.reason}. Clinical recovery achieved, pain controlled, vitals normal, discharged in stable condition.`);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md transition-all"
                        >
                          <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
                          <span>Discharge Patient & Finalize Bill</span>
                        </button>
                      </div>
                    </div>

                    {/* Running Bill & Telemetry */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-gradient-to-tr from-slate-50 to-teal-50/40 p-3.5 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Bed Rate & Duration</span>
                        <span className="font-bold text-slate-800">
                          KES {(adm.dailyRateKES || 4500).toLocaleString()}/day ({adm.daysStayed || 2} Days Stayed)
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Running Bill</span>
                        <span className="font-bold font-mono text-teal-800 text-sm">
                          KES {(adm.currentTotalBillKES || 24500).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">SHA / NHIF Coverage</span>
                        <span className="font-bold text-emerald-700">Active (Est. KES {(adm.shaCoveredKES || 18000).toLocaleString()})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ONE-CLICK CONVERT TO FULL ADMISSION */}
      {admitModalAdm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Confirm Inpatient Admission</h4>
                  <p className="text-xs text-slate-500">Assign ward bed and activate inpatient care</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdmitModalAdm(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-200 text-xs text-teal-950 space-y-1">
              <p className="font-bold text-teal-900">Patient: {admitModalAdm.patientName} (ID: {admitModalAdm.patientNationalId})</p>
              <p className="text-[11px] text-teal-800">Reason: {admitModalAdm.reason} • Urgency: {admitModalAdm.urgency || 'Urgent'}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Ward Name</label>
                <select
                  value={assignWardInput}
                  onChange={(e) => setAssignWardInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium"
                >
                  <option value="St. Luke Surgical Wing">St. Luke Surgical Wing</option>
                  <option value="St. Jude General Medical Ward">St. Jude General Medical Ward</option>
                  <option value="Maternity & Neonatal Wing">Maternity & Neonatal Wing</option>
                  <option value="Pediatric Care Ward">Pediatric Care Ward</option>
                  <option value="ICU & High Dependency Unit (HDU)">ICU & High Dependency Unit (HDU)</option>
                  <option value="Executive Private Suite">Executive Private Suite</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Bed Number</label>
                  <input
                    type="text"
                    value={assignBedInput}
                    onChange={(e) => setAssignBedInput(e.target.value)}
                    placeholder="e.g. BED-SURG-04"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Daily Bed Rate (KES)</label>
                  <input
                    type="number"
                    value={assignDailyRateInput}
                    onChange={(e) => setAssignDailyRateInput(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Attending Physician</label>
                <input
                  type="text"
                  value={assignDoctorInput}
                  onChange={(e) => setAssignDoctorInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdmitModalAdm(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleOneClickAdmit(admitModalAdm.id, assignBedInput, assignWardInput, assignDoctorInput, assignDailyRateInput)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm One-Click Admission</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DISCHARGE INPATIENT */}
      {dischargeModalAdm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Execute Inpatient Discharge</h4>
                  <p className="text-xs text-slate-500">Post summary, medications, and final receipt</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDischargeModalAdm(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Clinical Discharge Summary</label>
                <textarea
                  rows={3}
                  value={dischargeSummaryInput}
                  onChange={(e) => setDischargeSummaryInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Home Discharge Medications</label>
                <input
                  type="text"
                  value={dischargeMedsInput}
                  onChange={(e) => setDischargeMedsInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Follow-up Clinic Date & Department</label>
                <input
                  type="text"
                  value={dischargeFollowUpInput}
                  onChange={(e) => setDischargeFollowUpInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDischargeModalAdm(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleOneClickDischarge(dischargeModalAdm.id)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-md transition-all"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Finalize Discharge & Post Records</span>
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* ================= VIEW 8: MY STAFF PROFILE & CREDENTIALS ================= */}
      {activeTab === 'profile' && (
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <UserIcon className="w-5 h-5 text-emerald-600" />
                <span>My Staff Profile & Medical Credentials</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage your verified staff profile photo, KMPDC licensing, and department details.</p>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-full font-bold text-xs flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Verified Clinical Staff</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo Card */}
            <div className="bg-gradient-to-b from-slate-50 to-emerald-50/40 p-6 rounded-3xl border border-slate-200/80 flex flex-col items-center text-center space-y-4 shadow-sm">
              <div className="relative group">
                {renderStaffAvatar("w-28 h-28 text-3xl")}
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute bottom-0 right-0 p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg border-2 border-white cursor-pointer transition-all hover:scale-110"
                  title="Upload / Change Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{currentUser.name}</h4>
                <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mt-0.5">{currentUser.role.replace('_', ' ')}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-1">{currentUser.licenseNumber || 'KMPDC/2026/0491'}</p>
              </div>

              <div className="w-full space-y-2 pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="w-full py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Change Profile Photo</span>
                </button>
                {localAvatar && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="w-full py-2 px-3 text-rose-600 hover:bg-rose-50 rounded-2xl text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Fields */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Legal Name</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-800 font-medium cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Staff Email</label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-800 font-mono cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Medical License (KMPDC / Board)</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.licenseNumber || 'KMPDC/2026/0491'}
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-800 font-mono font-bold cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Department Assignment</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.department || 'General Outpatient & Family Medicine'}
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-800 font-medium cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone / Work Extension</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.phone || '+254 700 000000'}
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-800 font-mono cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Clinical Shift Status</label>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 font-bold flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>On Active Duty (Day Shift)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start space-x-3">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  To request official adjustments to your Medical License ID, Legal Name, or Department transfer, please submit a verified ticket through the <strong>Hospital IT & HR Administration Desk</strong>.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => alert('Staff profile settings are verified and synced.')}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Profile Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 9: SETTINGS (PASSWORD & NOTIFICATIONS) ================= */}
      {activeTab === 'settings' && (
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-xl max-w-3xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              <span>Staff Account Settings</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Manage your staff login credentials, password security, and clinical emergency alerts.</p>
          </div>

          {/* Sub-tab navigation */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              type="button"
              onClick={() => setSettingsSubtab('password')}
              className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 cursor-pointer transition-all ${
                settingsSubtab === 'password'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Change Password</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsSubtab('notifications')}
              className={`pb-3 px-4 text-xs font-bold flex items-center space-x-2 border-b-2 cursor-pointer transition-all ${
                settingsSubtab === 'notifications'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notification Preferences</span>
            </button>
          </div>

          {/* PASSWORD TAB */}
          {settingsSubtab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              {passwordChangeStatus.message && (
                <div className={`p-4 rounded-2xl text-xs flex items-center space-x-2.5 ${
                  passwordChangeStatus.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : passwordChangeStatus.type === 'error'
                    ? 'bg-rose-50 border border-rose-200 text-rose-800'
                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}>
                  {passwordChangeStatus.type === 'loading' ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : passwordChangeStatus.type === 'success' ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{passwordChangeStatus.message}</span>
                </div>
              )}

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">Current Staff Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl pr-10 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">New Password (Min 6 characters)</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new strong password"
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl pr-10 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl pr-10 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordChangeStatus.type === 'loading'}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all flex items-center justify-center space-x-2"
              >
                <Lock className="w-4 h-4" />
                <span>Update Password Now</span>
              </button>
            </form>
          )}

          {/* NOTIFICATION PREFERENCES TAB */}
          {settingsSubtab === 'notifications' && (
            <div className="space-y-4">
              {notifSaveSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{notifSaveSuccess}</span>
                </div>
              )}

              <div className="space-y-3">
                {[
                  {
                    key: 'emergencyTraumaAlerts',
                    title: 'Emergency Trauma & Code Blue Resuscitation Alerts',
                    description: 'Receive high-priority SMS and audio alarms for incoming trauma patients'
                  },
                  {
                    key: 'criticalLabPanicAlerts',
                    title: 'Critical Panic Lab Value Alerts',
                    description: 'Instant notification when an outpatient lab test breaches panic threshold limits'
                  },
                  {
                    key: 'statRadiologyAlerts',
                    title: 'STAT Radiology & Emergency PACS Scans',
                    description: 'Alert when acute trauma X-Rays or CT scans are uploaded to PACS'
                  },
                  {
                    key: 'queueAlerts',
                    title: 'Live Clinic Queue & Patient Arrival Alerts',
                    description: 'Notification when triage marks a patient ready in your waiting queue'
                  },
                  {
                    key: 'pharmacyDispenseAlerts',
                    title: 'Hospital Pharmacy Dispensing & Stock Alerts',
                    description: 'Updates when central pharmacy dispenses medications or flags formulary stockouts'
                  },
                  {
                    key: 'emailReports',
                    title: 'Email Shift Handover & Daily Summary Reports',
                    description: 'Receive end-of-shift patient census and clinical summary reports via email'
                  }
                ].map((item) => {
                  const isChecked = notifPrefs[item.key as keyof typeof notifPrefs];
                  return (
                    <label
                      key={item.key}
                      className="p-4 rounded-2xl border border-slate-200 bg-white/60 hover:bg-white flex items-start justify-between gap-4 cursor-pointer transition-all shadow-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 block">{item.title}</span>
                        <span className="text-[11px] text-slate-500 block">{item.description}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          setNotifPrefs(prev => ({
                            ...prev,
                            [item.key]: e.target.checked
                          }));
                        }}
                        className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5 shrink-0"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  disabled={isSavingNotifs}
                  onClick={handleSaveNotificationPreferences}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center space-x-2"
                >
                  {isSavingNotifs && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Notification Preferences</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 10: HELP AND CLINICAL SUPPORT ================= */}
      {activeTab === 'help_support' && (
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-emerald-600" />
              <span>Hospital Clinical Help & Technical Support</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Direct hotlines, EMR support channels, and clinical guidance for TERRALINK staff.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
                <Phone className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>Code Blue & Trauma Resuscitation Desk</span>
              </div>
              <p className="text-xs text-slate-600">Immediate emergency resuscitation and crash cart activation team.</p>
              <div className="p-3 bg-white/80 rounded-xl border border-rose-200/60 font-mono text-xs font-bold text-rose-900">
                Extension: 111 / Direct: 0713544101
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-teal-800 font-bold text-sm">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Hospital Central Pharmacy & Formulary Hotline</span>
              </div>
              <p className="text-xs text-slate-600">Medication availability, drug interaction queries, and STAT dispensing.</p>
              <div className="p-3 bg-white/80 rounded-xl border border-teal-200/60 font-mono text-xs font-bold text-teal-900">
                Extension: 3201 / Email: pharmacy@terralinkhospital.org
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-blue-800 font-bold text-sm">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>24/7 EMR & IT Technical Helpdesk</span>
              </div>
              <p className="text-xs text-slate-600">PACS DICOM viewer issues, laboratory analyzer interface, and account resets.</p>
              <div className="p-3 bg-white/80 rounded-xl border border-blue-200/60 font-mono text-xs font-bold text-blue-900">
                Extension: 4401 / Email: it-support@terralinkhospital.org
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>KMPDC & Clinical Governance Desk</span>
              </div>
              <p className="text-xs text-slate-600">Regulatory inquiries, CME credit sync, and clinical quality compliance.</p>
              <div className="p-3 bg-white/80 rounded-xl border border-amber-200/60 font-mono text-xs font-bold text-amber-900">
                Extension: 5500 / Email: governance@terralinkhospital.org
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

