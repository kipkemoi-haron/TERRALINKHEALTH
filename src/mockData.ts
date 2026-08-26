import {
  Department,
  Doctor,
  PatientProfile,
  Appointment,
  ClinicalEncounter,
  Prescription,
  LabOrder,
  RadiologyOrder,
  ImmunizationRecord,
  Invoice,
  MpesaPayment,
  AuditLog,
  SystemPricing,
  HospitalAnalytics,
  HospitalSocialLinks,
  InsuranceProviderPlan,
  PatientInsurancePolicy,
  User,
  HospitalBed,
  AmbulanceUnit,
  HospitalServiceItem,
  EmergencyStatusOverview
} from './types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-opd',
    name: 'Outpatient Department (OPD)',
    code: 'OPD',
    category: 'Clinical',
    description: 'Primary general healthcare consultations, triage, and rapid outpatient diagnosis.',
    headOfDepartment: 'Dr. Amina Hassan, MBChB, MMed',
    location: 'Ground Floor, Block A',
    consultationFeeKES: 1500,
    currentQueueLength: 8,
    avgWaitTimeMinutes: 24,
    isOpen24Hours: true,
    operatingHours: '24 Hours Daily'
  },
  {
    id: 'dept-ae',
    name: 'Accident & Emergency (A&E)',
    code: 'A&E',
    category: 'Critical Care',
    description: 'Emergency trauma, acute resuscitation, and rapid clinical stabilization.',
    headOfDepartment: 'Dr. Joseph Karanja, MBChB, Emergency Med',
    location: 'Ground Floor, Emergency Wing',
    consultationFeeKES: 2500,
    currentQueueLength: 4,
    avgWaitTimeMinutes: 10,
    totalBeds: 24,
    occupiedBeds: 18,
    isOpen24Hours: true,
    operatingHours: '24 Hours Daily'
  },
  {
    id: 'dept-pediatrics',
    name: 'Pediatrics & Child Health',
    code: 'PED',
    category: 'Clinical',
    description: 'Comprehensive newborn, infant, and adolescent medical care and developmental tracking.',
    headOfDepartment: 'Dr. Sarah Odhiambo, MBChB, MMed (Peds)',
    location: '1st Floor, Mother & Child Center',
    consultationFeeKES: 2800,
    currentQueueLength: 3,
    avgWaitTimeMinutes: 15,
    totalBeds: 35,
    occupiedBeds: 22,
    isOpen24Hours: false,
    operatingHours: 'Mon - Sat: 08:00 AM - 06:00 PM (Sun Closed)'
  },
  {
    id: 'dept-obgyn',
    name: 'Obstetrics & Gynecology (Maternity)',
    code: 'OBGYN',
    category: 'Clinical',
    description: 'Antenatal care, high-risk pregnancy management, labor & delivery suites, and reproductive health.',
    headOfDepartment: 'Dr. Grace Wanjiku, MBChB, MMed (Obs/Gyn)',
    location: '2nd Floor, Wing B',
    consultationFeeKES: 3000,
    currentQueueLength: 5,
    avgWaitTimeMinutes: 20,
    totalBeds: 40,
    occupiedBeds: 31,
    isOpen24Hours: true,
    operatingHours: '24 Hours Daily'
  },
  {
    id: 'dept-cardiology',
    name: 'Cardiology Clinic',
    code: 'CARD',
    category: 'Clinical',
    description: 'Cardiovascular assessments, echocardiography, stress ECG, and hypertension management.',
    headOfDepartment: 'Dr. Kevin Omondi, MBChB, FACC, Cardiology',
    location: '3rd Floor, Specialist Clinics',
    consultationFeeKES: 3500,
    currentQueueLength: 2,
    avgWaitTimeMinutes: 12,
    isOpen24Hours: false,
    operatingHours: 'Mon - Sat: 08:30 AM - 05:00 PM (Sun Closed)'
  },
  {
    id: 'dept-orthopedics',
    name: 'Orthopedic Surgery & Trauma',
    code: 'ORTHO',
    category: 'Surgical',
    description: 'Musculoskeletal surgery, joint replacement, fracture reductions, and sports medicine.',
    headOfDepartment: 'Dr. Samuel Kiprop, MBChB, MMed (Ortho)',
    location: '2nd Floor, Surgical Suite',
    consultationFeeKES: 3200,
    currentQueueLength: 4,
    avgWaitTimeMinutes: 25,
    totalBeds: 28,
    occupiedBeds: 20,
    isOpen24Hours: false,
    operatingHours: 'Mon - Sat: 08:00 AM - 05:30 PM (Sun Closed)'
  },
  {
    id: 'dept-internal-med',
    name: 'Internal Medicine',
    code: 'IM',
    category: 'Clinical',
    description: 'Adult chronic disease management, diabetes mellitus, infectious illnesses, and nephrology triage.',
    headOfDepartment: 'Dr. Patrick Njoroge, MBChB, MMed (Int Med)',
    location: '3rd Floor, Specialist Wing',
    consultationFeeKES: 3000,
    currentQueueLength: 6,
    avgWaitTimeMinutes: 28,
    isOpen24Hours: false,
    operatingHours: 'Mon - Sat: 08:00 AM - 05:00 PM (Sun Closed)'
  },
  {
    id: 'dept-dental',
    name: 'Dental & Maxillofacial Clinic',
    code: 'DENT',
    category: 'Therapeutic',
    description: 'Orthodontics, restorative dental surgeries, periodontics, and oral hygiene procedures.',
    headOfDepartment: 'Dr. Vivian Cherono, BDS',
    location: 'Ground Floor, Specialist Annex',
    consultationFeeKES: 2000,
    currentQueueLength: 3,
    avgWaitTimeMinutes: 18,
    isOpen24Hours: false,
    operatingHours: 'Mon - Sat: 08:30 AM - 05:00 PM (Sun Closed)'
  },
  {
    id: 'dept-ophthalmology',
    name: 'Ophthalmology (Eye Clinic)',
    code: 'EYE',
    category: 'Clinical',
    description: 'Vision refraction, cataract surgery, glaucoma management, and pediatric ophthalmology.',
    headOfDepartment: 'Dr. Elijah Maina, MBChB, MMed (Ophth)',
    location: '1st Floor, Clinic Wing C',
    consultationFeeKES: 2500,
    currentQueueLength: 5,
    avgWaitTimeMinutes: 22,
    isOpen24Hours: false,
    operatingHours: 'Mon - Sat: 08:00 AM - 04:30 PM (Sun Closed)'
  },
  {
    id: 'dept-ent',
    name: 'Ear, Nose & Throat (ENT)',
    code: 'ENT',
    category: 'Surgical',
    description: 'Audiology evaluations, sinus surgeries, head and neck clinical consultations.',
    headOfDepartment: 'Dr. Mercy Achieng, MBChB, MMed (ENT)',
    location: '1st Floor, Wing C',
    consultationFeeKES: 2800,
    currentQueueLength: 2,
    avgWaitTimeMinutes: 14,
    isOpen24Hours: false,
    operatingHours: 'Mon - Sat: 08:30 AM - 04:30 PM (Sun Closed)'
  },
  {
    id: 'dept-general-surgery',
    name: 'General Surgery',
    code: 'SURG',
    category: 'Surgical',
    description: 'Elective and emergency abdominal, laparoscopic, and soft tissue surgeries.',
    headOfDepartment: 'Dr. David Mutua, MBChB, FCS (ECSA)',
    location: '2nd Floor, Theatres Block',
    consultationFeeKES: 3500,
    currentQueueLength: 3,
    avgWaitTimeMinutes: 19,
    isOpen24Hours: false,
    operatingHours: 'Mon - Sat: 08:00 AM - 05:00 PM (Sun Closed)'
  },
  {
    id: 'dept-lab',
    name: 'Medical Laboratory & Blood Bank',
    code: 'LAB',
    category: 'Diagnostic',
    description: 'Clinical biochemistry, hematology, microbiology, histopathology, PCR, and blood transfusion services.',
    headOfDepartment: 'Mr. Dennis Kipkoech, Chief Lab Scientist',
    location: 'Ground Floor, Diagnostic Center',
    consultationFeeKES: 0,
    currentQueueLength: 5,
    avgWaitTimeMinutes: 12,
    isOpen24Hours: true,
    operatingHours: '24 Hours Daily'
  },
  {
    id: 'dept-radiology',
    name: 'Radiology & Medical Imaging',
    code: 'RAD',
    category: 'Diagnostic',
    description: 'Digital X-Ray, Multi-Slice CT Scanner, 1.5T MRI, 4D Doppler Ultrasound, and Fluoroscopy.',
    headOfDepartment: 'Dr. Miriam Wangari, MBChB, MMed (Rad)',
    location: 'Ground Floor, Diagnostic Center',
    consultationFeeKES: 0,
    currentQueueLength: 4,
    avgWaitTimeMinutes: 15,
    isOpen24Hours: true,
    operatingHours: '24 Hours Daily'
  },
  {
    id: 'dept-pharmacy',
    name: 'Pharmacy & Drug Dispensing',
    code: 'PHARM',
    category: 'Diagnostic',
    description: 'Automated prescription verification, inpatient drug rounds, clinical compounding, and patient counseling.',
    headOfDepartment: 'Pharm. Lucy Njeri, BPharm',
    location: 'Ground Floor, Central Concourse',
    consultationFeeKES: 0,
    currentQueueLength: 7,
    avgWaitTimeMinutes: 8,
    isOpen24Hours: true,
    operatingHours: '24 Hours Daily'
  },
  {
    id: 'dept-icu',
    name: 'Intensive Care Unit (ICU) & HDU',
    code: 'ICU',
    category: 'Critical Care',
    description: 'High-dependency mechanical ventilation, continuous hemodynamic monitoring, and neuro-critical care.',
    headOfDepartment: 'Dr. Raymond Koech, Critical Care Specialist',
    location: '4th Floor, Critical Care Tower',
    consultationFeeKES: 5000,
    currentQueueLength: 1,
    avgWaitTimeMinutes: 5,
    totalBeds: 16,
    occupiedBeds: 13,
    isOpen24Hours: true,
    operatingHours: '24 Hours Daily'
  },
  {
    id: 'dept-oncology',
    name: 'Oncology & Chemotherapy Center',
    code: 'ONCO',
    category: 'Therapeutic',
    description: 'Medical oncology, infusion chemotherapy, radiation therapy coordination, and cancer screening.',
    headOfDepartment: 'Dr. Esther Muthoni, MBChB, MMed (Onc)',
    location: '5th Floor, Cancer Center',
    consultationFeeKES: 4000,
    currentQueueLength: 2,
    avgWaitTimeMinutes: 16,
    totalBeds: 20,
    occupiedBeds: 14,
    isOpen24Hours: false,
    operatingHours: 'Mon - Sat: 08:00 AM - 05:00 PM (Sun Closed)'
  },
  {
    id: 'dept-physiotherapy',
    name: 'Physiotherapy & Rehabilitation',
    code: 'PHYSIO',
    category: 'Therapeutic',
    description: 'Post-stroke rehab, sports injury recovery, orthopedic mobility training, and occupational therapy.',
    headOfDepartment: 'Mrs. Janet Kimani, Lead Physiotherapist',
    location: 'Lower Ground Floor, Wellness Center',
    consultationFeeKES: 2000,
    currentQueueLength: 3,
    avgWaitTimeMinutes: 15,
    isOpen24Hours: false,
    operatingHours: 'Mon - Sat: 08:00 AM - 05:00 PM (Sun Closed)'
  },
  {
    id: 'dept-dialysis',
    name: 'Renal Dialysis Unit',
    code: 'RENAL',
    category: 'Therapeutic',
    description: 'Hemodialysis, peritoneal dialysis support, and chronic kidney disease stage management.',
    headOfDepartment: 'Dr. George Onyango, Consultant Nephrologist',
    location: '3rd Floor, Renal Wing',
    consultationFeeKES: 3500,
    currentQueueLength: 2,
    avgWaitTimeMinutes: 10,
    totalBeds: 12,
    occupiedBeds: 10,
    isOpen24Hours: true,
    operatingHours: '24 Hours Daily (Sessions Mon - Sat)'
  },
  {
    id: 'dept-psychiatry',
    name: 'Mental Health & Psychiatry',
    code: 'PSYCH',
    category: 'Clinical',
    description: 'Clinical psychiatry, psychological counseling, addiction recovery, and adolescent mental wellness.',
    headOfDepartment: 'Dr. Catherine Mburu, MBChB, MMed (Psych)',
    location: '4th Floor, Wellness Annex',
    consultationFeeKES: 3000,
    currentQueueLength: 1,
    avgWaitTimeMinutes: 10,
    isOpen24Hours: false,
    operatingHours: 'Mon - Sat: 08:30 AM - 05:00 PM (Sun Closed)'
  },
  {
    id: 'dept-nutrition',
    name: 'Nutrition & Dietetics',
    code: 'NUTR',
    category: 'Therapeutic',
    description: 'Clinical diet counseling, diabetic meal planning, pediatric malnutrition rehabilitation.',
    headOfDepartment: 'Ms. Faith Jebet, Registered Clinical Dietitian',
    location: '1st Floor, OPD Annex',
    consultationFeeKES: 1500,
    currentQueueLength: 2,
    avgWaitTimeMinutes: 12,
    isOpen24Hours: false,
    operatingHours: 'Mon - Sat: 08:00 AM - 04:30 PM (Sun Closed)'
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    userId: 'usr-doc-1',
    name: 'Dr. Sarah Odhiambo',
    title: 'Consultant Pediatrician',
    departmentId: 'dept-pediatrics',
    departmentName: 'Pediatrics & Child Health',
    specialization: 'General Pediatrics, Neonatal Care & Pediatric Pulmonology',
    qualifications: 'MBChB (UoN), MMed Pediatrics (Aga Khan University Hospital), Fellow KPA',
    licenseNumber: 'KMPDC-A67291',
    experienceYears: 14,
    consultationFeeKES: 2800,
    telemedicineAvailable: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableHours: '08:30 AM - 04:30 PM',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'doc-2',
    userId: 'usr-doc-2',
    name: 'Dr. Kevin Omondi',
    title: 'Senior Consultant Cardiologist',
    departmentId: 'dept-cardiology',
    departmentName: 'Cardiology Clinic',
    specialization: 'Interventional Cardiology, Echocardiography & Heart Failure',
    qualifications: 'MBChB (Moi), MMed Int Med (UoN), Fellowship in Cardiology (Univ. of Cape Town), FACC',
    licenseNumber: 'KMPDC-A44182',
    experienceYears: 18,
    consultationFeeKES: 3500,
    telemedicineAvailable: true,
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    availableHours: '09:00 AM - 05:00 PM',
    rating: 5.0,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'doc-3',
    userId: 'usr-doc-3',
    name: 'Dr. Amina Hassan',
    title: 'Chief Medical Officer / OPD Lead',
    departmentId: 'dept-opd',
    departmentName: 'Outpatient Department (OPD)',
    specialization: 'General Family Medicine, Acute Outpatient Care & Preventative Health',
    qualifications: 'MBChB (UoN), Dip Tropical Medicine, MMed Family Medicine',
    licenseNumber: 'KMPDC-A55319',
    experienceYears: 12,
    consultationFeeKES: 1500,
    telemedicineAvailable: true,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableHours: '08:00 AM - 06:00 PM',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1594824813689-5309836371cf?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'doc-4',
    userId: 'usr-doc-4',
    name: 'Dr. Samuel Kiprop',
    title: 'Consultant Orthopedic Surgeon',
    departmentId: 'dept-orthopedics',
    departmentName: 'Orthopedic Surgery & Trauma',
    specialization: 'Trauma Reconstruction, Arthroscopy & Joint Replacement',
    qualifications: 'MBChB (UoN), MMed Orthopedic Surgery (UoN), FCS Orth (COSECSA)',
    licenseNumber: 'KMPDC-A38902',
    experienceYears: 16,
    consultationFeeKES: 3200,
    telemedicineAvailable: true,
    availableDays: ['Tue', 'Wed', 'Thu', 'Sat'],
    availableHours: '08:30 AM - 04:00 PM',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'doc-5',
    userId: 'usr-doc-5',
    name: 'Dr. Grace Wanjiku',
    title: 'Consultant Obstetrician & Gynecologist',
    departmentId: 'dept-obgyn',
    departmentName: 'Obstetrics & Gynecology (Maternity)',
    specialization: 'High-Risk Maternal Health, Laparoscopic Surgery & Fertility Management',
    qualifications: 'MBChB (Makerere), MMed Obs/Gyn (UoN), MRCOG (UK)',
    licenseNumber: 'KMPDC-A52881',
    experienceYears: 15,
    consultationFeeKES: 3000,
    telemedicineAvailable: true,
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    availableHours: '08:00 AM - 05:00 PM',
    rating: 4.95,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'doc-6',
    userId: 'usr-doc-6',
    name: 'Dr. Joseph Karanja',
    title: 'Emergency Medicine Specialist',
    departmentId: 'dept-ae',
    departmentName: 'Accident & Emergency (A&E)',
    specialization: 'Acute Resuscitation, Trauma Care & Disaster Management',
    qualifications: 'MBChB (UoN), Dip Emergency Care, MMed Emergency Med',
    licenseNumber: 'KMPDC-A70211',
    experienceYears: 11,
    consultationFeeKES: 2500,
    telemedicineAvailable: false,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableHours: '24 Hours Emergency Roster',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Kipkemoi Haron',
    email: 'kipkemoiharon57@gmail.com',
    phone: '+254712345678',
    role: 'admin',
    mustChangePassword: false,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'usr-admin-2',
    name: 'Kipkemoi Haron',
    email: 'kipkemoiharon4@gmail.com',
    phone: '+254722998877',
    role: 'admin',
    mustChangePassword: false,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'usr-doc-1',
    name: 'Dr. Sarah Odhiambo',
    email: 'sarah.odhiambo@terralinkhealth.co.ke',
    phone: '+254722334455',
    role: 'doctor',
    departmentId: 'dept-pediatrics',
    departmentName: 'Pediatrics & Child Health',
    specialization: 'Pediatric Pulmonology & Neonatology',
    licenseNumber: 'KMPDC-A67291',
    mustChangePassword: false,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'usr-doc-2',
    name: 'Dr. Kevin Omondi',
    email: 'kevin.omondi@terralinkhealth.co.ke',
    phone: '+254733445566',
    role: 'doctor',
    departmentId: 'dept-cardiology',
    departmentName: 'Cardiology Clinic',
    specialization: 'Interventional Cardiology',
    licenseNumber: 'KMPDC-A44182',
    mustChangePassword: false,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'usr-doc-3',
    name: 'Dr. Amina Hassan',
    email: 'amina.hassan@terralinkhealth.co.ke',
    phone: '+254720987654',
    role: 'doctor',
    departmentId: 'dept-opd',
    departmentName: 'Outpatient Department (OPD)',
    specialization: 'Family Medicine',
    licenseNumber: 'KMPDC-A55319',
    mustChangePassword: false,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1594824813689-5309836371cf?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'usr-lab-1',
    name: 'Mr. Dennis Kipkoech',
    email: 'lab.tech@terralinkhealth.co.ke',
    phone: '+254728112233',
    role: 'lab_tech',
    departmentId: 'dept-lab',
    departmentName: 'Medical Laboratory & Blood Bank',
    specialization: 'Clinical Biochemistry & Molecular Diagnostics',
    licenseNumber: 'KMLTTB-88219',
    mustChangePassword: false,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'usr-rad-1',
    name: 'Dr. Miriam Wangari',
    email: 'radiology@terralinkhealth.co.ke',
    phone: '+254729443322',
    role: 'radiologist',
    departmentId: 'dept-radiology',
    departmentName: 'Radiology & Medical Imaging',
    specialization: 'Diagnostic Radiology & CT/MRI reporting',
    licenseNumber: 'KMPDC-A99014',
    mustChangePassword: false,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'usr-pharm-1',
    name: 'Pharm. Lucy Njeri',
    email: 'pharmacy@terralinkhealth.co.ke',
    phone: '+254721556677',
    role: 'pharmacist',
    departmentId: 'dept-pharmacy',
    departmentName: 'Pharmacy & Drug Dispensing',
    specialization: 'Clinical Pharmacotherapy & Drug Regimen Reviews',
    licenseNumber: 'PPB-74312',
    mustChangePassword: false,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-01-20T10:00:00Z'
  },
  {
    id: 'usr-nurse-1',
    name: 'Nurse Faith Chepkorir',
    email: 'nurse.faith@terralinkhealth.co.ke',
    phone: '+254723118899',
    role: 'nurse',
    departmentId: 'dept-opd',
    departmentName: 'Outpatient Department (OPD)',
    specialization: 'Triage & Clinical Nursing Care',
    licenseNumber: 'NCK-54192',
    mustChangePassword: false,
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-01-22T08:00:00Z'
  },
  {
    id: 'usr-pat-1',
    name: 'Faith Chebet Koech',
    email: 'faith.chebet@gmail.com',
    phone: '+254712345678',
    nationalId: '32849102',
    role: 'patient',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    createdAt: '2026-02-01T14:30:00Z'
  }
];

