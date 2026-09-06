import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck, Bell, ChevronDown, User, LogOut, CheckCircle2,
  Menu, X, Sparkles, Briefcase, GraduationCap, ArrowRight,
  Settings, MessageSquare, PlusCircle, Phone, Mail, Camera
} from 'lucide-react';
import { ProfilePhotoUploadModal } from './ProfilePhotoUploadModal';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenSkillRequest: () => void;
  onOpenAuth: (defaultMode?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenSkillRequest,
  onOpenAuth
}) => {
  const {
    user,
    logout,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead
  } = useAuth();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const getDashboardTarget = () => {
    if (user?.role === 'admin') return 'admin-dashboard';
    if (user?.role === 'educator') return 'educator-dashboard';
    return 'learner-dashboard';
  };

  const getDashboardLabel = () => {
    if (user?.role === 'admin') return 'Admin Portal';
    if (user?.role === 'educator') return 'Educator Portal';
    return 'Learner Portal';
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        {/* Top Contact & Location Bar */}
        <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 sm:px-8 flex flex-wrap items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              iSkillLink Uganda (HQ: Mbarara City)
            </span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-300">
              Founded by Ashabahebwa Hassan
            </span>
          </div>

          {/* Official contacts */}
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <a
              href="https://wa.me/256744024529"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>+256 744 024 529</span>
            </a>
            <span className="hidden sm:inline text-slate-600">/</span>
            <a
              href="tel:+256772233621"
              className="hidden sm:inline hover:text-emerald-400 transition"
            >
              +256 772 233 621
            </a>
            <span className="hidden lg:inline text-slate-600">|</span>
            <a
              href="mailto:ashabahebwahassan665@gmail.com"
              className="hidden lg:inline hover:text-emerald-400 transition"
            >
              ashabahebwahassan665@gmail.com
            </a>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2.5 text-left focus:outline-none group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-black text-xl tracking-tight shadow-sm group-hover:bg-emerald-800 transition">
                  iS
                </div>
                <div>
                  <div className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                    iSkillLink
                    <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                      UG
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium tracking-tight">
                    Where Skills Meet Opportunity
                  </div>
                </div>
              </button>
            </div>

            {/* Desktop Nav Items */}
            <nav className="hidden lg:flex items-center space-x-1">
              <button
                onClick={() => setCurrentView('find-skill')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentView === 'find-skill' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 hover:text-slate-900 hover:bg-gray-50'
                }`}
              >
                Find a Skill
              </button>

              <button
                onClick={() => setCurrentView('become-educator')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentView === 'become-educator' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 hover:text-slate-900 hover:bg-gray-50'
                }`}
              >
                Become an Educator
              </button>

              <button
                onClick={() => setCurrentView('how-it-works')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentView === 'how-it-works' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 hover:text-slate-900 hover:bg-gray-50'
                }`}
              >
                How It Works
              </button>

              <button
                onClick={() => setCurrentView('about')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentView === 'about' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 hover:text-slate-900 hover:bg-gray-50'
                }`}
              >
                About Us
              </button>

              <button
                onClick={() => setCurrentView('contact')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentView === 'contact' ? 'text-emerald-700 bg-emerald-50' : 'text-gray-700 hover:text-slate-900 hover:bg-gray-50'
                }`}
              >
                Contact
              </button>
            </nav>

            {/* Right Action Area */}
            <div className="hidden sm:flex items-center space-x-3">
              {/* Submit Skill Request CTA Button */}
              <button
                onClick={onOpenSkillRequest}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 transition"
              >
                <PlusCircle className="w-4 h-4 text-emerald-700" />
                <span>Request a Custom Skill</span>
              </button>

              {user ? (
                <>
                  {/* Notifications Popover */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifMenu(!showNotifMenu)}
                      className="p-2 rounded-lg text-gray-600 hover:text-slate-900 hover:bg-gray-100 relative transition"
                      title="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unreadNotificationCount}
                        </span>
                      )}
                    </button>

                    {showNotifMenu && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-50">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                          <span className="font-semibold text-sm text-gray-900">Notifications</span>
                          <span className="text-xs text-gray-500">{notifications.length} total</span>
                        </div>

                        <div className="max-h-72 overflow-y-auto space-y-2">
                          {notifications.length === 0 ? (
                            <div className="text-xs text-gray-500 text-center py-4">No notifications yet</div>
                          ) : (
                            notifications.map(n => (
                              <div
                                key={n.id}
                                onClick={() => {
                                  markNotificationAsRead(n.id);
                                  setCurrentView(getDashboardTarget());
                                  setShowNotifMenu(false);
                                }}
                                className={`p-2.5 rounded-lg text-xs cursor-pointer transition border ${
                                  n.is_read ? 'bg-white border-gray-100 text-gray-600' : 'bg-emerald-50/60 border-emerald-200 text-gray-900 font-medium'
                                }`}
                              >
                                <div className="font-semibold text-gray-900 flex items-center justify-between">
                                  <span>{n.title}</span>
                                  {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                                </div>
                                <p className="mt-1 text-gray-600 text-[11px] leading-relaxed">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Avatar with Click-to-Update Photo */}
                  <div className="relative group flex items-center">
                    <button
                      onClick={() => setShowPhotoModal(true)}
                      className="relative p-0.5 rounded-full ring-2 ring-emerald-600/30 hover:ring-emerald-600 transition flex items-center justify-center"
                      title="Click to update profile photo"
                    >
                      <img
                        src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  </div>

                  {/* Direct Dashboard Entry */}
                  <button
                    onClick={() => setCurrentView(getDashboardTarget())}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg text-white shadow-sm transition ${
                      user.role === 'admin'
                        ? 'bg-slate-900 hover:bg-slate-800'
                        : 'bg-emerald-700 hover:bg-emerald-800'
                    }`}
                  >
                    {user.role === 'admin' && <Settings className="w-3.5 h-3.5" />}
                    {user.role === 'educator' && <GraduationCap className="w-3.5 h-3.5" />}
                    {user.role === 'learner' && <User className="w-3.5 h-3.5" />}
                    <span>{getDashboardLabel()}</span>
                  </button>

                  {/* Sign Out */}
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-3 py-2 text-xs font-semibold rounded-lg text-gray-700 hover:text-slate-900 hover:bg-gray-100 transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm transition"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              {user && (
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="p-0.5 rounded-full ring-1 ring-emerald-600 mr-1"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
            {user && (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-500"
                  />
                  <div>
                    <div className="font-bold text-xs text-gray-900">{user.name}</div>
                    <div className="text-[11px] text-gray-500 capitalize">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={() => { setShowPhotoModal(true); setMobileMenuOpen(false); }}
                  className="px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-[11px] font-bold text-gray-700 flex items-center gap-1 shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Update Photo</span>
                </button>
              </div>
            )}

            <div className="space-y-1">
              <button
                onClick={() => { setCurrentView('find-skill'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Find a Skill
              </button>
              <button
                onClick={() => { setCurrentView('become-educator'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Become an Educator
              </button>
              <button
                onClick={() => { setCurrentView('how-it-works'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                How It Works
              </button>
              <button
                onClick={() => { setCurrentView('about'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                About Us
              </button>
              <button
                onClick={() => { setCurrentView('contact'); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-50"
              >
                Contact
              </button>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              <button
                onClick={() => { onOpenSkillRequest(); setMobileMenuOpen(false); }}
                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-gray-100 text-gray-800 text-center"
              >
                Request a Custom Skill
              </button>

              {user ? (
                <>
                  <button
                    onClick={() => { setCurrentView(getDashboardTarget()); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 px-3 text-xs font-bold rounded-lg bg-emerald-700 text-white text-center"
                  >
                    {getDashboardLabel()}
                  </button>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg text-rose-600 bg-rose-50 text-center"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { onOpenAuth('login'); setMobileMenuOpen(false); }}
                    className="py-2 text-xs font-semibold rounded-lg text-gray-700 border border-gray-300 text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { onOpenAuth('register'); setMobileMenuOpen(false); }}
                    className="py-2 text-xs font-bold rounded-lg bg-emerald-700 text-white text-center"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Profile Photo Upload Modal */}
      <ProfilePhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </>
  );
};
