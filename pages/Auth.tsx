import React, { useState } from 'react';
import { UserRole, User } from '../types.ts';
import { apiService } from '../services/apiService.ts';
import { WARDS } from '../constants/wards.ts';
import { View } from '../App.tsx';

interface AuthProps {
  mode: 'login' | 'signup';
  onAuthSuccess: (user: User) => void;
  onNavigate: (view: View) => void;
  onNotification: (n: any) => void;
}

const Auth: React.FC<AuthProps> = ({ mode, onAuthSuccess, onNavigate, onNotification }) => {
  const [role, setRole] = useState<UserRole>(UserRole.CITIZEN);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ward, setWard] = useState(WARDS[0].name);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const users = storage.getUsers();
      if (mode === 'signup') {
        if (users.some(u => u.username === username)) throw new Error('Username taken');
        
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          username, name, email, role, ward, password
        };
        storage.saveUser(newUser);
        onAuthSuccess(newUser);
      } else {
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) throw new Error('Invalid credentials');
        if (user.role !== role) throw new Error(`Account registered as ${user.role}`);

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
    <div className="max-w-md mx-auto bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-slide-up">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-900 mb-2">{mode === 'login' ? 'Welcome' : 'Join Us'}</h2>
        <p className="text-slate-400 font-medium tracking-tight">Bengaluru Ward Management</p>
      </div>

      <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8">
        <button onClick={() => setRole(UserRole.CITIZEN)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${role === UserRole.CITIZEN ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-500'}`}>Citizen</button>
        <button onClick={() => setRole(UserRole.COUNCILLOR)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${role === UserRole.COUNCILLOR ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500'}`}>Councillor</button>
      </div>

      {error && <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="grid grid-cols-2 gap-4">
            <input required type="text" placeholder="Full Name" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none" value={name} onChange={e => setName(e.target.value)} />
            <input required type="email" placeholder="Email" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        )}
        <input required type="text" placeholder="Username" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none" value={username} onChange={e => setUsername(e.target.value)} />
        <input required type="password" placeholder="Password" className="w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none" value={password} onChange={e => setPassword(e.target.value)} />
        
        {mode === 'signup' && (
          <select className="w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none font-bold" value={ward} onChange={e => setWard(e.target.value)}>
            {WARDS.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
          </select>
        )}

        <button disabled={loading} className="w-full py-5 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50">
          {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Register'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button onClick={() => onNavigate(mode === 'login' ? 'signup' : 'login')} className="text-sm font-bold text-indigo-600 hover:underline">
          {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
