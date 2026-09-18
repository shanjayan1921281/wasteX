-- ============================================================================
-- 002_rls_policies.sql: Supabase Row Level Security (RLS) Policies
-- AI-Powered Waste Lifecycle & Circular Marketplace (WasteXchange)
-- ============================================================================

-- 1. Enable RLS on all application tables
alter table profiles enable row level security;
alter table waste_submissions enable row level security;
alter table waste_analysis enable row level security;
alter table eligibility_results enable row level security;
alter table dealers enable row level security;
alter table recyclers enable row level security;
alter table reuse_suggestions enable row level security;
alter table recycling_requests enable row level security;
alter table processing_records enable row level security;
alter table products enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table status_history enable row level security;
alter table waste_listings enable row level security;
alter table material_requirements enable row level security;
alter table purchase_requests enable row level security;
alter table transactions enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;

-- ============================================================================
-- Helper Function: Check if user is admin
-- ============================================================================
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================
create policy "Public profiles are viewable by authenticated users"
on profiles for select
to authenticated
using (true);

create policy "Users can insert their own profile"
on profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on profiles for update
to authenticated
using (auth.uid() = id or is_admin())
with check (auth.uid() = id or is_admin());

-- ============================================================================
-- WASTE SUBMISSIONS POLICIES
-- ============================================================================
create policy "Users can view their own waste or listed waste streams"
on waste_submissions for select
to authenticated
using (
    auth.uid() = user_id 
    or status in ('submitted', 'analyzed', 'listed')
    or is_admin()
);

create policy "Users can create their own waste submissions"
on waste_submissions for insert
to authenticated
with check (auth.uid() = user_id or is_admin());

create policy "Users can update their own waste submissions"
on waste_submissions for update
to authenticated
using (auth.uid() = user_id or is_admin())
with check (auth.uid() = user_id or is_admin());

create policy "Users can delete their own draft waste submissions"
on waste_submissions for delete
to authenticated
using (auth.uid() = user_id or is_admin());

-- ============================================================================
-- WASTE ANALYSIS & ELIGIBILITY POLICIES
-- ============================================================================
create policy "Waste analysis viewable by waste owner or authenticated stakeholders"
on waste_analysis for select
to authenticated
using (
    exists (
        select 1 from waste_submissions ws
        where ws.id = waste_analysis.waste_id
        and (ws.user_id = auth.uid() or ws.status in ('submitted', 'analyzed', 'listed'))
    )
    or is_admin()
);

create policy "Waste analysis insertable by waste owner or admin"
on waste_analysis for insert
to authenticated
with check (
    exists (
        select 1 from waste_submissions ws
        where ws.id = waste_analysis.waste_id
        and ws.user_id = auth.uid()
    )
    or is_admin()
);

create policy "Eligibility results viewable by waste owner or stakeholders"
on eligibility_results for select
to authenticated
using (
    exists (
        select 1 from waste_submissions ws
        where ws.id = eligibility_results.waste_id
        and (ws.user_id = auth.uid() or ws.status in ('submitted', 'analyzed', 'listed'))
    )
    or is_admin()
);

create policy "Eligibility results insertable by waste owner or admin"
on eligibility_results for insert
to authenticated
with check (
    exists (
        select 1 from waste_submissions ws
        where ws.id = eligibility_results.waste_id
        and ws.user_id = auth.uid()
    )
    or is_admin()
);

-- ============================================================================
-- DEALERS & RECYCLERS POLICIES
-- ============================================================================
create policy "Dealers are viewable by all authenticated users"
on dealers for select
to authenticated
using (active = true or auth.uid() = user_id or is_admin());

create policy "Dealers can manage their own profile"
on dealers for all
to authenticated
using (auth.uid() = user_id or is_admin())
with check (auth.uid() = user_id or is_admin());

create policy "Recyclers are viewable by all authenticated users"
on recyclers for select
to authenticated
using (active = true or auth.uid() = user_id or is_admin());

create policy "Recyclers can manage their own profile"
on recyclers for all
to authenticated
using (auth.uid() = user_id or is_admin())
with check (auth.uid() = user_id or is_admin());

-- ============================================================================
-- REUSE SUGGESTIONS POLICIES
-- ============================================================================
create policy "Reuse suggestions viewable by waste owner"
on reuse_suggestions for select
to authenticated
using (
    exists (
        select 1 from waste_submissions ws
        where ws.id = reuse_suggestions.waste_id
        and ws.user_id = auth.uid()
    )
    or is_admin()
);

create policy "Reuse suggestions insertable by waste owner or admin"
on reuse_suggestions for insert
to authenticated
with check (
    exists (
        select 1 from waste_submissions ws
        where ws.id = reuse_suggestions.waste_id
        and ws.user_id = auth.uid()
    )
    or is_admin()
);

-- ============================================================================
-- RECYCLING REQUESTS POLICIES
-- ============================================================================
create policy "Recycling requests viewable by owner or recycler"
on recycling_requests for select
to authenticated
using (
    waste_owner_id = auth.uid()
    or exists (select 1 from recyclers r where r.id = recycling_requests.recycler_id and r.user_id = auth.uid())
    or is_admin()
);

