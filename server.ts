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
  INITIAL_SOCIAL_LINKS,
  INITIAL_INSURANCE_PROVIDERS,
  INITIAL_INSURANCE_POLICIES,
  INITIAL_HOSPITAL_BEDS,
  INITIAL_AMBULANCES,
  INITIAL_HOSPITAL_SERVICES
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
  insuranceProviders: [...INITIAL_INSURANCE_PROVIDERS],
  insurancePolicies: [...INITIAL_INSURANCE_POLICIES],
  beds: [...INITIAL_HOSPITAL_BEDS],
  ambulances: [...INITIAL_AMBULANCES],
  services: [...INITIAL_HOSPITAL_SERVICES],
  registrationCodes: new Map<string, { code: string; expiresAt: number; regData: any }>(),
  passwordResetCodes: new Map<string, { code: string; expiresAt: number; userId: string; email: string }>(),
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

// Registration Code Request (OTP sent to Patient Email & Phone)
app.post('/api/auth/patient/request-reg-code', (req: Request, res: Response) => {
  const { name, email, phone, nationalId } = req.body;
  if (!name || !email || !phone || !nationalId) {
    return res.status(400).json({ error: 'Please provide full name, email, phone number, and Kenyan National ID.' });
  }

  const existing = db.users.find(u => 
    (email && u.email.toLowerCase() === email.toLowerCase()) || 
    (nationalId && u.nationalId === nationalId) || 
    (phone && u.phone === phone)
  );

  if (existing) {
    return res.status(400).json({ error: 'A patient with this email, National ID, or phone is already registered. Please sign in.' });
  }

  // Generate 6-digit registration OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity
  const regKey = email.toLowerCase().trim();

  db.registrationCodes.set(regKey, {
    code,
    expiresAt,
    regData: req.body
  });

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'guest',
    userName: name,
    role: 'patient',
    action: 'Patient Registration Code Generated',
    module: 'Auth',
    ipAddress: req.ip || '197.232.88.10',
    details: `Registration OTP code sent to email: ${email} and SMS: ${phone}`,
    status: 'Success'
  });

  res.json({
    message: `Security registration code sent to ${email} and ${phone}.`,
    verificationCode: code, // returned for live simulation in dev/preview
    email,
    phone,
    expiresInMinutes: 15
  });
});

