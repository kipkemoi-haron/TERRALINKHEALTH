import React, { useState } from 'react';
import { 
  FlaskConical, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  X, 
  Save, 
  Check, 
  Printer, 
  ShieldCheck 
} from 'lucide-react';
import { LabOrder } from '../../types';

interface StaffLabOrdersProps {
  labOrders: LabOrder[];
  onSaveLabResults: (labOrderId: string, results: any[], notes: string, techName: string) => Promise<void>;
  selectedAlertOrder?: LabOrder;
  onClearAlertOrder?: () => void;
}

export const StaffLabOrders: React.FC<StaffLabOrdersProps> = ({
  labOrders,
  onSaveLabResults,
  selectedAlertOrder,
  onClearAlertOrder
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [editingOrder, setEditingOrder] = useState<any | null>(selectedAlertOrder || null);
  const [paramRows, setParamRows] = useState<Array<{
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag: string;
  }>>([
    { parameter: 'Hemoglobin (Hb)', value: '13.2', unit: 'g/dL', referenceRange: '12.0 - 15.5', flag: 'Normal' },
    { parameter: 'White Blood Cell (WBC)', value: '7.8', unit: 'x10^9/L', referenceRange: '4.0 - 10.0', flag: 'Normal' },
    { parameter: 'Platelets', value: '260', unit: 'x10^9/L', referenceRange: '150 - 450', flag: 'Normal' },
  ]);
  const [technicianNotes, setTechnicianNotes] = useState('Controls calibrated. Specimen verified on automated clinical analyzer.');
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize when selectedAlertOrder is passed from dashboard
  React.useEffect(() => {
    if (selectedAlertOrder) {
      setEditingOrder(selectedAlertOrder);
      if (selectedAlertOrder.results && selectedAlertOrder.results.length > 0) {
        setParamRows(selectedAlertOrder.results);
      }
      if (selectedAlertOrder.technicianNotes) {
        setTechnicianNotes(selectedAlertOrder.technicianNotes);
      }
    }
  }, [selectedAlertOrder]);

  // 4 Pending and 2 Completed orders matching Image 3
  const pendingOrders = [
    {
      id: 'lab-cbc-01',
      testName: 'Complete Blood Count',
      patientId: 'P001',
      patientName: 'Mary Wambui',
      doctorName: 'Dr. Amina Wanjiku',
      priority: 'Urgent',
      status: 'Pending',
      category: 'Hematology',
      params: [
        { parameter: 'Hemoglobin (Hb)', value: '13.2', unit: 'g/dL', referenceRange: '12.0 - 15.5', flag: 'Normal' },
        { parameter: 'White Blood Cell (WBC)', value: '7.8', unit: 'x10^9/L', referenceRange: '4.0 - 10.0', flag: 'Normal' },
        { parameter: 'Platelets', value: '260', unit: 'x10^9/L', referenceRange: '150 - 450', flag: 'Normal' },
      ]
    },
    {
      id: 'lab-trop-02',
      testName: 'Troponin I',
      patientId: 'P001',
      patientName: 'Mary Wambui',
      doctorName: 'Dr. Amina Wanjiku',
      priority: 'STAT',
      status: 'Pending',
      category: 'Cardiac Markers',
      params: [
        { parameter: 'High-Sensitivity Troponin I', value: '0.014', unit: 'ng/mL', referenceRange: '< 0.04', flag: 'Normal' }
      ]
    },
    {
      id: 'lab-hba1c-03',
      testName: 'HbA1c',
      patientId: 'P002',
      patientName: 'John Mwangi',
      doctorName: 'Dr. Amina Wanjiku',
      priority: 'Routine',
      status: 'In Progress',
      category: 'Biochemistry',
      params: [
        { parameter: 'Glycated Hemoglobin (HbA1c)', value: '7.2', unit: '%', referenceRange: '< 5.7', flag: 'High' }
      ]
    },
    {
      id: 'lab-malaria-04',
      testName: 'Malaria Rapid Test',
      patientId: 'P005',
      patientName: 'Grace Njoki',
      doctorName: 'Dr. Grace Akinyi',
      priority: 'Urgent',
      status: 'Pending',
      category: 'Parasitology',
      params: [
        { parameter: 'Plasmodium Falciparum (mRDT)', value: 'Negative', unit: '', referenceRange: 'Negative', flag: 'Normal' },
        { parameter: 'Pan-Malaria Antigen', value: 'Negative', unit: '', referenceRange: 'Negative', flag: 'Normal' }
      ]
    }
  ];

  const completedOrders = [
    {
      id: 'lab-lipid-05',
      testName: 'Lipid Profile',
      patientId: 'P004',
      patientName: 'Peter Ouma',
      doctorName: 'Dr. Amina Wanjiku',
      priority: 'Routine',
      status: 'Completed',
      completedDate: '2026-07-23 14:20',
      category: 'Biochemistry',
      params: [
        { parameter: 'Total Cholesterol', value: '4.8', unit: 'mmol/L', referenceRange: '< 5.2', flag: 'Normal' },
        { parameter: 'Triglycerides', value: '1.4', unit: 'mmol/L', referenceRange: '< 1.7', flag: 'Normal' },
        { parameter: 'HDL Cholesterol', value: '1.3', unit: 'mmol/L', referenceRange: '> 1.0', flag: 'Normal' },
        { parameter: 'LDL Cholesterol', value: '2.8', unit: 'mmol/L', referenceRange: '< 3.0', flag: 'Normal' }
      ]
    },
    {
      id: 'lab-urine-06',
      testName: 'Urinalysis Full',
      patientId: 'P003',
      patientName: 'Sarah Achieng',
      doctorName: 'Dr. Sarah Odhiambo',
      priority: 'Routine',
      status: 'Completed',
      completedDate: '2026-07-23 11:10',
      category: 'Microscopy',
      params: [
        { parameter: 'Protein', value: 'Negative', unit: '', referenceRange: 'Negative', flag: 'Normal' },
        { parameter: 'Glucose', value: 'Negative', unit: '', referenceRange: 'Negative', flag: 'Normal' },
        { parameter: 'Leukocyte Esterase', value: 'Negative', unit: '', referenceRange: 'Negative', flag: 'Normal' },
        { parameter: 'pH', value: '6.5', unit: '', referenceRange: '5.0 - 7.5', flag: 'Normal' }
      ]
    }
  ];

  const handleOpenOrder = (order: any) => {
    setEditingOrder(order);
    if (order.params) {
      setParamRows(order.params);
    }
  };

  const handleSaveModalResults = async () => {
    if (!editingOrder) return;
    setIsSaving(true);
    try {
      await onSaveLabResults(
        editingOrder.id,
        paramRows,
        technicianNotes,
        'Mr. Dennis Kipkoech (Chief Lab Scientist)'
      );
      setEditingOrder(null);
      onClearAlertOrder?.();
      alert('Lab order results verified and filed to clinical record.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Lab Orders & Results
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          View lab orders, enter and review results
        </p>
      </div>

      {/* Segmented Pills: Pending (4) | Completed (2) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-[#023545] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending (4)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-[#023545] text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Completed (2)
        </button>
      </div>

      {/* Pending Orders Grid */}
      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingOrders.map((order) => {
            const isStat = order.priority === 'STAT';
            const isUrgent = order.priority === 'Urgent';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      {order.testName}
                    </h3>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isStat || isUrgent ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {order.priority}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                    <p>Patient: <strong className="text-slate-800 font-semibold">{order.patientName}</strong> · ID: {order.patientId}</p>
                    <p className="text-slate-400">Ordered by: {order.doctorName}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">
                    {order.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenOrder(order)}
                    className="px-4 py-1.5 rounded-xl bg-[#023545] hover:bg-[#0b4c5e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    Enter Results
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Orders Grid */}
      {activeTab === 'completed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-base">
                    {order.testName}
                  </h3>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {order.priority}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Completed
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                  <p>Patient: <strong className="text-slate-800 font-semibold">{order.patientName}</strong> · ID: {order.patientId}</p>
                  <p className="text-slate-400">Verified: {order.completedDate} · {order.doctorName}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  {order.category}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenOrder(order)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  View Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RESULT ENTRY & REVIEW MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => {
              setEditingOrder(null);
              onClearAlertOrder?.();
            }}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  {editingOrder.testName || editingOrder.testCategory || 'Clinical Laboratory Assay'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Patient: {editingOrder.patientName} ({editingOrder.patientId}) · Order Ref: {editingOrder.id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingOrder(null);
                  onClearAlertOrder?.();
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Critical Notice if applicable */}
              {editingOrder.criticalAlert && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Critical Value Alert: Serum Potassium is above safe threshold (6.2 mEq/L). Confirm calibration and clinical notification.</span>
                </div>
              )}

              {/* Parameters Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <tr>
                      <th className="p-3">Analyte / Parameter</th>
                      <th className="p-3">Measured Value</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3">Reference Range</th>
                      <th className="p-3">Clinical Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paramRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-800">{row.parameter}</td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={row.value}
                            onChange={(e) => {
                              const updated = [...paramRows];
                              updated[idx].value = e.target.value;
                              setParamRows(updated);
                            }}
                            className="w-20 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </td>
                        <td className="p-3 text-slate-500">{row.unit}</td>
                        <td className="p-3 text-slate-500">{row.referenceRange}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.flag?.includes('Critical') || row.flag === 'High'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {row.flag || 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lab Technician Validation Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Scientist Verification & Analyzer Notes
                </label>
                <textarea
                  rows={3}
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#023545]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Verified by Mr. Dennis Kipkoech (Chief Lab Scientist)
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingOrder(null);
                    onClearAlertOrder?.();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalResults}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#023545] hover:bg-[#0b4c5e] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {isSaving ? 'Verifying...' : 'Save & Certify Results'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
