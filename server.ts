import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// In-memory persistent database store initialized with mock seed
import {
  INITIAL_DEPARTMENTS,
  INITIAL_DOCTORS,
  INITIAL_USERS,
  INITIAL_PATIENT_PROFILES,
  INITIAL_APPOINTMENTS,
  INITIAL_ENCOUNTERS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_LAB_ORDERS,
  INITIAL_RADIOLOGY_ORDERS,
  INITIAL_IMMUNIZATIONS,
  INITIAL_INVOICES,
  INITIAL_MPESA_PAYMENTS,
  INITIAL_PRICING,
  INITIAL_ANALYTICS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SOCIAL_LINKS
} from './src/mockData';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for live state
const db = {
  departments: [...INITIAL_DEPARTMENTS],
  doctors: [...INITIAL_DOCTORS],
  users: [...INITIAL_USERS],
  patientProfiles: [...INITIAL_PATIENT_PROFILES],
  appointments: [...INITIAL_APPOINTMENTS],
  encounters: [...INITIAL_ENCOUNTERS],
  prescriptions: [...INITIAL_PRESCRIPTIONS],
  labOrders: [...INITIAL_LAB_ORDERS],
  radiologyOrders: [...INITIAL_RADIOLOGY_ORDERS],
  immunizations: [...INITIAL_IMMUNIZATIONS],
  invoices: [...INITIAL_INVOICES],
  mpesaPayments: [...INITIAL_MPESA_PAYMENTS],
  pricing: { ...INITIAL_PRICING },
  analytics: { ...INITIAL_ANALYTICS },
  auditLogs: [...INITIAL_AUDIT_LOGS],
  socialLinks: { ...INITIAL_SOCIAL_LINKS },
  customerCareMessages: [
    {
      id: 'msg-1',
      senderId: 'sys',
      senderName: 'TERRALINKHEALTH Care Desk',
      senderRole: 'customer_care' as const,
      text: 'Jambo! Welcome to TERRALINKHEALTH Nairobi Central Hospital Support. How may our customer care officer assist you today with appointments, billing, or directions?',
      timestamp: new Date().toISOString()
    }
  ]
};

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// ----------------- API ENDPOINTS -----------------

// Health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'TERRALINKHEALTH Digital Hospital Management Platform',
    currency: 'KES',
    location: 'Nairobi County, Kenya',
    version: '2.4.0-PROD'
  });
});