// Verify Registration Code and Complete Patient Creation
app.post('/api/auth/patient/verify-and-register', (req: Request, res: Response) => {
  const { email, code, name, phone, nationalId, password, dob, gender, bloodGroup, address, emergencyContact } = req.body;

  if (!email || !code || !password) {
    return res.status(400).json({ error: 'Email, 6-digit verification code, and password are required.' });
  }

  const regKey = email.toLowerCase().trim();
  const stored = db.registrationCodes.get(regKey);

  // Check code validity
  if (!stored || stored.code !== code.trim()) {
    return res.status(400).json({ error: 'Invalid verification code. Please check your email or request a new code.' });
  }

  if (Date.now() > stored.expiresAt) {
    db.registrationCodes.delete(regKey);
    return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
  }

  // Clear code once used
  db.registrationCodes.delete(regKey);

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.nationalId === nationalId);
  if (existing) {
    return res.status(400).json({ error: 'Account already exists. Please log in.' });
  }

  const newUserId = `usr-pat-${Date.now()}`;
  const newPatientId = `pat-${Date.now()}`;

  const newUser = {
    id: newUserId,
    name: name || stored.regData?.name || 'Patient',
    email,
    phone: phone || stored.regData?.phone || '+254700000000',
    nationalId: nationalId || stored.regData?.nationalId || '00000000',
    role: 'patient' as const,
    status: 'active' as const,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
    createdAt: new Date().toISOString()
  };

  const newProfile = {
    id: newPatientId,
    userId: newUserId,
    name: newUser.name,
    email,
    phone: newUser.phone,
    nationalId: newUser.nationalId,
    dob: dob || stored.regData?.dob || '1995-01-01',
    gender: gender || stored.regData?.gender || 'Female',
    bloodGroup: bloodGroup || stored.regData?.bloodGroup || 'O+',
    address: address || stored.regData?.address || 'Nairobi, Kenya',
    county: 'Nairobi County',
    emergencyContact: emergencyContact || stored.regData?.emergencyContact || {
      name: 'Next of Kin',
      relationship: 'Family Member',
      phone: '+254700000000'
    },
    allergies: ['No known drug allergies (NKDA)'],
    chronicConditions: [],
    insuranceProvider: 'NHIF / SHA Scheme',
    insurancePolicyNumber: `SHA-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.patientProfiles.push(newProfile);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: newUserId,
    userName: newUser.name,
    role: 'patient',
    action: 'Patient Email-Verified Registration Completed',
    module: 'Auth',
    ipAddress: req.ip || '197.232.88.10',
    details: `Patient account verified via OTP email code for ID: ${newUser.nationalId}`,
    status: 'Success'
  });

  res.json({
    message: 'Verification successful! Your patient account is now active.',
    user: newUser,
    profile: newProfile,
    token: `token-${newUserId}-${Date.now()}`
  });
});

// Forgot Password - Request Reset Code
app.post('/api/auth/forgot-password/request-code', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Please enter your registered email, phone number, or Kenyan National ID.' });
  }

  const idLower = identifier.trim().toLowerCase();
  const user = db.users.find(u => 
    u.email.toLowerCase() === idLower || 
    u.phone === identifier.trim() || 
    u.nationalId === identifier.trim()
  );

  if (!user) {
    return res.status(404).json({ error: 'No account found matching this identifier. Please verify your details or register.' });
  }

  // Generate 6-digit Reset OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity
  const resetKey = user.email.toLowerCase().trim();

  db.passwordResetCodes.set(resetKey, {
    code,
    expiresAt,
    userId: user.id,
    email: user.email
  });

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    role: user.role,
    action: 'Password Reset OTP Code Requested',
    module: 'Auth',
    ipAddress: req.ip || '197.232.88.10',
    details: `Password reset code sent to registered contact ${user.email} / ${user.phone}`,
    status: 'Success'
  });

  res.json({
    message: `Password reset code has been sent to ${user.email} and SMS to ${user.phone}.`,
    verificationCode: code, // returned for live simulation in dev/preview
    email: user.email,
    phone: user.phone,
    userName: user.name,
    expiresInMinutes: 15
  });
});

// Forgot Password - Reset Password with Verified Code
app.post('/api/auth/forgot-password/reset', (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, 6-digit verification code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const resetKey = email.toLowerCase().trim();
  const stored = db.passwordResetCodes.get(resetKey);

  if (!stored || stored.code !== code.trim()) {
    return res.status(400).json({ error: 'Invalid verification code. Please check the code sent to your email.' });
  }

  if (Date.now() > stored.expiresAt) {
    db.passwordResetCodes.delete(resetKey);
    return res.status(400).json({ error: 'Verification code has expired. Please request a new reset code.' });
  }

  const user = db.users.find(u => u.id === stored.userId || u.email.toLowerCase() === resetKey);
  if (!user) {
    return res.status(404).json({ error: 'User account not found.' });
  }

  // Clear code after successful reset
  db.passwordResetCodes.delete(resetKey);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    role: user.role,
    action: 'Password Reset Completed Successfully',
    module: 'Auth',
    ipAddress: req.ip || '197.232.88.10',
    details: `Password updated via email OTP verification for user ${user.name} (${user.email})`,
    status: 'Success'
  });

  res.json({
    message: 'Your password has been successfully reset! You can now sign in with your new credentials.',
    success: true
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

// Insurance Providers & Policies Integration
app.get('/api/insurance/providers', (req: Request, res: Response) => {
  res.json(db.insuranceProviders);
});

app.get('/api/insurance/policies', (req: Request, res: Response) => {
  const { patientId } = req.query;
  if (patientId) {
    return res.json(db.insurancePolicies.filter(p => p.patientId === patientId));
  }
  res.json(db.insurancePolicies);
});

app.post('/api/insurance/policies', (req: Request, res: Response) => {
  const {
    patientId,
    patientName,
    patientNationalId,
    providerName,
    providerCode,
    policyNumber,
    memberNumber,
    principalMemberName,
    relationshipToPrincipal,
    planTier,
    monthlyPremiumKES,
    annualPremiumKES,
    annualInpatientLimitKES,
    annualOutpatientLimitKES,
    copayKES,
    expiryDate
  } = req.body;

  if (!patientName || !providerName || !policyNumber || !memberNumber) {
    return res.status(400).json({ error: 'Patient name, insurance provider, policy number, and member number are required.' });
  }

  // Find provider plan info for defaults if not provided
  const matchedProvider = db.insuranceProviders.find(p => p.providerName === providerName || p.providerCode === providerCode);
  const matchedTier = matchedProvider?.planTiers.find(t => t.tierName === planTier) || matchedProvider?.planTiers[0];

  const newPolicy = {
    id: `pol-${Date.now()}`,
    patientId: patientId || `pat-${Date.now()}`,
    patientName,
    patientNationalId: patientNationalId || '00000000',
    providerName,
    providerCode: providerCode || matchedProvider?.providerCode || 'INS-GEN',
    policyNumber,
    memberNumber,
    principalMemberName: principalMemberName || patientName,
    relationshipToPrincipal: relationshipToPrincipal || 'Self',
    planTier: planTier || matchedTier?.tierName || 'Standard Health Cover',
    status: 'Pending Verification' as const,
    monthlyPremiumKES: Number(monthlyPremiumKES) || matchedTier?.monthlyPremiumKES || 1500,
    annualPremiumKES: Number(annualPremiumKES) || matchedTier?.annualPremiumKES || 18000,
    annualInpatientLimitKES: Number(annualInpatientLimitKES) || matchedTier?.inpatientLimitKES || 2000000,
    inpatientUsedKES: 0,
    annualOutpatientLimitKES: Number(annualOutpatientLimitKES) || matchedTier?.outpatientLimitKES || 150000,
    outpatientUsedKES: 0,
    copayKES: Number(copayKES) || matchedTier?.copayKES || 0,
    expiryDate: expiryDate || new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    submittedAt: new Date().toISOString()
  };

  db.insurancePolicies.unshift(newPolicy);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: patientId || 'pat',
    userName: patientName,
    role: 'patient',
    action: `Submitted Insurance Policy for ${providerName}`,
    module: 'Billing',
    ipAddress: req.ip || '197.232.88.10',
    details: `Policy #${policyNumber} (Member: ${memberNumber}) sent for hospital billing desk approval.`,
    status: 'Success'
  });

  res.json({
    message: 'Insurance policy linked successfully! Hospital billing desk has received it for real-time verification and approval.',
    policy: newPolicy
  });
});

