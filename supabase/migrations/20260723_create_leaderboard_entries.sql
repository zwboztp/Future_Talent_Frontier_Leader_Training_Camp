create table public.leaderboard_entries (
  id bigint generated always as identity primary key,
  player_name text not null check (char_length(player_name) between 1 and 20),
  score integer not null check (score between 0 and 9999999),
  created_at timestamptz not null default now()
);
create index leaderboard_entries_score_idx on public.leaderboard_entries (score desc, created_at asc);
alter table public.leaderboard_entries enable row level security;
create policy "Public can read leaderboard" on public.leaderboard_entries for select to anon, authenticated using (true);
grant select on public.leaderboard_entries to anon, authenticated;
grant insert on public.leaderboard_entries to service_role;
