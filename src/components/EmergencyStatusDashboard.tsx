import React, { useState, useEffect } from 'react';
import {
  Siren,
  PhoneCall,
  Activity,
  Bed,
  HeartPulse,
  Wind,
  Radio,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Navigation,
  Send,
  Loader2,
  Ambulance,
  Plane,
  X,
  Hospital,
  ChevronRight
} from 'lucide-react';
import { HospitalBed, AmbulanceUnit, EmergencyStatusOverview, BedType, BedStatus } from '../types';

interface EmergencyStatusDashboardProps {
  onBookAppointment?: () => void;
  onOpenCustomerCare?: () => void;
}

export const EmergencyStatusDashboard: React.FC<EmergencyStatusDashboardProps> = ({
  onBookAppointment,
  onOpenCustomerCare
}) => {
  const [overview, setOverview] = useState<EmergencyStatusOverview | null>(null);
  const [beds, setBeds] = useState<HospitalBed[]>([]);
  const [ambulances, setAmbulances] = useState<AmbulanceUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [bedTypeFilter, setBedTypeFilter] = useState<'ALL' | BedType>('ALL');
  const [bedStatusFilter, setBedStatusFilter] = useState<'ALL' | BedStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Emergency dispatch modal state
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState<string>('');
  const [dispatchLocation, setDispatchLocation] = useState('');
  const [dispatchEmergencyNature, setDispatchEmergencyNature] = useState('');
  const [dispatchPatientName, setDispatchPatientName] = useState('');
  const [dispatchCallerPhone, setDispatchCallerPhone] = useState('');
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState('');

  const fetchEmergencyData = async () => {
    try {
      setRefreshing(true);
      const [overviewRes, bedsRes, ambRes] = await Promise.all([
        fetch('/api/emergency/status'),
        fetch('/api/beds'),
        fetch('/api/ambulances')
      ]);

      if (overviewRes.ok) {
        const ovData = await overviewRes.json();
        setOverview(ovData);
      }
      if (bedsRes.ok) {
        const bedsData = await bedsRes.json();
        setBeds(bedsData);
      }
      if (ambRes.ok) {
        const ambData = await ambRes.json();
        setAmbulances(ambData);
      }
    } catch (err) {
      console.error('Error fetching emergency status telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEmergencyData();
    // Auto-refresh telemetry every 30 seconds
    const interval = setInterval(fetchEmergencyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleEmergencyDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDispatchLoading(true);
    setDispatchSuccessMsg('');

    try {
      const res = await fetch('/api/ambulances/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ambulanceId: selectedAmbulanceId || undefined,
          location: dispatchLocation,
          emergencyNature: dispatchEmergencyNature,
          patientName: dispatchPatientName,
          callerPhone: dispatchCallerPhone
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch ambulance');

      setDispatchSuccessMsg(data.message || 'Ambulance successfully dispatched!');
      fetchEmergencyData();
      setTimeout(() => {
        setIsDispatchModalOpen(false);
        setDispatchLocation('');
        setDispatchEmergencyNature('');
        setDispatchPatientName('');
        setDispatchCallerPhone('');
        setDispatchSuccessMsg('');
      }, 3500);
    } catch (err: any) {
      alert(err.message || 'Dispatch error occurred. Please call 0713544101 immediately.');
    } finally {
      setDispatchLoading(false);
    }
  };

  const filteredBeds = beds.filter(b => {
    if (bedTypeFilter !== 'ALL' && b.bedType !== bedTypeFilter) return false;
    if (bedStatusFilter !== 'ALL' && b.status !== bedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        b.bedNumber.toLowerCase().includes(q) ||
        b.ward.toLowerCase().includes(q) ||
        b.notes?.toLowerCase().includes(q) ||
        b.bedType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const availableBedsCount = beds.filter(b => b.status === 'Available').length;
  const occupiedBedsCount = beds.filter(b => b.status === 'Occupied').length;
  const availableAmbulancesCount = ambulances.filter(a => a.status === 'Available & Ready').length;

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-800 shadow-2xl space-y-8">
      
      {/* 1. Header Banner & Live Status Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold font-mono tracking-wide">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-1" />
              LIVE EMERGENCY TELEMETRY
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{overview?.traumaLevel || 'Level 5 Tertiary Center'}</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Emergency Status, Live Bed Capacity & Ambulance Availability
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Real-time public dashboard for hospital bed occupancy, ICU ventilator availability, and paramedic ambulance response teams across Nairobi County.
          </p>
        </div>

        {/* Action Controls & Emergency Hotline CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={fetchEmergencyData}
            disabled={refreshing}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>

          <a
            href="tel:0713544101"
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>Call 24/7 Hotline: 0713544101</span>
          </a>

          <button
            onClick={() => setIsDispatchModalOpen(true)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-teal-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            <Siren className="w-4 h-4 text-amber-300" />
            <span>Request Ambulance Dispatch</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Available Beds */}
        <div className="bg-slate-950/70 border border-emerald-900/50 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Available Beds</span>
            <Bed className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {availableBedsCount}
            <span className="text-xs text-slate-500 font-normal ml-1">/ {beds.length} Total</span>
          </div>
          <div className="text-[11px] text-emerald-300/80 font-medium">Ready for immediate intake</div>
        </div>

        {/* ICU Capacity */}
        <div className="bg-slate-950/70 border border-teal-900/50 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ICU Beds (Ventilators)</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-300">
            {beds.filter(b => b.bedType === 'ICU' && b.status === 'Available').length}
            <span className="text-xs text-slate-500 font-normal ml-1">
              / {beds.filter(b => b.bedType === 'ICU').length} ICU
            </span>
          </div>
          <div className="text-[11px] text-teal-400/80 font-medium">Equipped with Dräger vents</div>
        </div>

        {/* HDU Capacity */}
        <div className="bg-slate-950/70 border border-indigo-900/50 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>HDU Telemetry Beds</span>
            <HeartPulse className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-300">
            {beds.filter(b => b.bedType === 'HDU' && b.status === 'Available').length}
            <span className="text-xs text-slate-500 font-normal ml-1">
              / {beds.filter(b => b.bedType === 'HDU').length} HDU
            </span>
          </div>
          <div className="text-[11px] text-indigo-300/80 font-medium">High-flow oxygen active</div>
        </div>

        {/* Maternity Delivery Suites */}
        <div className="bg-slate-950/70 border border-pink-900/50 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Maternity & NICU</span>
            <ShieldCheck className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-pink-300">
            {beds.filter(b => (b.bedType === 'Maternity' || b.bedType === 'Pediatric') && b.status === 'Available').length}
            <span className="text-xs text-slate-500 font-normal ml-1">
              / {beds.filter(b => b.bedType === 'Maternity' || b.bedType === 'Pediatric').length}
            </span>
          </div>
          <div className="text-[11px] text-pink-300/80 font-medium">Incubators on standby</div>
        </div>

        {/* Ambulances Available */}
        <div className="bg-slate-950/70 border border-amber-900/50 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Ambulance Fleet</span>
            <Ambulance className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-300">
            {availableAmbulancesCount}
            <span className="text-xs text-slate-500 font-normal ml-1">/ {ambulances.length} Active</span>
          </div>
          <div className="text-[11px] text-amber-300/80 font-medium">ALS & Air Med Helicopters</div>
        </div>

        {/* A&E Triage Wait Time */}
        <div className="bg-slate-950/70 border border-rose-900/50 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>A&E Trauma Triage</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-300">
            {overview?.aeAvgWaitMinutes || 8}
            <span className="text-xs text-slate-500 font-normal ml-1">mins</span>
          </div>
          <div className="text-[11px] text-rose-300/80 font-medium">Fast-track triage active</div>
        </div>

      </div>

      {/* 3. Ambulance Fleet Live Tracker */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Ambulance className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                Live Paramedic Ambulance Fleet & Response Units
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Advanced Life Support (ALS), Neonatal Intensive Transport, and Air Ambulance Helicopter on 24/7 rapid deployment.
            </p>
          </div>

          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 self-start sm:self-auto">
            ⚡ Dispatched under 8 minutes across Nairobi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ambulances.map((unit) => {
            const isAvailable = unit.status === 'Available & Ready';
            const isDispatched = unit.status === 'Dispatched / En Route' || unit.status === 'On-Scene' || unit.status === 'Patient Onboard';
            const isHeli = unit.callSign.includes('HELI') || unit.vehicleType.includes('Helicopter');

            return (
              <div
                key={unit.id}
                className={`bg-slate-950/80 rounded-2xl border p-4.5 space-y-3.5 transition-all ${
                  isAvailable 
                    ? 'border-emerald-700/60 hover:border-emerald-500' 
                    : isDispatched 
                    ? 'border-amber-600/60 hover:border-amber-500' 
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      {isHeli ? (
                        <Plane className="w-4 h-4 text-teal-400" />
                      ) : (
                        <Ambulance className="w-4 h-4 text-amber-400" />
                      )}
                      <h4 className="font-bold text-sm text-white font-mono">{unit.callSign}</h4>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded">
                        {unit.registrationNumber}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-300">{unit.vehicleType}</div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      isAvailable
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : isDispatched
                        ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {unit.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Base Station:</span>
                    <span className="text-slate-200 font-medium text-right">{unit.baseStation}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Crew Commander:</span>
                    <span className="text-slate-200 font-medium">{unit.crewLead}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Direct Crew Comms:</span>
                    <a href={`tel:${unit.crewPhone}`} className="text-teal-400 font-mono font-bold hover:underline">
                      {unit.crewPhone}
                    </a>
                  </div>
                  {unit.currentMission && (
                    <div className="pt-1.5 border-t border-slate-800 text-[11px] text-amber-200/90 font-medium">
                      ⚠️ Mission: {unit.currentMission}
                    </div>
                  )}
                </div>

                {/* Onboard Life-Support Equipment */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400">Life Support Capabilities:</div>
                  <div className="flex flex-wrap gap-1">
                    {unit.equipment.map((eq, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-900 border border-slate-700/80 text-slate-300 px-2 py-0.5 rounded-md"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {unit.etaMinutes ? `Est. Nairobi ETA: ~${unit.etaMinutes} mins` : 'Immediate Standby'}
                  </span>
                  
                  {isAvailable && (
                    <button
                      onClick={() => {
                        setSelectedAmbulanceId(unit.id);
                        setIsDispatchModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Dispatch Unit</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Real-Time Hospital Bed Capacity Breakdown */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Bed className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                Live Hospital Bed Capacity & Ward Census
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Live ward status indicating medical oxygen pipelines, continuous telemetry, and Dräger mechanical ventilators.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search bed, ward, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-teal-500 w-48 sm:w-60"
              />
            </div>

            {/* Bed Type Selector */}
            <select
              value={bedTypeFilter}
              onChange={(e) => setBedTypeFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-medium focus:outline-hidden focus:border-teal-500"
            >
              <option value="ALL">All Ward Types</option>
              <option value="ICU">Intensive Care Unit (ICU)</option>
              <option value="HDU">High Dependency Unit (HDU)</option>
              <option value="Maternity">Maternity Delivery</option>
              <option value="Pediatric">Pediatric & NICU</option>
              <option value="General">General Medical/Surgical</option>
              <option value="Isolation">Isolation (Negative Pressure)</option>
              <option value="Emergency">A&E Trauma Bay</option>
            </select>

            {/* Status Filter */}
            <select
              value={bedStatusFilter}
              onChange={(e) => setBedStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-medium focus:outline-hidden focus:border-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available Only</option>
              <option value="Occupied">Occupied Only</option>
            </select>
          </div>
        </div>

        {/* Bed Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredBeds.map((bed) => {
            const isAvail = bed.status === 'Available';
            const isOccupied = bed.status === 'Occupied';

            return (
              <div
                key={bed.id}
                className={`bg-slate-950/70 rounded-2xl border p-4 space-y-2.5 transition-all ${
                  isAvail 
                    ? 'border-emerald-800/60 hover:border-emerald-500' 
                    : isOccupied 
                    ? 'border-slate-800/90 opacity-90' 
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 font-mono font-bold text-xs text-teal-300 border border-slate-700">
                      {bed.bedNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {bed.bedType}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isAvail
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : isOccupied
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-medium text-white">{bed.ward}</div>
                  <div className="text-[11px] text-slate-400">
                    Daily Tariff: <span className="font-mono font-bold text-emerald-400">KES {bed.dailyRateKES.toLocaleString()}</span> (SHA Covered)
                  </div>
                </div>

                {/* Features & Equipment Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  {bed.hasOxygen && (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-teal-950/80 text-teal-300 border border-teal-800 rounded">
                      <Wind className="w-3 h-3 text-teal-400" />
                      <span>Oxygen</span>
                    </span>
                  )}
                  {bed.hasVentilator && (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-indigo-950/80 text-indigo-300 border border-indigo-800 rounded">
                      <Activity className="w-3 h-3 text-indigo-400" />
                      <span>Ventilator</span>
                    </span>
                  )}
                  {bed.hasTelemetry && (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 bg-rose-950/80 text-rose-300 border border-rose-800 rounded">
                      <HeartPulse className="w-3 h-3 text-rose-400" />
                      <span>Telemetry</span>
                    </span>
                  )}
                </div>

                {bed.notes && (
                  <p className="text-[10px] text-slate-400 italic line-clamp-2 bg-slate-900/40 p-1.5 rounded-lg">
                    {bed.notes}
                  </p>
                )}

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Synced: {bed.lastUpdated || 'Live'}</span>
                  {isAvail ? (
                    <span className="text-emerald-400 font-bold">Ready for Inpatient</span>
                  ) : (
                    <span className="text-amber-400">Currently in Use</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredBeds.length === 0 && (
          <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No hospital beds match the specified filter criteria. Try selecting "All Ward Types" or clear the search query.
          </div>
        )}
      </div>

      {/* 5. Inpatient & Emergency Referral Information Footer */}
      <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/30">
            <Hospital className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="font-bold text-white">Emergency Transfer & Direct Doctor-to-Doctor Referral</div>
            <p className="text-slate-400 max-w-xl">
              Referring a patient from another health facility or satellite clinic? Our A&E Resuscitation Trauma team accepts direct referrals 24/7 with immediate bed allocation and SHA pre-authorization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenCustomerCare && (
            <button
              onClick={onOpenCustomerCare}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              Chat With Care Desk
            </button>
          )}
          {onBookAppointment && (
            <button
              onClick={onBookAppointment}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Book Inpatient / Clinic Visit
            </button>
          )}
        </div>
      </div>

      {/* 6. Emergency Dispatch Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700 overflow-hidden">
            
            <div className="bg-rose-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center space-x-2.5">
                <Siren className="w-6 h-6 animate-pulse" />
                <div>
                  <h3 className="font-bold text-base">Emergency Ambulance Dispatch</h3>
                  <p className="text-xs text-rose-100">TERRALINKHEALTH Emergency Operation Center</p>
                </div>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {dispatchSuccessMsg ? (
                <div className="bg-emerald-950/80 border border-emerald-700 p-4 rounded-2xl text-emerald-200 space-y-2 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-bold text-sm">{dispatchSuccessMsg}</p>
                  <p className="text-xs text-emerald-300">
                    The paramedic crew has received your telemetry alert and is responding immediately. Please keep your phone line open.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEmergencyDispatchSubmit} className="space-y-3.5">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                    🚨 <strong>For life-threatening emergencies</strong>: You can also call directly on <strong>0713544101</strong> for immediate voice dispatch coordination.
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Pick Preferred Response Unit (Optional)</label>
                    <select
                      value={selectedAmbulanceId}
                      onChange={(e) => setSelectedAmbulanceId(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium"
                    >
                      <option value="">Next Fastest Available Unit (Recommended)</option>
                      {ambulances.filter(a => a.status === 'Available & Ready').map(a => (
                        <option key={a.id} value={a.id}>
                          {a.callSign} - {a.vehicleType} ({a.baseStation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Incident Location / Landmark (Nairobi Area) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Parklands 3rd Avenue, Near Diamond Plaza / Home Address"
                      value={dispatchLocation}
                      onChange={(e) => setDispatchLocation(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nature of Medical Emergency / Symptoms *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Severe chest pain, breathing difficulty, traffic trauma, maternity labour"
                      value={dispatchEmergencyNature}
                      onChange={(e) => setDispatchEmergencyNature(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Patient Name</label>
                      <input
                        type="text"
                        placeholder="Patient Full Name"
                        value={dispatchPatientName}
                        onChange={(e) => setDispatchPatientName(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Contact Phone (Caller) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0712345678"
                        value={dispatchCallerPhone}
                        onChange={(e) => setDispatchCallerPhone(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={dispatchLoading}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-lg shadow-rose-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 text-sm"
                    >
                      {dispatchLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Transmitting GPS Telemetry to Fleet...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Confirm Emergency Ambulance Dispatch</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
