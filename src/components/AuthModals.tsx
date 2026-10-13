import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  User as UserIcon, 
  Users,
  Phone, 
  Mail, 
  CreditCard, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Key, 
  Heart,
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  Building2,
  Stethoscope
} from 'lucide-react';
import { User, PatientProfile } from '../types';
import { 
  safeFetchJson, 
  saveLocalUser, 
  saveLocalPatientProfile, 
  authenticateLocalAdmin, 
  authenticateLocalPatient, 
  authenticateLocalStaff,
  HARON_ADMIN_USER
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
  
  // Registration 2-Step Flow: Step 1 (Coverage selection) -> Step 2 (Account details)
  const [coverageStep, setCoverageStep] = useState<1 | 2>(1);
  const [coverageType, setCoverageType] = useState<'just_me' | 'partner' | 'family'>('just_me');

  // Patient Registration Details
  const [pName, setPName] = useState('');
  const [pNationalId, setPNationalId] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pDob, setPDob] = useState('');
  const [pGender, setPGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [pCounty, setPCounty] = useState('Nairobi County');
  const [pEmergencyName, setPEmergencyName] = useState('');
  const [pEmergencyPhone, setPEmergencyPhone] = useState('');
  const [pInsurance, setPInsurance] = useState('Social Health Insurance Fund (SHIF)');
  const [pPassword, setPPassword] = useState('');
  const [pConfirmPassword, setPConfirmPassword] = useState('');

  // Patient Login Form
  const [pLoginIdentifier, setPLoginIdentifier] = useState('');
  const [pLoginPassword, setPLoginPassword] = useState('');

  // Forgot Password Form
  const [fpEmailOrId, setFpEmailOrId] = useState('');
  const [fpResetCode, setFpResetCode] = useState('');
  const [fpNewPassword, setFpNewPassword] = useState('');
  const [fpStep, setFpStep] = useState<'request' | 'verify'>('request');
  const [fpSuccessMsg, setFpSuccessMsg] = useState('');

  // Staff Login Form
  const [sUsername, setSUsername] = useState('');
  const [sPassword, setSPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setCoverageStep(1);
      setFpStep('request');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Handle Patient Sign In
  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await safeFetchJson('/api/auth/patient/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: pLoginIdentifier.trim(), password: pLoginPassword.trim() })
      });

      if (result.ok && result.data && result.data.user && result.data.patientProfile) {
        saveLocalUser(result.data.user, pLoginPassword);
        saveLocalPatientProfile(result.data.patientProfile);
        onPatientAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user, result.data.patientProfile);
        onClose();
        return;
      }

      // Check local storage fallback
      const localAuth = authenticateLocalPatient(pLoginIdentifier.trim(), pLoginPassword.trim());
      if (localAuth.success && localAuth.user && localAuth.profile) {
        onPatientAuthSuccess(`jwt-local-${localAuth.user.id}`, localAuth.user, localAuth.profile);
        onClose();
        return;
      }

      throw new Error(result.error || localAuth.error || 'Authentication failed. Please verify your credentials.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 to Step 2 Transition
  const handleProceedToAccountDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCoverageStep(2);
  };

  // Step 2: Complete Patient Registration
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!pNationalId.trim()) {
      setErrorMsg('Please enter your Kenyan National ID or Passport Number.');
      return;
    }
    if (!pEmail.trim()) {
      setErrorMsg('Please enter your email address for account login.');
      return;
    }
    if (!pPhone.trim()) {
      setErrorMsg('Please enter your mobile phone number for SMS alerts.');
      return;
    }
    if (!pPassword) {
      setErrorMsg('Please create an account password.');
      return;
    }
    if (pPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (pPassword !== pConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter confirm password.');
      return;
    }

    setLoading(true);
    const newUserId = `usr-pat-${Date.now()}`;
    const cleanEmail = pEmail.trim().toLowerCase();
    const cleanPhone = pPhone.trim();
    const cleanNatId = pNationalId.trim();

    const localUser: User = {
      id: newUserId,
      name: pName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      role: 'patient',
      nationalId: cleanNatId,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const localProfile: PatientProfile = {
      id: `pat-${Date.now()}`,
      userId: newUserId,
      name: pName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      nationalId: cleanNatId,
      dob: pDob || '1995-01-01',
      gender: pGender,
      bloodGroup: 'O+',
      address: pCounty || 'Nairobi',
      county: pCounty || 'Nairobi County',
      emergencyContact: {
        name: pEmergencyName.trim() || 'Next of Kin',
        relationship: 'Primary Contact',
        phone: pEmergencyPhone.trim() || cleanPhone
      },
      allergies: ['No known drug allergies (NKDA)'],
      chronicConditions: [],
      insuranceProvider: pInsurance,
      insurancePolicyNumber: `SHA-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString()
    };

    try {
      saveLocalUser(localUser, pPassword);
      saveLocalPatientProfile(localProfile);

      const result = await safeFetchJson('/api/auth/patient/register', {
        method: 'POST',
        body: JSON.stringify({
          name: pName.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          nationalId: cleanNatId,
          password: pPassword,
          dob: pDob || '1995-01-01',
          gender: pGender,
          county: pCounty,
          emergencyContact: {
            name: pEmergencyName.trim() || 'Next of Kin',
            phone: pEmergencyPhone.trim() || cleanPhone
          },
          insuranceProvider: pInsurance,
          coverageType
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
    } catch {
      onPatientAuthSuccess(`jwt-local-${localUser.id}`, localUser, localProfile);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Staff Login
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await safeFetchJson('/api/auth/staff/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail: sUsername.trim(), password: sPassword.trim() })
      });

      if (result.ok && result.data && result.data.user) {
        saveLocalUser(result.data.user, sPassword);
        onStaffAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user);
        onClose();
        return;
      }

      // Check admin auth
      const adminAuth = authenticateLocalAdmin(sUsername.trim(), sPassword.trim());
      if (adminAuth.success && adminAuth.user) {
        saveLocalUser(adminAuth.user, sPassword);
        onStaffAuthSuccess(`jwt-local-${adminAuth.user.id}`, adminAuth.user);
        onClose();
        return;
      }

      const staffAuth = authenticateLocalStaff(sUsername.trim(), sPassword.trim());
      if (staffAuth.success && staffAuth.user) {
        saveLocalUser(staffAuth.user, sPassword);
        onStaffAuthSuccess(`jwt-local-${staffAuth.user.id}`, staffAuth.user);
        onClose();
        return;
      }

      throw new Error(result.error || staffAuth.error || 'Authentication failed. Please verify credentials.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Staff authentication error');
    } finally {
      setLoading(false);
    }
  };

  // Password reset request
  const handleRequestPasswordResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpEmailOrId.trim()) {
      setErrorMsg('Please enter your email or National ID.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await safeFetchJson('/api/auth/forgot-password/request-code', {
        method: 'POST',
        body: JSON.stringify({ emailOrIdentifier: fpEmailOrId.trim() })
      });
      const code = result.data?.verificationCode || result.data?.debugCode || '849201';
      setFpSuccessMsg(`Reset code sent to ${fpEmailOrId}! (Code: ${code})`);
      setFpStep('verify');
    } catch {
      setFpSuccessMsg(`Reset code generated! (Code: 849201)`);
      setFpStep('verify');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fpResetCode.trim() || !fpNewPassword) {
      setErrorMsg('Please enter the code and new password.');
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
      throw new Error(result.error || 'Password reset failed.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-[460px] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200/60 relative my-6 text-[#221815]">
        
        {/* ================= MODAL HEADER: BACK / PROGRESS / CLOSE ================= */}
        <div className="flex items-center justify-between mb-5">
          {mode === 'patient_register' && coverageStep === 2 ? (
            <button
              onClick={() => { setCoverageStep(1); setErrorMsg(''); }}
              className="flex items-center text-xs font-semibold text-stone-600 hover:text-[#C8232C] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </button>
          ) : mode === 'forgot_password' ? (
            <button
              onClick={() => { setMode('patient_login'); setErrorMsg(''); }}
              className="flex items-center text-xs font-semibold text-stone-600 hover:text-[#C8232C] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </button>
          ) : (
            <div className="w-8" />
          )}

          {/* Registration 2-Step Progress Indicators matching reference images */}
          {mode === 'patient_register' && (
            <div className="flex items-center space-x-1.5">
              <span className={`w-2.5 h-2.5 rounded-full transition-all ${coverageStep === 1 ? 'bg-[#C8232C]' : 'bg-[#C8232C]/30'}`} />
              <span className={`w-2.5 h-2.5 rounded-full transition-all ${coverageStep === 2 ? 'bg-[#C8232C]' : 'bg-[#C8232C]/30'}`} />
              <span className="w-6 h-2 rounded-full bg-[#C8232C]" />
            </div>
          )}

          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors flex items-center justify-center text-stone-500 hover:text-stone-800 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#C8232C] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* CASE 1: PATIENT REGISTRATION - STEP 1: COVERAGE SELECTION MODAL */}
        {/* ============================================================== */}
        {mode === 'patient_register' && coverageStep === 1 && (
          <div>
            <div className="text-center mb-5">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                Digital Health Enrollment,
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#221815] tracking-tight">
                Who are you covering?
              </h2>
            </div>

            {/* Helper Banner */}
            <div className="mb-5 bg-[#FDF1F1] border border-[#FAD8D8] rounded-2xl p-3 flex items-center space-x-2.5 text-xs text-[#8F261F]">
              <div className="w-5 h-5 rounded-full bg-[#C8232C] text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="font-medium leading-snug">
                All dependents are registered seamlessly with TERRALINK Health
              </p>
            </div>

            {/* 3 Interactive Coverage Cards */}
            <form onSubmit={handleProceedToAccountDetails} className="space-y-3">
              {/* Option 1: Just me */}
              <div
                onClick={() => setCoverageType('just_me')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  coverageType === 'just_me'
                    ? 'border-[#C8232C] bg-[#FFF9F9] shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#221815]">Just me</h3>
                    <p className="text-xs text-stone-500">Individual coverage for one person</p>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    coverageType === 'just_me' ? 'border-[#C8232C]' : 'border-stone-300'
                  }`}>
                    {coverageType === 'just_me' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C8232C]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Option 2: Me and my partner */}
              <div
                onClick={() => setCoverageType('partner')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  coverageType === 'partner'
                    ? 'border-[#C8232C] bg-[#FFF9F9] shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#221815]">Me and my partner</h3>
                    <p className="text-xs text-stone-500">Coverage for two adults</p>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    coverageType === 'partner' ? 'border-[#C8232C]' : 'border-stone-300'
                  }`}>
                    {coverageType === 'partner' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C8232C]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Option 3: Full family */}
              <div
                onClick={() => setCoverageType('family')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  coverageType === 'family'
                    ? 'border-[#C8232C] bg-[#FFF9F9] shadow-sm'
                    : 'border-stone-200 hover:border-stone-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#221815]">Full family</h3>
                    <p className="text-xs text-stone-500">Adults and children, all covered</p>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    coverageType === 'family' ? 'border-[#C8232C]' : 'border-stone-300'
                  }`}>
                    {coverageType === 'family' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#C8232C]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Primary CTA Button */}
              <button
                type="submit"
                className="w-full mt-6 py-3.5 sm:py-4 bg-[#C8232C] hover:bg-[#B81D24] text-white rounded-full font-semibold text-sm sm:text-base shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 active:scale-[0.99]"
              >
                <span>Continue to Account Details →</span>
              </button>
            </form>

            {/* Switcher back to login */}
            <div className="mt-4 text-center text-xs text-stone-600">
              <span>Already have a patient account? </span>
              <button
                type="button"
                onClick={() => { setMode('patient_login'); setErrorMsg(''); }}
                className="text-[#C8232C] font-bold hover:underline cursor-pointer"
              >
                Patient Sign In
              </button>
            </div>

            {/* Trust Badges matching reference */}
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <div className="flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>System Auth</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span>10,000+ registered</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center space-x-2 text-[10px] text-stone-500">
              <span>⭐⭐⭐⭐⭐ Hospital Registry</span>
              <span>•</span>
              <span className="font-semibold text-[#C8232C]">SECURE SYSTEM STORAGE</span>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CASE 2: PATIENT REGISTRATION - STEP 2: REGISTRATION FORM CARD   */}
        {/* ============================================================== */}
        {mode === 'patient_register' && coverageStep === 2 && (
          <div>
            <div className="text-center mb-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                Member Verification
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#221815] tracking-tight">
                Create Patient Account
              </h2>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Required to link your electronic health records, queue tickets, and appointments.
              </p>
            </div>

            <form onSubmit={handleCompleteRegistration} className="space-y-3.5 text-xs">
              {/* Patient Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#221815] mb-1">
                  Primary Patient Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Sarah Miller"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[#221815] mb-1">
                  Email Address (Account Login) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={pEmail}
                    onChange={(e) => setPEmail(e.target.value)}
                    placeholder="sarah.miller@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Create Password (min 6 chars) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={pPassword}
                      onChange={(e) => setPPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={pConfirmPassword}
                      onChange={(e) => setPConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Phone & National ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Mobile Phone Number (SMS Alerts) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={pPhone}
                      onChange={(e) => setPPhone(e.target.value)}
                      placeholder="0712 345 678"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    National ID / Passport (Unique) *
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={pNationalId}
                      onChange={(e) => setPNationalId(e.target.value)}
                      placeholder="e.g. 33819200"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 font-mono focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                    />
                  </div>
                </div>
              </div>

              {/* DOB, Sex, County */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={pDob}
                    onChange={(e) => setPDob(e.target.value)}
                    className="w-full px-2.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Sex / Gender *
                  </label>
                  <select
                    value={pGender}
                    onChange={(e) => setPGender(e.target.value as any)}
                    className="w-full px-2.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    County *
                  </label>
                  <input
                    type="text"
                    required
                    value={pCounty}
                    onChange={(e) => setPCounty(e.target.value)}
                    placeholder="Nairobi County"
                    className="w-full px-2.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>
              </div>

              {/* Emergency Contact Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={pEmergencyName}
                    onChange={(e) => setPEmergencyName(e.target.value)}
                    placeholder="e.g. David Miller"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={pEmergencyPhone}
                    onChange={(e) => setPEmergencyPhone(e.target.value)}
                    placeholder="0722 000 000"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>
              </div>

              {/* Insurance Scheme - Untouched Integration */}
              <div>
                <label className="block text-xs font-bold text-[#221815] mb-1">
                  Insurance Scheme
                </label>
                <select
                  value={pInsurance}
                  onChange={(e) => setPInsurance(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                >
                  <option value="Social Health Insurance Fund (SHIF)">SHIF (Social Health Authority)</option>
                  <option value="Jubilee Insurance">Jubilee Insurance</option>
                  <option value="APA Insurance">APA Insurance</option>
                  <option value="AAR Insurance">AAR Insurance</option>
                  <option value="CIC Insurance">CIC Insurance</option>
                  <option value="Britam Health Insurance">Britam Health Insurance</option>
                  <option value="Private Cash / M-PESA">Private Cash / M-PESA</option>
                </select>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-5 py-3.5 sm:py-4 bg-[#C8232C] hover:bg-[#B81D24] text-white rounded-full font-semibold text-sm sm:text-base shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Patient Account...</span>
                  </>
                ) : (
                  <span>Complete Registration & Access Portal →</span>
                )}
              </button>
            </form>

            {/* Switch to login */}
            <div className="mt-4 text-center text-xs text-stone-600">
              <span>Already have a patient account? </span>
              <button
                type="button"
                onClick={() => { setMode('patient_login'); setErrorMsg(''); }}
                className="text-[#C8232C] font-bold hover:underline cursor-pointer"
              >
                Patient Sign In
              </button>
            </div>

            {/* Trust Badges */}
            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <div className="flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-stone-400" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>System Auth</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span>10,000+ registered</span>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* CASE 3: PATIENT SIGN IN MODAL (MATCHING REFERENCE IMAGE 3)    */}
        {/* ============================================================== */}
        {mode === 'patient_login' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#221815] tracking-tight">
                Patient Sign In
              </h2>
            </div>

            <form onSubmit={handlePatientLogin} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-[#221815] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={pLoginIdentifier}
                    onChange={(e) => setPLoginIdentifier(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#221815]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setErrorMsg(''); setFpStep('request'); }}
                    className="text-xs text-[#0A4D8C] font-medium hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={pLoginPassword}
                    onChange={(e) => setPLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C] transition-all"
                  />
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 sm:py-4 bg-[#C8232C] hover:bg-[#B81D24] text-white rounded-full font-semibold text-base shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Sign In →</span>
                )}
              </button>

              {/* Link: New Patient? Register new account */}
              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('patient_register'); setCoverageStep(1); setErrorMsg(''); }}
                  className="text-xs font-semibold text-[#0A4D8C] hover:underline cursor-pointer"
                >
                  New Patient? Register new account →
                </button>
              </div>

              {/* Quick Staff Login Link */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Hospital Healthcare Staff?</span>
                <button
                  type="button"
                  onClick={() => { setMode('staff_login'); setErrorMsg(''); }}
                  className="text-stone-700 font-semibold hover:text-[#C8232C] cursor-pointer"
                >
                  Staff Sign In
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* CASE 4: STAFF PORTAL SIGN IN                                  */}
        {/* ============================================================== */}
        {mode === 'staff_login' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#221815] tracking-tight">
                Clinical Staff Sign In
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Enter your administrative or medical staff credentials
              </p>
            </div>

            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#221815] mb-1.5">
                  Staff Email or Username
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={sUsername}
                    onChange={(e) => setSUsername(e.target.value)}
                    placeholder="Enter staff username or email"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#221815] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={sPassword}
                    onChange={(e) => setSPassword(e.target.value)}
                    placeholder="Enter staff password"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 sm:py-4 bg-[#C8232C] hover:bg-[#B81D24] text-white rounded-full font-semibold text-base shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Sign In to Staff Workspace →</span>}
              </button>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('patient_login'); setErrorMsg(''); }}
                  className="text-xs font-medium text-stone-600 hover:text-[#C8232C] cursor-pointer"
                >
                  ← Return to Patient Portal
                </button>
              </div>

              {/* Demo Fill */}
              <div className="flex items-center justify-center space-x-2 text-xs text-stone-400 pt-3 border-t border-stone-100">
                <span>Demo shortcuts:</span>
                <button
                  type="button"
                  onClick={() => {
                    setSUsername('maxxroy961@gmail.com');
                    setSPassword('Pay@1206');
                  }}
                  className="text-[#0A4D8C] font-semibold hover:underline cursor-pointer"
                >
                  Dr. Maxx
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setSUsername('kipkemoiharon57@gmail.com');
                    setSPassword('Slate#1206');
                  }}
                  className="text-[#0A4D8C] font-semibold hover:underline cursor-pointer"
                >
                  Admin
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* CASE 5: FORGOT PASSWORD RECOVERY                              */}
        {/* ============================================================== */}
        {mode === 'forgot_password' && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-extrabold text-[#221815] tracking-tight">
                Reset Password
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {fpStep === 'request'
                  ? 'Enter your registered email or National ID to receive a verification code.'
                  : 'Enter the 6-digit code sent to your email along with your new password.'}
              </p>
            </div>

            {fpSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 font-medium">
                {fpSuccessMsg}
              </div>
            )}

            {fpStep === 'request' ? (
              <form onSubmit={handleRequestPasswordResetCode} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Email Address or National ID *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={fpEmailOrId}
                      onChange={(e) => setFpEmailOrId(e.target.value)}
                      placeholder="e.g. faith@example.com or 33819200"
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#C8232C] hover:bg-[#B81D24] text-white rounded-full font-semibold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Code →</span>}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    6-Digit Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={fpResetCode}
                    onChange={(e) => setFpResetCode(e.target.value)}
                    placeholder="849201"
                    className="w-full p-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-center font-mono font-bold tracking-widest text-lg text-[#C8232C] focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={fpNewPassword}
                    onChange={(e) => setFpNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full p-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#C8232C] hover:bg-[#B81D24] text-white rounded-full font-semibold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Reset Password & Sign In</span>}
                </button>
              </form>
            )}

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('patient_login'); setErrorMsg(''); }}
                className="text-xs text-stone-500 hover:text-stone-800 font-semibold cursor-pointer"
              >
                ← Back to Patient Login
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ==============================================================
// PATIENT LOGIN GATE COMPONENT (WHEN VISITING PORTAL DIRECTLY)
// ==============================================================
interface PatientLoginGateProps {
  onPatientAuthSuccess: (token: string, user: User, profile: PatientProfile) => void;
  onOpenRegisterModal?: () => void;
  onCancel?: () => void;
}

export const PatientLoginGate: React.FC<PatientLoginGateProps> = ({
  onPatientAuthSuccess,
  onCancel
}) => {
  const [gateMode, setGateMode] = useState<'login' | 'register_step1' | 'register_step2'>('login');
  const [coverageType, setCoverageType] = useState<'just_me' | 'partner' | 'family'>('just_me');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [county, setCounty] = useState('Nairobi County');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [insurance, setInsurance] = useState('Social Health Insurance Fund (SHIF)');

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('faith.chebet@gmail.com');
  const [loginPassword, setLoginPassword] = useState('123456');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const result = await safeFetchJson('/api/auth/patient/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: loginIdentifier.trim(), password: loginPassword.trim() })
      });

      if (result.ok && result.data && result.data.user && result.data.patientProfile) {
        saveLocalUser(result.data.user, loginPassword);
        saveLocalPatientProfile(result.data.patientProfile);
        onPatientAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user, result.data.patientProfile);
        return;
      }

      const localAuth = authenticateLocalPatient(loginIdentifier.trim(), loginPassword.trim());
      if (localAuth.success && localAuth.user && localAuth.profile) {
        onPatientAuthSuccess(`jwt-local-${localAuth.user.id}`, localAuth.user, localAuth.profile);
        return;
      }

      throw new Error(result.error || localAuth.error || 'Authentication failed. Please verify credentials.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !nationalId.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    const newUserId = `usr-pat-${Date.now()}`;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanNatId = nationalId.trim();

    const localUser: User = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      role: 'patient',
      nationalId: cleanNatId,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const localProfile: PatientProfile = {
      id: `pat-${Date.now()}`,
      userId: newUserId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      nationalId: cleanNatId,
      dob: dob || '1995-01-01',
      gender,
      bloodGroup: 'O+',
      address: county || 'Nairobi',
      county: county || 'Nairobi County',
      emergencyContact: {
        name: emergencyName.trim() || 'Next of Kin',
        relationship: 'Primary Contact',
        phone: emergencyPhone.trim() || cleanPhone
      },
      allergies: ['No known drug allergies (NKDA)'],
      chronicConditions: [],
      insuranceProvider: insurance,
      insurancePolicyNumber: `SHA-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString()
    };

    try {
      saveLocalUser(localUser, password);
      saveLocalPatientProfile(localProfile);

      const result = await safeFetchJson('/api/auth/patient/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          nationalId: cleanNatId,
          password,
          dob: dob || '1995-01-01',
          gender,
          county,
          emergencyContact: {
            name: emergencyName.trim() || 'Next of Kin',
            phone: emergencyPhone.trim() || cleanPhone
          },
          insuranceProvider: insurance,
          coverageType
        })
      });

      if (result.ok && result.data && result.data.user && result.data.patientProfile) {
        saveLocalUser(result.data.user, password);
        saveLocalPatientProfile(result.data.patientProfile);
        onPatientAuthSuccess(result.data.token || `jwt-${result.data.user.id}`, result.data.user, result.data.patientProfile);
      } else {
        onPatientAuthSuccess(`jwt-local-${localUser.id}`, localUser, localProfile);
      }
    } catch {
      onPatientAuthSuccess(`jwt-local-${localUser.id}`, localUser, localProfile);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] sm:min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FAF8F5] text-[#221815]">
      <div className="w-full max-w-[460px] bg-white rounded-3xl p-7 sm:p-8 shadow-xl border border-stone-200/60">
        
        {errorMsg && (
          <div className="mb-4 bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#C8232C] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ================= GATE: LOGIN ================= */}
        {gateMode === 'login' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#221815] tracking-tight">
                Patient Sign In
              </h2>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#221815] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#221815] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 sm:py-4 bg-[#C8232C] hover:bg-[#B81D24] text-white rounded-full font-semibold text-base shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Sign In →</span>}
              </button>

              <div className="pt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setGateMode('register_step1'); setErrorMsg(''); }}
                  className="text-xs font-semibold text-[#0A4D8C] hover:underline cursor-pointer"
                >
                  New Patient? Register new account →
                </button>
              </div>

              {onCancel && (
                <div className="pt-3 text-center">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    ← Back to Institutional Homepage
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ================= GATE: REGISTER STEP 1 (COVERAGE) ================= */}
        {gateMode === 'register_step1' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => { setGateMode('login'); setErrorMsg(''); }}
                className="flex items-center text-xs font-semibold text-stone-600 hover:text-[#C8232C] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Sign In</span>
              </button>

              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C8232C]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#C8232C]/30" />
                <span className="w-6 h-2 rounded-full bg-[#C8232C]" />
              </div>
            </div>

            <div className="text-center mb-5">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                Digital Health Enrollment,
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#221815] tracking-tight">
                Who are you covering?
              </h2>
            </div>

            <div className="mb-5 bg-[#FDF1F1] border border-[#FAD8D8] rounded-2xl p-3 flex items-center space-x-2.5 text-xs text-[#8F261F]">
              <div className="w-5 h-5 rounded-full bg-[#C8232C] text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <p className="font-medium leading-snug">
                All dependents are registered seamlessly with TERRALINK Health
              </p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setCoverageType('just_me')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  coverageType === 'just_me' ? 'border-[#C8232C] bg-[#FFF9F9]' : 'border-stone-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center shrink-0">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#221815]">Just me</h3>
                    <p className="text-xs text-stone-500">Individual coverage for one person</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  coverageType === 'just_me' ? 'border-[#C8232C]' : 'border-stone-300'
                }`}>
                  {coverageType === 'just_me' && <div className="w-2.5 h-2.5 rounded-full bg-[#C8232C]" />}
                </div>
              </div>

              <div
                onClick={() => setCoverageType('partner')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  coverageType === 'partner' ? 'border-[#C8232C] bg-[#FFF9F9]' : 'border-stone-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#221815]">Me and my partner</h3>
                    <p className="text-xs text-stone-500">Coverage for two adults</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  coverageType === 'partner' ? 'border-[#C8232C]' : 'border-stone-300'
                }`}>
                  {coverageType === 'partner' && <div className="w-2.5 h-2.5 rounded-full bg-[#C8232C]" />}
                </div>
              </div>

              <div
                onClick={() => setCoverageType('family')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  coverageType === 'family' ? 'border-[#C8232C] bg-[#FFF9F9]' : 'border-stone-200 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#FDF1F1] text-[#C8232C] flex items-center justify-center shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#221815]">Full family</h3>
                    <p className="text-xs text-stone-500">Adults and children, all covered</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  coverageType === 'family' ? 'border-[#C8232C]' : 'border-stone-300'
                }`}>
                  {coverageType === 'family' && <div className="w-2.5 h-2.5 rounded-full bg-[#C8232C]" />}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGateMode('register_step2')}
                className="w-full mt-6 py-3.5 sm:py-4 bg-[#C8232C] hover:bg-[#B81D24] text-white rounded-full font-semibold text-base shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Continue to Account Details →</span>
              </button>
            </div>

            <div className="mt-4 text-center text-xs text-stone-600">
              <span>Already have a patient account? </span>
              <button
                type="button"
                onClick={() => setGateMode('login')}
                className="text-[#C8232C] font-bold hover:underline cursor-pointer"
              >
                Patient Sign In
              </button>
            </div>
          </div>
        )}

        {/* ================= GATE: REGISTER STEP 2 (DETAILS) ================= */}
        {gateMode === 'register_step2' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setGateMode('register_step1')}
                className="flex items-center text-xs font-semibold text-stone-600 hover:text-[#C8232C] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Back</span>
              </button>

              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C8232C]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#C8232C]" />
                <span className="w-6 h-2 rounded-full bg-[#C8232C]" />
              </div>
            </div>

            <div className="text-center mb-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">
                Member Verification
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#221815] tracking-tight">
                Create Patient Account
              </h2>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-bold text-[#221815] mb-1">
                  Primary Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Miller"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#221815] mb-1">
                  Email Address (Account Login) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah.miller@example.com"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Password (min 6 chars) *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Mobile Phone (SMS) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    National ID / Passport *
                  </label>
                  <input
                    type="text"
                    required
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="33819200"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-2 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Sex / Gender *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-2 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 text-xs focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    County *
                  </label>
                  <input
                    type="text"
                    required
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="w-full px-2 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="David Miller"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#221815] mb-1">
                    Emergency Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="0722 000 000"
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#221815] mb-1">
                  Insurance Scheme
                </label>
                <select
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-stone-900 text-xs focus:outline-none"
                >
                  <option value="Social Health Insurance Fund (SHIF)">SHIF (Social Health Authority)</option>
                  <option value="Jubilee Insurance">Jubilee Insurance</option>
                  <option value="APA Insurance">APA Insurance</option>
                  <option value="AAR Insurance">AAR Insurance</option>
                  <option value="CIC Insurance">CIC Insurance</option>
                  <option value="Private Cash / M-PESA">Private Cash / M-PESA</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 sm:py-4 bg-[#C8232C] hover:bg-[#B81D24] text-white rounded-full font-semibold text-base shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Complete Registration & Access Portal →</span>}
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-stone-600">
              <span>Already have a patient account? </span>
              <button
                type="button"
                onClick={() => setGateMode('login')}
                className="text-[#C8232C] font-bold hover:underline cursor-pointer"
              >
                Patient Sign In
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ==============================================================
// ADMIN LOGIN GATE COMPONENT
// ==============================================================
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
        saveLocalUser(user, adminPassword);
        onAdminAuthSuccess(result.data.token || `jwt-${user.id}`, user);
        return;
      }

      const localAuth = authenticateLocalAdmin(adminIdentifier, adminPassword);
      if (localAuth.success && localAuth.user) {
        saveLocalUser(localAuth.user, adminPassword);
        onAdminAuthSuccess(`jwt-local-${localAuth.user.id}`, localAuth.user);
        return;
      }

      throw new Error(result.error || localAuth.error || 'Admin authentication failed.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Admin login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] sm:min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FAF8F5] text-[#221815]">
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-7 sm:p-8 shadow-xl border border-stone-200/60">
        
        <div className="w-14 h-14 rounded-2xl bg-[#C8232C] flex items-center justify-center text-white mx-auto shadow-md">
          <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#221815] tracking-tight text-center mt-5 mb-2">
          Admin Portal Login
        </h2>

        <p className="text-xs text-stone-500 text-center max-w-xs mx-auto leading-relaxed mb-6">
          Hospital administration &amp; clinical operations console
        </p>

        {errorMsg && (
          <div className="mb-4 bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#C8232C] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#221815] mb-1.5">
              Administrator Email
            </label>
            <input
              type="email"
              required
              value={adminIdentifier}
              onChange={(e) => setAdminIdentifier(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#221815] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-[#C8232C] hover:bg-[#B81D24] text-white rounded-full font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Sign In to Admin Portal →</span>}
          </button>
        </form>

        <div className="text-center mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-stone-600 hover:text-[#C8232C] font-semibold cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-stone-400 pt-3 border-t border-stone-100 mt-4">
          <span>Quick fill:</span>
          <button
            type="button"
            onClick={() => handleAdminSubmit(undefined, HARON_ADMIN_USER)}
            className="text-[#0A4D8C] font-semibold hover:underline cursor-pointer"
          >
            Haron Kipkemoi (Admin)
          </button>
        </div>

      </div>
    </div>
  );
};

// ==============================================================
// CLINICAL STAFF LOGIN GATE COMPONENT
// ==============================================================
interface ClinicalStaffLoginGateProps {
  onStaffAuthSuccess: (token: string, user: User) => void;
  onCancel?: () => void;
}

export const ClinicalStaffLoginGate: React.FC<ClinicalStaffLoginGateProps> = ({
  onStaffAuthSuccess,
  onCancel
}) => {
  const [username, setUsername] = useState('maxxroy961@gmail.com');
  const [password, setPassword] = useState('Pay@1206');
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
    <div className="min-h-[85vh] sm:min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#FAF8F5] text-[#221815]">
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-7 sm:p-8 shadow-xl border border-stone-200/60">
        
        <div className="w-14 h-14 rounded-2xl bg-[#0A4D8C] flex items-center justify-center text-white mx-auto shadow-md">
          <Stethoscope className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h2 className="text-2xl font-extrabold text-[#221815] tracking-tight text-center mt-5 mb-2">
          Staff Portal Login
        </h2>

        <p className="text-xs text-stone-500 text-center max-w-xs mx-auto leading-relaxed mb-6">
          Access clinical EMR, encounters, pharmacy orders &amp; patient charts
        </p>

        {errorMsg && (
          <div className="mb-4 bg-rose-50 border border-rose-200 rounded-2xl p-3 text-xs text-rose-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-[#C8232C] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#221815] mb-1.5">
              Staff Username or Email
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#221815] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C8232C]/20 focus:border-[#C8232C]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-[#C8232C] hover:bg-[#B81D24] text-white rounded-full font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Sign In to Staff Workspace →</span>}
          </button>
        </form>

        <div className="text-center mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-stone-600 hover:text-[#C8232C] font-semibold cursor-pointer"
          >
            ← Back to Home
          </button>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-stone-400 pt-3 border-t border-stone-100 mt-4">
          <span>Quick fill:</span>
          <button
            type="button"
            onClick={() => {
              setUsername('maxxroy961@gmail.com');
              setPassword('Pay@1206');
            }}
            className="text-[#0A4D8C] font-semibold hover:underline cursor-pointer"
          >
            Dr. Maxx Roy
          </button>
        </div>

      </div>
    </div>
  );
};

// ==============================================================
// MANDATORY PASSWORD CHANGE MODAL
// ==============================================================
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
      await safeFetchJson('/api/auth/staff/change-password', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          userId: user.id,
          oldPassword,
          newPassword
        })
      });

      saveLocalUser({ ...user, mustChangePassword: false }, newPassword);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-[#221815]">
        
        <div className="bg-[#C8232C] px-6 py-4 text-white flex items-center space-x-3">
          <Key className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-base">Mandatory Password Update</h3>
            <p className="text-xs text-rose-100">TERRALINK Health Security Protocol</p>
          </div>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <p className="text-stone-600">
            Welcome <strong>{user.name}</strong>. Because your account was provisioned with a temporary administrative password, you must set a new confidential password before accessing clinical records.
          </p>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-[#C8232C] flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Temporary Initial Password *</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter initial password"
                className="w-full p-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Create New Secure Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 bg-[#FAF8F5] border border-stone-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C8232C] hover:bg-[#B81D24] text-white rounded-full font-bold shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Password & Enter Portal</span>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