export const INITIAL_PATIENT_PROFILES: PatientProfile[] = [
  {
    id: 'pat-1',
    userId: 'usr-pat-1',
    name: 'Faith Chebet Koech',
    email: 'faith.chebet@gmail.com',
    phone: '+254712345678',
    nationalId: '32849102',
    dob: '1994-06-18',
    gender: 'Female',
    bloodGroup: 'O+',
    address: 'Apartment 4B, Kilimani, Nairobi',
    county: 'Nairobi County',
    emergencyContact: {
      name: 'Collins Kiprono (Spouse)',
      relationship: 'Spouse',
      phone: '+254722889900'
    },
    allergies: ['Penicillin (Moderate rash)', 'Sulfa drugs'],
    chronicConditions: ['Mild Asthma (Well-controlled)', 'Seasonal Allergic Rhinitis'],
    insuranceProvider: 'NHIF / SHIF Comprehensive Scheme',
    insurancePolicyNumber: 'SHIF-NRB-8831920',
    createdAt: '2026-02-01T14:30:00Z'
  },
  {
    id: 'pat-2',
    userId: 'usr-pat-2',
    name: 'Brian Mwangi Kimani',
    email: 'brian.mwangi@gmail.com',
    phone: '+254723456789',
    nationalId: '29817463',
    dob: '1988-11-04',
    gender: 'Male',
    bloodGroup: 'A+',
    address: 'Estate 12, Westlands, Nairobi',
    county: 'Nairobi County',
    emergencyContact: {
      name: 'Lucy Wambui (Sister)',
      relationship: 'Sister',
      phone: '+254720112244'
    },
    allergies: ['No known drug allergies (NKDA)'],
    chronicConditions: ['Essential Hypertension'],
    insuranceProvider: 'Jubilee Health Insurance',
    insurancePolicyNumber: 'JUB-MED-49102',
    createdAt: '2026-02-05T10:15:00Z'
  },
  {
    id: 'pat-3',
    userId: 'usr-pat-3',
    name: 'Beatrice Nyambura Karanja',
    email: 'beatrice.karanja@gmail.com',
    phone: '+254734567890',
    nationalId: '21948301',
    dob: '1975-03-22',
    gender: 'Female',
    bloodGroup: 'B+',
    address: 'House 8, Langata Road, Nairobi',
    county: 'Nairobi County',
    emergencyContact: {
      name: 'David Karanja (Son)',
      relationship: 'Son',
      phone: '+254733556677'
    },
    allergies: ['Aspirin / NSAIDs (Bronchospasm trigger)'],
    chronicConditions: ['Type 2 Diabetes Mellitus', 'Dyslipidemia'],
    insuranceProvider: 'AAR Insurance Kenya',
    insurancePolicyNumber: 'AAR-CORP-91028',
    createdAt: '2026-02-10T11:45:00Z'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-101',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    patientPhone: '+254712345678',
    patientNationalId: '32849102',
    doctorId: 'doc-1',
    doctorName: 'Dr. Sarah Odhiambo',
    departmentId: 'dept-pediatrics',
    departmentName: 'Pediatrics & Child Health',
    appointmentDate: '2026-08-27',
    appointmentTime: '10:00 AM',
    type: 'In-Person',
    status: 'Booked',
    reason: 'Follow-up consultation for baby routine 9-month growth assessment & allergic cough review.',
    consultationFeeKES: 2800,
    paymentStatus: 'Paid',
    mpesaReceipt: 'QHK88X92LM',
    notes: 'Please bring child immunization booklet and previous chest X-ray.',
    createdAt: '2026-08-25T11:20:00Z'
  },
  {
    id: 'apt-102',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    patientPhone: '+254712345678',
    patientNationalId: '32849102',
    doctorId: 'doc-3',
    doctorName: 'Dr. Amina Hassan',
    departmentId: 'dept-opd',
    departmentName: 'Outpatient Department (OPD)',
    appointmentDate: '2026-08-28',
    appointmentTime: '02:30 PM',
    type: 'Telemedicine',
    status: 'Booked',
    reason: 'Virtual follow-up consultation to review recent lipid profile and routine thyroid test results.',
    consultationFeeKES: 1500,
    paymentStatus: 'Paid',
    mpesaReceipt: 'QHL44B19KC',
    telemedicineRoomId: 'tele-room-faith-102',
    notes: 'WebRTC video room link is active. Please join 5 minutes prior.',
    createdAt: '2026-08-26T06:40:00Z'
  },
  {
    id: 'apt-103',
    patientId: 'pat-2',
    patientName: 'Brian Mwangi Kimani',
    patientPhone: '+254723456789',
    patientNationalId: '29817463',
    doctorId: 'doc-2',
    doctorName: 'Dr. Kevin Omondi',
    departmentId: 'dept-cardiology',
    departmentName: 'Cardiology Clinic',
    appointmentDate: '2026-08-26',
    appointmentTime: '09:00 AM',
    type: 'In-Person',
    status: 'Checked-In',
    reason: 'Hypertension routine 6-month checkup and resting ECG assessment.',
    consultationFeeKES: 3500,
    paymentStatus: 'Paid',
    mpesaReceipt: 'QHJ12Z77PP',
    createdAt: '2026-08-24T09:15:00Z'
  }
];

