-- ============================================================================
-- 001_initial_schema.sql: Supabase PostgreSQL Relational Schema
-- AI-Powered Waste Lifecycle & Circular Marketplace (WasteXchange)
-- ============================================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. PROFILES (Extends auth.users)
-- ============================================================================
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    email text,
    phone text,
    role text not null default 'user' check (role in ('owner', 'industry', 'dealer', 'recycler', 'consumer', 'admin', 'user')),
    business_name text,
    business_id text,
    location text,
    avatar_url text,
    is_verified boolean default true,
    status text default 'active' check (status in ('active', 'pending', 'suspended')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 2. WASTE SUBMISSIONS
-- ============================================================================
create table if not exists waste_submissions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade,
    waste_name text not null,
    waste_category text not null check (waste_category in ('Textile', 'Plastic', 'Metal', 'Rubber', 'Cardboard', 'Chemical', 'Other')),
    waste_type text,
    quantity numeric not null check (quantity > 0),
    quantity_unit text not null default 'kg' check (quantity_unit in ('kg', 'tonnes', 'litres', 'units')),
    location text not null,
    generation_frequency text default 'Weekly',
    availability text default 'Immediate',
    grade text default 'Grade A Industrial Secondary',
    moisture_level text default 'Low (<5%)',
    contamination_level text default 'Minimal (<1%)',
    is_separated text default 'Separated',
    condition text default 'Clean',
    additional_notes text,
    image_path text,
    status text default 'submitted' check (status in ('submitted', 'analyzed', 'listed', 'recycled', 'disposed', 'reused')),
    is_demo boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 3. WASTE ANALYSIS (Structured AI Assessment Report)
-- ============================================================================
create table if not exists waste_analysis (
    id uuid primary key default gen_random_uuid(),
    waste_id uuid not null unique references waste_submissions(id) on delete cascade,
    waste_type text,
    material text,
    condition text,
    quality text,
    quantity numeric,
    quantity_unit text,
    contamination text,
    recoverability text check (recoverability in ('High', 'Medium', 'Low')),
    ai_confidence numeric default 90,
    disclaimer text,
    composition_analysis jsonb default '{}'::jsonb,
    quantity_analysis jsonb default '{}'::jsonb,
    generation_pattern jsonb default '{}'::jsonb,
    pathways jsonb default '{}'::jsonb,
    ai_recommendation jsonb default '{}'::jsonb,
    market_demand_analysis jsonb default '{}'::jsonb,
    possible_applications jsonb default '[]'::jsonb,
    source_attribution jsonb default '{}'::jsonb,
    knowledge_citations jsonb default '[]'::jsonb,
    raw_ai_response jsonb,
    analyzed_at timestamptz default now(),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 4. ELIGIBILITY RESULTS (Independent 4-Pathway Decision Engine)
-- ============================================================================
create table if not exists eligibility_results (
    id uuid primary key default gen_random_uuid(),
    waste_id uuid not null unique references waste_submissions(id) on delete cascade,
    dispose_eligible boolean default false,
    sell_eligible boolean default false,
    recycle_eligible boolean default false,
    reuse_eligible boolean default false,
    active_pathways_count integer default 0,
    selected_pathway text check (selected_pathway in ('DISPOSE', 'SELL', 'RECYCLE', 'REUSE', null)),
    extracted_attributes jsonb default '{}'::jsonb,
    pathway_evaluations jsonb default '{}'::jsonb,
    reasoning jsonb default '{}'::jsonb,
    methodology text default 'Rule-Based Conditional Decision Logic',
    evaluated_at timestamptz default now(),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 5. DEALERS / BUYERS (SELL Pathway)
-- ============================================================================
create table if not exists dealers (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references profiles(id) on delete cascade,
    business_name text not null,
    description text,
    accepted_materials jsonb default '[]'::jsonb,
    accepted_categories jsonb default '[]'::jsonb,
    purchase_price_range text,
    min_quantity_kg numeric default 0,
    location text,
    contact_phone text,
    contact_email text,
    rating numeric(3,2) default 5.0,
    active boolean default true,
    is_demo boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 6. RECYCLERS (RECYCLE Pathway)
-- ============================================================================
create table if not exists recyclers (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references profiles(id) on delete cascade,
    business_name text not null,
    description text,
    accepted_materials jsonb default '[]'::jsonb,
    accepted_categories jsonb default '[]'::jsonb,
    processing_capabilities jsonb default '[]'::jsonb,
    min_batch_kg numeric default 0,
    location text,
    contact_phone text,
    contact_email text,
    rating numeric(3,2) default 5.0,
    certifications jsonb default '[]'::jsonb,
    active boolean default true,
    is_demo boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 7. REUSE SUGGESTIONS (REUSE Pathway - Independent)
-- ============================================================================
create table if not exists reuse_suggestions (
    id uuid primary key default gen_random_uuid(),
    waste_id uuid not null references waste_submissions(id) on delete cascade,
    title text not null,
    description text,
    instructions jsonb default '[]'::jsonb,
    target_industry text,
    estimated_savings text,
    generated_by text default 'ai',
    created_at timestamptz default now()
);

-- ============================================================================
-- 8. RECYCLING REQUESTS (Waste -> Recycler)
-- ============================================================================
create table if not exists recycling_requests (
    id uuid primary key default gen_random_uuid(),
    waste_id uuid references waste_submissions(id) on delete cascade,
    recycler_id uuid references recyclers(id) on delete restrict,
    waste_owner_id uuid references profiles(id) on delete set null,
    waste_name text not null,
    material_category text not null,
    quantity numeric not null,
    unit text not null default 'kg',
    waste_owner_name text,
    waste_owner_location text,
    recycler_name text,
    status text not null default 'submitted' check (status in ('submitted', 'accepted', 'collected', 'processing', 'processed', 'converted_to_product', 'rejected', 'SUBMITTED', 'ACCEPTED', 'COLLECTED', 'PROCESSING', 'PROCESSED', 'CONVERTED_TO_PRODUCT', 'REJECTED')),
    notes text,
    stage_history jsonb default '[]'::jsonb,
    processing_details jsonb,
    converted_product_id uuid,
    accepted_at timestamptz,
    collected_at timestamptz,
    processing_started_at timestamptz,
    processed_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 9. PROCESSING RECORDS (Recycler -> Processing -> Recycled Material)
-- ============================================================================
create table if not exists processing_records (
    id uuid primary key default gen_random_uuid(),
    recycling_request_id uuid not null references recycling_requests(id) on delete cascade,
    recycler_id uuid references recyclers(id) on delete set null,
    input_material text not null,
    input_quantity numeric not null,
    processing_description text,
    output_material text,
    output_quantity numeric,
    processing_status text default 'completed',
    yield_percentage numeric(5,2),
    started_at timestamptz,
    completed_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 10. PRODUCTS (Recycled Product -> Circular Marketplace)
-- ============================================================================
create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    recycler_id uuid references recyclers(id) on delete set null,
    processing_record_id uuid references processing_records(id) on delete set null,
    recycling_request_id uuid references recycling_requests(id) on delete set null,
    name text not null,
    description text,
    category text not null check (category in ('Fashion & Apparel', 'Home & Living', 'Industrial Feedstock', 'Packaging', 'Building & Construction', 'Consumer Goods')),
    material text not null,
    waste_origin_name text,
    recycler_name text,
    price numeric(12,2) not null default 0.00 check (price >= 0),
    currency text not null default 'INR',
    quantity integer not null default 0 check (quantity >= 0),
    unit text default 'units',
    image_path text,
    images jsonb default '[]'::jsonb,
    specifications jsonb default '{}'::jsonb,
    environmental_savings jsonb default '{"co2KgSaved": 0, "waterLitersSaved": 0, "virginMaterialAvoidedKg": 0}'::jsonb,
    featured boolean default false,
    status text default 'published' check (status in ('draft', 'published', 'archived', 'out_of_stock')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 11. CART ITEMS (Consumer Marketplace Cart)
-- ============================================================================
create table if not exists cart_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade,
    product_id uuid not null references products(id) on delete cascade,
    quantity integer not null default 1 check (quantity > 0),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(user_id, product_id)
);

-- ============================================================================
-- 12. ORDERS (Consumer Orders)
-- ============================================================================
create table if not exists orders (
    id uuid primary key default gen_random_uuid(),
    consumer_id uuid not null references profiles(id) on delete restrict,
    consumer_name text,
    consumer_email text,
    status text not null default 'placed' check (status in ('placed', 'confirmed', 'shipped', 'delivered', 'cancelled', 'ORDER_PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    total_amount numeric(12,2) not null default 0.00 check (total_amount >= 0),
    shipping_address jsonb not null default '{}'::jsonb,
    total_eco_impact jsonb default '{"co2SavedKg": 0, "plasticAvoidedKg": 0}'::jsonb,
    tracking_number text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 13. ORDER ITEMS
-- ============================================================================
create table if not exists order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references orders(id) on delete cascade,
    product_id uuid references products(id) on delete set null,
    product_name text not null,
    quantity integer not null check (quantity > 0),
    unit_price numeric(12,2) not null check (unit_price >= 0),
    source_material text,
    recycler_name text,
    subtotal numeric(12,2) not null check (subtotal >= 0),
    created_at timestamptz default now()
);

-- ============================================================================
-- 14. STATUS HISTORY (Lifecycle Traceability)
-- ============================================================================
create table if not exists status_history (
    id uuid primary key default gen_random_uuid(),
    entity_type text not null check (entity_type in ('waste_submission', 'recycling_request', 'processing_record', 'product', 'order', 'transaction')),
    entity_id uuid not null,
    old_status text,
    new_status text not null,
    changed_by uuid references profiles(id) on delete set null,
    notes text,
    created_at timestamptz default now()
);

-- ============================================================================
-- 15. B2B WASTE LISTINGS (SELL Pathway Marketplace)
-- ============================================================================
create table if not exists waste_listings (
    id uuid primary key default gen_random_uuid(),
    listing_id text unique,
    assessment_id text,
    report_id text,
    seller_user_id uuid references profiles(id) on delete cascade,
    seller_business_name text not null,
    waste_name text not null,
    material_category text not null,
    waste_type text,
    quantity numeric not null,
    available_quantity numeric not null,
    min_purchase_quantity numeric default 100,
    unit text not null default 'kg',
    quality text,
    grade text,
    location text not null,
    availability text default 'Immediate',
    description text,
    images jsonb default '[]'::jsonb,
    ai_match_potential text,
    ai_report_summary text,
    recommended_pathway text,
    status text default 'LISTED' check (status in ('LISTED', 'RESERVED', 'SOLD', 'COMPLETED', 'CANCELLED')),
    is_demo boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 16. MATERIAL REQUIREMENTS (Dealer Buyer Procurement Requests)
-- ============================================================================
create table if not exists material_requirements (
    id uuid primary key default gen_random_uuid(),
    requirement_id text unique,
    dealer_user_id uuid references profiles(id) on delete cascade,
    dealer_business_name text not null,
    title text not null,
    material_category text not null,
    specific_material text,
    min_quantity numeric not null,
    max_quantity numeric not null,
    unit text not null default 'kg',
    required_quality text,
    preferred_location text,
    frequency text default 'Monthly',
    target_price_range text,
    additional_notes text,
    status text default 'ACTIVE' check (status in ('ACTIVE', 'PAUSED', 'FULFILLED', 'EXPIRED')),
    is_demo boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 17. PURCHASE REQUESTS & TRANSACTIONS (B2B Trade Execution)
-- ============================================================================
create table if not exists purchase_requests (
    id uuid primary key default gen_random_uuid(),
    request_id text unique,
    listing_id text not null,
    waste_name text not null,
    seller_user_id text not null,
    seller_business_name text not null,
    buyer_user_id text not null,
    buyer_business_name text not null,
    requested_quantity numeric not null,
    unit text not null default 'kg',
    proposed_pickup_date text,
    message text,
    status text default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED')),
    rejection_reason text,
    transaction_id text,
    is_demo boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists transactions (
    id uuid primary key default gen_random_uuid(),
    transaction_id text unique,
    purchase_request_id text,
    listing_id text,
    waste_name text not null,
    buyer_user_id text not null,
    buyer_business_name text not null,
    seller_user_id text not null,
    seller_business_name text not null,
    quantity numeric not null,
    unit text not null,
    location text not null,
    status text default 'TRANSACTION_CONFIRMED' check (status in ('TRANSACTION_CONFIRMED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED')),
    pickup_date text,
    delivery_date text,
    notes text,
    timeline jsonb default '[]'::jsonb,
    is_demo boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- ============================================================================
-- 18. NOTIFICATIONS & AUDIT LOGS
-- ============================================================================
create table if not exists notifications (
    id uuid primary key default gen_random_uuid(),
    recipient_user_id uuid not null references profiles(id) on delete cascade,
    title text not null,
    message text not null,
    type text not null,
    reference_id text,
    reference_type text,
    is_read boolean default false,
    created_at timestamptz default now()
);

create table if not exists audit_logs (
    id uuid primary key default gen_random_uuid(),
    actor_user_id text not null,
    actor_email text,
    actor_role text not null,
    action text not null,
    resource_type text not null,
    resource_id text not null,
    metadata jsonb default '{}'::jsonb,
    timestamp timestamptz default now()
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================
create index if not exists idx_waste_submissions_user on waste_submissions(user_id);
create index if not exists idx_waste_submissions_category on waste_submissions(waste_category);
create index if not exists idx_waste_analysis_waste on waste_analysis(waste_id);
create index if not exists idx_eligibility_waste on eligibility_results(waste_id);
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_recycler on products(recycler_id);
create index if not exists idx_cart_items_user on cart_items(user_id);
create index if not exists idx_orders_consumer on orders(consumer_id);
create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_recycling_requests_owner on recycling_requests(waste_owner_id);
create index if not exists idx_recycling_requests_recycler on recycling_requests(recycler_id);
create index if not exists idx_waste_listings_status on waste_listings(status);
create index if not exists idx_notifications_recipient on notifications(recipient_user_id);