// Authentication
app.post('/api/auth/patient/register', (req: Request, res: Response) => {
  const { name, email, phone, nationalId, password, dob, gender, bloodGroup, address, emergencyContact } = req.body;
  
  if (!name || !email || !phone || !nationalId || !password) {
    return res.status(400).json({ error: 'Please provide full name, email, phone, National ID and password.' });
  }

  const existing = db.users.find(u => u.email === email || u.nationalId === nationalId || u.phone === phone);
  if (existing) {
    return res.status(400).json({ error: 'A patient with this email, phone, or National ID is already registered.' });
  }

  const newUserId = `usr-pat-${Date.now()}`;
  const newPatientId = `pat-${Date.now()}`;

  const newUser = {
    id: newUserId,
    name,
    email,
    phone,
    nationalId,
    role: 'patient' as const,
    status: 'active' as const,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
    createdAt: new Date().toISOString()
  };

  const newProfile = {
    id: newPatientId,
    userId: newUserId,
    name,
    email,
    phone,
    nationalId,
    dob: dob || '1995-01-01',
    gender: gender || 'Female',
    bloodGroup: bloodGroup || 'O+',
    address: address || 'Nairobi, Kenya',
    county: 'Nairobi County',
    emergencyContact: emergencyContact || {
      name: 'Emergency Contact Person',
      relationship: 'Next of Kin',
      phone: '+254700000000'
    },
    allergies: ['No known drug allergies (NKDA)'],
    chronicConditions: [],
    insuranceProvider: 'NHIF / SHIF Scheme',
    insurancePolicyNumber: `SHIF-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.patientProfiles.push(newProfile);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: newUserId,
    userName: name,
    role: 'patient',
    action: 'Patient Self-Registration Completed',
    module: 'Auth',
    ipAddress: req.ip || '197.232.88.10',
    details: `New patient registered with National ID: ${nationalId}, Phone: ${phone}`,
    status: 'Success'
  });

  res.json({
    message: 'Registration successful. Welcome to TERRALINKHEALTH!',
    user: newUser,
    profile: newProfile,
    token: `token-${newUserId}-${Date.now()}`
  });
});

app.post('/api/auth/patient/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter your email, phone or National ID, and password.' });
  }

  const user = db.users.find(u => 
    u.role === 'patient' && 
    (u.email.toLowerCase() === identifier.toLowerCase() || 
     u.phone === identifier || 
     u.nationalId === identifier)
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid patient credentials. If you are new, please register first.' });
  }

  const profile = db.patientProfiles.find(p => p.userId === user.id || p.nationalId === user.nationalId);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    role: 'patient',
    action: 'Patient Portal Sign-In',
    module: 'Auth',
    ipAddress: req.ip || '197.232.88.10',
    details: 'Authenticated via Patient Portal.',
    status: 'Success'
  });

  res.json({
    message: 'Welcome back!',
    user,
    profile,
    token: `jwt-pat-${user.id}`
  });
});

app.post('/api/auth/staff/login', (req: Request, res: Response) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Please provide staff username/email and password.' });
  }

  const user = db.users.find(u => 
    u.role !== 'patient' && 
    (u.email.toLowerCase() === usernameOrEmail.toLowerCase() || 
     u.phone === usernameOrEmail ||
     u.name.toLowerCase().includes(usernameOrEmail.toLowerCase()))
  );

  if (!user) {
    return res.status(401).json({ error: 'Staff account not found. Please contact the Hospital Administrator.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'This staff account is currently suspended. Please contact Administration.' });
  }

  // Doctor detail if doctor
  const doctorDetail = user.role === 'doctor' ? db.doctors.find(d => d.userId === user.id || d.name === user.name) : null;

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    role: user.role,
    action: 'Staff Secure Login',
    module: 'Auth',
    ipAddress: req.ip || '10.0.1.25',
    details: `Staff member logged in with role: ${user.role} (${user.departmentName || 'Administration'})`,
    status: 'Success'
  });

  res.json({
    message: 'Staff authentication successful.',
    user,
    doctorDetail,
    token: `jwt-staff-${user.id}`,
    mustChangePassword: !!user.mustChangePassword
  });
});

app.post('/api/auth/staff/change-password', (req: Request, res: Response) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.mustChangePassword = false;

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    role: user.role,
    action: 'Staff Mandatory Password Updated',
    module: 'Auth',
    ipAddress: req.ip || '10.0.1.25',
    details: 'Initial temporary password securely replaced by staff user.',
    status: 'Success'
  });

  res.json({ message: 'Password updated successfully. Account is now fully active.', user });
});

// Staff Management (Admin)
app.get('/api/staff', (req: Request, res: Response) => {
  const staff = db.users.filter(u => u.role !== 'patient');
  res.json(staff);
});

app.post('/api/staff', (req: Request, res: Response) => {
  const { name, email, phone, role, departmentId, specialization, licenseNumber, initialPassword } = req.body;
  if (!name || !email || !phone || !role || !departmentId) {
    return res.status(400).json({ error: 'Name, email, phone, role, and department are required.' });
  }

  const dept = db.departments.find(d => d.id === departmentId);
  const newStaffId = `usr-${role}-${Date.now()}`;

  const newStaff = {
    id: newStaffId,
    name,
    email,
    phone,
    role,
    departmentId,
    departmentName: dept ? dept.name : 'General',
    specialization: specialization || 'Clinical Healthcare Provider',
    licenseNumber: licenseNumber || `KMPDC-${Math.floor(10000 + Math.random() * 90000)}`,
    mustChangePassword: true, // Requires mandatory password reset on first login!
    status: 'active' as const,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    createdAt: new Date().toISOString()
  };

  db.users.push(newStaff);

  if (role === 'doctor') {
    db.doctors.push({
      id: `doc-${Date.now()}`,
      userId: newStaffId,
      name,
      title: `Dr. ${name}`,
      departmentId,
      departmentName: dept ? dept.name : 'General',
      specialization: specialization || 'General Practitioner',
      qualifications: 'MBChB (UoN), MMed',
      licenseNumber: newStaff.licenseNumber,
      experienceYears: 5,
      consultationFeeKES: dept ? dept.consultationFeeKES : 2000,
      telemedicineAvailable: true,
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      availableHours: '08:30 AM - 05:00 PM',
      rating: 5.0,
      avatar: newStaff.avatar
    });
  }

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: 'Hospital Administrator',
    role: 'admin',
    action: `Created Staff Account for ${name}`,
    module: 'Admin',
    ipAddress: req.ip || '10.0.0.1',
    details: `Assigned Role: ${role}, Department: ${dept?.name}, Initial Password issued. Must change on first login.`,
    status: 'Success'
  });

  res.json({ message: 'Healthcare provider account created successfully.', staff: newStaff });
});

app.patch('/api/staff/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'Staff member not found.' });

  user.status = status;
  res.json({ message: `Staff account is now ${status}.`, user });
});

// Patients & Profiles
app.get('/api/patients', (req: Request, res: Response) => {
  res.json(db.patientProfiles);
});

app.get('/api/patients/:id', (req: Request, res: Response) => {
  const profile = db.patientProfiles.find(p => p.id === req.params.id || p.userId === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Patient profile not found.' });
  res.json(profile);
});

app.put('/api/patients/:id', (req: Request, res: Response) => {
  const index = db.patientProfiles.findIndex(p => p.id === req.params.id || p.userId === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Patient profile not found.' });

  db.patientProfiles[index] = { ...db.patientProfiles[index], ...req.body };
  res.json({ message: 'Patient profile updated successfully.', profile: db.patientProfiles[index] });
});

// Departments & Doctors
app.get('/api/departments', (req: Request, res: Response) => {
  res.json(db.departments);
});

app.get('/api/doctors', (req: Request, res: Response) => {
  const { departmentId } = req.query;
  if (departmentId) {
    return res.json(db.doctors.filter(d => d.departmentId === departmentId));
  }
  res.json(db.doctors);
});

app.put('/api/doctors/:id/availability', (req: Request, res: Response) => {
  const { id } = req.params;
  const { availableDays, availableHours } = req.body;
  const doctor = db.doctors.find(d => d.id === id || d.userId === id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });

  // Enforce Sunday closed
  const sanitizedDays = (availableDays || []).filter((d: string) => d !== 'Sun');
  doctor.availableDays = sanitizedDays;
  if (availableHours) doctor.availableHours = availableHours;

  res.json({ message: 'Doctor clinical schedule updated successfully.', doctor });
});

// Appointments & M-PESA
app.get('/api/appointments', (req: Request, res: Response) => {
  const { patientId, doctorId } = req.query;
  let results = db.appointments;
  if (patientId) results = results.filter(a => a.patientId === patientId || a.patientNationalId === patientId);
  if (doctorId) results = results.filter(a => a.doctorId === doctorId);
  res.json(results);
});

app.post('/api/appointments', (req: Request, res: Response) => {
  const {
    patientId,
    patientName,
    patientPhone,
    patientNationalId,
    doctorId,
    appointmentDate,
    appointmentTime,
    type,
    reason,
    mpesaReceipt
  } = req.body;

  if (!patientName || !doctorId || !appointmentDate || !appointmentTime) {
    return res.status(400).json({ error: 'Doctor, Date, Time, and Patient details are required.' });
  }

  // Check Sunday restriction
  const dateObj = new Date(appointmentDate);
  if (dateObj.getDay() === 0) {
    return res.status(400).json({ error: 'All hospital clinics are closed on Sundays. Please select Monday through Saturday.' });
  }

  const doctor = db.doctors.find(d => d.id === doctorId);
  if (!doctor) {
    return res.status(404).json({ error: 'Selected doctor not found.' });
  }

  const newAptId = `apt-${Date.now()}`;
  const isTelemedicine = type === 'Telemedicine';

  const newAppointment = {
    id: newAptId,
    patientId: patientId || `pat-${Date.now()}`,
    patientName,
    patientPhone: patientPhone || '+254712345678',
    patientNationalId: patientNationalId || '32849102',
    doctorId: doctor.id,
    doctorName: doctor.name,
    departmentId: doctor.departmentId,
    departmentName: doctor.departmentName,
    appointmentDate,
    appointmentTime,
    type: (type || 'In-Person') as 'In-Person' | 'Telemedicine',
    status: 'Booked' as const,
    reason: reason || 'General clinical consultation',
    consultationFeeKES: doctor.consultationFeeKES,
    paymentStatus: 'Paid' as const,
    mpesaReceipt: mpesaReceipt || `QHK${Math.floor(100000 + Math.random() * 900000)}KE`,
    telemedicineRoomId: isTelemedicine ? `tele-${newAptId}` : undefined,
    createdAt: new Date().toISOString()
  };

  db.appointments.unshift(newAppointment);

  // Generate automated invoice & M-PESA record
  const newInvoice = {
    id: `inv-${Date.now()}`,
    patientId: newAppointment.patientId,
    patientName: newAppointment.patientName,
    patientPhone: newAppointment.patientPhone,
    date: new Date().toISOString().split('T')[0],
    dueDate: appointmentDate,
    status: 'Paid' as const,
    items: [
      {
        description: `${doctor.departmentName} Consultation (${doctor.name}) - ${type}`,
        category: 'Consultation' as const,
        amountKES: doctor.consultationFeeKES
      }
    ],
    totalKES: doctor.consultationFeeKES,
    paidAmountKES: doctor.consultationFeeKES,
    balanceKES: 0,
    paymentMethod: 'M-PESA Express',
    mpesaReceipt: newAppointment.mpesaReceipt
  };
  db.invoices.unshift(newInvoice);

  db.mpesaPayments.unshift({
    id: `mps-${Date.now()}`,
    patientId: newAppointment.patientId,
    patientName: newAppointment.patientName,
    phone: newAppointment.patientPhone,
    amountKES: doctor.consultationFeeKES,
    reference: newAptId,
    serviceType: 'Consultation',
    status: 'Completed',
    mpesaReceiptNumber: newAppointment.mpesaReceipt,
    transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
  });

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: newAppointment.patientId,
    userName: newAppointment.patientName,
    role: 'patient',
    action: `Booked ${type} Appointment with ${doctor.name}`,
    module: 'Queue',
    ipAddress: req.ip || '197.232.88.10',
    details: `Consultation fee KES ${doctor.consultationFeeKES} confirmed via M-PESA ${newAppointment.mpesaReceipt}`,
    status: 'Success'
  });

  res.json({
    message: 'Appointment booked and confirmed successfully!',
    appointment: newAppointment,
    invoice: newInvoice
  });
});

app.patch('/api/appointments/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const apt = db.appointments.find(a => a.id === id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found.' });

  apt.status = status;
  if (notes) apt.notes = notes;

  res.json({ message: `Appointment status updated to ${status}.`, appointment: apt });
});

// M-PESA STK Push Simulation
app.post('/api/mpesa/stk-push', (req: Request, res: Response) => {
  const { phone, amountKES, reference, serviceType } = req.body;
  if (!phone || !amountKES) {
    return res.status(400).json({ error: 'Phone number and amount in KES are required.' });
  }

  // Generate Safaricom M-PESA checkout request simulation
  const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(10000 + Math.random() * 90000)}`;
  const mpesaReceiptNumber = `QHK${Math.floor(10000000 + Math.random() * 90000000).toString(36).toUpperCase()}`;

  res.json({
    ResponseCode: '0',
    ResponseDescription: 'Success. Request accepted for processing.',
    MerchantRequestID: `MR-${Date.now()}`,
    CheckoutRequestID: checkoutRequestId,
    CustomerMessage: `Please check your phone ${phone} to enter your M-PESA PIN for KES ${amountKES}.`,
    simulatedReceipt: mpesaReceiptNumber,
    amountKES,
    phone
  });
});

// EMR / Medical Records
app.get('/api/emr/encounters', (req: Request, res: Response) => {
  const { patientId } = req.query;
  if (patientId) {
    return res.json(db.encounters.filter(e => e.patientId === patientId));
  }
  res.json(db.encounters);
});

app.post('/api/emr/encounters', (req: Request, res: Response) => {
  const {
    patientId,
    patientName,
    doctorId,
    doctorName,
    departmentName,
    visitType,
    chiefComplaint,
    historyOfPresentIllness,
    vitals,
    examinationNotes,
    diagnoses,
    treatmentPlan,
    admissionStatus,
    referralDepartment,
    followUpDate
  } = req.body;

  const newEncounter = {
    id: `enc-${Date.now()}`,
    patientId,
    patientName,
    doctorId,
    doctorName,
    departmentName: departmentName || 'Clinical OPD',
    visitDate: new Date().toISOString().split('T')[0],
    visitType: visitType || 'Outpatient',
    chiefComplaint: chiefComplaint || '',
    historyOfPresentIllness: historyOfPresentIllness || '',
    vitals: vitals || {
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRateBpm: 75,
      respiratoryRateBpm: 18,
      temperatureCelsius: 36.6,
      oxygenSaturationPercent: 98,
      bmi: 23.0,
      recordedAt: new Date().toISOString(),
      recordedBy: doctorName
    },
    examinationNotes: examinationNotes || '',
    diagnoses: diagnoses || [{ code: 'Z00.00', name: 'General medical examination', type: 'Primary' }],
    treatmentPlan: treatmentPlan || '',
    admissionStatus: admissionStatus || 'None',
    referralDepartment,
    followUpDate
  };

  db.encounters.unshift(newEncounter);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: doctorId,
    userName: doctorName,
    role: 'doctor',
    action: `Recorded Clinical Encounter for ${patientName}`,
    module: 'EMR',
    ipAddress: req.ip || '10.0.2.14',
    details: `Encounter ID ${newEncounter.id} with ${newEncounter.diagnoses.length} diagnosis codes.`,
    status: 'Success'
  });

  res.json({ message: 'Clinical encounter note saved securely.', encounter: newEncounter });
});

