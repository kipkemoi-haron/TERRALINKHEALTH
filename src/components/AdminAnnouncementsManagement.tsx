import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Archive, 
  RotateCcw, 
  Edit, 
  X, 
  Radio, 
  Megaphone,
  Calendar,
  Eye
} from 'lucide-react';

export interface AnnouncementItem {
  id: string;
  title: string;
  category: 'Emergency Alert' | 'Clinic Notice' | 'Medical Camp' | 'Maintenance' | 'General';
  priority: 'High' | 'Medium' | 'Low';
  content: string;
  targetAudience: 'All Patients' | 'Outpatients' | 'Staff Only';
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived?: boolean;
}

interface AdminAnnouncementsProps {
  onRefresh?: () => void;
}

export const AdminAnnouncementsManagement: React.FC<AdminAnnouncementsProps> = ({ onRefresh }) => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCat, setFormCat] = useState<'Emergency Alert' | 'Clinic Notice' | 'Medical Camp' | 'Maintenance' | 'General'>('Clinic Notice');
  const [formPriority, setFormPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [formContent, setFormContent] = useState('');
  const [formAudience, setFormAudience] = useState<'All Patients' | 'Outpatients' | 'Staff Only'>('All Patients');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [formEndDate, setFormEndDate] = useState('2026-12-31');
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/announcements?includeArchived=true');
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.error('Fetch announcements error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCat('Clinic Notice');
    setFormPriority('Medium');
    setFormContent('');
    setFormAudience('All Patients');
    setFormStartDate(new Date().toISOString().slice(0, 10));
    setFormEndDate('2026-12-31');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setEditingId(item.id);
    setFormTitle(item.title);
    setFormCat(item.category);
    setFormPriority(item.priority);
    setFormContent(item.content);
    setFormAudience(item.targetAudience);
    setFormStartDate(item.startDate);
    setFormEndDate(item.endDate);
    setFormIsActive(item.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const payload = {
      title: formTitle,
      category: formCat,
      priority: formPriority,
      content: formContent,
      targetAudience: formAudience,
      startDate: formStartDate,
      endDate: formEndDate,
      isActive: formIsActive
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/announcements/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated = await res.json();
          setAnnouncements(prev => prev.map(a => a.id === editingId ? updated : a));
          setToastMsg('Patient announcement updated.');
        }
      } else {
        const res = await fetch('/api/announcements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const created = await res.json();
          setAnnouncements(prev => [created, ...prev]);
          setToastMsg('New announcement broadcast live to patients.');
        }
      }
      setIsModalOpen(false);
      setTimeout(() => setToastMsg(''), 4000);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Save announcement error:', err);
    }
  };

  const handleToggleArchive = async (item: AnnouncementItem) => {
    const newArchived = !item.isArchived;
    try {
      const res = await fetch(`/api/announcements/${item.id}`, {
        method: newArchived ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: newArchived ? undefined : JSON.stringify({ isArchived: false })
      });
      if (res.ok) {
        setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, isArchived: newArchived } : a));
        setToastMsg(newArchived ? 'Announcement archived (Soft Deleted).' : 'Announcement restored.');
        setTimeout(() => setToastMsg(''), 4000);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Archive announcement error:', err);
    }
  };

  const filteredItems = announcements.filter(item => {
    if (!showArchived && item.isArchived) return false;
    if (showArchived && !item.isArchived) return false;

    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

      {/* Top Banner */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl p-6 border border-white shadow-xl shadow-slate-200/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-xl shadow-inner">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">Patient-Facing Alerts & Announcements</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Live Broadcast
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Broadcast critical health alerts, medical camp notifications, and clinic schedule changes across the patient portal
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
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      {/* Grid of Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white/60 rounded-3xl border border-white text-slate-400 text-xs">
            {loading ? 'Loading announcements...' : 'No announcements found matching the filter.'}
          </div>
        ) : (
          filteredItems.map((item) => {
            const priorityStyles = {
              High: 'bg-rose-50 text-rose-800 border-rose-200',
              Medium: 'bg-amber-50 text-amber-800 border-amber-200',
              Low: 'bg-teal-50 text-teal-800 border-teal-200'
            };

            return (
              <div 
                key={item.id} 
                className={`bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 ${
                  item.isArchived ? 'opacity-60 bg-slate-50' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityStyles[item.priority]}`}>
                      {item.priority} Priority • {item.category}
                    </span>
                    <span className={`w-2.5 h-2.5 rounded-full ${item.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} title={item.isActive ? 'Active' : 'Inactive'} />
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{item.content}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Audience: <strong className="text-slate-700">{item.targetAudience}</strong></span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(item)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                    >
                      {item.isArchived ? <RotateCcw className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="text-sm font-bold">
                {editingId ? 'Edit Announcement' : 'Create Patient Announcement'}
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Headline / Title *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Free Community Pediatric & Cardiac Screening Camp"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category</label>
                  <select
                    value={formCat}
                    onChange={(e) => setFormCat(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    <option value="Clinic Notice">Clinic Notice</option>
                    <option value="Emergency Alert">Emergency Alert</option>
                    <option value="Medical Camp">Medical Camp</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="General">General Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Priority Level</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    <option value="High">High (Red Banner)</option>
                    <option value="Medium">Medium (Yellow Banner)</option>
                    <option value="Low">Low (Informational)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Broadcast Content *</label>
                <textarea
                  rows={3}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  placeholder="Describe the notice, dates, location, and actions required..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Audience</label>
                  <select
                    value={formAudience}
                    onChange={(e) => setFormAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                  >
                    <option value="All Patients">All Registered Patients</option>
                    <option value="Outpatients">Outpatient Clinics Only</option>
                    <option value="Staff Only">Hospital Staff Only</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2 pt-5">
                  <input
                    type="checkbox"
                    id="activeCheck"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <label htmlFor="activeCheck" className="text-slate-800 font-bold cursor-pointer">
                    Broadcast Live Now
                  </label>
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
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
