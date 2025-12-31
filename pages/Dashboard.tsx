import React, { useState, useEffect, useRef } from 'react';
import { User, Issue, UserRole, IssueStatus, EmailNotification } from '../types.ts';
import { storage } from '../services/storageService.ts';
import { composeSmartNotification } from '../services/ai.ts';
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
  const [viewMode, setViewMode] = useState<'LIST' | 'MAP'>('LIST');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const isCouncillor = user.role === UserRole.COUNCILLOR;
  const activeWard = WARDS.find(w => w.name === user.ward);

  useEffect(() => {
    const allIssues = storage.getIssues();
    const filtered = user.role === UserRole.CITIZEN 
      ? allIssues.filter(i => i.reportedById === user.id)
      : allIssues.filter(i => i.ward === user.ward);
    setIssues(filtered);
  }, [user]);

  const filteredIssues = filter === 'ALL' ? issues : issues.filter(i => i.status === filter);

  // Map Initialization and Update Logic
  useEffect(() => {
    // Only initialize map if in MAP mode and map element exists
    if (viewMode === 'MAP') {
      // Small timeout to ensure DOM is ready
      const timer = setTimeout(() => {
        if (!mapRef.current && document.getElementById('issues-map')) {
          // Default center (Bengaluru)
          const centerLat = 12.9716;
          const centerLng = 77.5946;
          
          // @ts-ignore
          if (typeof L !== 'undefined') {
            // @ts-ignore
            mapRef.current = L.map('issues-map').setView([centerLat, centerLng], 12);
            
            // @ts-ignore
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
              subdomains: 'abcd',
              maxZoom: 20
            }).addTo(mapRef.current);
          }
        }

        if (mapRef.current) {
          // Clear existing markers
          markersRef.current.forEach(m => m.remove());
          markersRef.current = [];

          const bounds: any[] = [];

          filteredIssues.forEach(issue => {
            if (issue.location && issue.location.lat && issue.location.lng) {
              const color = getStatusHexColor(issue.status);
              
              // @ts-ignore
              const icon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${color}; width: 14px; height: 14px; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7],
                popupAnchor: [0, -10]
              });

              // @ts-ignore
              const marker = L.marker([issue.location.lat, issue.location.lng], { icon })
                .addTo(mapRef.current)
                .bindPopup(`
                  <div class="font-sans min-w-[200px]">
                    <div class="flex items-center justify-between gap-2 mb-2">
                      <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded border" style="background-color: ${color}15; color: ${color}; border-color: ${color}30">
                        ${issue.status.replace('_', ' ')}
                      </span>
                      <span class="text-[10px] font-bold text-slate-400">${issue.category}</span>
                    </div>
                    <h4 class="font-bold text-sm text-slate-900 leading-tight mb-1">${issue.title}</h4>
                    <p class="text-xs text-slate-500 line-clamp-2 mb-2">${issue.description}</p>
                    ${issue.image ? `<div class="w-full h-24 rounded-lg bg-slate-100 bg-cover bg-center mb-2" style="background-image: url('${issue.image}')"></div>` : ''}
                    <div class="text-[9px] font-medium text-slate-400">Reported by: ${issue.reportedBy}</div>
                  </div>
                `, { className: 'custom-popup' });
              
              markersRef.current.push(marker);
              bounds.push([issue.location.lat, issue.location.lng]);
            }
          });

          if (bounds.length > 0) {
            // @ts-ignore
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [viewMode, filteredIssues]);

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

  const getStatusHexColor = (status: IssueStatus) => {
    switch(status) {
      case IssueStatus.PENDING: return '#b45309'; // amber-700
      case IssueStatus.IN_PROGRESS: return '#1d4ed8'; // blue-700
      case IssueStatus.RESOLVED: return '#047857'; // emerald-700
      case IssueStatus.REJECTED: return '#be123c'; // rose-700
      default: return '#6366f1';
    }
  };

  const getStatusColorClass = (status: IssueStatus) => {
    switch(status) {
      case IssueStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case IssueStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 border-blue-200';
      case IssueStatus.RESOLVED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case IssueStatus.REJECTED: return 'bg-rose-100 text-rose-700 border-rose-200';
    }
  };

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

      {/* Hero Stats Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden flex items-center min-h-[180px]">
          <img 
            src="https://images.unsplash.com/photo-1598124146163-36819847286d?auto=format&fit=crop&q=80&w=1200" 
            className="absolute inset-0 w-full h-full object-cover opacity-30" 
            alt="Bengaluru Street Scene" 
          />
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Building a Smarter {user.ward.split(' ')[0]}</h2>
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

      {/* View Switcher and Filters */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {['ALL', ...Object.values(IssueStatus)].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s as any)}
                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${filter === s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex p-1 bg-slate-100 rounded-2xl">
            <button 
              onClick={() => setViewMode('LIST')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'LIST' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              <i className="fas fa-list-ul"></i> List
            </button>
            <button 
              onClick={() => setViewMode('MAP')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'MAP' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              <i className="fas fa-map-marked-alt"></i> Map
            </button>
          </div>
        </div>

        {viewMode === 'LIST' ? (
          filteredIssues.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredIssues.map(issue => (
                <div key={issue.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group animate-slide-up">
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
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-lg ${getStatusColorClass(issue.status)}`}>
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
                      <h3 className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{issue.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{issue.description}</p>
                    </div>

                    {issue.aiAnalysis && (
                      <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 relative overflow-hidden">
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
                        className="flex-grow py-3.5 bg-indigo-600 text-white rounded-xl font-black text-[11px] uppercase tracking-wider hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                      >
                        {updatingId === issue.id ? <i className="fas fa-circle-notch fa-spin"></i> : (issue.status === IssueStatus.PENDING ? 'Start Fix' : 'Resolve')}
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
            <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
              <i className="fas fa-folder-open text-5xl text-slate-200 mb-4"></i>
              <p className="text-slate-400 font-black uppercase tracking-widest">No reports in this category</p>
            </div>
          )
        ) : (
          <div className="relative animate-slide-up">
            <div id="issues-map" className="border-2 border-white shadow-2xl bg-slate-100 h-[600px] rounded-[2.5rem]"></div>
            {filteredIssues.filter(i => !i.location).length > 0 && (
              <div className="absolute bottom-6 left-6 z-[20] bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-[10px] font-bold text-slate-500 border border-slate-200 shadow-lg">
                <i className="fas fa-info-circle mr-2 text-indigo-500"></i>
                {filteredIssues.filter(i => !i.location).length} issues missing GPS data hidden from map
              </div>
            )}
          </div>
        )}
      </div>

      {/* Secondary Information Section */}
      <div className="grid md:grid-cols-2 gap-8 pt-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-6 items-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
               <i className="fas fa-chart-line"></i>
            </div>
            <div>
               <h3 className="font-black text-slate-900">Weekly Progress</h3>
               <p className="text-xs font-medium text-slate-500 leading-relaxed">Ward responsiveness is up by <span className="text-emerald-600 font-bold">12%</span> this week. Active citizen reporting is driving faster repairs.</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-6 items-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
               <i className="fas fa-shield-heart"></i>
            </div>
            <div>
               <h3 className="font-black text-slate-900">Safety Verification</h3>
               <p className="text-xs font-medium text-slate-500 leading-relaxed">All resolved issues are verified by AI analysis of follow-up photos before closure.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;