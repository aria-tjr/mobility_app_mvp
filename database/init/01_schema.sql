-- Smart Mobility MVP Database Schema
-- EIC Accelerator Project - Smart Pause & Resume Vehicle Sharing Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (KYC compliant for EU regulations)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    driver_license_number VARCHAR(50),
    driver_license_expiry DATE,
    kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
    kyc_verified_at TIMESTAMP,
    stripe_customer_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User verification documents
CREATE TABLE user_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('driver_license', 'passport', 'national_id')),
    document_url VARCHAR(500) NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('scooter', 'bicycle', 'moped', 'car')),
    model VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100) NOT NULL,
    year INTEGER,
    license_plate VARCHAR(20),
    vin VARCHAR(50),
    current_location_lat DECIMAL(10, 8),
    current_location_lng DECIMAL(11, 8),
    battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
    battery_capacity DECIMAL(8, 2), -- kWh
    range_estimate DECIMAL(8, 2), -- km
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'in_use', 'maintenance', 'offline')),
    is_locked BOOLEAN DEFAULT true,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    total_distance DECIMAL(10, 2) DEFAULT 0, -- km
    total_rides INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle maintenance history
CREATE TABLE vehicle_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(50) NOT NULL CHECK (maintenance_type IN ('routine', 'repair', 'battery_replacement', 'tire_replacement')),
    description TEXT,
    cost DECIMAL(10, 2),
    performed_at TIMESTAMP NOT NULL,
    performed_by VARCHAR(100),
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rides table (complete ride lifecycle)
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    start_location_lat DECIMAL(10, 8),
    start_location_lng DECIMAL(11, 8),
    end_location_lat DECIMAL(10, 8),
    end_location_lng DECIMAL(11, 8),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    total_distance DECIMAL(8, 2), -- km
    total_duration INTEGER, -- seconds
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled', 'abandoned')),
    total_cost DECIMAL(8, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ride pause events (Smart Pause & Resume innovation)
CREATE TABLE ride_pauses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    pause_start_time TIMESTAMP NOT NULL,
    pause_end_time TIMESTAMP,
    pause_duration INTEGER, -- seconds
    pause_location_lat DECIMAL(10, 8),
    pause_location_lng DECIMAL(11, 8),
    pause_reason VARCHAR(100),
    pause_type VARCHAR(20) DEFAULT 'user_initiated' CHECK (pause_type IN ('user_initiated', 'traffic', 'maintenance', 'security')),
    billing_rate_multiplier DECIMAL(3, 2) DEFAULT 0.5, -- 0.5 = 50% rate during pause
    motion_detected BOOLEAN DEFAULT false,
    auto_resume BOOLEAN DEFAULT false,
    security_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Telemetry data (time-series for motion analysis)
CREATE TABLE telemetry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    timestamp TIMESTAMP NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    speed DECIMAL(6, 2), -- km/h
    acceleration DECIMAL(6, 2), -- m/s²
    battery_level INTEGER,
    heading DECIMAL(5, 2), -- degrees
    altitude DECIMAL(8, 2), -- meters
    temperature DECIMAL(5, 2), -- celsius
    humidity DECIMAL(5, 2), -- percentage
    motion_state VARCHAR(20) CHECK (motion_state IN ('moving', 'stopped', 'accelerating', 'decelerating')),
    user_action VARCHAR(50), -- 'pause', 'resume', 'lock', 'unlock'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Motion analysis results (ML algorithm outputs)
CREATE TABLE motion_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telemetry_id UUID NOT NULL REFERENCES telemetry(id) ON DELETE CASCADE,
    motion_pattern VARCHAR(50) CHECK (motion_pattern IN ('stationary', 'gradual', 'sudden', 'consistent', 'inconsistent')),
    is_legitimate BOOLEAN NOT NULL,
    confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    speed_variance DECIMAL(8, 4),
    location_variance DECIMAL(8, 4),
    acceleration_pattern VARCHAR(50),
    security_risk_level VARCHAR(20) DEFAULT 'low' CHECK (security_risk_level IN ('low', 'medium', 'high', 'critical')),
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing events (granular charging with pause adjustments)
CREATE TABLE billing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('ride_start', 'ride_continue', 'pause_start', 'pause_continue', 'pause_end', 'ride_end')),
    timestamp TIMESTAMP NOT NULL,
    duration INTEGER, -- seconds
    rate_per_minute DECIMAL(8, 4),
    total_amount DECIMAL(8, 4),
    billing_rate_multiplier DECIMAL(3, 2) DEFAULT 1.0,
    pause_id UUID REFERENCES ride_pauses(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions (Stripe integration)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    amount DECIMAL(8, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
    payment_method VARCHAR(50),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security incidents (theft prevention)
CREATE TABLE security_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('unauthorized_movement', 'tampering', 'theft_attempt', 'vandalism')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    timestamp TIMESTAMP NOT NULL,
    resolved BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic pricing configuration
CREATE TABLE pricing_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_type VARCHAR(50) NOT NULL,
    base_rate_per_minute DECIMAL(8, 4) NOT NULL,
    pause_rate_multiplier DECIMAL(3, 2) DEFAULT 0.5,
    traffic_rate_multiplier DECIMAL(3, 2) DEFAULT 0.3,
    security_penalty_multiplier DECIMAL(3, 2) DEFAULT 1.5,
    peak_hour_multiplier DECIMAL(3, 2) DEFAULT 1.2,
    peak_hours_start TIME DEFAULT '07:00:00',
    peak_hours_end TIME DEFAULT '09:00:00',
    is_active BOOLEAN DEFAULT true,
    effective_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effective_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User ride preferences and settings
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    auto_pause_enabled BOOLEAN DEFAULT true,
    auto_resume_enabled BOOLEAN DEFAULT true,
    pause_notification_enabled BOOLEAN DEFAULT true,
    security_alerts_enabled BOOLEAN DEFAULT true,
    preferred_vehicle_types TEXT[], -- Array of preferred vehicle types
    max_pause_duration INTEGER DEFAULT 600, -- seconds (10 minutes)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration and feature flags
CREATE TABLE system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(20) DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, config_type, description) VALUES
('smart_pause_enabled', 'true', 'boolean', 'Enable Smart Pause & Resume functionality'),
('motion_detection_enabled', 'true', 'boolean', 'Enable AI motion detection'),
('auto_resume_enabled', 'true', 'boolean', 'Enable automatic ride resumption'),
('security_monitoring_enabled', 'true', 'boolean', 'Enable real-time security monitoring'),
('max_pause_duration', '600', 'number', 'Maximum pause duration in seconds'),
('motion_confidence_threshold', '0.8', 'number', 'Minimum confidence for motion analysis'),
('telemetry_update_frequency', '1', 'number', 'Telemetry update frequency in seconds'),
('demo_mode_enabled', 'true', 'boolean', 'Enable EIC demo mode');

-- Insert default pricing configuration
INSERT INTO pricing_config (vehicle_type, base_rate_per_minute, pause_rate_multiplier, traffic_rate_multiplier, security_penalty_multiplier) VALUES
('scooter', 0.30, 0.5, 0.3, 1.5),
('bicycle', 0.20, 0.5, 0.3, 1.5),
('moped', 0.40, 0.5, 0.3, 1.5),
('car', 0.80, 0.5, 0.3, 1.5);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_location ON vehicles(current_location_lat, current_location_lng);
CREATE INDEX idx_rides_user_id ON rides(user_id);
CREATE INDEX idx_rides_vehicle_id ON rides(vehicle_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_start_time ON rides(start_time);
CREATE INDEX idx_telemetry_vehicle_id ON telemetry(vehicle_id);
CREATE INDEX idx_telemetry_timestamp ON telemetry(timestamp);
CREATE INDEX idx_telemetry_ride_id ON telemetry(ride_id);
CREATE INDEX idx_ride_pauses_ride_id ON ride_pauses(ride_id);
CREATE INDEX idx_motion_analysis_telemetry_id ON motion_analysis(telemetry_id);
CREATE INDEX idx_billing_events_ride_id ON billing_events(ride_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_security_incidents_vehicle_id ON security_incidents(vehicle_id);

-- Create composite indexes for common queries
CREATE INDEX idx_rides_user_status ON rides(user_id, status);
CREATE INDEX idx_rides_vehicle_status ON rides(vehicle_id, status);
CREATE INDEX idx_telemetry_vehicle_timestamp ON telemetry(vehicle_id, timestamp);
CREATE INDEX idx_ride_pauses_ride_timestamp ON ride_pauses(ride_id, pause_start_time);

-- Create partial indexes for active data
CREATE INDEX idx_vehicles_available ON vehicles(status) WHERE status = 'available';
CREATE INDEX idx_rides_active ON rides(status) WHERE status IN ('active', 'paused');
-- Note: Removed problematic index with CURRENT_TIMESTAMP - will be created programmatically

-- Enable Row Level Security (RLS) for GDPR compliance
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_pauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own rides" ON rides FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own telemetry" ON telemetry FOR SELECT USING (auth.uid() = user_id);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate ride cost with pause adjustments
CREATE OR REPLACE FUNCTION calculate_ride_cost(
    p_ride_id UUID,
    p_end_time TIMESTAMP DEFAULT NULL
)
RETURNS DECIMAL(8, 2) AS $$
DECLARE
    v_total_cost DECIMAL(8, 2) := 0;
    v_ride_record RECORD;
    v_pause_record RECORD;
    v_current_time TIMESTAMP := COALESCE(p_end_time, CURRENT_TIMESTAMP);
BEGIN
    -- Get ride information
    SELECT * INTO v_ride_record FROM rides WHERE id = p_ride_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Calculate base ride cost
    v_total_cost := EXTRACT(EPOCH FROM (v_current_time - v_ride_record.start_time)) / 60 * 
                    (SELECT base_rate_per_minute FROM pricing_config WHERE vehicle_type = 
                     (SELECT vehicle_type FROM vehicles WHERE id = v_ride_record.vehicle_id) AND is_active = true LIMIT 1);
    
    -- Adjust for pauses
    FOR v_pause_record IN 
        SELECT * FROM ride_pauses 
        WHERE ride_id = p_ride_id 
        AND pause_start_time < v_current_time
        AND (pause_end_time IS NULL OR pause_end_time < v_current_time)
    LOOP
        -- Calculate pause duration
        DECLARE
            v_pause_end TIMESTAMP := COALESCE(v_pause_record.pause_end_time, v_current_time);
            v_pause_duration_minutes DECIMAL(8, 2);
            v_pause_cost DECIMAL(8, 2);
        BEGIN
            v_pause_duration_minutes := EXTRACT(EPOCH FROM (v_pause_end - v_pause_record.pause_start_time)) / 60;
            
            -- Calculate pause cost with reduced rate
            v_pause_cost := v_pause_duration_minutes * 
                           (SELECT base_rate_per_minute FROM pricing_config WHERE vehicle_type = 
                            (SELECT vehicle_type FROM vehicles WHERE id = v_ride_record.vehicle_id) AND is_active = true LIMIT 1) *
                           v_pause_record.billing_rate_multiplier;
            
            -- Subtract pause cost from total and add reduced pause cost
            v_total_cost := v_total_cost - (v_pause_duration_minutes * 
                           (SELECT base_rate_per_minute FROM pricing_config WHERE vehicle_type = 
                            (SELECT vehicle_type FROM vehicles WHERE id = v_ride_record.vehicle_id) AND is_active = true LIMIT 1)) +
                           v_pause_cost;
        END;
    END LOOP;
    
    RETURN GREATEST(v_total_cost, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to get vehicle status summary
CREATE OR REPLACE FUNCTION get_vehicle_status_summary()
RETURNS TABLE(
    total_vehicles BIGINT,
    available_vehicles BIGINT,
    in_use_vehicles BIGINT,
    maintenance_vehicles BIGINT,
    offline_vehicles BIGINT,
    avg_battery_level DECIMAL(5, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_vehicles,
        COUNT(*) FILTER (WHERE status = 'available') as available_vehicles,
        COUNT(*) FILTER (WHERE status = 'in_use') as in_use_vehicles,
        COUNT(*) FILTER (WHERE status = 'maintenance') as maintenance_vehicles,
        COUNT(*) FILTER (WHERE status = 'offline') as offline_vehicles,
        AVG(battery_level) as avg_battery_level
    FROM vehicles;
END;
$$ LANGUAGE plpgsql;

-- Create function to get ride analytics
CREATE OR REPLACE FUNCTION get_ride_analytics(
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    total_rides BIGINT,
    total_revenue DECIMAL(10, 2),
    avg_ride_duration INTEGER,
    total_pause_time INTEGER,
    pause_utilization_rate DECIMAL(5, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_rides,
        COALESCE(SUM(total_cost), 0) as total_revenue,
        AVG(total_duration)::INTEGER as avg_ride_duration,
        COALESCE(SUM(
            (SELECT COALESCE(SUM(pause_duration), 0) 
             FROM ride_pauses 
             WHERE ride_id = r.id)
        ), 0) as total_pause_time,
        CASE 
            WHEN AVG(total_duration) > 0 THEN 
                (COALESCE(SUM(
                    (SELECT COALESCE(SUM(pause_duration), 0) 
                     FROM ride_pauses 
                     WHERE ride_id = r.id)
                ), 0)::DECIMAL / AVG(total_duration) * 100)
            ELSE 0 
        END as pause_utilization_rate
    FROM rides r
    WHERE DATE(start_time) BETWEEN p_start_date AND p_end_date
    AND status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO mobility_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO mobility_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO mobility_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO mobility_user;

-- Create view for real-time fleet status
CREATE VIEW fleet_status_view AS
SELECT 
    v.id,
    v.vehicle_type,
    v.model,
    v.manufacturer,
    v.current_location_lat,
    v.current_location_lng,
    v.battery_level,
    v.range_estimate,
    v.status,
    v.is_locked,
    v.total_distance,
    v.total_rides,
    r.id as current_ride_id,
    r.user_id as current_user_id,
    r.start_time as ride_start_time,
    rp.id as current_pause_id,
    rp.pause_start_time,
    rp.pause_duration,
    rp.billing_rate_multiplier
FROM vehicles v
LEFT JOIN rides r ON v.id = r.vehicle_id AND r.status IN ('active', 'paused')
LEFT JOIN ride_pauses rp ON r.id = rp.ride_id AND rp.pause_end_time IS NULL
WHERE v.status != 'offline';

-- Create view for user ride history
CREATE VIEW user_ride_history_view AS
SELECT 
    r.id as ride_id,
    r.user_id,
    u.email,
    u.first_name,
    u.last_name,
    v.vehicle_type,
    v.model,
    r.start_time,
    r.end_time,
    r.total_distance,
    r.total_duration,
    r.total_cost,
    r.status,
    COUNT(rp.id) as pause_count,
    COALESCE(SUM(rp.pause_duration), 0) as total_pause_time,
    r.created_at
FROM rides r
JOIN users u ON r.user_id = u.id
JOIN vehicles v ON r.vehicle_id = v.id
LEFT JOIN ride_pauses rp ON r.id = rp.ride_id
GROUP BY r.id, r.user_id, u.email, u.first_name, u.last_name, v.vehicle_type, v.model, r.start_time, r.end_time, r.total_distance, r.total_duration, r.total_cost, r.status, r.created_at;

-- Create view for security monitoring
CREATE VIEW security_monitoring_view AS
SELECT 
    si.id as incident_id,
    si.incident_type,
    si.severity,
    si.description,
    si.location_lat,
    si.location_lng,
    si.timestamp,
    si.resolved,
    v.id as vehicle_id,
    v.vehicle_type,
    v.model,
    r.id as ride_id,
    r.user_id,
    u.email,
    ma.motion_pattern,
    ma.is_legitimate,
    ma.confidence_score,
    ma.security_risk_level
FROM security_incidents si
JOIN vehicles v ON si.vehicle_id = v.id
LEFT JOIN rides r ON si.ride_id = r.id
LEFT JOIN users u ON r.user_id = u.id
LEFT JOIN telemetry t ON v.id = t.vehicle_id AND t.timestamp = si.timestamp
LEFT JOIN motion_analysis ma ON t.id = ma.telemetry_id
WHERE si.resolved = false
ORDER BY si.timestamp DESC;

COMMENT ON TABLE users IS 'User accounts with KYC compliance for EU regulations';
COMMENT ON TABLE vehicles IS 'Fleet vehicles with real-time status and location tracking';
COMMENT ON TABLE rides IS 'Complete ride lifecycle with Smart Pause & Resume functionality';
COMMENT ON TABLE ride_pauses IS 'Smart Pause events with motion detection and billing adjustments';
COMMENT ON TABLE telemetry IS 'Real-time vehicle telemetry data for motion analysis';
COMMENT ON TABLE motion_analysis IS 'AI-powered motion pattern analysis results';
COMMENT ON TABLE billing_events IS 'Granular billing events with pause rate adjustments';
COMMENT ON TABLE security_incidents IS 'Security and theft prevention incidents';
COMMENT ON TABLE pricing_config IS 'Dynamic pricing configuration for different vehicle types and states';
COMMENT ON FUNCTION calculate_ride_cost IS 'Calculate ride cost with Smart Pause adjustments';
COMMENT ON FUNCTION get_vehicle_status_summary IS 'Get real-time fleet status summary';
COMMENT ON FUNCTION get_ride_analytics IS 'Get ride analytics with pause utilization metrics';
