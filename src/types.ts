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
  notificationPreferences?: {
    smsAlerts: boolean;
    emailReports: boolean;
    queueAlerts: boolean;
    criticalLabPanicAlerts?: boolean;
    statRadiologyAlerts?: boolean;
    emergencyTraumaAlerts?: boolean;
    pharmacyDispenseAlerts?: boolean;
  };
  createdAt: string;
}

export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed' | 'Separated';

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
  maritalStatus?: MaritalStatus;
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
  shaNumber?: string;
  shaDocumentName?: string;
  shaDocumentUrl?: string;
  avatar?: string;
  notificationPreferences?: {
    smsAlerts: boolean;
    emailReports: boolean;
    queueAlerts: boolean;
    refillReminders: boolean;
    insuranceAlerts: boolean;
    emergencyTraumaAlerts: boolean;
  };
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
  assignedDoctorIds?: string[];
  assignedNurseIds?: string[];
  equipmentIds?: string[];
  isArchived?: boolean;
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
  module: 'Auth' | 'EMR' | 'Billing' | 'Lab' | 'Pharmacy' | 'Admin' | 'Telemedicine' | 'Queue' | 'Emergency' | 'System';
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

export interface InsuranceProviderPlan {
  id: string;
  providerName: string; // e.g. "Social Health Authority (SHA / NHIF)", "Jubilee Health Insurance", "Britam Insurance", "AAR Insurance", "CIC Medical", "Old Mutual Kenya"
  providerCode: string;
  logoUrl?: string;
  category: 'National Public Scheme' | 'Private Underwriter' | 'Corporate HMO';
  planTiers: {
    tierName: string; // e.g. "SHA Essential Benefit Package", "Silver Care", "Gold Comprehensive", "Executive Platinum"
    tierCode: string;
    monthlyPremiumKES: number;
    annualPremiumKES: number;
    inpatientLimitKES: number;
    outpatientLimitKES: number;
    maternityLimitKES: number;
    dentalLimitKES: number;
    opticalLimitKES: number;
    copayKES: number;
    preAuthRequiredAboveKES: number;
    coverageHighlights: string[];
  }[];
}

