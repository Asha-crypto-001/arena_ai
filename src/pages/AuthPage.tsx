import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Lock, Mail, User, Phone, CheckCircle2,
  AlertCircle, ArrowRight, GraduationCap, BookOpen, MapPin
} from 'lucide-react';

interface AuthPageProps {
  onSuccess: (role: string) => void;
  defaultMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  defaultMode = 'login'
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [role, setRole] = useState<'learner' | 'educator'>('learner');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+256 ');
  const [location, setLocation] = useState('Mbarara City');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'login') {
        const loggedInUser = await login(email, password);
        onSuccess(loggedInUser.role);
      } else {
        const newUser = await register({
          name,
          email,
          password,
          role,
          phone,
          location
        });
        onSuccess(newUser.role);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setMode('login');
    setEmail('ashabahebwahassan665@gmail.com');
    setPassword('');
  };

  const fillEducatorCredentials = () => {
    setMode('login');
    setEmail('mukasa.tailor@iskilllink.ug');
    setPassword('');
  };

  const fillLearnerCredentials = () => {
    setMode('login');
    setEmail('sarah.namubiru@gmail.com');
    setPassword('');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
          iS
        </div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {mode === 'login' ? 'Sign In to iSkillLink' : 'Create an Account'}
        </h1>
        <p className="text-xs text-gray-500">
          Where Skills Meet Opportunity • Mbarara, Uganda
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-5">
        {/* Mode Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Create New Account
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <>
              {/* Role Picker */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">Account Role:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('learner')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                      role === 'learner'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    <span>Student / Learner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('educator')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition ${
                      role === 'educator'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    <span>Educator / Artisan</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Namubiru"
                    className="w-full p-2.5 pl-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    required
                  />
                  <User className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Mobile Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+256 70X XXX XXX"
                    className="w-full p-2.5 pl-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    required
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Location / Division</label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mbarara City, Kakoba, Kampala..."
                    className="w-full p-2.5 pl-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                    required
                  />
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-2.5 pl-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                required
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pl-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                required
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Helper */}
        <div className="pt-4 border-t border-gray-100 space-y-2">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block text-center">
            Default Platform Accounts
          </span>
          <div className="space-y-1.5 text-xs">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-left flex items-center justify-between transition shadow-sm"
            >
              <div>
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ashabahebwa Hassan (Admin & Founder)</span>
                </div>
                <div className="text-[10px] text-slate-400">ashabahebwahassan665@gmail.com</div>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-slate-900">
                ADMIN
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillEducatorCredentials}
                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-left border border-emerald-200 transition"
              >
                <div className="font-bold text-emerald-950">Joseph Mukasa</div>
                <div className="text-[10px] text-emerald-800">Verified Tailor Educator</div>
              </button>

              <button
                type="button"
                onClick={fillLearnerCredentials}
                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-left border border-blue-200 transition"
              >
                <div className="font-bold text-blue-950">Sarah Namubiru</div>
                <div className="text-[10px] text-blue-800">Active Student</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