// Prescriptions
app.get('/api/emr/prescriptions', (req: Request, res: Response) => {
  const { patientId } = req.query;
  if (patientId) {
    return res.json(db.prescriptions.filter(p => p.patientId === patientId));
  }
  res.json(db.prescriptions);
});

app.post('/api/emr/prescriptions', (req: Request, res: Response) => {
  const { patientId, patientName, doctorId, doctorName, medications } = req.body;
  if (!medications || medications.length === 0) {
    return res.status(400).json({ error: 'At least one medication is required.' });
  }

  const totalPriceKES = medications.reduce((sum: number, m: any) => sum + (m.priceKES || 300), 0);

  const newRx = {
    id: `rx-${Date.now()}`,
    patientId,
    patientName,
    doctorId,
    doctorName,
    prescribedDate: new Date().toISOString().split('T')[0],
    status: 'Pending' as const,
    medications,
    totalPriceKES
  };

  db.prescriptions.unshift(newRx);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: doctorId,
    userName: doctorName,
    role: 'doctor',
    action: `Issued Electronic Prescription for ${patientName}`,
    module: 'Pharmacy',
    ipAddress: req.ip || '10.0.2.14',
    details: `Prescribed ${medications.length} items routed to Hospital Pharmacy queue.`,
    status: 'Success'
  });

  res.json({ message: 'Prescription created and forwarded to Pharmacy.', prescription: newRx });
});

