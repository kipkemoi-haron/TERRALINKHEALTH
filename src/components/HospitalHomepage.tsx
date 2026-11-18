import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldPlus,
  Stethoscope,
  Clock,
  ArrowRight,
  Activity,
  Sparkles,
  Video,
  Quote,
  Star,
  User,
  Users,
  X,
  Search,
  CheckCircle2,
  Phone,
  PhoneCall,
  Mail,
  MapPin,
  FileText,
  Calendar,
  ChevronRight,
  MessageSquare,
  MessageCircle,
  Home,
  Menu,
  Heart,
  HeartPulse,
  Syringe,
  Pill,
  Ambulance,
  Bed,
  FileSpreadsheet,
  Layers,
  CheckCircle,
  Building2,
  ExternalLink,
  Download,
  Smartphone,
  HelpCircle,
  BriefcaseMedical,
  Microscope,
  MoreHorizontal
} from 'lucide-react';
import { Department, Doctor, InsuranceProviderPlan, PatientReview } from '../types';
import { INITIAL_REVIEWS } from '../mockData';
import founderPhotoImg from '../assets/images/founder_photo_1788042380844.jpg';
import hospitalExteriorImg from '../assets/images/terralink_hospital_exterior_1795040168279.jpg';

interface HospitalHomepageProps {
  departments?: Department[];
  doctors?: Doctor[];
  insuranceProviders?: InsuranceProviderPlan[];
  currentUser?: any;
  currentPatient?: any;
  onNavigateToPortal: (portal: 'patient' | 'provider' | 'admin', tab?: any) => void;
  onOpenAuthModal?: (mode: 'patient_login' | 'patient_register' | 'staff_login') => void;
  onOpenRegister?: () => void;
  onOpenPatientLogin?: () => void;
  onOpenStaffLogin?: () => void;
  onSelectDepartmentForBooking?: (deptId: string) => void;
  onDownloadApp?: () => void;
}

