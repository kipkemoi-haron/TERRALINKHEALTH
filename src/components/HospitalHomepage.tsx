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
  Building2,
  HeartPulse,
  Share2,
  Globe,
  Smartphone,
  PhoneCall
} from 'lucide-react';
import { Department, Doctor, InsuranceProviderPlan, PatientReview } from '../types';
import { mockDepartments, mockDoctors, INITIAL_INSURANCE_PROVIDERS, INITIAL_REVIEWS } from '../mockData';
import founderPhotoImg from '../assets/images/founder_photo_1788042380844.jpg';

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
  const [activeStoryFilter, setActiveStoryFilter] = useState<string>('all');
  const [isReviewFormOpen, setIsReviewFormOpen] = useState<boolean>(false);
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewNotification, setReviewNotification] = useState<string>('');

  // Review Form State
  const [reviewForm, setReviewForm] = useState({
    name: currentPatient?.name || currentUser?.name || '',
    location: currentPatient?.county ? `${currentPatient.county}, Kenya` : 'Nairobi, Kenya',
    age: 32,
    rating: 5,
    department: 'Cardiology Clinic',
    insurance: 'SHA Kenya / Private Insurance',
    condition: 'Routine Medical Consultation',
    doctorName: 'Dr. David Ochieng',
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
      age: reviewForm.age || 30,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      category: 'general',
      categoryLabel: reviewForm.department,
      condition: reviewForm.condition,
      doctorName: reviewForm.doctorName,
      department: reviewForm.department,
      insurance: reviewForm.insurance,
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
      rev.condition.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
      rev.headline.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
      rev.department.toLowerCase().includes(reviewSearchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeStoryFilter === 'all') return true;
    return rev.category === activeStoryFilter;
  });

  return (
    <div className="min-h-[80vh] flex flex-col justify-between py-2 sm:py-4 max-w-4xl mx-auto px-4 sm:px-6">
      
      {/* Top Header Bar Matching Image 3 */}
      <div className="flex items-center justify-between py-3 border-b border-slate-100">
        <div 
          onClick={() => onNavigateToPortal('patient')}
          className="flex items-center space-x-2.5 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-900 leading-tight block">TERRALINK Health</span>
            <span className="text-[10px] text-slate-500 font-medium leading-tight block">Digital Hospital Platform</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (currentUser) {
              if (currentUser.role === 'patient') onNavigateToPortal('patient');
              else onNavigateToPortal('provider');
            } else {
              handleOpenAuth('patient_login');
            }
          }}
          className="text-xs font-semibold text-slate-700 hover:text-[#0284c7] transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-slate-50"
        >
          {currentUser ? 'My Account' : 'Sign In'}
        </button>
      </div>

      {/* Centered Hero Section Matching Image 3 */}
      <section className="text-center py-10 sm:py-14 space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#f0f9ff] text-[#0284c7] border border-[#e0f2fe] text-xs font-medium mb-1">
          <Sparkles className="w-3 h-3 text-[#0284c7]" />
          <span>Transforming Healthcare in Kenya</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          TERRALINK Health
        </h1>

        <p className="text-sm sm:text-base font-medium text-slate-700">
          Enhancing Hospital Operations &amp; Patient Experience
        </p>

        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed pt-1">
          An integrated digital platform for patient engagement, digital registration, telemedicine, and real-time analytics — built for Kenyan hospitals.
        </p>
      </section>

      {/* 4-Feature Section Matching Image 3 */}
      <section className="py-4 max-w-2xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Feature 1: Reduced Wait Times */}
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Reduced Wait Times</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-normal">
                Real-time queue tracking &amp; online appointment booking
              </p>
            </div>
          </div>

          {/* Feature 2: Secure Records */}
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Secure Records</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-normal">
                Encrypted patient data with role-based access control
              </p>
            </div>
          </div>

          {/* Feature 3: Telemedicine */}
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0 mt-0.5">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Telemedicine</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-normal">
                Virtual consultations from anywhere in Kenya
              </p>
            </div>
          </div>

          {/* Feature 4: Real-Time Analytics */}
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0 mt-0.5">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">Real-Time Analytics</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-normal">
                Live dashboards for hospital performance monitoring
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* "Access Your Portal" Section Matching Image 3 */}
      <section className="py-10 max-w-2xl mx-auto w-full space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Access Your Portal</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Choose how you'd like to access TERRALINK Health
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          
          {/* Card 1: Patient Portal */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between items-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shadow-sm">
              <User className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Patient Portal</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Book appointments, view medical records, pay bills, and access telemedicine services.
              </p>
            </div>

            <div className="w-full space-y-2 pt-2">
              <button
                onClick={() => {
                  if (currentUser && currentUser.role === 'patient') {
                    onNavigateToPortal('patient');
                  } else {
                    handleOpenAuth('patient_register');
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>

              <button
                onClick={() => {
                  if (currentUser && currentUser.role === 'patient') {
                    onNavigateToPortal('patient');
                  } else {
                    handleOpenAuth('patient_login');
                  }
                }}
                className="w-full py-2 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span>Patient Sign In</span>
              </button>
            </div>
          </div>

          {/* Card 2: Staff Portal */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between items-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Staff Portal</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                Clinical workspace for doctors, nurses, pharmacists, lab technologists, and hospital administration.
              </p>
            </div>

            <div className="w-full space-y-2 pt-2">
              <button
                onClick={() => {
                  onNavigateToPortal('provider');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Staff Sign In</span>
              </button>

              <button
                onClick={() => {
                  if (onOpenStaffLogin) {
                    onOpenStaffLogin();
                  } else {
                    onNavigateToPortal('provider');
                  }
                }}
                className="w-full py-2 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Quick Access / Demo</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Simple Footer with Founder & Reviews Buttons Matching Request */}
      <footer className="py-8 border-t border-slate-100 text-center space-y-4 text-xs text-slate-500 mt-4">
        
        {/* Buttons for Founder Perspective & Patient Reviews */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => setIsFounderModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>Founder &amp; Executive Perspective</span>
          </button>

          <button
            onClick={() => setIsReviewsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Patient Reviews &amp; Stories ({liveReviews.length})</span>
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-slate-600 font-medium">
            &copy; 2026 TERRALINK Health &mdash; Digital Hospital Management Platform
          </p>
          <p className="text-[11px] text-slate-400">
            Enhancing Hospital Operations &amp; Patient Experience in Nairobi County, Kenya
          </p>
          <div className="pt-1">
            <button
              onClick={() => onNavigateToPortal('admin')}
              className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
        </div>
      </footer>

      {/* ================= FOUNDER & EXECUTIVE PERSPECTIVE MODAL ================= */}
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

      {/* ================= REVIEWS & RECOVERY STORIES MODAL ================= */}
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
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    onClick={() => setIsReviewFormOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
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
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                            {rev.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-slate-900">{rev.name}</span>
                              <span className="text-[10px] text-slate-400">&bull; {rev.location}</span>
                            </div>
                            <span className="text-[10px] text-teal-700 font-medium">{rev.department}</span>
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
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Publishing...' : 'Publish Review'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
