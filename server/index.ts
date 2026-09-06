import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { db } from './db.js';
import { computeMatchesForRequest } from './matching.js';
import {
  User, Learner, Educator, EducatorSkill, Qualification,
  Portfolio, Verification, LearnerRequest, Booking, Payment,
  Review, Message, Notification
} from './types.js';

const app = express();
const PORT: number = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// ==========================================
// AUTHENTICATION & ACCESS CONTROL
// ==========================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(String(email).trim());
  if (!user) {
    return res.status(401).json({ error: 'Account not found with this email. Please register.' });
  }

  if (user.password_hash !== password) {
    return res.status(401).json({ error: 'Incorrect password. Please try again.' });
  }

  let learnerProfile = null;
  let educatorProfile = null;

  if (user.role === 'learner') {
    learnerProfile = db.findLearnerByUserId(user.id);
  } else if (user.role === 'educator') {
    educatorProfile = db.findEducatorByUserId(user.id);
  }

  res.json({
    user,
    learnerProfile,
    educatorProfile,
    token: `token-${user.id}-${Date.now()}`
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, password, name, phone, role, location, bio, learning_interests, preferred_format } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Email, password, full name, and role are required' });
  }

  const trimmedEmail = String(email).trim().toLowerCase();
  const existing = db.findUserByEmail(trimmedEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
  }

  const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newUser: User = {
    id: userId,
    email: trimmedEmail,
    password_hash: password,
    role: role as 'learner' | 'educator' | 'admin',
    name: String(name).trim(),
    phone: phone || '+256 744 024 529',
    avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.createUser(newUser);

  let learnerProfile: Learner | null = null;
  let educatorProfile: Educator | null = null;

  if (role === 'learner') {
    learnerProfile = {
      id: `lrn-${Date.now()}`,
      user_id: userId,
      location: location || 'Mbarara, Uganda',
      bio: bio || 'Interested in learning practical skills.',
      learning_interests: learning_interests || [],
      preferred_format: preferred_format || 'in-person',
      created_at: new Date().toISOString()
    };
    db.createLearner(learnerProfile);
  } else if (role === 'educator') {
    educatorProfile = {
      id: `edu-${Date.now()}`,
      user_id: userId,
      title: 'Practical Skills Educator',
      bio: bio || 'Sharing practical vocational expertise in Uganda.',
      educator_type: 'practitioner',
      years_experience: 1,
      location: location || 'Mbarara, Uganda',
      service_area: 'Mbarara City & Western Region',
      teaching_formats: ['in-person'],
      languages: ['English', 'Runyankole'],
      equipment_provided: 'Workshop practical equipment',
      hourly_rate_ugx: 35000,
      status: 'applied',
      rating: 0,
      total_reviews: 0,
      total_students: 0,
      created_at: new Date().toISOString()
    };
    db.createEducator(educatorProfile);

    // Create verification entry
    db.addVerification({
      id: `v-${educatorProfile.id}`,
      educator_id: educatorProfile.id,
      national_id_number: 'CM-PENDING-SUBMISSION',
      national_id_status: 'pending',
      background_check_status: 'pending',
      interview_status: 'pending',
      skill_assessment_status: 'pending',
      notes: 'New educator registered. Pending verification.'
    });

    // Notify Ashabahebwa Hassan (Admin)
    db.createNotification({
      id: `notif-${Date.now()}`,
      user_id: 'usr-admin-ashabahebwa',
      type: 'system_alert',
      title: 'New Educator Registered',
      message: `${name} has registered as an educator from ${location || 'Mbarara'}.`,
      link: '/admin-dashboard',
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  res.status(201).json({
    user: newUser,
    learnerProfile,
    educatorProfile,
    token: `token-${newUser.id}-${Date.now()}`
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const rawHeader = req.headers['x-user-id'];
  const headerUserId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  const userId = typeof req.query.userId === 'string' ? req.query.userId : headerUserId;

  if (!userId) {
    return res.json({ user: null, learnerProfile: null, educatorProfile: null });
  }

  const user = db.findUserById(String(userId));
  if (!user) {
    return res.json({ user: null, learnerProfile: null, educatorProfile: null });
  }

  let learnerProfile = null;
  let educatorProfile = null;

  if (user.role === 'learner') {
    learnerProfile = db.findLearnerByUserId(user.id);
  } else if (user.role === 'educator') {
    educatorProfile = db.findEducatorByUserId(user.id);
  }

  res.json({
    user,
    learnerProfile,
    educatorProfile
  });
});

app.patch('/api/users/:id/avatar', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { avatar_url } = req.body;

  if (!avatar_url) {
    return res.status(400).json({ error: 'avatar_url is required' });
  }

  const updatedUser = db.updateUser(id, { avatar_url });
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user: updatedUser });
});

app.patch('/api/users/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { name, phone, avatar_url } = req.body;

  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  const updatedUser = db.updateUser(id, updates);
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user: updatedUser });
});