export const INITIAL_ENCOUNTERS: ClinicalEncounter[] = [
  {
    id: 'enc-201',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    doctorId: 'doc-3',
    doctorName: 'Dr. Amina Hassan',
    departmentName: 'Outpatient Department (OPD)',
    visitDate: '2026-07-15',
    visitType: 'Outpatient',
    chiefComplaint: 'Intermittent fatigue, mild morning dizziness, and dry cough for 5 days.',
    historyOfPresentIllness: '32-year-old female presents with 5 days of upper airway dry cough, no fever, no hemoptysis. Notes slight dizziness when standing quickly. Current medications: Salbutamol inhaler PRN.',
    vitals: {
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 76,
      heartRateBpm: 72,
      respiratoryRateBpm: 18,
      temperatureCelsius: 36.6,
      oxygenSaturationPercent: 99,
      bmi: 22.4,
      recordedAt: '2026-07-15T09:10:00Z',
      recordedBy: 'Nurse Faith Chepkorir'
    },
    examinationNotes: 'Chest clear bilaterally, good air entry. Heart sounds S1 S2 present, no murmurs. Throat mildly hyperemic, no tonsillar exudates.',
    diagnoses: [
      { code: 'J06.9', name: 'Acute upper respiratory infection, unspecified', type: 'Primary' },
      { code: 'R53.83', name: 'Fatigue and generalized malaise', type: 'Secondary' }
    ],
    treatmentPlan: '1. Oral hydration and steam inhalation.\n2. Prescribed Cetirizine 10mg OD x 7 days and Paracetamol 1g TDS PRN.\n3. Ordered Full Hemogram and Serum Ferritin to rule out microcytic anemia.\n4. Review in 2 weeks if symptoms persist.',
    admissionStatus: 'None',
    followUpDate: '2026-07-29'
  },
  {
    id: 'enc-202',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    doctorId: 'doc-1',
    doctorName: 'Dr. Sarah Odhiambo',
    departmentName: 'Pediatrics & Child Health',
    visitDate: '2026-05-10',
    visitType: 'Outpatient',
    chiefComplaint: '6-month infant wellness check, immunization review and weaning nutrition advice.',
    historyOfPresentIllness: 'Infant growing along 75th percentile for weight and length. Milestones intact (rolling over, sitting with support). No feeding difficulties.',
    vitals: {
      bloodPressureSystolic: 90,
      bloodPressureDiastolic: 55,
      heartRateBpm: 110,
      respiratoryRateBpm: 26,
      temperatureCelsius: 36.8,
      oxygenSaturationPercent: 100,
      bmi: 16.5,
      recordedAt: '2026-05-10T10:15:00Z',
      recordedBy: 'Nurse Faith Chepkorir'
    },
    examinationNotes: 'Alert, responsive infant. Anterior fontanelle soft and flat. Lungs resonant throughout. Abdomen soft, non-tender.',
    diagnoses: [
      { code: 'Z00.129', name: 'Encounter for routine child health examination', type: 'Primary' }
    ],
    treatmentPlan: 'Administered Measles-Rubella and Vitamin A supplementation. Counseled on iron-rich complementary feeding (mashed butternut, avocado, enriched porridge).',
    admissionStatus: 'None'
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-301',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    doctorId: 'doc-3',
    doctorName: 'Dr. Amina Hassan',
    encounterId: 'enc-201',
    prescribedDate: '2026-07-15',
    status: 'Dispensed',
    medications: [
      {
        drugName: 'Cetirizine Hydrochloride 10mg Tablets',
        dosage: '10mg',
        frequency: 'Once Daily at bedtime',
        duration: '7 Days',
        route: 'Oral',
        instructions: 'Take 1 tablet at night with water. May cause mild drowsiness.',
        priceKES: 350,
        dispensedQuantity: 7,
        batchNumber: 'BN-CTZ-2026-09'
      },
      {
        drugName: 'Paracetamol 500mg Tablets',
        dosage: '1000mg (2 tabs)',
        frequency: 'Three times daily PRN',
        duration: '5 Days',
        route: 'Oral',
        instructions: 'Take 2 tablets every 8 hours after meals only when in pain or discomfort.',
        priceKES: 200,
        dispensedQuantity: 20,
        batchNumber: 'BN-PCM-88412'
      },
      {
        drugName: 'Salbutamol 100mcg Inhaler',
        dosage: '2 Puffs (200mcg)',
        frequency: 'As needed for shortness of breath',
        duration: '30 Days',
        route: 'Inhalation',
        instructions: 'Inhale 2 puffs using spacer device during wheezing episodes. Rinse mouth after use.',
        priceKES: 650,
        dispensedQuantity: 1,
        batchNumber: 'BN-SLB-55310'
      }
    ],
    totalPriceKES: 1200,
    dispensedBy: 'Pharm. Lucy Njeri',
    dispensedAt: '2026-07-15T10:45:00Z'
  },
  {
    id: 'rx-302',
    patientId: 'pat-2',
    patientName: 'Brian Mwangi Kimani',
    doctorId: 'doc-2',
    doctorName: 'Dr. Kevin Omondi',
    prescribedDate: '2026-08-26',
    status: 'Pending',
    medications: [
      {
        drugName: 'Amlodipine Besylate 5mg Tablets',
        dosage: '5mg',
        frequency: 'Once Daily in the morning',
        duration: '30 Days',
        route: 'Oral',
        instructions: 'Take 1 tablet every morning with or without food. Monitor ankle swelling.',
        priceKES: 900
      },
      {
        drugName: 'Telmisartan 40mg Tablets',
        dosage: '40mg',
        frequency: 'Once Daily',
        duration: '30 Days',
        route: 'Oral',
        instructions: 'Take daily at the same time to control blood pressure.',
        priceKES: 1400
      }
    ],
    totalPriceKES: 2300
  }
];