app.patch('/api/emr/prescriptions/:id/dispense', (req: Request, res: Response) => {
  const { id } = req.params;
  const { dispensedBy } = req.body;
  const rx = db.prescriptions.find(p => p.id === id);
  if (!rx) return res.status(404).json({ error: 'Prescription not found.' });

  rx.status = 'Dispensed';
  rx.dispensedBy = dispensedBy || 'Pharm. Lucy Njeri';
  rx.dispensedAt = new Date().toISOString();

  res.json({ message: 'Medications successfully dispensed to patient.', prescription: rx });
});

// Lab Orders (Crucial workflow for Doctor & Lab Tech)
app.get('/api/emr/lab-orders', (req: Request, res: Response) => {
  const { patientId, status } = req.query;
  let results = db.labOrders;
  if (patientId) results = results.filter(l => l.patientId === patientId);
  if (status) results = results.filter(l => l.status === status);
  res.json(results);
});

app.post('/api/emr/lab-orders', (req: Request, res: Response) => {
  const {
    patientId,
    patientName,
    patientAge,
    patientGender,
    doctorId,
    doctorName,
    departmentName,
    testName,
    testCategory,
    clinicalIndication,
    priority,
    sampleType,
    priceKES
  } = req.body;

  const newLabOrder = {
    id: `lab-${Date.now()}`,
    patientId,
    patientName,
    patientAge: patientAge || 30,
    patientGender: patientGender || 'Female',
    doctorId,
    doctorName,
    departmentName: departmentName || 'Clinical OPD',
    orderedDate: new Date().toISOString().split('T')[0],
    clinicalIndication: clinicalIndication || 'Diagnostic workup',
    priority: (priority || 'Routine') as 'Routine' | 'Urgent' | 'STAT Emergency',
    status: 'Requested' as const,
    testName,
    testCategory: (testCategory || 'Hematology') as any,
    priceKES: priceKES || 1200,
    sampleType: sampleType || 'Whole Blood'
  };

  db.labOrders.unshift(newLabOrder);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: doctorId,
    userName: doctorName,
    role: 'doctor',
    action: `Doctor Ordered Lab Investigation: ${testName}`,
    module: 'Lab',
    ipAddress: req.ip || '10.0.2.14',
    details: `Priority: ${priority}, Patient: ${patientName}`,
    status: 'Success'
  });

  res.json({ message: 'Laboratory investigation request submitted.', labOrder: newLabOrder });
});