app.patch('/api/insurance/policies/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, verifiedBy, preAuthCode, preAuthAmountKES, preAuthProcedure, annualInpatientLimitKES, annualOutpatientLimitKES, copayKES, rejectionReason } = req.body;

  const policy = db.insurancePolicies.find(p => p.id === id);
  if (!policy) return res.status(404).json({ error: 'Insurance policy not found.' });

  if (status) policy.status = status;
  if (verifiedBy) policy.verifiedBy = verifiedBy;
  if (status === 'Approved & Verified' || status === 'Pre-Authorized') {
    policy.verifiedAt = new Date().toISOString();
    if (!policy.verifiedBy) policy.verifiedBy = 'Hospital Billing Desk - TERRALINKHEALTH';
  }
  if (preAuthCode) policy.preAuthCode = preAuthCode;
  if (preAuthAmountKES !== undefined) policy.preAuthAmountKES = Number(preAuthAmountKES);
  if (preAuthProcedure) policy.preAuthProcedure = preAuthProcedure;
  if (annualInpatientLimitKES !== undefined) policy.annualInpatientLimitKES = Number(annualInpatientLimitKES);
  if (annualOutpatientLimitKES !== undefined) policy.annualOutpatientLimitKES = Number(annualOutpatientLimitKES);
  if (copayKES !== undefined) policy.copayKES = Number(copayKES);
  if (rejectionReason) policy.rejectionReason = rejectionReason;

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'billing-admin',
    userName: policy.verifiedBy || 'Billing Officer',
    role: 'admin',
    action: `Insurance Policy Status Updated to ${status}`,
    module: 'Billing',
    ipAddress: req.ip || '10.0.1.1',
    details: `Policy ${policy.policyNumber} (${policy.providerName}) updated for Patient ${policy.patientName}.`,
    status: 'Success'
  });

  res.json({
    message: `Insurance policy updated to ${status}.`,
    policy
  });
});

