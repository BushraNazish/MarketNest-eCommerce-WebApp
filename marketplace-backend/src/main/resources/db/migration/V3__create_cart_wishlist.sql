CREATE TABLE carts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    total_amount DECIMAL(19, 2) DEFAULT 0.00,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE cart_items (
    id BIGSERIAL PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(19, 2),
    CONSTRAINT fk_cart_item_cart FOREIGN KEY (cart_id) REFERENCES carts (id),
    CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE wishlists (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE wishlist_items (
    id BIGSERIAL PRIMARY KEY,
    wishlist_id BIGINT NOT NULL,
    product_id UUID NOT NULL,
    CONSTRAINT fk_wishlist_item_wishlist FOREIGN KEY (wishlist_id) REFERENCES wishlists (id),
    CONSTRAINT fk_wishlist_item_product FOREIGN KEY (product_id) REFERENCES products (id)
);
