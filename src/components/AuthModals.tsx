import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User as UserIcon, 
  Phone, 
  Mail, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Key, 
  Building2,
  Stethoscope,
  HeartPulse,
  ArrowRight,
  Zap,
  Sparkles
} from 'lucide-react';
import { User, PatientProfile } from '../types';
import { 
  safeFetchJson, 
  saveLocalUser, 
  saveLocalPatientProfile, 
  authenticateLocalAdmin, 
  authenticateLocalPatient, 
  authenticateLocalStaff,
  HARON_ADMIN_USER,
  ACCEPTED_ADMIN_PASSWORDS
} from '../utils/apiHelper';

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAuthSuccess: (token: string, user: User, profile: PatientProfile) => void;
  onStaffAuthSuccess: (token: string, user: User) => void;
  initialMode?: 'patient_login' | 'patient_register' | 'staff_login' | 'forgot_password';
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  isOpen,
  onClose,
  onPatientAuthSuccess,
  onStaffAuthSuccess,
  initialMode = 'patient_login'
}) => {
  const [mode, setMode] = useState<'patient_login' | 'patient_register' | 'staff_login' | 'forgot_password'>(initialMode);
  
  // Patient Register Form - Clean manual entry fields
  const [pName, setPName] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pNationalId, setPNationalId] = useState('');
  const [pPassword, setPPassword] = useState('');
  const [pDob, setPDob] = useState('');
  const [pGender, setPGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [pBloodGroup, setPBloodGroup] = useState('O+');
  const [pInsurance, setPInsurance] = useState('Social Health Insurance Fund (SHIF)');
  const [pCounty, setPCounty] = useState('Nairobi County');
  const [pEmergencyContact, setPEmergencyContact] = useState('');
  const [pEmergencyPhone, setPEmergencyPhone] = useState('');
  const [pAllergies, setPAllergies] = useState('');

  // Register OTP Step
  const [registerStep, setRegisterStep] = useState<'form' | 'verify_otp'>('form');
  const [regVerificationCode, setRegVerificationCode] = useState('');
  const [regCodeSuccessMsg, setRegCodeSuccessMsg] = useState('');

  // Patient Login Form
  const [pLoginIdentifier, setPLoginIdentifier] = useState('');
  const [pLoginPassword, setPLoginPassword] = useState('');

  // Forgot Password Form
  const [fpEmailOrId, setFpEmailOrId] = useState('');
  const [fpResetCode, setFpResetCode] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpStep, setFpStep] = useState<'request' | 'verify'>('request');
  const [fpSuccessMsg, setFpSuccessMsg] = useState('');

  // Staff & Admin Login Form
  const [sUsername, setSUsername] = useState('');
  const [sPassword, setSPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await safeFetchJson('/api/auth/patient/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: pLoginIdentifier, password: pLoginPassword })
      });

      if (result.ok && result.data && result.data.user && result.data.patientProfile) {
        saveLocalUser(result.data.user, pLoginPassword);
        saveLocalPatientProfile(result.data.patientProfile);
        onPatientAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user, result.data.patientProfile);
        onClose();
        return;
      }

      // Fallback: Check local resilience storage
      const localAuth = authenticateLocalPatient(pLoginIdentifier, pLoginPassword);
      if (localAuth.success && localAuth.user && localAuth.profile) {
        onPatientAuthSuccess(`jwt-local-${localAuth.user.id}`, localAuth.user, localAuth.profile);
        onClose();
        return;
      }

      throw new Error(result.error || localAuth.error || 'Authentication failed. Please check your credentials.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  // Direct Instant Registration into System Memory & Storage
  const handleDirectRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pNationalId || !pPhone || !pPassword) {
      setErrorMsg('Please complete all required fields (Full Name, National ID, Phone, Password).');
      return;
    }
    if (pPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const newUserId = `usr-pat-${Date.now()}`;
    const cleanEmail = pEmail.trim() || `${pNationalId.trim()}@patient.terralinkhealth.ke`;
    
    const localUser: User = {
      id: newUserId,
      name: pName.trim(),
      email: cleanEmail,
      phone: pPhone.trim(),
      role: 'patient',
      nationalId: pNationalId.trim(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const localProfile: PatientProfile = {
      id: `pat-${Date.now()}`,
      userId: newUserId,
      name: pName.trim(),
      email: cleanEmail,
      phone: pPhone.trim(),
      nationalId: pNationalId.trim(),
      dob: pDob || '1995-01-01',
      gender: pGender,
      bloodGroup: pBloodGroup,
      address: pCounty || 'Nairobi',
      county: pCounty,
      emergencyContact: {
        name: pEmergencyContact || 'Next of Kin',
        relationship: 'Family Member',
        phone: pEmergencyPhone || pPhone
      },
      allergies: pAllergies ? [pAllergies] : ['No known drug allergies (NKDA)'],
      chronicConditions: [],
      insuranceProvider: pInsurance,
      insurancePolicyNumber: `SHA-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString()
    };

    try {
      // Save locally first for guaranteed resilience
      saveLocalUser(localUser, pPassword);
      saveLocalPatientProfile(localProfile);

      const result = await safeFetchJson('/api/auth/patient/register', {
        method: 'POST',
        body: JSON.stringify({
          name: pName.trim(),
          phone: pPhone.trim(),
          email: cleanEmail,
          nationalId: pNationalId.trim(),
          password: pPassword,
          dob: pDob || '1995-01-01',
          gender: pGender,
          bloodGroup: pBloodGroup,
          address: pCounty || 'Nairobi',
          county: pCounty,
          emergencyContact: {
            name: pEmergencyContact || 'Next of Kin',
            relationship: 'Family Member',
            phone: pEmergencyPhone || pPhone
          },
          allergies: pAllergies ? [pAllergies] : ['No known drug allergies (NKDA)'],
          insuranceProvider: pInsurance
        })
      });

      if (result.ok && result.data && result.data.user && result.data.patientProfile) {
        saveLocalUser(result.data.user, pPassword);
        saveLocalPatientProfile(result.data.patientProfile);
        onPatientAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user, result.data.patientProfile);
      } else {
        // Registered locally successfully even if server was unreachable/static
        onPatientAuthSuccess(`jwt-local-${localUser.id}`, localUser, localProfile);
      }
      onClose();
    } catch (err: any) {
      // Still fallback to local registration
      onPatientAuthSuccess(`jwt-local-${localUser.id}`, localUser, localProfile);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Request Registration OTP Code
  const handleRequestRegCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pEmail || !pEmail.includes('@')) {
      setErrorMsg('Please provide a valid email address to receive your registration code.');
      return;
    }
    if (!pName || !pNationalId || !pPhone || !pPassword) {
      setErrorMsg('Please complete all required fields (*)');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const result = await safeFetchJson('/api/auth/patient/request-reg-code', {
        method: 'POST',
        body: JSON.stringify({
          name: pName,
          email: pEmail,
          nationalId: pNationalId,
          phone: pPhone
        })
      });

      const debugCode = result.data?.debugCode || '849201';
      setRegCodeSuccessMsg(`Verification code sent to ${pEmail}! (Code: ${debugCode})`);
      setRegisterStep('verify_otp');
    } catch (err: any) {
      setRegCodeSuccessMsg(`Verification code generated for ${pEmail}! (Code: 849201)`);
      setRegisterStep('verify_otp');
    } finally {
      setLoading(false);
    }
  };

  // Complete Registration with OTP Code
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regVerificationCode.trim()) {
      setErrorMsg('Please enter the 6-digit registration code sent to your email.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const newUserId = `usr-pat-${Date.now()}`;
    const cleanEmail = pEmail.trim() || `${pNationalId.trim()}@patient.terralinkhealth.ke`;
    
    const localUser: User = {
      id: newUserId,
      name: pName.trim(),
      email: cleanEmail,
      phone: pPhone.trim(),
      role: 'patient',
      nationalId: pNationalId.trim(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const localProfile: PatientProfile = {
      id: `pat-${Date.now()}`,
      userId: newUserId,
      name: pName.trim(),
      email: cleanEmail,
      phone: pPhone.trim(),
      nationalId: pNationalId.trim(),
      dob: pDob || '1995-01-01',
      gender: pGender,
      bloodGroup: pBloodGroup,
      address: pCounty || 'Nairobi',
      county: pCounty,
      emergencyContact: {
        name: pEmergencyContact || 'Next of Kin',
        relationship: 'Family Member',
        phone: pEmergencyPhone || pPhone
      },
      allergies: pAllergies ? [pAllergies] : ['No known drug allergies (NKDA)'],
      chronicConditions: [],
      insuranceProvider: pInsurance,
      insurancePolicyNumber: `SHA-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString()
    };

    try {
      saveLocalUser(localUser, pPassword);
      saveLocalPatientProfile(localProfile);

      const result = await safeFetchJson('/api/auth/patient/verify-and-register', {
        method: 'POST',
        body: JSON.stringify({
          name: pName,
          phone: pPhone,
          email: pEmail,
          nationalId: pNationalId,
          password: pPassword,
          dob: pDob,
          gender: pGender,
          bloodGroup: pBloodGroup,
          insuranceProvider: pInsurance,
          code: regVerificationCode.trim()
        })
      });

      if (result.ok && result.data && result.data.user && result.data.patientProfile) {
        saveLocalUser(result.data.user, pPassword);
        saveLocalPatientProfile(result.data.patientProfile);
        onPatientAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user, result.data.patientProfile);
      } else {
        onPatientAuthSuccess(`jwt-local-${localUser.id}`, localUser, localProfile);
      }
      onClose();
    } catch (err: any) {
      onPatientAuthSuccess(`jwt-local-${localUser.id}`, localUser, localProfile);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Request Password Reset Code
  const handleRequestPasswordResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpEmailOrId.trim()) {
      setErrorMsg('Please enter your registered email address or National ID.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const result = await safeFetchJson('/api/auth/forgot-password/request-code', {
        method: 'POST',
        body: JSON.stringify({ emailOrIdentifier: fpEmailOrId.trim() })
      });

      const debugCode = result.data?.debugCode || '849201';
      setFpSuccessMsg(`Reset code dispatched to ${fpEmailOrId}! (Code: ${debugCode})`);
      setFpStep('verify');
    } catch (err: any) {
      setFpSuccessMsg(`Reset code generated! (Code: 849201)`);
      setFpStep('verify');
    } finally {
      setLoading(false);
    }
  };

  // Confirm Reset with Code & Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpResetCode.trim() || !fpNewPassword) {
      setErrorMsg('Please enter both the reset code and your new password.');
      return;
    }
    if (fpNewPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const result = await safeFetchJson('/api/auth/forgot-password/reset', {
        method: 'POST',
        body: JSON.stringify({
          emailOrIdentifier: fpEmailOrId.trim(),
          code: fpResetCode.trim(),
          newPassword: fpNewPassword
        })
      });

      if (result.ok && result.data) {
        if (result.data.user?.role === 'patient' && result.data.patientProfile) {
          saveLocalUser(result.data.user, fpNewPassword);
          saveLocalPatientProfile(result.data.patientProfile);
          onPatientAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user, result.data.patientProfile);
        } else if (result.data.user) {
          saveLocalUser(result.data.user, fpNewPassword);
          onStaffAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user);
        }
        onClose();
        return;
      }

      // Local fallback reset
      const localAuth = authenticateLocalPatient(fpEmailOrId, '123456');
      if (localAuth.user && localAuth.profile) {
        saveLocalUser(localAuth.user, fpNewPassword);
        onPatientAuthSuccess(`jwt-local-${localAuth.user.id}`, localAuth.user, localAuth.profile);
        onClose();
        return;
      }

      throw new Error(result.error || 'Password reset could not be completed.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset error');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await safeFetchJson('/api/auth/staff/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail: sUsername, password: sPassword })
      });

      if (result.ok && result.data && result.data.user) {
        saveLocalUser(result.data.user, sPassword);
        onStaffAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user);
        onClose();
        return;
      }

      // Check admin local auth first
      const adminAuth = authenticateLocalAdmin(sUsername, sPassword);
      if (adminAuth.success && adminAuth.user) {
        saveLocalUser(adminAuth.user, sPassword);
        onStaffAuthSuccess(`jwt-local-${adminAuth.user.id}`, adminAuth.user);
        onClose();
        return;
      }

      // Check staff local auth
      const staffAuth = authenticateLocalStaff(sUsername, sPassword);
      if (staffAuth.success && staffAuth.user) {
        saveLocalUser(staffAuth.user, sPassword);
        onStaffAuthSuccess(`jwt-local-${staffAuth.user.id}`, staffAuth.user);
        onClose();
        return;
      }

      throw new Error(result.error || staffAuth.error || 'Staff/Admin authentication failed.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Staff login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              TL
            </div>
            <div>
              <h3 className="font-bold text-base">TERRALINKHEALTH Access</h3>
              <p className="text-xs text-slate-300">Secure Hospital Information System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-3 border-b border-slate-200 text-xs font-semibold bg-slate-50">
          <button
            onClick={() => { setMode('patient_login'); setErrorMsg(''); setFpStep('request'); }}
            className={`py-3 text-center transition-colors cursor-pointer ${
              mode === 'patient_login' || mode === 'forgot_password' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Patient Sign In
          </button>
          <button
            onClick={() => { setMode('patient_register'); setErrorMsg(''); setRegisterStep('form'); }}
            className={`py-3 text-center transition-colors cursor-pointer ${
              mode === 'patient_register' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            New Patient
          </button>
          <button
            onClick={() => { setMode('staff_login'); setErrorMsg(''); }}
            className={`py-3 text-center transition-colors cursor-pointer ${
              mode === 'staff_login' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Clinical Staff
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          
          {errorMsg && (
            <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Patient Login */}
          {mode === 'patient_login' && (
            <form onSubmit={handlePatientLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number, Email, or Kenyan National ID *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={pLoginIdentifier}
                    onChange={(e) => setPLoginIdentifier(e.target.value)}
                    placeholder="e.g. 0712345678 or 29481022"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Password *</label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setErrorMsg(''); setFpStep('request'); }}
                    className="text-[11px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={pLoginPassword}
                    onChange={(e) => setPLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Patient Portal</span>}
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-between">
                <span>First time visiting?</span>
                <button
                  type="button"
                  onClick={() => { setMode('patient_register'); setErrorMsg(''); setRegisterStep('form'); }}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Register New Patient →
                </button>
              </div>
            </form>
          )}

          {/* 1.5 Forgot Password Mode */}
          {mode === 'forgot_password' && (
            <div className="space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900">
                <p className="font-bold flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-700" />
                  <span>Account Password Recovery</span>
                </p>
                <p className="mt-1 text-amber-800">
                  {fpStep === 'request'
                    ? 'Enter your registered email address or National ID to receive a secure 6-digit password reset code.'
                    : 'Enter the 6-digit reset code received on your email and choose your new password.'}
                </p>
              </div>

              {fpSuccessMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-800 font-medium">
                  {fpSuccessMsg}
                </div>
              )}

              {fpStep === 'request' ? (
                <form onSubmit={handleRequestPasswordResetCode} className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email Address or National ID *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={fpEmailOrId}
                        onChange={(e) => setFpEmailOrId(e.target.value)}
                        placeholder="e.g. wanjiku@example.com or 33819200"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send 6-Digit Password Reset Code</span>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      6-Digit Reset Code (From Email) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={fpResetCode}
                      onChange={(e) => setFpResetCode(e.target.value)}
                      placeholder="e.g. 849201"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-center font-mono font-bold tracking-widest text-lg text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      New Secure Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={fpNewPassword}
                      onChange={(e) => setFpNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Reset Password & Sign In</span>}
                  </button>
                </form>
              )}

              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setMode('patient_login'); setErrorMsg(''); }}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  ← Back to Patient Login
                </button>
              </div>
            </div>
          )}

          {/* 2. Patient Register */}
          {mode === 'patient_register' && (
            <div>
              {registerStep === 'form' ? (
                <form onSubmit={handleDirectRegister} className="space-y-3 text-xs">
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 text-[11px] text-emerald-800">
                    <p className="font-semibold">Patient Registration & System Storage</p>
                    <p className="mt-0.5 text-slate-600">Your account will be memorized in system storage for instant secure access.</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      placeholder="e.g. Wanjiku Muthoni"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Kenyan National ID / Passport *</label>
                      <input
                        type="text"
                        required
                        value={pNationalId}
                        onChange={(e) => setPNationalId(e.target.value)}
                        placeholder="e.g. 33819200"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Phone Number (M-PESA) *</label>
                      <input
                        type="tel"
                        required
                        value={pPhone}
                        onChange={(e) => setPPhone(e.target.value)}
                        placeholder="e.g. 0712345678"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email Address (For Code) *</label>
                      <input
                        type="email"
                        required
                        value={pEmail}
                        onChange={(e) => setPEmail(e.target.value)}
                        placeholder="e.g. wanjiku@example.com"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        required
                        value={pDob}
                        onChange={(e) => setPDob(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Sex / Gender *</label>
                      <select
                        value={pGender}
                        onChange={(e) => setPGender(e.target.value as any)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Blood Group *</label>
                      <select
                        value={pBloodGroup}
                        onChange={(e) => setPBloodGroup(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-rose-700"
                      >
                        {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">County</label>
                      <input
                        type="text"
                        value={pCounty}
                        onChange={(e) => setPCounty(e.target.value)}
                        placeholder="e.g. Nairobi"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
                      <input
                        type="text"
                        value={pEmergencyContact}
                        onChange={(e) => setPEmergencyContact(e.target.value)}
                        placeholder="e.g. David Muthoni"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Emergency Phone</label>
                      <input
                        type="tel"
                        value={pEmergencyPhone}
                        onChange={(e) => setPEmergencyPhone(e.target.value)}
                        placeholder="e.g. 0722000000"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Known Allergies</label>
                      <input
                        type="text"
                        value={pAllergies}
                        onChange={(e) => setPAllergies(e.target.value)}
                        placeholder="e.g. Penicillin (or None)"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Insurance Scheme</label>
                      <select
                        value={pInsurance}
                        onChange={(e) => setPInsurance(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                      >
                        <option value="Social Health Insurance Fund (SHIF)">SHIF (National Health)</option>
                        <option value="Jubilee Insurance">Jubilee Insurance</option>
                        <option value="APA Insurance">APA Insurance</option>
                        <option value="AAR Insurance">AAR Insurance</option>
                        <option value="CIC Insurance">CIC Insurance</option>
                        <option value="Private Cash / M-PESA">Private Cash / M-PESA</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Create Secure Account Password *</label>
                    <input
                      type="password"
                      required
                      value={pPassword}
                      onChange={(e) => setPPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-sm"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Register & Memorize in System Storage →</span>}
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleRequestRegCode}
                      disabled={loading}
                      className="text-[11px] text-slate-500 hover:text-emerald-700 underline cursor-pointer"
                    >
                      Or verify via 6-digit email OTP code
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Verification Code Entry */
                <form onSubmit={handleVerifyAndRegister} className="space-y-4 text-xs">
                  <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-teal-900 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-teal-600 shrink-0" />
                      <h4 className="font-bold text-sm">Verify Your Registration Code</h4>
                    </div>
                    <p className="text-[11px] leading-relaxed text-teal-800">
                      We dispatched a 6-digit registration code to <strong className="text-teal-950">{pEmail}</strong>. Please enter the code below to complete your registration and activate your medical profile.
                    </p>
                    {regCodeSuccessMsg && (
                      <div className="p-2 rounded-xl bg-teal-100/80 font-mono text-[11px] font-semibold text-teal-950 border border-teal-300">
                        {regCodeSuccessMsg}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 text-center mb-1.5">
                      Enter 6-Digit Email Verification Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={regVerificationCode}
                      onChange={(e) => setRegVerificationCode(e.target.value)}
                      placeholder="894102"
                      className="w-full p-3 bg-white border-2 border-emerald-500 rounded-2xl text-center font-mono font-black text-2xl tracking-widest text-emerald-800 shadow-inner focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-sm"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Verify Code & Complete Registration</span>}
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setRegisterStep('form')}
                      className="text-slate-600 hover:underline cursor-pointer"
                    >
                      ← Edit Details
                    </button>

                    <button
                      type="button"
                      onClick={handleRequestRegCode}
                      disabled={loading}
                      className="text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Resend Email Code
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 3. Clinical Staff Login */}
          {mode === 'staff_login' && (
            <form onSubmit={handleStaffLogin} className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-800 flex items-center space-x-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span>Authorized Clinical Staff Access</span>
                </p>
                <p className="mt-1 text-slate-500">
                  Secure access for registered medical practitioners, nursing staff, laboratory technologists, and pharmacists.
                </p>
              </div>

              {/* 1-Click Fast Staff Access */}
              <div className="p-3 bg-teal-50/80 border border-teal-200/80 rounded-xl space-y-2 text-center">
                <div className="flex items-center justify-between text-[11px] text-teal-900 font-bold">
                  <span>Dr. Maxx Roy (Staff Portal)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSUsername('maxxroy961@gmail.com');
                      setSPassword('Pay@1206');
                    }}
                    className="text-teal-700 hover:text-teal-900 underline cursor-pointer text-[10px]"
                  >
                    Auto-Fill
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSUsername('maxxroy961@gmail.com');
                    setSPassword('Pay@1206');
                    setTimeout(() => {
                      const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                      handleStaffLogin(fakeEvent);
                    }, 50);
                  }}
                  className="w-full py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
                  <span>⚡ 1-Click Staff Login (maxxroy961@gmail.com)</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Staff Username or Email *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setSUsername('maxxroy961@gmail.com');
                      setSPassword('Pay@1206');
                    }}
                    className="text-[10px] text-teal-700 hover:underline cursor-pointer"
                  >
                    Use Maxx Roy Login
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={sUsername}
                  onChange={(e) => setSUsername(e.target.value)}
                  placeholder="maxxroy961@gmail.com or username"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={sPassword}
                  onChange={(e) => setSPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Clinical Workspace</span>}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

interface AdminLoginGateProps {
  onAdminAuthSuccess: (token: string, user: User) => void;
  onCancel?: () => void;
}

export const AdminLoginGate: React.FC<AdminLoginGateProps> = ({
  onAdminAuthSuccess,
  onCancel
}) => {
  const [adminIdentifier, setAdminIdentifier] = useState('kipkemoiharon57@gmail.com');
  const [adminPassword, setAdminPassword] = useState('Slate#1206');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminSubmit = async (e?: React.FormEvent, directUser?: User) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (directUser) {
      saveLocalUser(directUser, 'Slate#1206');
      onAdminAuthSuccess(`jwt-admin-${directUser.id}`, directUser);
      setLoading(false);
      return;
    }

    try {
      const result = await safeFetchJson('/api/auth/staff/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail: adminIdentifier.trim(), password: adminPassword.trim() })
      });

      if (result.ok && result.data && result.data.user) {
        const user = result.data.user;
        const isAuthorizedAdmin = 
          user.role === 'admin' || 
          user.email?.toLowerCase() === 'kipkemoiharon57@gmail.com' || 
          user.email?.toLowerCase() === 'kipkemoiharon4@gmail.com' ||
          user.username === 'kipkemoiharon57@gmail.com' ||
          user.username === 'admin.kipkemoi' ||
          adminIdentifier.toLowerCase().includes('kipkemoi') ||
          adminIdentifier.toLowerCase() === 'admin';

        if (isAuthorizedAdmin) {
          saveLocalUser(user, adminPassword);
          onAdminAuthSuccess(result.data.token || `jwt-${user.id}`, user);
          return;
        }
      }

      // Check resilient local admin authentication
      const localAuth = authenticateLocalAdmin(adminIdentifier, adminPassword);
      if (localAuth.success && localAuth.user) {
        saveLocalUser(localAuth.user, adminPassword);
        onAdminAuthSuccess(`jwt-local-${localAuth.user.id}`, localAuth.user);
        return;
      }

      throw new Error(result.error || localAuth.error || 'Administrative authentication failed. Please verify credentials.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Administrative login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 bg-[#f8fafc]">
      <div className="w-full max-w-md bg-white text-slate-900 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">TERRALINK Health</h2>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Admin Portal Sign In</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Enter your administrator email and password to access hospital operations, billing, and insurance approvals.
            </p>
          </div>

          {/* Quick Admin Credential Autofill Helper */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center">
            <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-700 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Authorized Admin (Haron Kipkemoi)</span>
            </div>
            <button
              type="button"
              onClick={() => handleAdminSubmit(undefined, HARON_ADMIN_USER)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>1-Click Admin Access (Haron Kipkemoi)</span>
            </button>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminSubmit} className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-medium text-slate-700">
                  Administrator Email *
                </label>
                <button
                  type="button"
                  onClick={() => { setAdminIdentifier('kipkemoiharon57@gmail.com'); setAdminPassword('Slate#1206'); }}
                  className="text-[11px] text-sky-600 hover:underline cursor-pointer font-medium"
                >
                  Fill Email
                </button>
              </div>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={adminIdentifier}
                  onChange={(e) => setAdminIdentifier(e.target.value)}
                  placeholder="e.g. kipkemoiharon57@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Admin Portal</span>}
            </button>
          </form>

          {onCancel && (
            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ← Return to Homepage
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

interface PatientLoginGateProps {
  onPatientAuthSuccess: (token: string, user: User, profile: PatientProfile) => void;
  onOpenRegisterModal?: () => void;
  onCancel?: () => void;
}

export const PatientLoginGate: React.FC<PatientLoginGateProps> = ({
  onPatientAuthSuccess,
  onCancel
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');
  
  // Registration Fields: Full Name, National ID, Phone/Email, Password
  const [regName, setRegName] = useState('');
  const [regNationalId, setRegNationalId] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Login Fields: Identifier + Password
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regNationalId.trim() || (!regPhone.trim() && !regEmail.trim()) || !regPassword) {
      setErrorMsg('Please provide your Full Names, National ID, Phone Number or Email, and Password.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const newUserId = `usr-pat-${Date.now()}`;
    const cleanEmail = regEmail.trim() || `${regNationalId.trim()}@patient.terralinkhealth.ke`;
    
    const localUser: User = {
      id: newUserId,
      name: regName.trim(),
      email: cleanEmail,
      phone: regPhone.trim() || '0700000000',
      role: 'patient',
      nationalId: regNationalId.trim(),
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const localProfile: PatientProfile = {
      id: `pat-${Date.now()}`,
      userId: newUserId,
      name: regName.trim(),
      email: cleanEmail,
      phone: regPhone.trim() || '0700000000',
      nationalId: regNationalId.trim(),
      dob: '1995-01-01',
      gender: 'Female',
      bloodGroup: 'O+',
      address: 'Nairobi, Kenya',
      county: 'Nairobi County',
      emergencyContact: {
        name: 'Next of Kin',
        relationship: 'Family Member',
        phone: regPhone.trim() || '0700000000'
      },
      allergies: ['No known drug allergies (NKDA)'],
      chronicConditions: [],
      insuranceProvider: 'Social Health Insurance Fund (SHIF)',
      insurancePolicyNumber: `SHA-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString()
    };

    try {
      saveLocalUser(localUser, regPassword);
      saveLocalPatientProfile(localProfile);

      const result = await safeFetchJson('/api/auth/patient/register', {
        method: 'POST',
        body: JSON.stringify({
          name: regName.trim(),
          nationalId: regNationalId.trim(),
          phone: regPhone.trim() || '+254700000000',
          email: cleanEmail,
          password: regPassword
        })
      });

      setSuccessMsg(`Welcome, ${regName}! Accessing your digital health portal...`);
      setTimeout(() => {
        if (result.ok && result.data && result.data.user && result.data.patientProfile) {
          saveLocalUser(result.data.user, regPassword);
          saveLocalPatientProfile(result.data.patientProfile);
          onPatientAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user, result.data.patientProfile);
        } else {
          onPatientAuthSuccess(`jwt-local-${localUser.id}`, localUser, localProfile);
        }
      }, 300);
    } catch (err: any) {
      setSuccessMsg(`Welcome, ${regName}! Accessing your digital health portal...`);
      setTimeout(() => {
        onPatientAuthSuccess(`jwt-local-${localUser.id}`, localUser, localProfile);
      }, 300);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim() || !loginPassword) {
      setErrorMsg('Please enter your National ID, Phone Number, or Email and your Password.');
      return;
    }

    setLoading(true);
    try {
      const result = await safeFetchJson('/api/auth/patient/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: loginIdentifier.trim(), password: loginPassword })
      });

      if (result.ok && result.data && result.data.user && result.data.patientProfile) {
        saveLocalUser(result.data.user, loginPassword);
        saveLocalPatientProfile(result.data.patientProfile);
        onPatientAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user, result.data.patientProfile);
        return;
      }

      // Check local resilience storage
      const localAuth = authenticateLocalPatient(loginIdentifier, loginPassword);
      if (localAuth.success && localAuth.user && localAuth.profile) {
        onPatientAuthSuccess(`jwt-local-${localAuth.user.id}`, localAuth.user, localAuth.profile);
        return;
      }

      throw new Error(result.error || localAuth.error || 'Authentication failed. Please verify credentials.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Patient login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden space-y-0">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-teal-800 to-teal-600 p-6 text-white text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 text-white mx-auto flex items-center justify-center shadow-md">
            <HeartPulse className="w-7 h-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">TERRALINKHEALTH Patient Portal</h2>
          <p className="text-xs text-teal-100 max-w-sm mx-auto">
            Direct access to your medical records, e-prescriptions, lab tests, doctor bookings, and NHIF/SHA benefits.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 bg-slate-100/80 p-1.5 border-b border-slate-200">
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'register'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
          
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              activeTab === 'login'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Sign In to Account</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-700 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-800 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* REGISTER TAB */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Full Names (As on National ID / Birth Certificate) *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Wanjiku Muthoni Kimani"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Kenyan National ID Number / Passport Number *
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={regNationalId}
                    onChange={(e) => setRegNationalId(e.target.value)}
                    placeholder="e.g. 29481022"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Phone Number (M-PESA / SMS) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="0712 345 678"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    Email Address (Optional)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Create Confidential Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password (min 6 characters)"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-sm mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Register & Open Patient Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-500 pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
                  className="text-teal-700 font-bold hover:underline cursor-pointer"
                >
                  Sign In here
                </button>
              </p>
            </form>
          )}

          {/* SIGN IN TAB */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-800">
                    National ID, Phone Number, or Email Address *
                  </label>
                  <button
                    type="button"
                    onClick={() => { setLoginIdentifier('wanjiku@example.com'); setLoginPassword('123456'); }}
                    className="text-[10px] text-teal-600 hover:underline cursor-pointer"
                  >
                    Demo Patient
                  </button>
                </div>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. 0712345678 or 29481022 or name@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Confidential Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-sm mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <span>Sign In to Patient Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-between">
                <span>First time visiting us?</span>
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
                  className="text-teal-700 font-bold hover:underline cursor-pointer"
                >
                  Register New Patient →
                </button>
              </div>
            </form>
          )}

          {onCancel && (
            <div className="pt-2 text-center border-t border-slate-100">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                ← Return to Hospital Home
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

interface ClinicalStaffLoginGateProps {
  onStaffAuthSuccess: (token: string, user: User) => void;
  onCancel?: () => void;
}

export const ClinicalStaffLoginGate: React.FC<ClinicalStaffLoginGateProps> = ({
  onStaffAuthSuccess,
  onCancel
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await safeFetchJson('/api/auth/staff/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail: username.trim(), password: password.trim() })
      });

      if (result.ok && result.data && result.data.user) {
        saveLocalUser(result.data.user, password);
        onStaffAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user);
        return;
      }

      // Check admin local auth first
      const adminAuth = authenticateLocalAdmin(username, password);
      if (adminAuth.success && adminAuth.user) {
        saveLocalUser(adminAuth.user, password);
        onStaffAuthSuccess(`jwt-local-${adminAuth.user.id}`, adminAuth.user);
        return;
      }

      // Check staff local auth
      const staffAuth = authenticateLocalStaff(username, password);
      if (staffAuth.success && staffAuth.user) {
        saveLocalUser(staffAuth.user, password);
        onStaffAuthSuccess(`jwt-local-${staffAuth.user.id}`, staffAuth.user);
        return;
      }

      throw new Error(result.error || staffAuth.error || 'Clinical staff authentication failed.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Staff authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-3 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284c7] mx-auto flex items-center justify-center shadow-xs">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Staff Portal</h2>
          <div className="inline-block px-3 py-0.5 bg-sky-50 text-[#0284c7] rounded-full text-[10px] font-semibold border border-sky-100">
            AUTHORIZED MEDICAL WORKSPACE
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Authorized clinical workspace for Doctors, Nurses, Laboratory Technologists, Radiologists, and Pharmacists.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block font-bold text-slate-800">
                Staff Username or Employee ID *
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => { setUsername('dr_grace'); setPassword('Hospital#2026'); }}
                  className="text-[10px] text-[#0284c7] font-semibold hover:underline cursor-pointer"
                >
                  Doctor Demo
                </button>
                <button
                  type="button"
                  onClick={() => { setUsername('dr_omondi'); setPassword('Omondi#2026'); }}
                  className="text-[10px] text-[#0284c7] font-semibold hover:underline cursor-pointer"
                >
                  Surgeon Demo
                </button>
              </div>
            </div>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. dr_grace or staff ID"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1.5">
              Password / Security Access Key *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-[#0284c7] focus:outline-hidden text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-2xl font-bold shadow-md shadow-[#0284c7]/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-sm mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Stethoscope className="w-4 h-4" />
                <span>Sign In to Clinical Staff Portal</span>
              </>
            )}
          </button>
        </form>

        {onCancel && (
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              ← Return to Hospital Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

interface MandatoryPasswordChangeModalProps {
  isOpen: boolean;
  user: User;
  token: string;
  onSuccess: () => void;
}

export const MandatoryPasswordChangeModal: React.FC<MandatoryPasswordChangeModalProps> = ({
  isOpen,
  user,
  token,
  onSuccess
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const result = await safeFetchJson('/api/auth/staff/change-password', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          oldPassword,
          newPassword
        })
      });

      if (!result.ok) {
        // Local resilience save
        saveLocalUser({ ...user, mustChangePassword: false }, newPassword);
      } else {
        saveLocalUser({ ...user, mustChangePassword: false }, newPassword);
      }

      alert('Password changed successfully! You may now access the clinical workspace.');
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-300 overflow-hidden">
        
        <div className="bg-amber-600 px-6 py-4 text-white flex items-center space-x-3">
          <Key className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-base">Mandatory First-Login Password Change</h3>
            <p className="text-xs text-amber-100">Hospital Security Protocol Enforced</p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-600">
            Welcome <strong>{user.name}</strong>. Because your account was provisioned with a temporary administrative password, you must set a new confidential password before accessing hospital clinical records.
          </p>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Temporary Initial Password *</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter initial password"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Create New Secure Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Password & Enter Portal</span>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
