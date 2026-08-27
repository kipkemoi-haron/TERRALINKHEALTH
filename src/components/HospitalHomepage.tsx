import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  ShieldCheck,
  Stethoscope,
  Users,
  Landmark,
  Clock,
  CheckCircle2,
  ArrowRight,
  Calculator,
  CreditCard,
  Lock,
  PhoneCall,
  Activity,
  HeartPulse,
  Sparkles,
  Calendar,
  Layers,
  FileCheck,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  Globe,
  Sliders,
  AlertCircle,
  Quote,
  Star,
  ThumbsUp,
  MapPin,
  BadgeCheck,
  MessageSquareQuote,
  Heart,
  Camera,
  Upload,
  X,
  Search,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { Department, Doctor, InsuranceProviderPlan } from '../types';
import { mockDepartments, mockDoctors, INITIAL_INSURANCE_PROVIDERS } from '../mockData';
import hospitalEntranceImg from '../assets/images/terralink_hospital_entrance_1787764026767.jpg';
import hospitalLobbyImg from '../assets/images/terralink_hospital_lobby_1787764043451.jpg';
import avatarWanjiku from '../assets/images/patient_avatar_wanjiku_1787766471091.jpg';
import avatarDavid from '../assets/images/patient_avatar_david_1787766486972.jpg';
import avatarMercy from '../assets/images/patient_avatar_mercy_1787766499893.jpg';
import avatarOmondi from '../assets/images/patient_avatar_omondi_1787766511960.jpg';
import avatarAmina from '../assets/images/patient_avatar_amina_1787766524381.jpg';
import avatarKenneth from '../assets/images/patient_avatar_kenneth_1787766538303.jpg';
import avatarCarol from '../assets/images/patient_avatar_carol_1787766549794.jpg';
import avatarSamuel from '../assets/images/patient_avatar_samuel_1787766562099.jpg';
import avatarFaith from '../assets/images/patient_avatar_faith_1787766574175.jpg';
import avatarPeter from '../assets/images/patient_avatar_peter_1787766585865.jpg';

interface HospitalHomepageProps {
  departments?: Department[];
  doctors?: Doctor[];
  insuranceProviders?: InsuranceProviderPlan[];
  currentUser?: any;
  currentPatient?: any;
  onNavigateToPortal: (portal: 'patient' | 'provider' | 'admin') => void;
  onOpenAuthModal?: (mode: 'patient_login' | 'patient_register' | 'staff_login') => void;
  onOpenRegister?: () => void;
  onOpenPatientLogin?: () => void;
  onOpenStaffLogin?: () => void;
  onSelectDepartmentForBooking?: (deptId: string) => void;
}

