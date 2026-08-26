export type UserRole = 'patient' | 'doctor' | 'nurse' | 'lab_tech' | 'radiologist' | 'pharmacist' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  nationalId?: string;
  departmentId?: string;
  departmentName?: string;
  specialization?: string;
  licenseNumber?: string;
  mustChangePassword?: boolean;
  status: 'active' | 'suspended';
  avatar?: string;
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address: string;
  county: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: string[];
  chronicConditions: string[];
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  category: 'Clinical' | 'Surgical' | 'Diagnostic' | 'Critical Care' | 'Therapeutic' | 'Administrative' | 'Support';
  description: string;
  headOfDepartment: string;
  location: string;
  consultationFeeKES: number;
  currentQueueLength: number;
  avgWaitTimeMinutes: number;
  totalBeds?: number;
  occupiedBeds?: number;
  isOpen24Hours: boolean;
  operatingHours: string;
}

export interface Doctor {
  id: string;
  userId: string;
  name: string;
  title: string;
  departmentId: string;
  departmentName: string;
  specialization: string;
  qualifications: string;
  licenseNumber: string;
  experienceYears: number;
  consultationFeeKES: number;
  telemedicineAvailable: boolean;
  availableDays: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[];
  availableHours: string;
  rating: number;
  avatar: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientNationalId: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // e.g. "09:30 AM"
  type: 'In-Person' | 'Telemedicine';
  status: 'Booked' | 'Checked-In' | 'In-Consultation' | 'Completed' | 'Cancelled';
  reason: string;
  consultationFeeKES: number;
  paymentStatus: 'Paid' | 'Pending' | 'Waived';
  mpesaReceipt?: string;
  telemedicineRoomId?: string;
  notes?: string;
  createdAt: string;
}

export interface MpesaPayment {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  amountKES: number;
  reference: string;
  serviceType: 'Consultation' | 'Laboratory' | 'Radiology' | 'Pharmacy' | 'Inpatient' | 'General';
  status: 'Completed' | 'Pending' | 'Failed';
  mpesaReceiptNumber: string;
  transactionDate: string;
}

export interface VitalSigns {
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRateBpm: number;
  respiratoryRateBpm: number;
  temperatureCelsius: number;
  oxygenSaturationPercent: number;
  bmi: number;
  recordedAt: string;
  recordedBy: string;
}

export interface ClinicalEncounter {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  visitDate: string;
  visitType: 'Outpatient' | 'Emergency' | 'Telemedicine' | 'Inpatient';
  chiefComplaint: string;
  historyOfPresentIllness: string;
  vitals: VitalSigns;
  examinationNotes: string;
  diagnoses: {
    code: string; // ICD-10 e.g. "J06.9"
    name: string; // e.g. "Acute upper respiratory infection"
    type: 'Primary' | 'Secondary';
  }[];
  treatmentPlan: string;
  admissionStatus?: 'None' | 'Admitted to Ward' | 'Admitted to HDU' | 'Admitted to ICU' | 'Discharged';
  referralDepartment?: string;
  followUpDate?: string;
  dischargeSummary?: {
    admissionDate: string;
    dischargeDate: string;
    summary: string;
    conditionOnDischarge: 'Recovered' | 'Improved' | 'Stable';
  };
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  encounterId?: string;
  prescribedDate: string;
  status: 'Pending' | 'Dispensed' | 'Partially Dispensed' | 'Cancelled';
  medications: {
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: 'Oral' | 'IV' | 'IM' | 'Topical' | 'Inhalation';
    instructions: string;
    priceKES: number;
    dispensedQuantity?: number;
    batchNumber?: string;
  }[];
  totalPriceKES: number;
  dispensedBy?: string;
  dispensedAt?: string;
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  orderedDate: string;
  clinicalIndication: string;
  priority: 'Routine' | 'Urgent' | 'STAT Emergency';
  status: 'Requested' | 'Sample Collected' | 'In Analysis' | 'Results Ready' | 'Reviewed by Doctor';
  testName: string;
  testCategory: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Parasitology' | 'Immunology' | 'Urinalysis' | 'Endocrinology';
  priceKES: number;
  sampleType: string;
  sampleCollectedAt?: string;
  results?: {
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag: 'Normal' | 'Low' | 'High' | 'Critical';
  }[];
  technicianNotes?: string;
  criticalAlert?: boolean;
  completedAt?: string;
  conductedByLabTech?: string;
}

