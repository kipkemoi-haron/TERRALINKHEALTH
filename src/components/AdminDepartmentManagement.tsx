import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  CheckCircle2, 
  Archive, 
  RotateCcw, 
  Edit, 
  X, 
  DollarSign, 
  Clock, 
  MapPin, 
  User,
  Trash2
} from 'lucide-react';
import { Department, Doctor } from '../types';

interface AdminDepartmentManagementProps {
  departments: Department[];
  doctors: Doctor[];
  onAddDepartment: (dept: Partial<Department>) => Promise<void>;
  onUpdateDepartmentFee: (deptId: string, fee: number) => Promise<void>;
  onRefresh?: () => void;
}

export const AdminDepartmentManagement: React.FC<AdminDepartmentManagementProps> = ({
  departments,
  doctors,
  onAddDepartment,
  onUpdateDepartmentFee,
  onRefresh
}) => {
  const [deptList, setDeptList] = useState<Department[]>(departments);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCategory, setFormCategory] = useState<'Clinical' | 'Diagnostic' | 'Surgical' | 'Therapeutic' | 'Administrative'>('Clinical');
  const [formFeeKES, setFormFeeKES] = useState(2000);
  const [formHours, setFormHours] = useState('08:00 - 17:00 (Mon - Sat)');
  const [formLocation, setFormLocation] = useState('Tower B, 2nd Floor');
  const [formHead, setFormHead] = useState('Dr. David Ochieng');

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormCode('');
    setFormCategory('Clinical');
    setFormFeeKES(2000);
    setFormHours('08:00 - 17:00 (Mon - Sat)');
    setFormLocation('Main Hospital Wing');
    setFormHead('Dr. Kipkemoi Haron');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingId(dept.id);
    setFormName(dept.name);
    setFormCode(dept.code);
    setFormCategory(dept.category);
    setFormFeeKES(dept.consultationFeeKES);
    setFormHours(dept.operatingHours);
    setFormLocation(dept.location);
    setFormHead(dept.headOfDepartment || 'Lead Specialist');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    const payload = {
      name: formName,
      code: formCode.toUpperCase(),
      category: formCategory,
      consultationFeeKES: formFeeKES,
      operatingHours: formHours,
      location: formLocation,
      headOfDepartment: formHead
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/departments/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setDeptList(prev => prev.map(d => d.id === editingId ? updated : d));
          setToastMsg('Department record & tariffs updated.');
        }
      } else {
        await onAddDepartment(payload);
        setToastMsg('New hospital department provisioned.');
      }
      setIsModalOpen(false);
      setTimeout(() => setToastMsg(''), 4000);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Save department error:', err);
    }
  };

  const handleToggleArchive = async (dept: Department) => {
    const newArchived = !(dept as any).isArchived;
    try {
      const res = await fetch(`/api/departments/${dept.id}`, {
        method: newArchived ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: newArchived ? undefined : JSON.stringify({ isArchived: false })
      });
      if (res.ok) {
        setDeptList(prev => prev.map(d => d.id === dept.id ? { ...d, isArchived: newArchived } : d));
        setToastMsg(newArchived ? 'Department archived (Soft Deleted).' : 'Department restored.');
        setTimeout(() => setToastMsg(''), 4000);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Archive department error:', err);
    }
  };

  const filteredDepts = deptList.filter(d => {
    const isArchived = (d as any).isArchived;
    if (showArchived && !isArchived) return false;
    if (!showArchived && isArchived) return false;

    return (
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
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

      {/* Header */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-6 border border-white shadow-xl shadow-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold text-xl shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Hospital Departments, Clinics & Specialty Centers</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {deptList.length} Total Units
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage clinical suites, doctor assignments, consultation pricing, and operating schedules
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
            <span>{showArchived ? 'Showing Archived' : 'View Archived'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md shadow-indigo-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => {
          const assignedDocs = doctors.filter(doc => doc.departmentId === dept.id);
          const isArchived = (dept as any).isArchived;

          return (
            <div 
              key={dept.id} 
              className={`bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${
                isArchived ? 'opacity-60 bg-slate-50' : ''
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {dept.code}
                  </span>
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    KES {dept.consultationFeeKES.toLocaleString()}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
                  <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{dept.location}</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Head of Dept:</span>
                    <strong className="text-slate-800">{dept.headOfDepartment || 'Lead Specialist'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Hours:</span>
                    <strong className="text-slate-800">{dept.operatingHours}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Assigned Doctors:</span>
                    <strong className="text-indigo-700 font-bold">{assignedDocs.length} Specialists</strong>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">ID: {dept.id}</span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleArchive(dept)}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                  >
                    {isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="text-sm font-bold">
                {editingId ? 'Edit Department & Tariffs' : 'Add New Hospital Department'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Cardiology & Heart Center"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g. CARD-01"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    <option value="Clinical">Clinical Clinic</option>
                    <option value="Diagnostic">Diagnostic & Imaging</option>
                    <option value="Surgical">Surgical Theater</option>
                    <option value="Therapeutic">Therapeutic / Rehab</option>
                    <option value="Administrative">Administrative</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Consultation Fee (KES)</label>
                  <input
                    type="number"
                    value={formFeeKES}
                    onChange={(e) => setFormFeeKES(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Head of Department</label>
                  <input
                    type="text"
                    value={formHead}
                    onChange={(e) => setFormHead(e.target.value)}
                    placeholder="e.g. Dr. David Ochieng"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Location / Wing</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Tower A, Suite 204"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    placeholder="e.g. 08:00 - 17:00 (Mon - Sat)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
