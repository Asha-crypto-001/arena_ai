import React, { useState, useEffect } from 'react';
import {
  AdminMetrics, Educator, Learner, LearnerRequest, Booking,
  Payment, Review, AdminAction, MatchEvaluation
} from '../types';
import { api } from '../services/api';
import { formatUGX, formatShortDate, getStatusBadgeClass } from '../utils/formatters';
import {
  ShieldCheck, Users, GraduationCap, Calendar, CreditCard,
  CheckCircle2, XCircle, AlertCircle, Sparkles, Filter,
  Settings, Clock, FileText, ArrowRight, Eye, RefreshCw, Check
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'verification' | 'matchmaker' | 'educators' | 'learners' | 'payments' | 'audit'>('metrics');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [verificationQueue, setVerificationQueue] = useState<Educator[]>([]);
  const [allEducators, setAllEducators] = useState<Educator[]>([]);
  const [learnerRequests, setLearnerRequests] = useState<LearnerRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);

  // Matchmaker interactive state
  const [selectedRequest, setSelectedRequest] = useState<LearnerRequest | null>(null);
  const [evaluatedMatches, setEvaluatedMatches] = useState<MatchEvaluation[]>([]);
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);
  const [matchSuccessMsg, setMatchSuccessMsg] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [m, queue, edus, reqs, bks, pays, logs] = await Promise.all([
        api.getAdminMetrics(),
        api.getVerificationQueue(),
        api.getEducators({ status: undefined }),
        api.getLearnerRequests(),
        api.getBookings(),
        api.getPayments(),
        api.getAuditLogs()
      ]);

      setMetrics(m);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Operations Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Platform Operations & Trust Center
            </span>
            <span className="text-xs text-slate-400">Uganda Operations HQ</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1">
            iSkillLink Operations Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Admin oversight: Verification queues, rule-based matching, escrow protection, and audit logs.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-2 shadow-sm overflow-x-auto flex space-x-1">
        {[
          { id: 'metrics', label: 'Platform Metrics', icon: ShieldCheck },
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

            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-1">
              <div className="text-xs text-gray-500 font-semibold">Platform Commission (10%)</div>
              <div className="text-xl font-black text-slate-800">{formatUGX(metrics?.platformRevenueUgx || 0)}</div>
              <div className="text-[11px] text-slate-500 font-medium">Facilitation revenue</div>
            </div>
          </div>

          {/* Quick Operations Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Recent Learner Skill Requests
                </h3>
                <button
                  onClick={() => setActiveTab('matchmaker')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Open Matchmaker
                </button>
              </div>

              <div className="space-y-3">
                {learnerRequests.slice(0, 4).map(r => (
                  <div key={r.id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-gray-900">{r.skill_name}</div>
                      <div className="text-gray-500 mt-0.5">{r.learner_name} • {r.location}</div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-800 block">{formatUGX(r.budget_ugx)}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border capitalize ${getStatusBadgeClass(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Recent Platform Actions
                </h3>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="text-xs font-bold text-slate-700 hover:underline"
                >
                  View Full Audit
                </button>
              </div>

              <div className="space-y-3">
                {auditLogs.slice(0, 4).map(log => (
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

      {/* TAB 2: VERIFICATION QUEUE */}
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
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve & Activate</span>
                        </button>
                        <button
                          onClick={() => handleSuspendEducator(edu.id)}
                          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    {/* Step-by-Step Vetting Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                      {/* Step 1 */}
                      <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between font-bold text-gray-900">
                          <span>1. National ID (NIN)</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold capitalize ${
                            v?.national_id_status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {v?.national_id_status || 'pending'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono">NIN: {v?.national_id_number || 'CM910284910'}</p>
                        <button
                          onClick={() => handleVerifyStep(edu.id, 'national_id')}
                          className="w-full py-1.5 text-[11px] font-bold rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                        >
                          Mark ID Verified
                        </button>
                      </div>

                      {/* Step 2 */}
                      <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between font-bold text-gray-900">
                          <span>2. Trade Background</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold capitalize ${
                            v?.background_check_status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {v?.background_check_status || 'pending'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">Trade test & references</p>
                        <button
                          onClick={() => handleVerifyStep(edu.id, 'background_check')}
                          className="w-full py-1.5 text-[11px] font-bold rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                        >
                          Confirm Trade Check
                        </button>
                      </div>

                      {/* Step 3 */}
                      <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between font-bold text-gray-900">
                          <span>3. Screening Interview</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold capitalize ${
                            v?.interview_status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {v?.interview_status || 'scheduled'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">Phone or in-person talk</p>
                        <button
                          onClick={() => handleVerifyStep(edu.id, 'interview')}
                          className="w-full py-1.5 text-[11px] font-bold rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                        >
                          Mark Interview Done
                        </button>
                      </div>

                      {/* Step 4 */}
                      <div className="p-3.5 rounded-xl bg-white border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between font-bold text-gray-900">
                          <span>4. Practical Bench Check</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold capitalize ${
                            v?.skill_assessment_status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {v?.skill_assessment_status || 'pending'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">Workshop tooling inspection</p>
                        <button
                          onClick={() => handleVerifyStep(edu.id, 'skill_assessment')}
                          className="w-full py-1.5 text-[11px] font-bold rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                        >
                          Pass Workshop Check
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-xs text-gray-500 bg-gray-50 rounded-2xl border border-gray-200">
                Verification queue is clear! All active educators are fully vetted.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RULE-BASED MATCHMAKER */}
      {activeTab === 'matchmaker' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                Rule-Based Engine
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-900 mt-1">
              Match Learner Requests with Verified Educators
            </h2>
            <p className="text-xs text-gray-500">
              Evaluates skill overlap (35%), format (20%), proximity (15%), budget (15%), and educator rating (15%).
            </p>
          </div>

          {matchSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{matchSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Requests Picker */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Select Skill Request ({learnerRequests.length})
              </h3>
              <div className="space-y-2">
                {learnerRequests.map(req => (
                  <button
                    key={req.id}
                    onClick={() => handleSelectRequestForMatching(req)}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs transition ${
                      selectedRequest?.id === req.id
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-900 truncate max-w-[160px]">{req.skill_name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded border capitalize ${getStatusBadgeClass(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 flex justify-between">
                      <span>{req.learner_name}</span>
                      <span>{formatUGX(req.budget_ugx)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Match Results & Evaluation */}
            <div className="lg:col-span-2 space-y-4">
              {selectedRequest && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{selectedRequest.skill_name}</span>
                      <p className="text-gray-600 mt-0.5">{selectedRequest.learning_goal}</p>
                    </div>
                    <span className="font-bold text-emerald-800 shrink-0">{formatUGX(selectedRequest.budget_ugx)}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                    <span><strong>Location:</strong> {selectedRequest.location}</span>
                    <span><strong>Format:</strong> {selectedRequest.format_preference}</span>
                    <span><strong>Learner:</strong> {selectedRequest.learner_name} ({selectedRequest.contact_phone})</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Ranked Verified Educator Matches
                </h4>

                {isMatchingLoading ? (
                  <div className="p-8 text-center text-xs text-gray-500">Evaluating matches...</div>
                ) : evaluatedMatches.length > 0 ? (
                  evaluatedMatches.map(m => (
                    <div
                      key={m.educator.id}
                      className="p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-500 transition space-y-3 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.educator.user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'}
                            alt={m.educator.user?.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-gray-900 text-sm">{m.educator.user?.name}</h5>
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                                {m.match_score}% COMPATIBLE
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{m.educator.title}</p>
                            <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                              <span>{m.educator.location}</span>
                              <span>•</span>
                              <span>{formatUGX(m.educator.hourly_rate_ugx)}/hr</span>
                              <span>•</span>
                              <span>{m.educator.years_experience} yrs exp</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAssignMatch(m.educator.id)}
                          className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Assign Match</span>
                        </button>
                      </div>

                      {/* Transparent criteria */}
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-[11px] space-y-1">
                        {m.match_reasons.map((r, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-gray-600">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-gray-500">
                    No verified educators found in this category.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EDUCATORS DIRECTORY */}
      {activeTab === 'educators' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">All Registered Educators & Artisans</h2>
            <p className="text-xs text-gray-500">Full platform database of verified and pending mentors.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-y border-gray-200">
                <tr>
                  <th className="p-3">Educator</th>
                  <th className="p-3">Trade & Title</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Hourly Rate</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {allEducators.map(edu => (
                  <tr key={edu.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-semibold text-gray-900 flex items-center gap-2">
                      <img
                        src={edu.user?.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <span>{edu.user?.name}</span>
                    </td>
                    <td className="p-3 text-gray-600">{edu.title}</td>
                    <td className="p-3">{edu.location}</td>
                    <td className="p-3 font-bold text-gray-900">{formatUGX(edu.hourly_rate_ugx)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded border font-bold capitalize ${getStatusBadgeClass(edu.status)}`}>
                        {edu.status}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-amber-700">{edu.rating > 0 ? `${edu.rating}★` : 'New'}</td>
                    <td className="p-3 text-right space-x-2">
                      {edu.status !== 'active' ? (
                        <button
                          onClick={() => handleApproveEducator(edu.id)}
                          className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold border border-emerald-200"
                        >
                          Activate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSuspendEducator(edu.id)}
                          className="px-2.5 py-1 rounded bg-rose-50 text-rose-800 hover:bg-rose-100 font-bold border border-rose-200"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENTS & ESCROW LEDGER */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Platform Escrow Ledger & Disbursal</h2>
            <p className="text-xs text-gray-500">Monitor deposits, release educator payouts for completed sessions, and track 10% commission.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-y border-gray-200">
                <tr>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Gross (UGX)</th>
                  <th className="p-3">10% Platform Fee</th>
                  <th className="p-3">Net Educator (90%)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Escrow Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-mono font-bold text-gray-900">{p.payment_reference}</td>
                    <td className="p-3 font-bold text-gray-900">{formatUGX(p.amount_ugx)}</td>
                    <td className="p-3 font-semibold text-slate-600">{formatUGX(p.platform_fee_ugx)}</td>
                    <td className="p-3 font-bold text-emerald-800">{formatUGX(p.payout_amount_ugx)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded border font-bold capitalize ${getStatusBadgeClass(p.status)}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {p.status === 'paid' && (
                        <button
                          onClick={() => handleReleasePayout(p.id)}
                          className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                        >
                          Release MoMo Payout
                        </button>
                      )}
                      {p.status === 'completed' && (
                        <span className="text-[11px] text-emerald-700 font-bold">Disbursed ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Administrative Audit Trail</h2>
            <p className="text-xs text-gray-500">Immutable ledger of platform actions, verifications, and payouts.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 uppercase font-bold border-y border-gray-200">
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
    </div>
  );
};
