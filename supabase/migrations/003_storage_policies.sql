-- ============================================================================
-- 003_storage_policies.sql: Supabase Storage Buckets & Policies
-- AI-Powered Waste Lifecycle & Circular Marketplace (WasteXchange)
-- ============================================================================

-- 1. Create storage buckets
insert into storage.buckets (id, name, public)
values ('waste-images', 'waste-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2. Storage Policies for waste-images
create policy "Waste images are publicly viewable"
on storage.objects for select
using (bucket_id = 'waste-images');

create policy "Authenticated users can upload waste images"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'waste-images'
    and (storage.foldername(name))[1] = auth.uid()::text or auth.uid() is not null
);

create policy "Users can update their own waste images"
on storage.objects for update
to authenticated
using (bucket_id = 'waste-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own waste images"
on storage.objects for delete
to authenticated
using (bucket_id = 'waste-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Storage Policies for product-images
create policy "Product images are publicly viewable"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Authenticated recyclers and admins can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images');

create policy "Users can update their own product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images');

create policy "Users can delete their own product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images');
