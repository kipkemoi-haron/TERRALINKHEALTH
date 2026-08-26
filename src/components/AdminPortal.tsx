import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  Plus, 
  Key, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BarChart3, 
  TrendingUp, 
  Settings, 
  Search, 
  FileText, 
  UserCheck, 
  Trash2,
  RefreshCw,
  Sliders,
  Calendar,
  CreditCard,
  Edit3,
  Printer,
  Share2,
  Globe,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  MessageSquare,
  Check,
  Receipt,
  X,
  Smartphone
} from 'lucide-react';
import { 
  User, 
  PatientProfile, 
  Department, 
  Doctor, 
  Invoice, 
  AuditLog, 
  HospitalAnalytics,
  HospitalSocialLinks,
  SystemPricing
} from '../types';

interface AdminPortalProps {
  currentUser: User;
  analytics: HospitalAnalytics;
  departments: Department[];
  doctors: Doctor[];
  patients: PatientProfile[];
  staffUsers: User[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  onAddStaff: (staffData: any) => Promise<void>;
  onResetStaffPassword: (userId: string) => Promise<void>;
  onToggleStaffStatus: (userId: string, active: boolean) => Promise<void>;
  onUpdateDepartmentFee: (deptId: string, newFeeKES: number) => Promise<void>;
  onAddDepartment: (deptData: any) => Promise<void>;
  onRefreshData?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  analytics,
  departments,
  doctors,
  patients,
  staffUsers,
  invoices: initialInvoices,
  auditLogs,
  onAddStaff,
  onResetStaffPassword,
  onToggleStaffStatus,
  onUpdateDepartmentFee,
  onAddDepartment,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'billings' | 'pricing' | 'socials' | 'departments' | 'staff' | 'patients' | 'audit_logs'>('billings');

  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Overdue' | 'Partially Paid'>('All');
  
  // Create / Edit Invoice Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [invPatientId, setInvPatientId] = useState('');
  const [invDueDate, setInvDueDate] = useState('2026-09-01');
  const [invStatus, setInvStatus] = useState<'Unpaid' | 'Paid' | 'Overdue' | 'Partially Paid'>('Unpaid');
  const [invNotes, setInvNotes] = useState('');
  const [invItems, setInvItems] = useState<Array<{ id: string; description: string; category: string; amountKES: number }>>([
    { id: 'item-1', description: 'Specialist Clinical Consultation', category: 'Consultation', amountKES: 2000 },
    { id: 'item-2', description: 'Full Hemogram / CBC Diagnostic Test', category: 'Laboratory', amountKES: 1200 }
  ]);
  const [invItemDesc, setInvItemDesc] = useState('');
  const [invItemCategory, setInvItemCategory] = useState('Consultation');
  const [invItemAmount, setInvItemAmount] = useState(1500);

  // Pay Invoice / Record Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPayInvoice, setSelectedPayInvoice] = useState<Invoice | null>(null);
  const [payAmountKES, setPayAmountKES] = useState(0);
  const [payMethod, setPayMethod] = useState<'M-PESA' | 'Cash' | 'SHIF Insurance' | 'Private Insurance' | 'Card'>('M-PESA');
  const [payReceipt, setPayReceipt] = useState('QH82' + Math.floor(100000 + Math.random() * 900000));
  const [paymentSuccessToast, setPaymentSuccessToast] = useState('');

  // Print Invoice State
  const [printingInvoice, setPrintingInvoice] = useState<Invoice | null>(null);

  // System Pricing State
  const [pricing, setPricing] = useState<SystemPricing>({
    consultations: {
      generalOPD: 1000,
      specialist: 2000,
      emergencyCasualty: 2500,
      telemedicine: 1500,
      generalWardPerDay: 3500,
      hduPerDay: 12000,
      icuPerDay: 25000
    },
    labTests: [
      { id: 'lab-1', name: 'Full Hemogram / CBC', category: 'Hematology', code: 'LAB-CBC', priceKES: 1200 },
      { id: 'lab-2', name: 'Fasting Lipid Profile', category: 'Biochemistry', code: 'LAB-LIP', priceKES: 1800 },
      { id: 'lab-3', name: 'HbA1c Glycated Hemoglobin', category: 'Endocrine', code: 'LAB-HBA1C', priceKES: 2200 },
      { id: 'lab-4', name: 'Renal Function Tests (RFTs)', category: 'Biochemistry', code: 'LAB-RFT', priceKES: 2400 },
      { id: 'lab-5', name: 'Liver Function Tests (LFTs)', category: 'Biochemistry', code: 'LAB-LFT', priceKES: 2500 },
      { id: 'lab-6', name: 'Malaria Rapid Diagnostic Test', category: 'Parasitology', code: 'LAB-MRDT', priceKES: 600 }
    ],
    radiology: [
      { id: 'rad-1', name: 'Digital Chest X-Ray (PA View)', modality: 'X-Ray', bodyPart: 'Chest', priceKES: 2500 },
      { id: 'rad-2', name: 'Abdominal & Pelvic Ultrasound', modality: 'Ultrasound', bodyPart: 'Abdomen', priceKES: 3500 },
      { id: 'rad-3', name: 'Brain CT Scan (Non-Contrast)', modality: 'CT', bodyPart: 'Brain', priceKES: 14000 },
      { id: 'rad-4', name: 'Lumbar Spine MRI', modality: 'MRI', bodyPart: 'Spine', priceKES: 28000 }
    ],
    medications: [
      { id: 'med-1', name: 'Amoxicillin / Clavulanic Acid 625mg', category: 'Antibiotics', unitPriceKES: 120, unit: 'Tablet' },
      { id: 'med-2', name: 'Metformin 500mg (Box of 30)', category: 'Antidiabetic', unitPriceKES: 650, unit: 'Box' },
      { id: 'med-3', name: 'Amlodipine 5mg (Box of 30)', category: 'Cardiovascular', unitPriceKES: 700, unit: 'Box' },
      { id: 'med-4', name: 'Paracetamol 500mg (10 tabs)', category: 'Analgesics', unitPriceKES: 100, unit: 'Strip' }
    ]
  });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingToast, setPricingToast] = useState('');

  // Add Item to Pricing Catalog modals
  const [showAddLabPricingModal, setShowAddLabPricingModal] = useState(false);
  const [newLabName, setNewLabName] = useState('');
  const [newLabCat, setNewLabCat] = useState('Biochemistry');
  const [newLabPrice, setNewLabPrice] = useState(1500);

