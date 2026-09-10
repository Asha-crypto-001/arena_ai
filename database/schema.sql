-- ========================================================================
-- iSkillLink Uganda — Production PostgreSQL Database Schema & Initial Seed
-- Headquartered in Mbarara City, Western Uganda
-- Founded by Ashabahebwa Hassan
-- ========================================================================

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------
-- 1. USERS & IDENTITY
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('learner', 'educator', 'admin', 'secondary_admin')),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(64) NOT NULL,
    whatsapp VARCHAR(64),
    location VARCHAR(255) DEFAULT 'Mbarara City, Uganda',
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    is_primary_admin BOOLEAN DEFAULT FALSE,
    admin_assigned_by VARCHAR(255),
    admin_assigned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ------------------------------------------------------------------------
-- 2. TRADE CATEGORIES (20 Practical Ugandan Sectors)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon_name VARCHAR(64) NOT NULL,
    sort_order INT DEFAULT 0
);

-- ------------------------------------------------------------------------
-- 3. PRACTICAL SKILLS CATALOG
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS skills (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    level_options JSONB DEFAULT '["beginner", "intermediate", "advanced"]',
    typical_duration_hours INT DEFAULT 20,
    popular BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category_id);

-- ------------------------------------------------------------------------
-- 4. EDUCATORS & PRACTITIONERS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS educators (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    title VARCHAR(255) NOT NULL,
    bio TEXT,
    educator_type VARCHAR(64) CHECK (educator_type IN ('artisan', 'practitioner', 'professional', 'trainer', 'mentor')),
    years_experience INT DEFAULT 1,
    location VARCHAR(255) NOT NULL,
    service_area VARCHAR(255) NOT NULL,
    teaching_formats JSONB DEFAULT '["in-person"]',
    languages JSONB DEFAULT '["English", "Runyankole"]',
    equipment_provided TEXT,
    hourly_rate_ugx NUMERIC(12, 2) NOT NULL DEFAULT 35000,
    package_rate_ugx NUMERIC(12, 2),
    status VARCHAR(32) DEFAULT 'applied' CHECK (status IN ('applied', 'under_review', 'verification', 'approved', 'active', 'suspended')),
    rating NUMERIC(3, 2) DEFAULT 0.0,
    total_reviews INT DEFAULT 0,
    total_students INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_educators_status ON educators(status);
CREATE INDEX IF NOT EXISTS idx_educators_location ON educators(location);

-- ------------------------------------------------------------------------
-- 5. LEARNERS & APPRENTICES
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learners (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    location VARCHAR(255),
    bio TEXT,
    learning_interests JSONB DEFAULT '[]',
    preferred_format VARCHAR(32) DEFAULT 'in-person',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------
-- 6. EDUCATOR SKILLS & MAPPINGS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS educator_skills (
    id VARCHAR(64) PRIMARY KEY,
    educator_id VARCHAR(64) REFERENCES educators(id) ON DELETE CASCADE,
    skill_id VARCHAR(64) REFERENCES skills(id) ON DELETE SET NULL,
    skill_name VARCHAR(255) NOT NULL,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
    proficiency_level VARCHAR(32) DEFAULT 'advanced',
    hourly_rate_ugx NUMERIC(12, 2),
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_educator_skills_edu ON educator_skills(educator_id);

-- ------------------------------------------------------------------------
-- 7. QUALIFICATIONS & CERTIFICATIONS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS qualifications (
    id VARCHAR(64) PRIMARY KEY,
    educator_id VARCHAR(64) REFERENCES educators(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    year INT,
    verified BOOLEAN DEFAULT FALSE,
    document_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_qualifications_edu ON qualifications(educator_id);

-- ------------------------------------------------------------------------
-- 8. WORKSHOP PORTFOLIOS & PROJECTS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolios (
    id VARCHAR(64) PRIMARY KEY,
    educator_id VARCHAR(64) REFERENCES educators(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    tag VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS idx_portfolios_edu ON portfolios(educator_id);

-- ------------------------------------------------------------------------
-- 9. EDUCATOR VERIFICATION MATRIX
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verifications (
    id VARCHAR(64) PRIMARY KEY,
    educator_id VARCHAR(64) REFERENCES educators(id) ON DELETE CASCADE UNIQUE,
    national_id_number VARCHAR(128),
    national_id_status VARCHAR(32) DEFAULT 'pending' CHECK (national_id_status IN ('pending', 'verified', 'rejected')),
    background_check_status VARCHAR(32) DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'verified', 'rejected')),
    interview_status VARCHAR(32) DEFAULT 'pending' CHECK (interview_status IN ('pending', 'completed', 'scheduled')),
    skill_assessment_status VARCHAR(32) DEFAULT 'pending' CHECK (skill_assessment_status IN ('pending', 'verified', 'rejected')),
    verified_by_admin_id VARCHAR(64) REFERENCES users(id),
    verified_at TIMESTAMPTZ,
    notes TEXT
);

-- ------------------------------------------------------------------------
-- 10. CUSTOM LEARNER SKILL REQUESTS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learner_requests (
    id VARCHAR(64) PRIMARY KEY,
    learner_id VARCHAR(64) REFERENCES learners(id) ON DELETE SET NULL,
    skill_id VARCHAR(64),
    skill_name VARCHAR(255) NOT NULL,
    skill_level VARCHAR(32) DEFAULT 'beginner',
    learning_goal TEXT NOT NULL,
    format_preference VARCHAR(32) DEFAULT 'in-person',
    location VARCHAR(255) NOT NULL,
    preferred_schedule VARCHAR(255),
    frequency VARCHAR(255),
    budget_ugx NUMERIC(12, 2) NOT NULL,
    additional_notes TEXT,
    status VARCHAR(32) DEFAULT 'open' CHECK (status IN ('open', 'matched', 'in_progress', 'fulfilled', 'cancelled')),
    contact_phone VARCHAR(64),
    learner_name VARCHAR(255),
    learner_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON learner_requests(status);

-- ------------------------------------------------------------------------
-- 11. MATCHMAKING EVALUATIONS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(64) PRIMARY KEY,
    request_id VARCHAR(64) REFERENCES learner_requests(id) ON DELETE CASCADE,
    educator_id VARCHAR(64) REFERENCES educators(id) ON DELETE CASCADE,
    match_score INT NOT NULL,
    match_reasons JSONB DEFAULT '[]',
    matched_by VARCHAR(32) DEFAULT 'system',
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_matches_request ON matches(request_id);

-- ------------------------------------------------------------------------
-- 12. BOOKINGS & APPRENTICESHIP SESSIONS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    learner_id VARCHAR(64) REFERENCES learners(id) ON DELETE CASCADE,
    educator_id VARCHAR(64) REFERENCES educators(id) ON DELETE CASCADE,
    request_id VARCHAR(64) REFERENCES learner_requests(id) ON DELETE SET NULL,
    skill_id VARCHAR(64),
    skill_name VARCHAR(255) NOT NULL,
    format VARCHAR(32) NOT NULL,
    location_or_link TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time VARCHAR(16) NOT NULL,
    duration_hours INT NOT NULL DEFAULT 2,
    total_amount_ugx NUMERIC(12, 2) NOT NULL,
    platform_fee_ugx NUMERIC(12, 2) NOT NULL,
    educator_payout_ugx NUMERIC(12, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    milestone_progress INT DEFAULT 0 CHECK (milestone_progress >= 0 AND milestone_progress <= 100),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_learner ON bookings(learner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_educator ON bookings(educator_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ------------------------------------------------------------------------
-- 13. ESCROW PAYMENTS (MTN & Airtel MoMo)
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
    learner_id VARCHAR(64) REFERENCES learners(id) ON DELETE SET NULL,
    educator_id VARCHAR(64) REFERENCES educators(id) ON DELETE SET NULL,
    amount_ugx NUMERIC(12, 2) NOT NULL,
    platform_fee_ugx NUMERIC(12, 2) NOT NULL,
    payout_amount_ugx NUMERIC(12, 2) NOT NULL,
    method VARCHAR(32) NOT NULL CHECK (method IN ('mtn_momo', 'airtel_money', 'bank_transfer', 'cash_escrow')),
    payment_reference VARCHAR(128) UNIQUE NOT NULL,
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'payment_requested', 'paid', 'failed', 'refunded', 'completed')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ------------------------------------------------------------------------
-- 14. FINANCIAL TRANSACTIONS & LEDGER
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    payment_id VARCHAR(64) REFERENCES payments(id) ON DELETE CASCADE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('learner_charge', 'platform_commission', 'educator_payout', 'refund')),
    amount_ugx NUMERIC(12, 2) NOT NULL,
    description TEXT,
    status VARCHAR(32) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_payment ON transactions(payment_id);

-- ------------------------------------------------------------------------
-- 15. REVIEWS & RATINGS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
    educator_id VARCHAR(64) REFERENCES educators(id) ON DELETE CASCADE,
    learner_id VARCHAR(64) REFERENCES learners(id) ON DELETE CASCADE,
    learner_name VARCHAR(255) NOT NULL,
    learner_avatar TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    skill_rating INT CHECK (skill_rating >= 1 AND skill_rating <= 5),
    punctuality_rating INT CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
    comment TEXT NOT NULL,
    educator_reply TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    is_moderated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------
-- 16. IN-APP MESSAGES & COMMUNICATIONS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(128) NOT NULL,
    sender_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    receiver_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);

-- ------------------------------------------------------------------------
-- 17. NOTIFICATIONS & ALERTS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ------------------------------------------------------------------------
-- 18. AUDIT LOGS & ADMINISTRATIVE GOVERNANCE
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_actions (
    id VARCHAR(64) PRIMARY KEY,
    admin_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    admin_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    target_entity VARCHAR(64) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------
-- 19. NEWSLETTER SUBSCRIBERS
-- ------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    skill_focus VARCHAR(128) DEFAULT 'All Practical Trades',
    source VARCHAR(64) DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================================
-- INITIAL SEED DATA
-- ========================================================================

-- Primary Lead Admin: Ashabahebwa Hassan (Password: Ash@0001$)
INSERT INTO users (id, email, password_hash, role, name, phone, whatsapp, location, avatar_url, is_primary_admin, created_at)
VALUES (
    'usr-admin-ashabahebwa',
    'ashabahebwahassan665@gmail.com',
    'Ash@0001$',
    'admin',
    'Ashabahebwa Hassan',
    '+256 744 024 529',
    '+256 744 024 529',
    'Mbarara City, Western Region, Uganda',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    TRUE,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO NOTHING;

-- 20 Practical Categories Across Uganda
INSERT INTO categories (id, name, slug, description, icon_name, sort_order) VALUES
('cat-fashion', 'Fashion & Tailoring', 'fashion-tailoring', 'Pattern drafting, garment cutting, sewing machine maintenance, African prints & bridal couture', 'Scissors', 1),
('cat-tech', 'Web Development & Programming', 'web-programming', 'Frontend, backend, React, Node.js, Python, and practical software engineering', 'Code', 2),
('cat-repair', 'Phone Repair & Electronics', 'phone-repair-electronics', 'Hardware diagnostics, screen replacement, micro-soldering, PCB troubleshooting', 'Smartphone', 3),
('cat-culinary', 'Cooking & Baking', 'cooking-baking', 'Commercial pastry, artisan breads, cake decoration, culinary sanitation & catering', 'Utensils', 4),
('cat-electrical', 'Electrical & Solar', 'electrical-solar', 'Domestic & industrial wiring, solar inverter setups, battery storage, safety compliance', 'Zap', 5),
('cat-welding', 'Welding & Metalwork', 'welding-metalwork', 'MIG, TIG, stick welding, structural gates, metal fabrication, tool handling', 'Hammer', 6),
('cat-carpentry', 'Carpentry & Woodwork', 'carpentry-woodwork', 'Custom furniture design, joinery, timber selection, finishing and restoration', 'Wrench', 7),
('cat-agriculture', 'Agriculture & Agribusiness', 'agriculture-agribusiness', 'Commercial poultry, greenhouse horticulture, dairy farm management, drip irrigation', 'Sprout', 8),
('cat-photography', 'Photography & Video', 'photography-video', 'Studio lighting, portraiture, Premiere Pro / DaVinci editing, commercial video', 'Camera', 9),
('cat-design', 'Graphic Design & UI/UX', 'graphic-design-ui', 'Photoshop, Illustrator, branding, typography, Figma UI design & layout', 'Palette', 10),
('cat-business', 'Accounting & Business Skills', 'accounting-business', 'QuickBooks, tax compliance with URA, bookkeeping, financial forecasting', 'Briefcase', 11),
('cat-marketing', 'Digital Marketing & Social Media', 'digital-marketing', 'Performance marketing, Meta ads, SEO, TikTok & Reels content for SME growth', 'TrendingUp', 12),
('cat-beauty', 'Beauty & Hair Styling', 'beauty-hair', 'Bridal makeup, skin prep, precision hair styling, manicures, salon hygiene', 'Sparkles', 13),
('cat-plumbing', 'Plumbing & Pipefitting', 'plumbing', 'Domestic plumbing, PEX piping, drainage systems, water heater installations', 'Droplets', 14),
('cat-automotive', 'Automotive & Mechanics', 'automotive', 'OBD diagnostics, engine overhaul, suspension, electrical troubleshooting', 'Car', 15),
('cat-communication', 'Communication & Career', 'communication-career', 'Public speaking, interview prep, grant writing, corporate business English', 'MessageSquare', 16),
('cat-music', 'Music & Audio Production', 'music-audio', 'Acoustic guitar, keyboard, vocal training, FL Studio / Logic beatmaking', 'Music', 17),
('cat-construction', 'Construction & Masonry', 'construction-masonry', 'Bricklaying, tiling, concrete mixing, blueprint interpretation & site supervision', 'Building2', 18),
('cat-crafts', 'Crafts & Handmade Goods', 'crafts', 'Beadwork, basket weaving, leather shoes & bags, pottery', 'Feather', 19),
('cat-ai', 'AI & Applied Technology', 'ai-technology', 'Practical AI tools for business, workflow automation, prompt engineering', 'Cpu', 20)
ON CONFLICT (id) DO NOTHING;

-- Initial Practical Skills Catalog
INSERT INTO skills (id, category_id, name, slug, description, level_options, typical_duration_hours, popular) VALUES
('skill-tailoring-1', 'cat-fashion', 'Garment Pattern Drafting & Cutting', 'pattern-drafting', 'Learn accurate manual pattern making for suits, dresses, and traditional attire.', '["beginner", "intermediate", "advanced"]', 20, TRUE),
('skill-tailoring-2', 'cat-fashion', 'Industrial Sewing Machine Mastery', 'industrial-sewing', 'Operating and maintaining heavy-duty straight-stitch and overlock industrial machines.', '["beginner", "intermediate"]', 15, TRUE),
('skill-web-1', 'cat-tech', 'Full-Stack Web Development (React & Node)', 'fullstack-web-dev', 'Modern responsive web development with React, TypeScript, APIs and databases.', '["beginner", "intermediate", "advanced"]', 35, TRUE),
('skill-web-2', 'cat-tech', 'Python for Beginners & Automation', 'python-automation', 'Core Python fundamentals, scripting, data handling and daily task automation.', '["beginner", "intermediate"]', 20, FALSE),
('skill-phone-1', 'cat-repair', 'Smartphone Hardware Diagnostics & Repair', 'smartphone-hardware-repair', 'Screen replacement, battery soldering, charging port repairs, and board schematics.', '["beginner", "intermediate", "advanced"]', 25, TRUE),
('skill-baking-1', 'cat-culinary', 'Commercial Pastry & Cake Decorating', 'commercial-pastry-cake-decorating', 'Tiered wedding cakes, sharp fondant edges, Swiss meringue buttercream, and baking math.', '["beginner", "intermediate", "advanced"]', 18, TRUE),
('skill-electrical-1', 'cat-electrical', 'Solar PV System Sizing & Installation', 'solar-pv-installation', 'Load calculation, hybrid inverter setup, lithium battery bank wiring, safety earthing.', '["beginner", "intermediate", "advanced"]', 24, TRUE),
('skill-agri-2', 'cat-agriculture', 'Dairy Farming & Quality Milk Value Addition', 'dairy-farming-value-addition', 'Pasture management, breed selection, silage production, hygienic milk handling.', '["beginner", "intermediate"]', 20, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Initial Platform Audit Record
INSERT INTO admin_actions (id, admin_id, admin_name, action_type, target_entity, target_id, details)
VALUES (
    'act-init',
    'usr-admin-ashabahebwa',
    'Ashabahebwa Hassan',
    'INITIALIZE_PLATFORM_OPERATIONS',
    'Platform',
    'HQ-MBARARA',
    'Founder Ashabahebwa Hassan initialized iSkillLink Uganda operations database based in Mbarara City.'
) ON CONFLICT (id) DO NOTHING;

-- ========================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

-- Enable Row-Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE educators ENABLE ROW LEVEL SECURITY;
ALTER TABLE learners ENABLE ROW LEVEL SECURITY;
ALTER TABLE educator_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE learner_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public Discovery Policies
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Skills are viewable by everyone" ON skills FOR SELECT USING (true);
CREATE POLICY "Active educators viewable by everyone" ON educators FOR SELECT USING (status IN ('active', 'approved'));
CREATE POLICY "Educator skills viewable by everyone" ON educator_skills FOR SELECT USING (true);
CREATE POLICY "Qualifications viewable by everyone" ON qualifications FOR SELECT USING (true);
CREATE POLICY "Portfolios viewable by everyone" ON portfolios FOR SELECT USING (true);
CREATE POLICY "Moderated reviews viewable by everyone" ON reviews FOR SELECT USING (is_moderated = true);

-- Newsletter Subscriptions Policy
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
