-- Migration to add degen mission specific fields
-- This migration adds fields specifically for degen missions

-- Add degen-specific fields to missions table
ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS degen_mode BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS winners_cap INTEGER,
ADD COLUMN IF NOT EXISTS user_pool_honors INTEGER,
ADD COLUMN IF NOT EXISTS per_winner_honors INTEGER,
ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ends_at TIMESTAMP WITH TIME ZONE;

-- Add constraints for degen missions
ALTER TABLE missions 
ADD CONSTRAINT valid_degen_winners_cap 
CHECK (
    (mission_model = 'degen' AND winners_cap IS NOT NULL AND winners_cap > 0)
    OR mission_model = 'fixed'
);

ALTER TABLE missions 
ADD CONSTRAINT valid_degen_pool_honors 
CHECK (
    (mission_model = 'degen' AND user_pool_honors IS NOT NULL AND user_pool_honors > 0)
    OR mission_model = 'fixed'
);

ALTER TABLE missions 
ADD CONSTRAINT valid_degen_per_winner_honors 
CHECK (
    (mission_model = 'degen' AND per_winner_honors IS NOT NULL AND per_winner_honors > 0)
    OR mission_model = 'fixed'
);

ALTER TABLE missions 
ADD CONSTRAINT valid_degen_timestamps 
CHECK (
    (mission_model = 'degen' AND starts_at IS NOT NULL AND ends_at IS NOT NULL AND starts_at < ends_at)
    OR mission_model = 'fixed'
);

-- Add index for degen mission queries
CREATE INDEX IF NOT EXISTS idx_missions_degen_mode ON missions(degen_mode);
CREATE INDEX IF NOT EXISTS idx_missions_starts_at ON missions(starts_at);
CREATE INDEX IF NOT EXISTS idx_missions_ends_at ON missions(ends_at);

-- Add function to calculate degen mission end time
CREATE OR REPLACE FUNCTION calculate_degen_end_time(start_time TIMESTAMP WITH TIME ZONE, duration_hours INTEGER)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN start_time + (duration_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Add function to check if degen mission is active
CREATE OR REPLACE FUNCTION is_degen_mission_active(mission_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    mission_record RECORD;
BEGIN
    SELECT starts_at, ends_at, status INTO mission_record
    FROM missions 
    WHERE id = mission_id AND mission_model = 'degen';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    RETURN mission_record.status = 'active' 
           AND NOW() >= mission_record.starts_at 
           AND NOW() <= mission_record.ends_at;
END;
$$ LANGUAGE plpgsql;

-- Add function to get active degen missions
CREATE OR REPLACE FUNCTION get_active_degen_missions()
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    platform VARCHAR(50),
    mission_type VARCHAR(50),
    winners_cap INTEGER,
    per_winner_honors INTEGER,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.title,
        m.platform,
        m.mission_type,
        m.winners_cap,
        m.per_winner_honors,
        m.starts_at,
        m.ends_at
    FROM missions m
    WHERE m.mission_model = 'degen'
      AND m.status = 'active'
      AND NOW() >= m.starts_at
      AND NOW() <= m.ends_at;
END;
$$ LANGUAGE plpgsql;

-- Add function to get degen mission winner count
CREATE OR REPLACE FUNCTION get_degen_winner_count(mission_id UUID)
RETURNS INTEGER AS $$
DECLARE
    winner_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO winner_count
    FROM submissions
    WHERE mission_id = $1 
      AND status = 'approved';
    
    RETURN COALESCE(winner_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Add function to check if degen mission is full
CREATE OR REPLACE FUNCTION is_degen_mission_full(mission_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    mission_record RECORD;
    winner_count INTEGER;
BEGIN
    SELECT winners_cap INTO mission_record
    FROM missions 
    WHERE id = mission_id AND mission_model = 'degen';
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    SELECT get_degen_winner_count(mission_id) INTO winner_count;
    
    RETURN winner_count >= mission_record.winners_cap;
END;
$$ LANGUAGE plpgsql;

-- Add view for degen mission statistics
CREATE OR REPLACE VIEW degen_mission_stats AS
SELECT 
    m.id,
    m.title,
    m.platform,
    m.mission_type,
    m.winners_cap,
    m.per_winner_honors,
    m.user_pool_honors,
    m.starts_at,
    m.ends_at,
    m.status,
    COUNT(s.id) as total_submissions,
    COUNT(CASE WHEN s.status = 'approved' THEN 1 END) as approved_submissions,
    COUNT(CASE WHEN s.status = 'pending' THEN 1 END) as pending_submissions,
    COUNT(CASE WHEN s.status = 'rejected' THEN 1 END) as rejected_submissions,
    get_degen_winner_count(m.id) as current_winners,
    is_degen_mission_full(m.id) as is_full,
    is_degen_mission_active(m.id) as is_active
FROM missions m
LEFT JOIN submissions s ON m.id = s.mission_id
WHERE m.mission_model = 'degen'
GROUP BY m.id, m.title, m.platform, m.mission_type, m.winners_cap, 
         m.per_winner_honors, m.user_pool_honors, m.starts_at, m.ends_at, m.status;
