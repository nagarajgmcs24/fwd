import React, { useState } from 'react';
import { UserRole, User } from '../types.ts';
import { storage } from '../services/storageService.ts';
import { WARDS } from '../constants/wards.ts';
import { composeSmartNotification } from '../services/aiService.ts';
import { View } from '../App.tsx';

interface AuthProps {
  mode: 'login' | 'signup' | 'forgot';
  onAuthSuccess: (user: User) => void;
  onNavigate: (view: View) => void;
  onNotification: (n: any) => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onAuthSuccess, onNavigate, onNotification }) => {
  const [role, setRole] = useState<UserRole>(UserRole.CITIZEN);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [ward, setWard] = useState(WARDS[0].name);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const users = storage.getUsers();
        if (users.some(u => u.username === username || u.email === email)) {
          throw new Error('Username or email already exists.');
        }

        const newUser: User = {
          id: Math.random().toString(36).substring(2, 9),
          username,
          name,
          email,
          role,
          ward,
          password
        };

        storage.saveUser(newUser);
        onAuthSuccess(newUser);
      } else {
        const users = storage.getUsers();
        const user = users.find(u => (u.username === username || u.email === username) && u.password === password);

        if (!user) {
          throw new Error('Invalid credentials.');
        }

        if (user.role !== role) {
          throw new Error(`This account is registered as a ${user.role}.`);
        }

        // Trigger AI Security Notification
        const n = await composeSmartNotification('LOGIN', { user, email: user.email });
        if (n) onNotification(n);

        onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-slide-in">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 mb-2">
          {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
        </h2>
        <p className="text-slate-400 font-medium">Fix My Ward • Bengaluru Infrastructure</p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8">
        <button 
          onClick={() => setRole(UserRole.CITIZEN)} 
          className={`py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${role === UserRole.CITIZEN ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Citizen
        </button>
        <button 
          onClick={() => setRole(UserRole.COUNCILLOR)} 
          className={`py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${role === UserRole.COUNCILLOR ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Councillor
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100 flex items-center gap-3">
          <i className="fas fa-circle-exclamation text-base"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
              <input 
                required type="text" placeholder="e.g. Rahul Kumar" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20" 
                value={name} onChange={e => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <input 
                required type="email" placeholder="rahul@example.com" 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20" 
                value={email} onChange={e => setEmail(e.target.value)} 
              />
            </div>
          </>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username</label>
          <input 
            required type="text" placeholder="Choose a username" 
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20" 
            value={username} onChange={e => setUsername(e.target.value)} 
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
          <input 
            required type="password" placeholder="••••••••" 
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20" 
            value={password} onChange={e => setPassword(e.target.value)} 
          />
        </div>

        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Ward</label>
            <select 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" 
              value={ward} onChange={e => setWard(e.target.value)}
            >
              {WARDS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
          </div>
        )}

        <button 
          disabled={loading} 
          className="w-full py-5 bg-indigo-600 text-white font-black rounded-[1.5rem] hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 mt-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <i className="fas fa-circle-notch fa-spin"></i> Processing...
            </span>
          ) : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-8 text-center space-y-4">
        {mode === 'login' ? (
          <p className="text-sm font-medium text-slate-500">
            Don't have an account? {' '}
            <button onClick={() => onNavigate('signup')} className="text-indigo-600 font-black hover:underline">Sign Up</button>
          </p>
        ) : (
          <p className="text-sm font-medium text-slate-500">
            Already have an account? {' '}
            <button onClick={() => onNavigate('login')} className="text-indigo-600 font-black hover:underline">Sign In</button>
          </p>
        )}
        <button onClick={() => onNavigate('home')} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2 mx-auto">
          <i className="fas fa-arrow-left"></i> Back to Home
        </button>
      </div>
    </div>
  );
};

export default Auth;