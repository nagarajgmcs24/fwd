import React, { useState, useEffect } from 'react';
import { User, Issue, UserRole, IssueStatus, EmailNotification } from '../types.ts';
import { storage } from '../services/storageService.ts';
import { composeSmartNotification } from '../services/aiService.ts';
import { View } from '../App.tsx';
import { WARDS } from '../constants/wards.ts';

interface DashboardProps {
  user: User;
  onNavigate: (view: View) => void;
  onNotification: (n: EmailNotification) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onNotification }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filter, setFilter] = useState<IssueStatus | 'ALL'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const activeWard = WARDS.find(w => w.name === user.ward);
  const isCouncillor = user.role === UserRole.COUNCILLOR;

  useEffect(() => {
    const allIssues = storage.getIssues();
    const filtered = user.role === UserRole.CITIZEN 
      ? allIssues.filter(i => i.reportedById === user.id)
      : allIssues.filter(i => i.ward === user.ward);
    setIssues(filtered);
  }, [user]);

  const handleStatusChange = async (id: string, status: IssueStatus) => {
    setUpdatingId(id);
    storage.updateIssueStatus(id, status);
    const updatedIssue = storage.getIssues().find(i => i.id === id);
    
    if (updatedIssue) {
      const notification = await composeSmartNotification(
        'STATUS_CHANGE', 
        { issue: updatedIssue, email: updatedIssue.reportedByEmail }
      );
      if (notification) {
        onNotification(notification);
      }
    }
    
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    setUpdatingId(null);
  };

  const getStatusColor = (status: IssueStatus) => {
    switch(status) {
      case IssueStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case IssueStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 border-blue-200';
      case IssueStatus.RESOLVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case IssueStatus.REJECTED: return 'bg-rose-100 text-rose-700 border-rose-200';
    }
  };

  const filteredIssues = filter === 'ALL' ? issues : issues.filter(i => i.status === filter);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isCouncillor ? 'Ward Governance' : 'My Community Reports'}
          </h1>
          <p className="text-slate-500 font-medium">Monitoring issues in <span className="text-indigo-600">{user.ward}</span></p>
        </div>
        {!isCouncillor && (
          <button 
            onClick={() => onNavigate('report')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95"
          >
            <i className="fas fa-plus"></i> New Report
          </button>
        )}
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex items-center min-h-[180px]">
          <img 
            src="https://images.unsplash.com/photo-1598124146163-36819847286d?auto=format&fit=crop&q=80&w=1200" 
            className="absolute inset-0 w-full h-full object-cover opacity-30" 
            alt="Bengaluru Street Scene" 
          />
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-black">Building a Smarter {user.ward.split(' ')[0]}</h2>
            <p className="text-slate-300 max-w-md text-sm leading-relaxed">
              Transparent collaboration between citizens and local administration to solve hyper-local infrastructure gaps.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
           <div className="relative mb-3">
             <img src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=300" className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white" alt="Impact" />
             <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <i className="fas fa-bolt text-xs"></i>
             </div>
           </div>
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Resolution Speed</p>
           <p className="text-2xl font-black text-emerald-600">4.2 Days</p>
        </div>
      </div>

      {!isCouncillor && activeWard && (
        <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-8 overflow-hidden relative group">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform">
            <i className="fas fa-landmark"></i>
          </div>
          <div className="flex-grow text-center md:text-left z-10">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-center md:justify-start gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               Your Assigned Ward Councillor
            </h2>
            <div className="space-y-3">
              <p className="text-2xl font-black text-slate-900">{activeWard.councillor}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-center md:justify-start gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <i className="fas fa-envelope text-indigo-500"></i>
                  <span className="text-sm font-semibold text-slate-600">{activeWard.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <i className="fas fa-building text-indigo-500"></i>
                  <span className="text-sm font-semibold text-slate-600">{activeWard.office}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {['ALL', ...Object.values(IssueStatus)].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as any)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${filter === s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredIssues.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredIssues.map(issue => (
              <div key={issue.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group">
                <div className="aspect-[16/10] overflow-hidden relative bg-slate-100">
                  {issue.image ? (
                    <img src={issue.image} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                      <i className="fas fa-image text-5xl opacity-20"></i>
                      <span className="text-[10px] font-bold uppercase tracking-widest">No evidence photo</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-lg ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 space-y-4 flex-grow">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.15em]">
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{issue.category}</span>
                    <span className="text-slate-400">{new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 leading-tight">{issue.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{issue.description}</p>
                  </div>

                  {issue.aiAnalysis && (
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 relative">
                      <p className="text-[10px] font-black text-indigo-500 uppercase mb-1.5 flex items-center gap-2">
                        <i className="fas fa-microchip"></i> AI Insight
                      </p>
                      <p className="text-[11px] text-indigo-900/80 font-medium leading-relaxed">"{issue.aiAnalysis}"</p>
                    </div>
                  )}
                </div>

                {isCouncillor && issue.status !== IssueStatus.RESOLVED && issue.status !== IssueStatus.REJECTED && (
                  <div className="px-6 pb-6 pt-2 flex gap-3">
                    <button 
                      disabled={updatingId === issue.id}
                      onClick={() => handleStatusChange(issue.id, issue.status === IssueStatus.PENDING ? IssueStatus.IN_PROGRESS : IssueStatus.RESOLVED)}
                      className="flex-grow py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
                    >
                      {issue.status === IssueStatus.PENDING ? 'Start Fix' : 'Resolve'}
                    </button>
                    <button 
                      disabled={updatingId === issue.id}
                      onClick={() => handleStatusChange(issue.id, IssueStatus.REJECTED)}
                      className="w-14 h-12 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold uppercase tracking-widest">No reports in this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;