create policy "Waste owners can create recycling requests"
on recycling_requests for insert
to authenticated
with check (waste_owner_id = auth.uid() or is_admin());

create policy "Involved parties can update recycling requests"
on recycling_requests for update
to authenticated
using (
    waste_owner_id = auth.uid()
    or exists (select 1 from recyclers r where r.id = recycling_requests.recycler_id and r.user_id = auth.uid())
    or is_admin()
);

-- ============================================================================
-- PROCESSING RECORDS POLICIES
-- ============================================================================
create policy "Processing records viewable by involved recycler, owner, or admin"
on processing_records for select
to authenticated
using (
    exists (select 1 from recyclers r where r.id = processing_records.recycler_id and r.user_id = auth.uid())
    or exists (select 1 from recycling_requests rr where rr.id = processing_records.recycling_request_id and rr.waste_owner_id = auth.uid())
    or is_admin()
);

create policy "Recyclers can insert/update processing records"
on processing_records for all
to authenticated
using (
    exists (select 1 from recyclers r where r.id = processing_records.recycler_id and r.user_id = auth.uid())
    or is_admin()
);

-- ============================================================================
-- PRODUCTS (CIRCULAR MARKETPLACE) POLICIES
-- ============================================================================
create policy "Published products are viewable by everyone"
on products for select
using (status = 'published' or auth.uid() is not null);

create policy "Recyclers can manage their own products"
on products for all
to authenticated
using (
    exists (select 1 from recyclers r where r.id = products.recycler_id and r.user_id = auth.uid())
    or is_admin()
);

-- ============================================================================
-- CART ITEMS POLICIES
-- ============================================================================
create policy "Users can only view their own cart items"
on cart_items for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can only insert into their own cart"
on cart_items for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can only update their own cart items"
on cart_items for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can only delete their own cart items"
on cart_items for delete
to authenticated
using (auth.uid() = user_id);

-- ============================================================================
-- ORDERS & ORDER ITEMS POLICIES
-- ============================================================================
create policy "Consumers can view their own orders"
on orders for select
to authenticated
using (auth.uid() = consumer_id or is_admin());

create policy "Consumers can place orders"
on orders for insert
to authenticated
with check (auth.uid() = consumer_id);

create policy "Admins and consumers can update orders"
on orders for update
to authenticated
using (auth.uid() = consumer_id or is_admin());

create policy "Order items viewable by order owner or admin"
on order_items for select
to authenticated
using (
    exists (select 1 from orders o where o.id = order_items.order_id and o.consumer_id = auth.uid())
    or is_admin()
);

create policy "Order items insertable during order placement"
on order_items for insert
to authenticated
with check (
    exists (select 1 from orders o where o.id = order_items.order_id and o.consumer_id = auth.uid())
    or is_admin()
);

-- ============================================================================
-- STATUS HISTORY, LISTINGS, REQUIREMENTS, TRANSACTIONS, NOTIFICATIONS
-- ============================================================================
create policy "Status history viewable by authenticated users"
on status_history for select
to authenticated
using (true);

create policy "Status history insertable by authenticated users"
on status_history for insert
to authenticated
with check (auth.uid() is not null);

create policy "Waste listings viewable by all authenticated users"
on waste_listings for select
to authenticated
using (true);

create policy "Sellers can manage waste listings"
on waste_listings for all
to authenticated
using (seller_user_id = auth.uid() or is_admin())
with check (seller_user_id = auth.uid() or is_admin());

create policy "Material requirements viewable by all authenticated users"
on material_requirements for select
to authenticated
using (true);

create policy "Dealers can manage material requirements"
on material_requirements for all
to authenticated
using (dealer_user_id = auth.uid() or is_admin())
with check (dealer_user_id = auth.uid() or is_admin());

create policy "Purchase requests viewable by buyer or seller"
on purchase_requests for select
to authenticated
using (buyer_user_id = auth.uid()::text or seller_user_id = auth.uid()::text or is_admin());

create policy "Buyers can insert purchase requests"
on purchase_requests for insert
to authenticated
with check (buyer_user_id = auth.uid()::text or is_admin());

create policy "Parties can update purchase requests"
on purchase_requests for update
to authenticated
using (buyer_user_id = auth.uid()::text or seller_user_id = auth.uid()::text or is_admin());

create policy "Transactions viewable by involved parties"
on transactions for select
to authenticated
using (buyer_user_id = auth.uid()::text or seller_user_id = auth.uid()::text or is_admin());

create policy "Notifications viewable and manageable only by recipient"
on notifications for all
to authenticated
using (recipient_user_id = auth.uid())
with check (recipient_user_id = auth.uid());

create policy "Audit logs viewable by admin"
on audit_logs for select
to authenticated
using (is_admin() or actor_user_id = auth.uid()::text);

create policy "Audit logs insertable by anyone authenticated"
on audit_logs for insert
to authenticated
with check (true);