export interface RadiologyOrder {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  orderedDate: string;
  modality: 'X-Ray' | 'CT Scan' | 'MRI' | 'Ultrasound' | 'Mammogram' | 'Fluoroscopy';
  bodyPart: string;
  clinicalHistory: string;
  priority: 'Routine' | 'Urgent' | 'STAT Emergency';
  status: 'Scheduled' | 'Scan Completed' | 'Report Generated' | 'Reviewed';
  priceKES: number;
  findings?: string;
  impression?: string;
  recommendations?: string;
  radiologistName?: string;
  completedAt?: string;
  imageUrl?: string;
}

export interface ImmunizationRecord {
  id: string;
  patientId: string;
  vaccineName: string;
  targetDisease: string;
  doseNumber: number;
  dateAdministered: string;
  administeredBy: string;
  facility: string;
  batchNumber: string;
  nextDoseDue?: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Partially Paid';
  items: {
    id?: string;
    description: string;
    category: 'Consultation' | 'Laboratory' | 'Radiology' | 'Pharmacy' | 'Bed Charge' | 'Procedure';
    amountKES: number;
  }[];
  totalKES: number;
  totalAmountKES?: number;
  paidAmountKES: number;
  balanceKES: number;
  paymentMethod?: string;
  mpesaReceipt?: string;
  notes?: string;
}

export interface QueueTicket {
  id: string;
  ticketNumber: string; // e.g. "OPD-042", "LAB-018"
  patientId: string;
  patientName: string;
  departmentId: string;
  departmentName: string;
  issuedAt: string;
  status: 'Waiting' | 'Serving' | 'Completed' | 'Transferred' | 'No-Show';
  estimatedWaitMinutes: number;
  servingRoom?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'customer_care' | 'system' | 'ai_assistant';
  recipientId?: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  module: 'Auth' | 'EMR' | 'Billing' | 'Lab' | 'Pharmacy' | 'Admin' | 'Telemedicine' | 'Queue';
  ipAddress: string;
  details: string;
  status: 'Success' | 'Warning' | 'Failed';
}

export interface HospitalSocialLinks {
  facebook: string;
  twitter: string;
  instagram: string;
  whatsapp: string;
  phoneHotline: string;
  email: string;
  address: string;
}

export interface SystemPricing {
  consultation: {
    generalOpdKES: number;
    specialistKES: number;
    emergencyKES: number;
    telemedicineKES: number;
  };
  commonLabs: {
    name: string;
    code: string;
    category: string;
    priceKES: number;
  }[];
  commonRadiology: {
    name: string;
    modality: string;
    priceKES: number;
  }[];
  commonPharmacy: {
    name: string;
    dosage: string;
    category: string;
    unitPriceKES: number;
  }[];
}

export interface HospitalAnalytics {
  dailyVisitsToday: number;
  dailyVisitsGrowthPercent: number;
  averageWaitTimeMinutes: number;
  waitTimeChangeMinutes: number;
  currentActiveQueueLength: number;
  totalBedsOccupied: number;
  totalBedsCapacity: number;
  bedOccupancyRatePercent: number;
  totalRevenueKES: number;
  todayRevenueKES: number;
  appointmentAttendanceRatePercent: number;
  labTurnaroundAvgHours: number;
  telemedicineCallsToday: number;
  patientSatisfactionRating: number;
  departmentPerformance: {
    department: string;
    visitsToday: number;
    avgWaitMinutes: number;
    satisfactionScore: number;
    queueCount: number;
  }[];
  revenueBreakdownKES: {
    category: string;
    amountKES: number;
    percentage: number;
  }[];
  visitsHourlyTrend: {
    time: string;
    visits: number;
  }[];
}