// Lab Technician updates results
app.put('/api/emr/lab-orders/:id/results', (req: Request, res: Response) => {
  const { id } = req.params;
  const { results, technicianNotes, criticalAlert, conductedByLabTech } = req.body;

  const labOrder = db.labOrders.find(l => l.id === id);
  if (!labOrder) return res.status(404).json({ error: 'Lab order not found.' });

  labOrder.results = results || [];
  labOrder.technicianNotes = technicianNotes || 'Specimen processed and verified in accordance with ISO 15189 lab standards.';
  labOrder.criticalAlert = !!criticalAlert;
  labOrder.conductedByLabTech = conductedByLabTech || 'Mr. Dennis Kipkoech (Chief Lab Scientist)';
  labOrder.status = 'Results Ready';
  labOrder.completedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'lab-tech-1',
    userName: conductedByLabTech || 'Lab Technologist',
    role: 'lab_tech',
    action: `Lab Results Signed & Released for ${labOrder.patientName}`,
    module: 'Lab',
    ipAddress: req.ip || '10.0.4.12',
    details: `Test: ${labOrder.testName}, Critical Alert: ${criticalAlert ? 'YES' : 'NO'}`,
    status: 'Success'
  });

  res.json({ message: 'Laboratory results entered and verified successfully.', labOrder });
});

// Radiology Orders
app.get('/api/emr/radiology', (req: Request, res: Response) => {
  const { patientId } = req.query;
  if (patientId) {
    return res.json(db.radiologyOrders.filter(r => r.patientId === patientId));
  }
  res.json(db.radiologyOrders);
});

app.post('/api/emr/radiology', (req: Request, res: Response) => {
  const {
    patientId,
    patientName,
    doctorId,
    doctorName,
    modality,
    bodyPart,
    clinicalHistory,
    priority,
    priceKES
  } = req.body;

  const newRadOrder = {
    id: `rad-${Date.now()}`,
    patientId,
    patientName,
    doctorId,
    doctorName,
    orderedDate: new Date().toISOString().split('T')[0],
    modality: modality || 'X-Ray',
    bodyPart: bodyPart || 'Chest PA',
    clinicalHistory: clinicalHistory || 'Evaluation of symptoms',
    priority: (priority || 'Routine') as any,
    status: 'Scheduled' as const,
    priceKES: priceKES || 2000
  };

  db.radiologyOrders.unshift(newRadOrder);
  res.json({ message: 'Radiology investigation scheduled.', radiologyOrder: newRadOrder });
});

app.put('/api/emr/radiology/:id/report', (req: Request, res: Response) => {
  const { id } = req.params;
  const { findings, impression, recommendations, radiologistName, imageUrl } = req.body;

  const order = db.radiologyOrders.find(r => r.id === id);
  if (!order) return res.status(404).json({ error: 'Radiology order not found.' });

  order.findings = findings;
  order.impression = impression;
  order.recommendations = recommendations;
  order.radiologistName = radiologistName || 'Dr. Miriam Wangari, MMed (Radiology)';
  order.status = 'Report Generated';
  order.completedAt = new Date().toISOString();
  if (imageUrl) order.imageUrl = imageUrl;

  res.json({ message: 'Radiology report uploaded and available for review.', radiologyOrder: order });
});

// Immunizations
app.get('/api/emr/immunizations', (req: Request, res: Response) => {
  const { patientId } = req.query;
  if (patientId) {
    return res.json(db.immunizations.filter(i => i.patientId === patientId));
  }
  res.json(db.immunizations);
});

// Hospital Social Links (Admin Configurable)
app.get('/api/hospital/social-links', (req: Request, res: Response) => {
  res.json(db.socialLinks);
});

app.put('/api/hospital/social-links', (req: Request, res: Response) => {
  const { facebook, twitter, instagram, whatsapp, phoneHotline, email, address } = req.body;
  db.socialLinks = {
    facebook: facebook || db.socialLinks.facebook,
    twitter: twitter || db.socialLinks.twitter,
    instagram: instagram || db.socialLinks.instagram,
    whatsapp: whatsapp || db.socialLinks.whatsapp,
    phoneHotline: phoneHotline || db.socialLinks.phoneHotline,
    email: email || db.socialLinks.email,
    address: address || db.socialLinks.address
  };

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: 'Hospital Administrator',
    role: 'admin',
    action: 'Hospital Official Social & Contact Channels Updated',
    module: 'Admin',
    ipAddress: req.ip || '10.0.0.1',
    details: `Updated Facebook, X/Twitter, Instagram, and WhatsApp hotline configurations.`,
    status: 'Success'
  });

  res.json({ message: 'Hospital communication channels and social links saved.', socialLinks: db.socialLinks });
});

// Invoices & Billing
app.get('/api/billing/invoices', (req: Request, res: Response) => {
  const { patientId } = req.query;
  if (patientId) {
    return res.json(db.invoices.filter(i => i.patientId === patientId));
  }
  res.json(db.invoices);
});

