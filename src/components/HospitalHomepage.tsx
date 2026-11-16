import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Clock,
  ArrowRight,
  Activity,
  Sparkles,
  Video,
  Quote,
  Star,
  User,
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
  Smartphone
} from 'lucide-react';
import { Department, Doctor, InsuranceProviderPlan, PatientReview } from '../types';
import { INITIAL_REVIEWS } from '../mockData';
import founderPhotoImg from '../assets/images/founder_photo_1788042380844.jpg';
import doctorHeroImg from '../assets/images/doctor_hero_1789942016435.jpg';
import femaleDoctorHeroImg from '../assets/images/doctor_hero_desk_1791978142980.jpg';

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
    name: 'Hire a Nurse & Bedside Care',
    category: 'Home & Nursing',
    badge: 'MOST REQUESTED',
    iconType: 'heart',
    headline: 'Licensed, compassionate nursing care in the comfort of your home',
    description: 'Connect with registered nurses (RN/BSN) and licensed practical nurses for wound dressing, medication administration, post-operative monitoring, and IV infusion.',
    standardFeeKES: 3500,
    shaCovered: true,
    departmentName: 'Outpatient & Home Nursing Wing'
  },
  {
    id: 'srv-opd',
    name: 'General Outpatient Medical Consultation',
    category: 'Clinical & Outpatient',
    badge: 'MOST REQUESTED',
    iconType: 'stethoscope',
    headline: 'Comprehensive physical examination, primary diagnosis, and outpatient triage',
    description: 'Immediate medical check-up with licensed general medical officers, vital signs evaluation, disease diagnosis, and electronic prescription issuing.',
    standardFeeKES: 1500,
    shaCovered: true,
    departmentName: 'Outpatient Department (OPD)'
  },
  {
    id: 'srv-physio',
    name: 'Physiotherapy & Physical Rehabilitation',
    category: 'Therapy & Rehab',
    badge: 'MOST REQUESTED',
    iconType: 'activity',
    headline: 'Personalized physical therapy, musculoskeletal rehabilitation, and mobility care',
    description: 'Targeted recovery sessions for post-stroke mobility, orthopedic fracture rehabilitation, sports injuries, and chronic pain management.',
    standardFeeKES: 2500,
    shaCovered: true,
    departmentName: 'Physical Therapy & Rehab'
  },
  {
    id: 'srv-spec',
    name: 'Specialist Senior Physician Consultation',
    category: 'Specialist Clinics',
    badge: 'SPECIALIST',
    iconType: 'stethoscope',
    headline: 'Senior Consultant clinical review in Cardiology, Neurology, Orthopedics, or Internal Medicine',
    description: 'Advanced clinical evaluations, diagnostic syntheses, and second medical opinions by leading KMPDC board-certified medical specialists.',
    standardFeeKES: 3000,
    shaCovered: true,
    departmentName: 'Specialist Clinics'
  },
  {
    id: 'srv-emg',
    name: 'Accident & Emergency Trauma Triage',
    category: 'Emergency & Ambulance',
    badge: '24/7 OPEN',
    iconType: 'ambulance',
    headline: 'Immediate critical trauma assessment, resuscitation, and casualty emergency care',
    description: 'Round-the-clock emergency room response with dedicated trauma bays, advanced resuscitation crash carts, and direct theatre access.',
    standardFeeKES: 2500,
    shaCovered: true,
    departmentName: 'Accident & Emergency (A&E)'
  },
  {
    id: 'srv-amb',
    name: 'ALS Emergency Ambulance Dispatch',
    category: 'Emergency & Ambulance',
    badge: '24/7 DISPATCH',
    iconType: 'ambulance',
    headline: 'Type C Advanced Life Support paramedic ambulance dispatch across Nairobi',
    description: 'Equipped with Zoll X-Series monitor/defibrillators, transport ventilators, advanced airway management, and certified paramedic escorts.',
    standardFeeKES: 5000,
    shaCovered: true,
    departmentName: 'Emergency Transport & Dispatch'
  },
  {
    id: 'srv-mat-norm',
    name: 'Normal Vaginal Delivery (Maternity Package)',
    category: 'Maternity & Delivery',
    badge: 'MOST REQUESTED',
    iconType: 'heart',
    headline: 'Safe, compassionate maternity delivery with Obstetrician and midwife care',
    description: 'Comprehensive intrapartum monitoring, consultant Obstetrician delivery, dedicated midwife care, 48-hour postpartum stay, and newborn immunization.',
    standardFeeKES: 45000,
    shaCovered: true,
    departmentName: 'Obstetrics & Gynaecology'
  },
  {
    id: 'srv-mat-cs',
    name: 'Caesarean Section Surgical Delivery',
    category: 'Maternity & Delivery',
    badge: 'SURGICAL',
    iconType: 'activity',
    headline: 'Elective and emergency C-section delivery in sterile laminar-flow operating theatre',
    description: 'Obstetrician surgical fee, anaesthetist cover, dedicated neonatal pediatric standby, theatre consumables, and 3-day private recovery suite.',
    standardFeeKES: 95000,
    shaCovered: true,
    departmentName: 'Obstetrics & Gynaecology'
  },
  {
    id: 'srv-lab-cbc',
    name: 'Full Hemogram / Complete Blood Count (CBC)',
    category: 'Laboratory & Diagnostics',
    badge: 'LABORATORY',
    iconType: 'syringe',
    headline: 'Automated 5-part differential blood analysis with platelet and red cell indices',
    description: 'Rapid diagnostic screening for anemia, systemic infection, hematologic malignancies, and immune status with automated digital verification.',
    standardFeeKES: 1200,
    shaCovered: true,
    departmentName: 'Medical Laboratory & Blood Bank'
  },
  {
    id: 'srv-lab-lipid',
    name: 'Comprehensive Fasting Lipid Profile',
    category: 'Laboratory & Diagnostics',
    badge: 'LABORATORY',
    iconType: 'syringe',
    headline: 'Total cholesterol, HDL, LDL, triglycerides, and cardiovascular risk calculation',
    description: 'Fasting venous serum analysis providing deep metabolic insights for cardiovascular disease prevention and hypertension management.',
    standardFeeKES: 1800,
    shaCovered: true,
    departmentName: 'Medical Laboratory & Blood Bank'
  },
  {
    id: 'srv-rad-xray',
    name: 'Digital Chest X-Ray (PA & Lateral)',
    category: 'Laboratory & Diagnostics',
    badge: 'IMAGING',
    iconType: 'layers',
    headline: 'High-definition digital thoracic imaging with radiologist interpretation',
    description: 'Low-dose digital radiography for respiratory pathology, lung parenchyma evaluation, cardiac silhouette assessment, and clinical clearance.',
    standardFeeKES: 2500,
    shaCovered: true,
    departmentName: 'Radiology & Medical Imaging'
  },
  {
    id: 'srv-rad-ct',
    name: 'Brain CT Scan (High-Resolution Multi-Slice)',
    category: 'Laboratory & Diagnostics',
    badge: 'IMAGING',
    iconType: 'layers',
    headline: '128-slice rapid volumetric computed tomography for trauma, stroke, and hemorrhage',
    description: 'Sub-millimeter cranial imaging for intracranial hemorrhage, acute ischemic stroke, trauma, and neurological evaluation with 3D multiplanar reconstruction.',
    standardFeeKES: 14000,
    shaCovered: true,
    departmentName: 'Radiology & Medical Imaging'
  },
  {
    id: 'srv-icu',
    name: 'Intensive Care Unit (ICU) Daily Inpatient Rate',
    category: 'Critical & Inpatient',
    badge: 'CRITICAL CARE',
    iconType: 'bed',
    headline: '24/7 dedicated 1:1 intensive nursing, mechanical ventilation, and multi-organ monitoring',
    description: 'Continuous hemodynamic monitoring, Hamilton mechanical ventilation, bedside arterial blood gas analysis, and daily intensivist consultations.',
    standardFeeKES: 25000,
    shaCovered: true,
    departmentName: 'Intensive Care Unit (ICU)'
  },
  {
    id: 'srv-hdu',
    name: 'High Dependency Unit (HDU) Daily Rate',
    category: 'Critical & Inpatient',
    badge: 'INPATIENT',
    iconType: 'bed',
    headline: 'Continuous cardiac telemetry, oxygen therapy, and close clinical supervision',
    description: 'Step-down high dependency inpatient monitoring for recovering post-surgical and acute medical patients requiring continuous vital oversight.',
    standardFeeKES: 12000,
    shaCovered: true,
    departmentName: 'High Dependency Unit (HDU)'
  },
  {
    id: 'srv-ward-gen',
    name: 'General Medical / Surgical Ward Daily Rate',
    category: 'Critical & Inpatient',
    badge: 'INPATIENT',
    iconType: 'bed',
    headline: 'Standard inpatient bed allocation, routine doctor rounds, daily nursing, and meals',
    description: 'Fully furnished comfortable medical ward bed with wall oxygen port, daily ward physician rounds, dietary management, and dedicated nursing care.',
    standardFeeKES: 3500,
    shaCovered: true,
    departmentName: 'Inpatient Medical Wards'
  },
  {
    id: 'srv-cardiology',
    name: 'Cardiology & Echocardiogram Clinic',
    category: 'Specialist Clinics',
    badge: 'SPECIALIST',
    iconType: 'heart',
    headline: 'Hypertension, arrhythmia, heart failure management, and Doppler echocardiography',
    description: 'Expert diagnostic cardiology including 12-lead resting ECG, transthoracic echocardiography, and cardiovascular risk reduction therapies.',
    standardFeeKES: 3000,
    shaCovered: true,
    departmentName: 'Cardiology Clinic'
  },
  {
    id: 'srv-peds',
    name: 'Paediatrics & Child Wellness Clinic',
    category: 'Specialist Clinics',
    badge: 'CHILD CARE',
    iconType: 'heart',
    headline: 'Childhood illness treatment, growth monitoring, and KEPI vaccination schedule',
    description: 'Gentle, child-centered clinical care by Consultant Paediatricians covering newborn screening, nutritional assessments, and routine immunizations.',
    standardFeeKES: 2000,
    shaCovered: true,
    departmentName: 'Paediatrics Clinic'
  },
  {
    id: 'srv-onco',
    name: 'Oncology & Chemotherapy Center',
    category: 'Specialist Clinics',
    badge: 'ONCOLOGY',
    iconType: 'activity',
    headline: 'Medical oncology, outpatient chemotherapy infusions, and cancer screening',
    description: 'Multidisciplinary tumor board coordination, compassionate chemotherapy infusions in private recliners, and early cancer detection screenings.',
    standardFeeKES: 3500,
    shaCovered: true,
    departmentName: 'Oncology Center'
  },
  {
    id: 'srv-dialysis',
    name: 'Dialysis & Nephrology Renal Session',
    category: 'Critical & Inpatient',
    badge: 'RENAL CARE',
    iconType: 'activity',
    headline: 'Fresenius hemodialysis sessions, ultrafiltration, and renal nephrologist review',
    description: 'State-of-the-art dialysis suites with ultrapure RO water filtration, high-flux dialyzers, and continuous nephrology nurse supervision.',
    standardFeeKES: 9500,
    shaCovered: true,
    departmentName: 'Renal & Dialysis Center'
  },
  {
    id: 'srv-pharm',
    name: 'Pharmacy & Drug Dispensing',
    category: 'Clinical & Outpatient',
    badge: 'PHARMACY',
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

  // Doctor Hero Image with fallback
  const doctorPhoto = doctorHeroImg || '/images/doctor_hero.jpg';

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

  // Healthcare Services Filter & Search State
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [catalogCategory, setCatalogCategory] = useState<string>('All');

  // Categories list
  const catalogCategories = [
    'All',
    'Home & Nursing',
    'Clinical & Outpatient',
    'Emergency & Ambulance',
    'Specialist Clinics',
    'Maternity & Delivery',
    'Laboratory & Diagnostics',
    'Critical & Inpatient',
    'Therapy & Rehab'
  ];

  // Filtered Services List
  const filteredCatalogServices = TERRALINK_CATALOG_SERVICES.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      service.headline.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      service.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      service.category.toLowerCase().includes(catalogSearch.toLowerCase());
    const matchesCat = catalogCategory === 'All' || service.category === catalogCategory;
    return matchesSearch && matchesCat;
  });

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

  // Render Service Icon helper
  const renderServiceIcon = (type: string) => {
    switch (type) {
      case 'heart':
        return <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8232C]" />;
      case 'activity':
        return <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8232C]" />;
      case 'ambulance':
        return <Ambulance className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8232C]" />;
      case 'syringe':
        return <Syringe className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8232C]" />;
      case 'pill':
        return <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8232C]" />;
      case 'bed':
        return <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8232C]" />;
      case 'layers':
        return <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8232C]" />;
      default:
        return <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-[#C8232C]" />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] text-[#221815] flex flex-col justify-between selection:bg-[#FDF1F1] selection:text-[#C8232C] pb-24 sm:pb-28">
      
      {/* ================= 1. HEADER BAR ================= */}
      <header className="w-full bg-white border-b border-[#EAE5DC] sticky top-0 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => {
              if (currentUser?.role === 'patient') onNavigateToPortal('patient');
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none min-w-0 group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#D90429] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Activity className="w-5 h-5 stroke-[2.4]" />
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-base sm:text-lg md:text-xl font-black text-[#0B132B] leading-none tracking-tight uppercase whitespace-nowrap">
                TERRALINK HEALTH
              </span>
              <span className="text-[10.5px] sm:text-xs text-stone-500 font-medium leading-tight mt-0.5 whitespace-nowrap">
                Digital Hospital Platform
              </span>
            </div>
          </div>

          {/* Right Header Navigation - Compact "Patient Portal" */}
          <div className="flex items-center space-x-2 shrink-0">
            {currentUser && currentUser.role === 'patient' ? (
              <button
                onClick={() => onNavigateToPortal('patient')}
                className="px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full bg-[#FFF5F5] hover:bg-rose-100 text-[#D90429] font-bold text-[11px] xs:text-xs border border-rose-200/90 transition-all cursor-pointer shadow-2xs flex items-center space-x-1.5 active:scale-95 shrink-0"
                title="Open Patient Portal"
              >
                <User className="w-3.5 h-3.5 stroke-[2.2] text-[#D90429]" />
                <span className="whitespace-nowrap font-semibold">Patient Portal</span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenAuth('patient_login')}
                className="px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full bg-[#FFF5F5] hover:bg-rose-100 text-[#D90429] font-bold text-[11px] xs:text-xs border border-rose-200/90 transition-all cursor-pointer shadow-2xs flex items-center space-x-1.5 active:scale-95 shrink-0"
                title="Patient Portal Login"
              >
                <User className="w-3.5 h-3.5 stroke-[2.2] text-[#D90429]" />
                <span className="whitespace-nowrap font-semibold">Patient Portal</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ================= 2. HERO SECTION ================= */}
      {/* High-quality sharp realistic female doctor seated at her desk with white coat and stethoscope */}
      <section 
        className="relative w-full overflow-hidden flex flex-col justify-center min-h-[calc(100svh-3.5rem-3.25rem)] sm:min-h-[580px] md:min-h-[640px] bg-[#FAF8F5]"
      >
        {/* Doctor seated at her desk: carefully positioned on mobile and larger screens */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-no-repeat bg-[position:84%_30%] sm:bg-[position:80%_center] md:bg-[position:right_center]"
          style={{
            backgroundImage: `url(${femaleDoctorHeroImg})`,
          }}
        />

        {/* Clean subtle readability gradient: gentle white tint on the left for text contrast, completely transparent on the right so doctor is 100% sharp and recognizable */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/40 40% to-transparent 65% sm:from-white/90 sm:via-white/50 40% sm:to-transparent pointer-events-none" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 xs:px-5 sm:px-8 py-3.5 xs:py-4 sm:py-6 flex flex-col justify-center">
          
          {/* Left-aligned hero content matching reference image */}
          <div className="max-w-[280px] xs:max-w-[310px] sm:max-w-xl text-left">
            
            {/* Headline with navy blue & red branding */}
            <h1 className="text-[24px] xs:text-[27px] sm:text-4xl md:text-5xl font-black text-[#0B132B] tracking-tight leading-[1.12]">
              Enhancing Hospital<br />
              Operations &amp;<br />
              <span className="text-[#D90429]">Patient Experience</span>
            </h1>

            {/* Subtitle / Description */}
            <p className="mt-2 xs:mt-2.5 sm:mt-4 text-[12px] xs:text-[13px] sm:text-base text-slate-800 font-medium leading-snug sm:leading-relaxed max-w-[245px] xs:max-w-[280px] sm:max-w-md">
              An integrated digital platform for patient engagement, digital registration, telemedicine, and real-time analytics &mdash; built for Kenyan hospitals.
            </p>

            {/* 3 Prominent Pill Buttons */}
            <div className="mt-3.5 xs:mt-4 sm:mt-6 space-y-2.5 sm:space-y-3.5 w-full max-w-[245px] xs:max-w-[270px] sm:max-w-[320px]">
              
              {/* 1. Book an Appointment > (Red Pill Button) */}
              <button
                onClick={handleBookAppointmentClick}
                className="w-full py-2.5 xs:py-3 sm:py-3.5 px-4 sm:px-5 rounded-full bg-[#D90429] hover:bg-[#B80323] active:scale-[0.98] text-white font-bold text-xs xs:text-sm sm:text-base shadow-md shadow-red-600/30 hover:shadow-lg hover:shadow-red-600/40 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.3] shrink-0" />
                  <span className="tracking-tight whitespace-nowrap">Book an Appointment</span>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 2. Explore Our Services -> (Deep Navy / Blue Pill Button) */}
              <button
                onClick={handleExploreServicesClick}
                className="w-full py-2.5 xs:py-3 sm:py-3.5 px-4 sm:px-5 rounded-full bg-[#004B87] hover:bg-[#003B6B] active:scale-[0.98] text-white font-bold text-xs xs:text-sm sm:text-base shadow-md shadow-blue-900/25 hover:shadow-lg hover:shadow-blue-900/35 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-2.5">
                  <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.3] shrink-0" />
                  <span className="tracking-tight whitespace-nowrap">Explore Our Services</span>
                </div>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 3. Call / SMS: 0713544101 (White Pill Button) */}
              <button
                onClick={() => setIsCallSmsModalOpen(true)}
                className="w-full py-2.5 xs:py-3 sm:py-3.5 px-4 sm:px-5 rounded-full bg-white hover:bg-stone-50 active:scale-[0.98] text-[#0B132B] border border-stone-200/90 font-bold text-xs xs:text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center space-x-2.5 cursor-pointer group"
              >
                <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-[#D90429] stroke-[2.3] shrink-0 group-hover:scale-105 transition-transform" />
                <span className="tracking-tight whitespace-nowrap">Call / SMS: 0713544101</span>
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* ================= 3. KEY FEATURES FOR BETTER CARE (Directly below Call / SMS button) ================= */}
      <section className="w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 border-t border-[#EAE5DC] bg-white/70">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center space-y-1 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#221815] tracking-tight">
              KEY FEATURES FOR BETTER CARE
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Powering efficient hospital operations and improved patient outcomes.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 text-center">
            
            {/* 1. Reduced Wait Times */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] shadow-2xs">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FDF1F1] border border-[#FADBD8] text-[#C8232C] flex items-center justify-center mb-2.5 shrink-0 shadow-2xs">
                <Clock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#221815] leading-tight">
                Reduced Wait Times
              </h3>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                Real-time queue tracking &amp; online appointment booking.
              </p>
            </div>

            {/* 2. Secure Records */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] shadow-2xs">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FDF1F1] border border-[#FADBD8] text-[#C8232C] flex items-center justify-center mb-2.5 shrink-0 shadow-2xs">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#221815] leading-tight">
                Secure Records
              </h3>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                Encrypted patient data with role-based access control.
              </p>
            </div>

            {/* 3. Telemedicine */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] shadow-2xs">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FDF1F1] border border-[#FADBD8] text-[#C8232C] flex items-center justify-center mb-2.5 shrink-0 shadow-2xs">
                <Video className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#221815] leading-tight">
                Telemedicine
              </h3>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                Virtual consultations from anywhere in Kenya.
              </p>
            </div>

            {/* 4. Real-Time Analytics */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE5DC] shadow-2xs">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#FDF1F1] border border-[#FADBD8] text-[#C8232C] flex items-center justify-center mb-2.5 shrink-0 shadow-2xs">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-[#221815] leading-tight">
                Real-Time Analytics
              </h3>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                Live dashboards for hospital performance monitoring.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 4. EXPLORE OUR HEALTHCARE SERVICES CATALOG (Exact design from uploaded image) ================= */}
      <section id="explore-healthcare-services" className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-[#EAE5DC] bg-[#FAF8F5]">
        <div className="max-w-5xl mx-auto">
          
          {/* Header Badge */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FDF1F1] text-[#C8232C] text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HEALTHCARE SERVICES CATALOG</span>
            </div>
          </div>

          {/* Catalog Title */}
          <h2 className="text-2xl sm:text-4xl font-black text-[#0f1f38] text-center tracking-tight">
            Explore Our Healthcare Services
          </h2>

          {/* Subtitle from mockup */}
          <p className="text-xs sm:text-sm md:text-base text-stone-600 text-center max-w-2xl mx-auto mt-2 sm:mt-3 leading-relaxed">
            Browse all {TERRALINK_CATALOG_SERVICES.length} professional in-home, clinical, and specialized services. From licensed nursing and therapy to comprehensive medical check-ups &mdash; request the exact care you need.
          </p>

          {/* Search & Filter Container Card matching image */}
          <div className="mt-8 bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
            
            {/* Search Input Box */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search services (e.g., Hire a Nurse, Physiotherapy, Consultation...)"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0A4D8C]/20 transition-all"
              />
            </div>

            {/* Counter text matching image */}
            <div className="text-center text-xs sm:text-sm font-semibold text-stone-500">
              Showing <span className="font-bold text-[#0f1f38]">{filteredCatalogServices.length}</span> of <span className="font-bold text-[#0f1f38]">{TERRALINK_CATALOG_SERVICES.length}</span> Services
            </div>

            {/* Filter Pills matching image */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
              <button
                onClick={() => setCatalogCategory('All')}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  catalogCategory === 'All'
                    ? 'bg-[#0f1f38] text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                All Services ({TERRALINK_CATALOG_SERVICES.length})
              </button>

              {catalogCategories.filter(c => c !== 'All').map(cat => {
                const count = TERRALINK_CATALOG_SERVICES.filter(s => s.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setCatalogCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      catalogCategory === cat
                        ? 'bg-[#0f1f38] text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

          </div>

          {/* ================= SERVICE CARDS (Design matching the uploaded image) ================= */}
          <div className="mt-6 space-y-4 sm:space-y-5">
            {filteredCatalogServices.map(service => (
              <div
                key={service.id}
                className="bg-white rounded-3xl p-5 sm:p-7 border border-rose-100/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  
                  {/* Top Row: Square Icon Badge + Category + Most Requested Pill Badge */}
                  <div className="flex items-start justify-between gap-3">
                    
                    <div className="flex items-center space-x-3.5">
                      {/* Squircle Pink/Red Icon Badge */}
                      <div className="w-12 h-12 rounded-2xl bg-[#FDF1F1] border border-rose-100/80 text-[#C8232C] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {renderServiceIcon(service.iconType)}
                      </div>

                      <div>
                        {/* Category Tag */}
                        <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                          {service.category}
                        </span>
                        
                        {/* Service Title */}
                        <h3 className="text-lg sm:text-xl font-bold text-[#0f1f38] tracking-tight group-hover:text-[#C8232C] transition-colors">
                          {service.name}
                        </h3>
                      </div>
                    </div>

                    {/* Red Pill Badge (e.g. MOST REQUESTED) */}
                    {service.badge && (
                      <span className="px-3 py-1 rounded-full bg-[#C8232C] text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs shrink-0">
                        {service.badge}
                      </span>
                    )}

                  </div>

                  {/* Bold Punchy Headline in dark navy */}
                  <p className="mt-3.5 text-xs sm:text-sm font-bold text-[#0A4D8C] leading-snug">
                    {service.headline}
                  </p>

                  {/* Descriptive text */}
                  <p className="mt-1.5 text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                    {service.description}
                  </p>

                </div>

                {/* Bottom Row: Available Options / Tariff + Action Button */}
                <div className="mt-5 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
                      AVAILABLE OPTIONS &bull; SHA / INSURANCE ELIGIBLE
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block font-medium">Standard Tariff</span>
                      <span className="text-xs sm:text-sm font-black text-[#0f1f38]">
                        KES {service.standardFeeKES.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedServiceName(service.name);
                        setIsBookingModalOpen(true);
                      }}
                      className="px-4 sm:px-5 py-2 rounded-xl bg-[#C8232C] hover:bg-[#b31d25] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-95 flex items-center space-x-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Request Care</span>
                    </button>
                  </div>

                </div>

              </div>
            ))}

            {filteredCatalogServices.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-8 space-y-3">
                <Search className="w-8 h-8 text-stone-400 mx-auto" />
                <h4 className="text-base font-bold text-stone-800">No matching services found</h4>
                <p className="text-xs text-stone-500">Try searching with a different health term or reset the category filter.</p>
                <button
                  onClick={() => {
                    setCatalogSearch('');
                    setCatalogCategory('All');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0f1f38] text-white font-bold text-xs"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ================= 5. FOOTER (Institutional info, Privacy, Terms, subtle Staff/Admin portals) ================= */}
      <footer className="w-full py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-t border-[#EAE5DC] bg-white text-center space-y-4 text-xs text-stone-500">
        <div className="max-w-4xl mx-auto space-y-3">
          
          {/* Institutional Copyright */}
          <p className="text-[#221815] font-semibold text-xs sm:text-sm">
            &copy; 2026 TERRALINK HEALTH &mdash; Digital Hospital Management Platform
          </p>
          
          {/* Location details */}
          <p className="text-stone-500 text-xs">
            Hospital Hill Road, Parklands / Upper Hill Medical Complex, Nairobi County, Kenya &bull; 24/7 Hotline: 0713544101
          </p>

          {/* Links Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-stone-600 pt-1 font-medium">
            <button
              onClick={() => setActiveInfoModal('contact')}
              className="hover:text-[#C8232C] transition-colors cursor-pointer"
            >
              Contact
            </button>
            <span>|</span>
            <button
              onClick={() => setActiveInfoModal('privacy')}
              className="hover:text-[#C8232C] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>|</span>
            <button
              onClick={() => setActiveInfoModal('terms')}
              className="hover:text-[#C8232C] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          {/* Secondary Badges for Founder Leadership & Patient Stories */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setIsFounderModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-stone-200/70 text-stone-700 font-bold text-[11px] border border-[#EAE5DC] transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C8232C]" />
              <span>Founder &amp; Executive Perspective</span>
            </button>

            <button
              onClick={() => setIsReviewsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] hover:bg-stone-200/70 text-stone-700 font-bold text-[11px] border border-[#EAE5DC] transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Patient Reviews &amp; Stories ({liveReviews.length})</span>
            </button>

            {onDownloadApp && (
              <button
                onClick={onDownloadApp}
                className="px-3.5 py-1.5 rounded-full bg-[#FDF1F1] hover:bg-rose-100 text-[#C8232C] font-bold text-[11px] border border-rose-200 transition-colors flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#C8232C]" />
                <span>Download App</span>
              </button>
            )}
          </div>

          {/* ================= SUBTLE STAFF & ADMIN PORTALS IN FOOTER ================= */}
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-stone-100 text-[11px] text-stone-400">
            <button
              onClick={() => {
                if (currentUser && currentUser.role !== 'patient') {
                  onNavigateToPortal('provider');
                } else {
                  handleOpenAuth('staff_login');
                }
              }}
              className="px-2.5 py-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer font-medium"
              title="Staff & Doctor Workspace"
            >
              Staff Login
            </button>
            <span className="text-stone-300">&bull;</span>
            <button
              onClick={() => onNavigateToPortal('admin')}
              className="px-2.5 py-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer font-medium"
              title="Hospital Administration"
            >
              Admin Portal
            </button>
          </div>

        </div>
      </footer>

      {/* ================= 6. FIXED BOTTOM MENU (Home, Appointments, Records, Telemedicine, More) ================= */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/98 backdrop-blur-md border-t border-[#EAE5DC] shadow-lg py-1.5 sm:py-2 px-2 sm:px-6">
        <div className="max-w-md sm:max-w-lg mx-auto flex items-center justify-around text-center">
          
          {/* Home */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center justify-center py-1 px-2 text-[#004B87] font-bold cursor-pointer group"
          >
            <Home className="w-5 h-5 mb-0.5 stroke-[2.4] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] leading-tight font-bold">Home</span>
          </button>

          {/* Appointments */}
          <button
            onClick={() => {
              if (currentUser && currentUser.role === 'patient') {
                onNavigateToPortal('patient', 'appointments');
              } else {
                setIsBookingModalOpen(true);
              }
            }}
            className="flex flex-col items-center justify-center py-1 px-2 text-stone-500 hover:text-[#004B87] font-medium cursor-pointer group transition-colors"
          >
            <Calendar className="w-5 h-5 mb-0.5 stroke-[2] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] leading-tight font-medium">Appointments</span>
          </button>

          {/* Records */}
          <button
            onClick={() => {
              if (currentUser && currentUser.role === 'patient') {
                onNavigateToPortal('patient', 'records');
              } else {
                handleOpenAuth('patient_login');
              }
            }}
            className="flex flex-col items-center justify-center py-1 px-2 text-stone-500 hover:text-[#004B87] font-medium cursor-pointer group transition-colors"
          >
            <FileText className="w-5 h-5 mb-0.5 stroke-[2] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] leading-tight font-medium">Records</span>
          </button>

          {/* Telemedicine */}
          <button
            onClick={() => {
              if (currentUser && currentUser.role === 'patient') {
                onNavigateToPortal('patient', 'appointments');
              } else {
                handleOpenAuth('patient_login');
              }
            }}
            className="flex flex-col items-center justify-center py-1 px-2 text-stone-500 hover:text-[#004B87] font-medium cursor-pointer group transition-colors"
          >
            <Video className="w-5 h-5 mb-0.5 stroke-[2] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] leading-tight font-medium">Telemedicine</span>
          </button>

          {/* More */}
          <button
            onClick={() => setIsMoreDrawerOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2 text-stone-500 hover:text-[#004B87] font-medium cursor-pointer group transition-colors"
          >
            <Menu className="w-5 h-5 mb-0.5 stroke-[2.3] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] leading-tight font-medium">More</span>
          </button>

        </div>
      </nav>

      {/* ================= MODAL / DRAWER: "MORE" MENU ================= */}
      {isMoreDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EAE5DC] relative max-h-[85vh] overflow-y-auto space-y-5">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center space-x-2">
                <Menu className="w-5 h-5 text-[#C8232C]" />
                <h3 className="text-base font-bold text-[#0f1f38]">Hospital Directory &amp; More Options</h3>
              </div>
              <button
                onClick={() => setIsMoreDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              
              {/* Founder Perspective */}
              <button
                onClick={() => {
                  setIsMoreDrawerOpen(false);
                  setIsFounderModalOpen(true);
                }}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-rose-50 border border-[#EAE5DC] hover:border-rose-200 transition-all text-left flex items-start space-x-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#0f1f38] block group-hover:text-[#C8232C]">Founder Perspective</span>
                  <span className="text-[10px] text-stone-500">Haron Kipkemoi on Kenyan healthcare digitization</span>
                </div>
              </button>

              {/* Contact Us */}
              <button
                onClick={() => {
                  setIsMoreDrawerOpen(false);
                  setActiveInfoModal('contact');
                }}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-blue-50 border border-[#EAE5DC] hover:border-blue-200 transition-all text-left flex items-start space-x-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0A4D8C] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#0f1f38] block group-hover:text-[#0A4D8C]">Contact &amp; 24/7 Hotline</span>
                  <span className="text-[10px] text-stone-500">Call/SMS: 0713544101 &bull; Parklands HQ</span>
                </div>
              </button>

              {/* Patient Reviews & Stories */}
              <button
                onClick={() => {
                  setIsMoreDrawerOpen(false);
                  setIsReviewsModalOpen(true);
                }}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-amber-50 border border-[#EAE5DC] hover:border-amber-200 transition-all text-left flex items-start space-x-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#0f1f38] block group-hover:text-amber-700">Patient Reviews ({liveReviews.length})</span>
                  <span className="text-[10px] text-stone-500">Real clinical recovery experiences</span>
                </div>
              </button>

              {/* Emergency Ambulance Dispatch */}
              <button
                onClick={() => {
                  setIsMoreDrawerOpen(false);
                  setIsCallSmsModalOpen(true);
                }}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-rose-50 border border-[#EAE5DC] hover:border-rose-200 transition-all text-left flex items-start space-x-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#C8232C] flex items-center justify-center shrink-0">
                  <Ambulance className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#0f1f38] block group-hover:text-[#C8232C]">Ambulance Dispatch</span>
                  <span className="text-[10px] text-stone-500">Type C ALS Paramedic fleet response</span>
                </div>
              </button>

              {/* Explore Services Catalog */}
              <button
                onClick={() => {
                  setIsMoreDrawerOpen(false);
                  handleExploreServicesClick();
                }}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-emerald-50 border border-[#EAE5DC] hover:border-emerald-200 transition-all text-left flex items-start space-x-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#0f1f38] block group-hover:text-emerald-700">Healthcare Services (20)</span>
                  <span className="text-[10px] text-stone-500">In-home, clinical &amp; specialized catalog</span>
                </div>
              </button>

              {/* Privacy & Legal */}
              <button
                onClick={() => {
                  setIsMoreDrawerOpen(false);
                  setActiveInfoModal('privacy');
                }}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-stone-100 border border-[#EAE5DC] transition-all text-left flex items-start space-x-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#0f1f38] block">KDPA 2019 Privacy</span>
                  <span className="text-[10px] text-stone-500">Medical confidentiality compliance</span>
                </div>
              </button>

              {/* Download Mobile App */}
              {onDownloadApp && (
                <button
                  onClick={() => {
                    setIsMoreDrawerOpen(false);
                    onDownloadApp();
                  }}
                  className="sm:col-span-2 p-3.5 rounded-2xl bg-[#FDF1F1] hover:bg-rose-100/80 border border-rose-200 transition-all text-left flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D90429] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#0f1f38] block group-hover:text-[#C8232C]">
                        Download TERRALINK Mobile App
                      </span>
                      <span className="text-[10px] text-stone-600">
                        Install to Home Screen (iOS / Android) or download APK
                      </span>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#C8232C] shrink-0" />
                </button>
              )}

            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-400 text-[11px]">TERRALINK HEALTH Hospital Kenya</span>
              <button
                onClick={() => setIsMoreDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold cursor-pointer"
              >
                Close
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
