-- Initial database schema for Ensei Platform
-- This migration creates the core tables for users, missions, tasks, submissions, and ledger

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(255) UNIQUE,
    honors_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Missions table
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('twitter', 'instagram', 'tiktok', 'facebook', 'whatsapp', 'snapchat', 'telegram')),
    mission_type VARCHAR(50) NOT NULL CHECK (mission_type IN ('engage', 'content', 'ambassador')),
    mission_model VARCHAR(50) NOT NULL CHECK (mission_model IN ('fixed', 'degen')),
    target_profile VARCHAR(50) NOT NULL CHECK (target_profile IN ('all', 'premium')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
    
    -- Fixed mission fields
    participant_cap INTEGER,
    per_user_honors INTEGER,
    
    -- Degen mission fields (will be added in migration 004)
    duration_hours INTEGER,
    
    -- Pricing fields
    total_cost_usd DECIMAL(10,2) NOT NULL,
    total_cost_honors INTEGER NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_fixed_mission CHECK (
        mission_model = 'fixed' AND participant_cap IS NOT NULL AND participant_cap >= 60 AND per_user_honors IS NOT NULL
        OR mission_model = 'degen'
    ),
    CONSTRAINT valid_degen_mission CHECK (
        mission_model = 'degen' AND duration_hours IS NOT NULL
        OR mission_model = 'fixed'
    )
);

-- Mission tasks table
CREATE TABLE mission_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL,
    honors_reward INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_id UUID REFERENCES users(id),
    rejection_reason TEXT,
    
    -- Honors awarded (for approved submissions)
    honors_awarded INTEGER,
    
    UNIQUE(mission_id, user_id)
);

-- Submission proofs table
CREATE TABLE submission_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    proof_type VARCHAR(50) NOT NULL,
    proof_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Honors ledger table
CREATE TABLE honors_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    mission_id UUID REFERENCES missions(id),
    submission_id UUID REFERENCES submissions(id),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('mission_creation', 'mission_reward', 'withdrawal', 'refund', 'adjustment')),
    amount INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawals table
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    honors_amount INTEGER NOT NULL,
    usd_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    wallet_address VARCHAR(255),
    transaction_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT
);

-- Indexes for performance
CREATE INDEX idx_missions_creator_id ON missions(creator_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_platform ON missions(platform);
CREATE INDEX idx_missions_mission_type ON missions(mission_type);
CREATE INDEX idx_missions_mission_model ON missions(mission_model);
CREATE INDEX idx_missions_created_at ON missions(created_at);

CREATE INDEX idx_mission_tasks_mission_id ON mission_tasks(mission_id);

CREATE INDEX idx_submissions_mission_id ON submissions(mission_id);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);

CREATE INDEX idx_submission_proofs_submission_id ON submission_proofs(submission_id);

CREATE INDEX idx_honors_ledger_user_id ON honors_ledger(user_id);
CREATE INDEX idx_honors_ledger_mission_id ON honors_ledger(mission_id);
CREATE INDEX idx_honors_ledger_created_at ON honors_ledger(created_at);

CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_created_at ON withdrawals(created_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user honors balance
CREATE OR REPLACE FUNCTION update_user_honors_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users 
        SET honors_balance = honors_balance + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle balance adjustments (e.g., corrections)
        UPDATE users 
        SET honors_balance = honors_balance - OLD.amount + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_honors_balance_trigger 
    AFTER INSERT OR UPDATE ON honors_ledger 
    FOR EACH ROW EXECUTE FUNCTION update_user_honors_balance();
