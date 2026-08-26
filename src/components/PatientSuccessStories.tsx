import React, { useState } from 'react';
import { 
  Star, 
  Quote, 
  CheckCircle2, 
  Heart, 
  Calendar, 
  Award, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';

interface Testimonial {
  id: string;
  patientName: string;
  location: string;
  age: number;
  condition: string;
  department: string;
  doctorInCharge: string;
  rating: number;
  date: string;
  storyTitle: string;
  quote: string;
  fullStory: string;
  avatarUrl: string;
  outcomeBadge: string;
  treatmentType: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 'story-1',
    patientName: 'Wanjiku Mwangi',
    location: 'Nairobi (Westlands)',
    age: 31,
    condition: 'Emergency C-Section & Pre-eclampsia',
    department: 'Maternity & Neonatal Care',
    doctorInCharge: 'Dr. Sarah Wambui, Obstetrician',
    rating: 5,
    date: 'August 2026',
    storyTitle: 'Safe Delivery When Every Second Counted',
    quote: 'The emergency obstetric team reacted in under 3 minutes. Today, both baby Ethan and I are thriving.',
    fullStory: 'I was admitted late at night with severe pre-eclampsia. The rapid response from the maternity triage, automated lab testing, and compassionate nursing care saved both my life and my newborn son. The neonatal incubator facilities are truly world-class.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    outcomeBadge: '100% Full Recovery',
    treatmentType: 'Emergency Surgery & NICU'
  },
  {
    id: 'story-2',
    patientName: 'David Kipkorir',
    location: 'Eldoret / Nairobi',
    age: 54,
    condition: 'Acute Myocardial Infarction (Heart Attack)',
    department: 'Cardiology & ICU',
    doctorInCharge: 'Dr. Kipkemoi Haron & Cardiology Team',
    rating: 5,
    date: 'July 2026',
    storyTitle: 'Coronary Angioplasty within the Golden Hour',
    quote: 'From TerralinkHealth ambulance dispatch to the catheterization lab, the digital coordination was flawless.',
    fullStory: 'Sudden chest pains struck me at home. The TerralinkHealth ambulance arrived with real-time ECG transmission directly to the on-call cardiologist. By the time I arrived at the hospital, the surgical theatre was prepped. I was walking again within 48 hours.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    outcomeBadge: 'Stent Placement Success',
    treatmentType: 'Interventional Cardiology'
  },
  {
    id: 'story-3',
    patientName: 'Amina Hassan & Son Tariq',
    location: 'Mombasa / Nairobi',
    age: 28,
    condition: 'Severe Pediatric Asthma & Bronchospasm',
    department: 'Pediatric Pulmonology & Telehealth',
    doctorInCharge: 'Dr. David Kamau, Pediatrician',
    rating: 5,
    date: 'August 2026',
    storyTitle: 'Personalized Asthma Action Plan & Remote Monitoring',
    quote: 'Being able to consult our pediatrician via the patient portal whenever Tariq has wheezing gives us complete peace of mind.',
    fullStory: 'Tariq struggled with recurrent hospitalizations until TerralinkHealth mapped his triggers, provided aerosol therapy, and linked his digital health record so we could order prescriptions and review spirometry tests directly from home.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    outcomeBadge: 'Zero ER Admissions Since Care',
    treatmentType: 'Pediatric Care & E-Prescription'
  },
  {
    id: 'story-4',
    patientName: 'Peter Ochieng',
    location: 'Kisumu / Nairobi',
    age: 42,
    condition: 'Complex ACL & Meniscal Tear (Sports Injury)',
    department: 'Orthopedic Surgery & Rehabilitation',
    doctorInCharge: 'Dr. Mercy Chebet, Orthopedic Surgeon',
    rating: 5,
    date: 'June 2026',
    storyTitle: 'Back on the Pitch After Arthroscopic Reconstruction',
    quote: 'The advanced orthopedic theatre combined with in-house physiotherapy helped me regain 100% knee stability.',
    fullStory: 'After a severe football injury, I feared my active days were over. Dr. Chebet performed keyhole arthroscopy with minimal scarring. The digital rehabilitation tracking in the patient portal guided my daily recovery milestones.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    outcomeBadge: 'Full Mobility Restored',
    treatmentType: 'Arthroscopic Reconstruction'
  },
  {
    id: 'story-5',
    patientName: 'Grace Muthoni',
    location: 'Kiambu County',
    age: 49,
    condition: 'Chronic Kidney Disease (Stage 4)',
    department: 'Renal Unit & Dialysis Center',
    doctorInCharge: 'Dr. Grace Njeri, Nephrologist',
    rating: 5,
    date: 'August 2026',
    storyTitle: 'Dignified, Seamless Hemodialysis with SHIF Coverage',
    quote: 'The automated billing seamlessly cleared through the Social Health Insurance Fund (SHIF) with zero out-of-pocket hassle.',
    fullStory: 'The hemodialysis suite is clean, modern, and staffed by experienced renal nurses. My lab kidney function markers are uploaded automatically to my profile within an hour of testing. It has given me my vitality back.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    outcomeBadge: 'Stable Renal Function',
    treatmentType: 'Hemodialysis & SHIF Covered'
  },
  {
    id: 'story-6',
    patientName: 'Brian Otieno',
    location: 'Nakuru / Nairobi Highway',
    age: 36,
    condition: 'Multiple Trauma & Fracture Stabilization',
    department: 'Accident & Emergency (A&E) Trauma Center',
    doctorInCharge: 'A&E Trauma Team',
    rating: 5,
    date: 'July 2026',
    storyTitle: 'Emergency Highway Rescue & Critical Care HDU',
    quote: 'The trauma resuscitation team operated with precision. They stabilized my internal bleeding in record time.',
    fullStory: 'Following a road traffic accident, the TerralinkHealth paramedic crew dispatched immediately with advanced life support. The seamless handoff to the emergency CT scan and HDU ward saved my limbs and my life.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    outcomeBadge: 'Complete Trauma Recovery',
    treatmentType: 'Advanced Trauma Life Support'
  },
  {
    id: 'story-7',
    patientName: 'Dr. Faith Chebet',
    location: 'Nairobi (Kilimani)',
    age: 45,
    condition: 'Early-Stage Thyroid Nodule (Routine Screening)',
    department: 'Radiology, Imaging & Wellness Center',
    doctorInCharge: 'Dr. John Kibet, Radiologist',
    rating: 5,
    date: 'August 2026',
    storyTitle: 'Early Detection That Changed Everything',
    quote: 'The high-resolution ultrasound and AI-assisted thyroid biopsy detected the micro-nodule at stage 0.',
    fullStory: 'I visited for an executive health checkup. The comprehensive wellness panel and same-day ultrasound imaging identified a small asymptomatic nodule. Because it was caught so early, minimally invasive outpatient treatment cured it completely.',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80',
    outcomeBadge: 'Curative Early Intervention',
    treatmentType: 'High-Res Ultrasound & Biopsy'
  },
  {
    id: 'story-8',
    patientName: 'Samuel Njoroge',
    location: 'Nyeri / Nairobi',
    age: 58,
    condition: 'Gallbladder Cholecystitis & Stones',
    department: 'Minimally Invasive Laparoscopic Surgery',
    doctorInCharge: 'Dr. Mercy Chebet, General Surgeon',
    rating: 5,
    date: 'June 2026',
    storyTitle: 'Discharged in 24 Hours After Laparoscopic Surgery',
    quote: 'I had virtually no post-operative pain and was able to return to my farming business within four days.',
    fullStory: 'Suffering from chronic severe abdominal pain, Dr. Chebet recommended laparoscopic cholecystectomy. The procedure took only 45 minutes through 3 tiny incisions. The hospital ward cleanliness and attentive nursing were second to none.',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
    outcomeBadge: 'Discharged within 24 Hours',
    treatmentType: 'Laparoscopic Cholecystectomy'
  },
  {
    id: 'story-9',
    patientName: 'Mary Wambui',
    location: 'Machakos County',
    age: 62,
    condition: 'Type 2 Diabetes & Neuropathic Foot Care',
    department: 'Endocrinology & Diabetic Foot Clinic',
    doctorInCharge: 'Dr. David Kamau, Physician',
    rating: 5,
    date: 'May 2026',
    storyTitle: 'Preventing Amputation Through Advanced Wound Care',
    quote: 'The hyperbaric wound management and nutritional counseling completely healed my diabetic ulcer in 6 weeks.',
    fullStory: 'Other clinics suggested surgical debridement or partial amputation. The specialist endocrinology team at TerralinkHealth implemented specialized dressings, glycemic control, and weekly tele-consultations that fully healed the tissue.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    outcomeBadge: '100% Wound Healing',
    treatmentType: 'Advanced Wound Bio-Therapy'
  },
  {
    id: 'story-10',
    patientName: 'Emmanuel Kiprono',
    location: 'Bomet / Nairobi',
    age: 26,
    condition: 'Severe Pneumonia & Respiratory Failure',
    department: 'High Dependency Unit (HDU) & Pulmonology',
    doctorInCharge: 'Critical Care Medical Staff',
    rating: 5,
    date: 'July 2026',
    storyTitle: 'Weaned Off Oxygen in 5 Days with Intensive Therapy',
    quote: 'The continuous arterial blood gas monitoring and dedicated nurses kept me alive and motivated every hour.',
    fullStory: 'A virulent chest infection led to sudden respiratory distress. Admitted straight into the HDU with high-flow oxygen and targeted IV antibiotics, I felt safe under the constant supervision of the medical team. I am now back to full endurance training.',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    outcomeBadge: 'Full Pulmonary Recovery',
    treatmentType: 'High-Flow Oxygen & HDU'
  }
];