app.post('/api/insurance/estimate-premium', (req: Request, res: Response) => {
  const { age, schemeType, dependentsCount, monthlyIncomeKES, tierPreference } = req.body;
  
  const ageNum = Number(age) || 30;
  const deps = Number(dependentsCount) || 0;
  const income = Number(monthlyIncomeKES) || 50000;

  // SHA Calculation (2.75% of income with standard KES 500 floor)
  const shaMonthly = Math.max(500, Math.round(income * 0.0275));
  const shaAnnual = shaMonthly * 12;

  // Private calculation base
  let privateBaseMonthly = 3500;
  if (tierPreference === 'executive') privateBaseMonthly = 7800;
  else if (tierPreference === 'comprehensive') privateBaseMonthly = 4800;
  
  if (ageNum > 50) privateBaseMonthly *= 1.35;
  else if (ageNum > 40) privateBaseMonthly *= 1.18;

  const totalPrivateMonthly = Math.round(privateBaseMonthly * (1 + deps * 0.45));
  const totalPrivateAnnual = totalPrivateMonthly * 12;

  res.json({
    shaEstimate: {
      provider: 'Social Health Authority (SHA)',
      monthlyPremiumKES: shaMonthly,
      annualPremiumKES: shaAnnual,
      inpatientCoverKES: 1800000,
      outpatientCoverKES: 100000,
      copayKES: 0,
      approvalSpeed: 'Instant Biometric & Digital Link'
    },
    privateEstimate: {
      provider: 'Private Underwriter (Jubilee / Britam / AAR / CIC)',
      tier: tierPreference || 'Comprehensive Care',
      monthlyPremiumKES: totalPrivateMonthly,
      annualPremiumKES: totalPrivateAnnual,
      inpatientCoverKES: tierPreference === 'executive' ? 10000000 : 5000000,
      outpatientCoverKES: tierPreference === 'executive' ? 500000 : 250000,
      copayKES: tierPreference === 'executive' ? 0 : 200,
      approvalSpeed: 'Under 15 Minutes at TERRALINKHEALTH Desk'
    },
    recommendation: income < 40000 
      ? 'SHA Primary Benefit Package is fully subsidized and recommended for zero out-of-pocket outpatient care.' 
      : 'Hybrid Cover: Link your mandatory SHA policy and complement with a Private Underwriter for private suite hospitalization and priority specialist access.'
  });
});

// ----------------- EMERGENCY STATUS, BEDS, AMBULANCES & SERVICES -----------------

