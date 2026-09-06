import {
  User, Educator, Category, Skill, LearnerRequest,
  Booking, Payment, Review, Message, Notification,
  AdminAction, AdminMetrics, MatchEvaluation
} from '../types';
import {
  initialLocalCategories,
  initialLocalSkills,
  initialLocalUsers,
  initialLocalEducators,
  initialLocalLearners,
  initialLocalBookings,
  initialLocalPayments,
  initialLocalAuditLogs
} from './localData';

const API_BASE = ((import.meta as any).env?.VITE_API_URL as string) || '/api';

// Helper to initialize local persistent storage for static environments (e.g. GitHub Pages)
function getLocalStorageData<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(`iskilllink_${key}`);
    if (!item) {
      localStorage.setItem(`iskilllink_${key}`, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
}

function setLocalStorageData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`iskilllink_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

// Ensure initial seed data is loaded into local storage
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('iskilllink_users')) {
    setLocalStorageData('users', initialLocalUsers);
  } else {
    // Ensure admin user password is up to date in client storage
    const users: any[] = getLocalStorageData('users', initialLocalUsers);
    const admin = users.find(u => u.email === 'ashabahebwahassan665@gmail.com' || u.role === 'admin');
    if (admin) {
      admin.password_hash = 'Ash@0001$';
      admin.role = 'admin';
      admin.name = 'Ashabahebwa Hassan';
      setLocalStorageData('users', users);
    }
  }
  if (!localStorage.getItem('iskilllink_categories')) setLocalStorageData('categories', initialLocalCategories);
  if (!localStorage.getItem('iskilllink_skills')) setLocalStorageData('skills', initialLocalSkills);
  if (!localStorage.getItem('iskilllink_educators')) setLocalStorageData('educators', initialLocalEducators);
  if (!localStorage.getItem('iskilllink_learners')) setLocalStorageData('learners', initialLocalLearners);
  if (!localStorage.getItem('iskilllink_bookings')) setLocalStorageData('bookings', initialLocalBookings);
  if (!localStorage.getItem('iskilllink_payments')) setLocalStorageData('payments', initialLocalPayments);
  if (!localStorage.getItem('iskilllink_audit_logs')) setLocalStorageData('audit_logs', initialLocalAuditLogs);
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth & Session
  async login(email: string, password?: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {
      // Offline / GitHub Pages fallback below
    }

    // Client-side fallback authentication
    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      throw new Error('Account not found with this email address.');
    }

    if (password && user.password_hash !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    const learners = getLocalStorageData<any[]>('learners', initialLocalLearners);
    const educators = getLocalStorageData<any[]>('educators', initialLocalEducators);

    const learnerProfile = learners.find(l => l.user_id === user.id) || null;
    const educatorProfile = educators.find(e => e.user_id === user.id) || null;
    const token = `token-${user.id}-${Date.now()}`;

    return { user, learnerProfile, educatorProfile, token };
  },

  async register(data: any) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {
      // Offline fallback
    }

    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const existing = users.find(u => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: any = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: data.email.trim().toLowerCase(),
      password_hash: data.password,
      role: data.role || 'learner',
      name: data.name,
      phone: data.phone || '+256 ',
      avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      location: data.location || 'Mbarara City, Uganda',
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    setLocalStorageData('users', users);

    let learnerProfile = null;
    let educatorProfile = null;

    if (newUser.role === 'learner') {
      const learners = getLocalStorageData<any[]>('learners', initialLocalLearners);
      learnerProfile = {
        id: `lrn-${Date.now()}`,
        user_id: newUser.id,
        location: newUser.location,
        bio: 'Enthusiastic practical skills learner.',
        learning_interests: [],
        preferred_format: 'in-person',
        created_at: new Date().toISOString()
      };
      learners.push(learnerProfile);
      setLocalStorageData('learners', learners);
    } else if (newUser.role === 'educator') {
      const educators = getLocalStorageData<any[]>('educators', initialLocalEducators);
      educatorProfile = {
        id: `edu-${Date.now()}`,
        user_id: newUser.id,
        title: data.title || 'Skilled Artisan & Educator',
        bio: data.bio || 'Experienced practitioner ready to train apprentices.',
        educator_type: 'artisan',
        years_experience: 3,
        location: newUser.location,
        service_area: 'Mbarara City & Western Uganda',
        teaching_formats: ['in-person', 'hybrid'],
        languages: ['English', 'Runyankole'],
        equipment_provided: 'Workshop equipment available.',
        hourly_rate_ugx: 35000,
        status: 'applied',
        rating: 5.0,
        total_reviews: 0,
        total_students: 0,
        created_at: new Date().toISOString()
      };
      educators.push(educatorProfile);
      setLocalStorageData('educators', educators);
    }

    const token = `token-${newUser.id}-${Date.now()}`;
    return { user: newUser, learnerProfile, educatorProfile, token };
  },

  async getMe(userId?: string) {
    try {
      const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      const res = await fetch(`${API_BASE}/auth/me${query}`);
      if (res.ok) return await handleResponse<any>(res);
    } catch {
      // Offline fallback
    }

    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const user = users.find(u => u.id === userId) || users[0];
    if (!user) return { user: null, learnerProfile: null, educatorProfile: null };

    const learners = getLocalStorageData<any[]>('learners', initialLocalLearners);
    const educators = getLocalStorageData<any[]>('educators', initialLocalEducators);

    const learnerProfile = learners.find(l => l.user_id === user.id) || null;
    const educatorProfile = educators.find(e => e.user_id === user.id) || null;

    return { user, learnerProfile, educatorProfile };
  },

  // Categories & Skills
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) return await handleResponse<Category[]>(res);
    } catch {}
    return getLocalStorageData<Category[]>('categories', initialLocalCategories);
  },

  async getSkills(categoryId?: string, popular?: boolean) {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('category_id', categoryId);
      if (popular) params.append('popular', 'true');
      const res = await fetch(`${API_BASE}/skills?${params.toString()}`);
      if (res.ok) return await handleResponse<Skill[]>(res);
    } catch {}
    let skills = getLocalStorageData<Skill[]>('skills', initialLocalSkills);
    if (categoryId) skills = skills.filter(s => s.category_id === categoryId);
    if (popular) skills = skills.filter(s => s.popular);
    return skills;
  },

  // Educators
  async getEducators(filters: {
    search?: string;
    category_id?: string;
    format?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    status?: string;
    sort?: string;
    featured?: boolean;
  } = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) {
          params.append(k, String(v));
        }
      });
      const res = await fetch(`${API_BASE}/educators?${params.toString()}`);
      if (res.ok) return await handleResponse<Educator[]>(res);
    } catch {}

    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    let educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);

    return educators.map(edu => ({
      ...edu,
      user: users.find(u => u.id === edu.user_id)
    }));
  },

  async getEducatorById(id: string) {
    try {
      const res = await fetch(`${API_BASE}/educators/${id}`);
      if (res.ok) return await handleResponse<Educator>(res);
    } catch {}

    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const edu = educators.find(e => e.id === id) || educators[0];
    return {
      ...edu,
      user: users.find(u => u.id === edu.user_id)
    };
  },

  async submitEducatorOnboarding(data: any) {
    try {
      const res = await fetch(`${API_BASE}/educators/onboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const newEdu: Educator = {
      id: `edu-${Date.now()}`,
      user_id: `usr-${Date.now()}`,
      title: data.title,
      bio: data.bio,
      educator_type: data.educator_type || 'artisan',
      years_experience: data.years_experience || 3,
      location: data.location || 'Mbarara City',
      service_area: data.service_area || 'Mbarara City & Western Region',
      teaching_formats: data.teaching_formats || ['in-person'],
      languages: data.languages || ['English', 'Runyankole'],
      equipment_provided: data.equipment_provided || 'Workshop tools provided.',
      hourly_rate_ugx: data.hourly_rate_ugx || 35000,
      status: 'applied',
      rating: 5.0,
      total_reviews: 0,
      total_students: 0,
      created_at: new Date().toISOString()
    };
    educators.push(newEdu);
    setLocalStorageData('educators', educators);
    return { success: true, educator: newEdu };
  },

  // Learner Requests & Matching
  async getLearnerRequests(filters: { learner_id?: string; status?: string } = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.learner_id) params.append('learner_id', filters.learner_id);
      if (filters.status) params.append('status', filters.status);
      const res = await fetch(`${API_BASE}/learner-requests?${params.toString()}`);
      if (res.ok) return await handleResponse<LearnerRequest[]>(res);
    } catch {}
    return getLocalStorageData<LearnerRequest[]>('learner_requests', []);
  },

  async createLearnerRequest(data: Partial<LearnerRequest>) {
    try {
      const res = await fetch(`${API_BASE}/learner-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const requests = getLocalStorageData<LearnerRequest[]>('learner_requests', []);
    const newReq: LearnerRequest = {
      id: `req-${Date.now()}`,
      learner_id: data.learner_id || 'lrn-1',
      skill_name: data.skill_name || 'Practical Skill',
      skill_level: data.skill_level || 'beginner',
      learning_goal: data.learning_goal || '',
      format_preference: data.format_preference || 'in-person',
      location: data.location || 'Mbarara City',
      preferred_schedule: data.preferred_schedule || 'Flexible',
      frequency: data.frequency || 'Weekly',
      budget_ugx: data.budget_ugx || 250000,
      status: 'open',
      contact_phone: data.contact_phone || '+256 700 000 000',
      learner_name: data.learner_name || 'Student',
      learner_email: data.learner_email || 'student@example.com',
      created_at: new Date().toISOString()
    };
    requests.unshift(newReq);
    setLocalStorageData('learner_requests', requests);

    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const potentialMatches: MatchEvaluation[] = educators.slice(0, 3).map(e => ({
      educator: { ...e, user: users.find(u => u.id === e.user_id) },
      match_score: 95,
      match_reasons: [
        `Practical trade match: ${newReq.skill_name}`,
        `Location compatible: ${e.location}`,
        `Verified educator in Mbarara network`
      ],
      breakdown: { skillMatch: 35, formatMatch: 20, locationMatch: 15, budgetMatch: 15, experienceMatch: 10 }
    }));

    return { request: newReq, potentialMatches };
  },

  // Bookings
  async getBookings(filters: { learner_id?: string; educator_id?: string; status?: string } = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.learner_id) params.append('learner_id', filters.learner_id);
      if (filters.educator_id) params.append('educator_id', filters.educator_id);
      if (filters.status) params.append('status', filters.status);
      const res = await fetch(`${API_BASE}/bookings?${params.toString()}`);
      if (res.ok) return await handleResponse<Booking[]>(res);
    } catch {}
    return getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
  },

  async createBooking(data: any) {
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
    const totalAmount = data.total_amount_ugx || 105000;
    const fee = Math.round(totalAmount * 0.10);
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      learner_id: data.learner_id || 'lrn-1',
      educator_id: data.educator_id || 'edu-1',
      skill_name: data.skill_name || 'Practical Skill Session',
      format: data.format || 'in-person',
      location_or_link: data.location_or_link || 'Workshop Location',
      scheduled_date: data.scheduled_date || new Date().toISOString().split('T')[0],
      start_time: data.start_time || '10:00',
      duration_hours: data.duration_hours || 3,
      total_amount_ugx: totalAmount,
      platform_fee_ugx: fee,
      educator_payout_ugx: totalAmount - fee,
      status: 'pending',
      notes: data.notes || '',
      milestone_progress: 0,
      created_at: new Date().toISOString()
    };
    bookings.unshift(newBooking);
    setLocalStorageData('bookings', bookings);
    return { success: true, booking: newBooking };
  },

  async updateBookingStatus(id: string, status: string, reason?: string) {
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, cancellation_reason: reason })
      });
      if (res.ok) return await handleResponse<Booking>(res);
    } catch {}

    const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
    const b = bookings.find(item => item.id === id);
    if (b) {
      b.status = status as any;
      setLocalStorageData('bookings', bookings);
    }
    return b!;
  },

  async updateBookingProgress(id: string, progress: number) {
    try {
      const res = await fetch(`${API_BASE}/bookings/${id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone_progress: progress })
      });
      if (res.ok) return await handleResponse<Booking>(res);
    } catch {}

    const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
    const b = bookings.find(item => item.id === id);
    if (b) {
      b.milestone_progress = progress;
      setLocalStorageData('bookings', bookings);
    }
    return b!;
  },

  // Payments & Escrow
  async getPayments(filters: { learner_id?: string; educator_id?: string; status?: string } = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.learner_id) params.append('learner_id', filters.learner_id);
      if (filters.educator_id) params.append('educator_id', filters.educator_id);
      if (filters.status) params.append('status', filters.status);
      const res = await fetch(`${API_BASE}/payments?${params.toString()}`);
      if (res.ok) return await handleResponse<Payment[]>(res);
    } catch {}
    return getLocalStorageData<Payment[]>('payments', initialLocalPayments);
  },

  async simulatePayment(bookingId: string, method: string = 'mtn_momo', phoneNumber: string = '+256 744 024 529') {
    try {
      const res = await fetch(`${API_BASE}/payments/simulate-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, method, phone_number: phoneNumber })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const payments = getLocalStorageData<Payment[]>('payments', initialLocalPayments);
    const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
    const b = bookings.find(item => item.id === bookingId);
    const amount = b?.total_amount_ugx || 105000;
    const fee = Math.round(amount * 0.10);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      booking_id: bookingId,
      learner_id: b?.learner_id || 'lrn-1',
      educator_id: b?.educator_id || 'edu-1',
      amount_ugx: amount,
      platform_fee_ugx: fee,
      payout_amount_ugx: amount - fee,
      method: method as any,
      payment_reference: `MOMO-UG-${Date.now().toString().slice(-6)}`,
      status: 'paid',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    payments.unshift(newPayment);
    setLocalStorageData('payments', payments);

    if (b) {
      b.status = 'confirmed';
      setLocalStorageData('bookings', bookings);
    }

    return { success: true, message: 'Payment deposited into Escrow', payment: newPayment };
  },

  async releasePayout(paymentId: string, adminName: string = 'Ashabahebwa Hassan') {
    try {
      const res = await fetch(`${API_BASE}/payments/${paymentId}/release-payout`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_name: adminName })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const payments = getLocalStorageData<Payment[]>('payments', initialLocalPayments);
    const p = payments.find(item => item.id === paymentId);
    if (p) {
      p.status = 'completed';
      setLocalStorageData('payments', payments);
    }
    return { success: true, payment: p! };
  },

  // Reviews
  async getReviews(educatorId?: string) {
    try {
      const query = educatorId ? `?educator_id=${educatorId}` : '';
      const res = await fetch(`${API_BASE}/reviews${query}`);
      if (res.ok) return await handleResponse<Review[]>(res);
    } catch {}
    return [];
  },

  async submitReview(data: any) {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      booking_id: data.booking_id,
      educator_id: data.educator_id,
      learner_id: data.learner_id,
      learner_name: data.learner_name || 'Verified Learner',
      learner_avatar: data.learner_avatar,
      rating: data.rating || 5,
      skill_rating: data.skill_rating || 5,
      punctuality_rating: data.punctuality_rating || 5,
      communication_rating: data.communication_rating || 5,
      comment: data.comment,
      is_verified: true,
      is_moderated: true,
      created_at: new Date().toISOString()
    };
    return { success: true, review: newRev };
  },

  async replyToReview(reviewId: string, reply: string) {
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}
    return { success: true, review: { id: reviewId, educator_reply: reply } as any };
  },

  // Messages & Notifications
  async getMessages(userId: string) {
    try {
      const res = await fetch(`${API_BASE}/messages?user_id=${userId}`);
      if (res.ok) return await handleResponse<Message[]>(res);
    } catch {}
    return [];
  },

  async sendMessage(senderId: string, receiverId: string, content: string) {
    try {
      const res = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, content })
      });
      if (res.ok) return await handleResponse<Message>(res);
    } catch {}
    return {
      id: `msg-${Date.now()}`,
      conversation_id: `conv-${senderId}-${receiverId}`,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      is_read: false,
      created_at: new Date().toISOString()
    };
  },

  async getNotifications(userId: string) {
    try {
      const res = await fetch(`${API_BASE}/notifications?user_id=${userId}`);
      if (res.ok) return await handleResponse<Notification[]>(res);
    } catch {}
    return [];
  },

  async markNotificationRead(id: string) {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH'
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}
    return { success: true };
  },

  // Admin Operations
  async getAdminMetrics() {
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('iskilllink_user') : null;
      const userId = userStr ? JSON.parse(userStr)?.id : 'usr-admin-ashabahebwa';
      const res = await fetch(`${API_BASE}/admin/metrics`, {
        headers: { 'x-user-id': userId }
      });
      if (res.ok) return await handleResponse<AdminMetrics>(res);
    } catch {}

    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const learners = getLocalStorageData<any[]>('learners', initialLocalLearners);
    const bookings = getLocalStorageData<Booking[]>('bookings', initialLocalBookings);
    const payments = getLocalStorageData<Payment[]>('payments', initialLocalPayments);

    return {
      totalLearners: learners.length,
      activeEducators: educators.filter(e => e.status === 'active').length,
      pendingApplications: educators.filter(e => e.status !== 'active').length,
      activeBookings: bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length,
      completedSessions: bookings.filter(b => b.status === 'completed').length,
      totalVolumeUgx: payments.reduce((sum, p) => sum + p.amount_ugx, 0),
      platformRevenueUgx: payments.reduce((sum, p) => sum + p.platform_fee_ugx, 0),
      openRequests: 1
    };
  },

  async getVerificationQueue() {
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('iskilllink_user') : null;
      const userId = userStr ? JSON.parse(userStr)?.id : 'usr-admin-ashabahebwa';
      const res = await fetch(`${API_BASE}/admin/verification-queue`, {
        headers: { 'x-user-id': userId }
      });
      if (res.ok) return await handleResponse<Educator[]>(res);
    } catch {}
    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    return educators
      .filter(e => e.status !== 'active')
      .map(e => ({ ...e, user: users.find(u => u.id === e.user_id) }));
  },

  async updateVerificationStep(data: {
    educator_id: string;
    step: 'national_id' | 'background_check' | 'interview' | 'skill_assessment';
    status: string;
    notes?: string;
    admin_name?: string;
  }) {
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('iskilllink_user') : null;
      const userId = userStr ? JSON.parse(userStr)?.id : 'usr-admin-ashabahebwa';
      const res = await fetch(`${API_BASE}/admin/verification-step`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify(data)
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}
    return { success: true, verification: { status: data.status } };
  },

  async updateEducatorStatus(educatorId: string, status: string, notes?: string, adminName?: string) {
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('iskilllink_user') : null;
      const userId = userStr ? JSON.parse(userStr)?.id : 'usr-admin-ashabahebwa';
      const res = await fetch(`${API_BASE}/admin/educator-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({ educator_id: educatorId, status, notes, admin_name: adminName })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const edu = educators.find(e => e.id === educatorId);
    if (edu) {
      edu.status = status as any;
      setLocalStorageData('educators', educators);
    }
    return { success: true, educator: edu! };
  },

  async getAuditLogs() {
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('iskilllink_user') : null;
      const userId = userStr ? JSON.parse(userStr)?.id : 'usr-admin-ashabahebwa';
      const res = await fetch(`${API_BASE}/admin/audit-logs`, {
        headers: { 'x-user-id': userId }
      });
      if (res.ok) return await handleResponse<AdminAction[]>(res);
    } catch {}
    return getLocalStorageData<AdminAction[]>('audit_logs', initialLocalAuditLogs);
  },

  async getMatchesForRequest(requestId: string) {
    try {
      const res = await fetch(`${API_BASE}/learner-requests/${requestId}/matches`);
      if (res.ok) return await handleResponse<any>(res);
    } catch {}

    const educators = getLocalStorageData<Educator[]>('educators', initialLocalEducators);
    const users = getLocalStorageData<any[]>('users', initialLocalUsers);
    const matches: MatchEvaluation[] = educators.slice(0, 3).map(e => ({
      educator: { ...e, user: users.find(u => u.id === e.user_id) },
      match_score: 95,
      match_reasons: [
        `Practical trade match`,
        `Proximity in Mbarara & Ankole region`,
        `Verified educator in good standing`
      ],
      breakdown: { skillMatch: 35, formatMatch: 20, locationMatch: 15, budgetMatch: 15, experienceMatch: 10 }
    }));
    return { request: { id: requestId } as any, matches };
  },

  async assignMatch(requestId: string, educatorId: string, adminName?: string) {
    try {
      const res = await fetch(`${API_BASE}/learner-requests/${requestId}/assign-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ educator_id: educatorId, admin_name: adminName })
      });
      if (res.ok) return await handleResponse<any>(res);
    } catch {}
    return { success: true, match: { requestId, educatorId } };
  }
};
