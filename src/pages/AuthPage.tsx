import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Lock, Mail, User, Phone, CheckCircle2,
  AlertCircle, ArrowRight, GraduationCap, BookOpen, MapPin,
  Camera, Upload
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
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        const targetDim = 320;
        canvas.width = targetDim;
        canvas.height = targetDim;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, size, size, 0, 0, targetDim, targetDim);
          setAvatarUrl(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
          location,
          avatar_url: avatarUrl || undefined
        });
        onSuccess(newUser.role);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
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

              {/* Profile Photo (Optional) */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Profile Photo (Optional)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-300 flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-[11px] flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="text-gray-400 hover:text-rose-600 text-[11px]"
                    >
                      Remove
                    </button>
                  )}
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

        <div className="pt-3 border-t border-gray-100 text-center text-xs text-gray-500">
          Protected by iSkillLink Security • Headquartered in Mbarara City
        </div>
      </div>
    </div>
  );
};
