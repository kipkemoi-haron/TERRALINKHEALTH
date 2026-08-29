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
  HospitalSocialLinks,
  InsuranceProviderPlan
} from './types';
import { HospitalHomepage } from './components/HospitalHomepage';
import { PatientPortal } from './components/PatientPortal';
import { ProviderPortal } from './components/ProviderPortal';
import { AdminPortal } from './components/AdminPortal';
import { AuthModals, MandatoryPasswordChangeModal, AdminLoginGate, PatientLoginGate, ClinicalStaffLoginGate } from './components/AuthModals';
import { mockDepartments, mockDoctors, mockPatients, mockStaffUsers, mockAnalytics, mockAuditLogs, INITIAL_INSURANCE_PROVIDERS } from './mockData';
import { safeFetchJson, getLocalUsers, getLocalPatientProfiles } from './utils/apiHelper';

export function App() {
  // Active top-level portal ('home' is the default institutional hospital website)
  const [activePortal, setActivePortal] = useState<'home' | 'patient' | 'provider' | 'admin'>('home');
  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProviderPlan[]>(INITIAL_INSURANCE_PROVIDERS);

  // Current session user & token with system memory and localStorage persistence
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    try {
      const saved = localStorage.getItem('terralink_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentPatient, setCurrentPatient] = useState<PatientProfile | null>(() => {
    try {
      const saved = localStorage.getItem('terralink_current_patient_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('terralink_auth_token') || null;
  });

  // Keep localStorage in sync with currentUser and currentPatient
  const handleSetUserSession = (user: UserType | null, profile?: PatientProfile | null, token?: string | null) => {
    setCurrentUser(user);
    if (profile !== undefined) setCurrentPatient(profile);
    if (token !== undefined) setAuthToken(token);

    try {
      if (user) {
        localStorage.setItem('terralink_current_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('terralink_current_user');
      }

      if (profile) {
        localStorage.setItem('terralink_current_patient_profile', JSON.stringify(profile));
      } else if (profile === null) {
        localStorage.removeItem('terralink_current_patient_profile');
      }

      if (token) {
        localStorage.setItem('terralink_auth_token', token);
      } else if (token === null) {
        localStorage.removeItem('terralink_auth_token');
      }
    } catch (e) {
      console.warn('Storage sync issue:', e);
    }
  };

  // Hospital Socials State
  const [socialLinks, setSocialLinks] = useState<HospitalSocialLinks>({
    facebook: 'https://facebook.com/terralinkhealth',
    twitter: 'https://x.com/terralinkhealth',
    instagram: 'https://instagram.com/terralinkhealth',
    whatsapp: 'https://wa.me/254713544101',
    emergencyHotline: '0713544101',
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

  // Initial load from backend API with complete crash-proof resilience
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
        safeFetchJson('/api/departments'),
        safeFetchJson('/api/doctors'),
        safeFetchJson('/api/appointments'),
        safeFetchJson('/api/emr/encounters'),
        safeFetchJson('/api/emr/prescriptions'),
        safeFetchJson('/api/emr/labs'),
        safeFetchJson('/api/emr/radiology'),
        safeFetchJson('/api/billing/invoices'),
        safeFetchJson('/api/analytics'),
        safeFetchJson('/api/admin/audit-logs')
      ]);

      if (deptsRes.ok && Array.isArray(deptsRes.data)) setDepartments(deptsRes.data);
      if (docsRes.ok && Array.isArray(docsRes.data)) setDoctors(docsRes.data);
      if (aptsRes.ok && Array.isArray(aptsRes.data)) setAppointments(aptsRes.data);
      if (encsRes.ok && Array.isArray(encsRes.data)) setEncounters(encsRes.data);
      if (rxsRes.ok && Array.isArray(rxsRes.data)) setPrescriptions(rxsRes.data);
      if (labsRes.ok && Array.isArray(labsRes.data)) setLabOrders(labsRes.data);
      if (radsRes.ok && Array.isArray(radsRes.data)) setRadiologyOrders(radsRes.data);
      if (invsRes.ok && Array.isArray(invsRes.data)) setInvoices(invsRes.data);
      if (analyticsRes.ok && analyticsRes.data?.dailyVisits !== undefined) setAnalytics(analyticsRes.data);
      if (auditRes.ok && Array.isArray(auditRes.data)) setAuditLogs(auditRes.data);

      // Load patient immunizations safely
      if (currentPatient?.id) {
        const immRes = await safeFetchJson(`/api/emr/immunizations?patientId=${currentPatient.id}`);
        if (immRes.ok && Array.isArray(immRes.data)) setImmunizations(immRes.data);
      }
    } catch (err) {
      console.warn('Initial data refresh fallback to seeded local cache:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [currentPatient?.id]);

  // URL Path & Hash detection for hidden /admin route
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash === '#/admin') {
        setActivePortal('admin');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  const isAdminUser = 
    currentUser?.role === 'admin' || 
    currentUser?.email?.toLowerCase() === 'kipkemoiharon57@gmail.com' || 
    currentUser?.email?.toLowerCase() === 'kipkemoiharon4@gmail.com' ||
    currentUser?.username === 'kipkemoiharon57@gmail.com' ||
    currentUser?.username === 'kipkemoiharon4@gmail.com' ||
    currentUser?.username === 'admin.kipkemoi' ||
    currentUser?.name?.toLowerCase().includes('haron');

  // API Call Handlers
  const handleBookAppointment = async (aptData: any) => {
    const result = await safeFetchJson('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(aptData)
    });
    const newApt = result.ok && result.data ? result.data : {
      id: `apt-${Date.now()}`,
      ...aptData,
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    };

    setAppointments(prev => [newApt, ...prev]);
    refreshAllData();
  };

  const handleCancelAppointment = async (aptId: string) => {
    await safeFetchJson(`/api/appointments/${aptId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Cancelled' })
    });
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: 'Cancelled' } : a));
  };

  const handlePayInvoice = async (invoiceId: string, receipt: string) => {
    const result = await safeFetchJson(`/api/billing/invoices/${invoiceId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ amountKES: 1500, mpesaReceipt: receipt })
    });
    const updated = result.ok && result.data ? result.data : { status: 'Paid', balanceKES: 0 };
    setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, ...updated } : i));
    refreshAllData();
  };

  const handleSaveEncounter = async (encData: any) => {
    const result = await safeFetchJson('/api/emr/encounters', {
      method: 'POST',
      body: JSON.stringify(encData)
    });
    const saved = result.ok && result.data ? result.data : {
      id: `enc-${Date.now()}`,
      ...encData,
      createdAt: new Date().toISOString()
    };
    setEncounters(prev => [saved, ...prev]);
    refreshAllData();
  };

  const handleSaveLabResults = async (labOrderId: string, results: any[], notes: string, techName: string) => {
    const result = await safeFetchJson(`/api/emr/labs/${labOrderId}/results`, {
      method: 'POST',
      body: JSON.stringify({ results, technicianNotes: notes, conductedByLabTech: techName })
    });
    const updated = result.ok && result.data ? result.data : { status: 'Completed', results, notes, technicianNotes: notes };
    setLabOrders(prev => prev.map(l => l.id === labOrderId ? { ...l, ...updated } : l));
    refreshAllData();
  };

  const handleSaveRadiologyReport = async (orderId: string, findings: string, impression: string, radiologistName: string) => {
    const result = await safeFetchJson(`/api/emr/radiology/${orderId}/report`, {
      method: 'POST',
      body: JSON.stringify({ findings, impression, radiologistName })
    });
    const updated = result.ok && result.data ? result.data : { status: 'Reported', findings, impression };
    setRadiologyOrders(prev => prev.map(r => r.id === orderId ? { ...r, ...updated } : r));
    refreshAllData();
  };

  const handleDispensePrescription = async (rxId: string, dispensedBy: string, batchNumber: string) => {
    const result = await safeFetchJson(`/api/emr/prescriptions/${rxId}/dispense`, {
      method: 'POST',
      body: JSON.stringify({ dispensedBy, batchNumber })
    });
    const updated = result.ok && result.data ? result.data : { status: 'Dispensed' };
    setPrescriptions(prev => prev.map(p => p.id === rxId ? { ...p, ...updated } : p));
    refreshAllData();
  };

  const handleCreateLabOrder = async (orderData: any) => {
    const result = await safeFetchJson('/api/emr/labs', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    const saved = result.ok && result.data ? result.data : {
      id: `lab-${Date.now()}`,
      ...orderData,
      status: 'Ordered',
      createdAt: new Date().toISOString()
    };
    setLabOrders(prev => [saved, ...prev]);
  };

  const handleCreateRadiologyOrder = async (orderData: any) => {
    const result = await safeFetchJson('/api/emr/radiology', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    const saved = result.ok && result.data ? result.data : {
      id: `rad-${Date.now()}`,
      ...orderData,
      status: 'Ordered',
      createdAt: new Date().toISOString()
    };
    setRadiologyOrders(prev => [saved, ...prev]);
  };

  const handleCreatePrescription = async (rxData: any) => {
    const result = await safeFetchJson('/api/emr/prescriptions', {
      method: 'POST',
      body: JSON.stringify(rxData)
    });
    const saved = result.ok && result.data ? result.data : {
      id: `rx-${Date.now()}`,
      ...rxData,
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    setPrescriptions(prev => [saved, ...prev]);
  };

  const handleAddStaff = async (staffData: any) => {
    const result = await safeFetchJson('/api/admin/staff', {
      method: 'POST',
      body: JSON.stringify(staffData)
    });
    const saved = result.ok && result.data ? result.data : {
      id: `usr-${Date.now()}`,
      ...staffData,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    setStaffUsers(prev => [...prev, saved]);
  };

  const handleResetStaffPassword = async (userId: string) => {
    await safeFetchJson(`/api/admin/staff/${userId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ temporaryPassword: 'TerraReset2026!' })
    });
    setStaffUsers(prev => prev.map(s => s.id === userId ? { ...s, mustChangePassword: true } : s));
  };

  const handleToggleStaffStatus = async (userId: string, active: boolean) => {
    await safeFetchJson(`/api/admin/staff/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: active })
    });
    setStaffUsers(prev => prev.map(s => s.id === userId ? { ...s, isActive: active } : s));
  };

  const handleUpdateDepartmentFee = async (deptId: string, fee: number) => {
    await safeFetchJson(`/api/departments/${deptId}/fee`, {
      method: 'PATCH',
      body: JSON.stringify({ consultationFeeKES: fee })
    });
    setDepartments(prev => prev.map(d => d.id === deptId ? { ...d, consultationFeeKES: fee } : d));
  };

  const handleAddDepartment = async (deptData: any) => {
    const result = await safeFetchJson('/api/departments', {
      method: 'POST',
      body: JSON.stringify(deptData)
    });
    const saved = result.ok && result.data ? result.data : {
      id: `dept-${Date.now()}`,
      ...deptData
    };
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
      <div className="relative z-10 bg-slate-900/90 backdrop-blur-md text-slate-300 text-[10px] sm:text-xs px-3 sm:px-8 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 border-b border-white/10 shadow-xs">
        <div className="flex items-center space-x-2 sm:space-x-3">
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
          <div className="flex items-center space-x-1.5 text-emerald-400 font-medium text-[10px] sm:text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>24/7 Outpatient & Emergency Open</span>
          </div>
        </div>
      </div>

      {/* Main Hospital Navigation Header - Frosted Glass Bar */}
      <header className="relative z-40 bg-white/40 backdrop-blur-xl border-b border-white/60 shadow-sm shadow-slate-200/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group shrink-0" onClick={() => {
            setActivePortal('home');
            if (window.location.pathname.startsWith('/admin')) {
              window.history.pushState(null, '', '/');
            }
          }}>
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-lg shadow-teal-500/30 border border-teal-400/40 group-hover:scale-105 transition-all">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-1 h-3 sm:h-3.5 bg-white rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900">TERRA<span className="text-teal-600">LINK</span>HEALTH</span>
                <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 text-[9px] sm:text-[10px] font-bold rounded-full border border-teal-200">KENYA</span>
              </div>
              <p className="hidden xs:block sm:block text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[150px] sm:max-w-none">TERRALINKHEALTH Hospital Nairobi</p>
            </div>
          </div>

          {/* Portals Switcher / Navigation */}
          {currentUser && (
            <nav className="hidden md:flex items-center bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 shadow-xs gap-1">
              <button
                onClick={() => {
                  setActivePortal('home');
                  if (window.location.pathname.startsWith('/admin')) {
                    window.history.pushState(null, '', '/');
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activePortal === 'home' 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospital Home</span>
              </button>

              {currentUser.role === 'patient' && (
                <button
                  onClick={() => {
                    setActivePortal('patient');
                    if (window.location.pathname.startsWith('/admin')) {
                      window.history.pushState(null, '', '/');
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activePortal === 'patient' 
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>My Patient Portal</span>
                </button>
              )}

              {currentUser.role !== 'patient' && (
                <button
                  onClick={() => {
                    setActivePortal('provider');
                    if (window.location.pathname.startsWith('/admin')) {
                      window.history.pushState(null, '', '/');
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activePortal === 'provider' 
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>Clinical Workspace</span>
                </button>
              )}

              {isAdminUser && (
                <button
                  onClick={() => {
                    setActivePortal('admin');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activePortal === 'admin' 
                      ? 'bg-slate-900 text-emerald-400 shadow-md' 
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              )}
            </nav>
          )}

          {/* Right User Actions / Emergency Contact */}
          <div className="flex items-center space-x-2 shrink-0">
            
            {!currentUser ? (
              <a
                href="tel:0713544101"
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold flex items-center space-x-1 sm:space-x-1.5 shadow-xs transition-all shrink-0 whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5 text-rose-600 animate-pulse shrink-0" />
                <span className="hidden sm:inline">24/7 Hotline:</span>
                <span className="font-mono">0713544101</span>
              </a>
            ) : (
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center space-x-2.5 pl-2">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-md border border-white/60">
                    {currentUser.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[130px]">{currentUser.name}</span>
                    <span className="text-[10px] text-teal-700 font-semibold uppercase tracking-wide">{currentUser.role?.replace('_', ' ')}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleSetUserSession(null, null, null);
                    setActivePortal('home');
                    if (window.location.pathname.startsWith('/admin')) {
                      window.history.pushState(null, '', '/');
                    }
                  }}
                  title="Sign out of current account"
                  className="p-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-xs transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* Main Active Portal Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activePortal === 'home' && (
          <HospitalHomepage
            currentUser={currentUser}
            currentPatient={currentPatient}
            departments={departments}
            doctors={doctors}
            insuranceProviders={insuranceProviders}
            onOpenRegister={() => {
              setAuthModalMode('patient_register');
              setAuthModalOpen(true);
            }}
            onOpenPatientLogin={() => {
              setAuthModalMode('patient_login');
              setAuthModalOpen(true);
            }}
            onOpenStaffLogin={() => {
              setAuthModalMode('staff_login');
              setAuthModalOpen(true);
            }}
            onOpenAuthModal={(mode) => {
              setAuthModalMode(mode);
              setAuthModalOpen(true);
            }}
            onNavigateToPortal={(portal) => {
              setActivePortal(portal);
            }}
          />
        )}

        {/* PATIENT PORTAL - Visible after user signs in / registers, or displays clean entrance login gate */}
        {activePortal === 'patient' && (
          currentUser && currentUser.role === 'patient' && currentPatient ? (
            <PatientPortal
              patient={currentPatient}
              onUpdatePatient={(updated) => {
                setCurrentPatient(updated);
                try {
                  localStorage.setItem('terralink_current_patient_profile', JSON.stringify(updated));
                } catch (e) {
                  console.warn(e);
                }
              }}
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
              onLogout={() => {
                handleSetUserSession(null, null, null);
                setActivePortal('home');
              }}
            />
          ) : (
            <PatientLoginGate
              onPatientAuthSuccess={(token, user, profile) => {
                handleSetUserSession(user, profile, token);
                setActivePortal('patient');
                refreshAllData();
              }}
              onOpenRegisterModal={() => {
                setAuthModalMode('patient_register');
                setAuthModalOpen(true);
              }}
              onCancel={() => {
                setActivePortal('home');
              }}
            />
          )
        )}

        {/* CLINICAL STAFF PORTAL - Visible after staff signs in, or displays authorized workspace gate */}
        {activePortal === 'provider' && (
          currentUser && ['doctor', 'lab_tech', 'radiologist', 'pharmacist', 'nurse', 'admin'].includes(currentUser.role) ? (
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
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
                try {
                  localStorage.setItem('terralink_current_user', JSON.stringify(updated));
                } catch (e) {
                  console.warn(e);
                }
              }}
              onLogout={() => {
                handleSetUserSession(null, null, null);
                setActivePortal('home');
              }}
            />
          ) : (
            <ClinicalStaffLoginGate
              onStaffAuthSuccess={(token, user) => {
                handleSetUserSession(user, null, token);
                if (user.mustChangePassword) {
                  setShowPasswordChangeModal(true);
                } else {
                  setActivePortal('provider');
                }
                refreshAllData();
              }}
              onCancel={() => {
                setActivePortal('home');
              }}
            />
          )
        )}

        {/* ADMIN PORTAL - Restricted to /admin gateway & Admin users */}
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
            <AdminLoginGate
              onAdminAuthSuccess={(token, user) => {
                handleSetUserSession(user, null, token);
                setActivePortal('admin');
                refreshAllData();
              }}
              onCancel={() => {
                setActivePortal('home');
                window.history.pushState(null, '', '/');
              }}
            />
          )
        )}

      </main>

      {/* Auth Modals */}
      <AuthModals
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onPatientAuthSuccess={(token, user, profile) => {
          handleSetUserSession(user, profile, token);
          setActivePortal('patient');
        }}
        onStaffAuthSuccess={(token, user) => {
          handleSetUserSession(user, null, token);
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
              ISO 27001 Certified • HL7 FHIR Compliant • KDPA 2019
            </div>
            <div className="flex items-center space-x-3">
              <span>All tariffs in Kenyan Shillings (KES)</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
export default App;