export const PatientSuccessStories: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedStory, setSelectedStory] = useState<Testimonial | null>(null);

  const nextStory = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevStory = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <section id="patient-stories" className="py-16 bg-gradient-to-b from-slate-50 via-teal-50/30 to-white relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold tracking-wide border border-teal-200 shadow-xs">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>PATIENT SUCCESS STORIES & CLINICAL OUTCOMES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Real Lives Transformed Through Modern Medicine
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Read authentic testimonials from patients across Kenya who received compassionate, emergency, surgical, and chronic care at TerralinkHealth Hospital.
          </p>
        </div>

        {/* Featured Story Carousel Spotlight */}
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl border border-white p-6 sm:p-10 shadow-xl shadow-slate-200/60 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Avatar & Patient Identity */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
              <div className="relative">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-xl shadow-teal-900/10">
                  <img
                    src={current.avatarUrl}
                    alt={current.patientName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-2xl shadow-lg border-2 border-white">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center justify-center lg:justify-start space-x-2">
                  <span>{current.patientName}</span>
                  <span className="text-xs font-normal text-slate-500">({current.age} yrs)</span>
                </h3>
                <p className="text-xs text-teal-700 font-semibold mt-0.5">{current.location}</p>
                <div className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[11px] font-bold border border-emerald-200">
                  {current.outcomeBadge}
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 w-full space-y-1.5 text-xs text-left">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Department:</span>
                  <strong className="text-slate-800">{current.department}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Lead Specialist:</span>
                  <strong className="text-teal-800">{current.doctorInCharge}</strong>
                </div>
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Care Type:</span>
                  <span className="font-mono text-slate-700">{current.treatmentType}</span>
                </div>
              </div>
            </div>

            {/* Right: Story Quote & Full Testimonial */}
            <div className="lg:col-span-7 space-y-5">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">5.0 Verified Medical Review</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{current.date}</span>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  "{current.storyTitle}"
                </h4>
                <div className="relative pl-6 border-l-4 border-teal-500 italic text-slate-700 text-sm sm:text-base leading-relaxed bg-teal-50/40 p-4 rounded-r-2xl">
                  <Quote className="w-5 h-5 text-teal-400 absolute -top-2 left-2 rotate-180 opacity-50" />
                  {current.quote}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
                  {current.fullStory}
                </p>
              </div>

              {/* Navigation Arrows */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-500">
                  Story <strong className="text-teal-800">{currentIndex + 1}</strong> of <strong>{TESTIMONIALS.length}</strong>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevStory}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 transition-colors cursor-pointer"
                    aria-label="Previous story"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextStory}
                    className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-colors cursor-pointer"
                    aria-label="Next story"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 10 Stories Thumbnail Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Browse All 10 Patient Success Profiles</span>
            </h3>
            <span className="text-xs text-slate-500">Click any patient to view their clinical journey</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
            {TESTIMONIALS.map((story, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <div
                  key={story.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer text-left space-y-2 flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-teal-900 text-white border-teal-800 shadow-lg shadow-teal-950/20 scale-[1.02]' 
                      : 'bg-white/80 hover:bg-white text-slate-800 border-slate-200/80 hover:border-teal-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={story.avatarUrl}
                      alt={story.patientName}
                      className="w-10 h-10 rounded-xl object-cover border border-white/50 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h5 className={`font-bold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {story.patientName}
                      </h5>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-teal-200' : 'text-slate-500'}`}>
                        {story.department}
                      </p>
                    </div>
                  </div>

                  <p className={`text-[11px] line-clamp-2 italic leading-tight ${isSelected ? 'text-slate-200' : 'text-slate-600'}`}>
                    "{story.storyTitle}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-current/10 text-[10px]">
                    <span className={`font-semibold ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      {story.outcomeBadge.split(' ')[0]} Verified
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hospital Quality Assurance Ribbon */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base">Kenya Medical Practitioners & Dentists Council (KMPDC) Certified</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Every patient experience is monitored under rigorous clinical clinical governance and patient rights protocols.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="text-right">
              <div className="text-2xl font-black text-emerald-400 font-mono">99.4%</div>
              <div className="text-[10px] text-slate-400">Patient Satisfaction Score</div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="text-right">
              <div className="text-2xl font-black text-teal-400 font-mono">14,200+</div>
              <div className="text-[10px] text-slate-400">Annual Recoveries</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
