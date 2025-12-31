
import React, { useState, useEffect } from 'react';
import { User, Issue, UserRole, IssueStatus } from '../types';
import { storage } from '../services/storageService';
import { composeAndSendEmail, EmailNotification } from '../services/notificationService';
import { View } from '../App';
import { WARDS } from '../constants/wards';

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
      // Trigger Smart Notification to Citizen
      const notification = await composeAndSendEmail(
        updatedIssue.reportedByEmail, 
        'STATUS_CHANGE', 
        { issue: updatedIssue }
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
        {user.role === UserRole.CITIZEN && (
          <button 
            onClick={() => onNavigate('report')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:scale-[1.02] active:scale-95"
          >
            <i className="fas fa-plus"></i> New Report
          </button>
        )}
      </header>

      {/* Hero Visual for Dashboard */}
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

      {/* Citizen View: Councillor Information */}
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
          <div className="absolute right-0 top-0 h-full w-48 overflow-hidden hidden lg:block opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-[0.07]">
             <img src="https://images.unsplash.com/photo-1541829070764-84a7d30dee6b?auto=format&fit=crop&q=80&w=400" className="h-full w-full object-cover" alt="Bengaluru Architecture Decorative" />
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
          <p className="text-xs font-bold text-slate-400 hidden sm:block">
            Found {filteredIssues.length} reports
          </p>
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
                  {issue.priority === 'High' && (
                    <div className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-lg flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                       Urgent
                    </div>
                  )}
                </div>
                
                <div className="p-6 space-y-4 flex-grow">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.15em]">
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{issue.category}</span>
                    <span className="text-slate-400">{new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{issue.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{issue.description}</p>
                  </div>

                  {issue.location && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      <i className="fas fa-location-dot text-indigo-500"></i>
                      <span>GPS: {issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)}</span>
                    </div>
                  )}

                  {isCouncillor && (
                    <div className="bg-slate-900 p-4 rounded-2xl text-[10px] space-y-2 border border-slate-800 shadow-inner">
                      <p className="font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">Citizen Contact</p>
                      <div className="space-y-1">
                        <p className="text-slate-200 flex items-center gap-2">
                          <i className="fas fa-user-circle text-indigo-400"></i> {issue.reportedBy}
                        </p>
                        <p className="text-indigo-300 font-medium flex items-center gap-2">
                          <i className="fas fa-envelope text-indigo-400"></i> {issue.reportedByEmail}
                        </p>
                      </div>
                    </div>
                  )}

                  {issue.aiAnalysis && (
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 relative overflow-hidden">
                      <div className="absolute right-2 top-2 opacity-5">
                         <i className="fas fa-robot text-2xl"></i>
                      </div>
                      <p className="text-[10px] font-black text-indigo-500 uppercase mb-1.5 flex items-center gap-2">
                        <i className="fas fa-microchip"></i> AI Insight
                      </p>
                      <p className="text-[11px] text-indigo-900/80 leading-relaxed font-medium">"{issue.aiAnalysis}"</p>
                    </div>
                  )}
                </div>

                {isCouncillor && issue.status !== IssueStatus.RESOLVED && issue.status !== IssueStatus.REJECTED && (
                  <div className="px-6 pb-6 pt-2 flex gap-3">
                    <button 
                      disabled={updatingId === issue.id}
                      onClick={() => handleStatusChange(issue.id, issue.status === IssueStatus.PENDING ? IssueStatus.IN_PROGRESS : IssueStatus.RESOLVED)}
                      className={`flex-grow py-3.5 rounded-xl font-black text-[11px] uppercase tracking-wider text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${updatingId === issue.id ? 'opacity-50 cursor-not-allowed' : (issue.status === IssueStatus.PENDING ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100')}`}
                    >
                      {updatingId === issue.id ? (
                        <i className="fas fa-circle-notch fa-spin"></i>
                      ) : (
                        <>
                          <i className={`fas ${issue.status === IssueStatus.PENDING ? 'fa-play' : 'fa-check-double'}`}></i>
                          {issue.status === IssueStatus.PENDING ? 'Start Fix' : 'Resolve'}
                        </>
                      )}
                    </button>
                    <button 
                      disabled={updatingId === issue.id}
                      onClick={() => handleStatusChange(issue.id, IssueStatus.REJECTED)}
                      className="w-14 h-12 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center shadow-sm active:scale-90 disabled:opacity-50"
                      title="Reject Report"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
                
                {/* Status indicator for resolved/rejected */}
                {(issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.REJECTED) && (
                   <div className="px-6 pb-6 pt-2">
                      <div className={`w-full py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-[0.2em] text-center ${issue.status === IssueStatus.RESOLVED ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                         <i className={`fas ${issue.status === IssueStatus.RESOLVED ? 'fa-check-circle' : 'fa-ban'} mr-2`}></i>
                         Case {issue.status}
                      </div>
                   </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center px-8">
            <div className="relative mb-8">
              <img 
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400" 
                className="w-48 h-48 object-cover rounded-[2.5rem] opacity-40 grayscale" 
                alt="No reports" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>
            <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No Reports Found</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-sm">Everything looks clear in your current view. New reports will appear here as they are filed.</p>
          </div>
        )}
      </div>

      {/* Secondary Illustrative Section for Dashboard */}
      <div className="grid md:grid-cols-2 gap-8 pt-10">
         <div className="bg-indigo-600 p-1 rounded-[2.5rem] shadow-xl shadow-indigo-100 group">
           <div className="bg-white p-8 rounded-[2.3rem] flex gap-6 items-center">
              <img src="https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&q=80&w=300" className="w-24 h-24 rounded-[1.8rem] object-cover shadow-lg group-hover:rotate-3 transition-transform" alt="Performance Stats" />
              <div>
                 <h3 className="font-black text-slate-900 text-lg">City-wide Ranking</h3>
                 <p className="text-xs font-medium text-slate-500 leading-relaxed">Your ward is currently <span className="text-indigo-600 font-bold">#4 in Bengaluru</span> for infrastructure responsiveness. Keep up the momentum!</p>
              </div>
           </div>
         </div>
         <div className="bg-emerald-600 p-1 rounded-[2.5rem] shadow-xl shadow-emerald-100 group">
           <div className="bg-white p-8 rounded-[2.3rem] flex gap-6 items-center">
              <img src="https://images.unsplash.com/photo-1596760411126-af948542121c?auto=format&fit=crop&q=80&w=300" className="w-24 h-24 rounded-[1.8rem] object-cover shadow-lg group-hover:-rotate-3 transition-transform" alt="Community Pride" />
              <div>
                 <h3 className="font-black text-slate-900 text-lg">Citizen Heroes</h3>
                 <p className="text-xs font-medium text-slate-500 leading-relaxed">Active contributors in <span className="text-emerald-600 font-bold">{user.ward}</span> are earning recognition points. Check your community standing.</p>
              </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
