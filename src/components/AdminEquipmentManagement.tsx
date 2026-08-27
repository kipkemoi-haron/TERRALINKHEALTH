import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Wrench, 
  Trash2, 
  Archive, 
  RotateCcw, 
  Edit, 
  X, 
  Building2,
  Sparkles
} from 'lucide-react';
import { Department } from '../types';

export interface EquipmentItem {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  model: string;
  serialNumber: string;
  status: 'Operational' | 'In-Use' | 'Maintenance' | 'Offline';
  location: string;
  lastMaintenanceDate: string;
  nextServiceDue: string;
  isArchived?: boolean;
}

interface AdminEquipmentManagementProps {
  departments: Department[];
  onRefresh?: () => void;
}

export const AdminEquipmentManagement: React.FC<AdminEquipmentManagementProps> = ({
  departments,
  onRefresh
}) => {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDeptId, setFormDeptId] = useState(departments[0]?.id || 'dept-cardio');
  const [formModel, setFormModel] = useState('');
  const [formSerial, setFormSerial] = useState('');
  const [formStatus, setFormStatus] = useState<'Operational' | 'In-Use' | 'Maintenance' | 'Offline'>('Operational');
  const [formLocation, setFormLocation] = useState('Diagnostic Wing Bay 1');
  const [formNextService, setFormNextService] = useState('2026-11-15');

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/equipment?includeArchived=true`);
      if (res.ok) {
        const data = await res.json();
        setEquipmentList(data);
      }
    } catch (err) {
      console.error('Fetch equipment error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormDeptId(departments[0]?.id || 'dept-cardio');
    setFormModel('');
    setFormSerial(`SN-${Math.floor(100000 + Math.random() * 900000)}`);
    setFormStatus('Operational');
    setFormLocation('Main Hospital Wing');
    setFormNextService('2026-12-01');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: EquipmentItem) => {
    setEditingId(item.id);
    setFormName(item.name);
    setFormDeptId(item.departmentId);
    setFormModel(item.model);
    setFormSerial(item.serialNumber);
    setFormStatus(item.status);
    setFormLocation(item.location);
    setFormNextService(item.nextServiceDue);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const matchedDept = departments.find(d => d.id === formDeptId);
    const payload = {
      name: formName,
      departmentId: formDeptId,
      departmentName: matchedDept?.name || 'General Clinic',
      model: formModel || 'Standard Grade',
      serialNumber: formSerial,
      status: formStatus,
      location: formLocation,
      lastMaintenanceDate: new Date().toISOString().slice(0, 10),
      nextServiceDue: formNextService
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/equipment/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setEquipmentList(prev => prev.map(i => i.id === editingId ? updated : i));
          setToastMsg('Equipment record updated successfully.');
        }
      } else {
        const res = await fetch('/api/equipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setEquipmentList(prev => [created, ...prev]);
          setToastMsg('New hospital equipment registered.');
        }
      }
      setIsModalOpen(false);
      setTimeout(() => setToastMsg(''), 4000);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Save equipment error:', err);
    }
  };

  const handleToggleArchive = async (item: EquipmentItem) => {
    const newArchived = !item.isArchived;
    try {
      const res = await fetch(`/api/equipment/${item.id}`, {
        method: newArchived ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: newArchived ? undefined : JSON.stringify({ isArchived: false })
      });
      if (res.ok) {
        setEquipmentList(prev => prev.map(i => i.id === item.id ? { ...i, isArchived: newArchived } : i));
        setToastMsg(newArchived ? 'Equipment record archived (Soft Deleted).' : 'Equipment record restored to active fleet.');
        setTimeout(() => setToastMsg(''), 4000);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Archive equipment error:', err);
    }
  };

  const filteredItems = equipmentList.filter(item => {
    if (!showArchived && item.isArchived) return false;
    if (showArchived && !item.isArchived) return false;

    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between text-xs font-bold animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg('')} className="p-1 hover:bg-white/20 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Stats & Actions */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-6 border border-white shadow-xl shadow-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center font-bold text-xl shadow-inner">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Hospital Medical Equipment & Device Fleet</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {equipmentList.filter(e => !e.isArchived).length} Active Assets
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Synchronize machine availability with clinical bookings to prevent booking dead-ends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold border transition-all cursor-pointer flex items-center space-x-1.5 ${
              showArchived 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Showing Archived Records' : 'View Archived (Soft Deleted)'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md shadow-teal-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Equipment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search equipment, serial, department, room..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white/80 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs font-semibold">
          {['All', 'Operational', 'In-Use', 'Maintenance', 'Offline'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-white/70 hover:bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Equipment & Model</th>
                <th className="py-3 px-4">Department & Suite</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Live Status</th>
                <th className="py-3 px-4">Service Window</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    {loading ? 'Loading equipment telemetry...' : 'No equipment records found matching the criteria.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const statusStyles = {
                    Operational: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    'In-Use': 'bg-sky-50 text-sky-800 border-sky-200',
                    Maintenance: 'bg-amber-50 text-amber-800 border-amber-200',
                    Offline: 'bg-rose-50 text-rose-800 border-rose-200'
                  };

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/60 transition-colors ${
                        item.isArchived ? 'opacity-60 bg-slate-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <span>{item.name}</span>
                          {item.isArchived && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-200 text-slate-700">Archived</span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-normal block">{item.model}</span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="font-semibold">{item.departmentName}</div>
                        <div className="text-[10px] text-slate-400">{item.location}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 font-semibold">
                        {item.serialNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusStyles[item.status]}`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        <div>Next Due: <strong>{item.nextServiceDue}</strong></div>
                        <div className="text-[10px] text-slate-400">Last Serviced: {item.lastMaintenanceDate}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Edit Equipment"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleArchive(item)}
                            className={`p-1.5 rounded-xl cursor-pointer ${
                              item.isArchived 
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800' 
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                            }`}
                            title={item.isArchived ? 'Restore Record' : 'Archive (Soft Delete)'}
                          >
                            {item.isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Equipment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-teal-400" />
                <h4 className="text-sm font-bold">
                  {editingId ? 'Edit Medical Equipment Record' : 'Register New Medical Equipment'}
                </h4>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Equipment Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Siemens Artis Q Cath Lab & Angiography System"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Department *</label>
                  <select
                    value={formDeptId}
                    onChange={(e) => setFormDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white font-medium"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Operational Status *</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white font-medium"
                  >
                    <option value="Operational">Operational (Ready for bookings)</option>
                    <option value="In-Use">In-Use (Procedure Ongoing)</option>
                    <option value="Maintenance">Maintenance / Calibration</option>
                    <option value="Offline">Offline / Decommissioned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Model / Specification</label>
                  <input
                    type="text"
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="e.g. Artis Q Biplane 2026"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                    placeholder="e.g. SN-883192"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Physical Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Cath Lab Suite 204"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Next Service Due Date</label>
                  <input
                    type="date"
                    value={formNextService}
                    onChange={(e) => setFormNextService(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Save Equipment Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