export const INITIAL_LAB_ORDERS: LabOrder[] = [
  {
    id: 'lab-401',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    patientAge: 32,
    patientGender: 'Female',
    doctorId: 'doc-3',
    doctorName: 'Dr. Amina Hassan',
    departmentName: 'Outpatient Department (OPD)',
    orderedDate: '2026-07-15',
    clinicalIndication: 'Workup for generalized fatigue, mild dizziness, and routine annual wellness assessment.',
    priority: 'Routine',
    status: 'Results Ready',
    testName: 'Full Hemogram (Complete Blood Count)',
    testCategory: 'Hematology',
    priceKES: 1200,
    sampleType: 'Whole Blood (EDTA Tube)',
    sampleCollectedAt: '2026-07-15T09:30:00Z',
    results: [
      { parameter: 'Hemoglobin (Hb)', value: '13.4', unit: 'g/dL', referenceRange: '12.0 - 15.5', flag: 'Normal' },
      { parameter: 'White Blood Cell Count (WBC)', value: '6.8', unit: 'x10^9/L', referenceRange: '4.0 - 10.5', flag: 'Normal' },
      { parameter: 'Red Blood Cell Count (RBC)', value: '4.45', unit: 'x10^12/L', referenceRange: '3.8 - 5.2', flag: 'Normal' },
      { parameter: 'Hematocrit (PCV)', value: '39.8', unit: '%', referenceRange: '36.0 - 46.0', flag: 'Normal' },
      { parameter: 'Mean Corpuscular Volume (MCV)', value: '89.2', unit: 'fL', referenceRange: '80.0 - 98.0', flag: 'Normal' },
      { parameter: 'Platelet Count', value: '265', unit: 'x10^9/L', referenceRange: '150 - 450', flag: 'Normal' },
      { parameter: 'Neutrophils %', value: '58.2', unit: '%', referenceRange: '40.0 - 70.0', flag: 'Normal' },
      { parameter: 'Lymphocytes %', value: '33.1', unit: '%', referenceRange: '20.0 - 45.0', flag: 'Normal' }
    ],
    technicianNotes: 'Normal red blood cell morphology. Adequate platelets on peripheral blood smear. No abnormal blasts seen.',
    criticalAlert: false,
    completedAt: '2026-07-15T11:00:00Z',
    conductedByLabTech: 'Mr. Dennis Kipkoech (Chief Lab Scientist)'
  },
  {
    id: 'lab-402',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    patientAge: 32,
    patientGender: 'Female',
    doctorId: 'doc-3',
    doctorName: 'Dr. Amina Hassan',
    departmentName: 'Outpatient Department (OPD)',
    orderedDate: '2026-07-15',
    clinicalIndication: 'Fast lipid screening & cardiovascular risk profiling.',
    priority: 'Routine',
    status: 'Results Ready',
    testName: 'Lipid Profile Panel (Fasting)',
    testCategory: 'Biochemistry',
    priceKES: 2400,
    sampleType: 'Serum (SST Gel Tube)',
    sampleCollectedAt: '2026-07-15T09:30:00Z',
    results: [
      { parameter: 'Total Cholesterol', value: '4.8', unit: 'mmol/L', referenceRange: '< 5.2', flag: 'Normal' },
      { parameter: 'Triglycerides', value: '1.2', unit: 'mmol/L', referenceRange: '< 1.7', flag: 'Normal' },
      { parameter: 'HDL Cholesterol (Good)', value: '1.6', unit: 'mmol/L', referenceRange: '> 1.3', flag: 'Normal' },
      { parameter: 'LDL Cholesterol (Direct)', value: '2.6', unit: 'mmol/L', referenceRange: '< 3.0', flag: 'Normal' },
      { parameter: 'Cholesterol / HDL Ratio', value: '3.0', unit: 'ratio', referenceRange: '< 4.5', flag: 'Normal' }
    ],
    technicianNotes: 'Patient was fasted for 10 hours prior to collection. Good metabolic lipid index.',
    criticalAlert: false,
    completedAt: '2026-07-15T11:45:00Z',
    conductedByLabTech: 'Mr. Dennis Kipkoech (Chief Lab Scientist)'
  },
  {
    id: 'lab-403',
    patientId: 'pat-2',
    patientName: 'Brian Mwangi Kimani',
    patientAge: 38,
    patientGender: 'Male',
    doctorId: 'doc-2',
    doctorName: 'Dr. Kevin Omondi',
    departmentName: 'Cardiology Clinic',
    orderedDate: '2026-08-26',
    clinicalIndication: 'Pre-treatment renal function test before initiating ACE/ARB therapy.',
    priority: 'Urgent',
    status: 'Sample Collected',
    testName: 'Renal Function Tests (Urea, Creatinine & Electrolytes)',
    testCategory: 'Biochemistry',
    priceKES: 2200,
    sampleType: 'Serum',
    sampleCollectedAt: '2026-08-26T09:40:00Z'
  },
  {
    id: 'lab-404',
    patientId: 'pat-3',
    patientName: 'Beatrice Nyambura Karanja',
    patientAge: 51,
    patientGender: 'Female',
    doctorId: 'doc-3',
    doctorName: 'Dr. Amina Hassan',
    departmentName: 'Internal Medicine',
    orderedDate: '2026-08-26',
    clinicalIndication: 'Glycemic control monitoring for Type 2 Diabetes Mellitus.',
    priority: 'Routine',
    status: 'Requested',
    testName: 'HbA1c (Glycated Hemoglobin)',
    testCategory: 'Endocrinology',
    priceKES: 2200,
    sampleType: 'Whole Blood (EDTA)'
  }
];

export const INITIAL_RADIOLOGY_ORDERS: RadiologyOrder[] = [
  {
    id: 'rad-501',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    doctorId: 'doc-3',
    doctorName: 'Dr. Amina Hassan',
    orderedDate: '2026-07-15',
    modality: 'X-Ray',
    bodyPart: 'Chest PA View (Digital Radiography)',
    clinicalHistory: '32-year-old female with persistent dry cough, assessing for pulmonary infiltrates, consolidation, or hilar adenopathy.',
    priority: 'Routine',
    status: 'Report Generated',
    priceKES: 2000,
    findings: 'Digital PA chest radiograph demonstrates clear lung fields bilaterally. Normal bronchovascular markings. The cardiothoracic ratio is normal (< 50%). Both costophrenic and cardiophrenic angles are acute and clear. Trachea is central. No pneumothorax, effusion, or active airspace opacification noted. Visualized bony thorax and soft tissues are unremarkable.',
    impression: 'Normal digital chest radiograph. No evidence of active pneumonia, tuberculosis, or pleural effusion.',
    recommendations: 'Symptomatic outpatient management appropriate.',
    radiologistName: 'Dr. Miriam Wangari, MBChB, MMed (Radiology)',
    completedAt: '2026-07-15T12:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'rad-502',
    patientId: 'pat-2',
    patientName: 'Brian Mwangi Kimani',
    doctorId: 'doc-2',
    doctorName: 'Dr. Kevin Omondi',
    orderedDate: '2026-08-26',
    modality: 'Ultrasound',
    bodyPart: 'Echocardiography (Transthoracic 2D/Doppler)',
    clinicalHistory: 'Hypertensive patient workup to evaluate left ventricular wall thickness and diastolic function.',
    priority: 'Routine',
    status: 'Scheduled',
    priceKES: 6500
  }
];

export const INITIAL_IMMUNIZATIONS: ImmunizationRecord[] = [
  {
    id: 'imm-1',
    patientId: 'pat-1',
    vaccineName: 'Tetanus Toxoid Booster (TT)',
    targetDisease: 'Tetanus',
    doseNumber: 3,
    dateAdministered: '2025-09-12',
    administeredBy: 'Nurse Faith Chepkorir',
    facility: 'TERRALINKHEALTH Hospital Nairobi',
    batchNumber: 'TT-KE-2025-881',
    nextDoseDue: '2030-09-12'
  },
  {
    id: 'imm-2',
    patientId: 'pat-1',
    vaccineName: 'Yellow Fever Vaccine (Stamaril)',
    targetDisease: 'Yellow Fever Virus',
    doseNumber: 1,
    dateAdministered: '2023-04-18',
    administeredBy: 'Public Health Department',
    facility: 'Nairobi City Health Directorate',
    batchNumber: 'YF-WH-0914-KE',
    nextDoseDue: 'Lifelong Immunity'
  },
  {
    id: 'imm-3',
    patientId: 'pat-1',
    vaccineName: 'Hepatitis B Recombinant Vaccine',
    targetDisease: 'Hepatitis B Virus (HBV)',
    doseNumber: 3,
    dateAdministered: '2022-11-20',
    administeredBy: 'Staff Health Clinic',
    facility: 'TERRALINKHEALTH Hospital Nairobi',
    batchNumber: 'HBV-99201'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-601',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    patientPhone: '+254712345678',
    date: '2026-07-15',
    dueDate: '2026-07-15',
    status: 'Paid',
    items: [
      { description: 'Outpatient Consultation Fee (Dr. Amina Hassan)', category: 'Consultation', amountKES: 1500 },
      { description: 'Full Hemogram (Complete Blood Count)', category: 'Laboratory', amountKES: 1200 },
      { description: 'Lipid Profile Panel (Fasting)', category: 'Laboratory', amountKES: 2400 },
      { description: 'Digital Chest X-Ray (PA View)', category: 'Radiology', amountKES: 2000 },
      { description: 'Pharmacy Prescription Dispensing (Cetirizine, PCM, Salbutamol)', category: 'Pharmacy', amountKES: 1200 }
    ],
    totalKES: 8300,
    paidAmountKES: 8300,
    balanceKES: 0,
    paymentMethod: 'M-PESA Express',
    mpesaReceipt: 'QHK91A44LL'
  },
  {
    id: 'inv-602',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    patientPhone: '+254712345678',
    date: '2026-08-25',
    dueDate: '2026-08-27',
    status: 'Paid',
    items: [
      { description: 'Pediatrics Specialist Consultation (Dr. Sarah Odhiambo)', category: 'Consultation', amountKES: 2800 }
    ],
    totalKES: 2800,
    paidAmountKES: 2800,
    balanceKES: 0,
    paymentMethod: 'M-PESA STK Push',
    mpesaReceipt: 'QHK88X92LM'
  },
  {
    id: 'inv-603',
    patientId: 'pat-2',
    patientName: 'Brian Mwangi Kimani',
    patientPhone: '+254723456789',
    date: '2026-08-26',
    dueDate: '2026-08-26',
    status: 'Unpaid',
    items: [
      { description: 'Cardiology Specialist Consultation (Dr. Kevin Omondi)', category: 'Consultation', amountKES: 3500 },
      { description: 'Renal Function Tests (Urea, Creatinine, Electrolytes)', category: 'Laboratory', amountKES: 2200 },
      { description: 'Pharmacy (Amlodipine & Telmisartan)', category: 'Pharmacy', amountKES: 2300 }
    ],
    totalKES: 8000,
    paidAmountKES: 3500,
    balanceKES: 4500
  }
];