// Live Emergency Status Overview
app.get('/api/emergency/status', (req: Request, res: Response) => {
  const beds = db.beds;
  const ambulances = db.ambulances;

  const totalBeds = beds.length;
  const availableBeds = beds.filter(b => b.status === 'Available').length;
  const occupiedBeds = beds.filter(b => b.status === 'Occupied').length;

  const icuBeds = beds.filter(b => b.bedType === 'ICU');
  const icuAvailable = icuBeds.filter(b => b.status === 'Available').length;

  const hduBeds = beds.filter(b => b.bedType === 'HDU');
  const hduAvailable = hduBeds.filter(b => b.status === 'Available').length;

  const matBeds = beds.filter(b => b.bedType === 'Maternity');
  const matAvailable = matBeds.filter(b => b.status === 'Available').length;

  const genBeds = beds.filter(b => b.bedType === 'General');
  const genAvailable = genBeds.filter(b => b.status === 'Available').length;

  const ambulancesTotal = ambulances.length;
  const ambulancesAvailable = ambulances.filter(a => a.status === 'Available & Ready').length;
  const ambulancesDispatched = ambulances.filter(a => a.status === 'Dispatched / En Route' || a.status === 'On-Scene' || a.status === 'Patient Onboard').length;

  const overview = {
    traumaLevel: 'Level 5 Tertiary Trauma & Specialty Center',
    triageStatus: (availableBeds > 3 ? 'Normal Capacity' : 'Elevated Alert') as any,
    emergencyHotline: '0713544101',
    aeAvgWaitMinutes: availableBeds > 5 ? 6 : 14,
    totalBeds,
    availableBeds,
    occupiedBeds,
    icuAvailable,
    icuTotal: icuBeds.length,
    hduAvailable,
    hduTotal: hduBeds.length,
    maternityAvailable: matAvailable,
    maternityTotal: matBeds.length,
    generalAvailable: genAvailable,
    generalTotal: genBeds.length,
    ambulancesTotal,
    ambulancesAvailable,
    ambulancesDispatched,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (Live Telemetry)'
  };

  res.json(overview);
});

// Hospital Beds Management
app.get('/api/beds', (req: Request, res: Response) => {
  const { type, status, ward } = req.query;
  let results = db.beds;
  if (type) results = results.filter(b => b.bedType === type);
  if (status) results = results.filter(b => b.status === status);
  if (ward) results = results.filter(b => b.ward.toLowerCase().includes((ward as string).toLowerCase()));
  res.json(results);
});

app.post('/api/beds', (req: Request, res: Response) => {
  const { bedNumber, ward, bedType, status, dailyRateKES, hasOxygen, hasVentilator, hasTelemetry, notes, patientName } = req.body;

  if (!bedNumber || !ward || !bedType) {
    return res.status(400).json({ error: 'Bed number, ward name, and bed type are required.' });
  }

  const existing = db.beds.find(b => b.bedNumber.toLowerCase() === bedNumber.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: `A bed with number "${bedNumber}" already exists in the system.` });
  }

  const newBed = {
    id: `bed-${Date.now()}`,
    bedNumber: bedNumber.trim().toUpperCase(),
    ward,
    bedType: bedType || 'General',
    status: (status || 'Available') as any,
    patientName: patientName || undefined,
    admissionDate: status === 'Occupied' ? new Date().toISOString().split('T')[0] : undefined,
    dailyRateKES: Number(dailyRateKES) || (bedType === 'ICU' ? 25000 : bedType === 'HDU' ? 12000 : bedType === 'Maternity' ? 5000 : 3500),
    hasOxygen: hasOxygen !== undefined ? Boolean(hasOxygen) : true,
    hasVentilator: hasVentilator !== undefined ? Boolean(hasVentilator) : (bedType === 'ICU'),
    hasTelemetry: hasTelemetry !== undefined ? Boolean(hasTelemetry) : (bedType === 'ICU' || bedType === 'HDU'),
    notes: notes || 'Hospital bed provisioned by clinical administration.',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  db.beds.unshift(newBed);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: 'Hospital Administrator',
    role: 'admin',
    action: `Added New Bed ${newBed.bedNumber}`,
    module: 'Admin',
    ipAddress: req.ip || '10.0.1.1',
    details: `Added ${newBed.bedType} bed in ${newBed.ward} with daily tariff KES ${newBed.dailyRateKES.toLocaleString()}`,
    status: 'Success'
  });

  res.json({ message: 'Hospital bed added successfully.', bed: newBed });
});