// 20 existing services accurately capturing Terralink's clinical ecosystem
const TERRALINK_CATALOG_SERVICES = [
  {
    id: 'srv-nurse',
    shortTitle: 'Home Nursing',
    name: 'Hire a Nurse & Bedside Care',
    category: 'Home & Nursing',
    filterGroup: 'Nursing',
    isPopular: true,
    iconType: 'heart',
    headline: 'Licensed, compassionate nursing care in the comfort of your home',
    description: 'Connect with registered nurses (RN/BSN) and licensed practical nurses for wound dressing, medication administration, post-operative monitoring, and IV infusion.',
    standardFeeKES: 3500,
    shaCovered: true,
    departmentName: 'Outpatient & Home Nursing Wing'
  },
  {
    id: 'srv-opd',
    shortTitle: 'General Consultation',
    name: 'General Outpatient Medical Consultation',
    category: 'Clinical & Outpatient',
    filterGroup: 'Consultations',
    isPopular: true,
    iconType: 'stethoscope',
    headline: 'Comprehensive physical examination, primary diagnosis, and outpatient triage',
    description: 'Immediate medical check-up with licensed general medical officers, vital signs evaluation, disease diagnosis, and electronic prescription issuing.',
    standardFeeKES: 1500,
    shaCovered: true,
    departmentName: 'Outpatient Department (OPD)'
  },
  {
    id: 'srv-physio',
    shortTitle: 'Physiotherapy',
    name: 'Physiotherapy & Physical Rehabilitation',
    category: 'Therapy & Rehab',
    filterGroup: 'Therapy',
    isPopular: true,
    iconType: 'activity',
    headline: 'Personalized physical therapy, musculoskeletal rehabilitation, and mobility care',
    description: 'Targeted recovery sessions for post-stroke mobility, orthopedic fracture rehabilitation, sports injuries, and chronic pain management.',
    standardFeeKES: 2500,
    shaCovered: true,
    departmentName: 'Physical Therapy & Rehab'
  },
  {
    id: 'srv-lab-cbc',
    shortTitle: 'Lab Tests',
    name: 'Full Hemogram / Complete Blood Count (CBC)',
    category: 'Laboratory & Diagnostics',
    filterGroup: 'Labs',
    isPopular: true,
    iconType: 'syringe',
    headline: 'Automated 5-part differential blood analysis with platelet and red cell indices',
    description: 'Rapid diagnostic screening for anemia, systemic infection, hematologic malignancies, and immune status with automated digital verification.',
    standardFeeKES: 1200,
    shaCovered: true,
    departmentName: 'Medical Laboratory & Blood Bank'
  },
  {
    id: 'srv-spec',
    shortTitle: 'Specialist Visit',
    name: 'Specialist Senior Physician Consultation',
    category: 'Specialist Clinics',
    filterGroup: 'Consultations',
    isPopular: true,
    iconType: 'stethoscope',
    headline: 'Senior Consultant clinical review in Cardiology, Neurology, Orthopedics, or Internal Medicine',
    description: 'Advanced clinical evaluations, diagnostic syntheses, and second medical opinions by leading KMPDC board-certified medical specialists.',
    standardFeeKES: 3000,
    shaCovered: true,
    departmentName: 'Specialist Clinics'
  },
  {
    id: 'srv-emg',
    shortTitle: 'Emergency Care',
    name: 'Accident & Emergency Trauma Triage',
    category: 'Emergency & Ambulance',
    filterGroup: 'Emergency',
    isPopular: true,
    iconType: 'ambulance',
    headline: 'Immediate critical trauma assessment, resuscitation, and casualty emergency care',
    description: 'Round-the-clock emergency room response with dedicated trauma bays, advanced resuscitation crash carts, and direct theatre access.',
    standardFeeKES: 2500,
    shaCovered: true,
    departmentName: 'Accident & Emergency (A&E)'
  },
  {
    id: 'srv-amb',
    shortTitle: 'Ambulance Dispatch',
    name: 'ALS Emergency Ambulance Dispatch',
    category: 'Emergency & Ambulance',
    filterGroup: 'Emergency',
    isPopular: false,
    iconType: 'ambulance',
    headline: 'Type C Advanced Life Support paramedic ambulance dispatch across Nairobi',
    description: 'Equipped with Zoll X-Series monitor/defibrillators, transport ventilators, advanced airway management, and certified paramedic escorts.',
    standardFeeKES: 5000,
    shaCovered: true,
    departmentName: 'Emergency Transport & Dispatch'
  },
  {
    id: 'srv-mat-norm',
    shortTitle: 'Normal Delivery',
    name: 'Normal Vaginal Delivery (Maternity Package)',
    category: 'Maternity & Delivery',
    filterGroup: 'Maternity',
    isPopular: false,
    iconType: 'heart',
    headline: 'Safe, compassionate maternity delivery with Obstetrician and midwife care',
    description: 'Comprehensive intrapartum monitoring, consultant Obstetrician delivery, dedicated midwife care, 48-hour postpartum stay, and newborn immunization.',
    standardFeeKES: 45000,
    shaCovered: true,
    departmentName: 'Obstetrics & Gynaecology'
  },
  {
    id: 'srv-mat-cs',
    shortTitle: 'C-Section Delivery',
    name: 'Caesarean Section Surgical Delivery',
    category: 'Maternity & Delivery',
    filterGroup: 'Maternity',
    isPopular: false,
    iconType: 'activity',
    headline: 'Elective and emergency C-section delivery in sterile laminar-flow operating theatre',
    description: 'Obstetrician surgical fee, anaesthetist cover, dedicated neonatal pediatric standby, theatre consumables, and 3-day private recovery suite.',
    standardFeeKES: 95000,
    shaCovered: true,
    departmentName: 'Obstetrics & Gynaecology'
  },
  {
    id: 'srv-lab-lipid',
    shortTitle: 'Lipid Profile',
    name: 'Comprehensive Fasting Lipid Profile',
    category: 'Laboratory & Diagnostics',
    filterGroup: 'Labs',
    isPopular: false,
    iconType: 'syringe',
    headline: 'Total cholesterol, HDL, LDL, triglycerides, and cardiovascular risk calculation',
    description: 'Fasting venous serum analysis providing deep metabolic insights for cardiovascular disease prevention and hypertension management.',
    standardFeeKES: 1800,
    shaCovered: true,
    departmentName: 'Medical Laboratory & Blood Bank'
  },
  {
    id: 'srv-rad-xray',
    shortTitle: 'Chest X-Ray',
    name: 'Digital Chest X-Ray (PA & Lateral)',
    category: 'Laboratory & Diagnostics',
    filterGroup: 'Labs',
    isPopular: false,
    iconType: 'layers',
    headline: 'High-definition digital thoracic imaging with radiologist interpretation',
    description: 'Low-dose digital radiography for respiratory pathology, lung parenchyma evaluation, cardiac silhouette assessment, and clinical clearance.',
    standardFeeKES: 2500,
    shaCovered: true,
    departmentName: 'Radiology & Medical Imaging'
  },
  {
    id: 'srv-rad-ct',
    shortTitle: 'Brain CT Scan',
    name: 'Brain CT Scan (High-Resolution Multi-Slice)',
    category: 'Laboratory & Diagnostics',
    filterGroup: 'Labs',
    isPopular: false,
    iconType: 'layers',
    headline: '128-slice rapid volumetric computed tomography for trauma, stroke, and hemorrhage',
    description: 'Sub-millimeter cranial imaging for intracranial hemorrhage, acute ischemic stroke, trauma, and neurological evaluation with 3D multiplanar reconstruction.',
    standardFeeKES: 14000,
    shaCovered: true,
    departmentName: 'Radiology & Medical Imaging'
  },
  {
    id: 'srv-icu',
    shortTitle: 'ICU Care',
    name: 'Intensive Care Unit (ICU) Daily Inpatient Rate',
    category: 'Critical & Inpatient',
    filterGroup: 'Inpatient',
    isPopular: false,
    iconType: 'bed',
    headline: '24/7 dedicated 1:1 intensive nursing, mechanical ventilation, and multi-organ monitoring',
    description: 'Continuous hemodynamic monitoring, Hamilton mechanical ventilation, bedside arterial blood gas analysis, and daily intensivist consultations.',
    standardFeeKES: 25000,
    shaCovered: true,
    departmentName: 'Intensive Care Unit (ICU)'
  },
  {
    id: 'srv-hdu',
    shortTitle: 'HDU Monitoring',
    name: 'High Dependency Unit (HDU) Daily Rate',
    category: 'Critical & Inpatient',
    filterGroup: 'Inpatient',
    isPopular: false,
    iconType: 'bed',
    headline: 'Continuous cardiac telemetry, oxygen therapy, and close clinical supervision',
    description: 'Step-down high dependency inpatient monitoring for recovering post-surgical and acute medical patients requiring continuous vital oversight.',
    standardFeeKES: 12000,
    shaCovered: true,
    departmentName: 'High Dependency Unit (HDU)'
  },
  {
    id: 'srv-ward-gen',
    shortTitle: 'General Ward',
    name: 'General Medical / Surgical Ward Daily Rate',
    category: 'Critical & Inpatient',
    filterGroup: 'Inpatient',
    isPopular: false,
    iconType: 'bed',
    headline: 'Standard inpatient bed allocation, routine doctor rounds, daily nursing, and meals',
    description: 'Fully furnished comfortable medical ward bed with wall oxygen port, daily ward physician rounds, dietary management, and dedicated nursing care.',
    standardFeeKES: 3500,
    shaCovered: true,
    departmentName: 'Inpatient Medical Wards'
  },
  {
    id: 'srv-cardiology',
    shortTitle: 'Cardiology Clinic',
    name: 'Cardiology & Echocardiogram Clinic',
    category: 'Specialist Clinics',
    filterGroup: 'Consultations',
    isPopular: false,
    iconType: 'heart',
    headline: 'Hypertension, arrhythmia, heart failure management, and Doppler echocardiography',
    description: 'Expert diagnostic cardiology including 12-lead resting ECG, transthoracic echocardiography, and cardiovascular risk reduction therapies.',
    standardFeeKES: 3000,
    shaCovered: true,
    departmentName: 'Cardiology Clinic'
  },
  {
    id: 'srv-peds',
    shortTitle: 'Child Wellness',
    name: 'Paediatrics & Child Wellness Clinic',
    category: 'Specialist Clinics',
    filterGroup: 'Consultations',
    isPopular: false,
    iconType: 'heart',
    headline: 'Childhood illness treatment, growth monitoring, and KEPI vaccination schedule',
    description: 'Gentle, child-centered clinical care by Consultant Paediatricians covering newborn screening, nutritional assessments, and routine immunizations.',
    standardFeeKES: 2000,
    shaCovered: true,
    departmentName: 'Paediatrics Clinic'
  },
  {
    id: 'srv-onco',
    shortTitle: 'Oncology Center',
    name: 'Oncology & Chemotherapy Center',
    category: 'Specialist Clinics',
    filterGroup: 'Consultations',
    isPopular: false,
    iconType: 'activity',
    headline: 'Medical oncology, outpatient chemotherapy infusions, and cancer screening',
    description: 'Multidisciplinary tumor board coordination, compassionate chemotherapy infusions in private recliners, and early cancer detection screenings.',
    standardFeeKES: 3500,
    shaCovered: true,
    departmentName: 'Oncology Center'
  },
  {
    id: 'srv-dialysis',
    shortTitle: 'Kidney Dialysis',
    name: 'Dialysis & Nephrology Renal Session',
    category: 'Critical & Inpatient',
    filterGroup: 'Therapy',
    isPopular: false,
    iconType: 'activity',
    headline: 'Fresenius hemodialysis sessions, ultrafiltration, and renal nephrologist review',
    description: 'State-of-the-art dialysis suites with ultrapure RO water filtration, high-flux dialyzers, and continuous nephrology nurse supervision.',
    standardFeeKES: 9500,
    shaCovered: true,
    departmentName: 'Renal & Dialysis Center'
  },
  {
    id: 'srv-pharm',
    shortTitle: 'Pharmacy Refill',
    name: 'Pharmacy & Drug Dispensing',
    category: 'Clinical & Outpatient',
    filterGroup: 'Consultations',
    isPopular: false,
    iconType: 'pill',
    headline: '24/7 verified medication dispensing, drug interaction checks, and counseling',
    description: 'KMPDC & Pharmacy and Poisons Board certified pharmaceuticals, chronic medicine refill programs, electronic interaction safety checks, and patient counseling.',
    standardFeeKES: 500,
    shaCovered: true,
    departmentName: 'Pharmacy & Dispensing'
  }
];

