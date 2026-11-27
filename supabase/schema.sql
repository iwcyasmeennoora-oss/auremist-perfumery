-- AUREMIST PERFUMERY - Supabase Orders Table & Checkout Schema
-- Paste and run this once in Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,

  -- Core requested order columns
  name text not null,
  email text not null,
  mobile text not null,
  address text not null,
  product text not null,
  total_amount integer not null check (
    total_amount >= 0
    and total_amount = item_subtotal_pkr - discount_amount_pkr + delivery_fee_pkr
  ),
  date timestamptz not null default now(),

  -- Detailed delivery address breakdown
  country text not null,
  province text not null,
  city text not null,
  area text not null,
  street_address text not null,
  postal_code text not null,
  delivery_instructions text,

  -- Delivery zone, gift wrap & pricing breakdown (PKR)
  delivery_zone_id text not null,
  delivery_zone_name text not null,
  gift_wrap boolean not null default false,
  coupon_code text,
  coupon_label text,
  item_subtotal_pkr integer not null check (item_subtotal_pkr > 0),
  discount_amount_pkr integer not null default 0 check (discount_amount_pkr >= 0),
  delivery_fee_pkr integer not null check (delivery_fee_pkr >= 0),

  -- Payment & fulfillment state
  payment_method text not null check (payment_method in ('cod', 'easypaisa', 'jazzcash')),
  payment_status text not null default 'due_on_delivery' check (
    payment_status in (
      'due_on_delivery',
      'awaiting_verification',
      'verified',
      'rejected',
      'reupload_requested'
    )
  ),
  order_status text not null default 'order_received',
  transaction_ref_id text,

  -- Private payment screenshot metadata (stored in private bucket `payment-proofs`)
  has_payment_proof boolean not null default false,
  payment_proof_path text,
  payment_proof_file_name text,
  payment_proof_file_size integer,
  payment_proof_mime_type text,

  -- Complete ordered items list (JSON)
  items jsonb not null default '[]'::jsonb
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  order_number text not null,
  product_id text not null,
  product_slug text not null,
  product_name text not null,
  bottle_size text not null,
  sku text not null,
  quantity integer not null check (quantity > 0),
  unit_price_pkr integer not null check (unit_price_pkr >= 0),
  line_total_pkr integer not null check (line_total_pkr = unit_price_pkr * quantity),
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_date on public.orders (date desc);
create index if not exists idx_orders_order_number on public.orders (order_number);
create index if not exists idx_orders_email on public.orders (email);
create index if not exists idx_order_items_order_id on public.order_items (order_id);

-- Row Level Security: allow guest checkout inserts, block public reads/updates/deletes
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Allow guest checkout order insert" on public.orders;
create policy "Allow guest checkout order insert"
  on public.orders
  for insert
  to anon, authenticated
  with check (
    payment_method in ('cod', 'easypaisa', 'jazzcash')
    and (
      (
        payment_method = 'cod'
        and payment_status = 'due_on_delivery'
        and order_status = 'order_received'
      )
      or (
        payment_method in ('easypaisa', 'jazzcash')
        and payment_status = 'awaiting_verification'
        and order_status = 'pending_verification'
      )
    )
    and item_subtotal_pkr > 0
    and delivery_fee_pkr >= 0
    and total_amount = item_subtotal_pkr - discount_amount_pkr + delivery_fee_pkr
  );

drop policy if exists "Allow guest checkout order items insert" on public.order_items;
create policy "Allow guest checkout order items insert"
  on public.order_items
  for insert
  to anon, authenticated
  with check (
    quantity > 0
    and unit_price_pkr >= 0
    and line_total_pkr = unit_price_pkr * quantity
  );

-- Private storage bucket for Easypaisa / JazzCash transfer screenshots
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,
  array['image/jpeg', 'image/png']
)
on conflict (id) do nothing;

drop policy if exists "Allow guest payment proof upload" on storage.objects;
create policy "Allow guest payment proof upload"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'payment-proofs');