app.put('/api/beds/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const bed = db.beds.find(b => b.id === id);
  if (!bed) return res.status(404).json({ error: 'Hospital bed not found.' });

  const { bedNumber, ward, bedType, status, dailyRateKES, hasOxygen, hasVentilator, hasTelemetry, notes, patientName, patientId } = req.body;

  if (bedNumber) bed.bedNumber = bedNumber.trim().toUpperCase();
  if (ward) bed.ward = ward;
  if (bedType) bed.bedType = bedType;
  if (status) {
    bed.status = status;
    if (status === 'Occupied') {
      bed.patientName = patientName || bed.patientName || 'Admitted Inpatient';
      bed.patientId = patientId || bed.patientId;
      bed.admissionDate = bed.admissionDate || new Date().toISOString().split('T')[0];
    } else if (status === 'Available') {
      bed.patientName = undefined;
      bed.patientId = undefined;
      bed.admissionDate = undefined;
    }
  }
  if (dailyRateKES !== undefined) bed.dailyRateKES = Number(dailyRateKES);
  if (hasOxygen !== undefined) bed.hasOxygen = Boolean(hasOxygen);
  if (hasVentilator !== undefined) bed.hasVentilator = Boolean(hasVentilator);
  if (hasTelemetry !== undefined) bed.hasTelemetry = Boolean(hasTelemetry);
  if (notes !== undefined) bed.notes = notes;
  bed.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: 'Ward Coordinator / Admin',
    role: 'admin',
    action: `Updated Bed Status ${bed.bedNumber} -> ${bed.status}`,
    module: 'Admin',
    ipAddress: req.ip || '10.0.1.1',
    details: `Bed ${bed.bedNumber} (${bed.ward}) updated. Rate: KES ${bed.dailyRateKES}, Occupant: ${bed.patientName || 'None'}`,
    status: 'Success'
  });

  res.json({ message: 'Hospital bed updated successfully.', bed });
});

app.delete('/api/beds/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.beds.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: 'Hospital bed not found.' });

  const deleted = db.beds.splice(index, 1)[0];
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: 'Hospital Administrator',
    role: 'admin',
    action: `Decommissioned Bed ${deleted.bedNumber}`,
    module: 'Admin',
    ipAddress: req.ip || '10.0.1.1',
    details: `Bed ${deleted.bedNumber} removed from ${deleted.ward}.`,
    status: 'Success'
  });

  res.json({ message: 'Bed removed successfully.', deletedBed: deleted });
});

// Ambulances Fleet Management
app.get('/api/ambulances', (req: Request, res: Response) => {
  res.json(db.ambulances);
});

app.put('/api/ambulances/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const amb = db.ambulances.find(a => a.id === id);
  if (!amb) return res.status(404).json({ error: 'Ambulance unit not found.' });

  const { status, currentMission, etaMinutes, crewLead } = req.body;
  if (status) amb.status = status;
  if (currentMission !== undefined) amb.currentMission = currentMission;
  if (etaMinutes !== undefined) amb.etaMinutes = Number(etaMinutes);
  if (crewLead) amb.crewLead = crewLead;
  amb.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'dispatch-admin',
    userName: 'Emergency Dispatch Coordinator',
    role: 'admin',
    action: `Updated Ambulance ${amb.callSign} Status to ${amb.status}`,
    module: 'Emergency',
    ipAddress: req.ip || '10.0.1.1',
    details: `Mission: ${amb.currentMission || 'Station standby'}, ETA: ${amb.etaMinutes || 0} mins`,
    status: 'Success'
  });

  res.json({ message: 'Ambulance status updated.', ambulance: amb });
});

app.post('/api/ambulances/dispatch', (req: Request, res: Response) => {
  const { ambulanceId, location, emergencyNature, patientName, callerPhone } = req.body;
  
  const amb = ambulanceId ? db.ambulances.find(a => a.id === ambulanceId) : db.ambulances.find(a => a.status === 'Available & Ready');
  if (!amb) {
    return res.status(400).json({ error: 'No available ambulance units ready for immediate dispatch. Emergency air medical or partner unit required.' });
  }

  amb.status = 'Dispatched / En Route';
  amb.currentMission = `Emergency response to ${location || 'Nairobi Area'}: ${emergencyNature || 'Acute Trauma / Medical Emergency'} (Caller: ${callerPhone || 'Hospital Line'})`;
  amb.etaMinutes = Math.floor(5 + Math.random() * 8);
  amb.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'dispatch',
    userName: 'Emergency Control Room',
    role: 'admin',
    action: `Dispatched ${amb.callSign} to ${location || 'Location'}`,
    module: 'Emergency',
    ipAddress: req.ip || '10.0.1.1',
    details: `Patient: ${patientName || 'Emergency Casualty'}, ETA: ${amb.etaMinutes} min`,
    status: 'Success'
  });

  res.json({
    message: `Ambulance unit ${amb.callSign} dispatched! Estimated response time: ${amb.etaMinutes} minutes.`,
    ambulance: amb
  });
});

