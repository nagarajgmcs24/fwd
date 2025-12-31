
import React, { useState, useRef } from 'react';
import { User, Issue, IssueStatus } from '../types';
import { storage } from '../services/storageService';
import { analyzeIssue } from '../services/geminiService';
import { composeAndSendEmail, EmailNotification } from '../services/notificationService';
import { View } from '../App';
import { WARDS } from '../constants/wards';

interface ReportIssueProps {
  user: User;
  onSuccess: () => void;
  onNavigate: (view: View) => void;
  onNotification: (n: EmailNotification) => void;
}

const CATEGORIES = [
  'Roads', 'Waste Management', 'Lighting', 'Water', 'Public Safety', 'Parks & Greenery', 'Sewage', 'General'
];

const ReportIssue: React.FC<ReportIssueProps> = ({ user, onSuccess, onNavigate, onNotification }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[CATEGORIES.length - 1]);
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiRating, setAiRating] = useState<number | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getGeolocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setIsLocating(false);
        },
        () => { alert("Enable GPS permissions."); setIsLocating(false); },
        { enableHighAccuracy: true }
      );
    }
  };

  const runAiAnalysis = async () => {
    if (!title || !description) return;
    setAiAnalyzing(true);
    const analysis = await analyzeIssue(title, description, image || undefined);
    if (analysis) {
      setAiResult(analysis);
      if (CATEGORIES.includes(analysis.category)) setCategory(analysis.category);
    }
    setAiAnalyzing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let analysis = aiResult;
    if (!analysis) {
      analysis = await analyzeIssue(title, description, image || undefined);
    }
    
    const newIssue: Issue = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      description,
      image: image || undefined,
      category,
      status: IssueStatus.PENDING,
      priority: (analysis?.priority as any) || 'Medium',
      reportedBy: user.name,
      reportedByEmail: user.email,
      reportedById: user.id,
      ward: user.ward,
      createdAt: new Date().toISOString(),
      location: location ? { lat: location.lat, lng: location.lng } : undefined,
      aiAnalysis: analysis?.summary || "Report processed and categorized."
    };

    storage.addIssue(newIssue);

    // DUAL DISPATCH SYSTEM
    setEmailStatus("Notifying Ward Representatives...");
    const councillorInfo = WARDS.find(w => w.name === user.ward);
    
    // 1. Notify Councillor
    if (councillorInfo) {
      const n1 = await composeAndSendEmail(councillorInfo.email, 'NEW_REPORT', { issue: newIssue, user });
      if (n1) onNotification(n1);
    }

    // 2. Notify Citizen with detailed results
    setEmailStatus("Sending Result to Citizen...");
    const n2 = await composeAndSendEmail(user.email, 'REPORT_RESULT_TO_CITIZEN', { issue: newIssue, user });
    if (n2) onNotification(n2);

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 pb-12">
      <div className="md:col-span-2 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
            <i className="fas fa-arrow-left text-slate-600"></i>
          </button>
          <h1 className="text-2xl font-black text-slate-900">New Report for {user.ward.split(' ')[0]}</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">1. Evidence Photo</label>
            <div onClick={() => fileInputRef.current?.click()} className={`relative group cursor-pointer border-2 border-dashed rounded-3xl overflow-hidden transition-all aspect-[16/9] ${image ? 'border-indigo-400' : 'border-slate-200 hover:border-indigo-300 bg-slate-50'}`}>
              {image ? <img src={image} className="w-full h-full object-cover" /> : <div className="h-full flex flex-col items-center justify-center text-slate-400"><i className="fas fa-camera text-2xl mb-2"></i><span className="font-bold">Snap Problem</span></div>}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" capture="environment" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">2. Headline</label>
              <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Issue headline..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">3. Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">4. Context</label>
            <textarea required rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the problem..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none resize-none"></textarea>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center"><i className="fas fa-robot text-sm"></i></div>
                 <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wider">AI Result Preview</h3>
               </div>
               {!aiResult && <button type="button" onClick={runAiAnalysis} disabled={aiAnalyzing} className="text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 px-4 py-2 rounded-full border border-indigo-200">{aiAnalyzing ? 'Analyzing...' : 'Run Analysis'}</button>}
            </div>
            {aiResult && <div className="p-4 bg-white/80 rounded-2xl border border-indigo-100 text-[11px] italic text-indigo-900">"{aiResult.summary}"</div>}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">5. Location Pin</label>
            <button type="button" onClick={getGeolocation} className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${location ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 border border-slate-200'}`}>
              <i className={`fas ${location ? 'fa-check-circle' : 'fa-crosshairs'}`}></i>
              {location ? 'Location Locked' : 'Detect GPS Position'}
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black text-xl shadow-2xl hover:bg-indigo-700 transition-all flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center">
                <i className="fas fa-circle-notch fa-spin mb-1"></i>
                <span className="text-[10px] font-bold uppercase tracking-widest">{emailStatus || 'Processing...'}</span>
              </div>
            ) : "File Official Report"}
          </button>
        </form>
      </div>
      
      <div className="space-y-6 pt-14">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
           <h3 className="font-black text-slate-900">Notification Routing</h3>
           <p className="text-xs text-slate-500 leading-relaxed">
             This report is being sent to:
             <br/>• <span className="font-bold text-indigo-600">{user.email}</span> (Citizen)
             <br/>• <span className="font-bold text-indigo-600">{WARDS.find(w => w.name === user.ward)?.email}</span> (Councillor)
           </p>
        </div>
      </div>
    </div>
  );
};

export default ReportIssue;
