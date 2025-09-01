-- Seed data for development missions
-- This file contains sample data for testing the platform

-- Insert sample users
INSERT INTO users (id, username, email, wallet_address, honors_balance) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'alice', 'alice@example.com', 'EQD...alice_wallet', 10000),
('550e8400-e29b-41d4-a716-446655440002', 'bob', 'bob@example.com', 'EQD...bob_wallet', 5000),
('550e8400-e29b-41d4-a716-446655440003', 'charlie', 'charlie@example.com', 'EQD...charlie_wallet', 7500)
ON CONFLICT (username) DO NOTHING;

-- Insert one fixed mission
INSERT INTO missions (
    id,
    creator_id,
    title,
    description,
    platform,
    mission_type,
    mission_model,
    target_profile,
    status,
    participant_cap,
    per_user_honors,
    total_cost_usd,
    total_cost_honors,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440101',
    '550e8400-e29b-41d4-a716-446655440001',
    'Twitter Engagement Campaign',
    'Engage with our latest product announcement on Twitter. Like, retweet, and comment to earn Honors!',
    'twitter',
    'engage',
    'fixed',
    'all',
    'active',
    100,
    500,
    100.00,
    45000,
    NOW()
);

-- Insert tasks for the fixed mission
INSERT INTO mission_tasks (mission_id, task_type, honors_reward) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'like', 20),
('550e8400-e29b-41d4-a716-446655440101', 'retweet', 300),
('550e8400-e29b-41d4-a716-446655440101', 'comment', 180);

-- Insert one degen mission (8h, winners=3)
INSERT INTO missions (
    id,
    creator_id,
    title,
    description,
    platform,
    mission_type,
    mission_model,
    target_profile,
    status,
    duration_hours,
    winners_cap,
    user_pool_honors,
    per_winner_honors,
    total_cost_usd,
    total_cost_honors,
    starts_at,
    ends_at,
    degen_mode,
    created_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440102',
    '550e8400-e29b-41d4-a716-446655440002',
    'Instagram Content Creation Challenge',
    'Create amazing content featuring our product. The best 3 creators will win big!',
    'instagram',
    'content',
    'degen',
    'all',
    'active',
    8,
    3,
    33750,
    11250,
    150.00,
    67500,
    NOW(),
    NOW() + INTERVAL '8 hours',
    TRUE,
    NOW()
);

-- Insert tasks for the degen mission
INSERT INTO mission_tasks (mission_id, task_type, honors_reward) VALUES
('550e8400-e29b-41d4-a716-446655440102', 'feed_post', 2400),
('550e8400-e29b-41d4-a716-446655440102', 'reel', 3600);

-- Insert sample submissions for the fixed mission
INSERT INTO submissions (mission_id, user_id, status, honors_awarded) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440003', 'approved', 500),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440002', 'pending', NULL);

-- Insert sample submissions for the degen mission
INSERT INTO submissions (mission_id, user_id, status, honors_awarded) VALUES
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'approved', 11250),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440003', 'pending', NULL);

-- Insert sample proofs for submissions
INSERT INTO submission_proofs (submission_id, proof_type, proof_content) VALUES
-- Proofs for fixed mission submission
('550e8400-e29b-41d4-a716-446655440101', 'screenshot', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='),
-- Proofs for degen mission submission
('550e8400-e29b-41d4-a716-446655440102', 'screenshot', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');

-- Insert sample ledger entries
INSERT INTO honors_ledger (user_id, mission_id, submission_id, transaction_type, amount, balance_before, balance_after, description) VALUES
-- Mission creation costs
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', NULL, 'mission_creation', -45000, 10000, -35000, 'Fixed mission creation cost'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440102', NULL, 'mission_creation', -67500, 5000, -62500, 'Degen mission creation cost'),

-- Mission rewards
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440101', 'mission_reward', 500, 7500, 8000, 'Fixed mission reward'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440102', 'mission_reward', 11250, -35000, -23750, 'Degen mission winner reward');

-- Insert sample withdrawals
INSERT INTO withdrawals (user_id, honors_amount, usd_amount, status, wallet_address) VALUES
('550e8400-e29b-41d4-a716-446655440003', 2000, 4.44, 'completed', 'EQD...charlie_wallet'),
('550e8400-e29b-41d4-a716-446655440001', 5000, 11.11, 'pending', 'EQD...alice_wallet');
