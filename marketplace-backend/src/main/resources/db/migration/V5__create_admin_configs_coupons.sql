DROP TABLE IF EXISTS system_configs CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;

CREATE TABLE system_configs (
    id UUID PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP
);

CREATE TABLE coupons (
    id UUID PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(12,2) NOT NULL,
    min_order_value DECIMAL(12,2),
    max_discount DECIMAL(12,2),
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    total_usage_limit INTEGER,
    per_user_limit INTEGER,
    current_usage INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