export const INITIAL_MPESA_PAYMENTS: MpesaPayment[] = [
  {
    id: 'mps-701',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    phone: '254712345678',
    amountKES: 8300,
    reference: 'INV-601-OPD',
    serviceType: 'General',
    status: 'Completed',
    mpesaReceiptNumber: 'QHK91A44LL',
    transactionDate: '2026-07-15 12:45:10'
  },
  {
    id: 'mps-702',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    phone: '254712345678',
    amountKES: 2800,
    reference: 'APT-101-PED',
    serviceType: 'Consultation',
    status: 'Completed',
    mpesaReceiptNumber: 'QHK88X92LM',
    transactionDate: '2026-08-25 11:20:45'
  },
  {
    id: 'mps-703',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    phone: '254712345678',
    amountKES: 1500,
    reference: 'APT-102-TELE',
    serviceType: 'Consultation',
    status: 'Completed',
    mpesaReceiptNumber: 'QHL44B19KC',
    transactionDate: '2026-08-26 06:42:15'
  }
];

export const INITIAL_PRICING: SystemPricing = {
  consultation: {
    generalOpdKES: 1500,
    specialistKES: 3000,
    emergencyKES: 2500,
    telemedicineKES: 1800
  },
  commonLabs: [
    { name: 'Full Hemogram / Complete Blood Count (CBC)', code: 'LAB-CBC', category: 'Hematology', priceKES: 1200 },
    { name: 'Lipid Profile Panel (Fasting)', code: 'LAB-LIP', category: 'Biochemistry', priceKES: 2400 },
    { name: 'Renal Function Tests (Urea, Creatinine, Electrolytes)', code: 'LAB-RFT', category: 'Biochemistry', priceKES: 2200 },
    { name: 'Liver Function Tests (LFTs)', code: 'LAB-LFT', category: 'Biochemistry', priceKES: 2500 },
    { name: 'Blood Sugar Fasting / Random', code: 'LAB-BS', category: 'Biochemistry', priceKES: 500 },
    { name: 'HbA1c (Glycated Hemoglobin)', code: 'LAB-HBA1C', category: 'Endocrinology', priceKES: 2200 },
    { name: 'Malaria Microscopy & Rapid Diagnostic Test (RDT)', code: 'LAB-MAL', category: 'Parasitology', priceKES: 600 },
    { name: 'Urinalysis (Complete Dipstick & Microscopy)', code: 'LAB-URN', category: 'Urinalysis', priceKES: 650 },
    { name: 'Stool Analysis (Ova & Cysts)', code: 'LAB-STL', category: 'Parasitology', priceKES: 700 },
    { name: 'Thyroid Profile (TSH, Free T3, Free T4)', code: 'LAB-TFT', category: 'Endocrinology', priceKES: 3500 },
    { name: 'Blood Grouping & Crossmatch (ABO & Rh)', code: 'LAB-BGRP', category: 'Hematology', priceKES: 800 }
  ],
  commonRadiology: [
    { name: 'Digital Chest X-Ray (PA View)', modality: 'X-Ray', priceKES: 2000 },
    { name: 'Abdominal 4D Ultrasound', modality: 'Ultrasound', priceKES: 3500 },
    { name: 'Pelvic & Obstetric Ultrasound', modality: 'Ultrasound', priceKES: 3000 },
    { name: 'Echocardiography (Transthoracic 2D)', modality: 'Ultrasound', priceKES: 6500 },
    { name: 'CT Scan Brain / Head (Plain & Contrast)', modality: 'CT Scan', priceKES: 9500 },
    { name: 'CT Scan Chest High-Resolution (HRCT)', modality: 'CT Scan', priceKES: 11000 },
    { name: 'MRI Brain 1.5 Tesla', modality: 'MRI', priceKES: 22000 },
    { name: 'MRI Lumbar Spine', modality: 'MRI', priceKES: 24000 },
    { name: 'Digital Mammography (Bilateral)', modality: 'Mammogram', priceKES: 4500 }
  ],
  commonPharmacy: [
    { name: 'Amoxicillin/Clavulanic Acid (Augmentin) 625mg', dosage: '625mg Tabs', category: 'Antibiotic', unitPriceKES: 180 },
    { name: 'Azithromycin 500mg Tablets', dosage: '500mg Tabs', category: 'Antibiotic', unitPriceKES: 250 },
    { name: 'Paracetamol 500mg Tablets', dosage: '500mg Tabs', category: 'Analgesic', unitPriceKES: 10 },
    { name: 'Ibuprofen 400mg Tablets', dosage: '400mg Tabs', category: 'NSAID', unitPriceKES: 25 },
    { name: 'Cetirizine 10mg Tablets', dosage: '10mg Tabs', category: 'Antihistamine', unitPriceKES: 50 },
    { name: 'Salbutamol 100mcg Metered Dose Inhaler', dosage: '100mcg/puff Inhaler', category: 'Respiratory', unitPriceKES: 650 },
    { name: 'Amlodipine 5mg Tablets', dosage: '5mg Tabs', category: 'Antihypertensive', unitPriceKES: 30 },
    { name: 'Telmisartan 40mg Tablets', dosage: '40mg Tabs', category: 'Antihypertensive', unitPriceKES: 45 },
    { name: 'Metformin 500mg Slow-Release', dosage: '500mg SR Tabs', category: 'Antidiabetic', unitPriceKES: 20 },
    { name: 'Omeprazole 20mg Delayed-Release', dosage: '20mg Caps', category: 'Gastrointestinal', unitPriceKES: 35 },
    { name: 'Artemether-Lumefantrine (Coartem) 20/120mg', dosage: 'Adult Pack (24 tabs)', category: 'Antimalarial', unitPriceKES: 850 }
  ]
};

export const INITIAL_ANALYTICS: HospitalAnalytics = {
  dailyVisitsToday: 342,
  dailyVisitsGrowthPercent: 12.4,
  averageWaitTimeMinutes: 18,
  waitTimeChangeMinutes: -4,
  currentActiveQueueLength: 48,
  totalBedsOccupied: 165,
  totalBedsCapacity: 220,
  bedOccupancyRatePercent: 75.0,
  totalRevenueKES: 18450000,
  todayRevenueKES: 785400,
  appointmentAttendanceRatePercent: 94.2,
  labTurnaroundAvgHours: 1.6,
  telemedicineCallsToday: 28,
  patientSatisfactionRating: 4.85,
  departmentPerformance: [
    { department: 'Outpatient (OPD)', visitsToday: 114, avgWaitMinutes: 24, satisfactionScore: 4.8, queueCount: 8 },
    { department: 'Accident & Emergency', visitsToday: 48, avgWaitMinutes: 10, satisfactionScore: 4.9, queueCount: 4 },
    { department: 'Pediatrics', visitsToday: 42, avgWaitMinutes: 15, satisfactionScore: 4.95, queueCount: 3 },
    { department: 'Obstetrics & Gyn', visitsToday: 38, avgWaitMinutes: 20, satisfactionScore: 4.9, queueCount: 5 },
    { department: 'Cardiology', visitsToday: 22, avgWaitMinutes: 12, satisfactionScore: 5.0, queueCount: 2 },
    { department: 'Orthopedics', visitsToday: 26, avgWaitMinutes: 25, satisfactionScore: 4.75, queueCount: 4 },
    { department: 'Dental', visitsToday: 18, avgWaitMinutes: 18, satisfactionScore: 4.85, queueCount: 3 },
    { department: 'Ophthalmology', visitsToday: 20, avgWaitMinutes: 22, satisfactionScore: 4.8, queueCount: 5 },
    { department: 'Diagnostic Lab', visitsToday: 168, avgWaitMinutes: 12, satisfactionScore: 4.9, queueCount: 5 },
    { department: 'Radiology / Scans', visitsToday: 74, avgWaitMinutes: 15, satisfactionScore: 4.85, queueCount: 4 }
  ],
  revenueBreakdownKES: [
    { category: 'Clinical Consultations', amountKES: 5800000, percentage: 31.4 },
    { category: 'Laboratory Diagnostics', amountKES: 4250000, percentage: 23.0 },
    { category: 'Pharmacy & Therapeutics', amountKES: 3900000, percentage: 21.1 },
    { category: 'Radiology & Imaging', amountKES: 2650000, percentage: 14.4 },
    { category: 'Inpatient & Critical Care', amountKES: 1850000, percentage: 10.1 }
  ],
  visitsHourlyTrend: [
    { time: '06:00', visits: 12 },
    { time: '08:00', visits: 38 },
    { time: '10:00', visits: 64 },
    { time: '12:00', visits: 52 },
    { time: '14:00', visits: 58 },
    { time: '16:00', visits: 45 },
    { time: '18:00', visits: 35 },
    { time: '20:00', visits: 22 },
    { time: '22:00', visits: 16 }
  ]
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-901',
    timestamp: '2026-08-26T07:30:15Z',
    userId: 'usr-admin-1',
    userName: 'Eng. Dennis Mworia (Admin)',
    role: 'admin',
    action: 'System Security Audit & Encryption Verification Completed',
    module: 'Admin',
    ipAddress: '197.232.88.14 (Nairobi, Kenya)',
    details: 'Verified TLS 1.3 encryption, database row-level security tokens, and automatic cloud backups.',
    status: 'Success'
  },
  {
    id: 'aud-902',
    timestamp: '2026-08-26T07:15:20Z',
    userId: 'usr-lab-1',
    userName: 'Mr. Dennis Kipkoech (Chief Lab Scientist)',
    role: 'lab_tech',
    action: 'Laboratory Test Results Signed & Dispatched',
    module: 'Lab',
    ipAddress: '10.0.4.12 (Hospital Intranet LAB-VLAN)',
    details: 'Uploaded validated Full Hemogram and Lipid Profile results for Patient ID #pat-1.',
    status: 'Success'
  },
  {
    id: 'aud-903',
    timestamp: '2026-08-26T06:42:15Z',
    userId: 'usr-pat-1',
    userName: 'Faith Chebet Koech',
    role: 'patient',
    action: 'M-PESA Express Payment Verified KES 1,500',
    module: 'Billing',
    ipAddress: '105.160.32.90 (Safaricom 4G/5G)',
    details: 'M-PESA Receipt QHL44B19KC for Telemedicine consultation booking APT-102.',
    status: 'Success'
  },
  {
    id: 'aud-904',
    timestamp: '2026-08-26T06:10:00Z',
    userId: 'usr-doc-3',
    userName: 'Dr. Amina Hassan',
    role: 'doctor',
    action: 'Clinical Encounter SOAP Note Finalized',
    module: 'EMR',
    ipAddress: '10.0.2.45 (OPD Clinic Room 4)',
    details: 'Completed diagnosis J06.9 with linked electronic prescription and lab referral.',
    status: 'Success'
  }
];

