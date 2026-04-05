-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'SELLER', 'ADMIN');
CREATE TYPE vendor_status AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');
CREATE TYPE product_category AS ENUM ('ELECTRONICS', 'FASHION', 'GROCERIES');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE product_status AS ENUM ('DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'INACTIVE', 'REJECTED');
CREATE TYPE return_status AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'PICKED_UP', 'RECEIVED', 'REFUNDED');
CREATE TYPE notification_channel AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP');
CREATE TYPE payout_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Full-text search for products
CREATE OR REPLACE FUNCTION products_search_trigger() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

-- Users table (all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens for JWT rotation
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer addresses
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50),  -- 'Home', 'Work', 'Other'
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email verification tokens (Magic Link)
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Phone OTP tokens
CREATE TABLE phone_verification_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_email_verification_token ON email_verification_tokens(token_hash);

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VENDORS & SELLER MANAGEMENT
-- ============================================

-- Vendor/Seller profiles
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Business Information
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50),  -- 'Individual', 'Partnership', 'Company'
    store_name VARCHAR(255) NOT NULL,
    store_slug VARCHAR(255) UNIQUE NOT NULL,
    store_description TEXT,
    store_logo_url VARCHAR(500),
    store_banner_url VARCHAR(500),
    
    -- Contact
    business_email VARCHAR(255),
    business_phone VARCHAR(20),
    
    -- Address
    business_address_line1 VARCHAR(255),
    business_address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    
    -- Verification Status
    status vendor_status DEFAULT 'PENDING',
    status_reason TEXT,
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    
    -- Categories vendor can sell in
    allowed_categories product_category[] DEFAULT '{}',
    
    -- Ratings
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    auto_accept_orders BOOLEAN DEFAULT TRUE,
    vacation_mode BOOLEAN DEFAULT FALSE,
    vacation_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor KYC Documents
CREATE TABLE vendor_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,  -- 'PAN', 'GST', 'AADHAAR', 'BANK_PROOF', 'ADDRESS_PROOF'
    document_number VARCHAR(100),
    document_url VARCHAR(500),
    verification_status VARCHAR(20) DEFAULT 'PENDING',  -- 'PENDING', 'VERIFIED', 'REJECTED'
    rejection_reason TEXT,
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Bank Accounts
CREATE TABLE vendor_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commission Configuration (Admin managed)
CREATE TABLE commission_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category product_category NOT NULL,
    commission_percentage DECIMAL(5,2) NOT NULL,  -- e.g., 15.00 for 15%
    flat_fee DECIMAL(10,2) DEFAULT 0,
    min_commission DECIMAL(10,2),
    max_commission DECIMAL(10,2),
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor-specific commission overrides
CREATE TABLE vendor_commission_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    category product_category,
    commission_percentage DECIMAL(5,2) NOT NULL,
    reason TEXT,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendors_user ON vendors(user_id);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_slug ON vendors(store_slug);
CREATE INDEX idx_vendor_docs_vendor ON vendor_documents(vendor_id);

CREATE TRIGGER vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PRODUCT CATALOG & INVENTORY
-- ============================================

-- Categories (hierarchical)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    icon_name VARCHAR(100),
    category_type product_category NOT NULL,
    level INTEGER DEFAULT 0,  -- 0 = root, 1 = child, 2 = grandchild
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attribute definitions (for EAV pattern)
CREATE TABLE attribute_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE NOT NULL,  -- 'ram_size', 'color', 'expiry_date'
    data_type VARCHAR(50) NOT NULL,  -- 'STRING', 'NUMBER', 'BOOLEAN', 'DATE', 'ENUM', 'MULTI_ENUM'
    unit VARCHAR(50),  -- 'GB', 'cm', 'kg'
    is_required BOOLEAN DEFAULT FALSE,
    is_filterable BOOLEAN DEFAULT FALSE,
    is_variant_attribute BOOLEAN DEFAULT FALSE,
    enum_values JSONB,  -- For ENUM types
    validation_rules JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Category-Attribute mapping
CREATE TABLE category_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    attribute_id UUID REFERENCES attribute_definitions(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    UNIQUE(category_id, attribute_id)
);

-- Products (parent product)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    
    -- Basic Info
    name VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    
    -- Pricing
    base_price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    
    -- Tax
    tax_category VARCHAR(50),
    hsn_code VARCHAR(20),
    
    -- Status
    status product_status DEFAULT 'DRAFT',
    rejection_reason TEXT,
    
    -- Flags
    has_variants BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_digital BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    meta_keywords VARCHAR(255),
    
    -- Stats (denormalized)
    rating_average DECIMAL(3,2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    
    -- Full-text search
    search_vector tsvector,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(vendor_id, slug)
);