export const HospitalHomepage: React.FC<HospitalHomepageProps> = ({
  departments = mockDepartments,
  doctors = mockDoctors,
  insuranceProviders = INITIAL_INSURANCE_PROVIDERS,
  currentUser,
  currentPatient,
  onNavigateToPortal,
  onOpenAuthModal,
  onOpenRegister,
  onOpenPatientLogin,
  onOpenStaffLogin,
  onSelectDepartmentForBooking
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

  const safeProviders = (insuranceProviders && insuranceProviders.length > 0) ? insuranceProviders : INITIAL_INSURANCE_PROVIDERS;
  const safeDepartments = (departments && departments.length > 0) ? departments : mockDepartments;

  // Premium Calculator State
  const [selectedProviderCode, setSelectedProviderCode] = useState<string>('SHA-KENYA');
  const [selectedTierCode, setSelectedTierCode] = useState<string>('SHA-PRIMARY');
  const [applicantAge, setApplicantAge] = useState<number>(32);
  const [monthlyIncomeKES, setMonthlyIncomeKES] = useState<number>(65000);
  const [dependentsCount, setDependentsCount] = useState<number>(2);

  const selectedProvider = safeProviders.find(p => p.providerCode === selectedProviderCode) || safeProviders[0];
  const selectedTier = selectedProvider?.planTiers?.find(t => t.tierCode === selectedTierCode) || selectedProvider?.planTiers?.[0];

  // Dynamic Premium Calculation based on SHA formula vs Private underwriting
  const isSha = selectedProviderCode === 'SHA-KENYA';
  const calculatedMonthlyPremium = isSha
    ? Math.max(500, Math.round(monthlyIncomeKES * 0.0275))
    : Math.round(
        (selectedTier?.monthlyPremiumKES || 3500) *
          (applicantAge > 50 ? 1.35 : applicantAge > 40 ? 1.15 : 1.0) *
          (1 + dependentsCount * 0.4)
      );
  const calculatedAnnualPremium = calculatedMonthlyPremium * 12;

  // Founder Profile Photo State (Initialized from stored photo or executive visual identity)
  const [founderPhoto] = useState<string>(() => {
    try {
      return localStorage.getItem('terralink_founder_profile_picture') || '';
    } catch {
      return '';
    }
  });

  // Reviews Modal State, API Fetching & Dynamic Management
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);
  const [reviewSearchQuery, setReviewSearchQuery] = useState<string>('');
  const [activeStoryFilter, setActiveStoryFilter] = useState<string>('all');
  const [liveReviews, setLiveReviews] = useState<any[]>([]);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState<boolean>(false);
  const [reviewFormMode, setReviewFormMode] = useState<'create' | 'edit'>('create');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewNotification, setReviewNotification] = useState<string>('');

  // Review Form Field State
  const [reviewForm, setReviewForm] = useState({
    name: currentPatient?.name || currentUser?.name || '',
    location: currentPatient?.county ? `${currentPatient.county}, Kenya` : 'Nairobi, Kenya',
    age: 32,
    rating: 5,
    category: 'general',
    categoryLabel: 'Clinical Care & Outpatient',
    condition: 'General Medical Consultation',
    doctorName: 'Dr. David Ochieng',
    department: 'Cardiology',
    insurance: 'SHA Kenya / Self',
    headline: '',
    quote: '',
    outcome: 'Successful Recovery & Excellent Care'
  });

  // Fetch reviews from API on mount & on modal open
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

  useEffect(() => {
    fetchReviews();
  }, []);

  const openAddReviewModal = () => {
    setReviewFormMode('create');
    setEditingReviewId(null);
    setReviewForm({
      name: currentPatient?.name || currentUser?.name || 'Verified Patient',
      location: currentPatient?.county ? `${currentPatient.county}, Kenya` : 'Nairobi, Kenya',
      age: 32,
      rating: 5,
      category: 'general',
      categoryLabel: 'Clinical Care & Outpatient',
      condition: 'Consultation & Follow-up',
      doctorName: 'Attending Specialist',
      department: 'General Outpatient',
      insurance: currentPatient?.insuranceProvider || 'SHA Kenya',
      headline: '',
      quote: '',
      outcome: 'Full Recovery & Compassionate Treatment'
    });
    setIsReviewFormOpen(true);
  };

  const openEditReviewModal = (review: any) => {
    setReviewFormMode('edit');
    setEditingReviewId(review.id);
    setReviewForm({
      name: review.name || '',
      location: review.location || 'Nairobi, Kenya',
      age: review.age || 30,
      rating: review.rating || 5,
      category: review.category || 'general',
      categoryLabel: review.categoryLabel || 'Clinical Care & Outpatient',
      condition: review.condition || '',
      doctorName: review.doctorName || '',
      department: review.department || '',
      insurance: review.insurance || 'SHA Kenya',
      headline: review.headline || '',
      quote: review.quote || '',
      outcome: review.outcome || 'Successful Outcome'
    });
    setIsReviewFormOpen(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete/archive this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        setLiveReviews(prev => prev.filter(r => r.id !== reviewId));
        setReviewNotification('Review successfully deleted.');
        setTimeout(() => setReviewNotification(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.headline.trim() || !reviewForm.quote.trim()) {
      alert('Please provide a headline and your review story.');
      return;
    }
    setReviewSubmitting(true);
    try {
      const payload = {
        ...reviewForm,
        patientId: currentPatient?.id || currentUser?.id || undefined
      };

      if (reviewFormMode === 'create') {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setLiveReviews(prev => [data.review, ...prev]);
          setReviewNotification('Your review has been successfully posted!');
          setIsReviewFormOpen(false);
          setTimeout(() => setReviewNotification(''), 3500);
        }
      } else if (editingReviewId) {
        const res = await fetch(`/api/reviews/${editingReviewId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setLiveReviews(prev => prev.map(r => r.id === editingReviewId ? data.review : r));
          setReviewNotification('Review updated successfully.');
          setIsReviewFormOpen(false);
          setTimeout(() => setReviewNotification(''), 3500);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const patientSuccessStories = [
    {
      id: 'story-1',
      name: 'Wanjiku Muthoni',
      location: 'Kilimani, Nairobi',
      age: 34,
      avatar: avatarWanjiku,
      category: 'maternity',
      categoryLabel: 'Maternity & Neonatal Care',
      condition: 'Emergency C-Section Twins Delivery',
      doctorName: 'Dr. Grace Mutua',
      department: 'Obstetrics & Gynaecology',
      insurance: 'Jubilee Insurance (Direct Billing)',
      rating: 5,
      date: 'August 2026',
      headline: '“Safe twin delivery at 2 AM with instant EMR ultrasound history.”',
      quote: 'When my labor went into distress at 2 AM, TERRALINKHEALTH’s emergency obstetric team was already prepared before we arrived. My previous antenatal scans from my patient portal were loaded onto the doctor’s tablet in seconds without repeating invasive tests. My twins are healthy, and our hospital bill was settled directly with Jubilee without any out-of-pocket delays.',
      outcome: 'Healthy Twin Delivery • Zero Delays'
    },
    {
      id: 'story-2',
      name: 'David Kiprono',
      location: 'Eldoret / Westlands',
      age: 42,
      avatar: avatarDavid,
      category: 'cardiac',
      categoryLabel: 'Cardiology & Emergency Interventions',
      condition: 'Acute Coronary Syndrome & Angioplasty',
      doctorName: 'Dr. David Ochieng',
      department: 'Cardiology & Cath Lab',
      insurance: 'SHA Kenya (Statutory Benefit)',
      rating: 5,
      date: 'July 2026',
      headline: '“Paramedics dispatched via 0713544101 saved my life en route.”',
      quote: 'I experienced sudden severe chest pain during a business conference. Calling the 24/7 hotline 0713544101 dispatched an ICU-equipped ambulance within 8 minutes. The onboard telemetry transmitted my 12-lead ECG directly to Dr. Ochieng in the catheterization lab while we were on the expressway. By the time I arrived, pre-authorization was cleared under SHA and the stent was placed immediately.',
      outcome: 'Successful Angioplasty • Full Recovery'
    },
    {
      id: 'story-3',
      name: 'Mercy Achieng',
      location: 'Kisumu / Parklands',
      age: 29,
      avatar: avatarMercy,
      category: 'chronic',
      categoryLabel: 'Oncology & Day Chemotherapy',
      condition: 'Early Stage Breast Oncology Treatment',
      doctorName: 'Dr. Farida Hassan',
      department: 'Internal Medicine & Oncology',
      insurance: 'Britam HealthShield',
      rating: 5,
      date: 'August 2026',
      headline: '“Digital biomarker trends & seamless M-PESA prescriptions.”',
      quote: 'Navigating chemotherapy is emotionally tough, but the digital patient portal removed all administrative frustration. I download my blood counts the moment the laboratory finalizes them, and my oncologists review my vitals through the tele-consult module. Even my specialized supportive medications are dispatched seamlessly to my doorstep.',
      outcome: 'Tumor Remission • Ongoing Wellness'
    },
    {
      id: 'story-4',
      name: 'Dr. Arthur Omondi',
      location: 'Machakos / Karen',
      age: 55,
      avatar: avatarOmondi,
      category: 'ortho',
      categoryLabel: 'Orthopedic Surgery & Joint Care',
      condition: 'Bilateral Total Knee Arthroplasty',
      doctorName: 'Dr. Joseph Kamau',
      department: 'Orthopedic Surgery',
      insurance: 'AAR Health Insurance',
      rating: 5,
      date: 'June 2026',
      headline: '“Walking unassisted in 3 weeks after advanced robotic knee replacement.”',
      quote: 'As a retired university lecturer, severe osteoarthritis had restricted my mobility for five years. Dr. Kamau performed a minimally invasive joint replacement in the newly commissioned surgical theatre. The physiotherapists guided my post-op exercises via the patient portal’s recovery tracker. I am back to walking 5 kilometers every morning without pain.',
      outcome: 'Full Weight-Bearing Mobility in 21 Days'
    },
    {
      id: 'story-5',
      name: 'Amina Abdi',
      location: 'South C, Nairobi',
      age: 26,
      avatar: avatarAmina,
      category: 'maternity',
      categoryLabel: 'Pediatric Care & Allergen Lab',
      condition: 'Acute Pediatric Asthma & Allergy Panel',
      doctorName: 'Dr. Brian Kiprop',
      department: 'Pediatrics & Child Health',
      insurance: 'APA Insurance Plan',
      rating: 5,
      date: 'August 2026',
      headline: '“My 4-year-old daughter was diagnosed and relieved within 45 minutes.”',
      quote: 'My daughter woke up gasping with acute wheezing. The pediatric triage team nebulized her immediately upon arrival and ran a rapid digital allergy panel that pinpointed environmental dust triggers. We walked out with e-prescribed inhalers that were automatically linked to our insurance with zero paperwork.',
      outcome: 'Respiratory Stabilization in 45 Mins'
    },
    {
      id: 'story-6',
      name: 'Kenneth Mwangi',
      location: 'Kiambu / Thika Road',
      age: 38,
      avatar: avatarKenneth,
      category: 'surgery',
      categoryLabel: 'Minimally Invasive Surgery',
      condition: 'Laparoscopic Appendectomy',
      doctorName: 'Dr. Sarah Wairimu',
      department: 'General & Laparoscopic Surgery',
      insurance: 'Old Mutual Health Plan',
      rating: 5,
      date: 'July 2026',
      headline: '“Single-incision laparoscopic surgery and back to work in 48 hours.”',
      quote: 'I was diagnosed with acute ruptured appendicitis during late evening triage. Dr. Wairimu performed keyhole laparoscopy within an hour of my admission. Because there were no large incisions, I experienced minimal pain and was discharged the very next morning. The digital sick leave certificate and discharge prescription were waiting in my inbox.',
      outcome: 'Discharged < 24 Hours • Zero Infection'
    },
    {
      id: 'story-7',
      name: 'Carol Chebet',
      location: 'Kericho / Kileleshwa',
      age: 48,
      avatar: avatarCarol,
      category: 'chronic',
      categoryLabel: 'Endocrinology & Diabetes Telehealth',
      condition: 'Type 1 Diabetes & Tele-Monitoring',
      doctorName: 'Dr. Farida Hassan',
      department: 'Endocrinology & Internal Medicine',
      insurance: 'CIC Insurance Group',
      rating: 5,
      date: 'May 2026',
      headline: '“Continuous glucose monitoring synced directly to my doctor’s dashboard.”',
      quote: 'Managing diabetes for twelve years was an exhausting routine of manual logbooks. TERRALINKHEALTH enabled me to sync my continuous glucose sensor with their hospital EMR. Whenever my glycemic levels spike, the clinical staff reaches out with insulin dosage adjustments before complications arise.',
      outcome: 'HbA1c Reduced from 9.4% to 6.2%'
    },
    {
      id: 'story-8',
      name: 'Samuel Otieno',
      location: 'Kasarani, Nairobi',
      age: 24,
      avatar: avatarSamuel,
      category: 'ortho',
      categoryLabel: 'Sports Medicine & Arthroscopy',
      condition: 'ACL Reconstruction & Meniscal Repair',
      doctorName: 'Dr. Joseph Kamau',
      department: 'Sports Medicine & Orthopedics',
      insurance: 'First Assurance Sports Policy',
      rating: 5,
      date: 'June 2026',
      headline: '“From tearing my ACL on the pitch to full athletic sprinting recovery.”',
      quote: 'I tore my anterior cruciate ligament during a regional football league tournament. The surgical team performed anatomic hamstring graft reconstruction with state-of-the-art arthroscopic equipment. The rehabilitation program was rigorous, and the biometric tracking kept me motivated. I was cleared to return to team training four months ahead of schedule.',
      outcome: 'Match-Fit Return to Professional Sports'
    },
    {
      id: 'story-9',
      name: 'Faith Ndinda',
      location: 'Syokimau / Mombasa Road',
      age: 32,
      avatar: avatarFaith,
      category: 'cardiac',
      categoryLabel: 'Radiology & Preventive Diagnostics',
      condition: 'Early Detection Thyroid Screening & 1.5T MRI',
      doctorName: 'Dr. Emmanuel Kiprono',
      department: 'Radiology & Imaging',
      insurance: 'M-PESA Express & Self-Pay',
      rating: 5,
      date: 'July 2026',
      headline: '“High-resolution 1.5T MRI detected an early nodule before symptoms started.”',
      quote: 'I booked an annual executive wellness screening through the website. The diagnostic imaging was fast, silent, and comfortable. Dr. Kiprono detected a tiny early-stage nodule that was treated non-invasively before causing any metabolic symptoms. Receiving verified digital radiologist reports on my smartphone gave my entire family peace of mind.',
      outcome: 'Early Benign Detection & Prompt Treatment'
    },
    {
      id: 'story-10',
      name: 'Peter Njoroge',
      location: 'Runda, Nairobi',
      age: 62,
      avatar: avatarPeter,
      category: 'surgery',
      categoryLabel: 'Ophthalmology & Senior Wellness',
      condition: 'Bilateral Phacoemulsification Cataract Surgery',
      doctorName: 'Dr. Elizabeth Wangari',
      department: 'Ophthalmology & Eye Surgery',
      insurance: 'Jubilee Senior Health Plan',
      rating: 5,
      date: 'August 2026',
      headline: '“Regained 20/20 vision after painless 15-minute laser cataract surgery.”',
      quote: 'My reading and driving vision had deteriorated significantly due to cataracts. Dr. Wangari performed laser phacoemulsification with premium multifocal lens implants. The procedure was completely painless and took less than fifteen minutes per eye. The nursing staff treated me with tremendous respect and warmth.',
      outcome: '20/20 Vision Restored • Zero Eyeglasses Needed'
    }
  ];

  return (
    <div className="space-y-10 sm:space-y-16 pb-12">
      
      {/* 1. HOSPITAL PICTURE WITH ENTER PORTAL BUTTONS */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 group">
        <div className="relative w-full h-72 sm:h-84 md:h-96 lg:h-[440px]">
          <img
            src={hospitalEntranceImg}
            alt="TERRALINKHEALTH HOSPITAL"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
          
          {/* Top Floating Status Badge */}
          <div className="absolute top-4 right-4 flex items-center pointer-events-none">
            <div className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold shadow-md flex items-center space-x-1.5 border border-emerald-400/40">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>24/7 OPEN</span>
            </div>
          </div>

          {/* Bottom Overlay: Direct Enter Portal Buttons ONLY */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/15">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
              <button
                type="button"
                onClick={() => onNavigateToPortal('patient')}
                className="w-full py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-sm sm:text-base font-bold shadow-lg shadow-teal-950/50 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-teal-200" />
                <span>Enter Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigateToPortal('provider')}
                className="w-full py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-sm sm:text-base font-bold border border-slate-700 shadow-md flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                <span>Enter Clinical Staff Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE 3-WAY VALUE MATRIX: STAFF • PATIENTS • GOVERNMENT */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Designed for Modern Healthcare Transformation
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Moving away from obsolete paper registers, missing laboratory records, long queues, and fragmented billing to a unified digital hospital ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: For Patients */}
          <div className="glass-panel p-6 rounded-3xl border border-white shadow-md space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">For Patients & Families</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Experience dignified, efficient hospital care with instant digital queues, direct insurance approval, online EMR, and frictionless M-PESA payments.
              </p>
              
              <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Book in-person or telemedicine appointments in 30 seconds</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Real-time insurance premium checker & claim limits balance</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Instant access to verified lab reports & e-prescriptions</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigateToPortal('patient')}
              className="w-full mt-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>Explore Patient Experience</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: For Healthcare Staff */}
          <div className="glass-panel p-6 rounded-3xl border border-white shadow-md space-y-4 hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-bl-2xl">
              Integrity Safeguard
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-inner">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">For Clinicians & Hospital Staff</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Streamlined clinical charting, AI-guided differential diagnosis, and automated pharmacy/lab queues — with guaranteed privacy protections for every worker.
              </p>
              
              <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-900">Staff Contact Protection:</span>
                </li>
                <p className="text-[11px] text-slate-600 pl-6 -mt-1">
                  Personal phone numbers & private emails are strictly shielded from patients to prevent unsolicited contact and burnout.
                </p>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Integrated SOAP clinical encounters & instant lab ordering</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Automated bed occupancy and triage status alerts</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onNavigateToPortal('provider')}
              className="w-full mt-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>Provider Portal Access</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: For Government & Health Authorities */}
          <div className="glass-panel p-6 rounded-3xl border border-white shadow-md space-y-4 hover:shadow-lg transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shadow-inner">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">For Government & MoH</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provides Ministry of Health (MoH Kenya) and County health executives with audited transparency, real-time disease surveillance, and optimized resource allocation.
              </p>
              
              <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Saves billions in public resources by curbing billing fraud</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Automated SHA / NHIF regulatory claim audit & compliance</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Live disease incidence tracking and bed capacity analytics</span>
                </li>
              </ul>
            </div>

            <div className="w-full mt-4 py-2 px-3 rounded-xl bg-amber-50 text-amber-900 text-[11px] font-semibold text-center border border-amber-200">
              National Health Digitalization Partner
            </div>
          </div>

        </div>
      </section>

      {/* 2.5 NOTE FROM FOUNDER & CEO HARON KIPKEMOI */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white shadow-2xl border border-teal-500/30 p-5 sm:p-8 md:p-10">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          
          {/* Executive Bio & Profile Column */}
          <div className="lg:col-span-4 space-y-4 text-center lg:text-left border-b lg:border-b-0 lg:border-r border-white/15 pb-6 lg:pb-0 lg:pr-8">
            
            {/* Executive Portrait Container for Founder (Haron Kipkemoi) */}
            <div className="relative inline-block mx-auto lg:mx-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl p-1 shadow-2xl bg-gradient-to-tr from-teal-700 via-emerald-600 to-teal-400 relative overflow-hidden">
                {founderPhoto ? (
                  <div className="relative w-full h-full rounded-[22px] overflow-hidden">
                    <img
                      src={founderPhoto}
                      alt="Haron Kipkemoi - Founder & CEO"
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-[22px] bg-slate-900 flex flex-col items-center justify-center text-teal-300 border border-white/20 p-2 text-center">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 mb-1.5 border border-teal-400/30 font-black text-sm shadow-inner">
                      HK
                    </div>
                    <span className="text-xs font-black tracking-tight text-white">HARON KIPKEMOI</span>
                    <span className="text-[9px] font-bold text-teal-400 tracking-wider uppercase mt-0.5">Founder & CEO</span>
                  </div>
                )}
              </div>

              {/* Verified Executive Badge */}
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-teal-500 text-slate-950 shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-500/30 mb-2">
                <Sparkles className="w-3 h-3 text-teal-300" />
                <span>Founder & Executive Perspective</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                HARON KIPKEMOI
              </h3>
              <p className="text-xs font-semibold text-teal-400">
                Founder & CEO, TERRALINKHEALTH
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Health Systems Manager & Digital Health Architect
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-1.5 text-[10px] text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 font-medium">Health Systems Management</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 font-medium">EMR Interoperability</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 font-medium">UHC Kenya 2030</span>
            </div>
          </div>

          {/* Vision Statement Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center space-x-2 text-teal-400">
              <Quote className="w-6 h-6 sm:w-7 sm:h-7 rotate-180 opacity-60" />
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
                A Note on the Digital Future of Healthcare
              </span>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              <p>
                <strong className="text-white font-semibold">"Digital health is no longer an optional innovation—it is the indispensable foundation of human dignity, clinical safety, and universal healthcare access."</strong>
              </p>
              <p className="text-slate-300">
                Throughout my experience in health systems management, I have witnessed firsthand how paper-heavy workflows, fragmented patient histories, missing laboratory results, and delayed insurance verifications compromise patient outcomes and place severe burnout on dedicated medical practitioners.
              </p>
              <p className="text-slate-300">
                I founded <strong className="text-white font-medium">TERRALINKHEALTH</strong> to pioneer a future where every patient owns and controls their verified longitudinal health record from anywhere in Kenya, and where doctors, nurses, pharmacists, and lab technologists work in an integrated, zero-friction clinical environment.
              </p>
              <p className="text-slate-300">
                By uniting paperless electronic medical records (EMR), instant insurance approvals, real-time M-PESA reconciliation, and strict statutory privacy compliance (KDPA 2019), we are not merely digitizing files—we are transforming health delivery to save lives, eliminate unnecessary delays, and make universal health coverage a lived reality for every family."
              </p>
            </div>

            {/* Strategic Pillars Ribbon */}
            <div className="pt-3 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-[11px]"><strong className="text-white">Patient Record Sovereignty</strong> (Universal Access)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-[11px]"><strong className="text-white">Staff Privacy & Dignity</strong> (Protected Channels)</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-[11px]"><strong className="text-white">Paperless Interoperability</strong> (Fast Care)</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE INSURANCE INTEGRATION & PREMIUM CHECKER */}
      <section id="insurance-calculator-section" className="glass-panel-heavy p-6 sm:p-10 rounded-3xl border border-white shadow-xl space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
              <CreditCard className="w-3.5 h-3.5" />
              <span>National SHA & Private Insurance Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
              Integrate Insurance & Check Your Premiums
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl">
              Patients can link their National Social Health Authority (SHA / NHIF) or Private Insurance cards directly into TERRALINKHEALTH. Our hospital billing desk verifies and approves coverage in real time so you know your exact premiums, inpatient limits, and zero out-of-pocket benefits.
            </p>
          </div>

          <button
            onClick={() => onNavigateToPortal('patient')}
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center space-x-2 shrink-0 self-start md:self-auto"
          >
            <span>Link Policy in Patient Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interactive Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Form */}
          <div className="lg:col-span-6 space-y-5 bg-white/60 p-6 rounded-2xl border border-white shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>Select Insurance Underwriter & Plan Details</span>
            </h4>

            {/* Provider Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Insurance Provider / Scheme</label>
              <select
                value={selectedProviderCode}
                onChange={(e) => {
                  setSelectedProviderCode(e.target.value);
                  const prov = safeProviders.find(p => p.providerCode === e.target.value);
                  if (prov && prov.planTiers && prov.planTiers[0]) {
                    setSelectedTierCode(prov.planTiers[0].tierCode);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {safeProviders.map(p => (
                  <option key={p.providerCode} value={p.providerCode}>
                    {p.providerName} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Tier Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Plan Tier / Package</label>
              <select
                value={selectedTierCode}
                onChange={(e) => setSelectedTierCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {selectedProvider?.planTiers.map(t => (
                  <option key={t.tierCode} value={t.tierCode}>
                    {t.tierName}
                  </option>
                ))}
              </select>
            </div>

            {/* Inputs: Age, Income, Dependents */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Principal Age</label>
                <input
                  type="number"
                  min="18"
                  max="90"
                  value={applicantAge}
                  onChange={(e) => setApplicantAge(Number(e.target.value) || 18)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Monthly Income (KES)</label>
                <input
                  type="number"
                  step="5000"
                  value={monthlyIncomeKES}
                  onChange={(e) => setMonthlyIncomeKES(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700">Dependents</label>
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={dependentsCount}
                  onChange={(e) => setDependentsCount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/60 text-[11px] text-teal-900 leading-relaxed">
              <strong>Hospital Direct Billing Guarantee:</strong> Once approved by TERRALINKHEALTH, your consultations, emergency admissions, lab panels, and surgical admissions are debited directly to your policy without cash outlays.
            </div>

          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-6 bg-slate-900 text-white p-6 sm:p-7 rounded-2xl shadow-xl flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div>
                  <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">Estimated Coverage Calculation</span>
                  <h4 className="text-base font-bold text-white">{selectedTier?.tierName}</h4>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-mono font-bold border border-teal-500/30">
                  {selectedProvider?.category}
                </div>
              </div>

              {/* Calculated Premiums */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[11px] text-slate-300 font-medium block">Monthly Premium</span>
                  <span className="text-xl sm:text-2xl font-black text-teal-400 font-mono">
                    KES {calculatedMonthlyPremium.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {isSha ? 'Statutory 2.75% formula' : 'Inclusive of dependents'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[11px] text-slate-300 font-medium block">Annualized Premium</span>
                  <span className="text-xl sm:text-2xl font-black text-white font-mono">
                    KES {calculatedAnnualPremium.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Full 12-month coverage</span>
                </div>
              </div>

              {/* Benefits Cap Breakdown */}
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">Inpatient Limit</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    KES {(selectedTier?.inpatientLimitKES || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">Outpatient Limit</span>
                  <span className="text-xs font-bold text-sky-400 font-mono">
                    KES {(selectedTier?.outpatientLimitKES || 0).toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 block">Visit Co-Pay</span>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    KES {selectedTier?.copayKES || 0}
                  </span>
                </div>
              </div>

              {/* Highlights List */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-bold text-slate-300">Covered at TERRALINKHEALTH:</span>
                <ul className="text-[11px] text-slate-300 space-y-1">
                  {(selectedTier?.coverageHighlights || []).slice(0, 3).map((h, idx) => (
                    <li key={idx} className="flex items-center space-x-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Hospital Pre-Auth Speed: <strong className="text-teal-300">&lt; 15 Minutes</strong>
              </span>
              <button
                onClick={() => onNavigateToPortal('patient')}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md"
              >
                Submit Policy Card
              </button>
            </div>

          </div>

        </div>

      </section>

      {/* 4. HOSPITAL INTERIOR & FACILITY TECHNOLOGY SHOWCASE */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              Hospital Facilities & Clinical Architecture
            </h2>
            <p className="text-slate-600 text-sm">
              State-of-the-art diagnostic concourses, automated triage lobbies, and surgical theatres.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200">
            Nairobi County Referral Center
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Facility 1: Reception & Registration Concourse */}
          <div className="rounded-3xl overflow-hidden glass-panel border border-white shadow-lg space-y-4 p-5 group">
            <div className="relative rounded-2xl overflow-hidden h-60">
              <img
                src={hospitalLobbyImg}
                alt="TERRALINKHEALTH Digital Reception and Patient Check-in Lobby"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                Main Reception Concourse
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Digital Triage & Reception Concourse</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Equipped with self-service biometric check-ins, automated ticket queue dispensers, and comfortable waiting lounges that reduce average patient wait times by over 60%.
              </p>
              <div className="flex items-center space-x-4 pt-1 text-[11px] text-teal-800 font-semibold">
                <span>• Live Digital Queues</span>
                <span>• M-PESA Express Kiosks</span>
                <span>• SHA Verification Desk</span>
              </div>
            </div>
          </div>

          {/* Facility 2: Diagnostic & Emergency Wings */}
          <div className="rounded-3xl overflow-hidden glass-panel border border-white shadow-lg space-y-4 p-5 group">
            <div className="relative rounded-2xl overflow-hidden h-60">
              <img
                src={hospitalEntranceImg}
                alt="TERRALINKHEALTH Emergency and Specialist Hospital Wings"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/20">
                Ambulance Bay & Emergency Center
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">24/7 Trauma, ICU & Critical Care Wings</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dedicated ambulance resuscitation bays, 16-bed high dependency units (HDU/ICU), multi-slice CT scanning, digital X-rays, and accredited blood bank facilities.
              </p>
              <div className="flex items-center space-x-4 pt-1 text-[11px] text-emerald-800 font-semibold">
                <span>• 24/7 Resuscitation Bay</span>
                <span>• 1.5T MRI Suite</span>
                <span>• Fully Equipped Blood Bank</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. CLINICAL DEPARTMENTS DIRECTORY & LIVE WAIT TIMES */}
      <section className="glass-panel p-5 sm:p-8 md:p-10 rounded-3xl border border-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">
              Hospital Clinical Departments & Live Queues
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Check active consultation tariffs and estimated queue wait times before booking.
            </p>
          </div>
          <button
            onClick={() => onNavigateToPortal('patient')}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>Book Doctor Consultation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(safeDepartments || []).slice(0, 6).map((dept) => (
            <div
              key={dept.id}
              className="p-4 rounded-2xl bg-white/70 border border-white hover:border-teal-300 hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-bold text-[10px] border border-teal-200">
                    {dept.code}
                  </span>
                  {dept.isOpen24Hours ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      24 Hours
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium">Day Clinic</span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{dept.description}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Consultation</span>
                  <span className="font-bold text-slate-900 font-mono">
                    KES {dept.consultationFeeKES.toLocaleString()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Est. Wait</span>
                  <span className="font-bold text-teal-700 font-mono">
                    ~{dept.avgWaitTimeMinutes} mins
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. STAFF CONTACT PRIVACY & HOSPITAL INTEGRITY CHARTER */}
      <section className="p-5 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-2xl border border-white/20 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-400 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">
              Hospital Medical Integrity & Staff Contact Privacy Protocol
            </h3>
            <p className="text-xs text-slate-300">
              Enforcing the Kenya Data Protection Act (KDPA 2019) and KMPDC Ethical Regulations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h5 className="font-bold text-teal-300 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero Contact Leakage</span>
            </h5>
            <p className="text-[11px] leading-relaxed">
              Doctors, nurses, lab technicians, and pharmacists never have their personal telephone numbers or private emails shown to patients, preventing harassment and informal off-duty consultations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h5 className="font-bold text-teal-300 flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Audited Hospital Channels</span>
            </h5>
            <p className="text-[11px] leading-relaxed">
              All communications, appointment bookings, telemedicine video consultations, and prescription clarifications occur solely via verified TERRALINKHEALTH cryptographic portals.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h5 className="font-bold text-teal-300 flex items-center space-x-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Institutional Integrity</span>
            </h5>
            <p className="text-[11px] leading-relaxed">
              Every medical note, lab sign-off, and insurance bill is immutably timestamped and linked to staff license numbers for full transparency and government auditing.
            </p>
          </div>
        </div>
      </section>

      {/* 6.5 LOWER PAGE REVIEWS ACTION BUTTON & SOCIAL PROOF BAR */}
      <section className="rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white border border-teal-400/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-amber-400 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="text-sm sm:text-base font-black text-white">Patient & Staff Reviews</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold border border-amber-400/30">
                ⭐ 4.98 / 5.0 Rating
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Over 2,400+ verified clinical feedback stories across all departments.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsReviewsModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/25 transition-all flex items-center space-x-2 shrink-0 cursor-pointer w-full sm:w-auto justify-center"
        >
          <MessageSquareQuote className="w-4 h-4" />
          <span>Read Verified Reviews ({patientSuccessStories.length} Stories)</span>
        </button>
      </section>

      {/* 7. CALL TO ACTION FOOTER BANNER */}
      <section className="glass-panel p-6 sm:p-10 rounded-3xl border border-white shadow-xl text-center space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950">
            Ready to Experience Modern Healthcare with TERRALINKHEALTH?
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            Create your digital patient profile today or access the authorized hospital clinical portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => handleOpenAuth('patient_register')}
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-lg shadow-teal-500/25 transition-all cursor-pointer w-full sm:w-auto"
          >
            Register Patient Account
          </button>
          
          <button
            onClick={() => handleOpenAuth('patient_login')}
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-xs transition-all cursor-pointer w-full sm:w-auto"
          >
            Existing Patient Log In
          </button>

          <button
            onClick={() => handleOpenAuth('staff_login')}
            className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer w-full sm:w-auto"
          >
            Doctor / Staff Secure Sign-In
          </button>
        </div>
      </section>

      {/* ================= MODAL: VERIFIED PATIENT & STAFF REVIEWS ================= */}
      {isReviewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-600/30 shrink-0">
                  <Star className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">Verified Patient & Staff Reviews</h3>
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 font-extrabold text-[10px] border border-teal-200">
                      4.98 / 5.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Real clinical outcomes, emergency interventions, and EMR experiences.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewsModalOpen(false)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls: Search & Category Filter */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-white space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reviewSearchQuery}
                  onChange={(e) => setReviewSearchQuery(e.target.value)}
                  placeholder="Search reviews by patient, doctor, condition, or keyword..."
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: 'all', label: 'All Reviews' },
                  { id: 'maternity', label: 'Maternity & Neonatal' },
                  { id: 'cardiac', label: 'Emergency & Cardiology' },
                  { id: 'ortho', label: 'Orthopedics & Joint' },
                  { id: 'surgery', label: 'Surgery & Specialized' },
                  { id: 'chronic', label: 'Chronic & Oncology' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap text-xs transition-all cursor-pointer ${
                      activeStoryFilter === tab.id
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
              {reviewNotification && (
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
                  <span>{reviewNotification}</span>
                  <button onClick={() => setReviewNotification('')} className="text-teal-600 hover:text-teal-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Merged Live Reviews + Initial Stories */}
              {(() => {
                const combined = [
                  ...liveReviews,
                  ...patientSuccessStories.filter(s => !liveReviews.some(lr => lr.id === s.id))
                ];

                const filtered = combined.filter((story) => {
                  const matchesCategory = activeStoryFilter === 'all' || story.category === activeStoryFilter;
                  const q = reviewSearchQuery.toLowerCase().trim();
                  if (!q) return matchesCategory;
                  return (
                    matchesCategory &&
                    (story.name?.toLowerCase().includes(q) ||
                      story.doctorName?.toLowerCase().includes(q) ||
                      story.condition?.toLowerCase().includes(q) ||
                      story.quote?.toLowerCase().includes(q) ||
                      story.location?.toLowerCase().includes(q) ||
                      story.department?.toLowerCase().includes(q))
                  );
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
                      <MessageSquareQuote className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-semibold">No reviews found matching your search.</p>
                      <p>Be the first verified patient to share your medical care journey!</p>
                    </div>
                  );
                }

                return filtered.map((story) => {
                  const isAuthor =
                    (currentPatient?.id && story.patientId === currentPatient.id) ||
                    (currentPatient?.name && story.name === currentPatient.name) ||
                    (currentUser?.name && story.name === currentUser.name) ||
                    currentUser?.role === 'admin';

                  return (
                    <div
                      key={story.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 relative group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <img
                            src={story.avatar || avatarWanjiku}
                            alt={story.name}
                            className="w-12 h-12 rounded-xl object-cover border border-teal-500/30 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-bold text-slate-900">{story.name}</h4>
                              {story.age && <span className="text-[11px] text-slate-500">({story.age} yrs)</span>}
                              <span className="px-2 py-0.2 rounded bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200/60">
                                {story.categoryLabel || story.department || 'Clinical Care'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                              <MapPin className="w-3 h-3 text-teal-600" />
                              <span>{story.location || 'Nairobi, Kenya'}</span>
                              {story.date && <span className="text-slate-400">• {story.date}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-0.5 text-amber-400 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/50 self-start sm:self-auto">
                            {[...Array(story.rating || 5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>

                          {/* Patient Actions: Edit / Delete Review */}
                          {isAuthor && (
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => openEditReviewModal(story)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 text-xs font-semibold transition-all cursor-pointer"
                                title="Edit My Review"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(story.id)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-all cursor-pointer"
                                title="Delete My Review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h5 className="text-xs font-bold text-teal-950">{story.headline}</h5>
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          "{story.quote}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                        <div className="flex items-center space-x-3">
                          {story.doctorName && (
                            <span>Attending: <strong className="text-slate-800">{story.doctorName}</strong></span>
                          )}
                          {story.department && (
                            <span>Dept: <strong className="text-teal-700">{story.department}</strong></span>
                          )}
                          {story.insurance && (
                            <span>Billing: <strong className="text-slate-700">{story.insurance}</strong></span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 font-semibold text-emerald-700">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{story.outcome || 'Successful Outcome'}</span>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Modal Footer with Add/Edit/Delete Review Button for Logged-In Patient */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>KDPA 2019 & KMPDC Certified Patient Feedback System</span>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                {/* Button to Add or Manage Patient Review */}
                <button
                  type="button"
                  onClick={openAddReviewModal}
                  className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-300 shadow-xs transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>+ Add Patient Review</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsReviewsModalOpen(false);
                    onNavigateToPortal('patient');
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT PATIENT REVIEW FORM ================= */}
      {isReviewFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Star className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {reviewFormMode === 'create' ? 'Add Verified Patient Review' : 'Edit Your Patient Review'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Share your experience with doctors, nurses, triage, and hospital facilities.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewFormOpen(false)}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Jane Mutua"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Location / County</label>
                  <input
                    type="text"
                    value={reviewForm.location}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Westlands, Nairobi"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rating (Stars)</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none font-bold text-amber-600"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 - Exceptional)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                    <option value={3}>⭐⭐⭐ (3 - Satisfactory)</option>
                    <option value={2}>⭐⭐ (2 - Needs Improvement)</option>
                    <option value={1}>⭐ (1 - Unsatisfactory)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department</label>
                  <select
                    value={reviewForm.department}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Obstetrics & Gynaecology">OB/GYN & Maternity</option>
                    <option value="Radiology & Imaging">Radiology</option>
                    <option value="Emergency & Trauma">Emergency & Trauma</option>
                    <option value="General Outpatient">General Outpatient</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Insurance / Scheme</label>
                  <input
                    type="text"
                    value={reviewForm.insurance}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, insurance: e.target.value }))}
                    placeholder="e.g. SHA Kenya / Jubilee"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Condition Treated / Reason</label>
                  <input
                    type="text"
                    value={reviewForm.condition}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, condition: e.target.value }))}
                    placeholder="e.g. Annual Cardiac Checkup & ECG"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Attending Doctor / Specialist</label>
                  <input
                    type="text"
                    value={reviewForm.doctorName}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, doctorName: e.target.value }))}
                    placeholder="e.g. Dr. David Ochieng"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={reviewForm.headline}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, headline: e.target.value }))}
                  placeholder="e.g. Fast emergency response and excellent pediatric care"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Your Detailed Experience & Story</label>
                <textarea
                  required
                  rows={3}
                  value={reviewForm.quote}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, quote: e.target.value }))}
                  placeholder="Describe your care experience, staff warmth, wait times, and clinical outcome..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Clinical Outcome</label>
                <input
                  type="text"
                  value={reviewForm.outcome}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, outcome: e.target.value }))}
                  placeholder="e.g. Full Recovery • Zero Complications"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsReviewFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {reviewSubmitting ? 'Submitting...' : reviewFormMode === 'create' ? 'Publish Review' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
