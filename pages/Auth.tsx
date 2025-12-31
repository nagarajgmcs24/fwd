
import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import { storage } from '../services/storageService';
import { View } from '../App';
import { WARDS } from '../constants/wards';
import { composeAndSendEmail, EmailNotification } from '../services/notificationService';

interface AuthProps {
  mode: 'login' | 'signup' | 'forgot';
  onAuthSuccess: (user: User) => void;
  onNavigate: (view: View | 'login' | 'signup' | 'forgot') => void;
  onNotification: (n: EmailNotification) => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onAuthSuccess, onNavigate, onNotification }) => {
  const [role, setRole] = useState<UserRole>(UserRole.CITIZEN);
  const [identifier, setIdentifier] = useState(''); // Email or Username
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [ward, setWard] = useState(WARDS[0].name);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setError('');
  }, [mode, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (mode === 'forgot') {
      const user = storage.getUsers().find(u => u.email === email);
      if (user) {
        const resetLink = `https://fixmyward.in/reset/${Math.random().toString(36).substring(7)}`;
        const n = await composeAndSendEmail(user.email, 'PASSWORD_RESET', { user, resetLink });
        if (n) onNotification(n);
        alert("Reset link sent to your email!");
        onNavigate('login');
      } else {
        setError('No account found with that email.');
      }
      setIsLoading(false);
      return;
    }

    // Simulate network delay
    setTimeout(async () => {
      if (mode === 'signup') {
        const users = storage.getUsers();
        if (users.find(u => u.email === email || u.username === username)) {
          setError('Username or Email already taken.');
          setIsLoading(false);
          return;
        }
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          username,
          name,
          email,
          role,
          ward,
          password
        };
        storage.saveUser(newUser);
        
        const n = await composeAndSendEmail(newUser.email, 'LOGIN_ALERT', { user: newUser });
        if (n) onNotification(n);
        
        onAuthSuccess(newUser);
      } else {
        const user = storage.getUsers().find(u => u.email === identifier || u.username === identifier);
        
        if (user) {
          if (user.role !== role) {
            setError(`This account is registered as a ${user.role === UserRole.CITIZEN ? 'Citizen' : 'Councillor'}. Please switch the toggle above.`);
            setIsLoading(false);
            return;
          }

          if (user.password === password) {
            const n = await composeAndSendEmail(user.email, 'LOGIN_ALERT', { user });
            if (n) onNotification(n);
            onAuthSuccess(user);
          } else {
            setError('Incorrect password. Please try again.');
          }
        } else {
          setError('Invalid credentials. User not found.');
        }
      }
      setIsLoading(false);
    }, 800);
  };

  const isCitizen = role === UserRole.CITIZEN;

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[650px] my-8">
      <div className={`md:w-5/12 p-12 text-white relative flex flex-col justify-between transition-colors duration-500 overflow-hidden ${isCitizen ? 'bg-indigo-600' : 'bg-slate-900'}`}>
        <img 
          src={isCitizen ? "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=800" : "https://images.unsplash.com/photo-1541829070764-84a7d30dee6b?auto=format&fit=crop&q=80&w=800"} 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" 
          alt="Community Background"
        />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <i className={`fas ${isCitizen ? 'fa-house-chimney-user' : 'fa-building-columns'} text-3xl`}></i>
            <span className="font-bold text-2xl tracking-tight">Fix My Ward</span>
          </div>
          <h2 className="text-4xl font-black mb-4 leading-tight">
            {mode === 'login' ? 'Namaste, welcome back.' : mode === 'forgot' ? 'Security & Access Control' : 'Join the movement for a better city.'}
          </h2>
          <p className="text-indigo-100 text-lg opacity-90">
            {isCitizen 
              ? "Empowering citizens to take charge of their neighborhood's development."
              : "Tools for Bengaluru's elected representatives to serve their wards better."}
          </p>
        </div>
      </div>

      <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white relative">
        <div className="max-w-md mx-auto w-full">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              {mode === 'login' ? 'Sign In' : mode === 'forgot' ? 'Reset Password' : 'Create Account'}
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Login as</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                  <button type="button" onClick={() => setRole(UserRole.CITIZEN)} className={`py-2 text-xs font-bold rounded-lg transition-all ${isCitizen ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Citizen</button>
                  <button type="button" onClick={() => setRole(UserRole.COUNCILLOR)} className={`py-2 text-xs font-bold rounded-lg transition-all ${!isCitizen ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>Councillor</button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-xs flex items-center gap-2 animate-shake">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Username</label>
                  <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="@username" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="John Doe" />
                </div>
              </>
            )}

            {mode === 'login' ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Username or Email</label>
                <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="Enter credentials" />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="email@example.com" />
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" placeholder="••••••••" />
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Ward</label>
                <select value={ward} onChange={(e) => setWard(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer font-bold">
                  {WARDS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
              </div>
            )}

            <button type="submit" disabled={isLoading} className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 mt-4 ${isLoading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : (isCitizen ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' : 'bg-slate-900 hover:bg-black text-white shadow-slate-200')}`}>
              {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : (mode === 'login' ? 'Secure Login' : mode === 'forgot' ? 'Dispatch Reset Link' : 'Create Identity')}
            </button>

            <div className="pt-6 text-center space-y-2">
              <p className="text-slate-500 text-xs">
                {mode === 'login' ? "New here? " : "Know your way? "}
                <button type="button" onClick={() => onNavigate(mode === 'login' ? 'signup' : 'login')} className="font-black text-indigo-600 hover:underline">{mode === 'login' ? 'Sign Up' : 'Sign In'}</button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
