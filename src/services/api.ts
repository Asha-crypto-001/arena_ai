import {
  User, Educator, Category, Skill, LearnerRequest,
  Booking, Payment, Review, Message, Notification,
  AdminAction, AdminMetrics, MatchEvaluation
} from '../types';

const API_BASE = '/api';

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
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse<{ user: User; learnerProfile: any; educatorProfile: any; token: string }>(res);
  },

  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ user: User; learnerProfile: any; educatorProfile: any; token: string }>(res);
  },

  async getMe(userId?: string) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    const res = await fetch(`${API_BASE}/auth/me${query}`);
    return handleResponse<{ user: User; learnerProfile: any; educatorProfile: any }>(res);
  },

  async getDemoUsers() {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return handleResponse<Array<{ id: string; name: string; role: string; label: string }>>(res);
  },

  // Categories & Skills
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    return handleResponse<Category[]>(res);
  },

  async getSkills(categoryId?: string, popular?: boolean) {
    const params = new URLSearchParams();
    if (categoryId) params.append('category_id', categoryId);
    if (popular) params.append('popular', 'true');
    const res = await fetch(`${API_BASE}/skills?${params.toString()}`);
    return handleResponse<Skill[]>(res);
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
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) {
        params.append(k, String(v));
      }
    });
    const res = await fetch(`${API_BASE}/educators?${params.toString()}`);
    return handleResponse<Educator[]>(res);
  },

  async getEducatorById(id: string) {
    const res = await fetch(`${API_BASE}/educators/${id}`);
    return handleResponse<Educator>(res);
  },

  async submitEducatorOnboarding(data: any) {
    const res = await fetch(`${API_BASE}/educators/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; educator: Educator }>(res);
  },

  async updateEducator(id: string, updates: Partial<Educator>) {
    const res = await fetch(`${API_BASE}/educators/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return handleResponse<Educator>(res);
  },

  // Learner Requests & Matching
  async getLearnerRequests(filters: { learner_id?: string; status?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.learner_id) params.append('learner_id', filters.learner_id);
    if (filters.status) params.append('status', filters.status);
    const res = await fetch(`${API_BASE}/learner-requests?${params.toString()}`);
    return handleResponse<LearnerRequest[]>(res);
  },

  async createLearnerRequest(data: Partial<LearnerRequest>) {
    const res = await fetch(`${API_BASE}/learner-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ request: LearnerRequest; potentialMatches: MatchEvaluation[] }>(res);
  },

  async getMatchesForRequest(requestId: string) {
    const res = await fetch(`${API_BASE}/learner-requests/${requestId}/matches`);
    return handleResponse<{ request: LearnerRequest; matches: MatchEvaluation[] }>(res);
  },

  async assignMatch(requestId: string, educatorId: string, adminName?: string) {
    const res = await fetch(`${API_BASE}/learner-requests/${requestId}/assign-match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ educator_id: educatorId, admin_name: adminName })
    });
    return handleResponse<{ success: boolean; match: any }>(res);
  },

  // Bookings
  async getBookings(filters: { learner_id?: string; educator_id?: string; status?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.learner_id) params.append('learner_id', filters.learner_id);
    if (filters.educator_id) params.append('educator_id', filters.educator_id);
    if (filters.status) params.append('status', filters.status);
    const res = await fetch(`${API_BASE}/bookings?${params.toString()}`);
    return handleResponse<Booking[]>(res);
  },

  async createBooking(data: any) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; booking: Booking }>(res);
  },

  async updateBookingStatus(id: string, status: string, reason?: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, cancellation_reason: reason })
    });
    return handleResponse<Booking>(res);
  },

  async updateBookingProgress(id: string, progress: number) {
    const res = await fetch(`${API_BASE}/bookings/${id}/progress`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestone_progress: progress })
    });
    return handleResponse<Booking>(res);
  },

  // Payments & Escrow
  async getPayments(filters: { learner_id?: string; educator_id?: string; status?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.learner_id) params.append('learner_id', filters.learner_id);
    if (filters.educator_id) params.append('educator_id', filters.educator_id);
    if (filters.status) params.append('status', filters.status);
    const res = await fetch(`${API_BASE}/payments?${params.toString()}`);
    return handleResponse<Payment[]>(res);
  },

  async simulatePayment(bookingId: string, method: string = 'mtn_momo', phoneNumber: string = '+256 772 000 000') {
    const res = await fetch(`${API_BASE}/payments/simulate-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, method, phone_number: phoneNumber })
    });
    return handleResponse<{ success: boolean; message: string; payment: Payment }>(res);
  },

  async releasePayout(paymentId: string, adminName: string = 'Admin') {
    const res = await fetch(`${API_BASE}/payments/${paymentId}/release-payout`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_name: adminName })
    });
    return handleResponse<{ success: boolean; payment: Payment }>(res);
  },

  // Reviews
  async getReviews(educatorId?: string) {
    const query = educatorId ? `?educator_id=${educatorId}` : '';
    const res = await fetch(`${API_BASE}/reviews${query}`);
    return handleResponse<Review[]>(res);
  },

  async submitReview(data: any) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; review: Review }>(res);
  },

  async replyToReview(reviewId: string, reply: string) {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    });
    return handleResponse<{ success: boolean; review: Review }>(res);
  },

  // Messages & Notifications
  async getMessages(userId: string) {
    const res = await fetch(`${API_BASE}/messages?user_id=${userId}`);
    return handleResponse<Message[]>(res);
  },

  async sendMessage(senderId: string, receiverId: string, content: string) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, content })
    });
    return handleResponse<Message>(res);
  },

  async getNotifications(userId: string) {
    const res = await fetch(`${API_BASE}/notifications?user_id=${userId}`);
    return handleResponse<Notification[]>(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH'
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Admin Operations
  async getAdminMetrics() {
    const res = await fetch(`${API_BASE}/admin/metrics`);
    return handleResponse<AdminMetrics>(res);
  },

  async getVerificationQueue() {
    const res = await fetch(`${API_BASE}/admin/verification-queue`);
    return handleResponse<Educator[]>(res);
  },

  async updateVerificationStep(data: {
    educator_id: string;
    step: 'national_id' | 'background_check' | 'interview' | 'skill_assessment';
    status: string;
    notes?: string;
    admin_name?: string;
  }) {
    const res = await fetch(`${API_BASE}/admin/verification-step`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; verification: any }>(res);
  },

  async updateEducatorStatus(educatorId: string, status: string, notes?: string, adminName?: string) {
    const res = await fetch(`${API_BASE}/admin/educator-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ educator_id: educatorId, status, notes, admin_name: adminName })
    });
    return handleResponse<{ success: boolean; educator: Educator }>(res);
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/admin/audit-logs`);
    return handleResponse<AdminAction[]>(res);
  },

  async resetDatabase() {
    const res = await fetch(`${API_BASE}/system/reset`, {
      method: 'POST'
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  }
};