-- Product Images
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Attribute Values (EAV)
CREATE TABLE product_attribute_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    attribute_id UUID REFERENCES attribute_definitions(id),
    value_string VARCHAR(1000),
    value_number DECIMAL(15,4),
    value_boolean BOOLEAN,
    value_date DATE,
    value_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, attribute_id)
);

-- Product Variants
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255),
    
    -- Pricing
    price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    
    -- Variant attributes stored as JSONB
    variant_attributes JSONB NOT NULL,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    
    -- For groceries - batch tracking
    batch_number VARCHAR(100),
    manufacturing_date DATE,
    expiry_date DATE,
    
    -- Location (for future multi-warehouse)
    warehouse_id UUID,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_inventory_target CHECK (
        (variant_id IS NOT NULL) OR 
        (variant_id IS NULL AND product_id IS NOT NULL)
    )
);

-- Inventory Transactions
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID REFERENCES inventory(id),
    transaction_type VARCHAR(50) NOT NULL,  -- 'STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RESERVED', 'RELEASED'
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_product_attrs_product ON product_attribute_values(product_id);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_variant ON inventory(variant_id);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_date);

CREATE TRIGGER products_search_update BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION products_search_trigger();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEARCH & FILTERING
-- ============================================

-- Search suggestions
CREATE TABLE search_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term VARCHAR(255) UNIQUE NOT NULL,
    search_count INTEGER DEFAULT 1,
    last_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User search history
CREATE TABLE user_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    search_term VARCHAR(255) NOT NULL,
    filters_applied JSONB,
    results_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_history_user ON user_search_history(user_id);

-- SHOPPING CART & WISHLIST (Moved to V3)

-- ============================================
-- ORDERS & PAYMENTS
-- ============================================

