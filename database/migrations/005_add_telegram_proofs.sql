-- Add Telegram-specific proof tables
-- This migration adds support for Telegram proof types and validation

-- Telegram proofs table for join/react/reply/share/channel_post events
CREATE TABLE telegram_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    proof_type VARCHAR(50) NOT NULL CHECK (proof_type IN ('join_channel', 'react_to_post', 'reply_in_group', 'share_invite', 'channel_post')),
    
    -- Telegram-specific fields
    channel_id VARCHAR(100),
    message_id VARCHAR(100),
    invite_link TEXT,
    screenshot_url TEXT,
    telegram_username VARCHAR(100),
    
    -- Validation fields
    is_verified BOOLEAN DEFAULT FALSE,
    verification_timestamp TIMESTAMP WITH TIME ZONE,
    verification_method VARCHAR(50), -- 'api', 'manual', 'automated'
    
    -- Metadata
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_telegram_proof CHECK (
        (proof_type = 'join_channel' AND (channel_id IS NOT NULL OR invite_link IS NOT NULL)) OR
        (proof_type IN ('react_to_post', 'reply_in_group', 'channel_post') AND channel_id IS NOT NULL AND message_id IS NOT NULL) OR
        (proof_type = 'share_invite' AND invite_link IS NOT NULL)
    )
);

-- Indexes for performance
CREATE INDEX idx_telegram_proofs_submission_id ON telegram_proofs(submission_id);
CREATE INDEX idx_telegram_proofs_type ON telegram_proofs(proof_type);
CREATE INDEX idx_telegram_proofs_verified ON telegram_proofs(is_verified);
CREATE INDEX idx_telegram_proofs_channel_id ON telegram_proofs(channel_id);

-- Telegram channels table for tracking verified channels
CREATE TABLE telegram_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id VARCHAR(100) UNIQUE NOT NULL,
    channel_name VARCHAR(255) NOT NULL,
    channel_username VARCHAR(100),
    invite_link TEXT,
    member_count INTEGER,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for telegram channels
CREATE INDEX idx_telegram_channels_channel_id ON telegram_channels(channel_id);
CREATE INDEX idx_telegram_channels_verified ON telegram_channels(is_verified);

-- Telegram proof validation logs
CREATE TABLE telegram_validation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_proof_id UUID NOT NULL REFERENCES telegram_proofs(id) ON DELETE CASCADE,
    validation_type VARCHAR(50) NOT NULL, -- 'api_check', 'manual_review', 'automated_scan'
    validation_result VARCHAR(50) NOT NULL, -- 'success', 'failed', 'pending'
    error_message TEXT,
    validation_data JSONB,
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for validation logs
CREATE INDEX idx_telegram_validation_logs_proof_id ON telegram_validation_logs(telegram_proof_id);
CREATE INDEX idx_telegram_validation_logs_result ON telegram_validation_logs(validation_result);

-- Function to update telegram_proofs updated_at timestamp
CREATE OR REPLACE FUNCTION update_telegram_proofs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update telegram_proofs updated_at
CREATE TRIGGER update_telegram_proofs_updated_at
    BEFORE UPDATE ON telegram_proofs
    FOR EACH ROW
    EXECUTE FUNCTION update_telegram_proofs_updated_at();

-- Function to update telegram_channels updated_at timestamp
CREATE OR REPLACE FUNCTION update_telegram_channels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update telegram_channels updated_at
CREATE TRIGGER update_telegram_channels_updated_at
    BEFORE UPDATE ON telegram_channels
    FOR EACH ROW
    EXECUTE FUNCTION update_telegram_channels_updated_at();

-- View for telegram proof statistics
CREATE VIEW telegram_proof_stats AS
SELECT 
    proof_type,
    COUNT(*) as total_proofs,
    COUNT(CASE WHEN is_verified = TRUE THEN 1 END) as verified_proofs,
    COUNT(CASE WHEN is_verified = FALSE THEN 1 END) as unverified_proofs,
    ROUND(
        COUNT(CASE WHEN is_verified = TRUE THEN 1 END)::DECIMAL / COUNT(*) * 100, 2
    ) as verification_rate
FROM telegram_proofs
GROUP BY proof_type;

-- Function to validate telegram proof
CREATE OR REPLACE FUNCTION validate_telegram_proof(
    p_proof_id UUID,
    p_validation_result VARCHAR(50),
    p_validated_by UUID,
    p_error_message TEXT DEFAULT NULL,
    p_validation_data JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Update the proof verification status
    UPDATE telegram_proofs 
    SET 
        is_verified = (p_validation_result = 'success'),
        verification_timestamp = NOW(),
        verification_method = 'api',
        updated_at = NOW()
    WHERE id = p_proof_id;
    
    -- Log the validation
    INSERT INTO telegram_validation_logs (
        telegram_proof_id,
        validation_type,
        validation_result,
        error_message,
        validation_data,
        validated_by
    ) VALUES (
        p_proof_id,
        'api_check',
        p_validation_result,
        p_error_message,
        p_validation_data,
        p_validated_by
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
