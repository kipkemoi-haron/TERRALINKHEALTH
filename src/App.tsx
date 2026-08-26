import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Phone, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Activity, 
  Clock, 
  Heart,
  ChevronDown,
  Layers,
  Sparkles,
  Search,
  Bell,
  RefreshCw,
  Lock,
  Share2,
  Globe,
  Smartphone,
  Mail,
  MapPin
} from 'lucide-react';
import { 
  User as UserType, 
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
  HospitalAnalytics, 
  AuditLog,
  HospitalSocialLinks
} from './types';
import { PatientPortal } from './components/PatientPortal';
import { ProviderPortal } from './components/ProviderPortal';
import { AdminPortal } from './components/AdminPortal';
import { AuthModals, MandatoryPasswordChangeModal } from './components/AuthModals';
import { mockDepartments, mockDoctors, mockPatients, mockStaffUsers, mockAnalytics, mockAuditLogs } from './mockData';

export function App() {
  // Active top-level portal
  const [activePortal, setActivePortal] = useState<'patient' | 'provider' | 'admin'>('patient');

  // Current session user & token
  const [currentUser, setCurrentUser] = useState<UserType>(mockPatients[0] as any); // default patient view for public privacy
  const [currentPatient, setCurrentPatient] = useState<PatientProfile>(mockPatients[0]); // default Wanjiku Muthoni
  const [authToken, setAuthToken] = useState<string>('mock-jwt-token-2026');

  // Hospital Socials State
  const [socialLinks, setSocialLinks] = useState<HospitalSocialLinks>({
    facebook: 'https://facebook.com/terralinkhealth',
    twitter: 'https://x.com/terralinkhealth',
    instagram: 'https://instagram.com/terralinkhealth',
    whatsapp: 'https://wa.me/254700999911',
    emergencyHotline: '+254 700 999 911',
    contactEmail: 'info@terralinkhealth.co.ke',
    physicalAddress: 'Hospital Hill Road, Parklands / Upper Hill Medical Complex, Nairobi County'
  });

  // Mandatory password change state
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'patient_login' | 'patient_register' | 'staff_login'>('patient_login');

  // System Core State
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [patients, setPatients] = useState<PatientProfile[]>(mockPatients);
  const [staffUsers, setStaffUsers] = useState<UserType[]>(mockStaffUsers);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [encounters, setEncounters] = useState<ClinicalEncounter[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [radiologyOrders, setRadiologyOrders] = useState<RadiologyOrder[]>([]);
  const [immunizations, setImmunizations] = useState<ImmunizationRecord[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [mpesaPayments, setMpesaPayments] = useState<MpesaPayment[]>([]);
  const [analytics, setAnalytics] = useState<HospitalAnalytics>(mockAnalytics);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);

  // Initial load from backend API
  const refreshAllData = async () => {
    try {
      const [
        deptsRes,
        docsRes,
        aptsRes,
        encsRes,
        rxsRes,
        labsRes,
        radsRes,
        invsRes,
        analyticsRes,
        auditRes
      ] = await Promise.all([
        fetch('/api/departments').then(r => r.json()),
        fetch('/api/doctors').then(r => r.json()),
        fetch('/api/appointments').then(r => r.json()),
        fetch('/api/emr/encounters').then(r => r.json()),
        fetch('/api/emr/prescriptions').then(r => r.json()),
        fetch('/api/emr/labs').then(r => r.json()),
        fetch('/api/emr/radiology').then(r => r.json()),
        fetch('/api/billing/invoices').then(r => r.json()),
        fetch('/api/analytics').then(r => r.json()),
        fetch('/api/admin/audit-logs').then(r => r.json())
      ]);

      if (Array.isArray(deptsRes)) setDepartments(deptsRes);
      if (Array.isArray(docsRes)) setDoctors(docsRes);
      if (Array.isArray(aptsRes)) setAppointments(aptsRes);
      if (Array.isArray(encsRes)) setEncounters(encsRes);
      if (Array.isArray(rxsRes)) setPrescriptions(rxsRes);
      if (Array.isArray(labsRes)) setLabOrders(labsRes);
      if (Array.isArray(radsRes)) setRadiologyOrders(radsRes);
      if (Array.isArray(invsRes)) setInvoices(invsRes);
      if (analyticsRes && analyticsRes.dailyVisits !== undefined) setAnalytics(analyticsRes);
      if (Array.isArray(auditRes)) setAuditLogs(auditRes);

      // Load patient immunizations
      if (currentPatient?.id) {
        const immRes = await fetch(`/api/emr/immunizations?patientId=${currentPatient.id}`).then(r => r.json());
        if (Array.isArray(immRes)) setImmunizations(immRes);
      }
    } catch (err) {
      console.warn('Initial data refresh fallback to seeded data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [currentPatient?.id]);

  const isAdminUser = 
    currentUser?.role === 'admin' || 
    currentUser?.email === 'kipkemoiharon57@gmail.com' || 
    currentUser?.email === 'kipkemoiharon4@gmail.com' ||
    currentUser?.username === 'kipkemoiharon57@gmail.com' ||
    currentUser?.username === 'kipkemoiharon4@gmail.com' ||
    currentUser?.username === 'admin.kipkemoi';

  // Demo Quick Switcher handler
  const handleSwitchDemoPersona = (persona: 'patient' | 'doctor' | 'lab_tech' | 'radiologist' | 'pharmacist' | 'nurse') => {
    if (persona === 'patient') {
      setActivePortal('patient');
      setCurrentUser({
        id: 'user-pat-01',
        name: 'Wanjiku Muthoni',
        email: 'wanjiku.m@gmail.com',
        phone: '0712345678',
        role: 'patient',
        nationalId: '33819200',
        isActive: true,
        mustChangePassword: false,
        createdAt: '2026-08-01'
      });
    } else {
      const staffMatch = staffUsers.find(s => s.role === persona) || staffUsers[0];
      setCurrentUser(staffMatch);
      setActivePortal('provider');
    }
  };

  // API Call Handlers
  const handleBookAppointment = async (aptData: any) => {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aptData)
    });
    const newApt = await res.json();
    if (!res.ok) throw new Error(newApt.error || 'Booking error');

    setAppointments(prev => [newApt, ...prev]);
    refreshAllData();
  };

  const handleCancelAppointment = async (aptId: string) => {
    await fetch(`/api/appointments/${aptId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Cancelled' })
    });
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: 'Cancelled' } : a));
  };

  const handlePayInvoice = async (invoiceId: string, receipt: string) => {
    const res = await fetch(`/api/billing/invoices/${invoiceId}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountKES: 1500, mpesaReceipt: receipt })
    });
    const updated = await res.json();
    setInvoices(prev => prev.map(i => i.id === invoiceId ? updated : i));
    refreshAllData();
  };

  const handleSaveEncounter = async (encData: any) => {
    const res = await fetch('/api/emr/encounters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encData)
    });
    const saved = await res.json();
    setEncounters(prev => [saved, ...prev]);
    refreshAllData();
  };

  const handleSaveLabResults = async (labOrderId: string, results: any[], notes: string, techName: string) => {
    const res = await fetch(`/api/emr/labs/${labOrderId}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results, technicianNotes: notes, conductedByLabTech: techName })
    });
    const updated = await res.json();
    setLabOrders(prev => prev.map(l => l.id === labOrderId ? updated : l));
    refreshAllData();
  };

  const handleSaveRadiologyReport = async (orderId: string, findings: string, impression: string, radiologistName: string) => {
    const res = await fetch(`/api/emr/radiology/${orderId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ findings, impression, radiologistName })
    });
    const updated = await res.json();
    setRadiologyOrders(prev => prev.map(r => r.id === orderId ? updated : r));
    refreshAllData();
  };

  const handleDispensePrescription = async (rxId: string, dispensedBy: string, batchNumber: string) => {
    const res = await fetch(`/api/emr/prescriptions/${rxId}/dispense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dispensedBy, batchNumber })
    });
    const updated = await res.json();
    setPrescriptions(prev => prev.map(p => p.id === rxId ? updated : p));
    refreshAllData();
  };

  const handleCreateLabOrder = async (orderData: any) => {
    const res = await fetch('/api/emr/labs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const saved = await res.json();
    setLabOrders(prev => [saved, ...prev]);
  };

  const handleCreateRadiologyOrder = async (orderData: any) => {
    const res = await fetch('/api/emr/radiology', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const saved = await res.json();
    setRadiologyOrders(prev => [saved, ...prev]);
  };

  const handleCreatePrescription = async (rxData: any) => {
    const res = await fetch('/api/emr/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rxData)
    });
    const saved = await res.json();
    setPrescriptions(prev => [saved, ...prev]);
  };

  const handleAddStaff = async (staffData: any) => {
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffData)
    });
    const saved = await res.json();
    if (!res.ok) throw new Error(saved.error || 'Failed to add staff');
    setStaffUsers(prev => [...prev, saved]);
  };

  const handleResetStaffPassword = async (userId: string) => {
    await fetch(`/api/admin/staff/${userId}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temporaryPassword: 'TerraReset2026!' })
    });
    setStaffUsers(prev => prev.map(s => s.id === userId ? { ...s, mustChangePassword: true } : s));
  };

  const handleToggleStaffStatus = async (userId: string, active: boolean) => {
    await fetch(`/api/admin/staff/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: active })
    });
    setStaffUsers(prev => prev.map(s => s.id === userId ? { ...s, isActive: active } : s));
  };

  const handleUpdateDepartmentFee = async (deptId: string, fee: number) => {
    await fetch(`/api/departments/${deptId}/fee`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consultationFeeKES: fee })
    });
    setDepartments(prev => prev.map(d => d.id === deptId ? { ...d, consultationFeeKES: fee } : d));
  };

  const handleAddDepartment = async (deptData: any) => {
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deptData)
    });
    const saved = await res.json();
    setDepartments(prev => [...prev, saved]);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden text-slate-800 flex flex-col font-sans antialiased selection:bg-teal-500 selection:text-white">
      
      {/* Soft Frosted Ambient Light Blobs in Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-200/50 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-teal-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl" />
      </div>

      {/* Top Emergency & Hospital Indicator Strip with Glass Effect */}
      <div className="relative z-10 bg-slate-900/90 backdrop-blur-md text-slate-300 text-xs px-4 sm:px-8 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 shadow-xs">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 text-teal-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shadow-sm shadow-teal-400" />
            <span>Nairobi County Digital Hospital Network</span>
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400">
            Kenya Data Protection Act (KDPA 2019) • KMPDC Certified
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-rose-400 font-semibold bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-800/40">
            <Phone className="w-3.5 h-3.5 animate-bounce" />
            <span>24/7 A&E Hotline: <strong className="text-white font-mono">0700 999 911</strong></span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="hidden lg:flex items-center space-x-1 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/15 text-[11px]">
            <span className="text-slate-400 font-semibold">Demo Role:</span>
            <button 
              onClick={() => handleSwitchDemoPersona('patient')} 
              className={`px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer ${activePortal === 'patient' ? 'text-white bg-teal-600 font-bold shadow-sm shadow-teal-500/50' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
            >
              Patient
            </button>
            <span className="text-slate-600">/</span>
            <button 
              onClick={() => handleSwitchDemoPersona('doctor')} 
              className={`px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer ${activePortal === 'provider' && currentUser.role === 'doctor' ? 'text-white bg-teal-600 font-bold shadow-sm shadow-teal-500/50' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
            >
              Doctor
            </button>
            <span className="text-slate-600">/</span>
            <button 
              onClick={() => handleSwitchDemoPersona('lab_tech')} 
              className={`px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer ${activePortal === 'provider' && currentUser.role === 'lab_tech' ? 'text-white bg-teal-600 font-bold shadow-sm shadow-teal-500/50' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}
            >
              Lab Tech
            </button>
          </div>
        </div>
      </div>

      {/* Main Hospital Navigation Header - Frosted Glass Bar */}
      <header className="relative z-40 bg-white/40 backdrop-blur-xl border-b border-white/60 shadow-sm shadow-slate-200/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActivePortal('patient')}>
            <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-teal-500/30 border border-teal-400/40 group-hover:scale-105 transition-all">
              <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-1 h-3.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">TERRA<span className="text-teal-600">LINK</span>HEALTH</span>
                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-full border border-teal-200">KENYA</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Integrated Hospital Information System</p>
            </div>
          </div>

          {/* Portals Switcher - Glass Pills (Admin strictly hidden from public view) */}
          <nav className="hidden md:flex items-center bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 shadow-xs">
            <button
              onClick={() => {
                setActivePortal('patient');
                setCurrentUser({
                  id: 'user-pat-01',
                  name: 'Wanjiku Muthoni',
                  email: 'wanjiku.m@gmail.com',
                  phone: '0712345678',
                  role: 'patient',
                  nationalId: '33819200',
                  isActive: true,
                  mustChangePassword: false,
                  createdAt: '2026-08-01'
                });
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePortal === 'patient' 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Patient Portal
            </button>

            <button
              onClick={() => {
                setActivePortal('provider');
                const doctorUser = staffUsers.find(s => s.role === 'doctor') || staffUsers[0];
                setCurrentUser(doctorUser);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePortal === 'provider' 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              Healthcare Provider Portal
            </button>

            {/* Administrator portal ONLY rendered if logged in as Kipkemoi Haron or Admin role */}
            {isAdminUser && (
              <button
                onClick={() => setActivePortal('admin')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activePortal === 'admin' 
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25 border border-white/20' 
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Operations</span>
              </button>
            )}
          </nav>

          {/* Right User Actions */}
          <div className="flex items-center space-x-2.5">
            
            {/* Staff / Admin Direct Secure Login Trigger */}
            {!isAdminUser && (
              <button
                onClick={() => {
                  setAuthModalMode('staff_login');
                  setAuthModalOpen(true);
                }}
                className="px-3 py-2 bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 font-semibold rounded-2xl text-xs flex items-center space-x-1.5 border border-white/80 shadow-xs transition-all cursor-pointer backdrop-blur-md"
                title="Hospital Staff & Administrator Secure Login"
              >
                <Lock className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden sm:inline">Staff / Admin Login</span>
              </button>
            )}

            <button
              onClick={() => {
                setAuthModalMode(activePortal === 'patient' ? 'patient_login' : 'staff_login');
                setAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-white/60 hover:bg-white/90 text-slate-800 font-semibold rounded-2xl text-xs flex items-center space-x-1.5 border border-white/80 shadow-xs transition-all cursor-pointer backdrop-blur-md"
            >
              <LogIn className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Switch Account</span>
            </button>

            <div className="flex items-center space-x-2.5 pl-2 border-l border-white/60">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-md border border-white/60">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[130px]">{currentUser?.name}</span>
                <span className="text-[10px] text-teal-700 font-semibold uppercase tracking-wide">{currentUser?.role?.replace('_', ' ')}</span>
              </div>
            </div>

          </div>

        </div>
      </header>

      {/* Main Active Portal Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activePortal === 'patient' && (
          <PatientPortal
            patient={currentPatient}
            onUpdatePatient={(updated) => setCurrentPatient(updated)}
            departments={departments}
            doctors={doctors}
            appointments={appointments.filter(a => a.patientId === currentPatient.id)}
            encounters={encounters.filter(e => e.patientId === currentPatient.id)}
            prescriptions={prescriptions.filter(p => p.patientId === currentPatient.id)}
            labOrders={labOrders.filter(l => l.patientId === currentPatient.id)}
            radiologyOrders={radiologyOrders.filter(r => r.patientId === currentPatient.id)}
            immunizations={immunizations}
            invoices={invoices.filter(i => i.patientId === currentPatient.id)}
            mpesaPayments={mpesaPayments}
            onBookAppointment={handleBookAppointment}
            onCancelAppointment={handleCancelAppointment}
            onPayInvoice={handlePayInvoice}
          />
        )}

        {activePortal === 'provider' && (
          <ProviderPortal
            currentUser={currentUser}
            patients={patients}
            departments={departments}
            doctors={doctors}
            appointments={appointments}
            encounters={encounters}
            prescriptions={prescriptions}
            labOrders={labOrders}
            radiologyOrders={radiologyOrders}
            invoices={invoices}
            onSaveEncounter={handleSaveEncounter}
            onSaveLabResults={handleSaveLabResults}
            onSaveRadiologyReport={handleSaveRadiologyReport}
            onDispensePrescription={handleDispensePrescription}
            onCreateLabOrder={handleCreateLabOrder}
            onCreateRadiologyOrder={handleCreateRadiologyOrder}
            onCreatePrescription={handleCreatePrescription}
            onUpdateAppointmentStatus={async (aptId, status) => {
              await fetch(`/api/appointments/${aptId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
              });
              setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status } : a));
            }}
          />
        )}

        {activePortal === 'admin' && (
          isAdminUser ? (
            <AdminPortal
              currentUser={currentUser}
              analytics={analytics}
              departments={departments}
              doctors={doctors}
              patients={patients}
              staffUsers={staffUsers}
              invoices={invoices}
              auditLogs={auditLogs}
              onAddStaff={handleAddStaff}
              onResetStaffPassword={handleResetStaffPassword}
              onToggleStaffStatus={handleToggleStaffStatus}
              onUpdateDepartmentFee={handleUpdateDepartmentFee}
              onAddDepartment={handleAddDepartment}
              onRefreshData={refreshAllData}
            />
          ) : (
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white p-8 max-w-lg mx-auto text-center space-y-4 shadow-xl my-12">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
                <Lock className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Administrator Access Restricted</h3>
              <p className="text-xs text-slate-600">
                The executive administration portal is strictly restricted to authorized administrators (<strong>kipkemoiharon57@gmail.com</strong> and <strong>kipkemoiharon4@gmail.com</strong>).
              </p>
              <button
                onClick={() => {
                  setAuthModalMode('staff_login');
                  setAuthModalOpen(true);
                }}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center space-x-2 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Log In as Administrator</span>
              </button>
            </div>
          )
        )}

      </main>

      {/* Auth Modals */}
      <AuthModals
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onPatientAuthSuccess={(token, user, profile) => {
          setAuthToken(token);
          setCurrentUser(user);
          if (profile) setCurrentPatient(profile);
          setActivePortal('patient');
        }}
        onStaffAuthSuccess={(token, user) => {
          setAuthToken(token);
          setCurrentUser(user);
          if (user.mustChangePassword) {
            setShowPasswordChangeModal(true);
          } else {
            if (user.role === 'admin' || user.email === 'kipkemoiharon57@gmail.com' || user.email === 'kipkemoiharon4@gmail.com') {
              setActivePortal('admin');
            } else {
              setActivePortal('provider');
            }
          }
        }}
      />

      {/* Mandatory Password Change Modal for Staff First-Login */}
      <MandatoryPasswordChangeModal
        isOpen={showPasswordChangeModal}
        user={currentUser}
        token={authToken}
        onSuccess={() => {
          setShowPasswordChangeModal(false);
          setCurrentUser(prev => ({ ...prev, mustChangePassword: false }));
          if (currentUser.role === 'admin' || currentUser.email === 'kipkemoiharon57@gmail.com' || currentUser.email === 'kipkemoiharon4@gmail.com') {
            setActivePortal('admin');
          } else {
            setActivePortal('provider');
          }
        }}
      />

      {/* Footer with Frosted Glass Theme & Hospital Social Channels */}
      <footer className="relative z-10 bg-white/40 backdrop-blur-xl border-t border-white/60 text-slate-600 text-xs py-8 mt-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-teal-500/20">
                TL
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm">TERRALINKHEALTH HOSPITAL SYSTEM</span>
                <p className="text-[11px] text-slate-500">{socialLinks.physicalAddress}</p>
              </div>
            </div>

            {/* Social Media & Direct Contact Channels */}
            <div className="flex items-center flex-wrap gap-2 text-xs">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/80 hover:bg-white text-blue-600 rounded-xl border border-white shadow-xs transition-all flex items-center space-x-1 font-semibold cursor-pointer"
                  title="Official Facebook Page"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Facebook</span>
                </a>
              )}

              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/80 hover:bg-white text-slate-900 rounded-xl border border-white shadow-xs transition-all flex items-center space-x-1 font-semibold cursor-pointer"
                  title="Official X (Twitter)"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">X (Twitter)</span>
                </a>
              )}

              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/80 hover:bg-white text-pink-600 rounded-xl border border-white shadow-xs transition-all flex items-center space-x-1 font-semibold cursor-pointer"
                  title="Official Instagram"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Instagram</span>
                </a>
              )}

              {socialLinks.whatsapp && (
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all flex items-center space-x-1 font-semibold cursor-pointer"
                  title="WhatsApp Business Hotline"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              ISO 27001 Certified • HL7 FHIR Compliant • Safaricom Daraja M-PESA Integration • KDPA 2019
            </div>
            <div className="flex items-center space-x-3">
              <span>All tariffs in Kenyan Shillings (KES)</span>
              <span>•</span>
              <button
                onClick={() => {
                  setAuthModalMode('staff_login');
                  setAuthModalOpen(true);
                }}
                className="hover:text-slate-800 underline cursor-pointer"
              >
                Administrator Access
              </button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
export default App;
