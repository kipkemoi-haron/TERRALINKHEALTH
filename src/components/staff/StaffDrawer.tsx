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
  Camera
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

      {/* Drawer Container - Deep Oceanic Teal matching screenshot exactly */}
      <aside 
        className="relative w-[72%] sm:w-[285px] max-w-[305px] h-full bg-[#023545] text-white flex flex-col shadow-2xl z-10 select-none animate-in slide-in-from-left duration-200 ease-out"
        id="staff-portal-drawer"
      >
        {/* Drawer Header - Matching reference with green icon, title & hollow ring toggle */}
        <div className="pt-5 px-4 pb-2 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Green rounded badge with heart pulse */}
            <div className="w-10 h-10 rounded-xl bg-[#13b886] flex items-center justify-center text-white shrink-0 shadow-xs">
              <Activity className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-white text-[15px] sm:text-[16px] leading-tight tracking-tight truncate">
                TERRALINK Health
              </h2>
              <p className="text-[#82b8c7] text-xs font-normal leading-tight mt-0.5 truncate">
                Healthcare Provider
              </p>
            </div>
          </div>

          {/* Hollow circular ring toggle from reference screenshot */}
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full border-[2px] border-[#6fa3b2] hover:border-white transition-colors cursor-pointer flex items-center justify-center shrink-0 ml-1.5 focus:outline-hidden"
            aria-label="Close navigation"
            title="Close menu"
          >
            <span className="sr-only">Close navigation</span>
          </button>
        </div>

        {/* Navigation List - Seamless background with exact font and spacing */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
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
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-[15px] font-medium transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#0b4c5e] text-white shadow-xs font-semibold'
                    : 'text-white/95 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <Icon className="w-5 h-5 text-white shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-[#82b8c7] shrink-0 ml-1" />}
              </button>
            );
          })}

          {/* Collapsible Secondary Tools to keep visual focus on reference primary items */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowMoreTools(!showMoreTools)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium text-[#82b8c7] hover:text-white transition-colors cursor-pointer"
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
                          ? 'bg-[#0b4c5e] text-white font-semibold'
                          : 'text-white/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4 text-[#82b8c7] shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#82b8c7]" />}
                    </button>
                  );
                })}

                <div className="pt-2 pb-1">
                  <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#82b8c7]/60">
                    Portals
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigatePortal?.('home');
                      onClose();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs text-[#82b8c7] hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>Public Hospital Home</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigatePortal?.('patient');
                      onClose();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs text-[#82b8c7] hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    <UserCircle className="w-3.5 h-3.5" />
                    <span>Patient Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Drawer Footer User Profile - Matching bottom left of screenshot */}
        <div className="p-3.5 bg-[#023545] border-t border-[#0b4c5e]/40 relative">
          {/* Popup profile options */}
          {showProfileMenu && (
            <div className="absolute bottom-16 left-3 right-3 bg-[#032835] border border-[#0b4c5e] rounded-xl p-2 shadow-xl text-xs space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150 z-20">
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenAvatarModal?.();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-white hover:bg-[#0b4c5e] transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-[#82b8c7]" />
                <span>Change Profile Photo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigatePortal?.('home');
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-white hover:bg-[#0b4c5e] transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-[#82b8c7]" />
                <span>Hospital Homepage</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout?.();
                  onClose();
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 cursor-pointer p-1 rounded-xl hover:bg-white/5 transition-colors"
            title="Profile & actions"
          >
            {/* Avatar circle matching screenshot MB initials */}
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-[#0b4c5e] shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#084050] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#0b4c5e]">
                {initials}
              </div>
            )}
            
            {/* Name and role matching exact text in screenshot */}
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-white truncate leading-tight">
                {currentUser.name || 'Marko Bare'}
              </p>
              <p className="text-[12px] text-[#79abb8] truncate leading-tight mt-0.5">
                {currentUser.role === 'admin' 
                  ? 'Administrator · Adm...' 
                  : `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} · Staff`}
              </p>
            </div>

            <ChevronDown className={`w-4 h-4 text-[#79abb8] transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </aside>
    </div>
  );
};