export interface PatientInsurancePolicy {
  id: string;
  patientId: string;
  patientName: string;
  patientNationalId: string;
  providerName: string;
  providerCode: string;
  policyNumber: string;
  memberNumber: string;
  principalMemberName: string;
  relationshipToPrincipal: 'Self' | 'Spouse' | 'Child' | 'Parent' | 'Dependent';
  planTier: string;
  status: 'Pending Verification' | 'Approved & Verified' | 'Pre-Authorized' | 'Suspended' | 'Expired' | 'PENDING' | 'ACTIVE';
  monthlyPremiumKES: number;
  annualPremiumKES: number;
  annualInpatientLimitKES: number;
  inpatientUsedKES: number;
  annualOutpatientLimitKES: number;
  outpatientUsedKES: number;
  copayKES: number;
  preAuthCode?: string;
  preAuthAmountKES?: number;
  preAuthProcedure?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  expiryDate: string;
  rejectionReason?: string;
  submittedAt: string;
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

export type BedType = 'ICU' | 'HDU' | 'General' | 'Maternity' | 'Pediatric' | 'Isolation' | 'Emergency';
export type BedStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | 'Cleaning';

export interface HospitalBed {
  id: string;
  bedNumber: string;
  roomNumber?: string;
  ward: string;
  bedType: BedType;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
  assignedPatientId?: string;
  assignedPatientName?: string;
  admissionDate?: string;
  dailyRateKES: number;
  hasOxygen: boolean;
  hasVentilator: boolean;
  hasTelemetry: boolean;
  notes?: string;
  lastUpdated?: string;
}

export type AmbulanceStatus = 'Available & Ready' | 'Dispatched / En Route' | 'On-Scene' | 'Patient Onboard' | 'Maintenance';

export interface AmbulanceUnit {
  id: string;
  callSign: string;
  vehicleType: string;
  registrationNumber: string;
  status: AmbulanceStatus;
  baseStation: string;
  crewLead: string;
  crewPhone: string;
  etaMinutes?: number;
  currentMission?: string;
  equipment: string[];
  lastUpdated?: string;
}

export interface HospitalServiceItem {
  id: string;
  code: string;
  name: string;
  category: 'Consultation' | 'Bed & Inpatient' | 'Laboratory' | 'Radiology & Imaging' | 'Surgical & Theatre' | 'Maternity & Delivery' | 'Emergency & Ambulance' | 'Physiotherapy & Rehab';
  description: string;
  standardFeeKES: number;
  shaCovered: boolean;
  privateInsuranceEligible: boolean;
  departmentId?: string;
  departmentName: string;
  isActive: boolean;
}

export interface EmergencyStatusOverview {
  traumaLevel: string;
  triageStatus: 'Normal Capacity' | 'Elevated Alert' | 'Critical Mass Casualty';
  emergencyHotline: string;
  aeAvgWaitMinutes: number;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  icuAvailable: number;
  icuTotal: number;
  hduAvailable: number;
  hduTotal: number;
  maternityAvailable: number;
  maternityTotal: number;
  generalAvailable: number;
  generalTotal: number;
  ambulancesTotal: number;
  ambulancesAvailable: number;
  ambulancesDispatched: number;
  lastUpdated: string;
}

export type EquipmentStatus = 'Operational' | 'Maintenance' | 'Calibration' | 'Offline';

export interface MedicalEquipment {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName: string;
  modality: string;
  status: EquipmentStatus;
  location: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  lastMaintenanceDate: string;
  nextServiceDate: string;
  operatorStaffName?: string;
  notes?: string;
  isArchived?: boolean;
}

export interface PatientReview {
  id: string;
  patientId?: string;
  name: string;
  location: string;
  age: number;
  avatar?: string;
  category: 'maternity' | 'cardiac' | 'ortho' | 'surgery' | 'chronic' | 'pediatric' | 'emergency' | 'general';
  categoryLabel: string;
  condition: string;
  doctorName: string;
  department: string;
  insurance: string;
  rating: number; // 1 to 5
  date: string;
  headline: string;
  quote: string;
  outcome: string;
  isVerified: boolean;
  isArchived?: boolean;
}

export interface HospitalAnnouncement {
  id: string;
  title: string;
  message: string;
  category: 'Emergency' | 'Advisory' | 'Clinic Update' | 'Accreditation';
  priority: 'High' | 'Medium' | 'Low';
  activeFrom: string;
  activeTo?: string;
  targetAudience: 'All' | 'Patients' | 'Staff';
  isActive: boolean;
  isArchived?: boolean;
  actionText?: string;
  actionUrl?: string;
}

export interface NurseDeskContact {
  id: string;
  departmentId: string;
  departmentName: string;
  nurseName: string;
  nurseRole: string;
  isOnline: boolean;
  shiftHours: string;
  avatar: string;
  badgeNumber: string;
}

export interface AppointmentSlotConfig {
  id: string;
  departmentId: string;
  departmentName: string;
  doctorId?: string;
  doctorName?: string;
  dayOfWeek: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  startTime: string; // e.g. "08:30"
  endTime: string;   // e.g. "17:00"
  slotDurationMinutes: number; // e.g. 30
  maxPatientsQuota: number;   // e.g. 15
  isActive: boolean;
  isArchived?: boolean;
}

export type AdmissionStatus = 'PENDING' | 'ADMITTED' | 'DISCHARGED' | 'CANCELLED';

export interface InpatientAdmission {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientNationalId: string;
  bloodGroup?: string;
  age?: number;
  gender?: string;
  reason: string; // e.g. "Acute Appendicitis / Surgical Observation"
  urgency: 'Elective' | 'Urgent' | 'Emergency' | 'Maternity / Delivery';
  preferredWard?: string;
  symptoms?: string;
  referringDoctor?: string;
  insuranceScheme?: string;
  shaNumber?: string;
  shaDocumentUrl?: string;
  status: AdmissionStatus;
  requestedAt: string;
  // Filled upon admission
  admittedAt?: string;
  assignedBedId?: string;
  assignedBedNumber?: string;
  assignedWard?: string;
  attendingDoctorId?: string;
  attendingDoctorName?: string;
  attendingNurseName?: string;
  dailyBedRateKES?: number;
  dailyAccruedBillKES?: number;
  inpatientDiagnosis?: string;
  // Filled upon discharge
  dischargedAt?: string;
  dischargeSummary?: {
    finalDiagnosis: string;
    conditionOnDischarge: 'Recovered' | 'Improved' | 'Stable';
    dischargeNotes: string;
    homeMedications: string[];
    followUpDate: string;
    dischargedByDoctor: string;
  };
  finalBill?: {
    totalKES: number;
    shaCoverageKES: number;
    patientPayableKES: number;
    mpesaReceiptNumber?: string;
    paymentStatus: 'Paid' | 'Pending';
    itemizedBreakdown: {
      category: string;
      description: string;
      amountKES: number;
    }[];
  };
}

/**
 * Calculates dynamic patient age in years from their Date of Birth string (YYYY-MM-DD)
 */
export function calculateAge(dobString?: string): number {
  if (!dobString) return 0;
  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}