  const [showAddRadPricingModal, setShowAddRadPricingModal] = useState(false);
  const [newRadName, setNewRadName] = useState('');
  const [newRadModality, setNewRadModality] = useState<'X-Ray' | 'Ultrasound' | 'CT' | 'MRI' | 'Mammography'>('Ultrasound');
  const [newRadPrice, setNewRadPrice] = useState(3500);

  const [showAddMedPricingModal, setShowAddMedPricingModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedCat, setNewMedCat] = useState('General');
  const [newMedPrice, setNewMedPrice] = useState(400);

  // Social Links State
  const [socialLinks, setSocialLinks] = useState<HospitalSocialLinks>({
    facebook: 'https://facebook.com/terralinkhealth',
    twitter: 'https://x.com/terralinkhealth',
    instagram: 'https://instagram.com/terralinkhealth',
    whatsapp: 'https://wa.me/254700999911',
    emergencyHotline: '+254 700 999 911',
    contactEmail: 'info@terralinkhealth.co.ke',
    physicalAddress: 'Hospital Hill Road, Parklands / Upper Hill Medical Complex, Nairobi County'
  });
  const [socialSaving, setSocialSaving] = useState(false);
  const [socialToast, setSocialToast] = useState('');

  // Staff creation modal state
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffUsername, setStaffUsername] = useState('');
  const [staffRole, setStaffRole] = useState<'doctor' | 'nurse' | 'lab_tech' | 'radiologist' | 'pharmacist' | 'admin'>('doctor');
  const [staffDept, setStaffDept] = useState('Outpatient & Family Medicine');
  const [staffLicense, setStaffLicense] = useState('');
  const [tempPassword, setTempPassword] = useState('TerraPass2026!');
  const [addingStaffLoading, setAddingStaffLoading] = useState(false);

  // Department creation state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptCategory, setDeptCategory] = useState<'Clinical' | 'Diagnostic' | 'Therapeutic' | 'Emergency' | 'Surgical'>('Clinical');
  const [deptFeeKES, setDeptFeeKES] = useState(1500);
  const [deptLocation, setDeptLocation] = useState('Tower A, 2nd Floor');

  // Search queries
  const [staffSearch, setStaffSearch] = useState('');
  const [patientSearch, setPatientSearch] = useState('');

  // Load server-side pricing & socials on mount
  useEffect(() => {
    fetch('/api/billing/pricing')
      .then(r => r.json())
      .then(data => {
        if (data && data.consultations) setPricing(data);
      })
      .catch(err => console.warn('Pricing load fallback:', err));

    fetch('/api/hospital/social-links')
      .then(r => r.json())
      .then(data => {
        if (data && data.facebook) setSocialLinks(data);
      })
      .catch(err => console.warn('Socials load fallback:', err));
  }, []);

  // Synchronize invoices with props
  useEffect(() => {
    setInvoices(initialInvoices);
  }, [initialInvoices]);

  // Handle Add Item to invoice draft
  const handleAddInvoiceItem = () => {
    if (!invItemDesc.trim()) return;
    setInvItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: invItemDesc,
        category: invItemCategory,
        amountKES: Number(invItemAmount) || 0
      }
    ]);
    setInvItemDesc('');
    setInvItemAmount(1000);
  };

  const handleRemoveInvoiceItem = (itemId: string) => {
    setInvItems(prev => prev.filter(i => i.id !== itemId));
  };

  // Open Create Invoice Modal
  const handleOpenCreateInvoice = () => {
    setEditingInvoiceId(null);
    setInvPatientId(patients[0]?.id || 'pat-01');
    setInvDueDate('2026-09-05');
    setInvStatus('Unpaid');
    setInvNotes('Hospital Outpatient & Diagnostic Services');
    setInvItems([
      { id: 'item-1', description: 'Consultation - Specialist Clinic', category: 'Consultation', amountKES: 2000 },
      { id: 'item-2', description: 'Laboratory - Full Hemogram / CBC', category: 'Laboratory', amountKES: 1200 }
    ]);
    setShowInvoiceModal(true);
  };

  // Open Edit Invoice Modal
  const handleOpenEditInvoice = (inv: Invoice) => {
    setEditingInvoiceId(inv.id);
    setInvPatientId(inv.patientId);
    setInvDueDate(inv.dueDate);
    setInvStatus(inv.status);
    setInvNotes(inv.notes || '');
    setInvItems(inv.items.map(it => ({
      id: it.id || `item-${Math.random()}`,
      description: it.description,
      category: it.category,
      amountKES: it.amountKES
    })));
    setShowInvoiceModal(true);
  };

  // Save Invoice (Create or Edit)
  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPat = patients.find(p => p.id === invPatientId) || patients[0];
    const totalAmount = invItems.reduce((acc, curr) => acc + curr.amountKES, 0);

    const invoicePayload = {
      patientId: invPatientId,
      patientName: selectedPat?.fullName || 'Wanjiku Muthoni',
      patientPhone: selectedPat?.phone || '0712345678',
      items: invItems,
      totalAmountKES: totalAmount,
      paidAmountKES: invStatus === 'Paid' ? totalAmount : 0,
      balanceKES: invStatus === 'Paid' ? 0 : totalAmount,
      status: invStatus,
      dueDate: invDueDate,
      notes: invNotes
    };

    try {
      if (editingInvoiceId) {
        // Edit
        const res = await fetch(`/api/billing/invoices/${editingInvoiceId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoicePayload)
        });
        const updated = await res.json();
        setInvoices(prev => prev.map(i => i.id === editingInvoiceId ? updated : i));
      } else {
        // Create
        const res = await fetch('/api/billing/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoicePayload)
        });
        const created = await res.json();
        setInvoices(prev => [created, ...prev]);
      }
      setShowInvoiceModal(false);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Save invoice error:', err);
    }
  };

  // Open Pay Modal
  const handleOpenPayModal = (inv: Invoice) => {
    setSelectedPayInvoice(inv);
    setPayAmountKES(inv.balanceKES > 0 ? inv.balanceKES : (inv.totalKES || inv.totalAmountKES || 0));
    setPayReceipt('QH82' + Math.floor(100000 + Math.random() * 900000));
    setShowPayModal(true);
  };

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayInvoice) return;

    try {
      const res = await fetch(`/api/billing/invoices/${selectedPayInvoice.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountKES: Number(payAmountKES),
          paymentMethod: payMethod,
          mpesaReceipt: payReceipt
        })
      });
      const updated = await res.json();
      setInvoices(prev => prev.map(i => i.id === selectedPayInvoice.id ? updated : i));
      setShowPayModal(false);
      setPaymentSuccessToast(`Payment of KES ${Number(payAmountKES).toLocaleString()} recorded successfully! Receipt: ${payReceipt}`);
      setTimeout(() => setPaymentSuccessToast(''), 6000);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Payment error:', err);
    }
  };

  // Save System Pricing Updates
  const handleSavePricing = async () => {
    setPricingSaving(true);
    try {
      const res = await fetch('/api/billing/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricing)
      });
      if (res.ok) {
        setPricingToast('Hospital Pricing & Tariff Schedule updated successfully across all hospital modules!');
        setTimeout(() => setPricingToast(''), 5000);
      }
    } catch (err) {
      console.error('Save pricing error:', err);
    } finally {
      setPricingSaving(false);
    }
  };

  // Save Social Links Updates
  const handleSaveSocials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSocialSaving(true);
    try {
      const res = await fetch('/api/hospital/social-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(socialLinks)
      });
      if (res.ok) {
        setSocialToast('Hospital Social Media & Public Communication Links saved successfully!');
        setTimeout(() => setSocialToast(''), 5000);
      }
    } catch (err) {
      console.error('Save socials error:', err);
    } finally {
      setSocialSaving(false);
    }
  };

  // Handle Add Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffUsername.trim()) return;

    setAddingStaffLoading(true);
    try {
      await onAddStaff({
        name: staffName,
        email: staffEmail || `${staffUsername}@terralinkhealth.co.ke`,
        username: staffUsername,
        role: staffRole,
        department: staffDept,
        licenseNumber: staffLicense,
        password: tempPassword
      });
      setShowAddStaffModal(false);
      setStaffName('');
      setStaffUsername('');
      setStaffEmail('');
      setStaffLicense('');
    } catch (err) {
      console.error(err);
    } finally {
      setAddingStaffLoading(false);
    }
  };

  // Handle Add Department
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) return;

    try {
      await onAddDepartment({
        name: deptName,
        code: deptCode.toUpperCase(),
        category: deptCategory,
        consultationFeeKES: deptFeeKES,
        operatingHours: '08:00 - 17:00 (Closed Sun)',
        location: deptLocation,
        headOfDepartment: 'Dr. Kipkemoi Haron'
      });
      setShowAddDeptModal(false);
      setDeptName('');
      setDeptCode('');
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.patientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          inv.patientPhone.includes(invoiceSearch);
    const matchesStatus = invoiceStatusFilter === 'All' || inv.status === invoiceStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollectedKES = invoices.reduce((acc, curr) => acc + (curr.paidAmountKES || 0), 0);
  const totalOutstandingKES = invoices.reduce((acc, curr) => acc + (curr.balanceKES || 0), 0);
  const totalInvoicedKES = invoices.reduce((acc, curr) => acc + (curr.totalAmountKES || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Toast notifications */}
      {paymentSuccessToast && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{paymentSuccessToast}</span>
          </div>
          <button onClick={() => setPaymentSuccessToast('')} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {pricingToast && (
        <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{pricingToast}</span>
          </div>
          <button onClick={() => setPricingToast('')} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {socialToast && (
        <div className="bg-teal-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{socialToast}</span>
          </div>
          <button onClick={() => setSocialToast('')} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Top Banner - Frosted Glass */}
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-indigo-950/90 backdrop-blur-2xl rounded-3xl p-6 text-white shadow-xl border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center justify-center font-bold text-xl backdrop-blur-md shadow-inner">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold tracking-tight">Hospital Administration & Executive Operations</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider backdrop-blur-md">
                Admin Authorized: Kipkemoi Haron
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Authorized Administrators: <span className="font-mono text-indigo-300">kipkemoiharon57@gmail.com</span> & <span className="font-mono text-indigo-300">kipkemoiharon4@gmail.com</span> • ISO 27001 & Data Protection Act 2019
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateInvoice}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-lg shadow-indigo-600/25 border border-indigo-400/40 backdrop-blur-md transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>+ Create Billing Invoice</span>
          </button>
          <button
            onClick={() => setShowAddStaffModal(true)}
            className="px-4 py-2.5 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/25 border border-emerald-400/40 backdrop-blur-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision Staff</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs - Frosted Glass Pills */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-sky-200/50 text-xs font-semibold">
        {[
          { id: 'billings', label: `Patient Billings & Invoices (${invoices.length})`, icon: Receipt },
          { id: 'pricing', label: 'Hospital Pricing & Tariff (KES)', icon: DollarSign },
          { id: 'socials', label: 'Hospital Socials & Contact Channels', icon: Share2 },
          { id: 'analytics', label: 'Executive Analytics & KPIs', icon: BarChart3 },
          { id: 'departments', label: `Departments & Clinics (${departments.length})`, icon: Building2 },
          { id: 'staff', label: `Staff & Role Access (${staffUsers.length})`, icon: Users },
          { id: 'patients', label: `Patient Master Index (${patients.length})`, icon: UserCheck },
          { id: 'audit_logs', label: `Security & Audit Logs (${auditLogs.length})`, icon: ShieldCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-4 rounded-2xl flex items-center space-x-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? 'bg-slate-900/90 text-white font-bold shadow-md backdrop-blur-md border border-white/20' 
                  : 'bg-white/50 hover:bg-white/80 text-slate-700 border border-white/60 backdrop-blur-md shadow-xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: BILLING & INVOICE MANAGEMENT ================= */}
      {activeTab === 'billings' && (
        <div className="space-y-6">
          
          {/* Revenue KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Total Revenue Collected</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                KES {totalCollectedKES.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Direct M-PESA, Cash, and Insurance Settlements</p>
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Outstanding Patient Balances</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-amber-700">
                KES {totalOutstandingKES.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Pending claims & unsettled patient accounts</p>
            </div>

            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-2">
                <span>Gross Hospital Invoiced</span>
                <CreditCard className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                KES {totalInvoicedKES.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{invoices.length} total hospital charge sheets</p>
            </div>
          </div>

          {/* Invoices List Header & Controls */}
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Patient Billings, Tariffs & Claims Processing</h3>
                <p className="text-xs text-slate-500">Create invoices, edit line items, record payments, and manage patient tariffs.</p>
              </div>

              <button
                onClick={handleOpenCreateInvoice}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Patient Billing / Invoice</span>
              </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={invoiceSearch}
                  onChange={(e) => setInvoiceSearch(e.target.value)}
                  placeholder="Search invoice number, patient name, or phone..."
                  className="w-full pl-9 pr-4 py-2.5 bg-white/80 border border-slate-300/80 rounded-2xl text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {(['All', 'Paid', 'Unpaid', 'Partially Paid', 'Overdue'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setInvoiceStatusFilter(status)}
                    className={`px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      invoiceStatusFilter === status
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white/70 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoices Table */}
            <div className="border border-white/80 rounded-2xl overflow-hidden text-xs bg-white/40 backdrop-blur-md shadow-xs">
              <table className="w-full text-left">
                <thead className="bg-white/70 text-slate-700 font-semibold border-b border-white/80">
                  <tr>
                    <th className="py-3 px-3.5">Invoice #</th>
                    <th className="py-3 px-3.5">Patient Details</th>
                    <th className="py-3 px-3.5">Date / Due</th>
                    <th className="py-3 px-3.5">Total (KES)</th>
                    <th className="py-3 px-3.5">Paid (KES)</th>
                    <th className="py-3 px-3.5">Balance</th>
                    <th className="py-3 px-3.5">Status</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No billing invoices found matching query. Click "+ Create Patient Billing / Invoice" to issue a new bill.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/60 transition-colors">
                        <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-slate-900">{inv.patientName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{inv.patientPhone}</div>
                        </td>
                        <td className="py-3 px-3.5 text-slate-600">
                          <div>Issued: {inv.issueDate}</div>
                          <div className="text-[11px] text-slate-400">Due: {inv.dueDate}</div>
                        </td>
                        <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                          KES {inv.totalAmountKES.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 font-mono font-semibold text-emerald-700">
                          KES {inv.paidAmountKES.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 font-mono font-bold text-rose-700">
                          {inv.balanceKES > 0 ? `KES ${inv.balanceKES.toLocaleString()}` : <span className="text-emerald-600">Settled</span>}
                        </td>
                        <td className="py-3 px-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            inv.status === 'Partially Paid' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                            inv.status === 'Overdue' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleOpenPayModal(inv)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] shadow-xs cursor-pointer inline-flex items-center space-x-1"
                            title="Record payment or M-PESA transaction"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Pay / Settle</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditInvoice(inv)}
                            className="p-1.5 bg-white/80 hover:bg-white text-slate-700 rounded-xl border border-slate-200 shadow-xs cursor-pointer inline-block"
                            title="Edit Invoice Items & Price"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPrintingInvoice(inv)}
                            className="p-1.5 bg-white/80 hover:bg-white text-slate-700 rounded-xl border border-slate-200 shadow-xs cursor-pointer inline-block"
                            title="View / Print Official Invoice Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 2: HOSPITAL PRICING & TARIFF SCHEDULE ================= */}
      {activeTab === 'pricing' && (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Tariff & Service Pricing Catalog (KES)</h3>
              <p className="text-xs text-slate-500">Edit consultation fees, lab tests, radiology imaging, and pharmacy prices in real time.</p>
            </div>
            <button
              onClick={handleSavePricing}
              disabled={pricingSaving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{pricingSaving ? 'Saving Updates...' : 'Save All Pricing Changes'}</span>
            </button>
          </div>

          <div className="space-y-6">
            
            {/* 1. Clinical Consultations Pricing */}
            <div className="border border-white/80 rounded-2xl p-5 bg-white/50 backdrop-blur-md space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Clinical Consultations & Ward Beds (KES)</span>
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-white/80 p-3 rounded-xl border border-white/80 space-y-1">
                  <label className="text-slate-600 font-semibold block text-[11px]">General Outpatient (OPD)</label>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-500">KES</span>
                    <input
                      type="number"
                      value={pricing.consultations.generalOPD}
                      onChange={(e) => setPricing(prev => ({
                        ...prev,
                        consultations: { ...prev.consultations, generalOPD: Number(e.target.value) || 0 }
                      }))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-white/80 space-y-1">
                  <label className="text-slate-600 font-semibold block text-[11px]">Specialist Clinics (MBChB)</label>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-500">KES</span>
                    <input
                      type="number"
                      value={pricing.consultations.specialist}
                      onChange={(e) => setPricing(prev => ({
                        ...prev,
                        consultations: { ...prev.consultations, specialist: Number(e.target.value) || 0 }
                      }))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-white/80 space-y-1">
                  <label className="text-slate-600 font-semibold block text-[11px]">Emergency Casualty / A&E</label>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-500">KES</span>
                    <input
                      type="number"
                      value={pricing.consultations.emergencyCasualty}
                      onChange={(e) => setPricing(prev => ({
                        ...prev,
                        consultations: { ...prev.consultations, emergencyCasualty: Number(e.target.value) || 0 }
                      }))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="bg-white/80 p-3 rounded-xl border border-white/80 space-y-1">
                  <label className="text-slate-600 font-semibold block text-[11px]">Virtual Telemedicine</label>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-500">KES</span>
                    <input
                      type="number"
                      value={pricing.consultations.telemedicine}
                      onChange={(e) => setPricing(prev => ({
                        ...prev,
                        consultations: { ...prev.consultations, telemedicine: Number(e.target.value) || 0 }
                      }))}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Laboratory Diagnostic Tests Pricing */}
            <div className="border border-white/80 rounded-2xl p-5 bg-white/50 backdrop-blur-md space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Laboratory Diagnostic Tests Catalog ({pricing.labTests.length})</span>
                </h4>
                <button
                  onClick={() => setShowAddLabPricingModal(true)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Lab Test</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {pricing.labTests.map((test, idx) => (
                  <div key={test.id} className="bg-white/80 p-3 rounded-xl border border-white/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{test.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{test.code} • {test.category}</div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-400 text-[10px]">KES</span>
                      <input
                        type="number"
                        value={test.priceKES}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setPricing(prev => {
                            const updated = [...prev.labTests];
                            updated[idx] = { ...updated[idx], priceKES: val };
                            return { ...prev, labTests: updated };
                          });
                        }}
                        className="w-24 p-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-blue-700 text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Radiology & Medical Imaging Pricing */}
            <div className="border border-white/80 rounded-2xl p-5 bg-white/50 backdrop-blur-md space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span>Radiology & Medical Imaging Tariff ({pricing.radiology.length})</span>
                </h4>
                <button
                  onClick={() => setShowAddRadPricingModal(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Radiology Modality</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {pricing.radiology.map((rad, idx) => (
                  <div key={rad.id} className="bg-white/80 p-3 rounded-xl border border-white/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{rad.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{rad.modality} • {rad.bodyPart}</div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-400 text-[10px]">KES</span>
                      <input
                        type="number"
                        value={rad.priceKES}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setPricing(prev => {
                            const updated = [...prev.radiology];
                            updated[idx] = { ...updated[idx], priceKES: val };
                            return { ...prev, radiology: updated };
                          });
                        }}
                        className="w-28 p-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-purple-700 text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Pharmacy & Medication Pricing */}
            <div className="border border-white/80 rounded-2xl p-5 bg-white/50 backdrop-blur-md space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span>Pharmacy & Essential Drug Formulary Prices ({pricing.medications.length})</span>
                </h4>
                <button
                  onClick={() => setShowAddMedPricingModal(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Medication</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {pricing.medications.map((med, idx) => (
                  <div key={med.id} className="bg-white/80 p-3 rounded-xl border border-white/80 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{med.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{med.category} • Per {med.unit}</div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-400 text-[10px]">KES</span>
                      <input
                        type="number"
                        value={med.unitPriceKES}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setPricing(prev => {
                            const updated = [...prev.medications];
                            updated[idx] = { ...updated[idx], unitPriceKES: val };
                            return { ...prev, medications: updated };
                          });
                        }}
                        className="w-24 p-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-amber-700 text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= TAB 3: HOSPITAL SOCIAL MEDIA & CONTACT LINKS ================= */}
      {activeTab === 'socials' && (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Social Media & Public Communication Channels</h3>
              <p className="text-xs text-slate-500">Configure Facebook, X, Instagram, WhatsApp hotline, and 24/7 public emergency contacts.</p>
            </div>
            <button
              onClick={handleSaveSocials}
              disabled={socialSaving}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md shadow-teal-600/20 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{socialSaving ? 'Saving Channels...' : 'Save Official Channels'}</span>
            </button>
          </div>

          <form onSubmit={handleSaveSocials} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Facebook */}
              <div className="bg-white/80 p-4 rounded-2xl border border-white/80 space-y-2">
                <label className="font-bold text-slate-800 flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Facebook Official Page URL</span>
                </label>
                <input
                  type="url"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))}
                  placeholder="https://facebook.com/terralinkhealth"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800"
                />
              </div>

              {/* X / Twitter */}
              <div className="bg-white/80 p-4 rounded-2xl border border-white/80 space-y-2">
                <label className="font-bold text-slate-800 flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-slate-900" />
                  <span>X (formerly Twitter) Profile URL</span>
                </label>
                <input
                  type="url"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                  placeholder="https://x.com/terralinkhealth"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800"
                />
              </div>

              {/* Instagram */}
              <div className="bg-white/80 p-4 rounded-2xl border border-white/80 space-y-2">
                <label className="font-bold text-slate-800 flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-pink-600" />
                  <span>Instagram Official Account URL</span>
                </label>
                <input
                  type="url"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="https://instagram.com/terralinkhealth"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800"
                />
              </div>

              {/* WhatsApp Hotline */}
              <div className="bg-white/80 p-4 rounded-2xl border border-white/80 space-y-2">
                <label className="font-bold text-slate-800 flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Business Link / Direct Chat</span>
                </label>
                <input
                  type="url"
                  value={socialLinks.whatsapp}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="https://wa.me/254700999911"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800"
                />
              </div>

              {/* Emergency Hotline */}
              <div className="bg-white/80 p-4 rounded-2xl border border-white/80 space-y-2">
                <label className="font-bold text-slate-800 flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-rose-600" />
                  <span>24/7 Emergency Dispatch Hotline</span>
                </label>
                <input
                  type="text"
                  value={socialLinks.emergencyHotline}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, emergencyHotline: e.target.value }))}
                  placeholder="+254 700 999 911 / 999"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800"
                />
              </div>

              {/* Official Email */}
              <div className="bg-white/80 p-4 rounded-2xl border border-white/80 space-y-2">
                <label className="font-bold text-slate-800 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Official Inquiry Email</span>
                </label>
                <input
                  type="email"
                  value={socialLinks.contactEmail}
                  onChange={(e) => setSocialLinks(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="info@terralinkhealth.co.ke"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800"
                />
              </div>
            </div>

            {/* Physical Location */}
            <div className="bg-white/80 p-4 rounded-2xl border border-white/80 space-y-2">
              <label className="font-bold text-slate-800 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Hospital Physical Complex Address</span>
              </label>
              <input
                type="text"
                value={socialLinks.physicalAddress}
                onChange={(e) => setSocialLinks(prev => ({ ...prev, physicalAddress: e.target.value }))}
                placeholder="Hospital Hill Road, Parklands / Upper Hill Medical Complex, Nairobi County"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium"
              />
            </div>

            {/* Live Preview of Public Channel Buttons */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Public Footer Preview</p>
              <div className="flex flex-wrap gap-2.5">
                {socialLinks.facebook && (
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl font-medium text-xs flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Facebook</span>
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium text-xs flex items-center space-x-1.5 border border-white/20">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>X Profile</span>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium text-xs flex items-center space-x-1.5">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </a>
                )}
                {socialLinks.whatsapp && (
                  <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-xs flex items-center space-x-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>WhatsApp Hotline</span>
                  </a>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ================= TAB 4: EXECUTIVE ANALYTICS ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-xs">
              <span className="text-slate-500 text-[11px] block font-semibold">Today's Visits</span>
              <strong className="text-2xl font-bold font-mono text-slate-900">{analytics.dailyVisits}</strong>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-xs">
              <span className="text-slate-500 text-[11px] block font-semibold">Bed Occupancy</span>
              <strong className="text-2xl font-bold font-mono text-indigo-700">{analytics.bedOccupancyRate}%</strong>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-xs">
              <span className="text-slate-500 text-[11px] block font-semibold">Avg Triage Time</span>
              <strong className="text-2xl font-bold font-mono text-emerald-700">{analytics.avgTriageWaitMinutes}m</strong>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-xs">
              <span className="text-slate-500 text-[11px] block font-semibold">Avg Doctor Consult</span>
              <strong className="text-2xl font-bold font-mono text-teal-700">{analytics.avgDoctorWaitMinutes}m</strong>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-xs">
              <span className="text-slate-500 text-[11px] block font-semibold">Active Inpatients</span>
              <strong className="text-2xl font-bold font-mono text-slate-900">{analytics.activeInpatients}</strong>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-4 shadow-xs">
              <span className="text-slate-500 text-[11px] block font-semibold">ICU Occupancy</span>
              <strong className="text-2xl font-bold font-mono text-rose-700">{analytics.icuOccupancy}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: DEPARTMENTS ================= */}
      {activeTab === 'departments' && (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Departments & Specialized Clinics</h3>
              <p className="text-xs text-slate-500">Configure consultation tariffs, operating hours, and heads of department.</p>
            </div>
            <button
              onClick={() => setShowAddDeptModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="border border-white/80 rounded-2xl p-4 bg-white/50 backdrop-blur-md space-y-3 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {dept.code} • {dept.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{dept.name}</h4>
                    <p className="text-[11px] text-slate-500">{dept.location}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center text-xs">
                  <span className="text-slate-600">Consultation Tariff:</span>
                  <div className="flex items-center space-x-1 font-mono font-bold text-emerald-700">
                    <span>KES {dept.consultationFeeKES.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: STAFF MANAGEMENT ================= */}
      {activeTab === 'staff' && (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Medical Staff & Identity Management</h3>
              <p className="text-xs text-slate-500">Role-Based Access Control (RBAC) across Medical Doctors, Nurses, Technologists & Admins.</p>
            </div>
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Provision Staff Account</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              placeholder="Search staff by name, role, username or department..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/80 border border-slate-300/80 rounded-2xl text-xs focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="border border-white/80 rounded-2xl overflow-hidden text-xs bg-white/40 backdrop-blur-md shadow-xs">
            <table className="w-full text-left">
              <thead className="bg-white/70 text-slate-700 font-semibold border-b border-white/80">
                <tr>
                  <th className="py-3 px-3.5">Staff Name & Username</th>
                  <th className="py-3 px-3.5">Assigned Role</th>
                  <th className="py-3 px-3.5">Department</th>
                  <th className="py-3 px-3.5">License #</th>
                  <th className="py-3 px-3.5">Status</th>
                  <th className="py-3 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {staffUsers.filter(s => s.name.toLowerCase().includes(staffSearch.toLowerCase()) || s.username?.toLowerCase().includes(staffSearch.toLowerCase()) || s.role.includes(staffSearch)).map((staff) => (
                  <tr key={staff.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900">{staff.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">@{staff.username || staff.email}</div>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 uppercase">
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-700">{staff.department || 'General Clinical'}</td>
                    <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500">{staff.licenseNumber || 'Verified'}</td>
                    <td className="py-3 px-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${staff.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                        {staff.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => onResetStaffPassword(staff.id)}
                        className="p-1.5 bg-white hover:bg-amber-50 text-amber-700 rounded-lg border border-slate-200 shadow-xs cursor-pointer inline-block"
                        title="Reset Staff Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleStaffStatus(staff.id, !staff.isActive)}
                        className={`p-1.5 rounded-lg border shadow-xs cursor-pointer inline-block ${staff.isActive ? 'bg-white hover:bg-rose-50 text-rose-700 border-slate-200' : 'bg-emerald-600 text-white'}`}
                        title={staff.isActive ? 'Suspend Access' : 'Reactivate'}
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 7: PATIENT MASTER INDEX ================= */}
      {activeTab === 'patients' && (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-200/60 pb-3">
            <h3 className="text-base font-bold text-slate-900">National Master Patient Index (EMR Directory)</h3>
            <p className="text-xs text-slate-500">Universal patient identifiers, SHIF insurance links, and biometric verification status.</p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              placeholder="Search patients by name, national ID, phone, or SHIF number..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/80 border border-slate-300/80 rounded-2xl text-xs focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="border border-white/80 rounded-2xl overflow-hidden text-xs bg-white/40 backdrop-blur-md shadow-xs">
            <table className="w-full text-left">
              <thead className="bg-white/70 text-slate-700 font-semibold border-b border-white/80">
                <tr>
                  <th className="py-3 px-3.5">Hospital MRN</th>
                  <th className="py-3 px-3.5">Patient Name</th>
                  <th className="py-3 px-3.5">Kenyan National ID</th>
                  <th className="py-3 px-3.5">Phone & Email</th>
                  <th className="py-3 px-3.5">Blood Group</th>
                  <th className="py-3 px-3.5">Insurance / Scheme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {patients.filter(p => p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) || p.nationalId.includes(patientSearch) || p.phone.includes(patientSearch)).map((p) => (
                  <tr key={p.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-700">{p.mrn}</td>
                    <td className="py-3 px-3.5 font-semibold text-slate-900">{p.fullName}</td>
                    <td className="py-3 px-3.5 font-mono">{p.nationalId}</td>
                    <td className="py-3 px-3.5 text-slate-600">
                      <div>{p.phone}</div>
                      <div className="text-[11px] text-slate-400">{p.email || 'None'}</div>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-rose-700">{p.bloodGroup}</td>
                    <td className="py-3 px-3.5 text-slate-700">{p.insuranceProvider}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 8: AUDIT LOGS ================= */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Security Audit Trail & Compliance Telemetry</h3>
              <p className="text-xs text-slate-500">Immutable logging of all EHR document access, result releases, and billing transactions.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-full text-xs flex items-center space-x-1.5 border border-emerald-200 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS 1.3 Active</span>
            </span>
          </div>

          <div className="border border-white/80 rounded-2xl overflow-hidden text-xs bg-white/40 backdrop-blur-md shadow-xs">
            <table className="w-full text-left font-mono text-[11px]">
              <thead className="bg-white/70 text-slate-700 font-semibold border-b border-white/80 font-sans">
                <tr>
                  <th className="py-3 px-3.5">Timestamp</th>
                  <th className="py-3 px-3.5">User</th>
                  <th className="py-3 px-3.5">Role</th>
                  <th className="py-3 px-3.5">Action</th>
                  <th className="py-3 px-3.5">Resource</th>
                  <th className="py-3 px-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-2.5 px-3.5 text-slate-500">{log.timestamp.replace('T', ' ').slice(0, 19)}</td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-900 font-sans">{log.userName}</td>
                    <td className="py-2.5 px-3.5 text-slate-600 font-sans">{log.userRole}</td>
                    <td className="py-2.5 px-3.5 font-bold text-emerald-700 font-sans">{log.action}</td>
                    <td className="py-2.5 px-3.5 text-slate-800 font-sans">{log.details}</td>
                    <td className="py-2.5 px-3.5 text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT INVOICE ================= */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden my-8">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-4 text-white flex justify-between items-center border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base">
                  {editingInvoiceId ? 'Edit Patient Billing Invoice' : 'Generate Patient Billing Invoice'}
                </h3>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSaveInvoice} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Patient *</label>
                  <select
                    value={invPatientId}
                    onChange={(e) => setInvPatientId(e.target.value)}
                    className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl font-medium focus:bg-white"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={invDueDate}
                      onChange={(e) => setInvDueDate(e.target.value)}
                      className="w-full p-2 bg-white/80 border border-slate-300/80 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status</label>
                    <select
                      value={invStatus}
                      onChange={(e) => setInvStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl font-bold"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Line Items Builder */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Invoice Line Items</span>
                  <span className="font-mono text-indigo-700 font-bold">
                    Total: KES {invItems.reduce((acc, curr) => acc + curr.amountKES, 0).toLocaleString()}
                  </span>
                </div>

                {/* Existing Items Table */}
                <div className="space-y-1.5">
                  {invItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200/70 text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{item.description}</span>
                        <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">{item.category}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-mono font-bold text-slate-900">KES {item.amountKES.toLocaleString()}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveInvoiceItem(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Item Row */}
                <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={invItemDesc}
                      onChange={(e) => setInvItemDesc(e.target.value)}
                      placeholder="Item description (e.g. ECG Test)"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={invItemCategory}
                      onChange={(e) => setInvItemCategory(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Radiology">Radiology</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Ward Bed">Ward Bed</option>
                      <option value="Nursing">Nursing</option>
                      <option value="Surgical">Surgical</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      value={invItemAmount}
                      onChange={(e) => setInvItemAmount(Number(e.target.value) || 0)}
                      placeholder="KES"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddInvoiceItem}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Invoice Notes / Clinical Summary</label>
                <textarea
                  rows={2}
                  value={invNotes}
                  onChange={(e) => setInvNotes(e.target.value)}
                  placeholder="Notes, diagnosis codes or insurance authorization number..."
                  className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingInvoiceId ? 'Update Invoice' : 'Issue Invoice'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PAY INVOICE / RECORD TRANSACTION ================= */}
      {showPayModal && selectedPayInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 px-6 py-4 text-white flex justify-between items-center border-b border-white/10">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">Record Patient Payment</h3>
              </div>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-emerald-900 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Invoice: {selectedPayInvoice.invoiceNumber}</span>
                  <span className="font-mono">Total: KES {selectedPayInvoice.totalAmountKES.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-800">
                  <span>Patient: {selectedPayInvoice.patientName}</span>
                  <span className="font-mono font-bold">Outstanding: KES {selectedPayInvoice.balanceKES.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Amount (KES) *</label>
                <input
                  type="number"
                  required
                  value={payAmountKES}
                  onChange={(e) => setPayAmountKES(Number(e.target.value) || 0)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-emerald-700 text-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Channel *</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                >
                  <option value="M-PESA">Safaricom M-PESA Express / Paybill 992200</option>
                  <option value="Cash">Cash at Hospital Accounts Desk</option>
                  <option value="SHIF Insurance">Social Health Insurance Fund (SHIF / NHIF Guarantee)</option>
                  <option value="Private Insurance">Private Medical Insurance Claim (AAR, Jubilee, APA)</option>
                  <option value="Card">Credit / Debit Card (VISA / Mastercard)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Receipt / Authorization Code *</label>
                <input
                  type="text"
                  required
                  value={payReceipt}
                  onChange={(e) => setPayReceipt(e.target.value)}
                  placeholder="e.g. QH82391029"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold uppercase"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Confirm & Settle Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRINT / VIEW INVOICE SLIP ================= */}
      {printingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-slate-900 text-xs">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">TL</div>
                  <h3 className="font-bold text-base tracking-tight">TERRALINKHEALTH HOSPITAL</h3>
                </div>
                <p className="text-[11px] text-slate-300 mt-1">Official Patient Billing Statement & Tax Receipt</p>
                <p className="text-[10px] text-slate-400">Hospital Hill Rd, Nairobi • Tel: +254 700 999 911</p>
              </div>
              <button onClick={() => setPrintingInvoice(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            {/* Bill Info */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Patient Name:</span>
                  <strong className="text-slate-900 text-xs">{printingInvoice.patientName}</strong>
                  <span className="text-slate-500 block mt-1">Phone: {printingInvoice.patientPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Invoice Number:</span>
                  <strong className="font-mono text-slate-900 text-xs">{printingInvoice.invoiceNumber}</strong>
                  <span className="text-slate-500 block mt-1">Date: {printingInvoice.issueDate}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 text-right">Amount (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {printingInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 font-medium">{it.description}</td>
                        <td className="py-2 px-3 text-slate-500">{it.category}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">KES {it.amountKES.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={2} className="py-2.5 px-3">Total Invoiced:</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-900">KES {printingInvoice.totalAmountKES.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-2 px-3 text-emerald-700">Amount Paid:</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700">KES {printingInvoice.paidAmountKES.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-2 px-3 text-rose-700">Outstanding Balance:</td>
                      <td className="py-2 px-3 text-right font-mono text-rose-700">KES {printingInvoice.balanceKES.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Verification & Stamp */}
              <div className="flex justify-between items-center pt-2 text-[10px] text-slate-500">
                <div>
                  <p>Status: <strong className="uppercase font-bold text-slate-800">{printingInvoice.status}</strong></p>
                  <p>Verification Hash: <span className="font-mono">TL-KES-{printingInvoice.id.slice(0, 8)}</span></p>
                </div>
                <div className="border border-emerald-600 text-emerald-800 px-3 py-1.5 rounded-lg text-center font-bold">
                  OFFICIAL HOSPITAL BILLING
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  onClick={() => setPrintingInvoice(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD LAB PRICING */}
      {showAddLabPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 text-xs shadow-2xl">
            <h4 className="font-bold text-sm text-slate-900">Add Lab Test to Tariff Catalog</h4>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Test Name *</label>
              <input
                type="text"
                value={newLabName}
                onChange={(e) => setNewLabName(e.target.value)}
                placeholder="e.g. Thyroid Function Panel (T3, T4, TSH)"
                className="w-full p-2 bg-white border border-slate-300 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newLabCat}
                  onChange={(e) => setNewLabCat(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                >
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Hematology">Hematology</option>
                  <option value="Microbiology">Microbiology</option>
                  <option value="Endocrine">Endocrine</option>
                  <option value="Parasitology">Parasitology</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Price (KES)</label>
                <input
                  type="number"
                  value={newLabPrice}
                  onChange={(e) => setNewLabPrice(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowAddLabPricingModal(false)} className="px-3 py-1.5 bg-slate-100 rounded-xl">Cancel</button>
              <button
                onClick={() => {
                  if (!newLabName.trim()) return;
                  setPricing(prev => ({
                    ...prev,
                    labTests: [
                      ...prev.labTests,
                      {
                        id: `lab-${Date.now()}`,
                        name: newLabName,
                        category: newLabCat,
                        code: `LAB-${newLabName.slice(0, 4).toUpperCase()}`,
                        priceKES: newLabPrice
                      }
                    ]
                  }));
                  setShowAddLabPricingModal(false);
                  setNewLabName('');
                }}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-bold"
              >
                Add to Tariff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD RADIOLOGY PRICING */}
      {showAddRadPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 text-xs shadow-2xl">
            <h4 className="font-bold text-sm text-slate-900">Add Radiology Procedure to Tariff</h4>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Procedure Name *</label>
              <input
                type="text"
                value={newRadName}
                onChange={(e) => setNewRadName(e.target.value)}
                placeholder="e.g. Obstetric Doppler Ultrasound"
                className="w-full p-2 bg-white border border-slate-300 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Modality</label>
                <select
                  value={newRadModality}
                  onChange={(e) => setNewRadModality(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                >
                  <option value="Ultrasound">Ultrasound</option>
                  <option value="X-Ray">X-Ray</option>
                  <option value="CT">CT Scan</option>
                  <option value="MRI">MRI</option>
                  <option value="Mammography">Mammography</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Price (KES)</label>
                <input
                  type="number"
                  value={newRadPrice}
                  onChange={(e) => setNewRadPrice(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowAddRadPricingModal(false)} className="px-3 py-1.5 bg-slate-100 rounded-xl">Cancel</button>
              <button
                onClick={() => {
                  if (!newRadName.trim()) return;
                  setPricing(prev => ({
                    ...prev,
                    radiology: [
                      ...prev.radiology,
                      {
                        id: `rad-${Date.now()}`,
                        name: newRadName,
                        modality: newRadModality,
                        bodyPart: 'General',
                        priceKES: newRadPrice
                      }
                    ]
                  }));
                  setShowAddRadPricingModal(false);
                  setNewRadName('');
                }}
                className="px-4 py-1.5 bg-purple-600 text-white rounded-xl font-bold"
              >
                Add Modality
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEDICATION PRICING */}
      {showAddMedPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 space-y-4 text-xs shadow-2xl">
            <h4 className="font-bold text-sm text-slate-900">Add Medication to Formulary Catalog</h4>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Drug Name & Dosage *</label>
              <input
                type="text"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                placeholder="e.g. Azithromycin 500mg (3 tablets)"
                className="w-full p-2 bg-white border border-slate-300 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={newMedCat}
                  onChange={(e) => setNewMedCat(e.target.value)}
                  placeholder="Antibiotics"
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit Price (KES)</label>
                <input
                  type="number"
                  value={newMedPrice}
                  onChange={(e) => setNewMedPrice(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setShowAddMedPricingModal(false)} className="px-3 py-1.5 bg-slate-100 rounded-xl">Cancel</button>
              <button
                onClick={() => {
                  if (!newMedName.trim()) return;
                  setPricing(prev => ({
                    ...prev,
                    medications: [
                      ...prev.medications,
                      {
                        id: `med-${Date.now()}`,
                        name: newMedName,
                        category: newMedCat,
                        unitPriceKES: newMedPrice,
                        unit: 'Pack'
                      }
                    ]
                  }));
                  setShowAddMedPricingModal(false);
                  setNewMedName('');
                }}
                className="px-4 py-1.5 bg-amber-600 text-white rounded-xl font-bold"
              >
                Add Drug
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD STAFF */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-4 text-white flex justify-between items-center border-b border-white/10">
              <h3 className="font-bold text-base">Provision New Healthcare Staff Account</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Dr. Kevin Ochieng, MBChB"
                  className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={staffUsername}
                    onChange={(e) => setStaffUsername(e.target.value)}
                    placeholder="e.g. dr.kevin"
                    className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl font-mono focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="kevin@terralinkhealth.co.ke"
                    className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinical Role *</label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value as any)}
                    className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl font-medium focus:bg-white focus:outline-hidden"
                  >
                    <option value="doctor">Medical Doctor / Specialist</option>
                    <option value="lab_tech">Laboratory Technologist</option>
                    <option value="radiologist">Radiologist</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="nurse">Nurse / Triage Officer</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={staffDept}
                    onChange={(e) => setStaffDept(e.target.value)}
                    className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">KMPDC / Professional Council License #</label>
                <input
                  type="text"
                  value={staffLicense}
                  onChange={(e) => setStaffLicense(e.target.value)}
                  placeholder="e.g. KMPDC/A.89201"
                  className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl font-mono focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-2xl p-3.5">
                <span className="font-bold text-amber-900 block mb-1">Initial Temporary Password:</span>
                <input
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  className="w-full p-2 bg-white border border-amber-300 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingStaffLoading}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {addingStaffLoading ? 'Creating...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DEPARTMENT */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 px-6 py-4 text-white flex justify-between items-center border-b border-white/10">
              <h3 className="font-bold text-base">Add Hospital Clinical Department</h3>
              <button onClick={() => setShowAddDeptModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateDepartment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Ophthalmology (Eye Clinic)"
                  className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="e.g. EYE"
                    className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl font-mono uppercase focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={deptCategory}
                    onChange={(e) => setDeptCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl focus:bg-white focus:outline-hidden"
                  >
                    <option value="Clinical">Clinical</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="Therapeutic">Therapeutic</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Surgical">Surgical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Consultation Fee (KES)</label>
                  <input
                    type="number"
                    value={deptFeeKES}
                    onChange={(e) => setDeptFeeKES(parseInt(e.target.value) || 1500)}
                    className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl font-mono font-bold focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / Wing</label>
                  <input
                    type="text"
                    value={deptLocation}
                    onChange={(e) => setDeptLocation(e.target.value)}
                    className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-xl focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
