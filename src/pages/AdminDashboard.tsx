import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AdminMetrics, Educator, Learner, LearnerRequest, Booking,
  Payment, Review, AdminAction, MatchEvaluation
} from '../types';
import { api } from '../services/api';
import { formatUGX, formatShortDate, getStatusBadgeClass } from '../utils/formatters';
import {
  ShieldCheck, Users, GraduationCap, Calendar, CreditCard,
  CheckCircle2, XCircle, AlertCircle, Sparkles, Filter,
  Settings, Clock, FileText, ArrowRight, Eye, RefreshCw, Check,
  Camera, Phone, Mail, MapPin, UserCheck, MessageCircle,
  UserPlus, UserMinus, ShieldAlert, Search, TrendingUp,
  BarChart2, BookOpen, Award, ExternalLink
} from 'lucide-react';
import { ProfilePhotoUploadModal } from '../components/ProfilePhotoUploadModal';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'users' | 'interests' | 'verification' | 'matchmaker' | 'educators' | 'payments' | 'audit'>('metrics');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [demandData, setDemandData] = useState<any>(null);
  const [verificationQueue, setVerificationQueue] = useState<Educator[]>([]);
  const [allEducators, setAllEducators] = useState<Educator[]>([]);
  const [learnerRequests, setLearnerRequests] = useState<LearnerRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // User directory search & filter state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'secondary_admin' | 'educator' | 'learner'>('all');
  const [assignActionMsg, setAssignActionMsg] = useState('');

  // Matchmaker interactive state
  const [selectedRequest, setSelectedRequest] = useState<LearnerRequest | null>(null);
  const [evaluatedMatches, setEvaluatedMatches] = useState<MatchEvaluation[]>([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  const [matchSuccessMsg, setMatchSuccessMsg] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [m, usersList, demand, queue, edus, reqs, bks, pays, logs] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(),
        api.getInterestsDemand(),
        api.getVerificationQueue(),
        api.getEducators({ status: undefined }),
        api.getLearnerRequests(),
        api.getBookings(),
        api.getPayments(),
        api.getAuditLogs()
      ]);

      setMetrics(m);
      setAllUsers(usersList);
      setDemandData(demand);
      setVerificationQueue(queue);
      setAllEducators(edus);
      setLearnerRequests(reqs);
      setBookings(bks);
      setPayments(pays);
      setAuditLogs(logs);

      if (reqs.length > 0 && !selectedRequest) {
        handleSelectRequestForMatching(reqs[0]);
      }
    } catch (err) {
      console.error('Failed to load admin operations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAssignSecondaryAdmin = async (targetUser: any) => {
    const confirmMsg = `Promote ${targetUser.name} (${targetUser.email}) to Secondary Administrator? They will be granted operational access to verification queues and platform oversight.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.assignSecondaryAdmin(targetUser.id, user?.id, user?.name || 'Ashabahebwa Hassan');
      setAssignActionMsg(`Successfully assigned ${targetUser.name} as Secondary Administrator.`);
      setTimeout(() => setAssignActionMsg(''), 4000);
      loadAdminData();
    } catch (e) {
      console.error('Error assigning secondary admin:', e);
    }
  };

  const handleRevokeSecondaryAdmin = async (targetUser: any) => {
    const confirmMsg = `Revoke Secondary Administrator privileges for ${targetUser.name}? Their account will return to regular permissions.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.revokeSecondaryAdmin(targetUser.id, user?.id, user?.name || 'Ashabahebwa Hassan');
      setAssignActionMsg(`Revoked secondary administrator privileges for ${targetUser.name}.`);
      setTimeout(() => setAssignActionMsg(''), 4000);
      loadAdminData();
    } catch (e) {
      console.error('Error revoking secondary admin:', e);
    }
  };

  const handleSelectRequestForMatching = async (req: LearnerRequest) => {
    setSelectedRequest(req);
    setIsMatchingLoading(true);
    setMatchSuccessMsg('');
    try {
      const res = await api.getMatchesForRequest(req.id);
      setEvaluatedMatches(res.matches);
    } catch (e) {
      console.error('Error computing matches:', e);
    } finally {
      setIsMatchingLoading(false);
    }
  };

  const handleAssignMatch = async (educatorId: string) => {
    if (!selectedRequest) return;
    try {
      await api.assignMatch(selectedRequest.id, educatorId, 'Ashabahebwa Hassan (Admin & Founder)');
      setMatchSuccessMsg('Match successfully assigned! Learner and educator notified.');
      loadAdminData();
    } catch (e) {
      console.error('Failed to assign match:', e);
    }
  };

  const handleVerifyStep = async (educatorId: string, step: 'national_id' | 'background_check' | 'interview' | 'skill_assessment') => {
    try {
      await api.updateVerificationStep({
        educator_id: educatorId,
        step,
        status: step === 'interview' ? 'completed' : 'verified',
        admin_name: 'Ashabahebwa Hassan'
      });
      loadAdminData();
    } catch (e) {
      console.error('Error updating verification step:', e);
    }
  };

  const handleApproveEducator = async (educatorId: string) => {
    try {
      await api.updateEducatorStatus(educatorId, 'active', 'Approved following complete verification & trade review', 'Ashabahebwa Hassan');
      loadAdminData();
    } catch (e) {
      console.error('Error approving educator:', e);
    }
  };

  const handleSuspendEducator = async (educatorId: string) => {
    try {
      await api.updateEducatorStatus(educatorId, 'suspended', 'Administrative hold pending inquiry', 'Ashabahebwa Hassan');
      loadAdminData();
    } catch (e) {
      console.error('Error suspending educator:', e);
    }
  };

  const handleReleasePayout = async (paymentId: string) => {
    try {
      await api.releasePayout(paymentId, 'Ashabahebwa Hassan (Admin & Founder)');
      loadAdminData();
    } catch (e) {
      console.error('Error releasing payout:', e);
    }
  };

  // Filter users
  const filteredUsers = allUsers.filter(u => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const q = userSearchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q) ||
      u.interests?.some((i: string) => i.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  const isLeadAdmin = user?.email === 'ashabahebwahassan665@gmail.com' || user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Operations Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-white/20 p-1.5 flex items-center justify-center shrink-0">
            <img
              src="./logo.png"
              alt="iSkillLink Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Platform Operations & Trust Center
              </span>
              <span className="text-xs text-slate-400">Mbarara HQ, Western Uganda</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight mt-1">
              iSkillLink Operations Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Admin oversight: Verification queues, user directory & contacts, demand intelligence, secondary admin delegation, and escrow ledger.
            </p>
          </div>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Admin Profile & Lead Badge */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
              alt={user?.name || 'Ashabahebwa Hassan'}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm"
            />
            <button
              onClick={() => setShowPhotoModal(true)}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-emerald-700 text-white shadow hover:bg-emerald-800 transition"
              title="Change Profile Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-gray-900">{user?.name || 'Ashabahebwa Hassan'}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-400" />
                {user?.role === 'admin' ? 'Founder & Primary Admin' : 'Secondary Administrator'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {user?.email || 'ashabahebwahassan665@gmail.com'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {user?.phone || '+256 744 024 529'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                Mbarara City HQ
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowPhotoModal(true)}
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-2"
        >
          <Camera className="w-4 h-4 text-emerald-700" />
          <span>Update Profile Picture</span>
        </button>
      </div>

      {assignActionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{assignActionMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm overflow-x-auto flex space-x-1">
        {[
          { id: 'metrics', label: 'Platform Metrics', icon: ShieldCheck },
          { id: 'users', label: `User Directory & Contacts (${allUsers.length})`, icon: Users },
          { id: 'interests', label: `Demands & User Interests`, icon: TrendingUp },
          { id: 'verification', label: `Verification Queue (${verificationQueue.length})`, icon: CheckCircle2 },
          { id: 'matchmaker', label: `Rule-Based Matchmaker`, icon: Sparkles },
          { id: 'educators', label: `Educators Directory (${allEducators.length})`, icon: GraduationCap },
          { id: 'payments', label: `Escrow Ledger (${payments.length})`, icon: CreditCard },
          { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: METRICS */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-semibold">Registered Platform Users</div>
              <div className="text-2xl font-black text-gray-900">{allUsers.length}</div>
              <div className="text-[11px] text-emerald-700 font-medium">Learners, Artisans & Admins</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-semibold">Active Verified Educators</div>
              <div className="text-2xl font-black text-gray-900">{metrics?.activeEducators || 0}</div>
              <div className="text-[11px] text-emerald-700 font-medium">All ID & workshop vetted</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-semibold">Pending Verification Queue</div>
              <div className="text-2xl font-black text-amber-600">{metrics?.pendingApplications || 0}</div>
              <div className="text-[11px] text-amber-700 font-medium">Awaiting admin review</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-semibold">Total Escrow Volume</div>
              <div className="text-xl font-black text-gray-900">{formatUGX(metrics?.totalVolumeUgx || 0)}</div>
              <div className="text-[11px] text-emerald-700 font-medium">MTN & Airtel protected</div>
            </div>
          </div>

          {/* Quick Operations Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Open Custom Skill Requests ({learnerRequests.filter(r => r.status === 'open').length})
                </h3>
                <button
                  onClick={() => setActiveTab('matchmaker')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Open Matchmaker
                </button>
              </div>

              <div className="space-y-3">
                {learnerRequests.slice(0, 3).map(r => (
                  <div key={r.id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900">{r.skill_name}</div>
                      <div className="text-gray-500 text-[11px]">{r.learner_name} • {r.location} • Budget: {formatUGX(r.budget_ugx)}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${getStatusBadgeClass(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Recent Audit Actions
                </h3>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="text-xs font-bold text-slate-700 hover:underline"
                >
                  View Full Audit
                </button>
              </div>

              <div className="space-y-3">
                {auditLogs.slice(0, 3).map(log => (
                  <div key={log.id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-gray-900">
                      <span>{log.action_type.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] text-gray-400">{formatShortDate(log.created_at)}</span>
                    </div>
                    <p className="text-gray-600 text-[11px]">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY, CONTACTS & SECONDARY ADMIN DELEGATION */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                User Directory, Direct Contacts & Admin Delegation
              </h2>
              <p className="text-xs text-gray-500">
                Inspect registered members, view their verified contact details and learning/teaching interests, and appoint Secondary Administrators.
              </p>
            </div>

            {/* Quick Stats Badge */}
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
                Secondary Admins: {allUsers.filter(u => u.role === 'secondary_admin').length}
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg">
                Educators: {allUsers.filter(u => u.role === 'educator').length}
              </span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg">
                Learners: {allUsers.filter(u => u.role === 'learner').length}
              </span>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search name, phone, email, skill..."
                className="w-full text-xs p-2.5 pl-9 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>

            {/* Role Filter Pills */}
            <div className="flex p-1 bg-gray-100 rounded-xl text-xs font-bold w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'all', label: 'All Users' },
                { id: 'secondary_admin', label: 'Secondary Admins' },
                { id: 'educator', label: 'Educators' },
                { id: 'learner', label: 'Learners' },
                { id: 'admin', label: 'Lead Admin' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setUserRoleFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    userRoleFilter === f.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => {
                const isThisLeadAdmin = u.email === 'ashabahebwahassan665@gmail.com';
                const isSecAdmin = u.role === 'secondary_admin';
                const cleanPhone = (u.phone || '').replace(/[^0-9]/g, '');
                const waNumber = cleanPhone.startsWith('256') ? cleanPhone : `256${cleanPhone.replace(/^0/, '')}`;

                return (
                  <div
                    key={u.id}
                    className={`p-5 rounded-2xl border transition space-y-4 ${
                      isThisLeadAdmin
                        ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-400/30'
                        : isSecAdmin
                        ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-400/30'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Top Identity Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={u.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-300 shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-gray-900">{u.name}</span>
                            {isThisLeadAdmin ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-amber-300">
                                Lead Admin (Founder)
                              </span>
                            ) : isSecAdmin ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                Secondary Admin
                              </span>
                            ) : u.role === 'educator' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                Educator
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                                Learner
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span>{u.location || 'Mbarara, Uganda'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Direct Contact Information Box */}
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Direct Contact Channels:
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Phone Call */}
                        <a
                          href={`tel:${u.phone}`}
                          className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-800 font-semibold text-[11px] flex items-center gap-1 transition"
                        >
                          <Phone className="w-3 h-3 text-emerald-700" />
                          <span>{u.phone || 'No phone'}</span>
                        </a>

                        {/* WhatsApp Direct Link */}
                        <a
                          href={`https://wa.me/${waNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>

                        {/* Email */}
                        <a
                          href={`mailto:${u.email}`}
                          className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium text-[11px] flex items-center gap-1 transition truncate max-w-full"
                        >
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{u.email}</span>
                        </a>
                      </div>
                    </div>

                    {/* Interests & Demands Tag Area */}
                    <div className="space-y-1.5 text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        What this user is interested in / offering:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {u.interests && u.interests.length > 0 ? (
                          u.interests.map((interest: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-medium"
                            >
                              {interest}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No specific trade tagged yet</span>
                        )}
                      </div>
                    </div>

                    {/* Admin Promotion / Delegation Controls */}
                    {isLeadAdmin && !isThisLeadAdmin && (
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] text-gray-500 font-medium">
                          {isSecAdmin
                            ? `Assigned by: ${u.admin_assigned_by || 'Founder'}`
                            : 'Standard user access'}
                        </span>

                        {isSecAdmin ? (
                          <button
                            onClick={() => handleRevokeSecondaryAdmin(u)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Revoke Admin Access</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAssignSecondaryAdmin(u)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                            <span>Assign as Secondary Admin</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-12 text-xs text-gray-500">
                No users found matching your search query.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DEMAND & USER INTERESTS INTELLIGENCE */}
      {activeTab === 'interests' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-base font-bold text-gray-900">
              Demand & User Interests Intelligence
            </h2>
            <p className="text-xs text-gray-500">
              Real-time analytics on what skills Ugandan students are requesting, average learner budgets in UGX, and regional demand clusters.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
              <span className="text-gray-600 font-semibold">Total Custom Learning Inquiries</span>
              <div className="text-2xl font-black text-emerald-950">{demandData?.totalRequests || learnerRequests.length}</div>
              <span className="text-[11px] text-emerald-800 font-medium">Submitted by active learners</span>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
              <span className="text-gray-600 font-semibold">Open Matching Queue</span>
              <div className="text-2xl font-black text-amber-950">{demandData?.openRequestsCount || learnerRequests.filter(r => r.status === 'open').length}</div>
              <span className="text-[11px] text-amber-800 font-medium">Awaiting educator match</span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
              <span className="text-gray-600 font-semibold">Matched & In-Training</span>
              <div className="text-2xl font-black text-blue-950">{demandData?.matchedRequestsCount || learnerRequests.filter(r => r.status === 'matched').length}</div>
              <span className="text-[11px] text-blue-800 font-medium">Apprentices actively learning</span>
            </div>
          </div>

          {/* Detailed Skill Demand Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Top Requested Vocational & Technical Trades
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {demandData?.tradeDemand && demandData.tradeDemand.length > 0 ? (
                demandData.tradeDemand.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                    <div className="flex items-center justify-between font-bold text-gray-900 text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-emerald-800 text-white flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        {item.trade}
                      </span>
                      <span className="text-emerald-800 font-black">{item.requestCount} inquiries</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-600 pt-1 border-t border-gray-200/60">
                      <span>Avg Student Budget: <strong>{formatUGX(item.averageBudgetUgx)}</strong></span>
                      <span className="text-gray-500 truncate max-w-[150px]">
                        Areas: {item.topLocations?.join(', ') || 'Mbarara City'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-xs text-gray-500 italic">No demand data aggregated yet.</div>
              )}
            </div>
          </div>

          {/* Full Custom Learner Requests Log with Contacts */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Live Learner Requests & Contact Records
            </h3>

            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="p-3">Learner Name</th>
                    <th className="p-3">Requested Skill</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Max Budget</th>
                    <th className="p-3">Direct Contact</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {learnerRequests.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="p-3 font-bold text-gray-900">{r.learner_name}</td>
                      <td className="p-3 font-semibold text-emerald-950">{r.skill_name}</td>
                      <td className="p-3 text-gray-600">{r.location}</td>
                      <td className="p-3 font-bold text-gray-900">{formatUGX(r.budget_ugx)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${r.contact_phone}`}
                            className="text-emerald-800 font-semibold hover:underline"
                          >
                            {r.contact_phone}
                          </a>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded border font-bold capitalize ${getStatusBadgeClass(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">{formatShortDate(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VERIFICATION QUEUE */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Educator Verification & Vetting Queue</h2>
            <p className="text-xs text-gray-500">
              Review applicant identity, trade tests, workshop readiness, and references before approving active status.
            </p>
          </div>

          <div className="space-y-6">
            {verificationQueue.length > 0 ? (
              verificationQueue.map(edu => {
                const v = edu.verification;
                return (
                  <div
                    key={edu.id}
                    className="p-6 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={edu.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={edu.user?.name}
                          className="w-14 h-14 rounded-xl object-cover border border-gray-300"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-base">{edu.user?.name}</h3>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              {edu.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{edu.title} • {edu.location}</p>
                          <div className="text-[11px] text-gray-500 flex items-center gap-3 mt-1">
                            <span>Phone: {edu.user?.phone}</span>
                            <span>•</span>
                            <span>Rate: {formatUGX(edu.hourly_rate_ugx)}/hr</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveEducator(edu.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Activate</span>
                        </button>
                        <button
                          onClick={() => handleSuspendEducator(edu.id)}
                          className="px-3 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
                        >
                          Hold
                        </button>
                      </div>
                    </div>

                    {/* Step Checks Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {/* Step 1 */}
                      <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">1. National ID (NIN)</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border capitalize ${getStatusBadgeClass(v?.national_id_status || 'pending')}`}>
                            {v?.national_id_status || 'pending'}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-gray-600">{v?.national_id_number || 'CM-NOT-SUBMITTED'}</div>
                        <button
                          onClick={() => handleVerifyStep(edu.id, 'national_id')}
                          className="w-full py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                        >
                          Verify NIN
                        </button>
                      </div>

                      {/* Step 2 */}
                      <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">2. Police / BG Check</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border capitalize ${getStatusBadgeClass(v?.background_check_status || 'pending')}`}>
                            {v?.background_check_status || 'pending'}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500">LC1 & Police clearance</div>
                        <button
                          onClick={() => handleVerifyStep(edu.id, 'background_check')}
                          className="w-full py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                        >
                          Mark Cleared
                        </button>
                      </div>

                      {/* Step 3 */}
                      <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">3. Practical Interview</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border capitalize ${getStatusBadgeClass(v?.interview_status || 'pending')}`}>
                            {v?.interview_status || 'pending'}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500">Phone or in-person review</div>
                        <button
                          onClick={() => handleVerifyStep(edu.id, 'interview')}
                          className="w-full py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                        >
                          Pass Interview
                        </button>
                      </div>

                      {/* Step 4 */}
                      <div className="p-3.5 rounded-xl border border-gray-200 bg-white space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-700">4. Skill Assessment</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border capitalize ${getStatusBadgeClass(v?.skill_assessment_status || 'pending')}`}>
                            {v?.skill_assessment_status || 'pending'}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500">Workshop & tools review</div>
                        <button
                          onClick={() => handleVerifyStep(edu.id, 'skill_assessment')}
                          className="w-full py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition"
                        >
                          Approve Skill
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-xs text-gray-500 border border-dashed border-gray-300 rounded-2xl">
                No educator applications currently pending verification.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: MATCHMAKER */}
      {activeTab === 'matchmaker' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Rule-Based Matchmaker Oversight</h2>
            <p className="text-xs text-gray-500">
              Review custom learning goals submitted by students and evaluate ranked educator matches with rule-based scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Requests List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Custom Skill Inquiries ({learnerRequests.length})
              </h3>

              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {learnerRequests.map(req => (
                  <div
                    key={req.id}
                    onClick={() => handleSelectRequestForMatching(req)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                      selectedRequest?.id === req.id
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-sm ring-1 ring-emerald-500'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{req.skill_name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border capitalize ${getStatusBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-600 mt-1">
                      {req.learner_name} • {req.location}
                    </div>
                    <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                      Budget: {formatUGX(req.budget_ugx)} ({req.format_preference})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Evaluated Matches */}
            <div className="lg:col-span-2 space-y-4">
              {selectedRequest ? (
                <>
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Evaluating Request: #{selectedRequest.id}
                      </span>
                      <span className="text-xs font-bold bg-emerald-800 px-2.5 py-0.5 rounded">
                        Budget: {formatUGX(selectedRequest.budget_ugx)}
                      </span>
                    </div>
                    <h3 className="text-base font-bold">{selectedRequest.skill_name} ({selectedRequest.skill_level})</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">"{selectedRequest.learning_goal}"</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800">
                      <span>Learner: {selectedRequest.learner_name}</span>
                      <span>•</span>
                      <span>Location: {selectedRequest.location}</span>
                      <span>•</span>
                      <span>Schedule: {selectedRequest.preferred_schedule}</span>
                    </div>
                  </div>

                  {matchSuccessMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{matchSuccessMsg}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Rule-Based Ranked Matches ({evaluatedMatches.length})
                    </h4>

                    {isMatchingLoading ? (
                      <div className="text-center py-12 text-xs text-gray-500">Evaluating matching algorithm criteria...</div>
                    ) : evaluatedMatches.length > 0 ? (
                      evaluatedMatches.map(m => (
                        <div
                          key={m.educator.id}
                          className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-emerald-600 transition space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={m.educator.user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'}
                                alt={m.educator.user?.name}
                                className="w-12 h-12 rounded-xl object-cover border border-gray-300"
                              />
                              <div>
                                <div className="font-bold text-gray-900 text-sm">{m.educator.user?.name}</div>
                                <div className="text-xs text-gray-600">{m.educator.title} • {m.educator.location}</div>
                                <div className="text-[11px] text-emerald-800 font-bold mt-0.5">
                                  Rate: {formatUGX(m.educator.hourly_rate_ugx)}/hr
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-black text-emerald-700">{m.match_score}%</div>
                              <span className="text-[10px] text-gray-500 font-semibold">Match Score</span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Match Factors:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {m.match_reasons.map((r, idx) => (
                                <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200 flex justify-end">
                            <button
                              onClick={() => handleAssignMatch(m.educator.id)}
                              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
                            >
                              Assign & Introduce Match
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-xs text-gray-400">No matching educators found for this request.</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-xs text-gray-400">
                  Select a learner request on the left to evaluate matches.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: EDUCATORS DIRECTORY */}
      {activeTab === 'educators' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">All Registered Educators & Mentors</h2>
              <p className="text-xs text-gray-500">Master practitioners and trainers across Uganda.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allEducators.map(edu => (
              <div key={edu.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={edu.user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'}
                    alt={edu.user?.name}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-300"
                  />
                  <div>
                    <h3 className="font-bold text-xs text-gray-900">{edu.user?.name}</h3>
                    <div className="text-[11px] text-gray-500">{edu.title}</div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border uppercase mt-1 inline-block ${getStatusBadgeClass(edu.status)}`}>
                      {edu.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div><strong>Base:</strong> {edu.location}</div>
                  <div><strong>Rate:</strong> {formatUGX(edu.hourly_rate_ugx)}/hr</div>
                  <div><strong>Phone:</strong> {edu.user?.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: PAYMENTS & ESCROW */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Platform Escrow Ledger</h2>
            <p className="text-xs text-gray-500">
              Escrow deposits held safely in MTN/Airtel MoMo until learner milestones are delivered.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Total UGX</th>
                  <th className="p-3">Educator Net (90%)</th>
                  <th className="p-3">Platform Fee (10%)</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-mono font-bold text-gray-900">{p.payment_reference}</td>
                    <td className="p-3 font-bold text-gray-900">{formatUGX(p.amount_ugx)}</td>
                    <td className="p-3 font-semibold text-emerald-800">{formatUGX(p.payout_amount_ugx)}</td>
                    <td className="p-3 text-slate-600">{formatUGX(p.platform_fee_ugx)}</td>
                    <td className="p-3 uppercase font-semibold text-emerald-900">{p.method.replace('_', ' ')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded border font-bold capitalize ${getStatusBadgeClass(p.status)}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      {p.status === 'paid' ? (
                        <button
                          onClick={() => handleReleasePayout(p.id)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-[11px]"
                        >
                          Release Payout
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[11px]">{p.status}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Administrative Audit Trail & Security Logs</h2>
            <p className="text-xs text-gray-500">
              Immutable operational record of all verification decisions, matches, and secondary admin appointments.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Entity Target</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="p-3 text-gray-500">{formatShortDate(log.created_at)}</td>
                    <td className="p-3 font-semibold text-gray-900">{log.admin_name}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{log.action_type}</td>
                    <td className="p-3 text-gray-600">{log.target_entity} #{log.target_id}</td>
                    <td className="p-3 text-gray-700 max-w-sm">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Profile Photo Upload Modal */}
      <ProfilePhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </div>
  );
};
