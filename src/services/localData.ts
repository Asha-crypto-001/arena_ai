import {
  User, Learner, Educator, Category, Skill, EducatorSkill,
  Qualification, Portfolio, Verification, LearnerRequest,
  Match, Booking, Payment, Transaction, Review, Message, Notification, AdminAction
} from '../types';

export const initialLocalCategories: Category[] = [
  { id: 'cat-fashion', name: 'Fashion & Tailoring', slug: 'fashion-tailoring', description: 'Pattern drafting, garment cutting, sewing machine maintenance, African prints & bridal couture', icon_name: 'Scissors', sort_order: 1 },
  { id: 'cat-tech', name: 'Web Development & Programming', slug: 'web-programming', description: 'Frontend, backend, React, Node.js, Python, and practical software engineering', icon_name: 'Code', sort_order: 2 },
  { id: 'cat-repair', name: 'Phone Repair & Electronics', slug: 'phone-repair-electronics', description: 'Hardware diagnostics, screen replacement, micro-soldering, PCB troubleshooting', icon_name: 'Smartphone', sort_order: 3 },
  { id: 'cat-culinary', name: 'Cooking & Baking', slug: 'cooking-baking', description: 'Commercial pastry, artisan breads, cake decoration, culinary sanitation & catering', icon_name: 'Utensils', sort_order: 4 },
  { id: 'cat-electrical', name: 'Electrical & Solar', slug: 'electrical-solar', description: 'Domestic & industrial wiring, solar inverter setups, battery storage, safety compliance', icon_name: 'Zap', sort_order: 5 },
  { id: 'cat-welding', name: 'Welding & Metalwork', slug: 'welding-metalwork', description: 'MIG, TIG, stick welding, structural gates, metal fabrication, tool handling', icon_name: 'Hammer', sort_order: 6 },
  { id: 'cat-carpentry', name: 'Carpentry & Woodwork', slug: 'carpentry-woodwork', description: 'Custom furniture design, joinery, timber selection, finishing and restoration', icon_name: 'Wrench', sort_order: 7 },
  { id: 'cat-agriculture', name: 'Agriculture & Agribusiness', slug: 'agriculture-agribusiness', description: 'Commercial poultry, greenhouse horticulture, dairy farm management, drip irrigation', icon_name: 'Sprout', sort_order: 8 },
  { id: 'cat-photography', name: 'Photography & Video', slug: 'photography-video', description: 'Studio lighting, portraiture, Premiere Pro / DaVinci editing, commercial video', icon_name: 'Camera', sort_order: 9 },
  { id: 'cat-design', name: 'Graphic Design & UI/UX', slug: 'graphic-design-ui', description: 'Photoshop, Illustrator, branding, typography, Figma UI design & layout', icon_name: 'Palette', sort_order: 10 },
  { id: 'cat-business', name: 'Accounting & Business Skills', slug: 'accounting-business', description: 'QuickBooks, tax compliance with URA, bookkeeping, financial forecasting', icon_name: 'Briefcase', sort_order: 11 },
  { id: 'cat-marketing', name: 'Digital Marketing & Social Media', slug: 'digital-marketing', description: 'Performance marketing, Meta ads, SEO, TikTok & Reels content for SME growth', icon_name: 'TrendingUp', sort_order: 12 },
  { id: 'cat-beauty', name: 'Beauty & Hair Styling', slug: 'beauty-hair', description: 'Bridal makeup, skin prep, precision hair styling, manicures, salon hygiene', icon_name: 'Sparkles', sort_order: 13 },
];