-- Orders (parent order)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    
    -- Guest checkout
    guest_email VARCHAR(255),
    guest_phone VARCHAR(20),
    
    -- Addresses (snapshot)
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    
    -- Totals
    subtotal DECIMAL(12,2) NOT NULL,
    shipping_total DECIMAL(12,2) DEFAULT 0,
    tax_total DECIMAL(12,2) DEFAULT 0,
    discount_total DECIMAL(12,2) DEFAULT 0,
    grand_total DECIMAL(12,2) NOT NULL,
    
    -- Coupon
    coupon_code VARCHAR(50),
    coupon_discount DECIMAL(12,2) DEFAULT 0,
    
    -- Payment
    payment_method VARCHAR(50),
    payment_status payment_status DEFAULT 'PENDING',
    
    -- Status
    status order_status DEFAULT 'PENDING',
    
    -- Timestamps
    placed_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    currency VARCHAR(3) DEFAULT 'INR',
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sub-orders (per vendor)
CREATE TABLE sub_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    sub_order_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id UUID REFERENCES vendors(id),
    
    -- Totals
    subtotal DECIMAL(12,2) NOT NULL,
    shipping_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    
    -- Commission
    commission_rate DECIMAL(5,2),
    commission_amount DECIMAL(12,2),
    vendor_earning DECIMAL(12,2),
    
    -- Fulfillment
    status order_status DEFAULT 'PENDING',
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url VARCHAR(500),
    carrier VARCHAR(100),
    
    -- Timestamps
    confirmed_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    vendor_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    sub_order_id UUID REFERENCES sub_orders(id),
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    vendor_id UUID REFERENCES vendors(id),
    
    -- Snapshot
    product_name VARCHAR(500) NOT NULL,
    variant_name VARCHAR(255),
    sku VARCHAR(100),
    image_url VARCHAR(500),
    
    -- Pricing
    unit_price DECIMAL(12,2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    
    -- For groceries
    batch_number VARCHAR(100),
    expiry_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment Transactions
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    
    -- Gateway info
    gateway VARCHAR(50) NOT NULL,  -- 'RAZORPAY'
    gateway_order_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    gateway_signature VARCHAR(255),
    
    -- Amount
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Status
    status VARCHAR(20) NOT NULL,  -- 'CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED'
    failure_reason TEXT,
    
    -- Metadata
    payment_method VARCHAR(50),
    card_last4 VARCHAR(4),
    bank_name VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Payouts
CREATE TABLE vendor_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id),
    
    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Amounts
    gross_amount DECIMAL(12,2) NOT NULL,
    commission_amount DECIMAL(12,2) NOT NULL,
    deductions DECIMAL(12,2) DEFAULT 0,
    net_amount DECIMAL(12,2) NOT NULL,
    
    -- Status
    status payout_status DEFAULT 'PENDING',
    
    -- Transfer info
    transfer_id VARCHAR(255),
    transfer_status VARCHAR(50),
    
    bank_account_id UUID REFERENCES vendor_bank_accounts(id),
    
    processed_at TIMESTAMP,
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payout Items
CREATE TABLE payout_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payout_id UUID REFERENCES vendor_payouts(id) ON DELETE CASCADE,
    sub_order_id UUID REFERENCES sub_orders(id),
    order_amount DECIMAL(12,2),
    commission_amount DECIMAL(12,2),
    net_amount DECIMAL(12,2)
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_suborders_order ON sub_orders(order_id);
CREATE INDEX idx_suborders_vendor ON sub_orders(vendor_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_order ON payment_transactions(order_id);
CREATE INDEX idx_payouts_vendor ON vendor_payouts(vendor_id);

-- ============================================
-- ORDER FULFILLMENT & NOTIFICATIONS
-- ============================================

-- Order Status History
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    sub_order_id UUID REFERENCES sub_orders(id),
    from_status order_status,
    to_status order_status NOT NULL,
    changed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Return Requests
CREATE TABLE return_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    sub_order_id UUID REFERENCES sub_orders(id),
    user_id UUID REFERENCES users(id),
    
    return_number VARCHAR(50) UNIQUE NOT NULL,
    
    items JSONB NOT NULL,  -- [{order_item_id, quantity, reason}]
    
    reason VARCHAR(100) NOT NULL,
    reason_details TEXT,
    
    status return_status DEFAULT 'REQUESTED',
    
    -- Refund
    refund_amount DECIMAL(12,2),
    refund_status VARCHAR(20),
    refund_id VARCHAR(255),
    
    -- Pickup
    pickup_address JSONB,
    pickup_scheduled_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    received_at TIMESTAMP,
    
    admin_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    
    -- Email
    email_subject VARCHAR(500),
    email_body TEXT,
    
    -- SMS
    sms_body VARCHAR(500),
    
    -- Push
    push_title VARCHAR(255),
    push_body VARCHAR(500),
    
    variables JSONB,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification Log
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    template_code VARCHAR(100),
    channel notification_channel NOT NULL,
    
    recipient VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT NOT NULL,
    
    status VARCHAR(20) DEFAULT 'PENDING',  -- 'PENDING', 'SENT', 'DELIVERED', 'FAILED'
    failure_reason TEXT,
    
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    
    metadata JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_returns_order ON return_requests(order_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- ============================================
-- REVIEWS & RATINGS
-- ============================================

-- Product Reviews
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    order_item_id UUID REFERENCES order_items(id),
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    body TEXT,
    
    -- Pros and Cons
    pros TEXT[],
    cons TEXT[],
    
    -- Media
    images JSONB,
    
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    
    -- Moderation
    status VARCHAR(20) DEFAULT 'PENDING',  -- 'PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'
    moderation_notes TEXT,
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP,
    
    -- Helpfulness
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Review Votes
CREATE TABLE review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(review_id, user_id)
);

-- Review Reports
CREATE TABLE review_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seller Reviews
CREATE TABLE seller_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    sub_order_id UUID REFERENCES sub_orders(id),
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    shipping_rating INTEGER CHECK (shipping_rating >= 1 AND shipping_rating <= 5),
    packaging_rating INTEGER CHECK (packaging_rating >= 1 AND packaging_rating <= 5),
    
    body TEXT,
    
    status VARCHAR(20) DEFAULT 'APPROVED',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rating Summary (materialized)
CREATE TABLE product_rating_summary (
    product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    rating_1_count INTEGER DEFAULT 0,
    rating_2_count INTEGER DEFAULT 0,
    rating_3_count INTEGER DEFAULT 0,
    rating_4_count INTEGER DEFAULT 0,
    rating_5_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_reviews_user ON product_reviews(user_id);
CREATE INDEX idx_reviews_status ON product_reviews(status);
CREATE INDEX idx_seller_reviews_vendor ON seller_reviews(vendor_id);

-- ============================================
-- ADMIN & SYSTEM CONFIGURATION
-- ============================================

-- System Configuration
CREATE TABLE system_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupons
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    
    discount_type VARCHAR(20) NOT NULL,  -- 'PERCENTAGE', 'FIXED'
    discount_value DECIMAL(12,2) NOT NULL,
    
    min_order_value DECIMAL(12,2),
    max_discount DECIMAL(12,2),
    
    -- Validity
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    
    -- Usage limits
    total_usage_limit INTEGER,
    per_user_limit INTEGER DEFAULT 1,
    current_usage INTEGER DEFAULT 0,
    
    -- Restrictions
    applicable_categories product_category[],
    applicable_vendors UUID[],
    
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Coupon Usage
CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id),
    user_id UUID REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    discount_amount DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_coupons_code ON coupons(code);
