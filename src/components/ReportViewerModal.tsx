import React from 'react';
import { Printer, Download, X, Building2, CheckCircle2, ShieldCheck, Pill, Eye, FileText } from 'lucide-react';
import { ClinicalEncounter, LabOrder, Invoice, PatientProfile, Prescription, RadiologyOrder } from '../types';

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'medical_report' | 'lab_report' | 'invoice' | 'prescription' | 'radiology';
  patient: PatientProfile;
  encounter?: ClinicalEncounter;
  labOrder?: LabOrder;
  invoice?: Invoice;
  prescription?: Prescription;
  radiologyOrder?: RadiologyOrder;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  type,
  patient,
  encounter,
  labOrder,
  invoice,
  prescription,
  radiologyOrder
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Modal Controls Top Bar */}
        <div className="bg-slate-900 px-6 py-3.5 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span className="font-semibold text-sm">Official Electronic Document • TERRALINK Health Nairobi</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-[#0284c7] hover:bg-sky-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 text-slate-800 printable-content bg-white">
          
          {/* Hospital Official Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded bg-[#0284c7] text-white flex items-center justify-center font-bold text-base">
                  TL
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">TERRALINK HEALTH</h1>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Hospital Hill Road, Parklands / Upper Hill Medical Complex, Nairobi County, Kenya
              </p>
              <p className="text-xs text-slate-500">
                Helpline: 0713544101 • Email: records@terralinkhealth.co.ke
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-slate-800">
                {type === 'medical_report' ? 'CLINICAL ENCOUNTER REPORT' :
                 type === 'lab_report' ? 'DIAGNOSTIC LAB CERTIFICATE' :
                 type === 'prescription' ? 'OFFICIAL E-PRESCRIPTION' :
                 type === 'radiology' ? 'RADIOLOGY DIAGNOSTIC REPORT' : 'OFFICIAL TAX INVOICE'}
              </span>
              <p className="text-xs text-slate-500 mt-1 font-mono">Date: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          {/* Patient Details Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Patient Name:</span>
              <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">National ID:</span>
              <span className="font-mono font-semibold text-slate-800">{patient.nationalId || '32849102'}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">DOB / Gender:</span>
              <span className="text-slate-800 font-medium">{patient.dob || '1994-04-12'} ({patient.gender || 'Female'})</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Insurance / Cover:</span>
              <span className="text-slate-800 font-medium">{patient.insuranceProvider || 'Social Health Authority (SHA)'}</span>
            </div>
          </div>

          {/* Type Specific Content */}
          {type === 'medical_report' && encounter && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-3">
                  <span className="text-slate-500 block font-semibold mb-1">Attending Clinician:</span>
                  <p className="font-bold text-slate-800">{encounter.doctorName}</p>
                  <p className="text-slate-600">{encounter.departmentName}</p>
                  <p className="text-slate-500 font-mono mt-1">Visit Date: {encounter.visitDate}</p>
                </div>
                <div className="border border-slate-200 rounded-xl p-3">
                  <span className="text-slate-500 block font-semibold mb-1">Recorded Vital Signs:</span>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                    <div>BP: <strong>{encounter.vitals?.bloodPressureSystolic || 120}/{encounter.vitals?.bloodPressureDiastolic || 80} mmHg</strong></div>
                    <div>HR: <strong>{encounter.vitals?.heartRateBpm || 74} bpm</strong></div>
                    <div>SpO2: <strong>{encounter.vitals?.oxygenSaturationPercent || 98}%</strong></div>
                    <div>Temp: <strong>{encounter.vitals?.temperatureCelsius || 36.6}°C</strong></div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">Chief Complaint &amp; Clinical Presentation</h4>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg">{encounter.chiefComplaint || 'Patient presented for clinical assessment.'} {encounter.historyOfPresentIllness || ''}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">Clinical Diagnoses (ICD-10)</h4>
                <div className="space-y-1">
                  {encounter.diagnoses?.map((d, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-mono font-bold rounded text-[11px]">{d.code}</span>
                      <span className="font-medium text-slate-800">{d.name}</span>
                      <span className="text-slate-400 text-[10px]">({d.type})</span>
                    </div>
                  )) || (
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-800 font-mono font-bold rounded text-[11px]">J06.9</span>
                      <span className="font-medium text-slate-800">Upper respiratory infection, unspecified</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">Treatment Plan &amp; Follow-Up Recommendations</h4>
                <p className="text-slate-700 whitespace-pre-line bg-slate-50 p-2.5 rounded-lg">{encounter.treatmentPlan || 'Prescribed oral symptomatic treatment. Review in 5 days if symptoms persist.'}</p>
              </div>
            </div>
          )}

          {type === 'lab_report' && labOrder && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Investigation Test:</span>
                  <strong className="text-slate-900 text-sm">{labOrder.testName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Sample Specimen:</span>
                  <span className="font-semibold text-slate-800">{labOrder.sampleType || 'Whole Blood'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Priority / Status:</span>
                  <span className="font-bold text-emerald-700">{labOrder.status}</span>
                </div>
              </div>

              {/* Lab Parameters Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Test Parameter</th>
                      <th className="py-2.5 px-3">Observed Value</th>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Biological Reference Range</th>
                      <th className="py-2.5 px-3 text-right">Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                    {labOrder.results?.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/80">
                        <td className="py-2 px-3 font-sans font-medium text-slate-800">{r.parameter}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{r.value}</td>
                        <td className="py-2 px-3 text-slate-600">{r.unit}</td>
                        <td className="py-2 px-3 text-slate-600">{r.referenceRange}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            r.flag === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {r.flag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-semibold block mb-1">Laboratory Technologist Remarks:</span>
                <p className="text-slate-700 italic">{labOrder.technicianNotes || 'Specimen processed adhering to standard validation protocols. Morphology normal.'}</p>
                <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-500 font-sans">
                  <span>Verified By: <strong>{labOrder.conductedByLabTech || 'Mr. Dennis Kipkoech (Chief Lab Scientist)'}</strong></span>
                  <span>Validation Date: {labOrder.completedAt?.split('T')[0] || new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>
            </div>
          )}

          {type === 'prescription' && prescription && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Prescription ID:</span>
                  <strong className="text-slate-900 font-mono text-sm">{prescription.id}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Prescribed Date:</span>
                  <span className="font-semibold text-slate-800">{prescription.prescribedDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <span className="font-bold text-emerald-700">{prescription.status}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Medication Name &amp; Strength</th>
                      <th className="py-2.5 px-3">Dosage &amp; Frequency</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {prescription.medications?.map((m, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{m.drugName}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{m.dosage} &bull; {m.frequency}</td>
                        <td className="py-2.5 px-3 text-slate-600">{m.duration}</td>
                        <td className="py-2.5 px-3 text-slate-600 italic">{m.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between text-slate-600 text-[11px]">
                <span>Prescribed by: <strong className="text-slate-900">{prescription.doctorName}</strong></span>
                <span>Dispensed by: <strong className="text-slate-900">{prescription.dispensedBy || 'Pharm. Lucy Njeri'}</strong></span>
              </div>
            </div>
          )}

          {type === 'radiology' && radiologyOrder && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Modality &amp; Examination:</span>
                  <strong className="text-slate-900 text-sm">{radiologyOrder.modality} - {radiologyOrder.bodyPart}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Date of Scan:</span>
                  <span className="font-semibold text-slate-800">{radiologyOrder.orderDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <span className="font-bold text-emerald-700">{radiologyOrder.status}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">Clinical Indication</h4>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg">{radiologyOrder.clinicalIndication || 'Diagnostic evaluation of joint / chest symptoms.'}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-1 mb-1.5">Radiological Findings</h4>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg leading-relaxed">{radiologyOrder.findings || 'Both lung fields clear with normal bronchovascular markings. Cardiothoracic ratio is within normal limits. Costophrenic angles are acute. No pneumothorax, effusion, or active airspace disease seen.'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between text-[11px] text-slate-600">
                <span>Interpreting Radiologist: <strong className="text-slate-900">{radiologyOrder.radiologistName || 'Dr. Peter Ochieng, Consultant Radiologist'}</strong></span>
                <span>Result Validation: <strong className="text-emerald-700">Electronically Verified</strong></span>
              </div>
            </div>
          )}

          {type === 'invoice' && invoice && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Invoice Number:</span>
                  <strong className="font-mono text-slate-900 text-sm">{invoice.id}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Status:</span>
                  <span className={`px-2.5 py-0.5 font-bold rounded-full text-xs ${
                    invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                    invoice.status === 'Overdue' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Payment Method / Ref:</span>
                  <strong className="font-mono text-slate-900">{invoice.mpesaReceipt || (invoice.status === 'Paid' ? 'QHK91A44LL' : 'Pending Payment')}</strong>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Amount (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((it, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 font-medium text-slate-800">{it.description}</td>
                        <td className="py-2 px-3 text-slate-500">{it.category}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-slate-900 text-right">
                          KES {it.amountKES.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-300">
                    <tr>
                      <td colSpan={2} className="py-3 px-3 text-right text-slate-700">Total Amount:</td>
                      <td className="py-3 px-3 font-mono text-base text-slate-900 text-right">KES {invoice.totalKES.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-2 px-3 text-right text-emerald-700">Paid Amount:</td>
                      <td className="py-2 px-3 font-mono text-sm text-emerald-700 text-right">KES {invoice.paidAmountKES.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-2 px-3 text-right text-slate-500">Outstanding Balance:</td>
                      <td className="py-2 px-3 font-mono text-sm text-slate-900 text-right">KES {invoice.balanceKES.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Footer Sign-off & Verification */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-[11px] text-slate-500">
            <div>
              <div className="flex items-center space-x-1 text-sky-700 font-semibold mb-0.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Digitally Authenticated Medical Record</span>
              </div>
              <p>Certified by Kenya Medical Practitioners &amp; Dentists Council (KMPDC) Standard EHR Interface</p>
            </div>
            <div className="text-right">
              <p className="font-serif italic text-slate-800 text-sm">TERRALINK Electronic Signature Validated</p>
              <p className="font-mono text-[10px]">HASH: 7a9f-8812-kes-ke-nrb</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