app.post('/api/billing/invoices', (req: Request, res: Response) => {
  const { patientId, patientName, patientPhone, items, dueDate, notes, status } = req.body;
  if (!patientName || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Patient name and at least one billable item are required.' });
  }

  const totalKES = items.reduce((sum: number, it: any) => sum + (Number(it.amountKES) || 0), 0);
  const isPaid = status === 'Paid';

  const newInvoice = {
    id: `inv-${Date.now()}`,
    patientId: patientId || `pat-${Date.now()}`,
    patientName,
    patientPhone: patientPhone || '+254700000000',
    date: new Date().toISOString().split('T')[0],
    dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: (status || 'Unpaid') as 'Paid' | 'Unpaid' | 'Overdue' | 'Partially Paid',
    items: items.map((it: any) => ({
      description: it.description || 'Hospital Service',
      category: it.category || 'Consultation',
      amountKES: Number(it.amountKES) || 0
    })),
    totalKES,
    paidAmountKES: isPaid ? totalKES : 0,
    balanceKES: isPaid ? 0 : totalKES,
    paymentMethod: isPaid ? 'M-PESA / Hospital Cash' : undefined,
    mpesaReceipt: isPaid ? `QHK${Math.floor(100000 + Math.random() * 900000)}KE` : undefined
  };

  db.invoices.unshift(newInvoice);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: 'Hospital Billing Department',
    role: 'admin',
    action: `Created Patient Invoice #${newInvoice.id} for ${patientName}`,
    module: 'Billing',
    ipAddress: req.ip || '10.0.0.1',
    details: `Total Amount KES ${totalKES.toLocaleString()} with ${items.length} line items.`,
    status: 'Success'
  });

  res.json({ message: 'Patient invoice generated successfully.', invoice: newInvoice });
});

app.put('/api/billing/invoices/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const invoice = db.invoices.find(i => i.id === id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

  const { items, status, paidAmountKES, dueDate } = req.body;
  if (items && Array.isArray(items)) {
    invoice.items = items;
    invoice.totalKES = items.reduce((sum: number, it: any) => sum + (Number(it.amountKES) || 0), 0);
  }
  if (status) invoice.status = status;
  if (dueDate) invoice.dueDate = dueDate;
  if (paidAmountKES !== undefined) {
    invoice.paidAmountKES = Number(paidAmountKES);
    invoice.balanceKES = Math.max(0, invoice.totalKES - invoice.paidAmountKES);
    if (invoice.balanceKES === 0) invoice.status = 'Paid';
    else if (invoice.paidAmountKES > 0) invoice.status = 'Partially Paid';
  }

  res.json({ message: 'Invoice updated successfully.', invoice });
});

app.post('/api/billing/invoices/:id/pay', (req: Request, res: Response) => {
  const { id } = req.params;
  const { amountKES, mpesaReceipt, paymentMethod } = req.body;
  const invoice = db.invoices.find(i => i.id === id);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });

  const payAmt = Number(amountKES) || invoice.balanceKES;
  invoice.paidAmountKES = (invoice.paidAmountKES || 0) + payAmt;
  invoice.balanceKES = Math.max(0, invoice.totalKES - invoice.paidAmountKES);
  invoice.status = invoice.balanceKES === 0 ? 'Paid' : 'Partially Paid';
  invoice.mpesaReceipt = mpesaReceipt || `QHK${Math.floor(100000 + Math.random() * 900000)}KE`;
  invoice.paymentMethod = paymentMethod || 'M-PESA Express';

  db.mpesaPayments.unshift({
    id: `mps-${Date.now()}`,
    patientId: invoice.patientId,
    patientName: invoice.patientName,
    phone: invoice.patientPhone,
    amountKES: payAmt,
    reference: invoice.id,
    serviceType: 'General',
    status: 'Completed',
    mpesaReceiptNumber: invoice.mpesaReceipt,
    transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19)
  });

  res.json(invoice);
});

// System Pricing
app.get('/api/billing/pricing', (req: Request, res: Response) => {
  res.json(db.pricing);
});

app.put('/api/billing/pricing', (req: Request, res: Response) => {
  db.pricing = { ...db.pricing, ...req.body };
  
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: 'Hospital Administrator',
    role: 'admin',
    action: 'Hospital Tariff & Price Schedule Modified',
    module: 'Admin',
    ipAddress: req.ip || '10.0.0.1',
    details: 'Updated consultation fees, laboratory investigation tariffs, and pharmaceutical prices.',
    status: 'Success'
  });

  res.json({ message: 'System pricing updated successfully in KES.', pricing: db.pricing });
});

app.post('/api/billing/pricing/item', (req: Request, res: Response) => {
  const { type, item } = req.body;
  if (!type || !item || !item.name || item.priceKES === undefined) {
    return res.status(400).json({ error: 'Item type, name, and price in KES are required.' });
  }

  if (type === 'lab') {
    db.pricing.commonLabs.push({
      name: item.name,
      code: item.code || `LAB-${Math.floor(100 + Math.random() * 900)}`,
      category: item.category || 'Biochemistry',
      priceKES: Number(item.priceKES)
    });
  } else if (type === 'radiology') {
    db.pricing.commonRadiology.push({
      name: item.name,
      modality: item.modality || 'Ultrasound',
      priceKES: Number(item.priceKES)
    });
  } else if (type === 'pharmacy') {
    db.pricing.commonPharmacy.push({
      name: item.name,
      dosage: item.dosage || 'Standard Pack',
      category: item.category || 'General',
      unitPriceKES: Number(item.priceKES)
    });
  }

  res.json({ message: 'New tariff item added to catalog.', pricing: db.pricing });
});

// Analytics & Audit
app.get('/api/analytics', (req: Request, res: Response) => {
  res.json(db.analytics);
});

app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json(db.auditLogs);
});

// Customer Care Chat Messages
app.get('/api/chat/messages', (req: Request, res: Response) => {
  res.json(db.customerCareMessages);
});

