import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor, 
  MessageSquare, 
  ShieldCheck, 
  FileText, 
  Send,
  Activity,
  Heart,
  Volume2
} from 'lucide-react';
import { Appointment, ClinicalEncounter } from '../types';

interface TelemedicineRoomProps {
  appointment: Appointment;
  currentUserRole: 'patient' | 'doctor';
  currentUserName: string;
  onEndCall: () => void;
  onSaveConsultationNote?: (encounterData: Partial<ClinicalEncounter>) => void;
}

export const TelemedicineRoom: React.FC<TelemedicineRoomProps> = ({
  appointment,
  currentUserRole,
  currentUserName,
  onEndCall,
  onSaveConsultationNote
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'vitals' | 'notes' | 'chat'>('notes');
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    {
      sender: 'TERRALINK Encrypted Bridge',
      text: `Secure WebRTC consultation room established. HIPAA / Kenya Data Protection Act compliant session #${appointment.id}.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  // Doctor note taking state
  const [soapSubjective, setSoapSubjective] = useState(appointment.reason || '');
  const [soapObjective, setSoapObjective] = useState('Patient alert, oriented x3. Video examination shows normal respiratory effort.');
  const [soapAssessment, setSoapAssessment] = useState('');
  const [soapPlan, setSoapPlan] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request Camera & Mic
  useEffect(() => {
    let active = true;

    async function initMedia() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          if (active && localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
            mediaStreamRef.current = stream;
          }
        }
      } catch (err) {
        console.warn('Camera/mic access fallback (safe fallback for sandboxed preview):', err);
      }
    }

    initMedia();

    return () => {
      active = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOn;
      });
    }
    setIsVideoOn(!isVideoOn);
  };

  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isAudioOn;
      });
    }
    setIsAudioOn(!isAudioOn);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        sender: currentUserName,
        text: inputMsg.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputMsg('');
  };

  const handleSaveNotes = () => {
    if (onSaveConsultationNote) {
      onSaveConsultationNote({
        chiefComplaint: soapSubjective,
        examinationNotes: soapObjective,
        treatmentPlan: soapPlan,
        diagnoses: soapAssessment ? [{ code: 'Z00.00', name: soapAssessment, type: 'Primary' }] : []
      });
    }
    alert('Telemedicine clinical note saved to patient electronic medical record.');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden animate-in fade-in duration-200">
      
      {/* Top Telemedicine Bar */}
      <header className="h-14 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            TL
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm">TERRALINK TeleHealth Video Suite</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                Live HD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentUserRole === 'doctor' ? `Consulting: ${appointment.patientName}` : `Clinician: ${appointment.doctorName}`} • {appointment.departmentName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="px-3 py-1 bg-slate-800 rounded-lg border border-slate-700 font-mono text-xs text-slate-200 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>{formatTime(callDuration)}</span>
          </div>

          <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Video & Clinical Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Video Grid */}
        <div className="flex-1 relative bg-slate-900 flex flex-col p-4">
          
          {/* Main Remote Video (Simulated remote doctor or patient view) */}
          <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
            
            <img 
              src={currentUserRole === 'doctor' 
                ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200' 
                : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=1200'}
              alt="Remote Participant"
              className="w-full h-full object-cover"
            />

            {/* Remote overlay label */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center space-x-2 text-xs">
              <span className="font-semibold text-slate-100">
                {currentUserRole === 'doctor' ? appointment.patientName : appointment.doctorName}
              </span>
              <span className="text-slate-400">({currentUserRole === 'doctor' ? 'Patient' : 'Consultant'})</span>
            </div>

            {/* Vitals HUD overlay */}
            <div className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 text-xs space-y-1.5">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center space-x-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                <span>Patient Vitals HUD</span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px]">
                <div className="text-slate-300">BP: <strong className="text-white">118/76</strong></div>
                <div className="text-slate-300">HR: <strong className="text-white">72 bpm</strong></div>
                <div className="text-slate-300">SpO2: <strong className="text-emerald-400">99%</strong></div>
                <div className="text-slate-300">Temp: <strong className="text-white">36.6°C</strong></div>
              </div>
            </div>

            {/* Local Pip Video */}
            <div className="absolute bottom-4 right-4 w-44 h-32 md:w-56 md:h-38 rounded-xl overflow-hidden bg-slate-800 border-2 border-emerald-500/50 shadow-2xl">
              {isVideoOn ? (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover mirror"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                  <VideoOff className="w-6 h-6 mb-1" />
                  <span className="text-[10px]">Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-1.5 left-2 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
                You ({currentUserName})
              </div>
            </div>

          </div>

          {/* Video Control Bar */}
          <div className="h-16 mt-3 flex items-center justify-center space-x-3">
            <button
              onClick={toggleAudio}
              className={`p-3.5 rounded-full border transition-all ${
                isAudioOn 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' 
                  : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
              }`}
              title={isAudioOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3.5 rounded-full border transition-all ${
                isVideoOn 
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' 
                  : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
              }`}
              title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsScreenSharing(!isScreenSharing)}
              className={`p-3.5 rounded-full border transition-all ${
                isScreenSharing 
                  ? 'bg-emerald-600 text-white border-emerald-500' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
              }`}
              title="Share Screen"
            >
              <Monitor className="w-5 h-5" />
            </button>

            <button
              onClick={onEndCall}
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-semibold text-sm flex items-center space-x-2 shadow-lg shadow-rose-600/30 transition-colors"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Consultation</span>
            </button>
          </div>

        </div>

        {/* Sidebar: Consultation Notes, Vitals & Live In-Call Chat */}
        <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-800 text-xs font-semibold">
            {currentUserRole === 'doctor' && (
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-3 border-b-2 flex items-center justify-center space-x-1.5 transition-colors ${
                  activeTab === 'notes' 
                    ? 'border-emerald-500 text-emerald-400 bg-slate-800/50' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Clinical Notes</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex-1 py-3 border-b-2 flex items-center justify-center space-x-1.5 transition-colors ${
                activeTab === 'vitals' 
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/50' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Medical History</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 border-b-2 flex items-center justify-center space-x-1.5 transition-colors ${
                activeTab === 'chat' 
                  ? 'border-emerald-500 text-emerald-400 bg-slate-800/50' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Encrypted Chat</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-4 text-xs space-y-4">
            
            {/* Notes Tab (Doctor Only) */}
            {activeTab === 'notes' && currentUserRole === 'doctor' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Subjective (Chief Complaint)</label>
                  <textarea
                    rows={2}
                    value={soapSubjective}
                    onChange={(e) => setSoapSubjective(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Objective (Virtual Examination)</label>
                  <textarea
                    rows={2}
                    value={soapObjective}
                    onChange={(e) => setSoapObjective(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Assessment (Working Diagnosis)</label>
                  <input
                    type="text"
                    placeholder="e.g. Acute Bronchospasm / Asthma Exacerbation"
                    value={soapAssessment}
                    onChange={(e) => setSoapAssessment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Treatment & Follow-Up Plan</label>
                  <textarea
                    rows={3}
                    placeholder="1. Continue Salbutamol inhaler PRN&#10;2. Prescribe oral antihistamines&#10;3. Review in 1 week"
                    value={soapPlan}
                    onChange={(e) => setSoapPlan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Save Clinical EMR Note</span>
                </button>
              </div>
            )}

            {/* Vitals & Summary Tab */}
            {activeTab === 'vitals' && (
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <h4 className="font-semibold text-slate-300 text-xs">Patient Details</h4>
                  <p className="text-slate-400">Name: <strong className="text-slate-200">{appointment.patientName}</strong></p>
                  <p className="text-slate-400">National ID: <strong className="text-slate-200">{appointment.patientNationalId}</strong></p>
                  <p className="text-slate-400">Phone: <strong className="text-slate-200">{appointment.patientPhone}</strong></p>
                  <p className="text-slate-400">Known Allergies: <strong className="text-rose-400">Penicillin, Sulfa drugs</strong></p>
                  <p className="text-slate-400">Chronic Conditions: <strong className="text-amber-400">Mild Asthma (controlled)</strong></p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <h4 className="font-semibold text-slate-300 text-xs">Recent Laboratory Results</h4>
                  <div className="text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>Hemoglobin (Hb):</span>
                      <span className="font-semibold text-slate-200">13.4 g/dL (Normal)</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Lipid Profile:</span>
                      <span className="font-semibold text-slate-200">Total Chol 4.8 mmol/L</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Chest X-Ray:</span>
                      <span className="font-semibold text-emerald-400">Clear lung fields PA</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col justify-between">
                <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-semibold text-emerald-400">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="text-slate-200 text-xs">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-800 flex space-x-2">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    placeholder="Type in-call message..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