export const initialLocalSkills: Skill[] = [
  { id: 'skill-tailoring-1', category_id: 'cat-fashion', name: 'Garment Pattern Drafting & Cutting', slug: 'pattern-drafting', description: 'Learn accurate manual pattern making for suits, dresses, and traditional attire.', level_options: ['beginner', 'intermediate', 'advanced'], typical_duration_hours: 20, popular: true },
  { id: 'skill-tailoring-2', category_id: 'cat-fashion', name: 'Industrial Sewing Machine Mastery', slug: 'industrial-sewing', description: 'Operating and maintaining heavy-duty straight-stitch and overlock industrial machines.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 15, popular: true },
  { id: 'skill-web-1', category_id: 'cat-tech', name: 'Full-Stack Web Development (React & Node)', slug: 'fullstack-web-dev', description: 'Modern responsive web development with React, TypeScript, APIs and databases.', level_options: ['beginner', 'intermediate', 'advanced'], typical_duration_hours: 35, popular: true },
  { id: 'skill-web-2', category_id: 'cat-tech', name: 'Python for Beginners & Automation', slug: 'python-automation', description: 'Core Python fundamentals, scripting, data handling and daily task automation.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 20, popular: false },
  { id: 'skill-phone-1', category_id: 'cat-repair', name: 'Smartphone Hardware Diagnostics & Repair', slug: 'smartphone-hardware-repair', description: 'Screen replacement, battery soldering, charging port repairs, and board schematics.', level_options: ['beginner', 'intermediate', 'advanced'], typical_duration_hours: 25, popular: true },
  { id: 'skill-baking-1', category_id: 'cat-culinary', name: 'Commercial Pastry & Cake Decorating', slug: 'commercial-pastry-cake-decorating', description: 'Tiered wedding cakes, sharp fondant edges, Swiss meringue buttercream, and baking math.', level_options: ['beginner', 'intermediate', 'advanced'], typical_duration_hours: 18, popular: true },
  { id: 'skill-electrical-1', category_id: 'cat-electrical', name: 'Solar PV System Sizing & Installation', slug: 'solar-pv-installation', description: 'Load calculation, hybrid inverter setup, lithium battery bank wiring, safety earthing.', level_options: ['beginner', 'intermediate', 'advanced'], typical_duration_hours: 24, popular: true },
  { id: 'skill-agri-2', category_id: 'cat-agriculture', name: 'Dairy Farming & Quality Milk Value Addition', slug: 'dairy-farming-value-addition', description: 'Pasture management, breed selection, silage production, hygienic milk handling.', level_options: ['beginner', 'intermediate'], typical_duration_hours: 20, popular: true },
];

export const initialLocalUsers: Array<User & { password_hash: string }> = [
  {
    id: 'usr-admin-ashabahebwa',
    email: 'ashabahebwahassan665@gmail.com',
    password_hash: 'Ash@0001$',
    role: 'admin',
    name: 'Ashabahebwa Hassan',
    phone: '+256 744 024 529',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    location: 'Mbarara City, Uganda',
    created_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'usr-edu-1',
    email: 'mukasa.tailor@iskilllink.ug',
    password_hash: 'edu123',
    role: 'educator',
    name: 'Joseph Mukasa',
    phone: '+256 774 521 300',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    location: 'High Street, Mbarara City',
    created_at: '2026-01-15T12:00:00Z'
  },
  {
    id: 'usr-edu-2',
    email: 'kembabazi.tech@iskilllink.ug',
    password_hash: 'edu123',
    role: 'educator',
    name: 'Dr. Irene Kembabazi',
    phone: '+256 702 884 199',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    location: 'Mbarara University Tech Hub',
    created_at: '2026-01-18T14:30:00Z'
  },
  {
    id: 'usr-edu-3',
    email: 'emmanuel.kato@iskilllink.ug',
    password_hash: 'edu123',
    role: 'educator',
    name: 'Emmanuel Kato',
    phone: '+256 788 123 456',
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    location: 'Kakoba Road, Mbarara City',
    created_at: '2026-01-20T09:00:00Z'
  },
  {
    id: 'usr-edu-4',
    email: 'grace.nalubega@iskilllink.ug',
    password_hash: 'edu123',
    role: 'educator',
    name: 'Grace Nalubega',
    phone: '+256 752 990 011',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    location: 'Booma & Kamukuzi, Mbarara',
    created_at: '2026-01-22T10:45:00Z'
  },
  {
    id: 'usr-edu-5',
    email: 'david.ochen@iskilllink.ug',
    password_hash: 'edu123',
    role: 'educator',
    name: 'David Ochen',
    phone: '+256 779 341 556',
    avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    location: 'Ruharo, Mbarara & Kampala',
    created_at: '2026-01-25T11:20:00Z'
  },
  {
    id: 'usr-edu-6',
    email: 'tumusiime.dairy@iskilllink.ug',
    password_hash: 'edu123',
    role: 'educator',
    name: 'Justus Tumusiime',
    phone: '+256 772 884 319',
    avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=300&q=80',
    location: 'Biharwe, Mbarara District',
    created_at: '2026-01-28T16:00:00Z'
  },
  {
    id: 'usr-learner-1',
    email: 'sarah.namubiru@gmail.com',
    password_hash: 'learner123',
    role: 'learner',
    name: 'Sarah Namubiru',
    phone: '+256 701 455 890',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    location: 'Mbarara & Kampala',
    created_at: '2026-02-01T10:00:00Z'
  }
];

export const initialLocalEducators: Educator[] = [
  {
    id: 'edu-1',
    user_id: 'usr-edu-1',
    title: 'Master Tailor & Pattern Construction Instructor',
    bio: '12+ years of practical tailoring in Mbarara High Street and Kampala. Specializing in precision pattern drafting, menswear suits, African print garments, and industrial machine tuning. Trained over 80 independent apprentices.',
    educator_type: 'artisan',
    years_experience: 12,
    location: 'High Street, Mbarara City',
    service_area: 'Mbarara City, Kakoba, Kamukuzi, Greater Ankole & Kampala',
    teaching_formats: ['in-person', 'hybrid'],
    languages: ['English', 'Runyankole', 'Luganda'],
    equipment_provided: 'Equipped workshop with Juki industrial straight machines, 5-thread overlockers, cutting tables and drafting rulers.',
    hourly_rate_ugx: 35000,
    package_rate_ugx: 350000,
    status: 'active',
    rating: 4.95,
    total_reviews: 24,
    total_students: 31,
    featured: true,
    created_at: '2026-01-15T12:00:00Z'
  },
  {
    id: 'edu-2',
    user_id: 'usr-edu-2',
    title: 'Senior Software Architect & Full-Stack Mentor',
    bio: '8+ years building enterprise systems across East Africa. Teaching modern TypeScript, React, Node.js, and API architecture with real production codebases instead of surface-level tutorials.',
    educator_type: 'professional',
    years_experience: 8,
    location: 'Mbarara University Tech Hub & Nakawa',
    service_area: 'Mbarara, Greater Kampala & Global Online',
    teaching_formats: ['online', 'hybrid', 'in-person'],
    languages: ['English', 'Runyankole'],
    equipment_provided: 'Live code review repository, staging cloud sandboxes, and recorded practical walkthroughs.',
    hourly_rate_ugx: 45000,
    package_rate_ugx: 480000,
    status: 'active',
    rating: 4.98,
    total_reviews: 19,
    total_students: 26,
    featured: true,
    created_at: '2026-01-18T14:30:00Z'
  },
  {
    id: 'edu-3',
    user_id: 'usr-edu-3',
    title: 'Electronics Diagnostics & Micro-Soldering Specialist',
    bio: 'Practical bench trainer with 9 years restoring damaged motherboards, iPhone & Android IC chips, charging circuits, and display assemblies. Focused on troubleshooting methodology over guesswork.',
    educator_type: 'practitioner',
    years_experience: 9,
    location: 'Kakoba Road, Mbarara City',
    service_area: 'Mbarara City & Western Region',
    teaching_formats: ['in-person'],
    languages: ['Runyankole', 'English', 'Luganda'],
    equipment_provided: 'Stereo microscopes, hot air rework stations, multimeter diagnostic rigs, and sample test boards.',
    hourly_rate_ugx: 30000,
    package_rate_ugx: 320000,
    status: 'active',
    rating: 4.88,
    total_reviews: 15,
    total_students: 19,
    featured: true,
    created_at: '2026-01-20T09:00:00Z'
  },
  {
    id: 'edu-4',
    user_id: 'usr-edu-4',
    title: 'Commercial Pastry Chef & Confectionery Trainer',
    bio: 'Professional pastry chef trained in commercial baking, buttercream floral design, sharp fondant tiers, and micro-bakery unit economics. Hands-on kitchen sessions that build confidence.',
    educator_type: 'trainer',
    years_experience: 7,
    location: 'Booma & Kamukuzi, Mbarara',
    service_area: 'Mbarara City, Ruharo, Booma, Ntinda',
    teaching_formats: ['in-person', 'hybrid'],
    languages: ['English', 'Runyankole', 'Luganda'],
    equipment_provided: 'Commercial deck ovens, planetary mixers, turntable cake stands, precision temperature probes.',
    hourly_rate_ugx: 40000,
    package_rate_ugx: 380000,
    status: 'active',
    rating: 4.92,
    total_reviews: 18,
    total_students: 23,
    featured: true,
    created_at: '2026-01-22T10:45:00Z'
  },
  {
    id: 'edu-5',
    user_id: 'usr-edu-5',
    title: 'ERA-Certified Electrician & Solar Systems Lead',
    bio: 'Licensed Wireman Class B with 11 years in solar microgrid sizing, backup inverter installations, and commercial distribution boards. Emphasizes safety protocols and Ugandan electrical codes.',
    educator_type: 'practitioner',
    years_experience: 11,
    location: 'Ruharo, Mbarara & Kampala',
    service_area: 'Mbarara, Greater Ankole, Kampala, Entebbe',
    teaching_formats: ['in-person', 'hybrid'],
    languages: ['English', 'Runyankole', 'Luganda', 'Swahili'],
    equipment_provided: 'Clamp meters, insulation resistance testers, crimping tools, solar test panels.',
    hourly_rate_ugx: 35000,
    package_rate_ugx: 360000,
    status: 'active',
    rating: 4.90,
    total_reviews: 21,
    total_students: 27,
    featured: true,
    created_at: '2026-01-25T11:20:00Z'
  },
  {
    id: 'edu-6',
    user_id: 'usr-edu-6',
    title: 'Commercial Dairy Farm Management & Pasture Consultant',
    bio: '15 years managing intensive Friesian/Ankole cross dairy herds, silage processing, machine milking, and hygienic raw milk handling in Kiruhura and Mbarara.',
    educator_type: 'mentor',
    years_experience: 15,
    location: 'Biharwe, Mbarara District',
    service_area: 'Mbarara, Kiruhura, Isingiro, Bushenyi',
    teaching_formats: ['in-person'],
    languages: ['Runyankole', 'English'],
    equipment_provided: 'Working dairy farm facility with milking machines and feed preparation units.',
    hourly_rate_ugx: 45000,
    package_rate_ugx: 420000,
    status: 'active',
    rating: 4.96,
    total_reviews: 14,
    total_students: 18,
    featured: true,
    created_at: '2026-01-28T16:00:00Z'
  }
];

export const initialLocalLearners: Learner[] = [
  {
    id: 'lrn-1',
    user_id: 'usr-learner-1',
    location: 'Mbarara & Kampala',
    bio: 'Passionate about bespoke African fashion design and launching a bespoke boutique brand in Uganda.',
    learning_interests: ['Garment Pattern Drafting', 'Industrial Sewing', 'Fashion Business'],
    preferred_format: 'in-person',
    created_at: '2026-02-01T10:00:00Z'
  }
];

export const initialLocalBookings: Booking[] = [
  {
    id: 'bk-101',
    learner_id: 'lrn-1',
    educator_id: 'edu-1',
    skill_name: 'Garment Pattern Drafting & Cutting (Module 1: Foundations)',
    format: 'in-person',
    location_or_link: 'Joseph Mukasa Workshop, Mbarara High Street Commercial Center',
    scheduled_date: '2026-02-28',
    start_time: '10:00',
    duration_hours: 3,
    total_amount_ugx: 105000,
    platform_fee_ugx: 10500,
    educator_payout_ugx: 94500,
    status: 'completed',
    notes: 'Covered bodice block measurements, dart manipulation, and collar patterns.',
    milestone_progress: 100,
    completed_at: '2026-02-28T13:15:00Z',
    created_at: '2026-02-18T10:00:00Z'
  }
];

export const initialLocalPayments: Payment[] = [
  {
    id: 'pay-101',
    booking_id: 'bk-101',
    learner_id: 'lrn-1',
    educator_id: 'edu-1',
    amount_ugx: 105000,
    platform_fee_ugx: 10500,
    payout_amount_ugx: 94500,
    method: 'mtn_momo',
    payment_reference: 'MOMO-UG-2026-894102',
    status: 'completed',
    created_at: '2026-02-26T14:20:00Z',
    updated_at: '2026-02-28T13:30:00Z'
  }
];

export const initialLocalAuditLogs: AdminAction[] = [
  {
    id: 'act-1',
    admin_id: 'usr-admin-ashabahebwa',
    admin_name: 'Ashabahebwa Hassan',
    action_type: 'INITIALIZE_PLATFORM_OPERATIONS',
    target_entity: 'Platform',
    target_id: 'HQ-MBARARA',
    details: 'Founder Ashabahebwa Hassan initialized iSkillLink Uganda operations based in Mbarara City.',
    created_at: '2026-01-01T08:00:00Z'
  }
];
