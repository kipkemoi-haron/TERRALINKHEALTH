import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  User, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  X, 
  Phone, 
  CheckCircle2, 
  Stethoscope,
  HeartPulse
} from 'lucide-react';
import { PatientProfile } from '../types';

interface NurseDirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
}

export const NurseDirectChatModal: React.FC<NurseDirectChatModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  if (!isOpen) return null;

  const departmentNurses = [
    {
      id: 'nurse-1',
      name: 'Nurse Faith Chemutai',
      department: 'Cardiology',
      status: 'Online • Duty Station Bay 2',
      avatar: 'https://images.unsplash.com/photo-1594824813579-226871a2d590?auto=format&fit=crop&q=80&w=200',
      greeting: 'Hello! I am on shift in the Cardiology Center. How are your vitals and medications feeling today?'
    },
    {
      id: 'nurse-2',
      name: 'Nurse Mercy Wanjiku',
      department: 'Pediatrics',
      status: 'Online • Station 3',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
      greeting: 'Jambo! I assist Dr. Grace Muthoni in Pediatrics. Have any questions regarding infant immunization or nutrition?'
    },
    {
      id: 'nurse-3',
      name: 'Nurse Kevin Otieno',
      department: 'Emergency & Trauma',
      status: 'Active • Resuscitation Bay',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
      greeting: 'Emergency triage nurse on duty. If you have acute pain or red-flag symptoms, please alert us immediately!'
    },
    {
      id: 'nurse-4',
      name: 'Nurse Beatrice Muthoni',
      department: 'Obstetrics & Gynaecology (OB/GYN)',
      status: 'Online • Maternity Suite',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      greeting: 'Hello mama! How is your antenatal care going? Ready for your 4D ultrasound or next follow-up?'
    },
    {
      id: 'nurse-5',
      name: 'Nurse Brian Kiprono',
      department: 'Orthopedics & Joint',
      status: 'Online • Cast & Rehab Bay',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
      greeting: 'Orthopedic nurse station active. Please let me know how your mobility and joint pain levels are.'
    },
    {
      id: 'nurse-6',
      name: 'Nurse Daniel Mutua',
      department: 'Radiology & Imaging',
      status: 'Online • MRI/CT Console',
      avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200',
      greeting: 'Radiology desk ready. Need fasting guidelines or metal implant clearance before your MRI/CT scan?'
    }
  ];

  const [selectedNurseId, setSelectedNurseId] = useState<string>('nurse-1');
  const activeNurse = departmentNurses.find(n => n.id === selectedNurseId) || departmentNurses[0];

  const [messages, setMessages] = useState<Record<string, Array<{ sender: 'patient' | 'nurse'; text: string; time: string }>>>({
    'nurse-1': [
      {
        sender: 'nurse',
        text: 'Hello! I am on shift in the Cardiology Center. How are your vitals and medications feeling today?',
        time: '09:00 AM'
      },
      {
        sender: 'patient',
        text: 'Hi Nurse Faith, I took my morning blood pressure reading (124/80 mmHg). Should I take the Amlodipine before breakfast?',
        time: '09:05 AM'
      },
      {
        sender: 'nurse',
        text: 'Your BP reading of 124/80 mmHg is in the optimal target zone! Yes, take Amlodipine with a glass of water with breakfast as Dr. Ochieng prescribed.',
        time: '09:07 AM'
      }
    ]
  });

  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedUserMsgs = [
      ...(messages[selectedNurseId] || [
        { sender: 'nurse', text: activeNurse.greeting, time: '09:00 AM' }
      ]),
      { sender: 'patient' as const, text: userText, time: timeNow }
    ];

    setMessages(prev => ({
      ...prev,
      [selectedNurseId]: updatedUserMsgs
    }));

    setInputText('');

    // Simulate real clinical nurse response
    setTimeout(() => {
      let nurseReply = `Thank you ${patient.name}. I have logged this query for the ${activeNurse.department} clinical team. Everything looks well aligned with your care protocol.`;
      
      const lower = userText.toLowerCase();
      if (lower.includes('fasting') || lower.includes('food') || lower.includes('eat')) {
        nurseReply = 'For your upcoming lab and imaging work, maintain 8 hours fasting for fasting lipid/glucose tests. Plain water is permitted.';
      } else if (lower.includes('pain') || lower.includes('ache')) {
        nurseReply = 'I noted your pain report. If pain score exceeds 6/10, please let us know so we can notify the attending doctor for analgesia titration.';
      }

      setMessages(prev => ({
        ...prev,
        [selectedNurseId]: [
          ...(prev[selectedNurseId] || []),
          { sender: 'nurse', text: nurseReply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]
      }));
    }, 900);
  };

  const currentChat = messages[selectedNurseId] || [
    { sender: 'nurse', text: activeNurse.greeting, time: '09:00 AM' }
  ];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl h-[600px] max-h-[90vh] flex flex-col sm:flex-row overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Nurse Sidebar */}
        <div className="w-full sm:w-72 border-b sm:border-b-0 sm:border-r border-slate-200 bg-slate-50 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-bold text-slate-900">Department Nurses</h4>
            </div>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Live On-Duty
            </span>
          </div>

          <div className="p-2 overflow-y-auto space-y-1.5 flex-1">
            {departmentNurses.map((nurse) => {
              const isSelected = selectedNurseId === nurse.id;
              return (
                <div
                  key={nurse.id}
                  onClick={() => setSelectedNurseId(nurse.id)}
                  className={`p-2.5 rounded-2xl flex items-center space-x-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25 font-bold'
                      : 'hover:bg-white text-slate-700'
                  }`}
                >
                  <img
                    src={nurse.avatar}
                    alt={nurse.name}
                    className="w-10 h-10 rounded-xl object-cover border border-white/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs truncate ${isSelected ? 'text-white font-bold' : 'text-slate-900 font-bold'}`}>
                      {nurse.name}
                    </p>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-teal-100' : 'text-teal-700 font-medium'}`}>
                      {nurse.department}
                    </p>
                    <span className={`text-[9px] flex items-center space-x-1 mt-0.5 ${isSelected ? 'text-teal-200' : 'text-slate-400'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      <span>{nurse.status}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Chat Pane */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <img
                src={activeNurse.avatar}
                alt={activeNurse.name}
                className="w-10 h-10 rounded-xl object-cover border border-teal-500/30 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-slate-900">{activeNurse.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {activeNurse.department}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Direct encrypted channel for patient nursing assistance & prep questions
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50/30 text-xs">
            {currentChat.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'patient' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === 'patient'
                      ? 'bg-teal-600 text-white rounded-br-none shadow-md shadow-teal-600/20'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto scrollbar-none text-[11px]">
            {[
              'What are the fasting rules for my lab test?',
              'How should I take my morning medications?',
              'Is equipment ready for my ultrasound scan?'
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(prompt)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-800 whitespace-nowrap transition-all cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeNurse.name}...`}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
            <button
              type="submit"
              className="p-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
