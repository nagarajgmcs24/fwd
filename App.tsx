import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import Auth from './pages/Auth.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ReportIssue from './pages/ReportIssue.tsx';
import { User, EmailNotification } from './types.ts';
import { storage } from './services/storageService.ts';

export type View = 'home' | 'login' | 'signup' | 'dashboard' | 'report' | 'forgot';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(storage.getCurrentUser());
  const [view, setView] = useState<View>(user ? 'dashboard' : 'home');
  const [toast, setToast] = useState<EmailNotification | null>(null);

  useEffect(() => { 
    storage.seedData(); 
  }, []);

  const handleNotify = (n: EmailNotification) => {
    setToast(n);
    setTimeout(() => setToast(null), 5000);
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
      
      {(view === 'login' || view === 'signup' || view === 'forgot') && (
        <Auth 
          mode={view as 'login' | 'signup' | 'forgot'} 
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
        <div className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white p-6 rounded-2xl shadow-2xl border border-white/10 max-w-xs animate-slide-in">
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              toast.type === 'SECURITY' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
            }`}>
              <i className={`fas ${toast.type === 'SECURITY' ? 'fa-shield-halved' : 'fa-envelope-open-text'}`}></i>
            </div>
            <div className="flex-grow">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">
                {toast.type === 'SECURITY' ? 'Security Alert' : 'Ward Notification'}
              </p>
              <p className="font-bold text-sm leading-tight mb-2">{toast.subject}</p>
              <p className="text-[10px] text-slate-400 italic line-clamp-2">{toast.body.substring(0, 100)}...</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;