// Hospital Services & Clinical Tariffs Catalogue
app.get('/api/services', (req: Request, res: Response) => {
  const { category, shaOnly } = req.query;
  let results = db.services;
  if (category) results = results.filter(s => s.category === category);
  if (shaOnly === 'true') results = results.filter(s => s.shaCovered);
  res.json(results);
});

app.post('/api/services', (req: Request, res: Response) => {
  const { code, name, category, description, standardFeeKES, shaCovered, privateInsuranceEligible, departmentName, isActive } = req.body;

  if (!name || !category || standardFeeKES === undefined) {
    return res.status(400).json({ error: 'Service name, category, and standard fee in KES are required.' });
  }

  const newService = {
    id: `srv-${Date.now()}`,
    code: code || `SRV-${Math.floor(100 + Math.random() * 900)}`,
    name,
    category,
    description: description || 'Hospital clinical service or procedure.',
    standardFeeKES: Number(standardFeeKES) || 0,
    shaCovered: shaCovered !== undefined ? Boolean(shaCovered) : true,
    privateInsuranceEligible: privateInsuranceEligible !== undefined ? Boolean(privateInsuranceEligible) : true,
    departmentName: departmentName || 'Clinical Services',
    isActive: isActive !== undefined ? Boolean(isActive) : true
  };

  db.services.unshift(newService);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: 'Hospital Administrator',
    role: 'admin',
    action: `Created New Service Tariff "${newService.name}"`,
    module: 'Admin',
    ipAddress: req.ip || '10.0.1.1',
    details: `Fee: KES ${newService.standardFeeKES.toLocaleString()}, Category: ${newService.category}, SHA: ${newService.shaCovered}`,
    status: 'Success'
  });

  res.json({ message: 'Service tariff added successfully.', service: newService });
});

app.put('/api/services/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const service = db.services.find(s => s.id === id);
  if (!service) return res.status(404).json({ error: 'Hospital service item not found.' });

  const { code, name, category, description, standardFeeKES, shaCovered, privateInsuranceEligible, departmentName, isActive } = req.body;

  if (code) service.code = code;
  if (name) service.name = name;
  if (category) service.category = category;
  if (description !== undefined) service.description = description;
  if (standardFeeKES !== undefined) service.standardFeeKES = Number(standardFeeKES);
  if (shaCovered !== undefined) service.shaCovered = Boolean(shaCovered);
  if (privateInsuranceEligible !== undefined) service.privateInsuranceEligible = Boolean(privateInsuranceEligible);
  if (departmentName) service.departmentName = departmentName;
  if (isActive !== undefined) service.isActive = Boolean(isActive);

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: 'Hospital Administrator',
    role: 'admin',
    action: `Modified Service Tariff "${service.name}"`,
    module: 'Admin',
    ipAddress: req.ip || '10.0.1.1',
    details: `Updated standard fee to KES ${service.standardFeeKES.toLocaleString()}`,
    status: 'Success'
  });

  res.json({ message: 'Service updated successfully.', service });
});

app.delete('/api/services/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.services.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Hospital service item not found.' });

  const deleted = db.services.splice(index, 1)[0];
  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: 'Hospital Administrator',
    role: 'admin',
    action: `Deleted Service Tariff "${deleted.name}"`,
    module: 'Admin',
    ipAddress: req.ip || '10.0.1.1',
    details: `Service #${deleted.code} deleted from catalogue.`,
    status: 'Success'
  });

  res.json({ message: 'Service removed from catalogue.', deletedService: deleted });
});

