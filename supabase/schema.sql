create table events (
  id uuid primary key default gen_random_uuid(),
  room_id text,
  payload jsonb,
  created_at timestamp default now()
);
