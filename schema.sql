-- ============================================================
-- KWATHU FOODS — Database Schema (Neon Postgres)
-- ============================================================
-- Run this once against your Neon database, e.g.:
--   psql "$DATABASE_URL" -f schema.sql
-- ============================================================

-- Needed for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- USERS  (customers + admins, same table, role-based)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(120) NOT NULL,
    email           VARCHAR(180) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    phone           VARCHAR(30),
    role            VARCHAR(20) NOT NULL DEFAULT 'customer'
                        CHECK (role IN ('customer', 'admin')),
    dietary_notes   TEXT,                      -- e.g. "diabetic, low-salt"
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- PRODUCTS  (meals / menu items sold by the kitchen)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(160) NOT NULL,
    slug            VARCHAR(180) NOT NULL UNIQUE,
    description     TEXT,
    price           NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    category        VARCHAR(80),               -- e.g. "Diabetic-Friendly", "Weight Loss"
    image_url       TEXT,
    is_organic      BOOLEAN NOT NULL DEFAULT false,
    dietary_tags    TEXT[] DEFAULT '{}',        -- e.g. {'low-sugar','ulcer-friendly'}
    nutrition_info  JSONB DEFAULT '{}',         -- e.g. {"calories":450,"sugar_g":5}
    is_available    BOOLEAN NOT NULL DEFAULT true,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);

-- ------------------------------------------------------------
-- RECIPES  (separate section, own page — public preview only;
-- exact recipe/secret formula is admin-only per business rules)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(160) NOT NULL,
    slug                VARCHAR(180) NOT NULL UNIQUE,
    summary             TEXT,                  -- public teaser description
    cover_image_url     TEXT,
    dietary_tags        TEXT[] DEFAULT '{}',
    is_public           BOOLEAN NOT NULL DEFAULT true,   -- show teaser on site
    ingredients_public  TEXT,                  -- general, non-secret ingredient list (nullable)
    steps_private        TEXT,                 -- SECRET full method — admin/API only, never sent to public endpoint
    ingredients_private  TEXT,                 -- SECRET exact formula/quantities — admin only
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipes_public ON recipes(is_public);

-- ------------------------------------------------------------
-- BLOG POSTS  (health tips, farm updates, plant guides tagged as a category)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blog_posts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(200) NOT NULL,
    slug            VARCHAR(220) NOT NULL UNIQUE,
    excerpt         TEXT,
    content         TEXT NOT NULL,
    cover_image_url TEXT,
    category        VARCHAR(80) DEFAULT 'General', -- e.g. 'Nutrition', 'Plant Guide', 'Farm Update'
    tags            TEXT[] DEFAULT '{}',
    is_published    BOOLEAN NOT NULL DEFAULT true,
    author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at    TIMESTAMPTZ DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(is_published);
CREATE INDEX IF NOT EXISTS idx_blog_category ON blog_posts(category);

-- ------------------------------------------------------------
-- ORDERS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','confirmed','preparing','out_for_delivery','completed','cancelled')),
    delivery_address    TEXT,
    delivery_phone      VARCHAR(30),
    notes               TEXT,
    subtotal            NUMERIC(10,2) NOT NULL DEFAULT 0,
    total               NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ------------------------------------------------------------
-- ORDER ITEMS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name    VARCHAR(160) NOT NULL,     -- snapshot at time of order
    unit_price      NUMERIC(10,2) NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    line_total      NUMERIC(10,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ------------------------------------------------------------
-- CONTACT MESSAGES  (public contact form submissions)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(180) NOT NULL,
    subject         VARCHAR(200),
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Auto-update "updated_at" trigger helper
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated ON products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_recipes_updated ON recipes;
CREATE TRIGGER trg_recipes_updated BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_blog_updated ON blog_posts;
CREATE TRIGGER trg_blog_updated BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated ON orders;
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Seeding the first admin account
-- ------------------------------------------------------------
-- Do NOT hand-write a bcrypt hash here. Instead, after running this
-- schema, run:  node backend/scripts/createAdmin.js
-- which will prompt for an email/password and insert a properly
-- hashed admin user for you.
