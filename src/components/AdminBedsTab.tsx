import React, { useState, useEffect } from 'react';
import { 
  Bed, 
  Plus, 
  Search, 
  Filter, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2, 
  Edit3, 
  Wind, 
  HeartPulse, 
  Loader2, 
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { HospitalBed, BedStatus, BedType } from '../types';

interface AdminBedsTabProps {
  onDataChanged?: () => void;
}

export const AdminBedsTab: React.FC<AdminBedsTabProps> = ({ onDataChanged }) => {
  const [beds, setBeds] = useState<HospitalBed[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Filters
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingBed, setEditingBed] = useState<HospitalBed | null>(null);
  const [bedNumber, setBedNumber] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [ward, setWard] = useState('General Ward (Male)');
  const [bedType, setBedType] = useState<BedType>('General');
  const [dailyRateKES, setDailyRateKES] = useState(2500);
  const [hasOxygen, setHasOxygen] = useState(true);
  const [hasVentilator, setHasVentilator] = useState(false);
  const [status, setStatus] = useState<BedStatus>('Available');
  const [assignedPatientName, setAssignedPatientName] = useState('');
  const [assignedPatientId, setAssignedPatientId] = useState('');

  const fetchBeds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/beds');
      const data = await res.json();
      if (Array.isArray(data)) {
        setBeds(data);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load beds telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeds();
  }, []);

  const openAddModal = () => {
    setEditingBed(null);
    const count = beds.length + 1;
    setBedNumber(`BED-${String(count).padStart(3, '0')}`);
    setRoomNumber(`RM-${Math.floor(100 + Math.random() * 200)}`);
    setWard('General Ward (Male)');
    setBedType('General');
    setDailyRateKES(2500);
    setHasOxygen(true);
    setHasVentilator(false);
    setStatus('Available');
    setAssignedPatientName('');
    setAssignedPatientId('');
    setShowModal(true);
  };

  const openEditModal = (bed: HospitalBed) => {
    setEditingBed(bed);
    setBedNumber(bed.bedNumber);
    setRoomNumber(bed.roomNumber || '');
    setWard(bed.ward);
    setBedType(bed.bedType);
    setDailyRateKES(bed.dailyRateKES);
    setHasOxygen(bed.hasOxygen);
    setHasVentilator(bed.hasVentilator);
    setStatus(bed.status);
    setAssignedPatientName(bed.assignedPatientName || '');
    setAssignedPatientId(bed.assignedPatientId || '');
    setShowModal(true);
  };

  const handleSaveBed = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = {
      bedNumber,
      roomNumber,
      ward,
      bedType,
      dailyRateKES: Number(dailyRateKES) || 2500,
      hasOxygen,
      hasVentilator,
      status,
      assignedPatientName: status === 'Occupied' ? assignedPatientName : undefined,
      assignedPatientId: status === 'Occupied' ? assignedPatientId : undefined
    };

    try {
      if (editingBed) {
        const res = await fetch(`/api/beds/${editingBed.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update bed');
        setSuccessToast(`Bed ${bedNumber} updated successfully.`);
      } else {
        const res = await fetch('/api/beds', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create bed');
        setSuccessToast(`Bed ${bedNumber} created in ${ward}.`);
      }

      setShowModal(false);
      fetchBeds();
      if (onDataChanged) onDataChanged();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving bed details');
    }
  };

  const handleDeleteBed = async (id: string, number: string) => {
    if (!window.confirm(`Are you sure you want to remove bed ${number} from the hospital registry?`)) return;
    try {
      const res = await fetch(`/api/beds/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete bed');
      setSuccessToast(`Bed ${number} deleted.`);
      fetchBeds();
      if (onDataChanged) onDataChanged();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error removing bed');
    }
  };

  const handleQuickStatusChange = async (bed: HospitalBed, newStatus: BedStatus) => {
    try {
      const res = await fetch(`/api/beds/${bed.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          assignedPatientName: newStatus === 'Available' ? null : bed.assignedPatientName
        })
      });
      if (!res.ok) throw new Error('Failed to change status');
      fetchBeds();
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setErrorMsg('Failed to update bed status');
    }
  };

  // Filtered beds
  const filteredBeds = beds.filter(b => {
    const matchesWard = selectedWard === 'All' || b.ward === selectedWard;
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
    const matchesSearch = 
      b.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ward.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.assignedPatientName && b.assignedPatientName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesWard && matchesStatus && matchesSearch;
  });

  // Capacity stats
  const totalBedsCount = beds.length;
  const availableCount = beds.filter(b => b.status === 'Available').length;
  const occupiedCount = beds.filter(b => b.status === 'Occupied').length;
  const icuAvailable = beds.filter(b => b.bedType === 'ICU' && b.status === 'Available').length;
  const icuTotal = beds.filter(b => b.bedType === 'ICU').length;
  const occupancyRate = totalBedsCount > 0 ? Math.round((occupiedCount / totalBedsCount) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-md animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast('')} className="text-emerald-700 hover:text-emerald-950 font-bold">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Total Bed Fleet</span>
            <Bed className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalBedsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Across 8 specialized wards</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Available for Admission</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{availableCount}</div>
          <p className="text-[11px] text-emerald-600/90 font-medium mt-1">{occupancyRate}% Overall Occupancy</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Currently Occupied</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">{occupiedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Active inpatient care</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Critical ICU Vacancy</span>
            <HeartPulse className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700">{icuAvailable} / {icuTotal}</div>
          <p className="text-[11px] text-slate-500 mt-1">Ventilator & piped O₂ enabled</p>
        </div>
      </div>

      {/* Controls & Actions */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hospital Inpatient Bed & Ward Management</h3>
            <p className="text-xs text-slate-500">Configure bed capacities, oxygen/ventilator telemetry, admission status, and daily billing tariffs.</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchBeds}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-xs font-semibold shadow-xs flex items-center space-x-1 cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Hospital Bed</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by bed #, ward, or patient..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/80 border border-slate-300/80 rounded-2xl focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-2xl font-medium focus:bg-white"
            >
              <option value="All">All Hospital Wards</option>
              <option value="Intensive Care Unit (ICU)">ICU (Intensive Care Unit)</option>
              <option value="High Dependency Unit (HDU)">HDU (High Dependency)</option>
              <option value="General Ward (Male)">General Ward (Male)</option>
              <option value="General Ward (Female)">General Ward (Female)</option>
              <option value="Pediatric Ward">Pediatric Ward</option>
              <option value="Maternity & Neonatal Ward">Maternity & Neonatal Ward</option>
              <option value="Private Executive Suite">Private Executive Suite</option>
              <option value="Accident & Emergency (A&E)">Accident & Emergency (A&E)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-2xl font-medium focus:bg-white"
            >
              <option value="All">All Bed Statuses</option>
              <option value="Available">Available for Admission</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Under Maintenance / Sanitizing</option>
            </select>
          </div>
        </div>

        {/* Beds Table */}
        <div className="border border-white/80 rounded-2xl overflow-hidden text-xs bg-white/50 backdrop-blur-md shadow-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Bed # / Room</th>
                <th className="py-3 px-3.5">Ward & Category</th>
                <th className="py-3 px-3.5">Life Support Specs</th>
                <th className="py-3 px-3.5">Daily Rate (KES)</th>
                <th className="py-3 px-3.5">Current Status</th>
                <th className="py-3 px-3.5">Assigned Patient</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {filteredBeds.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No hospital beds match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredBeds.map((bed) => {
                  const isAvail = bed.status === 'Available';
                  const isOcc = bed.status === 'Occupied';
                  const isMaint = bed.status === 'Maintenance';

                  return (
                    <tr key={bed.id} className="hover:bg-white/80 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-bold font-mono text-slate-900 flex items-center space-x-1.5">
                          <Bed className="w-3.5 h-3.5 text-slate-500" />
                          <span>{bed.bedNumber}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{bed.roomNumber || 'Ward Bay'}</div>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-900">{bed.ward}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {bed.bedType}
                        </span>
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          {bed.hasOxygen && (
                            <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-semibold flex items-center space-x-1" title="Piped Medical Oxygen">
                              <Wind className="w-3 h-3" />
                              <span>O₂</span>
                            </span>
                          )}
                          {bed.hasVentilator && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold flex items-center space-x-1" title="Mechanical Ventilator">
                              <HeartPulse className="w-3 h-3" />
                              <span>Vent</span>
                            </span>
                          )}
                          {!bed.hasOxygen && !bed.hasVentilator && (
                            <span className="text-slate-400 text-[11px]">Standard</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3.5 font-mono font-bold text-emerald-700">
                        KES {bed.dailyRateKES.toLocaleString()}
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="flex items-center space-x-1.5">
                          <select
                            value={bed.status}
                            onChange={(e) => handleQuickStatusChange(bed, e.target.value as BedStatus)}
                            className={`py-1 px-2.5 rounded-xl text-[11px] font-bold border cursor-pointer focus:outline-none ${
                              isAvail 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : isOcc 
                                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            <option value="Available">Available</option>
                            <option value="Occupied">Occupied</option>
                            <option value="Reserved">Reserved</option>
                            <option value="Maintenance">Maintenance</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-slate-700">
                        {bed.assignedPatientName ? (
                          <div className="font-semibold text-slate-900 flex items-center space-x-1">
                            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                            <span>{bed.assignedPatientName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None (Vacant)</span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(bed)}
                          className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shadow-xs cursor-pointer inline-block"
                          title="Edit Bed Configurations"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBed(bed.id, bed.bedNumber)}
                          className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200 shadow-xs cursor-pointer inline-block"
                          title="Remove Bed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: ADD / EDIT HOSPITAL BED ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bed className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base">
                  {editingBed ? `Edit Bed ${editingBed.bedNumber}` : 'Add New Hospital Bed'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveBed} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bed Number *</label>
                  <input
                    type="text"
                    required
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    placeholder="e.g. BED-101"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room / Bay ID</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. RM-302"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ward Assignment *</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="Intensive Care Unit (ICU)">ICU (Intensive Care)</option>
                    <option value="High Dependency Unit (HDU)">HDU (High Dependency)</option>
                    <option value="General Ward (Male)">General Ward (Male)</option>
                    <option value="General Ward (Female)">General Ward (Female)</option>
                    <option value="Pediatric Ward">Pediatric Ward</option>
                    <option value="Maternity & Neonatal Ward">Maternity & Neonatal Ward</option>
                    <option value="Private Executive Suite">Private Executive Suite</option>
                    <option value="Accident & Emergency (A&E)">Accident & Emergency (A&E)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bed Classification *</label>
                  <select
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value as BedType)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="General">General Inpatient</option>
                    <option value="ICU">ICU Critical Care</option>
                    <option value="HDU">HDU High Dependency</option>
                    <option value="Maternity">Maternity & Delivery</option>
                    <option value="Pediatric">Pediatric</option>
                    <option value="Isolation">Infectious Isolation</option>
                    <option value="Emergency">A&E Emergency Resus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Daily Inpatient Rate (KES) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={dailyRateKES}
                    onChange={(e) => setDailyRateKES(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BedStatus)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Available">Available for Admission</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Toggles for Oxygen and Ventilator */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasOxygen}
                    onChange={(e) => setHasOxygen(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Piped Medical O₂</span>
                    <span className="text-[10px] text-slate-500">Continuous oxygen port</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVentilator}
                    onChange={(e) => setHasVentilator(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded-md"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Mechanical Ventilator</span>
                    <span className="text-[10px] text-slate-500">Advanced life support</span>
                  </div>
                </label>
              </div>

              {/* Assigned Patient if occupied */}
              {status === 'Occupied' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Patient Name</label>
                  <input
                    type="text"
                    value={assignedPatientName}
                    onChange={(e) => setAssignedPatientName(e.target.value)}
                    placeholder="e.g. John Kamau"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingBed ? 'Save Bed Changes' : 'Provision Bed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
