import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import Auth from './pages/Auth.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ReportIssue from './pages/ReportIssue.tsx';
import { User, EmailNotification } from './types.ts';
import { storage } from './services/storageService.ts';

export type View = 'home' | 'login' | 'signup' | 'dashboard' | 'report';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(storage.getCurrentUser());
  const [view, setView] = useState<View>(user ? 'dashboard' : 'home');
  const [toast, setToast] = useState<EmailNotification | null>(null);

  useEffect(() => { 
    storage.seedData(); 
  }, []);

  const handleNotify = (n: EmailNotification) => {
    setToast(n);
    setTimeout(() => setToast(null), 6000);
  };

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    storage.setCurrentUser(u);
    setView('dashboard');
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setUser(null);
    setView('home');
  };

  return (
    <Layout user={user} onLogout={handleLogout} onNavigate={(v: View) => setView(v)}>
      {view === 'home' && <Home onNavigate={setView} />}
      
      {(view === 'login' || view === 'signup') && (
        <Auth 
          mode={view} 
          onAuthSuccess={handleAuthSuccess} 
          onNavigate={setView} 
          onNotification={handleNotify} 
        />
      )}
      
      {view === 'dashboard' && user && (
        <Dashboard user={user} onNavigate={setView} onNotification={handleNotify} />
      )}
      
      {view === 'report' && user && (
        <ReportIssue user={user} onSuccess={() => setView('dashboard')} onNavigate={setView} onNotification={handleNotify} />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border border-white/10 max-w-xs animate-slide-up">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              toast.type === 'SECURITY' ? 'bg-rose-500 text-white' : 'bg-indigo-500 text-white'
            }`}>
              <i className={`fas ${toast.type === 'SECURITY' ? 'fa-shield-halved' : 'fa-envelope-open-text'}`}></i>
            </div>
            <div className="flex-grow">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">
                {toast.type === 'SECURITY' ? 'Security Protocol' : 'Ward System Update'}
              </p>
              <p className="font-bold text-sm leading-tight mb-2">{toast.subject}</p>
              <p className="text-[10px] text-slate-400 italic leading-relaxed line-clamp-3">"{toast.body}"</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;