export const HospitalHomepage: React.FC<HospitalHomepageProps> = ({
  departments = [],
  doctors = [],
  currentUser,
  currentPatient,
  onNavigateToPortal,
  onOpenAuthModal,
  onOpenRegister,
  onOpenPatientLogin,
  onOpenStaffLogin,
  onDownloadApp,
}) => {
  const handleOpenAuth = (mode: 'patient_login' | 'patient_register' | 'staff_login') => {
    if (onOpenAuthModal) {
      onOpenAuthModal(mode);
    } else if (mode === 'patient_register' && onOpenRegister) {
      onOpenRegister();
    } else if (mode === 'patient_login' && onOpenPatientLogin) {
      onOpenPatientLogin();
    } else if (mode === 'staff_login' && onOpenStaffLogin) {
      onOpenStaffLogin();
    }
  };

  const [heroImgFailed, setHeroImgFailed] = useState<boolean>(false);

  // Founder Profile Modal State
  const [isFounderModalOpen, setIsFounderModalOpen] = useState<boolean>(false);
  const [founderPhoto] = useState<string>(() => {
    try {
      return localStorage.getItem('terralink_founder_profile_picture') || founderPhotoImg || '/images/founder_photo.jpg';
    } catch {
      return founderPhotoImg || '/images/founder_photo.jpg';
    }
  });

  // Call / SMS Options Modal State
  const [isCallSmsModalOpen, setIsCallSmsModalOpen] = useState<boolean>(false);

  // Footer "More" Menu Drawer State
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState<boolean>(false);

  // Quick Appointment Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('dept-opd');
  const [selectedServiceName, setSelectedServiceName] = useState<string>('General Outpatient Medical Consultation');
  const [appointmentDate, setAppointmentDate] = useState<string>('2026-10-15');
  const [appointmentTime, setAppointmentTime] = useState<string>('10:00 AM');
  const [bookingReason, setBookingReason] = useState<string>('');
  const [patientFullName, setPatientFullName] = useState<string>(currentPatient?.name || currentUser?.name || '');
  const [patientPhone, setPatientPhone] = useState<string>(currentPatient?.phone || currentUser?.phone || '0712345678');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string>('');

  // Reviews Modal State & Data
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);
  const [liveReviews, setLiveReviews] = useState<PatientReview[]>(INITIAL_REVIEWS);
  const [reviewSearchQuery, setReviewSearchQuery] = useState<string>('');
  const [isReviewFormOpen, setIsReviewFormOpen] = useState<boolean>(false);
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewNotification, setReviewNotification] = useState<string>('');

  // Info Modals (Contact, Privacy, Terms)
  const [activeInfoModal, setActiveInfoModal] = useState<'contact' | 'privacy' | 'terms' | null>(null);

  // Healthcare Services Filter, Search & Slide-up Detail Sheet State
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<string>('All');
  const [showAllServices, setShowAllServices] = useState<boolean>(false);
  const [selectedServiceDetail, setSelectedServiceDetail] = useState<typeof TERRALINK_CATALOG_SERVICES[number] | null>(null);

  // Filter pills matching clean mobile healthcare portal layout
  const catalogCategories = showAllServices
    ? ['All', 'Nursing', 'Consultations', 'Labs', 'Therapy', 'Maternity', 'Emergency', 'Inpatient']
    : ['All', 'Nursing', 'Consultations', 'Labs', 'Therapy'];

  // Filtered Services List
  const filteredCatalogServices = TERRALINK_CATALOG_SERVICES.filter(service => {
    const q = catalogSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      service.shortTitle.toLowerCase().includes(q) ||
      service.name.toLowerCase().includes(q) ||
      service.headline.toLowerCase().includes(q) ||
      service.description.toLowerCase().includes(q) ||
      service.filterGroup.toLowerCase().includes(q);
    const matchesCat = catalogCategory === 'All' || service.filterGroup === catalogCategory;
    return matchesSearch && matchesCat;
  });

  const isDefaultPopularView = catalogCategory === 'All' && catalogSearch.trim() === '' && !showAllServices;
  const visibleServices = isDefaultPopularView
    ? TERRALINK_CATALOG_SERVICES.filter(s => s.isPopular).slice(0, 6)
    : filteredCatalogServices;

  // Review Form State
  const [reviewForm, setReviewForm] = useState({
    name: currentPatient?.name || currentUser?.name || '',
    location: currentPatient?.county ? `${currentPatient.county}, Kenya` : 'Nairobi, Kenya',
    rating: 5,
    department: 'Cardiology Clinic',
    headline: '',
    quote: '',
    outcome: 'Successful Recovery & Compassionate Care'
  });

  // Fetch reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLiveReviews(data);
          }
        }
      } catch (err) {
        console.warn('Using local reviews fallback', err);
      }
    };
    fetchReviews();
  }, []);

  const handlePublishReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.headline.trim() || !reviewForm.quote.trim()) return;

    setReviewSubmitting(true);
    const newRev: PatientReview = {
      id: `rev-${Date.now()}`,
      name: reviewForm.name || 'Verified Patient',
      location: reviewForm.location || 'Nairobi, Kenya',
      age: 30,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      category: 'general',
      categoryLabel: reviewForm.department,
      condition: 'Medical Care',
      doctorName: 'Dr. David Ochieng',
      department: reviewForm.department,
      insurance: 'SHA / Private Insurance',
      rating: reviewForm.rating,
      date: 'October 2026',
      headline: reviewForm.headline,
      quote: reviewForm.quote,
      outcome: reviewForm.outcome,
      isVerified: true
    };

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRev)
      });
      setLiveReviews(prev => [newRev, ...prev]);
      setReviewNotification('Thank you! Your patient review has been published.');
      setIsReviewFormOpen(false);
      setTimeout(() => setReviewNotification(''), 4000);
    } catch {
      setLiveReviews(prev => [newRev, ...prev]);
      setIsReviewFormOpen(false);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filteredReviews = liveReviews.filter(rev => {
    const matchesSearch = 
      rev.name.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
      rev.headline.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
      rev.department.toLowerCase().includes(reviewSearchQuery.toLowerCase());
    return matchesSearch;
  });

  // Handle Book Appointment Click
  const handleBookAppointmentClick = () => {
    if (currentUser && currentUser.role === 'patient') {
      onNavigateToPortal('patient', 'appointments');
    } else {
      setIsBookingModalOpen(true);
    }
  };

  // Submit quick appointment booking
  const handleQuickBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find(d => d.id === selectedDeptId);

    const bookingPayload = {
      patientName: patientFullName || 'Patient',
      patientPhone: patientPhone || '0713544101',
      departmentId: selectedDeptId,
      departmentName: dept?.name || selectedServiceName,
      doctorId: doctors[0]?.id || 'doc-1',
      doctorName: doctors[0]?.name || 'Consultant Physician',
      scheduledDate: appointmentDate,
      timeSlot: appointmentTime,
      reasonForVisit: bookingReason || selectedServiceName || 'Clinical Medical Consultation',
      status: 'Scheduled',
      type: 'in_person'
    };

    try {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
    } catch (err) {
      console.warn('Booking saved locally:', err);
    }

    setBookingSuccessMsg(`Appointment requested successfully for ${appointmentDate} at ${appointmentTime}! A confirmation SMS has been dispatched to ${patientPhone}.`);
    setTimeout(() => {
      setBookingSuccessMsg('');
      setIsBookingModalOpen(false);
    }, 3500);
  };

  // Scroll smoothly to Healthcare Services catalog
  const handleExploreServicesClick = () => {
    const elem = document.getElementById('explore-healthcare-services');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Soft tinted circle colors + crisp icon colors per service group (One Medical / Zocdoc aesthetic)
  const getServiceSoftTint = (filterGroup: string) => {
    switch (filterGroup) {
      case 'Nursing':
      case 'Maternity':
        return 'bg-rose-50 text-[#D90429]';
      case 'Emergency':
        return 'bg-red-50 text-[#D90429]';
      case 'Therapy':
        return 'bg-emerald-50 text-[#00A859]';
      case 'Labs':
        return 'bg-amber-50 text-amber-600';
      case 'Inpatient':
        return 'bg-purple-50 text-purple-600';
      case 'Consultations':
      default:
        return 'bg-indigo-50 text-[#28257A]';
    }
  };

  const renderServiceIcon = (type: string) => {
    switch (type) {
      case 'heart':
        return <Heart className="w-5 h-5 stroke-[2]" />;
      case 'activity':
        return <Activity className="w-5 h-5 stroke-[2]" />;
      case 'ambulance':
        return <Ambulance className="w-5 h-5 stroke-[2]" />;
      case 'syringe':
        return <Syringe className="w-5 h-5 stroke-[2]" />;
      case 'pill':
        return <Pill className="w-5 h-5 stroke-[2]" />;
      case 'bed':
        return <Bed className="w-5 h-5 stroke-[2]" />;
      case 'layers':
        return <Layers className="w-5 h-5 stroke-[2]" />;
      default:
        return <Stethoscope className="w-5 h-5 stroke-[2]" />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-800 flex flex-col justify-between selection:bg-sky-100 selection:text-slate-900 pb-20 md:pb-0">
      
      {/* ================= 1. HEADER BAR ================= */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          
          {/* Logo & Brand */}
          <button
            type="button"
            onClick={() => {
              setIsMoreDrawerOpen(false);
              if (currentUser?.role === 'patient') onNavigateToPortal('patient');
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-2.5 cursor-pointer select-none min-w-0 group text-left shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-[#C8102E] text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-xs">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-display text-[15px] sm:text-lg font-extrabold text-[#0A2756] leading-none tracking-tight uppercase whitespace-nowrap">
              TERRALINK HOSPITAL
            </span>
          </button>

          {/* Desktop / Tablet Top Navigation (Hidden on Mobile Smartphones) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={handleExploreServicesClick}
              className="hover:text-[#0A2756] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Services
            </button>
            <button
              type="button"
              onClick={handleBookAppointmentClick}
              className="hover:text-[#0A2756] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Appointments
            </button>
            <button
              type="button"
              onClick={() => {
                if (currentUser && currentUser.role === 'patient') {
                  onNavigateToPortal('patient', 'appointments');
                } else {
                  handleOpenAuth('patient_login');
                }
              }}
              className="hover:text-[#0A2756] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Telemedicine
            </button>
            <button
              type="button"
              onClick={() => setIsReviewsModalOpen(true)}
              className="hover:text-[#0A2756] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Reviews
            </button>
            <button
              type="button"
              onClick={() => setIsMoreDrawerOpen(true)}
              className="hover:text-[#0A2756] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              More
            </button>
          </nav>

          {/* Right Header Action - Rounded Patient Portal Button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                if (currentUser && currentUser.role === 'patient') {
                  onNavigateToPortal('patient');
                } else {
                  handleOpenAuth('patient_login');
                }
              }}
              className="px-3.5 sm:px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-[#0A2756] border border-slate-200/80 font-semibold text-xs transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95 shrink-0 whitespace-nowrap"
              title="Open Patient Portal"
            >
              <User className="w-3.5 h-3.5 stroke-[2.1] text-[#0A2756]/80" />
              <span>Patient Portal</span>
            </button>
          </div>

        </div>
      </header>

      {/* ================= 2. FULL-BLEED HOSPITAL HERO SECTION ================= */}
      <section className="relative w-full overflow-hidden bg-[#082458]">
        {/* Full-Bleed Hospital Entrance Background Photograph */}
        {!heroImgFailed ? (
          <img
            src={hospitalExteriorImg}
            alt="TERRALINK HOSPITAL main entrance with doctors and medical professionals welcoming patients"
            referrerPolicy="no-referrer"
            onError={() => setHeroImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover object-[72%_28%] sm:object-[center_30%] select-none pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#072152] via-[#0B3475] to-[#1D4ED8]" />
        )}

        {/* Deep Navy Left-Side Gradient Overlay Keeping Hospital Building & Professionals Clear on Right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(95deg, rgba(7, 33, 82, 0.96) 0%, rgba(10, 46, 108, 0.88) 44%, rgba(10, 46, 108, 0.42) 68%, rgba(10, 46, 108, 0.08) 100%)'
          }}
        />
        <div
          className="absolute inset-0 sm:hidden pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(7, 33, 82, 0.28) 0%, rgba(7, 33, 82, 0.12) 48%, rgba(7, 33, 82, 0.88) 88%, rgba(7, 33, 82, 0.96) 100%)'
          }}
        />

        {/* Hero Foreground Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-8 sm:pt-14 lg:pt-20 pb-14 sm:pb-24 lg:pb-28">
          <div className="text-left">
            
            {/* Main Heading with Gold Priority Accent & Subtle Curved Underline */}
            <h1 className="font-display text-[28px] xs:text-[32px] sm:text-5xl lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-xs">
              Your Health,
              <br />
              Our{' '}
              <span className="relative inline-block text-[#F5B700]">
                Priority
                <svg
                  viewBox="0 0 140 12"
                  fill="none"
                  className="absolute -bottom-1 left-0 w-full h-2.5 text-[#F5B700]"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 9.5C38 2.5 96 1.5 138 7.5"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="mt-3.5 sm:mt-5 text-[13px] xs:text-[14px] sm:text-base lg:text-lg text-white/95 font-medium leading-relaxed max-w-[235px] xs:max-w-[260px] sm:max-w-lg drop-shadow-xs">
              Get quality care, expert support, and a seamless digital experience&mdash;all in one place.
            </p>

            {/* Three Visual Feature Icons: Compassion | Expertise | Better Health */}
            <div className="mt-5 sm:mt-7 inline-flex items-stretch divide-x divide-white/30">
              <div className="pr-3 xs:pr-4 sm:pr-6 flex flex-col items-center text-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mb-1.5 backdrop-blur-xs">
                  <ShieldPlus className="w-4 h-4 text-white stroke-[2.2]" />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-white whitespace-nowrap">
                  Compassion
                </span>
              </div>

              <div className="px-3 xs:px-4 sm:px-6 flex flex-col items-center text-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mb-1.5 backdrop-blur-xs">
                  <Users className="w-4 h-4 text-white stroke-[2.2]" />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-white whitespace-nowrap">
                  Expertise
                </span>
              </div>

              <div className="pl-3 xs:pl-4 sm:pl-6 flex flex-col items-center text-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mb-1.5 backdrop-blur-xs">
                  <HeartPulse className="w-4 h-4 text-white stroke-[2.2]" />
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-white whitespace-nowrap">
                  Better Health
                </span>
              </div>
            </div>

            {/* Side-by-Side Primary Action Buttons — Always Same Horizontal Row */}
            <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:inline-flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleBookAppointmentClick}
                className="px-2 xs:px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-[#C8102E] hover:bg-[#A60D25] active:scale-[0.98] text-white font-bold text-[11px] xs:text-[12px] sm:text-sm shadow-lg shadow-black/25 transition-all inline-flex items-center justify-center gap-1 sm:gap-2 cursor-pointer whitespace-nowrap min-h-[44px]"
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.2] shrink-0" />
                <span>Book Appointment</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/90 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setIsCallSmsModalOpen(true)}
                className="px-2 xs:px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-full bg-white hover:bg-slate-50 active:scale-[0.98] text-[#0A2756] border border-[#0A2756]/35 font-bold text-[11px] xs:text-[12px] sm:text-sm shadow-lg shadow-black/15 transition-all inline-flex items-center justify-center gap-1 sm:gap-2 cursor-pointer whitespace-nowrap min-h-[44px]"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C8102E] stroke-[2.2] shrink-0" />
                <span>24/7 Emergency / Call</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#0A2756]/80 shrink-0" />
              </button>
            </div>

          </div>
        </div>

        {/* Hero Section Bottom Curved Wave Transition (White & Subtle Light-Blue Accents) */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 z-10 leading-none">
          <svg
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
            className="w-full h-9 sm:h-14 lg:h-16 block"
            aria-hidden="true"
          >
            {/* Subtle Light-Blue Ribbon Wave */}
            <path
              d="M0,78 C340,22 760,4 1440,54 L1440,90 L0,90 Z"
              fill="#DBEAFE"
            />
            {/* Clean White Foreground Curve */}
            <path
              d="M0,86 C390,34 860,18 1440,68 L1440,90 L0,90 Z"
              fill="#FFFFFF"
            />
          </svg>
        </div>
      </section>

      {/* ================= 3. POPULAR SERVICES SECTION ================= */}
      <section id="explore-healthcare-services" className="w-full pt-3 sm:pt-6 pb-8 sm:pb-12 px-2.5 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          
          {/* Centered Heading Flanked by Subtle Blue Lines */}
          <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-8">
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <span className="h-[1.5px] w-8 sm:w-12 bg-[#3B82F6]/60 rounded-full" aria-hidden="true" />
              <h2 className="font-display text-lg sm:text-2xl lg:text-3xl font-extrabold text-[#0A2756] tracking-tight">
                Popular Services
              </h2>
              <span className="h-[1.5px] w-8 sm:w-12 bg-[#3B82F6]/60 rounded-full" aria-hidden="true" />
            </div>
            <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-slate-600 font-medium">
              Comprehensive healthcare services for you and your family.
            </p>
          </div>

          {/* Five Core Service Cards in One Horizontal Row (Mobile & Desktop) */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-4 lg:gap-5">
            {[
              {
                serviceId: 'srv-opd',
                label: 'General Consultation',
                circleBg: 'bg-[#E0F2FE] text-[#0284C7]',
                icon: <Stethoscope className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2]" />
              },
              {
                serviceId: 'srv-spec',
                label: 'Specialist Care',
                circleBg: 'bg-[#DCFCE7] text-[#059669]',
                icon: <BriefcaseMedical className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2]" />
              },
              {
                serviceId: 'srv-lab-cbc',
                label: 'Laboratory Services',
                circleBg: 'bg-[#EDE9FE] text-[#7C3AED]',
                icon: <Microscope className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2]" />
              },
              {
                serviceId: 'srv-pharm',
                label: 'Pharmacy Services',
                circleBg: 'bg-[#FFEDD5] text-[#EA580C]',
                icon: <Pill className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2]" />
              },
              {
                serviceId: 'srv-nurse',
                label: 'Hire a Nurse',
                circleBg: 'bg-[#CCFBF1] text-[#0D9488]',
                icon: <HeartPulse className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2]" />
              }
            ].map((item) => {
              const matchedService =
                TERRALINK_CATALOG_SERVICES.find(s => s.id === item.serviceId) ||
                TERRALINK_CATALOG_SERVICES[0];
              return (
                <button
                  key={item.serviceId}
                  type="button"
                  onClick={() => setSelectedServiceDetail(matchedService)}
                  className="bg-white rounded-xl sm:rounded-2xl px-1 py-3 sm:p-5 border border-slate-100 hover:border-slate-200 shadow-[0_2px_10px_rgba(10,39,86,0.06)] hover:shadow-[0_8px_22px_rgba(10,39,86,0.1)] transition-all cursor-pointer flex flex-col items-center text-center group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A2756]/25"
                >
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${item.circleBg} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-105 transition-transform shrink-0`}>
                    {item.icon}
                  </div>
                  <span className="font-display text-[10px] xs:text-[11px] sm:text-sm font-bold text-[#0A2756] leading-tight tracking-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Toggle to Expand Full 20-Service Catalog & Category Filters */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setShowAllServices(prev => !prev)}
              className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 text-[#0A2756] font-semibold text-xs transition-all cursor-pointer inline-flex items-center space-x-1.5 active:scale-[0.98]"
            >
              <span>
                {showAllServices
                  ? 'Hide Full Services Catalog'
                  : `Explore All ${TERRALINK_CATALOG_SERVICES.length} Services \u2192`}
              </span>
            </button>
          </div>

          {showAllServices && (
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
                  {['All', 'Nursing', 'Consultations', 'Labs', 'Therapy', 'Maternity', 'Emergency', 'Inpatient'].map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCatalogCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        catalogCategory === cat
                          ? 'bg-[#0A2756] text-white'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search 20 services..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A2756]/15 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredCatalogServices.map(service => (
                  <button
                    type="button"
                    key={service.id}
                    onClick={() => setSelectedServiceDetail(service)}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 shadow-[0_1px_4px_rgba(15,23,42,0.02)] hover:shadow-[0_6px_18px_rgba(15,23,42,0.05)] transition-all cursor-pointer flex flex-col items-start text-left group"
                  >
                    <div className={`w-10 h-10 rounded-full ${getServiceSoftTint(service.filterGroup)} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                      {renderServiceIcon(service.iconType)}
                    </div>
                    <h3 className="font-display text-sm font-bold text-[#0F172A] leading-snug tracking-tight">
                      {service.shortTitle}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-slate-500 tabular-nums">
                      From KES {service.standardFeeKES.toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>

              {filteredCatalogServices.length === 0 && (
                <div className="text-center py-8 bg-slate-50/50 rounded-3xl border border-slate-100 p-6 space-y-2.5">
                  <Search className="w-6 h-6 text-slate-400 mx-auto" />
                  <h4 className="font-display text-sm font-bold text-slate-900">No matching services found</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setCatalogSearch('');
                      setCatalogCategory('All');
                    }}
                    className="px-4 py-1.5 rounded-full bg-[#0A2756] text-white font-semibold text-xs cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ================= 4. KEY FEATURES FOR BETTER CARE ================= */}
      <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center space-y-2 mb-8 sm:mb-10">
            <h2 className="font-display text-xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Key Features for Better Care
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Powering efficient hospital operations and improved patient outcomes.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 border border-slate-100 rounded-3xl overflow-hidden bg-white">
            
            {/* 1. Reduced Wait Times */}
            <div className="flex flex-col items-center text-center py-8 px-4 sm:px-6 border-r border-b md:border-b-0 border-slate-100">
              <div className="w-12 h-12 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center mb-3.5 shrink-0">
                <Clock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="font-display text-sm sm:text-base font-semibold text-slate-900 leading-tight">
                Reduced Wait Times
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Real-time queue tracking &amp; online appointment booking.
              </p>
            </div>

            {/* 2. Secure Records */}
            <div className="flex flex-col items-center text-center py-8 px-4 sm:px-6 border-b md:border-b-0 md:border-r border-slate-100">
              <div className="w-12 h-12 rounded-full bg-[#00A859] text-white flex items-center justify-center mb-3.5 shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="font-display text-sm sm:text-base font-semibold text-slate-900 leading-tight">
                Secure Records
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Encrypted patient data with role-based access control.
              </p>
            </div>

            {/* 3. Telemedicine */}
            <div className="flex flex-col items-center text-center py-8 px-4 sm:px-6 border-r border-slate-100">
              <div className="w-12 h-12 rounded-full bg-[#EC2D6F] text-white flex items-center justify-center mb-3.5 shrink-0">
                <Video className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="font-display text-sm sm:text-base font-semibold text-slate-900 leading-tight">
                Telemedicine
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Virtual consultations from anywhere in Kenya.
              </p>
            </div>

            {/* 4. Real-Time Analytics */}
            <div className="flex flex-col items-center text-center py-8 px-4 sm:px-6">
              <div className="w-12 h-12 rounded-full bg-[#F59E0B] text-white flex items-center justify-center mb-3.5 shrink-0">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="font-display text-sm sm:text-base font-semibold text-slate-900 leading-tight">
                Real-Time Analytics
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Live dashboards for hospital performance monitoring.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= SLIDE-UP SERVICE DETAIL SHEET ================= */}
      {selectedServiceDetail && (
        <div
          onClick={() => setSelectedServiceDetail(null)}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/50 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[85vh] overflow-y-auto"
          >
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto sm:hidden" />

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className={`w-12 h-12 rounded-full ${getServiceSoftTint(selectedServiceDetail.filterGroup)} flex items-center justify-center shrink-0`}>
                  {renderServiceIcon(selectedServiceDetail.iconType)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium text-slate-400">
                    {selectedServiceDetail.departmentName}
                  </p>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    {selectedServiceDetail.name}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedServiceDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-left">
              <p className="text-sm font-semibold text-[#28257A]">
                {selectedServiceDetail.headline}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedServiceDetail.description}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-left">
                <CheckCircle2 className="w-4 h-4 text-[#00A859] shrink-0" />
                <span className="text-xs font-medium text-slate-600">
                  SHA / Private Insurance Eligible
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 block">Starting Tariff</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  KES {selectedServiceDetail.standardFeeKES.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const name = selectedServiceDetail.name;
                setSelectedServiceDetail(null);
                setSelectedServiceName(name);
                setIsBookingModalOpen(true);
              }}
              className="w-full py-3.5 px-6 rounded-full bg-[#D90429] hover:bg-[#B80323] text-white font-semibold text-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book {selectedServiceDetail.shortTitle}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= 5. FOOTER ================= */}
      <footer className="w-full py-10 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-100 bg-white text-center space-y-4 text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-3">
          
          <p className="font-display text-slate-900 font-semibold text-xs sm:text-sm">
            &copy; 2026 TERRALINK HEALTH &mdash; Digital Hospital Management Platform
          </p>
          
          <p className="text-slate-400 text-xs">
            Hospital Hill Road, Parklands / Upper Hill Medical Complex, Nairobi County, Kenya &bull; 24/7 Hotline: 0713544101
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-600 pt-1 font-medium">
            <button
              onClick={() => setActiveInfoModal('contact')}
              className="hover:text-[#D90429] transition-colors cursor-pointer"
            >
              Contact
            </button>
            <span className="text-slate-300">&middot;</span>
            <button
              onClick={() => setActiveInfoModal('privacy')}
              className="hover:text-[#D90429] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-300">&middot;</span>
            <button
              onClick={() => setActiveInfoModal('terms')}
              className="hover:text-[#D90429] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          {/* Secondary Actions for Founder Leadership, Stories & App */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsFounderModalOpen(true)}
              className="px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/70 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D90429]" />
              <span>Founder Perspective</span>
            </button>

            <button
              onClick={() => setIsReviewsModalOpen(true)}
              className="px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/70 transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
              <span>Patient Reviews ({liveReviews.length})</span>
            </button>

            {onDownloadApp && (
              <button
                onClick={onDownloadApp}
                className="px-4 py-2 rounded-full bg-[#FFF1F2] hover:bg-rose-100 text-[#D90429] font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D90429]" />
                <span>Download App</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 text-xs text-slate-400">
            <button
              onClick={() => {
                if (currentUser && currentUser.role !== 'patient') {
                  onNavigateToPortal('provider');
                } else {
                  handleOpenAuth('staff_login');
                }
              }}
              className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer font-medium"
              title="Staff & Doctor Workspace"
            >
              Staff Login
            </button>
            <span className="text-slate-300">&middot;</span>
            <button
              onClick={() => onNavigateToPortal('admin')}
              className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer font-medium"
              title="Hospital Administration"
            >
              Admin Portal
            </button>
          </div>

        </div>
      </footer>

      {/* ================= 6. SLEEK FIXED BOTTOM NAVIGATION BAR (Mobile Smartphone Only) ================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-100 shadow-[0_-1px_10px_rgba(15,23,42,0.04)]">
        <div className="max-w-lg mx-auto grid grid-cols-5 items-center h-16 px-1">
          
          {/* Home */}
          <button
            type="button"
            onClick={() => {
              setIsMoreDrawerOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`relative flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
              !isMoreDrawerOpen ? 'text-[#0284C7]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className={`w-[21px] h-[21px] stroke-[2] ${!isMoreDrawerOpen ? 'fill-[#0284C7]/15' : ''}`} />
            <span className={`text-[11px] mt-1 leading-none whitespace-nowrap ${!isMoreDrawerOpen ? 'font-bold' : 'font-medium'}`}>
              Home
            </span>
            {!isMoreDrawerOpen && (
              <span className="absolute bottom-0 inset-x-4 h-[2.5px] rounded-t-full bg-[#0284C7]" />
            )}
          </button>

          {/* Appointments */}
          <button
            type="button"
            onClick={() => {
              setIsMoreDrawerOpen(false);
              if (currentUser && currentUser.role === 'patient') {
                onNavigateToPortal('patient', 'appointments');
              } else {
                setIsBookingModalOpen(true);
              }
            }}
            className="flex flex-col items-center justify-center h-full text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <Calendar className="w-[21px] h-[21px] stroke-[1.75]" />
            <span className="text-[11px] font-medium mt-1 leading-none whitespace-nowrap">
              Appointments
            </span>
          </button>

          {/* Records */}
          <button
            type="button"
            onClick={() => {
              setIsMoreDrawerOpen(false);
              if (currentUser && currentUser.role === 'patient') {
                onNavigateToPortal('patient', 'records');
              } else {
                handleOpenAuth('patient_login');
              }
            }}
            className="flex flex-col items-center justify-center h-full text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <FileText className="w-[21px] h-[21px] stroke-[1.75]" />
            <span className="text-[11px] font-medium mt-1 leading-none whitespace-nowrap">
              Records
            </span>
          </button>

          {/* Telemedicine */}
          <button
            type="button"
            onClick={() => {
              setIsMoreDrawerOpen(false);
              if (currentUser && currentUser.role === 'patient') {
                onNavigateToPortal('patient', 'appointments');
              } else {
                handleOpenAuth('patient_login');
              }
            }}
            className="flex flex-col items-center justify-center h-full text-slate-500 hover:text-slate-700 cursor-pointer transition-colors"
          >
            <Video className="w-[21px] h-[21px] stroke-[1.75]" />
            <span className="text-[11px] font-medium mt-1 leading-none whitespace-nowrap">
              Telemedicine
            </span>
          </button>

          {/* More */}
          <button
            type="button"
            onClick={() => setIsMoreDrawerOpen(prev => !prev)}
            className={`relative flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
              isMoreDrawerOpen ? 'text-[#0284C7]' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MoreHorizontal className="w-[21px] h-[21px] stroke-[2.2]" />
            <span className={`text-[11px] mt-1 leading-none whitespace-nowrap ${isMoreDrawerOpen ? 'font-bold' : 'font-medium'}`}>
              More
            </span>
            {isMoreDrawerOpen && (
              <span className="absolute bottom-0 inset-x-4 h-[2.5px] rounded-t-full bg-[#0284C7]" />
            )}
          </button>

        </div>
      </nav>

      {/* ================= MODAL / DRAWER: "MORE" MENU (Image 2 Layout & Style) ================= */}
      {isMoreDrawerOpen && (
        <div
          onClick={() => setIsMoreDrawerOpen(false)}
          className="fixed inset-x-0 top-0 bottom-16 z-40 bg-white sm:inset-0 sm:bottom-0 sm:z-50 sm:bg-slate-950/45 sm:backdrop-blur-xs flex flex-col sm:items-center sm:justify-center sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full sm:h-auto sm:max-w-md bg-white sm:rounded-3xl sm:overflow-hidden sm:shadow-2xl sm:border sm:border-slate-100 flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Bold Top Quick-Action Header Bar (Image 2 Style) */}
              <div className="bg-[#28257A] text-white px-4 pt-6 pb-6 relative">
                <button
                  onClick={() => setIsMoreDrawerOpen(false)}
                  aria-label="Close More Menu"
                  className="hidden sm:flex absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                  {/* Quick Action 1: Help */}
                  <button
                    onClick={() => {
                      setIsMoreDrawerOpen(false);
                      setActiveInfoModal('contact');
                    }}
                    className="flex flex-col items-center justify-center py-1 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/12 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                      <HelpCircle className="w-5 h-5 text-[#38BDF8] stroke-[2.2]" />
                    </div>
                    <span className="font-display text-xs font-medium text-white/95 mt-2 whitespace-nowrap">
                      Help
                    </span>
                  </button>

                  {/* Quick Action 2: Chat */}
                  <button
                    onClick={() => {
                      setIsMoreDrawerOpen(false);
                      if (currentUser && currentUser.role === 'patient') {
                        onNavigateToPortal('patient', 'messages');
                      } else {
                        setIsCallSmsModalOpen(true);
                      }
                    }}
                    className="flex flex-col items-center justify-center py-1 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/12 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                      <MessageCircle className="w-5 h-5 text-[#38BDF8] stroke-[2.2]" />
                    </div>
                    <span className="font-display text-xs font-medium text-white/95 mt-2 whitespace-nowrap">
                      Chat
                    </span>
                  </button>

                  {/* Quick Action 3: Profile */}
                  <button
                    onClick={() => {
                      setIsMoreDrawerOpen(false);
                      if (currentUser && currentUser.role === 'patient') {
                        onNavigateToPortal('patient', 'profile');
                      } else {
                        handleOpenAuth('patient_login');
                      }
                    }}
                    className="flex flex-col items-center justify-center py-1 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/12 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                      <User className="w-5 h-5 text-[#38BDF8] stroke-[2.2]" />
                    </div>
                    <span className="font-display text-xs font-medium text-white/95 mt-2 whitespace-nowrap">
                      Profile
                    </span>
                  </button>

                  {/* Quick Action 4: Staff Login */}
                  <button
                    onClick={() => {
                      setIsMoreDrawerOpen(false);
                      if (currentUser && currentUser.role !== 'patient') {
                        onNavigateToPortal('provider');
                      } else {
                        handleOpenAuth('staff_login');
                      }
                    }}
                    className="flex flex-col items-center justify-center py-1 group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/12 group-hover:bg-white/20 flex items-center justify-center transition-colors">
                      <Stethoscope className="w-5 h-5 text-[#38BDF8] stroke-[2.2]" />
                    </div>
                    <span className="font-display text-xs font-medium text-white/95 mt-2 whitespace-nowrap">
                      Staff Login
                    </span>
                  </button>
                </div>
              </div>

              {/* Clean Minimalist 2x2 Grid Divided by Subtle Hairlines (Image 2 Style) */}
              <div className="px-5 py-6 bg-white">
                <div className="grid grid-cols-2">
                  
                  {/* 1. Patient Reviews */}
                  <button
                    onClick={() => {
                      setIsMoreDrawerOpen(false);
                      setIsReviewsModalOpen(true);
                    }}
                    className="flex flex-col items-center justify-center py-9 px-3 border-r border-b border-slate-100 hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#EC2D6F] text-white flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                      <Star className="w-6 h-6 stroke-[2.1] fill-white" />
                    </div>
                    <span className="font-display text-[15px] font-semibold text-slate-800 tracking-tight text-center">
                      Patient Reviews ({liveReviews.length})
                    </span>
                  </button>

                  {/* 2. Ambulance Dispatch */}
                  <button
                    onClick={() => {
                      setIsMoreDrawerOpen(false);
                      setIsCallSmsModalOpen(true);
                    }}
                    className="flex flex-col items-center justify-center py-9 px-3 border-b border-slate-100 hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#F59E0B] text-white flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                      <Ambulance className="w-6 h-6 stroke-[2.1]" />
                    </div>
                    <span className="font-display text-[15px] font-semibold text-slate-800 tracking-tight text-center">
                      Ambulance Dispatch
                    </span>
                  </button>

                  {/* 3. Healthcare Services */}
                  <button
                    onClick={() => {
                      setIsMoreDrawerOpen(false);
                      handleExploreServicesClick();
                    }}
                    className="flex flex-col items-center justify-center py-9 px-3 border-r border-slate-100 hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#00A859] text-white flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                      <Stethoscope className="w-6 h-6 stroke-[2.1]" />
                    </div>
                    <span className="font-display text-[15px] font-semibold text-slate-800 tracking-tight text-center">
                      Healthcare Services
                    </span>
                  </button>

                  {/* 4. KDPA 2019 Privacy */}
                  <button
                    onClick={() => {
                      setIsMoreDrawerOpen(false);
                      setActiveInfoModal('privacy');
                    }}
                    className="flex flex-col items-center justify-center py-9 px-3 hover:bg-slate-50/70 active:bg-slate-100/60 transition-colors cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-full bg-[#C084FC] text-white flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                      <ShieldCheck className="w-6 h-6 stroke-[2.1]" />
                    </div>
                    <span className="font-display text-[15px] font-semibold text-slate-800 tracking-tight text-center">
                      KDPA 2019 Privacy
                    </span>
                  </button>

                </div>
              </div>
            </div>

            {/* Generous White Space + Optional Mobile App Link */}
            <div className="flex-1 min-h-[120px] sm:min-h-[48px] bg-white flex flex-col items-center justify-end pb-6 px-6 gap-3">
              {onDownloadApp && (
                <button
                  onClick={() => {
                    setIsMoreDrawerOpen(false);
                    onDownloadApp();
                  }}
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-[#28257A] hover:text-[#0EA5E9] transition-colors cursor-pointer py-2 px-4 rounded-full hover:bg-slate-50"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Download TERRALINK Mobile App</span>
                </button>
              )}
              <button
                onClick={() => setIsMoreDrawerOpen(false)}
                className="sm:hidden text-xs font-medium text-slate-400 hover:text-slate-600 py-1 cursor-pointer"
              >
                Close Menu
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: CALL / SMS (0713544101) ================= */}
      {isCallSmsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DC] relative space-y-5">
            <button
              onClick={() => setIsCallSmsModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center shadow-xs">
                <PhoneCall className="w-6 h-6 stroke-[2.3]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#221815]">Contact Hospital Desk</h3>
                <p className="text-xs text-stone-500">24/7 Emergency, Ambulance &amp; Inquiries</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] text-center space-y-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">Official Hospital Line</span>
              <span className="text-2xl font-black text-[#C8232C] block tracking-wide">0713 544 101</span>
              <span className="text-[11px] text-stone-500 block">Available 24 Hours Daily &bull; Toll/Standard Rate</span>
            </div>

            {/* Action Buttons: Call, SMS, WhatsApp */}
            <div className="space-y-2.5 pt-1">
              
              {/* Direct Phone Call */}
              <a
                href="tel:0713544101"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#C8232C] hover:bg-[#b51d25] text-white font-bold text-sm shadow-md shadow-red-500/20 flex items-center justify-center space-x-2.5 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 stroke-[2.5]" />
                <span>Call 0713544101 Directly</span>
              </a>

              {/* Direct SMS */}
              <a
                href="sms:0713544101?body=Jambo%20TERRALINK%20HEALTH,%20I%20would%20like%20to%20inquire%20about"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0A4D8C] hover:bg-[#083e72] text-white font-bold text-sm shadow-md shadow-blue-900/20 flex items-center justify-center space-x-2.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                <span>Send SMS Message</span>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/254713544101?text=Hello%20TERRALINK%20HEALTH%20Hospital,%20I%20would%20like%20to%20inquire%20about%20medical%20services"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm flex items-center justify-center space-x-2.5 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                <span>Chat on WhatsApp</span>
              </a>

            </div>

            <p className="text-[11px] text-center text-stone-400">
              For acute medical emergencies, our ambulance dispatch team responds instantly.
            </p>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUICK APPOINTMENT BOOKING ================= */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DC] relative max-h-[92vh] overflow-y-auto space-y-4">
            
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center">
                <Calendar className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#221815]">Book an Appointment / Request Care</h3>
                <p className="text-xs text-stone-500">TERRALINK HEALTH Hospital Kenya</p>
              </div>
            </div>

            {bookingSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold">{bookingSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleQuickBookingSubmit} className="space-y-3.5 text-xs text-left">
                
                {/* Notice for registered patients */}
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] flex items-center justify-between">
                  <span className="text-stone-600">Already have an account?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsBookingModalOpen(false);
                      handleOpenAuth('patient_login');
                    }}
                    className="text-[#C8232C] font-bold hover:underline cursor-pointer"
                  >
                    Patient Login &rarr;
                  </button>
                </div>

                <div>
                  <label className="block text-[#221815] font-semibold mb-1">Requested Care / Service</label>
                  <input
                    type="text"
                    value={selectedServiceName}
                    onChange={(e) => setSelectedServiceName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] font-bold text-stone-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#221815] font-semibold mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grace Wanjiku"
                      value={patientFullName}
                      onChange={(e) => setPatientFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8232C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#221815] font-semibold mb-1">Phone Number (for SMS Confirmation)</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0712345678"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8232C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#221815] font-semibold mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#221815] font-semibold mb-1">Preferred Time</label>
                    <select
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] focus:bg-white focus:outline-none"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#221815] font-semibold mb-1">Special Clinical Requests / Health Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of patient condition, home location if home nurse, or symptoms..."
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8232C]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2 border-t border-[#EAE5DC]">
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#C8232C] hover:bg-[#b51d25] text-white font-bold cursor-pointer shadow-xs transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ================= MODAL: FOUNDER & EXECUTIVE PERSPECTIVE ================= */}
      {isFounderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DC] relative max-h-[90vh] overflow-y-auto space-y-6">
            
            <button
              onClick={() => setIsFounderModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left border-b border-stone-100 pb-5">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md border-2 border-[#C8232C]">
                  <img
                    src={founderPhoto}
                    alt="Haron Kipkemoi"
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-[#C8232C] text-white shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#FDF1F1] text-[#C8232C] text-[10px] font-bold">
                  <span>Executive Leadership</span>
                </div>
                <h3 className="text-xl font-bold text-[#221815]">HARON KIPKEMOI</h3>
                <p className="text-xs font-semibold text-[#C8232C]">Founder &amp; CEO, TERRALINKHEALTH</p>
                <p className="text-[11px] text-stone-500">Health Systems Manager &amp; Digital Health Architect</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <div className="flex items-center space-x-2 text-[#C8232C] font-bold text-xs uppercase tracking-wider">
                <Quote className="w-4 h-4 rotate-180" />
                <span>Founder's Perspective on Kenya's Healthcare Digitization</span>
              </div>
              <p className="font-semibold text-[#221815]">
                "Digital health is no longer an optional innovation—it is the indispensable foundation of human dignity, clinical safety, and universal healthcare access."
              </p>
              <p>
                Throughout my experience in health systems management, I have witnessed firsthand how paper-heavy workflows, fragmented patient histories, missing laboratory results, and delayed insurance verifications compromise patient outcomes and place severe burnout on dedicated medical practitioners.
              </p>
              <p>
                I founded <strong>TERRALINKHEALTH</strong> to pioneer a future where every patient owns and controls their verified longitudinal health record from anywhere in Kenya, and where doctors, nurses, pharmacists, and lab technologists work in an integrated, zero-friction clinical environment.
              </p>
              <p>
                By uniting paperless electronic medical records (EMR), instant insurance approvals, real-time M-PESA reconciliation, and strict statutory privacy compliance (KDPA 2019), we are transforming health delivery to save lives and make universal health coverage a lived reality for every family.
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div className="text-[11px] text-stone-400">
                KMPDC Certified &bull; KDPA 2019 Compliant
              </div>
              <button
                onClick={() => setIsFounderModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#C8232C] hover:bg-[#B81D24] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Close Perspective
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: REVIEWS & RECOVERY STORIES ================= */}
      {isReviewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-[#EAE5DC] relative max-h-[90vh] overflow-y-auto space-y-5">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#221815]">Verified Patient Reviews</h3>
                <p className="text-xs text-stone-500">Real clinical recovery stories from patients across Kenya</p>
              </div>
              <button
                onClick={() => {
                  setIsReviewsModalOpen(false);
                  setIsReviewFormOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewNotification && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reviewNotification}</span>
              </div>
            )}

            {!isReviewFormOpen ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8232C]"
                    />
                  </div>

                  <button
                    onClick={() => setIsReviewFormOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#C8232C] hover:bg-[#B81D24] text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Write a Patient Review</span>
                  </button>
                </div>

                {/* Reviews List */}
                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                  {filteredReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FDF1F1] text-[#C8232C] font-bold text-xs flex items-center justify-center">
                            {rev.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-[#221815]">{rev.name}</span>
                              <span className="text-[10px] text-stone-400">&bull; {rev.location}</span>
                            </div>
                            <span className="text-[10px] text-[#C8232C] font-semibold">{rev.department}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs font-bold text-[#221815]">
                        {rev.headline}
                      </p>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        "{rev.quote}"
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-[#EAE5DC]">
                        <span>Outcome: <strong className="text-[#221815]">{rev.outcome}</strong></span>
                        <span>{rev.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Review Submission Form */
              <form onSubmit={handlePublishReview} className="space-y-3.5 text-left text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#221815] font-semibold mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8232C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#221815] font-semibold mb-1">County / City</label>
                    <input
                      type="text"
                      value={reviewForm.location}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8232C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#221815] font-semibold mb-1">Hospital Department</label>
                    <input
                      type="text"
                      value={reviewForm.department}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8232C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#221815] font-semibold mb-1">Star Rating</label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] focus:bg-white focus:outline-none font-bold text-amber-600"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Excellent)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars - Very Good)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars - Good)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#221815] font-semibold mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prompt emergency attention and excellent nursing care"
                    value={reviewForm.headline}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, headline: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8232C]"
                  />
                </div>

                <div>
                  <label className="block text-[#221815] font-semibold mb-1">Your Care Experience</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your care experience, doctor warmth, and treatment outcome..."
                    value={reviewForm.quote}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, quote: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE5DC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#C8232C]"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#EAE5DC]">
                  <button
                    type="button"
                    onClick={() => setIsReviewFormOpen(false)}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                  >
                    Back to Reviews
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-4 py-2 rounded-xl bg-[#C8232C] hover:bg-[#B81D24] text-white font-bold cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Publishing...' : 'Publish Review'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ================= MODAL: CONTACT DETAILS ================= */}
      {activeInfoModal === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DC] relative space-y-5">
            <button
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#221815]">Contact Us</h3>
                <p className="text-xs text-stone-500">TERRALINK HEALTH Hospital Kenya</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-stone-600 leading-relaxed pt-2">
              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <MapPin className="w-4 h-4 text-[#C8232C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#221815] block">Physical Hospital Location</span>
                  <span>Hospital Hill Road, Parklands / Upper Hill Medical Complex, Nairobi County, Kenya</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <Phone className="w-4 h-4 text-[#C8232C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#221815] block">Emergency &amp; Ambulance Hotline (24/7)</span>
                  <a href="tel:0713544101" className="text-[#C8232C] font-bold hover:underline">0713 544 101 / +254 713 544 101</a>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC]">
                <Mail className="w-4 h-4 text-[#0A4D8C] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#221815] block">General Inquiries &amp; Patient Records</span>
                  <a href="mailto:info@terralinkhealth.co.ke" className="text-[#0A4D8C] font-semibold hover:underline">info@terralinkhealth.co.ke</a>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveInfoModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#C8232C] hover:bg-[#B81D24] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: PRIVACY POLICY ================= */}
      {activeInfoModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DC] relative space-y-4 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#221815]">Privacy &amp; Data Protection</h3>
                <p className="text-xs text-stone-500">KDPA 2019 &amp; KMPDC Health Standards</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed pt-2">
              <p>
                <strong>TERRALINK HEALTH</strong> complies with the <strong>Kenya Data Protection Act (KDPA 2019)</strong> and the medical confidentiality guidelines mandated by the <strong>Kenya Medical Practitioners and Dentists Council (KMPDC)</strong>.
              </p>
              <p>
                1. <strong>Patient Medical Records:</strong> All diagnoses, prescriptions, and laboratory reports are encrypted at rest and in transit. Access is strictly role-based and audited.
              </p>
              <p>
                2. <strong>Insurance &amp; Billing:</strong> SHA/SHIF and private insurance information is processed exclusively for patient benefit verification and claims processing.
              </p>
              <p>
                3. <strong>Data Ownership:</strong> Patients retain full ownership of their longitudinal electronic medical records and may export or request transmission to authorized specialists at any time.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveInfoModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#C8232C] hover:bg-[#B81D24] text-white text-xs font-bold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TERMS OF SERVICE ================= */}
      {activeInfoModal === 'terms' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DC] relative space-y-4 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#221815]">Terms of Service</h3>
                <p className="text-xs text-stone-500">TERRALINK HEALTH Clinical Platform</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-stone-600 leading-relaxed pt-2">
              <p>
                By using the <strong>TERRALINK HEALTH Digital Platform</strong>, you agree to the following terms governing digital appointments, telemedicine, and record management:
              </p>
              <p>
                1. <strong>Clinical Telemedicine:</strong> Telemedicine consultations are conducted by licensed Kenya Medical Practitioners. For acute emergency medical crises, dial the hospital emergency hotline 0713544101 immediately.
              </p>
              <p>
                2. <strong>Account Credentials:</strong> Patients and healthcare staff are responsible for maintaining the confidentiality of their digital credentials and two-factor verifications.
              </p>
              <p>
                3. <strong>Payment Settlement:</strong> M-PESA and insurance claims are settled under standard Kenyan healthcare tariff schedules with automated receipt generation.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveInfoModal(null)}
                className="px-5 py-2.5 rounded-xl bg-[#C8232C] hover:bg-[#B81D24] text-white text-xs font-bold cursor-pointer"
              >
                Close Terms
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
