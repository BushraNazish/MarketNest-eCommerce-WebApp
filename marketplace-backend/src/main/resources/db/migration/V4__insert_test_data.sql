-- Insert a category
INSERT INTO categories (id, name, slug, category_type, is_active)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Laptops', 'laptops', 'ELECTRONICS', true)
ON CONFLICT DO NOTHING;

-- Insert a seller user (password: test1234)
INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active)
VALUES
('22222222-2222-2222-2222-222222222222', 'seller@test.com', '$2a$10$WPEI8fP4Hqf2jQ5dF49q1.V8G4B.g57F9Y76gO89W5X17F1Gf3D4O', 'SELLER', 'Test', 'Seller', true)
ON CONFLICT DO NOTHING;

-- Insert a vendor profile for the seller
INSERT INTO vendors (id, user_id, business_name, store_name, store_slug, status, is_active)
VALUES
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Test Business', 'Test Store', 'test-store', 'APPROVED', true)
ON CONFLICT DO NOTHING;

-- Insert a product
INSERT INTO products (id, vendor_id, category_id, name, slug, description, short_description, base_price, status, has_variants)
VALUES
('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Gaming Laptop X1', 'gaming-laptop-x1', 'High performance gaming laptop', 'Gaming Laptop', 85000.00, 'ACTIVE', false)
ON CONFLICT DO NOTHING;

-- Insert product image
INSERT INTO product_images (product_id, image_url, is_primary)
VALUES
('44444444-4444-4444-4444-444444444444', 'https://m.media-amazon.com/images/I/71Z-T+vRhkL._AC_UY327_FMwebp_QL65_.jpg', true)
ON CONFLICT DO NOTHING;

-- Insert inventory for product
INSERT INTO inventory (product_id, quantity)
VALUES
('44444444-4444-4444-4444-444444444444', 50)
ON CONFLICT DO NOTHING;

-- Insert another product
INSERT INTO products (id, vendor_id, category_id, name, slug, description, short_description, base_price, status, has_variants)
VALUES
('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Wireless Mouse', 'wireless-mouse', 'Ergonomic wireless mouse', 'Wireless Mouse', 1500.00, 'ACTIVE', false)
ON CONFLICT DO NOTHING;

-- Insert image for second product
INSERT INTO product_images (product_id, image_url, is_primary)
VALUES
('55555555-5555-5555-5555-555555555555', 'https://m.media-amazon.com/images/I/61UxfXTUyvL._AC_UY327_FMwebp_QL65_.jpg', true)
ON CONFLICT DO NOTHING;

-- Insert inventory for second product
INSERT INTO inventory (product_id, quantity)
VALUES
('55555555-5555-5555-5555-555555555555', 100)
ON CONFLICT DO NOTHING;