// ==========================================
// CATEGORIES & SKILLS
// ==========================================

app.get('/api/categories', (req: Request, res: Response) => {
  const categories = db.getCategories();
  res.json(categories);
});

app.get('/api/skills', (req: Request, res: Response) => {
  const category_id = typeof req.query.category_id === 'string' ? req.query.category_id : undefined;
  const popular = req.query.popular === 'true';

  let skills = db.getSkills();

  if (category_id) {
    skills = skills.filter(s => s.category_id === category_id);
  }
  if (popular) {
    skills = skills.filter(s => s.popular);
  }

  res.json(skills);
});

// ==========================================
// EDUCATORS
// ==========================================

app.get('/api/educators', (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const category_id = typeof req.query.category_id === 'string' ? req.query.category_id : undefined;
  const format = typeof req.query.format === 'string' ? req.query.format : undefined;
  const location = typeof req.query.location === 'string' ? req.query.location : undefined;
  const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
  const rating = req.query.rating ? Number(req.query.rating) : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const sort = typeof req.query.sort === 'string' ? req.query.sort : undefined;
  const featured = req.query.featured === 'true';

  let educators = db.getEducators().map(e => {
    return db.findEducatorById(e.id)!;
  }).filter(Boolean);

  // Filter status
  if (status) {
    educators = educators.filter(e => e.status === status);
  } else {
    educators = educators.filter(e => e.status === 'active' || e.status === 'approved');
  }

  if (featured) {
    educators = educators.filter(e => e.featured);
  }

  // Category filter
  if (category_id && category_id !== 'all') {
    educators = educators.filter(e => {
      return e.skills.some(s => s.category_id === category_id);
    });
  }

  // Search filter
  if (search && search.trim() !== '') {
    const term = search.toLowerCase();
    educators = educators.filter(e => {
      const name = e.user?.name.toLowerCase() || '';
      const title = e.title.toLowerCase();
      const bio = e.bio.toLowerCase();
      const skills = e.skills.map(s => s.skill_name.toLowerCase()).join(' ');
      return name.includes(term) || title.includes(term) || bio.includes(term) || skills.includes(term);
    });
  }

  // Format filter
  if (format && format !== 'all') {
    educators = educators.filter(e => e.teaching_formats.includes(format as any));
  }

  // Location filter
  if (location && location !== 'all') {
    const loc = location.toLowerCase();
    educators = educators.filter(e => {
      return e.location.toLowerCase().includes(loc) || e.service_area.toLowerCase().includes(loc);
    });
  }

  // Price filters
  if (minPrice !== undefined) {
    educators = educators.filter(e => e.hourly_rate_ugx >= minPrice);
  }
  if (maxPrice !== undefined) {
    educators = educators.filter(e => e.hourly_rate_ugx <= maxPrice);
  }

  // Rating filter
  if (rating !== undefined) {
    educators = educators.filter(e => e.rating >= rating);
  }

  // Sorting
  if (sort === 'rating') {
    educators.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'price_asc') {
    educators.sort((a, b) => a.hourly_rate_ugx - b.hourly_rate_ugx);
  } else if (sort === 'price_desc') {
    educators.sort((a, b) => b.hourly_rate_ugx - a.hourly_rate_ugx);
  } else if (sort === 'experience') {
    educators.sort((a, b) => b.years_experience - a.years_experience);
  } else {
    educators.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating);
  }

  res.json(educators);
});

app.get('/api/educators/:id', (req: Request, res: Response) => {
  const educator = db.findEducatorById(String(req.params.id));
  if (!educator) {
    return res.status(404).json({ error: 'Educator not found' });
  }
  res.json(educator);
});

