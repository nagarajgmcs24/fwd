import React, { useState, useRef } from 'react';
import { User, EmailNotification } from '../types.ts';
import { apiService } from '../services/apiService.ts';
import { analyzeIssue } from '../services/ai.ts';
import { View } from '../App.tsx';

interface ReportIssueProps {
  user: User;
  onSuccess: () => void;
  onNavigate: (view: View) => void;
  onNotification: (n: EmailNotification) => void;
}

const ReportIssue: React.FC<ReportIssueProps> = ({ user, onSuccess, onNavigate, onNotification }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const analysis = await analyzeIssue(title, description, image || undefined);
    
    const newIssue: Issue = {
      id: Math.random().toString(36).substr(2, 9),
      title, description, image: image || undefined,
      category: analysis.category || 'General',
      status: IssueStatus.PENDING,
      priority: analysis.priority || 'Medium',
      reportedBy: user.name, reportedByEmail: user.email, reportedById: user.id,
      ward: user.ward, createdAt: new Date().toISOString(),
      aiAnalysis: analysis.summary
    };

    storage.addIssue(newIssue);

    const councillor = WARDS.find(w => w.name === user.ward);
    if (councillor) {
      const n1 = await composeSmartNotification('NEW_REPORT', { issue: newIssue, ward: user.ward, email: councillor.email });
      if (n1) onNotification(n1);
    }

    const n2 = await composeSmartNotification('REPORT_CONFIRMATION', { issue: newIssue, user });
    if (n2) onNotification(n2);

    setLoading(false);
    onSuccess();
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 animate-slide-up">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => onNavigate('dashboard')} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors">
          <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="text-3xl font-black text-slate-900">New Ward Report</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
        <div onClick={() => fileInputRef.current?.click()} className={`relative cursor-pointer border-2 border-dashed rounded-3xl aspect-video flex flex-col items-center justify-center overflow-hidden transition-all ${image ? 'border-indigo-400' : 'border-slate-200 hover:border-indigo-300 bg-slate-50'}`}>
          {image ? <img src={image} className="w-full h-full object-cover" /> : (
            <>
              <i className="fas fa-camera text-4xl text-slate-300 mb-2"></i>
              <span className="font-bold text-slate-400">Capture Problem</span>
            </>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImage} accept="image/*" className="hidden" />
        </div>

        <input required type="text" placeholder="Issue Title (e.g. Street Light Out)" className="w-full px-6 py-4 bg-slate-50 border rounded-2xl outline-none text-lg font-bold" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea required rows={4} placeholder="Describe the problem in detail..." className="w-full px-6 py-4 bg-slate-50 border rounded-2xl outline-none resize-none" value={description} onChange={e => setDescription(e.target.value)}></textarea>

        <button disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
          {loading ? 'AI Analyzing & Submitting...' : 'File Official Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportIssue;