export const INITIAL_SOCIAL_LINKS: HospitalSocialLinks = {
  facebook: 'https://facebook.com/terralinkhealth',
  twitter: 'https://x.com/terralinkhealth',
  instagram: 'https://instagram.com/terralinkhealth',
  whatsapp: 'https://wa.me/254713544101',
  phoneHotline: '0713544101',
  email: 'info@terralinkhealth.co.ke',
  address: 'Hospital Hill Road, Parklands / Upper Hill Medical Complex, Nairobi County, Kenya'
};

export const INITIAL_INSURANCE_PROVIDERS: InsuranceProviderPlan[] = [
  {
    id: 'ins-prov-sha',
    providerName: 'Social Health Authority (SHA / NHIF Kenya)',
    providerCode: 'SHA-KENYA',
    category: 'National Public Scheme',
    planTiers: [
      {
        tierName: 'SHA Primary Care & Essential Benefit Package',
        tierCode: 'SHA-PRIMARY',
        monthlyPremiumKES: 500,
        annualPremiumKES: 6000,
        inpatientLimitKES: 1800000,
        outpatientLimitKES: 100000,
        maternityLimitKES: 50000,
        dentalLimitKES: 25000,
        opticalLimitKES: 20000,
        copayKES: 0,
        preAuthRequiredAboveKES: 30000,
        coverageHighlights: [
          'Full consultation coverage at all public & empaneled level 4/5 hospitals',
          'Standard generic medication at hospital pharmacy',
          'Basic and routine laboratory tests (Hemogram, Urinalysis, Malaria, BS)',
          'Emergency ambulance triage and ICU stabilization allowance'
        ]
      },
      {
        tierName: 'SHA Civil Servants & Comprehensive Enhanced Scheme',
        tierCode: 'SHA-ENHANCED',
        monthlyPremiumKES: 1750,
        annualPremiumKES: 21000,
        inpatientLimitKES: 3500000,
        outpatientLimitKES: 200000,
        maternityLimitKES: 120000,
        dentalLimitKES: 45000,
        opticalLimitKES: 35000,
        copayKES: 0,
        preAuthRequiredAboveKES: 50000,
        coverageHighlights: [
          'Priority outpatient specialist clinics',
          'Branded therapeutics and specialized MRI / CT Scan cover',
          'Private bed ward allocation up to KES 8,000/night',
          'Oncology and chronic disease management support'
        ]
      }
    ]
  },
  {
    id: 'ins-prov-jubilee',
    providerName: 'Jubilee Health Insurance Kenya',
    providerCode: 'JUBILEE-HLTH',
    category: 'Private Underwriter',
    planTiers: [
      {
        tierName: 'Jubilee J-Care Gold Comprehensive',
        tierCode: 'JUB-GOLD',
        monthlyPremiumKES: 4500,
        annualPremiumKES: 54000,
        inpatientLimitKES: 5000000,
        outpatientLimitKES: 250000,
        maternityLimitKES: 200000,
        dentalLimitKES: 50000,
        opticalLimitKES: 40000,
        copayKES: 200,
        preAuthRequiredAboveKES: 40000,
        coverageHighlights: [
          'Full direct billing at TERRALINKHEALTH HOSPITAL',
          'Private en-suite room inpatient bed allocation',
          'Free annual wellness checkup and executive cancer screening',
          'International emergency evacuation cover'
        ]
      },
      {
        tierName: 'Jubilee Executive Platinum Care',
        tierCode: 'JUB-PLATINUM',
        monthlyPremiumKES: 8200,
        annualPremiumKES: 98400,
        inpatientLimitKES: 10000000,
        outpatientLimitKES: 500000,
        maternityLimitKES: 350000,
        dentalLimitKES: 100000,
        opticalLimitKES: 75000,
        copayKES: 0,
        preAuthRequiredAboveKES: 100000,
        coverageHighlights: [
          'Unlimited tele-consultations and home drug delivery',
          'VIP presidential wing inpatient accommodation',
          'Zero co-pay on all diagnostics, MRI, CT scans, and surgeries',
          'Comprehensive organ transplant and international treatment rider'
        ]
      }
    ]
  },
  {
    id: 'ins-prov-britam',
    providerName: 'Britam Health Insurance',
    providerCode: 'BRITAM-MED',
    category: 'Private Underwriter',
    planTiers: [
      {
        tierName: 'Britam Milele Health Standard',
        tierCode: 'BRT-STD',
        monthlyPremiumKES: 3800,
        annualPremiumKES: 45600,
        inpatientLimitKES: 3000000,
        outpatientLimitKES: 200000,
        maternityLimitKES: 150000,
        dentalLimitKES: 35000,
        opticalLimitKES: 30000,
        copayKES: 250,
        preAuthRequiredAboveKES: 35000,
        coverageHighlights: [
          'Cover for pre-existing and chronic conditions after 1 year',
          'No biometric card needed — integrated digitally with TERRALINKHEALTH',
          'Ambulance and paramedic transport cover within Nairobi County'
        ]
      }
    ]
  },
  {
    id: 'ins-prov-aar',
    providerName: 'AAR Insurance Kenya',
    providerCode: 'AAR-KENYA',
    category: 'Private Underwriter',
    planTiers: [
      {
        tierName: 'AAR ProHealth Executive',
        tierCode: 'AAR-EXEC',
        monthlyPremiumKES: 5200,
        annualPremiumKES: 62400,
        inpatientLimitKES: 6000000,
        outpatientLimitKES: 300000,
        maternityLimitKES: 250000,
        dentalLimitKES: 60000,
        opticalLimitKES: 50000,
        copayKES: 200,
        preAuthRequiredAboveKES: 45000,
        coverageHighlights: [
          'Direct SMART cardless digital verification',
          'Post-hospitalization recuperation allowance',
          'Emergency local air and road evacuation cover'
        ]
      }
    ]
  },
  {
    id: 'ins-prov-cic',
    providerName: 'CIC Family Health & Corporate Medical',
    providerCode: 'CIC-MED',
    category: 'Private Underwriter',
    planTiers: [
      {
        tierName: 'CIC Afya Bora Comprehensive',
        tierCode: 'CIC-AFYA',
        monthlyPremiumKES: 3400,
        annualPremiumKES: 40800,
        inpatientLimitKES: 2500000,
        outpatientLimitKES: 180000,
        maternityLimitKES: 120000,
        dentalLimitKES: 30000,
        opticalLimitKES: 25000,
        copayKES: 200,
        preAuthRequiredAboveKES: 30000,
        coverageHighlights: [
          'Affordable family premiums with pooled inpatient benefits',
          'Full consultation & lab diagnostics coverage at TERRALINKHEALTH',
          'Chronic disease clinical clinics included'
        ]
      }
    ]
  },
  {
    id: 'ins-prov-oldmutual',
    providerName: 'Old Mutual Health Kenya (UAP)',
    providerCode: 'OLD-MUTUAL',
    category: 'Private Underwriter',
    planTiers: [
      {
        tierName: 'Old Mutual Premier Health',
        tierCode: 'OM-PREMIER',
        monthlyPremiumKES: 4900,
        annualPremiumKES: 58800,
        inpatientLimitKES: 5500000,
        outpatientLimitKES: 280000,
        maternityLimitKES: 220000,
        dentalLimitKES: 55000,
        opticalLimitKES: 45000,
        copayKES: 200,
        preAuthRequiredAboveKES: 40000,
        coverageHighlights: [
          'Rapid direct electronic authorization in under 10 minutes',
          'Comprehensive mental health and wellness sessions',
          'Full cover for day-care surgical procedures'
        ]
      }
    ]
  }
];