// Educator Multi-step Application / Onboarding
app.post('/api/educators/onboard', (req: Request, res: Response) => {
  const {
    name, email, phone, location, educator_type, title, bio,
    years_experience, service_area, teaching_formats, languages,
    equipment_provided, hourly_rate_ugx, package_rate_ugx,
    skills, qualifications, portfolios, national_id_number, password
  } = req.body;

  if (!name || !email || !title || !skills || skills.length === 0) {
    return res.status(400).json({ error: 'Missing required onboarding fields' });
  }

  let user = db.findUserByEmail(String(email).trim());
  if (!user) {
    user = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email: String(email).trim(),
      password_hash: password || 'edu123',
      role: 'educator',
      name: String(name).trim(),
      phone: phone || '+256 744 024 529',
      avatar_url: req.body.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.createUser(user);
  } else if (req.body.avatar_url) {
    db.updateUser(user.id, { avatar_url: req.body.avatar_url });
    user.avatar_url = req.body.avatar_url;
  }

  const educatorId = `edu-${Date.now()}`;
  const newEducator: Educator = {
    id: educatorId,
    user_id: user.id,
    title,
    bio: bio || '',
    educator_type: educator_type || 'practitioner',
    years_experience: Number(years_experience) || 1,
    location: location || 'Mbarara, Uganda',
    service_area: service_area || 'Mbarara & Western Uganda',
    teaching_formats: teaching_formats || ['in-person'],
    languages: languages || ['English', 'Runyankole'],
    equipment_provided: equipment_provided || 'Workshop equipment provided',
    hourly_rate_ugx: Number(hourly_rate_ugx) || 35000,
    package_rate_ugx: package_rate_ugx ? Number(package_rate_ugx) : undefined,
    status: 'applied',
    verification_notes: 'New application submitted via platform. Pending review by Ashabahebwa Hassan.',
    rating: 0,
    total_reviews: 0,
    total_students: 0,
    created_at: new Date().toISOString()
  };

  db.createEducator(newEducator);

  // Add skills
  if (Array.isArray(skills)) {
    skills.forEach((s: any, idx: number) => {
      db.addEducatorSkill({
        id: `es-${educatorId}-${idx}`,
        educator_id: educatorId,
        skill_id: s.skill_id || `custom-skill-${idx}`,
        skill_name: s.skill_name || s.name || 'Skill',
        category_id: s.category_id || 'cat-crafts',
        proficiency_level: s.proficiency_level || 'advanced',
        hourly_rate_ugx: Number(s.hourly_rate_ugx) || newEducator.hourly_rate_ugx,
        description: s.description || ''
      });
    });
  }

  // Add qualifications
  if (Array.isArray(qualifications)) {
    qualifications.forEach((q: any, idx: number) => {
      db.addQualification({
        id: `q-${educatorId}-${idx}`,
        educator_id: educatorId,
        title: q.title || 'Qualification',
        institution: q.institution || 'Uganda Vocational Institute',
        year: Number(q.year) || 2020,
        verified: false,
        document_url: q.document_url
      });
    });
  }

  // Add portfolios
  if (Array.isArray(portfolios)) {
    portfolios.forEach((p: any, idx: number) => {
      db.addPortfolio({
        id: `p-${educatorId}-${idx}`,
        educator_id: educatorId,
        title: p.title || 'Work Sample',
        description: p.description || '',
        image_url: p.image_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        tag: p.tag || 'Practical Work'
      });
    });
  }

  // Create verification entry
  db.addVerification({
    id: `v-${educatorId}`,
    educator_id: educatorId,
    national_id_number: national_id_number || 'CM-PENDING-SUBMISSION',
    national_id_status: 'pending',
    background_check_status: 'pending',
    interview_status: 'pending',
    skill_assessment_status: 'pending',
    notes: 'Application registered in verification queue.'
  });

  // Notify Ashabahebwa Hassan (Admin)
  db.createNotification({
    id: `notif-${Date.now()}`,
    user_id: 'usr-admin-ashabahebwa',
    type: 'system_alert',
    title: 'New Educator Application Submitted',
    message: `${name} has applied as an educator for "${title}". Review in Verification Queue.`,
    link: '/admin-dashboard',
    is_read: false,
    created_at: new Date().toISOString()
  });

  db.logAdminAction({
    admin_id: 'system',
    admin_name: 'System Automations',
    action_type: 'EDUCATOR_APPLICATION_SUBMITTED',
    target_entity: 'Educator',
    target_id: educatorId,
    details: `${name} submitted onboarding application.`
  });

  const fullEdu = db.findEducatorById(educatorId);
  res.status(201).json({ success: true, educator: fullEdu });
});

// Update Educator Profile
app.patch('/api/educators/:id', (req: Request, res: Response) => {
  const updated = db.updateEducator(String(req.params.id), req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Educator not found' });
  }
  res.json(db.findEducatorById(String(req.params.id)));
});

