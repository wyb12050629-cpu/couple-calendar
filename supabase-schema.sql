-- 일정 테이블
create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date date not null,
  end_date date,
  start_time time,
  end_time time,
  all_day boolean default false,
  memo text,
  owner text not null check (owner in ('yubin', 'munsung', 'shared')),
  image_url text,
  created_at timestamp default now()
);

-- 기존 테이블에 컬럼 추가 (마이그레이션용)
-- alter table events add column end_date date;
-- alter table events add column all_day boolean default false;

-- 칭찬/감사 보관함 테이블
create table gratitude (
  id uuid default gen_random_uuid() primary key,
  from_user text not null check (from_user in ('yubin', 'munsung')),
  to_user text not null check (to_user in ('yubin', 'munsung')),
  message text not null,
  created_at timestamp default now()
);

-- 푸시 알림 구독 테이블
create table push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_name text not null check (user_name in ('yubin', 'munsung')),
  subscription jsonb not null,
  created_at timestamp default now()
);

-- RLS 정책 (public access - 커플 전용 앱이므로)
alter table events enable row level security;
alter table gratitude enable row level security;
alter table push_subscriptions enable row level security;

create policy "Allow all on events" on events for all using (true) with check (true);
create policy "Allow all on gratitude" on gratitude for all using (true) with check (true);
create policy "Allow all on push_subscriptions" on push_subscriptions for all using (true) with check (true);

-- Storage 버킷
insert into storage.buckets (id, name, public) values ('event-images', 'event-images', true);
create policy "Allow public access on event-images" on storage.objects for all using (bucket_id = 'event-images') with check (bucket_id = 'event-images');
