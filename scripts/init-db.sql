-- Initialize Ensei Platform Database
-- This script sets up the initial database structure

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mission_model AS ENUM ('fixed', 'degen');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE mission_type AS ENUM ('engage', 'content', 'ambassador');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE platform AS ENUM ('twitter', 'instagram', 'tiktok', 'facebook', 'whatsapp', 'snapchat', 'telegram');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('pending', 'accepted', 'rejected', 'under_review');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user',
    avatar VARCHAR(500),
    wallet_address VARCHAR(42),
    honors_balance INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create missions table
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    model mission_model NOT NULL,
    platform platform NOT NULL,
    type mission_type NOT NULL,
    target VARCHAR(20) DEFAULT 'all',
    is_premium BOOLEAN DEFAULT FALSE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    tweet_link VARCHAR(500),
    tasks JSONB NOT NULL,
    cap INTEGER,
    duration_hours INTEGER,
    winners_cap INTEGER,
    total_cost_usd DECIMAL(10,2) NOT NULL,
    total_cost_honors INTEGER NOT NULL,
    per_user_honors INTEGER,
    user_pool_honors INTEGER,
    per_winner_honors INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content_url VARCHAR(500),
    proof_url VARCHAR(500),
    status submission_status DEFAULT 'pending',
    reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_missions_creator ON missions(creator_id);
CREATE INDEX IF NOT EXISTS idx_missions_platform ON missions(platform);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_mission ON submissions(mission_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, username, password_hash, role, is_verified)
VALUES (
    'admin@ensei.com',
    'admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'admin',
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Create a function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_missions INTEGER,
    total_submissions INTEGER,
    accepted_submissions INTEGER,
    total_honors_earned INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(mission_count, 0)::INTEGER as total_missions,
        COALESCE(submission_count, 0)::INTEGER as total_submissions,
        COALESCE(accepted_count, 0)::INTEGER as accepted_submissions,
        COALESCE(honors_earned, 0)::INTEGER as total_honors_earned
    FROM (
        SELECT 
            (SELECT COUNT(*) FROM missions WHERE creator_id = user_uuid) as mission_count,
            (SELECT COUNT(*) FROM submissions WHERE user_id = user_uuid) as submission_count,
            (SELECT COUNT(*) FROM submissions WHERE user_id = user_uuid AND status = 'accepted') as accepted_count,
            (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE user_id = user_uuid AND type = 'earned') as honors_earned
    ) stats;
END;
$$ LANGUAGE plpgsql;