// ==========================================
// LEARNER REQUESTS & MATCHING
// ==========================================

app.get('/api/learner-requests', (req: Request, res: Response) => {
  const learner_id = typeof req.query.learner_id === 'string' ? req.query.learner_id : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  let requests = db.getLearnerRequests();

  if (learner_id) {
    requests = requests.filter(r => r.learner_id === learner_id);
  }
  if (status) {
    requests = requests.filter(r => r.status === status);
  }

  res.json(requests);
});

app.post('/api/learner-requests', (req: Request, res: Response) => {
  const {
    learner_id, skill_id, skill_name, skill_level, learning_goal,
    format_preference, location, preferred_schedule, frequency,
    budget_ugx, additional_notes, contact_phone, learner_name, learner_email
  } = req.body;

  if (!skill_name || !learning_goal || !budget_ugx) {
    return res.status(400).json({ error: 'Skill name, learning goal, and budget are required' });
  }

  const requestId = `req-${Date.now()}`;
  const newRequest: LearnerRequest = {
    id: requestId,
    learner_id: learner_id || 'lrn-1',
    skill_id,
    skill_name,
    skill_level: skill_level || 'beginner',
    learning_goal,
    format_preference: format_preference || 'in-person',
    location: location || 'Mbarara, Uganda',
    preferred_schedule: preferred_schedule || 'Weekends',
    frequency: frequency || '2 sessions per week',
    budget_ugx: Number(budget_ugx),
    additional_notes: additional_notes || '',
    status: 'open',
    contact_phone: contact_phone || '+256 744 024 529',
    learner_name: learner_name || 'Learner',
    learner_email: learner_email || 'learner@iskilllink.ug',
    created_at: new Date().toISOString()
  };

  db.createLearnerRequest(newRequest);

  // Compute rule-based matches automatically
  const potentialMatches = computeMatchesForRequest(newRequest);
  if (potentialMatches.length > 0 && potentialMatches[0].match_score >= 80) {
    const top = potentialMatches[0];
    db.createMatch({
      id: `match-${Date.now()}`,
      request_id: requestId,
      educator_id: top.educator.id,
      match_score: top.match_score,
      match_reasons: top.match_reasons,
      matched_by: 'system',
      status: 'suggested',
      created_at: new Date().toISOString()
    });

    db.updateLearnerRequest(requestId, { status: 'matched' });
  }

  // Notify Ashabahebwa Hassan (Admin)
  db.createNotification({
    id: `notif-${Date.now()}`,
    user_id: 'usr-admin-ashabahebwa',
    type: 'match_found',
    title: 'New Skill Request Received',
    message: `${newRequest.learner_name} requested training for "${newRequest.skill_name}" (Budget: UGX ${newRequest.budget_ugx.toLocaleString()})`,
    link: '/admin-dashboard',
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.status(201).json({
    request: newRequest,
    potentialMatches: potentialMatches.slice(0, 5)
  });
});

app.get('/api/learner-requests/:id/matches', (req: Request, res: Response) => {
  const request = db.getLearnerRequests().find(r => r.id === String(req.params.id));
  if (!request) {
    return res.status(404).json({ error: 'Skill request not found' });
  }

  const matches = computeMatchesForRequest(request);
  res.json({
    request,
    matches
  });
});

app.post('/api/learner-requests/:id/assign-match', (req: Request, res: Response) => {
  const { educator_id, admin_id, admin_name } = req.body;
  const request = db.getLearnerRequests().find(r => r.id === String(req.params.id));
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const educator = db.findEducatorById(educator_id);
  if (!educator) {
    return res.status(404).json({ error: 'Educator not found' });
  }

  const newMatch = db.createMatch({
    id: `match-${Date.now()}`,
    request_id: request.id,
    educator_id: educator.id,
    match_score: 95,
    match_reasons: [
      `Manually assigned by Administrator (${admin_name || 'Ashabahebwa Hassan'})`,
      `Verified expertise in ${request.skill_name}`,
      `Compatible service location in ${educator.location}`
    ],
    matched_by: 'admin',
    status: 'suggested',
    created_at: new Date().toISOString()
  });

  db.updateLearnerRequest(request.id, { status: 'matched' });

  db.logAdminAction({
    admin_id: admin_id || 'usr-admin-ashabahebwa',
    admin_name: admin_name || 'Ashabahebwa Hassan',
    action_type: 'ASSIGN_EDUCATOR_MATCH',
    target_entity: 'LearnerRequest',
    target_id: request.id,
    details: `Matched learner ${request.learner_name} with educator ${educator.user?.name} (${educator.title}).`
  });

  // Notify Learner
  db.createNotification({
    id: `notif-${Date.now()}`,
    user_id: request.learner_id.startsWith('usr') ? request.learner_id : 'usr-learner-1',
    type: 'match_found',
    title: 'Educator Match Found!',
    message: `iSkillLink matched your request for "${request.skill_name}" with ${educator.user?.name}.`,
    link: `/educators/${educator.id}`,
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.json({ success: true, match: newMatch });
});

// ==========================================
// BOOKINGS & SESSIONS
// ==========================================

app.get('/api/bookings', (req: Request, res: Response) => {
  const learner_id = typeof req.query.learner_id === 'string' ? req.query.learner_id : undefined;
  const educator_id = typeof req.query.educator_id === 'string' ? req.query.educator_id : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  let bookings = db.getBookings();

  if (learner_id) {
    bookings = bookings.filter(b => b.learner_id === learner_id);
  }
  if (educator_id) {
    bookings = bookings.filter(b => b.educator_id === educator_id);
  }
  if (status) {
    bookings = bookings.filter(b => b.status === status);
  }

  // Populate educator & learner details for rich display
  const enriched = bookings.map(b => {
    const educator = db.findEducatorById(b.educator_id);
    const learner = db.getLearners().find(l => l.id === b.learner_id);
    const learnerUser = learner ? db.findUserById(learner.user_id) : null;
    const payment = db.getPayments().find(p => p.booking_id === b.id);
    const review = db.getReviews().find(r => r.booking_id === b.id);

    return {
      ...b,
      educator,
      learner,
      learnerUser,
      payment,
      review
    };
  });

  res.json(enriched);
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const {
    learner_id, educator_id, skill_id, skill_name, format,
    location_or_link, scheduled_date, start_time, duration_hours,
    total_amount_ugx, notes
  } = req.body;

  if (!learner_id || !educator_id || !scheduled_date || !total_amount_ugx) {
    return res.status(400).json({ error: 'Missing required booking parameters' });
  }

  const total = Number(total_amount_ugx);
  const platformFee = Math.round(total * 0.10); // 10% platform commission
  const educatorPayout = total - platformFee;

  const bookingId = `bk-${Date.now()}`;
  const newBooking: Booking = {
    id: bookingId,
    learner_id,
    educator_id,
    skill_id,
    skill_name: skill_name || 'Practical Skill Session',
    format: format || 'in-person',
    location_or_link: location_or_link || 'Educator Workshop / In-Person',
    scheduled_date,
    start_time: start_time || '10:00',
    duration_hours: Number(duration_hours) || 2,
    total_amount_ugx: total,
    platform_fee_ugx: platformFee,
    educator_payout_ugx: educatorPayout,
    status: 'pending',
    notes: notes || '',
    milestone_progress: 0,
    created_at: new Date().toISOString()
  };

  db.createBooking(newBooking);

  // Create associated payment record in 'pending' status
  const paymentId = `pay-${Date.now()}`;
  db.createPayment({
    id: paymentId,
    booking_id: bookingId,
    learner_id,
    educator_id,
    amount_ugx: total,
    platform_fee_ugx: platformFee,
    payout_amount_ugx: educatorPayout,
    method: 'mtn_momo',
    payment_reference: `ESCROW-UG-${Date.now().toString().slice(-6)}`,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Notify educator
  const educator = db.findEducatorById(educator_id);
  if (educator && educator.user) {
    db.createNotification({
      id: `notif-${Date.now()}`,
      user_id: educator.user.id,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `You have received a new booking for "${newBooking.skill_name}" on ${scheduled_date}.`,
      link: '/educator-dashboard/bookings',
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  res.status(201).json({ success: true, booking: newBooking });
});

app.patch('/api/bookings/:id/status', (req: Request, res: Response) => {
  const { status, cancellation_reason } = req.body;
  const booking = db.getBookings().find(b => b.id === String(req.params.id));

  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const updates: Partial<Booking> = { status };
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
    updates.milestone_progress = 100;

    // Update payment to completed if applicable
    const payment = db.getPayments().find(p => p.booking_id === booking.id);
    if (payment) {
      db.updatePayment(payment.id, { status: 'completed' });
    }
  }

  const updated = db.updateBooking(booking.id, updates);
  res.json(updated);
});

app.patch('/api/bookings/:id/progress', (req: Request, res: Response) => {
  const { milestone_progress } = req.body;
  const updated = db.updateBooking(String(req.params.id), {
    milestone_progress: Math.min(100, Math.max(0, Number(milestone_progress)))
  });
  if (!updated) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  res.json(updated);
});

// ==========================================
// PAYMENTS & ESCROW
// ==========================================

app.get('/api/payments', (req: Request, res: Response) => {
  const learner_id = typeof req.query.learner_id === 'string' ? req.query.learner_id : undefined;
  const educator_id = typeof req.query.educator_id === 'string' ? req.query.educator_id : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  let payments = db.getPayments();

  if (learner_id) {
    payments = payments.filter(p => p.learner_id === learner_id);
  }
  if (educator_id) {
    payments = payments.filter(p => p.educator_id === educator_id);
  }
  if (status) {
    payments = payments.filter(p => p.status === status as any);
  }

  res.json(payments);
});

// Simulate Ugandan Mobile Money (MTN / Airtel) Escrow Payment
app.post('/api/payments/simulate-payment', (req: Request, res: Response) => {
  const { booking_id, method, phone_number } = req.body;
  const payment = db.getPayments().find(p => p.booking_id === booking_id);

  if (!payment) {
    return res.status(404).json({ error: 'Payment record not found for this booking' });
  }

  const referenceCode = `${(method || 'MTN').toUpperCase()}-UG-${Date.now().toString().slice(-6)}`;
  
  db.updatePayment(payment.id, {
    method: method || 'mtn_momo',
    payment_reference: referenceCode,
    status: 'paid'
  });

  // Update booking to confirmed
  db.updateBooking(booking_id, { status: 'confirmed' });

  // Record transaction in ledger
  db.createTransaction({
    id: `tx-${Date.now()}`,
    payment_id: payment.id,
    type: 'learner_charge',
    amount_ugx: payment.amount_ugx,
    description: `Escrow payment via ${method || 'MTN MoMo'} (Ref: ${referenceCode})`,
    status: 'completed',
    created_at: new Date().toISOString()
  });

  // Notify Educator
  const educator = db.findEducatorById(payment.educator_id);
  if (educator && educator.user) {
    db.createNotification({
      id: `notif-${Date.now()}`,
      user_id: educator.user.id,
      type: 'payment_update',
      title: 'Payment Secured in Escrow',
      message: `Learner deposited UGX ${payment.amount_ugx.toLocaleString()} into iSkillLink Escrow. Funds will be disbursed upon session completion.`,
      link: '/educator-dashboard/earnings',
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    message: 'Payment simulated and recorded into iSkillLink Escrow successfully',
    payment: db.getPayments().find(p => p.id === payment.id)
  });
});

// Admin Release Payout to Educator
app.patch('/api/payments/:id/release-payout', (req: Request, res: Response) => {
  const { admin_id, admin_name } = req.body;
  const payment = db.getPayments().find(p => p.id === String(req.params.id));

  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  db.updatePayment(payment.id, { status: 'completed' });

  // Create educator payout transaction
  db.createTransaction({
    id: `tx-${Date.now()}-payout`,
    payment_id: payment.id,
    type: 'educator_payout',
    amount_ugx: payment.payout_amount_ugx,
    description: `Direct Mobile Money payout to educator (Less 10% platform fee)`,
    status: 'completed',
    created_at: new Date().toISOString()
  });

  // Create platform commission transaction
  db.createTransaction({
    id: `tx-${Date.now()}-comm`,
    payment_id: payment.id,
    type: 'platform_commission',
    amount_ugx: payment.platform_fee_ugx,
    description: `iSkillLink 10% facilitation commission`,
    status: 'completed',
    created_at: new Date().toISOString()
  });

  db.logAdminAction({
    admin_id: admin_id || 'usr-admin-ashabahebwa',
    admin_name: admin_name || 'Ashabahebwa Hassan',
    action_type: 'RELEASE_EDUCATOR_PAYOUT',
    target_entity: 'Payment',
    target_id: payment.id,
    details: `Disbursed UGX ${payment.payout_amount_ugx.toLocaleString()} to Educator ${payment.educator_id}. Retained UGX ${payment.platform_fee_ugx.toLocaleString()} commission.`
  });

  res.json({ success: true, payment: db.getPayments().find(p => p.id === payment.id) });
});

// ==========================================
// REVIEWS & FEEDBACK
// ==========================================

app.get('/api/reviews', (req: Request, res: Response) => {
  const educator_id = typeof req.query.educator_id === 'string' ? req.query.educator_id : undefined;
  let reviews = db.getReviews();

  if (educator_id) {
    reviews = reviews.filter(r => r.educator_id === educator_id);
  }

  res.json(reviews);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const {
    booking_id, educator_id, learner_id, learner_name, learner_avatar,
    rating, skill_rating, punctuality_rating, communication_rating, comment
  } = req.body;

  if (!educator_id || !rating || !comment) {
    return res.status(400).json({ error: 'Educator, rating, and review comment are required' });
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    booking_id: booking_id || `bk-${Date.now()}`,
    educator_id,
    learner_id: learner_id || 'lrn-1',
    learner_name: learner_name || 'Verified Learner',
    learner_avatar: learner_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    rating: Number(rating),
    skill_rating: Number(skill_rating) || Number(rating),
    punctuality_rating: Number(punctuality_rating) || Number(rating),
    communication_rating: Number(communication_rating) || Number(rating),
    comment,
    is_verified: true,
    is_moderated: true,
    created_at: new Date().toISOString()
  };

  db.createReview(newReview);

  // Notify educator
  const educator = db.findEducatorById(educator_id);
  if (educator && educator.user) {
    db.createNotification({
      id: `notif-${Date.now()}`,
      user_id: educator.user.id,
      type: 'system_alert',
      title: 'New Student Review Received',
      message: `${newReview.learner_name} gave you a ${newReview.rating}-star review!`,
      link: '/educator-dashboard/reviews',
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  res.status(201).json({ success: true, review: newReview });
});

app.post('/api/reviews/:id/reply', (req: Request, res: Response) => {
  const { reply } = req.body;
  if (!reply) {
    return res.status(400).json({ error: 'Reply text required' });
  }

  const updated = db.replyToReview(String(req.params.id), reply);
  if (!updated) {
    return res.status(404).json({ error: 'Review not found' });
  }

  res.json({ success: true, review: updated });
});

// ==========================================
// IN-APP MESSAGES & NOTIFICATIONS
// ==========================================

app.get('/api/messages', (req: Request, res: Response) => {
  const user_id = typeof req.query.user_id === 'string' ? req.query.user_id : undefined;
  const conversation_id = typeof req.query.conversation_id === 'string' ? req.query.conversation_id : undefined;
  let messages = db.getMessages();

  if (conversation_id) {
    messages = messages.filter(m => m.conversation_id === conversation_id);
  } else if (user_id) {
    messages = messages.filter(m => m.sender_id === user_id || m.receiver_id === user_id);
  }

  res.json(messages);
});

app.post('/api/messages', (req: Request, res: Response) => {
  const { conversation_id, sender_id, receiver_id, content } = req.body;
  if (!sender_id || !receiver_id || !content) {
    return res.status(400).json({ error: 'Sender, receiver, and content are required' });
  }

  const msgId = `msg-${Date.now()}`;
  const convId = conversation_id || `conv-${[sender_id, receiver_id].sort().join('-')}`;

  const newMsg: Message = {
    id: msgId,
    conversation_id: convId,
    sender_id,
    receiver_id,
    content,
    is_read: false,
    created_at: new Date().toISOString()
  };

  db.createMessage(newMsg);

  // Create notification for receiver
  const sender = db.findUserById(sender_id);
  db.createNotification({
    id: `notif-${Date.now()}`,
    user_id: receiver_id,
    type: 'system_alert',
    title: `New message from ${sender?.name || 'User'}`,
    message: content.length > 60 ? `${content.substring(0, 60)}...` : content,
    link: '/dashboard/messages',
    is_read: false,
    created_at: new Date().toISOString()
  });

  res.status(201).json(newMsg);
});

app.get('/api/notifications', (req: Request, res: Response) => {
  const user_id = typeof req.query.user_id === 'string' ? req.query.user_id : undefined;
  let notifications = db.getNotifications();

  if (user_id) {
    notifications = notifications.filter(n => n.user_id === user_id);
  }

  res.json(notifications);
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  db.markNotificationRead(String(req.params.id));
  res.json({ success: true });
});

// ==========================================
// ADMIN OPERATIONS & AUDIT LOGS
// ==========================================

app.get('/api/admin/metrics', (req: Request, res: Response) => {
  const users = db.getUsers();
  const learners = db.getLearners();
  const educators = db.getEducators();
  const bookings = db.getBookings();
  const payments = db.getPayments();
  const learnerRequests = db.getLearnerRequests();

  const totalLearners = learners.length;
  const activeEducators = educators.filter(e => e.status === 'active').length;
  const pendingApplications = educators.filter(e => e.status === 'applied' || e.status === 'under_review' || e.status === 'verification').length;
  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length;
  const completedSessions = bookings.filter(b => b.status === 'completed').length;

  const totalVolumeUgx = payments
    .filter(p => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + p.amount_ugx, 0);

  const platformRevenueUgx = payments
    .filter(p => p.status === 'paid' || p.status === 'completed')
    .reduce((sum, p) => sum + p.platform_fee_ugx, 0);

  res.json({
    totalLearners,
    activeEducators,
    pendingApplications,
    activeBookings,
    completedSessions,
    totalVolumeUgx,
    platformRevenueUgx,
    openRequests: learnerRequests.filter(r => r.status === 'open' || r.status === 'matched').length
  });
});

app.get('/api/admin/verification-queue', (req: Request, res: Response) => {
  const educators = db.getEducators().map(e => db.findEducatorById(e.id)!);
  const queue = educators.filter(e => e.status === 'applied' || e.status === 'under_review' || e.status === 'verification');
  res.json(queue);
});

app.patch('/api/admin/verification-step', (req: Request, res: Response) => {
  const { educator_id, step, status, notes, admin_id, admin_name } = req.body;
  const verification = db.getVerifications().find(v => v.educator_id === educator_id);

  if (!verification) {
    return res.status(404).json({ error: 'Verification record not found' });
  }

  const updates: Partial<Verification> = {
    verified_by_admin_id: admin_id || 'usr-admin-ashabahebwa',
    notes: notes || verification.notes
  };

  if (step === 'national_id') updates.national_id_status = status;
  if (step === 'background_check') updates.background_check_status = status;
  if (step === 'interview') updates.interview_status = status;
  if (step === 'skill_assessment') updates.skill_assessment_status = status;

  db.updateVerification(educator_id, updates);

  // Check if all steps verified
  const current = db.getVerifications().find(v => v.educator_id === educator_id)!;
  if (
    current.national_id_status === 'verified' &&
    current.background_check_status === 'verified' &&
    current.interview_status === 'completed' &&
    current.skill_assessment_status === 'verified'
  ) {
    db.updateEducator(educator_id, { status: 'active' });
    current.verified_at = new Date().toISOString();
  }

  db.logAdminAction({
    admin_id: admin_id || 'usr-admin-ashabahebwa',
    admin_name: admin_name || 'Ashabahebwa Hassan',
    action_type: 'UPDATE_VERIFICATION_STEP',
    target_entity: 'Verification',
    target_id: educator_id,
    details: `Updated ${step} to status: ${status}. Notes: ${notes || 'None'}`
  });

  res.json({ success: true, verification: db.getVerifications().find(v => v.educator_id === educator_id) });
});

app.patch('/api/admin/educator-status', (req: Request, res: Response) => {
  const { educator_id, status, notes, admin_id, admin_name } = req.body;
  const educator = db.findEducatorById(educator_id);

  if (!educator) {
    return res.status(404).json({ error: 'Educator not found' });
  }

  db.updateEducator(educator_id, {
    status,
    verification_notes: notes || educator.verification_notes
  });

  db.logAdminAction({
    admin_id: admin_id || 'usr-admin-ashabahebwa',
    admin_name: admin_name || 'Ashabahebwa Hassan',
    action_type: 'UPDATE_EDUCATOR_STATUS',
    target_entity: 'Educator',
    target_id: educator_id,
    details: `Status set to ${status}. Reason: ${notes || 'Standard administrative review'}`
  });

  // Notify Educator
  if (educator.user) {
    db.createNotification({
      id: `notif-${Date.now()}`,
      user_id: educator.user.id,
      type: 'verification_update',
      title: `Application Status: ${status.toUpperCase()}`,
      message: `Your educator profile status has been updated to "${status}". ${notes ? `Note: ${notes}` : ''}`,
      link: '/educator-dashboard',
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  res.json({ success: true, educator: db.findEducatorById(educator_id) });
});

app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  const logs = db.getAdminActions();
  res.json(logs);
});

// Reset Database if needed
app.post('/api/system/reset', (req: Request, res: Response) => {
  const state = db.resetToDefault();
  res.json({ success: true, message: 'Database reset to default data' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[iSkillLink API Server] Running on http://0.0.0.0:${PORT}`);
});