app.post('/api/chat/messages', (req: Request, res: Response) => {
  const { senderId, senderName, senderRole, text } = req.body;
  if (!text) return res.status(400).json({ error: 'Message text is required.' });

  const newMsg = {
    id: `msg-${Date.now()}`,
    senderId: senderId || 'pat',
    senderName: senderName || 'Patient',
    senderRole: senderRole || 'patient',
    text,
    timestamp: new Date().toISOString()
  };

  db.customerCareMessages.push(newMsg);

  // Automated operator response simulation if sent by patient
  if (senderRole === 'patient') {
    setTimeout(() => {
      db.customerCareMessages.push({
        id: `msg-resp-${Date.now()}`,
        senderId: 'desk-operator',
        senderName: 'Sister Lucy (Hospital Helpdesk)',
        senderRole: 'customer_care',
        text: `Thank you for your message, ${senderName}. Your query has been received by the Nairobi Central Hospital Customer Service desk. For emergencies, please call our direct hotline at +254 700 999 911 or visit our A&E Ground Floor immediately.`,
        timestamp: new Date().toISOString()
      });
    }, 1500);
  }

  res.json(newMsg);
});

// AI Health Assistant (Server-Side Gemini 2.5 Flash with deep EMR & Health System Intelligence)
app.post('/api/gemini/health-assistant', async (req: Request, res: Response) => {
  const { prompt, patientContext } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  // Aggregate rich patient EMR data for tracing
  let patId = patientContext?.id || 'pat-1';
  let matchedPatient = db.patientProfiles.find(p => p.id === patId || p.userId === patId || p.nationalId === patientContext?.nationalId) || db.patientProfiles[0];
  
  const patientEncounters = db.encounters.filter(e => e.patientId === matchedPatient.id);
  const patientLabOrders = db.labOrders.filter(l => l.patientId === matchedPatient.id);
  const patientRadOrders = db.radiologyOrders.filter(r => r.patientId === matchedPatient.id);
  const patientPrescriptions = db.prescriptions.filter(p => p.patientId === matchedPatient.id);
  const patientAppointments = db.appointments.filter(a => a.patientId === matchedPatient.id);
  const patientInvoices = db.invoices.filter(i => i.patientId === matchedPatient.id);

  // Build structured summary for the AI
  const emrContextSummary = {
    patient: {
      name: matchedPatient.name,
      dob: matchedPatient.dob,
      gender: matchedPatient.gender,
      bloodGroup: matchedPatient.bloodGroup,
      allergies: matchedPatient.allergies,
      chronicConditions: matchedPatient.chronicConditions,
      insurance: matchedPatient.insuranceProvider
    },
    latestEncounters: patientEncounters.slice(0, 3).map(e => ({
      date: e.visitDate,
      doctor: e.doctorName,
      department: e.departmentName,
      chiefComplaint: e.chiefComplaint,
      diagnoses: e.diagnoses,
      vitals: e.vitals,
      plan: e.treatmentPlan
    })),
    recentLabTests: patientLabOrders.slice(0, 5).map(l => ({
      testName: l.testName,
      orderedDate: l.orderedDate,
      status: l.status,
      results: l.results,
      criticalAlert: l.criticalAlert,
      technicianNotes: l.technicianNotes
    })),
    recentRadiology: patientRadOrders.slice(0, 3).map(r => ({
      modality: r.modality,
      bodyPart: r.bodyPart,
      status: r.status,
      findings: r.findings,
      impression: r.impression
    })),
    activePrescriptions: patientPrescriptions.slice(0, 3).map(p => ({
      prescribedDate: p.prescribedDate,
      doctor: p.doctorName,
      status: p.status,
      medications: p.medications
    })),
    upcomingAppointments: patientAppointments.filter(a => a.status === 'Booked').map(a => ({
      date: a.appointmentDate,
      time: a.appointmentTime,
      doctor: a.doctorName,
      department: a.departmentName,
      type: a.type
    })),
    outstandingBills: patientInvoices.filter(i => i.status !== 'Paid').map(i => ({
      invoiceId: i.id,
      totalKES: i.totalKES,
      balanceKES: i.balanceKES,
      dueDate: i.dueDate
    }))
  };

  try {
    const ai = getGeminiClient();
    
    if (!ai) {
      // High-intelligence fallback response synthesizing live EMR data
      const queryLower = prompt.toLowerCase();
      let fallbackText = `### 🌟 TERRALINKHEALTH AI Health Guidance\n\nJambo **${matchedPatient.name}**! I have securely accessed and traced your real-time hospital records:\n\n`;

      if (queryLower.includes('lab') || queryLower.includes('result') || queryLower.includes('test') || queryLower.includes('trace')) {
        fallbackText += `#### 🔬 **Your Traced Laboratory Investigations**\n`;
        if (patientLabOrders.length > 0) {
          patientLabOrders.slice(0, 2).forEach(l => {
            fallbackText += `- **${l.testName}** (${l.orderedDate}) — Status: **${l.status}**\n`;
            if (l.results && l.results.length > 0) {
              l.results.forEach(r => {
                const flagEmoji = r.flag === 'High' ? '⚠️ High' : r.flag === 'Low' ? '⚠️ Low' : '✅ Normal';
                fallbackText += `  - ${r.parameter}: **${r.value} ${r.unit}** (Ref: ${r.referenceRange}) [${flagEmoji}]\n`;
              });
            }
          });
        } else {
          fallbackText += `- No pending laboratory investigations on file.\n`;
        }
      }

      if (queryLower.includes('prescript') || queryLower.includes('medicine') || queryLower.includes('drug') || queryLower.includes('dawa') || queryLower.includes('trace')) {
        fallbackText += `\n#### 💊 **Active Prescription & Medication Instructions**\n`;
        if (patientPrescriptions.length > 0) {
          patientPrescriptions.forEach(p => {
            p.medications.forEach(m => {
              fallbackText += `- **${m.drugName}** (${m.dosage}): Take ${m.frequency} for ${m.duration}. *Instructions*: ${m.instructions}\n`;
            });
          });
        } else {
          fallbackText += `- No active electronic prescriptions found.\n`;
        }
      }

      if (queryLower.includes('appointment') || queryLower.includes('visit') || queryLower.includes('doctor')) {
        fallbackText += `\n#### 📅 **Scheduled Clinic Visits**\n`;
        if (patientAppointments.length > 0) {
          patientAppointments.forEach(a => {
            fallbackText += `- **${a.departmentName}** with **${a.doctorName}** on **${a.appointmentDate} at ${a.appointmentTime}** (${a.type})\n`;
          });
        } else {
          fallbackText += `- You have no upcoming appointments. You can book one in the Patient Portal.\n`;
        }
      }

      if (queryLower.includes('bill') || queryLower.includes('invoice') || queryLower.includes('kes') || queryLower.includes('cost') || queryLower.includes('pay')) {
        const totalBal = patientInvoices.reduce((acc, curr) => acc + curr.balanceKES, 0);
        fallbackText += `\n#### 💳 **Billing & Invoices**\n- Outstanding balance: **KES ${totalBal.toLocaleString()}** (Instant M-PESA pay available in your Invoices tab).\n`;
      }

      fallbackText += `\n#### 🎯 **Health & Wellness Recommendations**\n`;
      fallbackText += `- **Blood Group & Precautions**: Blood Group **${matchedPatient.bloodGroup}**. Allergies: *${matchedPatient.allergies.join(', ')}*.\n`;
      fallbackText += `- **Hydration & Diet**: Maintain 2.5L daily hydration, reduce sodium intake, and maintain balanced nutrition rich in leafy greens and lean proteins.\n`;
      fallbackText += `- **Need immediate clinical assistance?**: You can book an in-person or telemedicine session right here in the portal, or contact the 24/7 hotline at **+254 700 999 911**.\n\n*Medical Notice: AI health guidance is for supportive educational tracking and does not replace evaluation by a registered KMPDC medical practitioner.*`;

      return res.json({ reply: fallbackText });
    }

    const systemInstruction = `You are "TERRA-AI", the cutting-edge, empathetic, and culturally aware AI Health Intelligence Engine powering TERRALINKHEALTH (Nairobi County, Kenya).
You represent the Future of Health Systems: an AI-driven, proactive, clinical partner that helps patients trace all their health data, understand their records, and achieve their health goals.

Core Directives:
1. DATA TRACING: You have full access to the patient's authenticated EMR records provided in JSON (demographics, encounters, diagnoses, vitals, lab biomarker results with high/low flags, radiology findings, electronic prescriptions, upcoming appointments, and billing invoices).
2. Proactively answer specific patient questions by inspecting their exact data. When they ask "Trace my data", "What were my lab results?", "What are my medications?", or "Explain my diagnosis", give precise, structured answers referencing their actual lab values, prescription instructions, and doctor notes.
3. HEALTH GOAL EMPOWERMENT: Help the patient achieve their specific health needs (e.g. managing hypertension, diabetes, nutrition, weight, hydration, post-consultation recovery, immunization schedules, preventive wellness).
4. CULTURALLY & LOCALLY RELEVANT: Fluent in English and friendly Kenyan context / Swahili healthcare terms (Homa, Kikohozi, Dawa, Malipo ya M-PESA, Bima ya SHIF/NHIF, Hospitali).
5. CLARITY & FORMAT: Use clean markdown with clear bold headings, bullet points, and highlight abnormal flags (⚠️) or positive milestones (✅).
6. SAFETY & ETHICS: Include a succinct professional medical disclaimer at the end reminding that AI guidance is supportive and cannot replace in-person doctor consultations or acute emergency treatment at A&E.`;

    const userPromptWithContext = `=== PATIENT AUTHENTICATED EMR & BILLING DATA ===
${JSON.stringify(emrContextSummary, null, 2)}

=== PATIENT QUERY ===
"${prompt}"

Please provide a comprehensive, intelligent, supportive, and data-grounded response helping the patient trace their data and achieve their health goals.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPromptWithContext,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95
      }
    });

    const replyText = response.text || 'I am currently analyzing your hospital records. Please consult your physician for detailed medical evaluation.';
    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Gemini Health Assistant Error:', error);
    res.status(500).json({
      reply: `### 🌟 TERRALINKHEALTH AI Health Engine\n\nJambo **${matchedPatient.name}**!\n\nWe have traced your records:\n- **Blood Group**: ${matchedPatient.bloodGroup}\n- **Active Prescriptions**: ${patientPrescriptions.length} on file\n- **Recent Lab Reports**: ${patientLabOrders.length} test records verified\n- **Outstanding Balance**: KES ${patientInvoices.reduce((acc, curr) => acc + curr.balanceKES, 0).toLocaleString()}\n\nFor urgent inquiries, please reach our 24/7 hotline at **+254 700 999 911** or consult your doctor via the Telemedicine tab.`,
      error: error?.message || 'Server error'
    });
  }
});

// ----------------- VITE / SERVER INITIALIZATION -----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`TERRALINKHEALTH Hospital Platform running on port ${PORT}`);
    console.log(`Nairobi County, Kenya Digital Health Network`);
    console.log(`====================================================`);
  });
}

startServer();
