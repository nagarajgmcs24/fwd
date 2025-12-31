
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import { User } from './types';
import { storage } from './services/storageService';
import { EmailNotification } from './services/notificationService';

export type View = 'home' | 'login' | 'signup' | 'dashboard' | 'report' | 'forgot';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(storage.getCurrentUser());
  const [currentView, setCurrentView] = useState<View>(user ? 'dashboard' : 'home');
  const [toast, setToast] = useState<EmailNotification | null>(null);

  useEffect(() => {
    storage.seedData();
  }, []);

  const showEmailToast = (notification: EmailNotification) => {
    setToast(notification);
    setTimeout(() => setToast(null), 6000);
  };

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    storage.setCurrentUser(u);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    storage.setCurrentUser(null);
    setCurrentView('home');
  };

  const navigate = (view: View) => {
    setCurrentView(view);
  };

  const renderContent = () => {
    if (currentView === 'home') return <Home onNavigate={navigate} />;
    
    // Auth-related views
    if (['login', 'signup', 'forgot'].includes(currentView) && !user) {
      return (
        <Auth 
          mode={currentView as any} 
          onAuthSuccess={handleAuthSuccess} 
          onNavigate={(v) => navigate(v as View)}
          onNotification={showEmailToast}
        />
      );
    }

    if (!user) {
      setCurrentView('login');
      return null;
    }

    if (currentView === 'dashboard') return <Dashboard user={user} onNavigate={navigate} onNotification={showEmailToast} />;
    if (currentView === 'report') return <ReportIssue user={user} onSuccess={() => navigate('dashboard')} onNavigate={navigate} onNotification={showEmailToast} />;

    return <Dashboard user={user} onNavigate={navigate} onNotification={showEmailToast} />;
  };

  return (
    <Layout user={user} onLogout={handleLogout} onNavigate={navigate}>
      {renderContent()}

      {/* Global Email Notification Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-bounce-in max-w-sm w-full">
          <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-2xl border border-white/10 backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${toast.type === 'SECURITY' ? 'bg-rose-600 shadow-rose-500/20' : 'bg-indigo-600 shadow-indigo-500/20'}`}>
                <i className={`fas ${toast.type === 'SECURITY' ? 'fa-shield-halved' : 'fa-paper-plane'} animate-pulse`}></i>
              </div>
              <div className="space-y-1">
                <p className={`text-[10px] font-black uppercase tracking-widest ${toast.type === 'SECURITY' ? 'text-rose-400' : 'text-indigo-400'}`}>
                  {toast.type === 'SECURITY' ? 'System Alert' : 'Notification Dispatched'}
                </p>
                <h4 className="font-bold text-sm">To: {toast.to}</h4>
                <div className="mt-2 pt-2 border-t border-white/5">
                  <p className="text-[10px] text-slate-500 italic line-clamp-2">
                    "{toast.subject}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes bounce-in {
          0% { transform: translateY(100%) scale(0.9); opacity: 0; }
          70% { transform: translateY(-10px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </Layout>
  );
};

export default App;
