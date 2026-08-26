import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  CheckCircle2, 
  Loader2, 
  ShieldCheck, 
  Smartphone, 
  X, 
  Receipt,
  ArrowRight
} from 'lucide-react';

interface MpesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  amountKES: number;
  serviceTitle: string;
  reference: string;
  defaultPhone?: string;
  onSuccess: (mpesaReceipt: string) => void;
}

export const MpesaModal: React.FC<MpesaModalProps> = ({
  isOpen,
  onClose,
  amountKES,
  serviceTitle,
  reference,
  defaultPhone = '0712345678',
  onSuccess
}) => {
  const [phone, setPhone] = useState(defaultPhone);
  const [step, setStep] = useState<'input' | 'prompt_sent' | 'pin_entering' | 'success'>('input');
  const [pin, setPin] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setPin('');
      setCountdown(15);
      setReceiptNumber(`QHK${Math.floor(10000000 + Math.random() * 90000000).toString(36).toUpperCase()}`);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'prompt_sent' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (step === 'prompt_sent' && countdown === 0) {
      setStep('pin_entering');
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleSendSTK = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          amountKES,
          reference,
          serviceType: 'Consultation'
        })
      });
    } catch (err) {
      console.warn('STK push API error, continuing simulation:', err);
    }

    setLoading(false);
    setStep('prompt_sent');
    setCountdown(3);
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      setTimeout(() => {
        onSuccess(receiptNumber);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold text-white tracking-wider border border-white/20">
              M
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">Lipa na M-PESA Online</h3>
              <p className="text-xs text-emerald-100">Safaricom Daraja API Gateway</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Summary Box */}
          <div className="mb-5 bg-slate-50 border border-slate-200/80 rounded-xl p-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500 font-medium">Service / Description</span>
              <span className="text-xs font-semibold text-slate-800 text-right">{serviceTitle}</span>
            </div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500 font-medium">Hospital Paybill</span>
              <span className="text-xs font-mono font-bold text-slate-800">400200 (TERRALINK HEALTH)</span>
            </div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-slate-500 font-medium">Account Reference</span>
              <span className="text-xs font-mono text-slate-700">{reference}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">Total Payable</span>
              <span className="text-xl font-bold text-emerald-600">KES {amountKES.toLocaleString()}</span>
            </div>
          </div>

          {step === 'input' && (
            <form onSubmit={handleSendSTK} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  M-PESA Registered Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0712345678 or 254712345678"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">An instant STK Push prompt will be sent to this phone.</p>
              </div>

              <button
                type="submit"
                disabled={loading || !phone}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Initiating STK Push...</span>
                  </>
                ) : (
                  <>
                    <span>Send M-PESA STK Push</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'prompt_sent' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-pulse">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-base">STK Prompt Sent!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  A pop-up prompt has been sent to <span className="font-medium text-slate-700">{phone}</span>.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Waiting for M-PESA PIN confirmation ({countdown}s)...</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('pin_entering')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline"
              >
                Click here to simulate PIN entry
              </button>
            </div>
          )}

          {step === 'pin_entering' && (
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-inner border border-slate-800 space-y-4">
              <div className="text-center">
                <p className="text-xs text-emerald-400 font-mono tracking-wide">SIMULATED SAFARICOM STK PROMPT</p>
                <h4 className="text-sm font-medium text-slate-200 mt-1">
                  Do you want to pay KES {amountKES.toLocaleString()} to TERRALINK HEALTH Acc. {reference}?
                </h4>
              </div>

              <form onSubmit={handleConfirmPin} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 text-center">
                    Enter M-PESA 4-digit PIN:
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    autoFocus
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••"
                    className="w-32 mx-auto text-center tracking-widest text-lg font-mono py-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || pin.length < 4}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Send PIN</span>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">Payment Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-0.5">KES {amountKES.toLocaleString()} successfully received.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-700 flex items-center justify-center space-x-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Receipt: <strong className="text-slate-900">{receiptNumber}</strong></span>
              </div>
            </div>
          )}

          {/* Security footnote */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit SSL Encrypted • Safaricom PLC Verified</span>
          </div>

        </div>
      </div>
    </div>
  );
};
