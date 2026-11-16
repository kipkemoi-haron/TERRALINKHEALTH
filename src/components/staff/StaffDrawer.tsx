import React, { useState } from 'react';
import { 
  Activity, 
  LayoutGrid, 
  Users, 
  Stethoscope, 
  Calendar, 
  FlaskConical, 
  Bed, 
  Scan, 
  Pill, 
  ChevronRight, 
  LogOut, 
  Home, 
  UserCircle,
  ChevronDown,
  Camera,
  X,
  Smartphone
} from 'lucide-react';
import { User } from '../../types';

export type StaffPortalTab = 
  | 'dashboard' 
  | 'patients' 
  | 'consultation' 
  | 'schedule' 
  | 'lab_orders' 
  | 'admissions_queue' 
  | 'radiology_workbench' 
  | 'pharmacy_dispense';

interface StaffDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: StaffPortalTab;
  onSelectTab: (tab: StaffPortalTab) => void;
  currentUser: User;
  onNavigatePortal?: (portal: 'home' | 'patient' | 'provider' | 'admin') => void;
  onDownloadApp?: () => void;
  onLogout?: () => void;
  onOpenAvatarModal?: () => void;
}

export const StaffDrawer: React.FC<StaffDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  currentUser,
  onNavigatePortal,
  onDownloadApp,
  onLogout,
  onOpenAvatarModal
}) => {
  const [showMoreTools, setShowMoreTools] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (!isOpen) return null;

  // Primary navigation items - exactly matching the reference screenshot
  const primaryNavItems: { id: StaffPortalTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'consultation', label: 'Consultation', icon: Stethoscope },
    { id: 'schedule', label: 'My Schedule', icon: Calendar },
    { id: 'lab_orders', label: 'Lab Orders', icon: FlaskConical },
  ];

  // Secondary hospital tools
  const secondaryNavItems: { id: StaffPortalTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'admissions_queue', label: 'Inpatient Admissions', icon: Bed },
    { id: 'radiology_workbench', label: 'Radiology & Scans', icon: Scan },
    { id: 'pharmacy_dispense', label: 'Pharmacy Dispense', icon: Pill },
  ];

  const initials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('') || 'MB';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dimmed backdrop overlay - allows seeing the under-screen on right */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container - Uniform Warm Theme */}
      <aside 
        className="relative w-[75%] sm:w-[285px] max-w-[305px] h-full bg-[#FAF8F5] text-[#221815] border-r border-[#EAE5DC] flex flex-col shadow-2xl z-10 select-none animate-in slide-in-from-left duration-200 ease-out"
        id="staff-portal-drawer"
      >
        {/* Drawer Header - Matching uniform branding */}
        <div className="pt-4 px-4 pb-3 flex items-center justify-between border-b border-[#EAE5DC] bg-[#FAF8F5]">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Crimson Red rounded badge with Activity pulse */}
            <div className="w-10 h-10 rounded-xl bg-[#C8232C] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Activity className="w-5 h-5 text-white stroke-[2.4]" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-[#221815] text-[15px] sm:text-[16px] leading-tight tracking-tight truncate">
                TERRALINK Health
              </h2>
              <p className="text-[#0A4D8C] text-xs font-bold leading-tight mt-0.5 truncate">
                Healthcare Provider
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer flex items-center justify-center shrink-0 ml-1.5 focus:outline-hidden"
            aria-label="Close navigation"
            title="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-none">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-white text-[#C8232C] shadow-xs font-bold border border-[#EAE5DC]'
                    : 'text-[#221815] hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C8232C]' : 'text-stone-600'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#C8232C] shrink-0 ml-1" />}
              </button>
            );
          })}

          {/* Collapsible Secondary Tools */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowMoreTools(!showMoreTools)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-stone-500 hover:text-[#221815] transition-colors cursor-pointer"
            >
              <span>More Hospital Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreTools ? 'rotate-180' : ''}`} />
            </button>

            {showMoreTools && (
              <div className="space-y-1 pl-1 pt-1 animate-in fade-in duration-150">
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                        isActive
                          ? 'bg-white text-[#C8232C] font-bold border border-[#EAE5DC]'
                          : 'text-[#221815] hover:bg-stone-200/50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#C8232C]' : 'text-stone-600'}`} />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#C8232C]" />}
                    </button>
                  );
                })}

                <div className="pt-2 pb-1">
                  <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Portals
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigatePortal?.('home');
                      onClose();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs text-stone-600 hover:text-[#221815] hover:bg-stone-200/50 cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5 text-stone-500" />
                    <span>Public Hospital Home</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigatePortal?.('patient');
                      onClose();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs text-stone-600 hover:text-[#221815] hover:bg-stone-200/50 cursor-pointer"
                  >
                    <UserCircle className="w-3.5 h-3.5 text-stone-500" />
                    <span>Patient Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {onDownloadApp && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onDownloadApp();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-[#221815] hover:bg-rose-50/80 border border-transparent hover:border-rose-200 transition-all cursor-pointer text-left"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Smartphone className="w-4 h-4 shrink-0 text-[#C8232C]" />
                <span className="truncate font-semibold">Download App</span>
              </div>
              <span className="px-1.5 py-0.5 bg-[#FDF1F1] text-[#C8232C] text-[9px] font-bold rounded-full shrink-0">
                APP
              </span>
            </button>
          )}
        </nav>

        {/* Drawer Footer User Profile */}
        <div className="p-3.5 bg-[#F5F1E8] border-t border-[#EAE5DC] relative">
          {/* Popup profile options */}
          {showProfileMenu && (
            <div className="absolute bottom-16 left-3 right-3 bg-white border border-[#EAE5DC] rounded-2xl p-2 shadow-xl text-xs space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150 z-20">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenAvatarModal?.();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-[#221815] hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-stone-500" />
                <span>Change Profile Photo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigatePortal?.('home');
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-[#221815] hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-stone-500" />
                <span>Hospital Homepage</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout?.();
                  onClose();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-[#C8232C] hover:bg-rose-50 transition-colors cursor-pointer font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 cursor-pointer p-1 rounded-xl hover:bg-black/5 transition-colors"
            title="Profile & actions"
          >
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-[#EAE5DC] shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#C8232C] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {initials}
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-[#221815] truncate leading-tight">
                {currentUser.name || 'Marko Bare'}
              </p>
              <p className="text-[11px] text-[#0A4D8C] font-semibold truncate leading-tight mt-0.5">
                {currentUser.role === 'admin' 
                  ? 'Administrator' 
                  : `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} · Staff`}
              </p>
            </div>

            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </aside>
    </div>
  );
};
