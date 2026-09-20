import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Stethoscope,
  Clock,
  ArrowRight,
  Lock,
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
  Mail,
  MapPin,
  FileText,
  LogOut
} from 'lucide-react';
import { Department, Doctor, InsuranceProviderPlan, PatientReview } from '../types';
import { INITIAL_REVIEWS } from '../mockData';
import founderPhotoImg from '../assets/images/founder_photo_1788042380844.jpg';
import doctorHeroImg from '../assets/images/doctor_hero_1789942016435.jpg';

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
  currentUser,
  currentPatient,
  onNavigateToPortal,
  onOpenAuthModal,
  onOpenRegister,
  onOpenPatientLogin,
  onOpenStaffLogin,
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

  // Reviews Modal State & Data
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);
  const [liveReviews, setLiveReviews] = useState<PatientReview[]>(INITIAL_REVIEWS);
  const [reviewSearchQuery, setReviewSearchQuery] = useState<string>('');
  const [isReviewFormOpen, setIsReviewFormOpen] = useState<boolean>(false);
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewNotification, setReviewNotification] = useState<string>('');

  // Info Modals (Contact, Privacy, Terms)
  const [activeInfoModal, setActiveInfoModal] = useState<'contact' | 'privacy' | 'terms' | null>(null);

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

  // Fetch reviews from backend API on mount
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
      date: 'September 2026',
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#e8f4fc] via-[#f1f8fc] to-[#f8fbfe] text-slate-900 flex flex-col justify-between selection:bg-sky-100 selection:text-sky-900">
      
      {/* ================= 1. HEADER BAR ================= */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100/90 sticky top-0 z-40 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo & Brand matching Reference Screenshot */}
          <div 
            onClick={() => onNavigateToPortal('patient')}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.3]" />
            </div>
            <div>
              <span className="text-[15px] sm:text-[17px] font-bold text-slate-900 leading-tight block tracking-tight">
                TERRALINK Health
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight block">
                Digital Hospital Platform
              </span>
            </div>
          </div>

          {/* Right Header Navigation */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (currentUser.role === 'patient') onNavigateToPortal('patient');
                    else onNavigateToPortal('provider');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0284c7] font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  My Workspace ({currentUser.name?.split(' ')[0]})
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleOpenAuth('patient_login')}
                className="text-sm font-semibold text-slate-700 hover:text-[#0284c7] transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-50"
              >
                Sign In
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ================= 2. HERO SECTION ================= */}
      <section className="relative w-full overflow-hidden pt-6 sm:pt-10 md:pt-14 pb-8 sm:pb-12 md:pb-16 px-4 sm:px-6 lg:px-8">
        
        {/* Healthcare Professional on Far Right: subtle & blended on mobile, fully visible on desktop */}
        <div className="absolute right-0 top-0 bottom-0 w-[42%] sm:w-[46%] md:w-[45%] lg:w-[43%] xl:w-[41%] pointer-events-none select-none z-0 overflow-hidden flex justify-end">
          <div className="relative w-full h-full [mask-image:linear-gradient(to_right,transparent_0%,black_35%,black_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_35%,black_100%)]">
            <img
              src={doctorPhoto}
              alt="Doctor at TERRALINK Health"
              className="w-full h-full object-cover object-[center_top] opacity-40 sm:opacity-75 md:opacity-90 lg:opacity-100 filter brightness-[1.02] contrast-[1.02]"
              referrerPolicy="no-referrer"
            />
            {/* Smooth gradient blend on the left edge */}
            <div className="absolute inset-y-0 left-0 w-16 sm:w-28 md:w-36 bg-gradient-to-r from-[#e8f4fc] via-[#e8f4fc]/60 to-transparent" />
            {/* Subtle bottom fade */}
            <div className="absolute bottom-0 inset-x-0 h-8 sm:h-12 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
          </div>
        </div>

        {/* Hero Content - Clean Light/White Background on Left, No Overlap with Image */}
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-start text-left w-full pr-[38%] sm:pr-[38%] md:pr-0">
          
          {/* Transforming Healthcare Eyebrow */}
          <div className="inline-flex items-center space-x-1.5 text-[#0284c7] font-semibold text-[11px] sm:text-xs md:text-sm tracking-wide mb-2 sm:mb-3">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0284c7]" />
            <span>Transforming Healthcare in Kenya</span>
          </div>

          {/* Main Bold Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            TERRALINK Health
          </h1>

          {/* Subheading: Fits neatly on one or two balanced lines without overlapping image */}
          <h2 className="text-base sm:text-xl md:text-2xl lg:text-[25px] xl:text-[27px] font-bold text-slate-800 tracking-tight mt-2 sm:mt-3 leading-snug lg:whitespace-nowrap">
            Enhancing Hospital Operations &amp; Patient Experience
          </h2>

          {/* Paragraph Description */}
          <p className="text-slate-600 text-xs sm:text-sm md:text-base lg:text-[17px] leading-relaxed mt-2.5 sm:mt-4 max-w-xl">
            An integrated digital platform for patient engagement, digital registration, telemedicine, and real-time analytics — built for Kenyan hospitals.
          </p>
        </div>
      </section>

      {/* ================= 3. KEY BENEFITS SECTION ================= */}
      <section className="w-full py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 bg-white/40">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
            
            {/* 1. Reduced Wait Times */}
            <div className="flex flex-col items-start text-left p-3.5 sm:p-5 rounded-2xl bg-white/70 sm:bg-transparent border border-slate-100/80 sm:border-0 shadow-2xs sm:shadow-none">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center mb-2.5 sm:mb-3 shrink-0 shadow-2xs">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-snug">
                Reduced Wait Times
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug sm:leading-relaxed">
                Real-time queue tracking &amp; online appointment booking.
              </p>
            </div>

            {/* 2. Secure Records */}
            <div className="flex flex-col items-start text-left p-3.5 sm:p-5 rounded-2xl bg-white/70 sm:bg-transparent border border-slate-100/80 sm:border-0 shadow-2xs sm:shadow-none">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center mb-2.5 sm:mb-3 shrink-0 shadow-2xs">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-snug">
                Secure Records
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug sm:leading-relaxed">
                Encrypted patient data with role-based access control.
              </p>
            </div>

            {/* 3. Telemedicine */}
            <div className="flex flex-col items-start text-left p-3.5 sm:p-5 rounded-2xl bg-white/70 sm:bg-transparent border border-slate-100/80 sm:border-0 shadow-2xs sm:shadow-none">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center mb-2.5 sm:mb-3 shrink-0 shadow-2xs">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-snug">
                Telemedicine
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug sm:leading-relaxed">
                Virtual consultations from anywhere in Kenya.
              </p>
            </div>

            {/* 4. Real-Time Analytics */}
            <div className="flex flex-col items-start text-left p-3.5 sm:p-5 rounded-2xl bg-white/70 sm:bg-transparent border border-slate-100/80 sm:border-0 shadow-2xs sm:shadow-none">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center mb-2.5 sm:mb-3 shrink-0 shadow-2xs">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 leading-snug">
                Real-Time Analytics
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-snug sm:leading-relaxed">
                Live dashboards for hospital performance monitoring.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 4. ACCESS YOUR PORTAL SECTION ================= */}
      <section className="w-full py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center space-y-1.5 sm:space-y-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Access Your Portal
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-500">
              Choose how you'd like to access TERRALINK Health
            </p>
          </div>

          {/* Two Portal Cards: Side-by-Side on Desktop, Stacked on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 max-w-4xl mx-auto mt-6 sm:mt-10">
            
            {/* Card 1: Patient Portal */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-100 shadow-md shadow-slate-200/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between items-center text-center">
              
              <div className="flex flex-col items-center">
                {/* Blue Rounded Square Icon Badge */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center mb-4 sm:mb-6 shadow-xs">
                  <User className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Patient Portal
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-2.5 leading-relaxed max-w-xs">
                  Book appointments, view medical records, pay bills, and access telemedicine services.
                </p>
              </div>

              {/* Action Buttons Matching Reference Design */}
              <div className="w-full space-y-3 pt-6 sm:pt-8">
                
                {/* Primary: Get Started */}
                <button
                  onClick={() => {
                    if (currentUser && currentUser.role === 'patient') {
                      onNavigateToPortal('patient');
                    } else {
                      handleOpenAuth('patient_register');
                    }
                  }}
                  className="w-full py-3 sm:py-3.5 px-5 sm:px-6 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
                >
                  <User className="w-4 h-4 stroke-[2.2]" />
                  <span>Get Started</span>
                </button>

                {/* Secondary: Patient Sign In */}
                <button
                  onClick={() => {
                    if (currentUser && currentUser.role === 'patient') {
                      onNavigateToPortal('patient');
                    } else {
                      handleOpenAuth('patient_login');
                    }
                  }}
                  className="w-full py-3 sm:py-3.5 px-5 sm:px-6 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-2xs active:scale-[0.99]"
                >
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span>Patient Sign In</span>
                </button>

              </div>
            </div>

            {/* Card 2: Staff Portal */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-100 shadow-md shadow-slate-200/50 hover:shadow-xl transition-all duration-300 flex flex-col justify-between items-center text-center">
              
              <div className="flex flex-col items-center">
                {/* Teal Rounded Square Icon Badge */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0891b2] text-white flex items-center justify-center mb-4 sm:mb-6 shadow-xs">
                  <Stethoscope className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2]" />
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Staff Portal
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-2.5 leading-relaxed max-w-xs">
                  Clinical workspace for doctors, nurses, pharmacists, lab technologists, and hospital administration.
                </p>
              </div>

              {/* Action Buttons Matching Reference Design */}
              <div className="w-full space-y-3 pt-6 sm:pt-8">
                
                {/* Primary: Staff Sign In */}
                <button
                  onClick={() => {
                    if (currentUser && currentUser.role !== 'patient') {
                      onNavigateToPortal('provider');
                    } else {
                      handleOpenAuth('staff_login');
                    }
                  }}
                  className="w-full py-3 sm:py-3.5 px-5 sm:px-6 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
                >
                  <Stethoscope className="w-4 h-4 stroke-[2.2]" />
                  <span>Staff Sign In</span>
                </button>

                {/* Secondary: Admin Access / Demo */}
                <button
                  onClick={() => {
                    onNavigateToPortal('admin');
                  }}
                  className="w-full py-3 sm:py-3.5 px-5 sm:px-6 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm border border-slate-200 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-2xs active:scale-[0.99]"
                >
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Admin Access / Demo</span>
                </button>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= 5. FOOTER ================= */}
      <footer className="w-full py-8 sm:py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-200/60 bg-white/50 text-center space-y-3.5 text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-3">
          
          {/* Institutional Copyright */}
          <p className="text-slate-600 font-medium">
            &copy; 2026 TERRALINK Health &mdash; Digital Hospital Management Platform
          </p>
          
          {/* Location details */}
          <p className="text-slate-400">
            Enhancing Hospital Operations &amp; Patient Experience in Nairobi County, Kenya
          </p>

          {/* Links Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-slate-500 pt-1 font-medium">
            <button
              onClick={() => setActiveInfoModal('contact')}
              className="hover:text-[#0284c7] transition-colors cursor-pointer"
            >
              Contact
            </button>
            <span>|</span>
            <button
              onClick={() => setActiveInfoModal('privacy')}
              className="hover:text-[#0284c7] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>|</span>
            <button
              onClick={() => setActiveInfoModal('terms')}
              className="hover:text-[#0284c7] transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          {/* Secondary Badges for Founder Leadership & Patient Stories */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            <button
              onClick={() => setIsFounderModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-medium text-[11px] transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
              <span>Founder &amp; Executive Perspective</span>
            </button>

            <button
              onClick={() => setIsReviewsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-medium text-[11px] transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Patient Reviews &amp; Stories ({liveReviews.length})</span>
            </button>
          </div>

        </div>
      </footer>

      {/* ================= MODAL: FOUNDER & EXECUTIVE PERSPECTIVE ================= */}
      {isFounderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto space-y-6">
            
            <button
              onClick={() => setIsFounderModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5 text-center sm:text-left border-b border-slate-100 pb-5">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md border-2 border-teal-500">
                  <img
                    src={founderPhoto}
                    alt="Haron Kipkemoi"
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-teal-600 text-white shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold">
                  <span>Executive Leadership</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">HARON KIPKEMOI</h3>
                <p className="text-xs font-semibold text-teal-700">Founder &amp; CEO, TERRALINKHEALTH</p>
                <p className="text-[11px] text-slate-500">Health Systems Manager &amp; Digital Health Architect</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="flex items-center space-x-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
                <Quote className="w-4 h-4 rotate-180" />
                <span>Founder's Perspective on Kenya's Healthcare Digitization</span>
              </div>
              <p className="font-semibold text-slate-800">
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

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-400">
                KMPDC Certified &bull; KDPA 2019 Compliant
              </div>
              <button
                onClick={() => setIsFounderModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Verified Patient Reviews</h3>
                <p className="text-xs text-slate-500">Real clinical recovery stories from patients across Kenya</p>
              </div>
              <button
                onClick={() => {
                  setIsReviewsModalOpen(false);
                  setIsReviewFormOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
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
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <button
                    onClick={() => setIsReviewFormOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Write a Patient Review</span>
                  </button>
                </div>

                {/* Reviews List */}
                <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                  {filteredReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                            {rev.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-slate-900">{rev.name}</span>
                              <span className="text-[10px] text-slate-400">&bull; {rev.location}</span>
                            </div>
                            <span className="text-[10px] text-[#0284c7] font-medium">{rev.department}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs font-semibold text-slate-800">
                        {rev.headline}
                      </p>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        "{rev.quote}"
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                        <span>Outcome: <strong className="text-slate-700">{rev.outcome}</strong></span>
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
                    <label className="block text-slate-700 font-semibold mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">County / City</label>
                    <input
                      type="text"
                      value={reviewForm.location}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Hospital Department</label>
                    <input
                      type="text"
                      value={reviewForm.department}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Star Rating</label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none font-bold text-amber-600"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Stars - Excellent)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Stars - Very Good)</option>
                      <option value={3}>⭐⭐⭐ (3 Stars - Good)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prompt emergency attention and excellent nursing care"
                    value={reviewForm.headline}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, headline: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Your Care Experience</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe your care experience, doctor warmth, and treatment outcome..."
                    value={reviewForm.quote}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, quote: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsReviewFormOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                  >
                    Back to Reviews
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold cursor-pointer shadow-xs disabled:opacity-50"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5">
            <button
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0284c7] flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Contact Us</h3>
                <p className="text-xs text-slate-500">TERRALINK Health Hospital Kenya</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed pt-2">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <MapPin className="w-4 h-4 text-[#0284c7] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Physical Hospital Location</span>
                  <span>Hospital Hill Road, Parklands / Upper Hill Medical Complex, Nairobi County, Kenya</span>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Emergency &amp; Ambulance Hotline (24/7)</span>
                  <a href="tel:0713544101" className="text-emerald-700 font-bold hover:underline">0713 544 101 / +254 713 544 101</a>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Mail className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">General Inquiries &amp; Patient Records</span>
                  <a href="mailto:info@terralinkhealth.co.ke" className="text-sky-700 font-semibold hover:underline">info@terralinkhealth.co.ke</a>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveInfoModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-4 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Privacy &amp; Data Protection</h3>
                <p className="text-xs text-slate-500">KDPA 2019 &amp; KMPDC Health Standards</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed pt-2">
              <p>
                <strong>TERRALINK Health</strong> complies with the <strong>Kenya Data Protection Act (KDPA 2019)</strong> and the medical confidentiality guidelines mandated by the <strong>Kenya Medical Practitioners and Dentists Council (KMPDC)</strong>.
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
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-4 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#0284c7] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Terms of Service</h3>
                <p className="text-xs text-slate-500">TERRALINK Health Clinical Platform</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed pt-2">
              <p>
                By using the <strong>TERRALINK Health Digital Platform</strong>, you agree to the following terms governing digital appointments, telemedicine, and record management:
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
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
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
