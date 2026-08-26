import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Check, 
  X, 
  RefreshCw,
  Tag,
  Building2
} from 'lucide-react';
import { HospitalServiceItem } from '../types';

interface AdminServicesTabProps {
  onDataChanged?: () => void;
}

export const AdminServicesTab: React.FC<AdminServicesTabProps> = ({ onDataChanged }) => {
  const [services, setServices] = useState<HospitalServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [shaFilter, setShaFilter] = useState<'All' | 'SHA Covered' | 'Private/Cash Only'>('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<HospitalServiceItem | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HospitalServiceItem['category']>('Consultation');
  const [description, setDescription] = useState('');
  const [standardFeeKES, setStandardFeeKES] = useState(1500);
  const [shaCovered, setShaCovered] = useState(true);
  const [privateInsuranceEligible, setPrivateInsuranceEligible] = useState(true);
  const [departmentName, setDepartmentName] = useState('Outpatient Department (OPD)');
  const [isActive, setIsActive] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      if (Array.isArray(data)) {
        setServices(data);
      }
    } catch (err: any) {
      setErrorMsg('Failed to load services catalogue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openAddModal = () => {
    setEditingService(null);
    const count = services.length + 1;
    setCode(`SRV-${String(count).padStart(3, '0')}`);
    setName('');
    setCategory('Consultation');
    setDescription('');
    setStandardFeeKES(1500);
    setShaCovered(true);
    setPrivateInsuranceEligible(true);
    setDepartmentName('Outpatient Department (OPD)');
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (srv: HospitalServiceItem) => {
    setEditingService(srv);
    setCode(srv.code);
    setName(srv.name);
    setCategory(srv.category);
    setDescription(srv.description);
    setStandardFeeKES(srv.standardFeeKES);
    setShaCovered(srv.shaCovered);
    setPrivateInsuranceEligible(srv.privateInsuranceEligible);
    setDepartmentName(srv.departmentName);
    setIsActive(srv.isActive);
    setShowModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = {
      code,
      name,
      category,
      description,
      standardFeeKES: Number(standardFeeKES) || 0,
      shaCovered,
      privateInsuranceEligible,
      departmentName,
      isActive
    };

    try {
      if (editingService) {
        const res = await fetch(`/api/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update service');
        setSuccessToast(`Service "${name}" updated successfully.`);
      } else {
        const res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add service');
        setSuccessToast(`Service "${name}" added to hospital tariff catalogue.`);
      }

      setShowModal(false);
      fetchServices();
      if (onDataChanged) onDataChanged();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving service');
    }
  };

  const handleDeleteService = async (id: string, srvName: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove "${srvName}" from the billing catalog?`)) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete service');
      setSuccessToast(`Service "${srvName}" removed.`);
      fetchServices();
      if (onDataChanged) onDataChanged();
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error removing service');
    }
  };

  const handleQuickToggleActive = async (srv: HospitalServiceItem) => {
    try {
      const res = await fetch(`/api/services/${srv.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !srv.isActive })
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      fetchServices();
      if (onDataChanged) onDataChanged();
    } catch (err: any) {
      setErrorMsg('Failed to update service status');
    }
  };

  // Filtered
  const filteredServices = services.filter(srv => {
    const matchesCat = selectedCategory === 'All' || srv.category === selectedCategory;
    const matchesSha = 
      shaFilter === 'All' || 
      (shaFilter === 'SHA Covered' && srv.shaCovered) || 
      (shaFilter === 'Private/Cash Only' && !srv.shaCovered);
    const matchesSearch = 
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSha && matchesSearch;
  });

  const totalServices = services.length;
  const shaCoveredCount = services.filter(s => s.shaCovered).length;
  const activeCount = services.filter(s => s.isActive).length;

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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Total Catalogued Procedures</span>
            <Tag className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalServices} Services</div>
          <p className="text-[11px] text-slate-500 mt-1">{activeCount} active in billing engine</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>SHA / NHIF Covered Tariffs</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{shaCoveredCount} Services</div>
          <p className="text-[11px] text-emerald-600/90 font-medium mt-1">Direct national insurance claim eligible</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Clinical Departments</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-700">8 Units</div>
          <p className="text-[11px] text-slate-500 mt-1">OPD, Inpatient, Lab, Radiology, Theatre</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Hospital Clinical Services & Tariff Catalogue</h3>
            <p className="text-xs text-slate-500">Manage billing rates, procedure codes, SHIF/SHA rebates, and private insurance eligibility.</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchServices}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 text-xs font-semibold shadow-xs flex items-center space-x-1 cursor-pointer"
              title="Refresh catalogue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-teal-600/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Service / Tariff</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, service name, or department..."
              className="w-full pl-9 pr-4 py-2.5 bg-white/80 border border-slate-300/80 rounded-2xl focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-2xl font-medium focus:bg-white"
            >
              <option value="All">All Procedure Categories</option>
              <option value="Consultation">Consultation & Clinical Exam</option>
              <option value="Bed & Inpatient">Bed & Inpatient Stay</option>
              <option value="Laboratory">Laboratory & Diagnostics</option>
              <option value="Radiology & Imaging">Radiology & Imaging</option>
              <option value="Surgical & Theatre">Surgical & Major Theatre</option>
              <option value="Maternity & Delivery">Maternity & Delivery</option>
              <option value="Emergency & Ambulance">Emergency & Critical Dispatch</option>
              <option value="Physiotherapy & Rehab">Physiotherapy & Rehabilitation</option>
            </select>
          </div>

          <div>
            <select
              value={shaFilter}
              onChange={(e) => setShaFilter(e.target.value as any)}
              className="w-full p-2.5 bg-white/80 border border-slate-300/80 rounded-2xl font-medium focus:bg-white"
            >
              <option value="All">All Insurance Coverages</option>
              <option value="SHA Covered">SHA / NHIF Covered Only</option>
              <option value="Private/Cash Only">Private Cash / Private Insurance Only</option>
            </select>
          </div>
        </div>

        {/* Services Table */}
        <div className="border border-white/80 rounded-2xl overflow-hidden text-xs bg-white/50 backdrop-blur-md shadow-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Tariff Code</th>
                <th className="py-3 px-3.5">Service Name & Description</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Department</th>
                <th className="py-3 px-3.5">Standard Rate (KES)</th>
                <th className="py-3 px-3.5">Coverage Eligibility</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No hospital services match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-white/80 transition-colors">
                    <td className="py-3 px-3.5 font-mono font-bold text-teal-800">
                      {srv.code}
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900">{srv.name}</div>
                      <div className="text-[11px] text-slate-500 max-w-xs truncate">{srv.description}</div>
                    </td>

                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {srv.category}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-slate-600 font-medium">
                      {srv.departmentName}
                    </td>

                    <td className="py-3 px-3.5 font-mono font-bold text-emerald-700 text-sm">
                      KES {srv.standardFeeKES.toLocaleString()}
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="flex flex-col gap-1">
                        {srv.shaCovered ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>SHA / NHIF</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-medium text-slate-400">
                            <X className="w-3 h-3" />
                            <span>No SHA</span>
                          </span>
                        )}

                        {srv.privateInsuranceEligible && (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            <Check className="w-3 h-3 text-indigo-600" />
                            <span>Private Ins</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3.5">
                      <button
                        onClick={() => handleQuickToggleActive(srv)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                          srv.isActive ? 'bg-emerald-50 text-emerald-800 hover:bg-rose-50 hover:text-rose-700' : 'bg-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                        title="Click to toggle active status"
                      >
                        {srv.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3 px-3.5 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(srv)}
                        className="p-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 shadow-xs cursor-pointer inline-block"
                        title="Edit Service Tariff"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(srv.id, srv.name)}
                        className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200 shadow-xs cursor-pointer inline-block"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: ADD / EDIT SERVICE ================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base">
                  {editingService ? `Edit Service Tariff: ${editingService.code}` : 'Add New Hospital Service'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveService} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tariff Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="SRV-042"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Service / Procedure Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Echocardiogram (2D Echo)"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Consultation">Consultation & Clinical Exam</option>
                    <option value="Bed & Inpatient">Bed & Inpatient Stay</option>
                    <option value="Laboratory">Laboratory & Diagnostics</option>
                    <option value="Radiology & Imaging">Radiology & Imaging</option>
                    <option value="Surgical & Theatre">Surgical & Major Theatre</option>
                    <option value="Maternity & Delivery">Maternity & Delivery</option>
                    <option value="Emergency & Ambulance">Emergency & Critical Dispatch</option>
                    <option value="Physiotherapy & Rehab">Physiotherapy & Rehab</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Department</label>
                  <input
                    type="text"
                    required
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="e.g. Cardiology Unit"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Clinical Indication</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of clinical scope, consumables included..."
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Standard Fee (KES) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={standardFeeKES}
                    onChange={(e) => setStandardFeeKES(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-emerald-700 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Active in HMIS Billing?</label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="true">Active & Billable</option>
                    <option value="false">Inactive / Suspended</option>
                  </select>
                </div>
              </div>

              {/* Insurance Toggles */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shaCovered}
                    onChange={(e) => setShaCovered(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded-md"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">SHA / NHIF Covered</span>
                    <span className="text-[10px] text-slate-500">Eligible for state rebate</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privateInsuranceEligible}
                    onChange={(e) => setPrivateInsuranceEligible(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded-md"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Private Insurance</span>
                    <span className="text-[10px] text-slate-500">Jubilee, AAR, APA, CIC</span>
                  </div>
                </label>
              </div>

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
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingService ? 'Save Changes' : 'Add Tariff to Catalogue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
