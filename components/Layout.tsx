
import React from 'react';
import { User } from '../types';
import { View } from '../App';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: View) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, onNavigate, children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button 
              onClick={() => onNavigate(user ? 'dashboard' : 'home')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <i className="fas fa-city text-2xl"></i>
              <span className="font-bold text-xl tracking-tight">Fix My Ward</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-indigo-200">{user.role} • {user.ward}</p>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="bg-indigo-800 hover:bg-indigo-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => onNavigate('login')}
                    className="text-sm font-medium hover:text-indigo-200"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => onNavigate('signup')}
                    className="bg-white text-indigo-700 hover:bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-slate-100 border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Fix My Ward. Strengthening community through transparency.</p>
      </footer>
    </div>
  );
};

export default Layout;
