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
  Stethoscope
} from 'lucide-react';
import { User, PatientProfile } from '../types';

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAuthSuccess: (token: string, user: User, profile: PatientProfile) => void;
  onStaffAuthSuccess: (token: string, user: User) => void;
  initialMode?: 'patient_login' | 'patient_register' | 'staff_login';
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  isOpen,
  onClose,
  onPatientAuthSuccess,
  onStaffAuthSuccess,
  initialMode = 'patient_login'
}) => {
  const [mode, setMode] = useState<'patient_login' | 'patient_register' | 'staff_login'>(initialMode);
  
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
  const [pChronicConditions, setPChronicConditions] = useState('');

  // Patient Login Form
  const [pLoginIdentifier, setPLoginIdentifier] = useState('');
  const [pLoginPassword, setPLoginPassword] = useState('');

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
      const res = await fetch('/api/auth/patient/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: pLoginIdentifier, password: pLoginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      onPatientAuthSuccess(data.token, data.user, data.patientProfile);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/patient/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pName,
          phone: pPhone,
          email: pEmail,
          nationalId: pNationalId,
          password: pPassword,
          dob: pDob,
          gender: pGender,
          bloodGroup: pBloodGroup,
          insuranceProvider: pInsurance
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      onPatientAuthSuccess(data.token, data.user, data.patientProfile);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: sUsername, password: sPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Staff/Admin login failed');

      onStaffAuthSuccess(data.token, data.user);
      onClose();
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
            onClick={() => { setMode('patient_login'); setErrorMsg(''); }}
            className={`py-3 text-center transition-colors ${
              mode === 'patient_login' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Patient Sign In
          </button>
          <button
            onClick={() => { setMode('patient_register'); setErrorMsg(''); }}
            className={`py-3 text-center transition-colors ${
              mode === 'patient_register' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            New Patient
          </button>
          <button
            onClick={() => { setMode('staff_login'); setErrorMsg(''); }}
            className={`py-3 text-center transition-colors ${
              mode === 'staff_login' ? 'bg-white text-emerald-700 border-b-2 border-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Staff & Admin
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Password *
                </label>
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

              <p className="text-center text-[11px] text-slate-500 pt-1">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('patient_register')}
                  className="text-emerald-700 font-bold hover:underline"
                >
                  Register as New Patient
                </button>
              </p>
            </form>
          )}

          {/* 2. Patient Register */}
          {mode === 'patient_register' && (
            <form onSubmit={handlePatientRegister} className="space-y-3 text-xs">
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 text-[11px] text-emerald-800">
                <p className="font-semibold">Self-Registration & Patient Master Index Entry</p>
                <p className="mt-0.5 text-slate-600">Please enter your accurate personal and health details below.</p>
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
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
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
                  <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Person</label>
                  <input
                    type="text"
                    value={pEmergencyContact}
                    onChange={(e) => setPEmergencyContact(e.target.value)}
                    placeholder="e.g. David Muthoni (Spouse)"
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
                  <label className="block font-semibold text-slate-700 mb-1">Known Allergies (if any)</label>
                  <input
                    type="text"
                    value={pAllergies}
                    onChange={(e) => setPAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts (or None)"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Insurance / Scheme</label>
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
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Get Started</span>}
              </button>
            </form>
          )}

          {/* 3. Staff & Admin Login */}
          {mode === 'staff_login' && (
            <form onSubmit={handleStaffLogin} className="space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600">
                <p className="font-semibold text-slate-800">Healthcare Staff & Administrator Authorization</p>
                <p className="mt-0.5">
                  Sign in with your staff username or administrator email (e.g. <strong>kipkemoiharon57@gmail.com</strong> or <strong>kipkemoiharon4@gmail.com</strong>).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Username or Admin Email *</label>
                <input
                  type="text"
                  required
                  value={sUsername}
                  onChange={(e) => setSUsername(e.target.value)}
                  placeholder="e.g. kipkemoiharon57@gmail.com or dr.kamau"
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
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
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In as Staff / Administrator</span>}
              </button>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Quick Test Credentials:</p>
                <p>• Admin: <span className="font-mono text-indigo-700">kipkemoiharon57@gmail.com</span> or <span className="font-mono text-indigo-700">kipkemoiharon4@gmail.com</span> (Pass: <span className="font-mono">password123</span> / any)</p>
                <p>• Doctor: <span className="font-mono">dr.kamau</span> (Pass: <span className="font-mono">doctor123</span>)</p>
                <p>• Lab / Pharmacy: <span className="font-mono">lab.otieno</span> / <span className="font-mono">pharm.chebet</span></p>
              </div>
            </form>
          )}

        </div>
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
      const res = await fetch('/api/auth/staff/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          oldPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password update failed');

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