export const INITIAL_INSURANCE_POLICIES: PatientInsurancePolicy[] = [
  {
    id: 'pol-001',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    patientNationalId: '32849102',
    providerName: 'Social Health Authority (SHA / NHIF Kenya)',
    providerCode: 'SHA-KENYA',
    policyNumber: 'SHA-NRB-8831920',
    memberNumber: 'MEM-SHA-440192',
    principalMemberName: 'Faith Chebet Koech',
    relationshipToPrincipal: 'Self',
    planTier: 'SHA Primary Care & Essential Benefit Package',
    status: 'Approved & Verified',
    monthlyPremiumKES: 500,
    annualPremiumKES: 6000,
    annualInpatientLimitKES: 1800000,
    inpatientUsedKES: 0,
    annualOutpatientLimitKES: 100000,
    outpatientUsedKES: 12500,
    copayKES: 0,
    preAuthCode: 'SHA-AUTH-2026-8819',
    verifiedAt: '2026-08-01T10:00:00Z',
    verifiedBy: 'Billing Officer - J. Karanja',
    expiryDate: '2027-07-31',
    submittedAt: '2026-08-01T09:15:00Z'
  },
  {
    id: 'pol-002',
    patientId: 'pat-1',
    patientName: 'Faith Chebet Koech',
    patientNationalId: '32849102',
    providerName: 'Jubilee Health Insurance Kenya',
    providerCode: 'JUBILEE-HLTH',
    policyNumber: 'JUB-MED-59218',
    memberNumber: 'JUB-0914-FCK',
    principalMemberName: 'Collins Kiprono (Spouse Corporate)',
    relationshipToPrincipal: 'Spouse',
    planTier: 'Jubilee J-Care Gold Comprehensive',
    status: 'Approved & Verified',
    monthlyPremiumKES: 4500,
    annualPremiumKES: 54000,
    annualInpatientLimitKES: 5000000,
    inpatientUsedKES: 0,
    annualOutpatientLimitKES: 250000,
    outpatientUsedKES: 18400,
    copayKES: 200,
    preAuthCode: 'JUB-PA-993821',
    verifiedAt: '2026-08-02T14:30:00Z',
    verifiedBy: 'Billing Officer - J. Karanja',
    expiryDate: '2027-08-01',
    submittedAt: '2026-08-02T11:00:00Z'
  },
  {
    id: 'pol-003',
    patientId: 'pat-2',
    patientName: 'Brian Mwangi Kimani',
    patientNationalId: '29817463',
    providerName: 'Britam Health Insurance',
    providerCode: 'BRITAM-MED',
    policyNumber: 'BRT-H-774102',
    memberNumber: 'BRT-MEM-88192',
    principalMemberName: 'Brian Mwangi Kimani',
    relationshipToPrincipal: 'Self',
    planTier: 'Britam Milele Health Standard',
    status: 'Approved & Verified',
    monthlyPremiumKES: 3800,
    annualPremiumKES: 45600,
    annualInpatientLimitKES: 3000000,
    inpatientUsedKES: 0,
    annualOutpatientLimitKES: 200000,
    outpatientUsedKES: 8500,
    copayKES: 250,
    preAuthCode: 'BRT-PA-44182',
    verifiedAt: '2026-08-05T09:00:00Z',
    verifiedBy: 'Admin Team - Terralink',
    expiryDate: '2027-08-04',
    submittedAt: '2026-08-05T08:30:00Z'
  },
  {
    id: 'pol-004',
    patientId: 'pat-3',
    patientName: 'Grace Achieng Ochieng',
    patientNationalId: '34190827',
    providerName: 'AAR Insurance Kenya',
    providerCode: 'AAR-KENYA',
    policyNumber: 'AAR-NRB-44109',
    memberNumber: 'AAR-881920-GA',
    principalMemberName: 'Grace Achieng Ochieng',
    relationshipToPrincipal: 'Self',
    planTier: 'AAR ProHealth Executive',
    status: 'Pending Verification',
    monthlyPremiumKES: 5200,
    annualPremiumKES: 62400,
    annualInpatientLimitKES: 6000000,
    inpatientUsedKES: 0,
    annualOutpatientLimitKES: 300000,
    outpatientUsedKES: 0,
    copayKES: 200,
    expiryDate: '2027-08-15',
    submittedAt: '2026-08-25T16:20:00Z'
  }
];

export const INITIAL_HOSPITAL_BEDS: HospitalBed[] = [
  {
    id: 'bed-icu-01',
    bedNumber: 'ICU-01',
    ward: 'Intensive Care Unit (ICU)',
    bedType: 'ICU',
    status: 'Occupied',
    patientId: 'pat-1',
    patientName: 'Wanjiku Muthoni',
    admissionDate: '2026-08-25',
    dailyRateKES: 25000,
    hasOxygen: true,
    hasVentilator: true,
    hasTelemetry: true,
    notes: 'Post-op respiratory stabilization. Continuous invasive arterial monitoring.',
    lastUpdated: '2026-08-26 10:15 AM'
  },
  {
    id: 'bed-icu-02',
    bedNumber: 'ICU-02',
    ward: 'Intensive Care Unit (ICU)',
    bedType: 'ICU',
    status: 'Available',
    dailyRateKES: 25000,
    hasOxygen: true,
    hasVentilator: true,
    hasTelemetry: true,
    notes: 'Sanitized and prepped with Dräger transport ventilator.',
    lastUpdated: '2026-08-26 09:30 AM'
  },
  {
    id: 'bed-icu-03',
    bedNumber: 'ICU-03',
    ward: 'Intensive Care Unit (ICU)',
    bedType: 'ICU',
    status: 'Available',
    dailyRateKES: 25000,
    hasOxygen: true,
    hasVentilator: true,
    hasTelemetry: true,
    notes: 'Ready for emergency trauma admissions.',
    lastUpdated: '2026-08-26 08:00 AM'
  },
  {
    id: 'bed-icu-04',
    bedNumber: 'ICU-04',
    ward: 'Intensive Care Unit (ICU)',
    bedType: 'ICU',
    status: 'Occupied',
    patientId: 'pat-2',
    patientName: 'David Kiprono',
    admissionDate: '2026-08-26',
    dailyRateKES: 25000,
    hasOxygen: true,
    hasVentilator: true,
    hasTelemetry: true,
    notes: 'Post-angioplasty cardiac telemetry observation.',
    lastUpdated: '2026-08-26 10:40 AM'
  },
  {
    id: 'bed-hdu-01',
    bedNumber: 'HDU-01',
    ward: 'High Dependency Unit (HDU)',
    bedType: 'HDU',
    status: 'Occupied',
    patientName: 'Juma Hassan',
    admissionDate: '2026-08-24',
    dailyRateKES: 12000,
    hasOxygen: true,
    hasVentilator: false,
    hasTelemetry: true,
    notes: 'Step-down monitoring post-abdominal laparotomy.',
    lastUpdated: '2026-08-26 07:45 AM'
  },
  {
    id: 'bed-hdu-02',
    bedNumber: 'HDU-02',
    ward: 'High Dependency Unit (HDU)',
    bedType: 'HDU',
    status: 'Available',
    dailyRateKES: 12000,
    hasOxygen: true,
    hasVentilator: false,
    hasTelemetry: true,
    notes: 'High-flow nasal cannula connected and tested.',
    lastUpdated: '2026-08-26 10:00 AM'
  },
  {
    id: 'bed-hdu-03',
    bedNumber: 'HDU-03',
    ward: 'High Dependency Unit (HDU)',
    bedType: 'HDU',
    status: 'Available',
    dailyRateKES: 12000,
    hasOxygen: true,
    hasVentilator: false,
    hasTelemetry: true,
    notes: 'Immediate readiness for emergency step-down.',
    lastUpdated: '2026-08-26 09:15 AM'
  },
  {
    id: 'bed-mat-01',
    bedNumber: 'MAT-01',
    ward: 'Maternity Wing & Delivery Suites',
    bedType: 'Maternity',
    status: 'Occupied',
    patientName: 'Amina Abdi',
    admissionDate: '2026-08-25',
    dailyRateKES: 5000,
    hasOxygen: true,
    hasVentilator: false,
    hasTelemetry: false,
    notes: 'Postnatal recovery room. Neonatal incubator bedside.',
    lastUpdated: '2026-08-26 09:50 AM'
  },
  {
    id: 'bed-mat-02',
    bedNumber: 'MAT-02',
    ward: 'Maternity Wing & Delivery Suites',
    bedType: 'Maternity',
    status: 'Available',
    dailyRateKES: 5000,
    hasOxygen: true,
    hasVentilator: false,
    hasTelemetry: false,
    notes: 'Private delivery suite with birthing pool and fetal monitor.',
    lastUpdated: '2026-08-26 10:20 AM'
  },
  {
    id: 'bed-mat-03',
    bedNumber: 'MAT-03',
    ward: 'Maternity Wing & Delivery Suites',
    bedType: 'Maternity',
    status: 'Available',
    dailyRateKES: 5000,
    hasOxygen: true,
    hasVentilator: false,
    hasTelemetry: false,
    notes: 'Postpartum recovery bed ready.',
    lastUpdated: '2026-08-26 08:30 AM'
  },
  {
    id: 'bed-ped-01',
    bedNumber: 'PED-01',
    ward: 'Pediatric Ward & NICU',
    bedType: 'Pediatric',
    status: 'Occupied',
    patientName: 'Baby Ethan Mwangi',
    admissionDate: '2026-08-26',
    dailyRateKES: 4500,
    hasOxygen: true,
    hasVentilator: false,
    hasTelemetry: true,
    notes: 'Pediatric nebulizer support and pulse oximeter.',
    lastUpdated: '2026-08-26 10:05 AM'
  },
  {
    id: 'bed-ped-02',
    bedNumber: 'PED-02',
    ward: 'Pediatric Ward & NICU',
    bedType: 'Pediatric',
    status: 'Available',
    dailyRateKES: 4500,
    hasOxygen: true,
    hasVentilator: false,
    hasTelemetry: false,
    notes: 'Cleaned and sanitized child-friendly recovery cot.',
    lastUpdated: '2026-08-26 09:00 AM'
  },
  {
    id: 'bed-gen-01',
    bedNumber: 'GEN-M01',
    ward: 'Male General Medical Ward',
    bedType: 'General',
    status: 'Occupied',
    patientName: 'Peter Njoroge',
    admissionDate: '2026-08-24',
    dailyRateKES: 3500,
    hasOxygen: true,
    hasVentilator: false,
    hasTelemetry: false,
    notes: 'Routine orthopedic post-op recovery.',
    lastUpdated: '2026-08-26 07:30 AM'
  },
  {
    id: 'bed-gen-02',
    bedNumber: 'GEN-M02',
    ward: 'Male General Medical Ward',
    bedType: 'General',
    status: 'Available',
    dailyRateKES: 3500,
    hasOxygen: true,
    hasVentilator: false,
    hasTelemetry: false,
    notes: 'Standard electric medical bed with call button.',
    lastUpdated: '2026-08-26 08:45 AM'
  },
  {
    id: 'bed-gen-03',
    bedNumber: 'GEN-F01',
    ward: 'Female General Medical Ward',
    bedType: 'General',
    status: 'Available',
    dailyRateKES: 3500,
    hasOxygen: true,
    hasVentilator: false,
    hasTelemetry: false,
    notes: 'Freshly sterilized bedding with wall oxygen port.',
    lastUpdated: '2026-08-26 09:20 AM'
  },
  {
    id: 'bed-iso-01',
    bedNumber: 'ISO-01',
    ward: 'Negative-Pressure Isolation Unit',
    bedType: 'Isolation',
    status: 'Available',
    dailyRateKES: 15000,
    hasOxygen: true,
    hasVentilator: true,
    hasTelemetry: true,
    notes: 'HEPA filtration & negative pressure airflow active.',
    lastUpdated: '2026-08-26 10:10 AM'
  },
  {
    id: 'bed-emg-01',
    bedNumber: 'A&E-RESUS-1',
    ward: 'Accident & Emergency Trauma Bay',
    bedType: 'Emergency',
    status: 'Available',
    dailyRateKES: 2500,
    hasOxygen: true,
    hasVentilator: true,
    hasTelemetry: true,
    notes: 'Full resuscitation crash cart and defibrillator on standby.',
    lastUpdated: '2026-08-26 10:45 AM'
  }
];

