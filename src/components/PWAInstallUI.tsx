import React from 'react';
import {
  Download,
  Smartphone,
  X,
  Share,
  PlusSquare,
  CheckCircle2,
  MoreVertical,
  ShieldCheck,
  WifiOff,
  FileDown,
  Activity,
} from 'lucide-react';

interface TopAppDownloadBannerProps {
  isInstalled: boolean;
  isBannerDismissed: boolean;
  onDownloadClick: () => void;
  onDismiss: () => void;
}

export const TopAppDownloadBanner: React.FC<TopAppDownloadBannerProps> = ({
  isInstalled,
  isBannerDismissed,
  onDownloadClick,
  onDismiss,
}) => {
  const [iconLoadError, setIconLoadError] = React.useState(false);

  if (isInstalled || isBannerDismissed) return null;

  return (
    <div
      role="region"
      aria-label="Download TERRALINK HEALTH mobile app"
      className="md:hidden relative z-50 w-full bg-[#0B132B] text-white border-b border-white/10 shadow-sm shrink-0"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-2.5">
        {/* Left: App Icon + Message */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#D90429] flex items-center justify-center shrink-0 shadow-xs overflow-hidden border border-white/15">
            {!iconLoadError ? (
              <img
                src="/pwa-192x192.png"
                alt="TERRALINK HEALTH App"
                className="w-full h-full object-cover"
                onError={() => setIconLoadError(true)}
              />
            ) : (
              <Activity className="w-4 h-4 text-white stroke-[2.4]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-white leading-tight truncate">
              TERRALINK HEALTH App
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-300 leading-tight line-clamp-1">
              Get the mobile app for faster access and real-time notifications
            </p>
          </div>
        </div>

        {/* Right: Download App CTA + Dismiss X */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            type="button"
            onClick={onDownloadClick}
            className="px-3 sm:px-3.5 py-1.5 rounded-full bg-[#D90429] hover:bg-[#b80323] active:scale-95 text-white text-[11px] sm:text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.4]" />
            <span>Download App</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss app download banner"
            title="Dismiss"
            className="w-7 h-7 rounded-full text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isApkAvailable: boolean;
  onNativeInstall: () => Promise<boolean>;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  isIOS,
  isAndroid,
  isApkAvailable,
  onNativeInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#EAE5DC] relative max-h-[90vh] overflow-y-auto space-y-5 text-left">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close installation guide"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3.5 pr-8">
          <img
            src="/pwa-192x192.png"
            alt="TERRALINK HEALTH"
            className="w-12 h-12 rounded-2xl shadow-md border border-[#EAE5DC] shrink-0"
          />
          <div>
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#FDF1F1] text-[#C8232C] text-[10px] font-bold uppercase tracking-wider">
              <Smartphone className="w-3 h-3" />
              <span>Mobile App</span>
            </span>
            <h3 className="text-lg font-extrabold text-[#0B132B] leading-tight mt-0.5">
              Install TERRALINK HEALTH
            </h3>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Install TERRALINK HEALTH directly to your home screen for full-screen access, instant appointment updates, and offline medical record viewing.
        </p>

        {/* Already Installed Confirmation */}
        {isInstalled && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2.5 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>You are already running TERRALINK HEALTH in standalone mobile app mode.</span>
          </div>
        )}

        {/* 1. Native One-Tap Install (Android / Chrome / Edge) */}
        {isInstallable && !isInstalled && (
          <button
            type="button"
            onClick={onNativeInstall}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#D90429] hover:bg-[#b80323] active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-red-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.4]" />
            <span>Install App to Home Screen</span>
          </button>
        )}

        {/* 2. iOS Safari Instructions */}
        <div
          className={`p-4 rounded-2xl border space-y-2.5 ${
            isIOS ? 'bg-[#FAF8F5] border-[#C8232C]/40' : 'bg-[#FAF8F5] border-[#EAE5DC]'
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#0B132B] uppercase tracking-wide">
              iPhone &amp; iPad (Safari)
            </h4>
            {isIOS && (
              <span className="px-2 py-0.5 rounded-full bg-[#FDF1F1] text-[#C8232C] text-[10px] font-bold">
                Your Device
              </span>
            )}
          </div>
          <ol className="space-y-2 text-xs text-stone-700">
            <li className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-white border border-[#EAE5DC] text-[#0B132B] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <span className="flex items-center flex-wrap gap-1">
                Tap the <strong className="inline-flex items-center gap-1 text-[#0A4D8C]"><Share className="w-3.5 h-3.5" /> Share</strong> button in Safari&apos;s toolbar.
              </span>
            </li>
            <li className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-white border border-[#EAE5DC] text-[#0B132B] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <span className="flex items-center flex-wrap gap-1">
                Scroll down and tap <strong className="inline-flex items-center gap-1 text-[#0B132B]"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen</strong>.
              </span>
            </li>
            <li className="flex items-start space-x-2.5">
              <span className="w-5 h-5 rounded-full bg-white border border-[#EAE5DC] text-[#0B132B] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span>
                Tap <strong>Add</strong> &mdash; opens full-screen without browser bars.
              </span>
            </li>
          </ol>
        </div>

        {/* 3. Android Chrome & Direct APK Download */}
        <div
          className={`p-4 rounded-2xl border space-y-3 ${
            isAndroid ? 'bg-[#FAF8F5] border-[#0A4D8C]/40' : 'bg-[#FAF8F5] border-[#EAE5DC]'
          }`}
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-[#0B132B] uppercase tracking-wide">
              Android (Chrome &amp; APK)
            </h4>
            {isAndroid && (
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0A4D8C] text-[10px] font-bold">
                Your Device
              </span>
            )}
          </div>

          <p className="text-xs text-stone-700 leading-relaxed flex items-start gap-2">
            <MoreVertical className="w-4 h-4 text-[#0A4D8C] shrink-0 mt-0.5" />
            <span>
              In Chrome, tap the menu (<strong>⋮</strong>) at top right and select{' '}
              <strong>Install app</strong> or <strong>Add to Home screen</strong>.
            </span>
          </p>

          {isApkAvailable ? (
            <a
              href="/app.apk"
              download="TERRALINK-HEALTH.apk"
              className="w-full py-2.5 px-4 rounded-xl bg-[#004B87] hover:bg-[#003B6B] text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Android APK (.apk)</span>
            </a>
          ) : (
            <div className="p-3 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[#0B132B]">Android APK Package</p>
                <p className="text-[10px] text-stone-500">
                  Direct <code className="font-mono text-[#0A4D8C]">/app.apk</code> download activates once APK is hosted in <code className="font-mono">/public/app.apk</code>.
                </p>
              </div>
              <a
                href="/app.apk"
                download="TERRALINK-HEALTH.apk"
                onClick={(e) => {
                  e.preventDefault();
                }}
                aria-disabled="true"
                className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-400 font-bold text-[10px] whitespace-nowrap cursor-not-allowed shrink-0"
              >
                Pending APK
              </a>
            </div>
          )}
        </div>

        <div className="pt-1 flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Offline &amp; Standalone Ready</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

interface OfflineIndicatorProps {
  isOnline: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 z-[60] flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline Mode &mdash; Cached hospital data active</span>
    </div>
  );
};