// Admin Staff Management (Add/Edit Staff)
app.post('/api/admin/staff', (req: Request, res: Response) => {
  const { name, email, phone, role, departmentName, specialty, licenseNumber, consultationFeeKES } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Staff full name, email, and clinical/admin role are required.' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'A staff member with this email address already exists.' });
  }

  const newUserId = `usr-staff-${Date.now()}`;
  const isDoc = role === 'doctor';

  const newStaffUser = {
    id: newUserId,
    name,
    email,
    phone: phone || '+254712000000',
    role,
    status: 'active' as const,
    departmentName: departmentName || 'Clinical Administration',
    avatar: isDoc 
      ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300'
      : 'https://images.unsplash.com/photo-1594824813589-9e0c528b3d08?auto=format&fit=crop&q=80&w=300',
    createdAt: new Date().toISOString()
  };

  db.users.push(newStaffUser);

  if (isDoc) {
    const newDoctor = {
      id: `doc-${Date.now()}`,
      userId: newUserId,
      name,
      email,
      phone: phone || '+254712000000',
      specialty: specialty || 'General Medicine & Surgery',
      departmentId: 'dept-opd',
      departmentName: departmentName || 'Outpatient Department (OPD)',
      licenseNumber: licenseNumber || `KMPDC-A${Math.floor(1000 + Math.random() * 9000)}`,
      qualifications: ['MBChB (UoN)', 'MSc Health Systems Management', 'KMPDC Registered Specialist'],
      experienceYears: 6,
      avatar: newStaffUser.avatar,
      bio: `Dedicated medical specialist at TERRALINKHEALTH Nairobi Central Hospital delivering evidence-based patient-centered care.`,
      consultationFeeKES: Number(consultationFeeKES) || 2000,
      rating: 4.9,
      reviewCount: 18,
      isAvailableTelemedicine: true,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: '08:00 AM - 05:00 PM',
      currentQueueCount: 0
    };
    db.doctors.push(newDoctor);
  }

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: 'Hospital Administrator',
    role: 'admin',
    action: `Added New Staff Member "${name}"`,
    module: 'Admin',
    ipAddress: req.ip || '10.0.1.1',
    details: `Role: ${role}, Department: ${newStaffUser.departmentName}, License: ${licenseNumber || 'N/A'}`,
    status: 'Success'
  });

  res.json({
    message: `Staff member ${name} created successfully. Initial credentials provisioned.`,
    user: newStaffUser
  });
});

app.put('/api/admin/staff/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'Staff account not found.' });

  const { name, email, phone, role, status, departmentName } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (role) user.role = role;
  if (status) user.status = status;
  if (departmentName) user.departmentName = departmentName;

  db.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    userId: 'admin',
    userName: 'Hospital Administrator',
    role: 'admin',
    action: `Updated Staff Member "${user.name}"`,
    module: 'Admin',
    ipAddress: req.ip || '10.0.1.1',
    details: `Status: ${user.status}, Role: ${user.role}, Department: ${user.departmentName}`,
    status: 'Success'
  });

  res.json({ message: 'Staff profile updated.', user });
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
        text: `Thank you for your message, ${senderName}. Your query has been received by the Nairobi Central Hospital Customer Service desk. For emergencies, please call our direct hotline at 0713544101 or visit our A&E Ground Floor immediately.`,
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
      fallbackText += `- **Need immediate clinical assistance?**: You can book an in-person or telemedicine session right here in the portal, or contact the 24/7 hotline at **0713544101**.\n\n*Medical Notice: AI health guidance is for supportive educational tracking and does not replace evaluation by a registered KMPDC medical practitioner.*`;

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
      reply: `### 🌟 TERRALINKHEALTH AI Health Engine\n\nJambo **${matchedPatient.name}**!\n\nWe have traced your records:\n- **Blood Group**: ${matchedPatient.bloodGroup}\n- **Active Prescriptions**: ${patientPrescriptions.length} on file\n- **Recent Lab Reports**: ${patientLabOrders.length} test records verified\n- **Outstanding Balance**: KES ${patientInvoices.reduce((acc, curr) => acc + curr.balanceKES, 0).toLocaleString()}\n\nFor urgent inquiries, please reach our 24/7 hotline at **0713544101** or consult your doctor via the Telemedicine tab.`,
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