export const INITIAL_AMBULANCES: AmbulanceUnit[] = [
  {
    id: 'amb-als-01',
    callSign: 'ALPHA-MED-01',
    vehicleType: 'Type C Advanced Life Support (ALS) Ambulance',
    registrationNumber: 'KDK 410A',
    status: 'Available & Ready',
    baseStation: 'Main Hospital Bay 1 (Parklands HQ)',
    crewLead: 'Lead Paramedic Kelvin Kiprono',
    crewPhone: '0713544101',
    etaMinutes: 6,
    equipment: ['Zoll X Series Defibrillator', 'Hamilton T1 Transport Ventilator', 'Lucas 3 CPR Device', 'Advanced IV & Drug Vault'],
    lastUpdated: '2026-08-26 10:42 AM'
  },
  {
    id: 'amb-als-02',
    callSign: 'BRAVO-MED-02',
    vehicleType: 'Type C Advanced Life Support (ALS) Ambulance',
    registrationNumber: 'KDM 882B',
    status: 'Dispatched / En Route',
    baseStation: 'Westlands / Expressway Dispatch Hub',
    crewLead: 'Paramedic Faith Chepngeno',
    crewPhone: '0713544102',
    etaMinutes: 8,
    currentMission: 'Dispatched to Runda for suspected myocardial infarction emergency.',
    equipment: ['Telemetry ECG Streamer', 'Portable Suction Unit', 'Spinal Traction & Splints', 'Emergency Airway Kit'],
    lastUpdated: '2026-08-26 10:35 AM'
  },
  {
    id: 'amb-nicu-01',
    callSign: 'NEO-CARE-01',
    vehicleType: 'Neonatal & Pediatric Intensive Care Ambulance',
    registrationNumber: 'KDL 194C',
    status: 'Available & Ready',
    baseStation: 'Mother & Child Centre Bay 2',
    crewLead: 'Neonatal Specialist Nurse Beatrice Otieno',
    crewPhone: '0713544103',
    etaMinutes: 10,
    equipment: ['Dräger Transport Incubator', 'Neonatal High-Frequency Ventilator', 'Nitric Oxide Delivery System', 'Syringe Infusion Pumps'],
    lastUpdated: '2026-08-26 10:20 AM'
  },
  {
    id: 'amb-bls-01',
    callSign: 'DELTA-MED-04',
    vehicleType: 'Type B Basic Life Support (BLS) Ambulance',
    registrationNumber: 'KDN 301D',
    status: 'Patient Onboard',
    baseStation: 'Upper Hill Medical Complex',
    crewLead: 'EMT Samuel Wachira',
    crewPhone: '0713544104',
    etaMinutes: 4,
    currentMission: 'Transporting stable post-trauma transfer from Satellite Clinic to A&E.',
    equipment: ['AED Defibrillator', 'Oxygen Cylinder Pack', 'Stair Chair & Stretcher', 'Basic Trauma Dressing'],
    lastUpdated: '2026-08-26 10:48 AM'
  },
  {
    id: 'amb-heli-01',
    callSign: 'AERO-MED-HELI',
    vehicleType: 'Air Ambulance Intensive Care Helicopter',
    registrationNumber: '5Y-TLH',
    status: 'Available & Ready',
    baseStation: 'Hospital Rooftop Helipad (Tower A)',
    crewLead: 'Flight Surgeon Dr. Anthony Bett',
    crewPhone: '0713544100',
    etaMinutes: 15,
    equipment: ['Aviation Grade Ventilator', 'Blood Transfusion Cooler', 'Satellite Telemetry Link', 'Multi-Parameter Flight Monitor'],
    lastUpdated: '2026-08-26 10:00 AM'
  }
];

export const INITIAL_HOSPITAL_SERVICES: HospitalServiceItem[] = [
  {
    id: 'srv-01',
    code: 'SRV-OPD-GEN',
    name: 'General Outpatient Medical Consultation',
    category: 'Consultation',
    description: 'Comprehensive physical examination, primary diagnosis, and outpatient triage.',
    standardFeeKES: 1500,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'Outpatient Department (OPD)',
    isActive: true
  },
  {
    id: 'srv-02',
    code: 'SRV-SPEC-CONS',
    name: 'Specialist Physician Consultation',
    category: 'Consultation',
    description: 'Senior Consultant review in Cardiology, Neurology, Orthopedics, or Oncology.',
    standardFeeKES: 3000,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'Specialist Clinics',
    isActive: true
  },
  {
    id: 'srv-03',
    code: 'SRV-EMG-TRIAGE',
    name: 'Accident & Emergency Trauma Triage',
    category: 'Emergency & Ambulance',
    description: 'Immediate critical trauma assessment, stabilization, and initial emergency care.',
    standardFeeKES: 2500,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'Accident & Emergency (A&E)',
    isActive: true
  },
  {
    id: 'srv-04',
    code: 'SRV-ICU-DAY',
    name: 'Intensive Care Unit (ICU) Daily Inpatient Rate',
    category: 'Bed & Inpatient',
    description: '24/7 dedicated 1:1 intensive nursing, mechanical ventilation, and multi-organ monitoring.',
    standardFeeKES: 25000,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'Intensive Care Unit',
    isActive: true
  },
  {
    id: 'srv-05',
    code: 'SRV-HDU-DAY',
    name: 'High Dependency Unit (HDU) Daily Rate',
    category: 'Bed & Inpatient',
    description: 'Continuous continuous cardiac telemetry, oxygen therapy, and close clinical supervision.',
    standardFeeKES: 12000,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'High Dependency Unit',
    isActive: true
  },
  {
    id: 'srv-06',
    code: 'SRV-GEN-WARD',
    name: 'General Medical / Surgical Ward Daily Rate',
    category: 'Bed & Inpatient',
    description: 'Standard inpatient care, routine doctor rounds, daily nursing, and meals.',
    standardFeeKES: 3500,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'Inpatient Wards',
    isActive: true
  },
  {
    id: 'srv-07',
    code: 'SRV-MAT-DELIVERY',
    name: 'Normal Vaginal Delivery (Maternity Package)',
    category: 'Maternity & Delivery',
    description: 'Midwife & Obstetrician delivery, standard 48-hour postpartum stay, and baby immunizations.',
    standardFeeKES: 45000,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'Obstetrics & Gynaecology',
    isActive: true
  },
  {
    id: 'srv-08',
    code: 'SRV-MAT-CSECTION',
    name: 'Caesarean Section Surgical Delivery',
    category: 'Surgical & Theatre',
    description: 'Elective or emergency C-section, theatre fees, anaesthesia, and 3-day inpatient stay.',
    standardFeeKES: 95000,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'Obstetrics & Gynaecology',
    isActive: true
  },
  {
    id: 'srv-09',
    code: 'SRV-LAB-CBC',
    name: 'Full Hemogram / Complete Blood Count (CBC)',
    category: 'Laboratory',
    description: 'Automated 5-part differential blood analysis with platelet count and red cell indices.',
    standardFeeKES: 1200,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'Laboratory & Pathology',
    isActive: true
  },
  {
    id: 'srv-10',
    code: 'SRV-LAB-LIPID',
    name: 'Comprehensive Fasting Lipid Profile',
    category: 'Laboratory',
    description: 'Total cholesterol, HDL, LDL, triglycerides, and cardiovascular risk calculation.',
    standardFeeKES: 1800,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'Laboratory & Pathology',
    isActive: true
  },
  {
    id: 'srv-11',
    code: 'SRV-RAD-XRAY',
    name: 'Digital Chest X-Ray (PA & Lateral)',
    category: 'Radiology & Imaging',
    description: 'High-definition digital thoracic imaging with radiologist interpretation report.',
    standardFeeKES: 2500,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'Radiology & Diagnostic Imaging',
    isActive: true
  },
  {
    id: 'srv-12',
    code: 'SRV-RAD-CT',
    name: 'Brain CT Scan (High-Resolution Multi-Slice)',
    category: 'Radiology & Imaging',
    description: '128-slice rapid volumetric computed tomography for trauma, stroke, and hemorrhage.',
    standardFeeKES: 14000,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'Radiology & Diagnostic Imaging',
    isActive: true
  },
  {
    id: 'srv-13',
    code: 'SRV-AMB-DISPATCH',
    name: 'ALS Emergency Ambulance Dispatch (Nairobi Metropolitan)',
    category: 'Emergency & Ambulance',
    description: 'Paramedic response with advanced life support, defibrillation, and hospital transport.',
    standardFeeKES: 5000,
    shaCovered: true,
    privateInsuranceEligible: true,
    departmentName: 'Emergency Transport & Dispatch',
    isActive: true
  }
];

export const INITIAL_EMERGENCY_STATUS: EmergencyStatusOverview = {
  traumaLevel: 'Level 5 Tertiary Trauma & Specialty Center',
  triageStatus: 'Normal Capacity',
  emergencyHotline: '0713544101',
  aeAvgWaitMinutes: 8,
  totalBeds: 17,
  availableBeds: 11,
  occupiedBeds: 6,
  icuAvailable: 2,
  icuTotal: 4,
  hduAvailable: 2,
  hduTotal: 3,
  maternityAvailable: 2,
  maternityTotal: 3,
  generalAvailable: 2,
  generalTotal: 3,
  ambulancesTotal: 5,
  ambulancesAvailable: 3,
  ambulancesDispatched: 2,
  lastUpdated: 'Live Telemetry Active'
};

export const mockDepartments = INITIAL_DEPARTMENTS;
export const mockDoctors = INITIAL_DOCTORS;
export const mockPatients = INITIAL_PATIENT_PROFILES;
export const mockStaffUsers = INITIAL_USERS;
export const mockAnalytics = INITIAL_ANALYTICS;
export const mockAuditLogs = INITIAL_AUDIT_LOGS;
export const mockSocialLinks = INITIAL_SOCIAL_LINKS;
export const mockInsuranceProviders = INITIAL_INSURANCE_PROVIDERS;
export const mockInsurancePolicies = INITIAL_INSURANCE_POLICIES;
export const mockHospitalBeds = INITIAL_HOSPITAL_BEDS;
export const mockAmbulances = INITIAL_AMBULANCES;
export const mockHospitalServices = INITIAL_HOSPITAL_SERVICES;
export const mockEmergencyStatus = INITIAL_EMERGENCY_STATUS;

