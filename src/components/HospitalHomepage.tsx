import React, { useState } from 'react';
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
  Heart
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

  // Patient Success Stories State & Dataset
  const [activeStoryFilter, setActiveStoryFilter] = useState<string>('all');

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
    <div className="space-y-16 pb-12">
      
      {/* 1. HERO SECTION WITH TERRALINKHEALTH HOSPITAL ENTRANCE */}
      <section className="relative rounded-3xl overflow-hidden glass-panel-heavy border border-white shadow-2xl p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Text & Impact Framing */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
              <span>TERRALINKHEALTH HOSPITAL • NAIROBI MEDICAL COMPLEX</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-[1.15]">
              Next-Generation <span className="text-teal-600">Digital Hospital</span> Management & Patient Experience.
            </h1>

            <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-normal">
              Empowering <strong className="text-slate-900 font-semibold">Patients, Healthcare Staff, and Government</strong> to eliminate paper delays, optimize hospital resources, protect clinical privacy, and deliver rapid, high-integrity medical care across Kenya.
            </p>

            {/* Quick Strategic Key Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/70 border border-white/80 shadow-xs">
                <div className="text-teal-700 font-bold text-lg sm:text-xl font-mono">100%</div>
                <div className="text-[11px] text-slate-600 font-medium leading-tight">Paperless Clinical EMR</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/70 border border-white/80 shadow-xs">
                <div className="text-emerald-700 font-bold text-lg sm:text-xl font-mono">&lt; 15 min</div>
                <div className="text-[11px] text-slate-600 font-medium leading-tight">Direct Insurance Approval</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/70 border border-white/80 shadow-xs">
                <div className="text-blue-700 font-bold text-lg sm:text-xl font-mono">KDPA 2019</div>
                <div className="text-[11px] text-slate-600 font-medium leading-tight">Staff Privacy Shield</div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap gap-3.5 pt-2">
              <button
                onClick={() => onNavigateToPortal('patient')}
                className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-lg shadow-teal-500/30 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Enter Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  const insEl = document.getElementById('insurance-calculator-section');
                  insEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3.5 rounded-2xl bg-white/80 hover:bg-white text-slate-800 text-sm font-bold border border-slate-200 shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-teal-600" />
                <span>Check Insurance & Premiums</span>
              </button>

              <button
                onClick={() => handleOpenAuth('staff_login')}
                className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-teal-400" />
                <span>Clinical Staff Portal</span>
              </button>
            </div>

          </div>

          {/* Right Hero Image - Front Entrance Display */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 group">
              <img
                src={hospitalEntranceImg}
                alt="TERRALINKHEALTH HOSPITAL Front Entrance Facade"
                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              {/* Overlay Badge on Front Entrance */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-white/20 text-white space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300 tracking-wide uppercase">Front Entrance Concourse</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">24/7 A&E Open</span>
                </div>
                <h4 className="text-sm font-bold text-white">TERRALINKHEALTH HOSPITAL</h4>
                <p className="text-[11px] text-slate-300">Hospital Hill Road, Parklands / Upper Hill Complex, Nairobi</p>
              </div>
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
                Experience dignified, efficient hospital care with instant digital queues, direct insurance approval, online EMR, and frictionless Daraja M-PESA payments.
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
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 text-white shadow-2xl border border-teal-500/30 p-6 sm:p-10">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Executive Bio & Profile Column */}
          <div className="lg:col-span-4 space-y-4 text-center lg:text-left border-b lg:border-b-0 lg:border-r border-white/15 pb-6 lg:pb-0 lg:pr-8">
            <div className="relative inline-block mx-auto lg:mx-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-teal-700 via-emerald-600 to-teal-400 p-1 shadow-xl shadow-teal-950/60 mx-auto">
                <div className="w-full h-full rounded-[22px] bg-slate-900 flex flex-col items-center justify-center text-teal-300 font-bold border border-white/20">
                  <span className="text-2xl sm:text-3xl tracking-tight">HK</span>
                  <span className="text-[9px] uppercase tracking-widest text-teal-400/80 font-mono mt-0.5">EXECUTIVE</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-teal-500 text-slate-950 shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-500/30 mb-2">
                <Sparkles className="w-3 h-3 text-teal-300" />
                <span>Founder & Executive Perspective</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
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
              <Quote className="w-7 h-7 rotate-180 opacity-60" />
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

      {/* 4.5 PATIENT SUCCESS STORIES & CLINICAL TRIUMPHS */}
      <section id="patient-success-stories-section" className="space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Real Patient Experiences & Social Proof</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-950 tracking-tight">
              Patient Success Stories & Clinical Triumphs
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Read how our digital EMR interoperability, 24/7 rapid emergency dispatch, and direct insurance partnerships deliver life-saving clinical care to Kenyan families.
            </p>
          </div>

          {/* Aggregate Rating Badge */}
          <div className="flex items-center space-x-3 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex flex-col items-center justify-center font-black leading-tight shadow-md">
              <span className="text-sm">4.98</span>
              <span className="text-[9px] text-teal-200 font-mono">/ 5.0</span>
            </div>
            <div>
              <div className="flex items-center space-x-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">Over 2,400+ Verified Reviews</span>
              <span className="text-[10px] text-slate-500 font-medium">KDPA Compliant Patient Feedback</span>
            </div>
          </div>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Stories (10)' },
            { id: 'maternity', label: 'Maternity & Neonatal' },
            { id: 'cardiac', label: 'Emergency & Cardiology' },
            { id: 'ortho', label: 'Orthopedics & Sports' },
            { id: 'surgery', label: 'Surgery & Specialized' },
            { id: 'chronic', label: 'Chronic & Oncology' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStoryFilter(tab.id)}
              className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeStoryFilter === tab.id
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/25 border border-teal-500'
                  : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patientSuccessStories
            .filter((story) => activeStoryFilter === 'all' || story.category === activeStoryFilter)
            .map((story) => (
              <div
                key={story.id}
                className="bg-white/80 backdrop-blur-md rounded-3xl border border-white p-6 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-4 group hover:-translate-y-1"
              >
                {/* Card Top: Avatar, Name, Location, Rating */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={story.avatar}
                          alt={`${story.name} - TERRALINKHEALTH Patient Testimonial`}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500/40 shadow-md group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-sm font-extrabold text-slate-900">{story.name}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">({story.age} yrs)</span>
                        </div>
                        <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                          <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                          <span>{story.location}</span>
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200/60">
                          {story.categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center space-x-0.5 text-amber-400 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200/50">
                      {[...Array(story.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Headline & Quote */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold text-teal-900 leading-snug">
                      {story.headline}
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      "{story.quote}"
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Clinical Details & Verified Badge */}
                <div className="space-y-3 pt-3 border-t border-slate-100 text-[11px]">
                  <div className="grid grid-cols-2 gap-2 text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Clinical Specialist</span>
                      <strong className="text-slate-900 truncate block">{story.doctorName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Insurance Billing</span>
                      <strong className="text-teal-700 truncate block">{story.insurance}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center space-x-1 font-semibold text-emerald-700">
                      <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{story.outcome}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{story.date}</span>
                  </div>
                </div>

              </div>
            ))}
        </div>

        {/* Section Call to Action Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-teal-400/30">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              Experience Compassionate, Digitally Integrated Healthcare
            </h3>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
              Book a consultation with our specialist doctors today, or register your digital health profile for instant paperless hospital visits.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onNavigateToPortal('patient')}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 text-teal-900 font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
            >
              <span>Book Doctor Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </section>

      {/* 5. CLINICAL DEPARTMENTS DIRECTORY & LIVE WAIT TIMES */}
      <section className="glass-panel p-6 sm:p-10 rounded-3xl border border-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950">
              Hospital Clinical Departments & Live Queues
            </h2>
            <p className="text-xs text-slate-600">
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
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-2xl border border-white/20 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
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

      {/* 7. CALL TO ACTION FOOTER BANNER */}
      <section className="glass-panel p-8 sm:p-10 rounded-3xl border border-white shadow-xl text-center space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-slate-950">
            Ready to Experience Modern Healthcare with TERRALINKHEALTH?
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
            Create your digital patient profile today or access the authorized hospital clinical portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={() => handleOpenAuth('patient_register')}
            className="px-6 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-lg shadow-teal-500/25 transition-all cursor-pointer"
          >
            Register Patient Account
          </button>
          
          <button
            onClick={() => handleOpenAuth('patient_login')}
            className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 shadow-xs transition-all cursor-pointer"
          >
            Existing Patient Log In
          </button>

          <button
            onClick={() => handleOpenAuth('staff_login')}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            Doctor / Staff Secure Sign-In
          </button>
        </div>
      </section>

    </div>
  );
};
