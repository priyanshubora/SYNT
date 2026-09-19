-- ============================================================
-- FORMUS - INITIAL DATABASE SCHEMA
-- ============================================================


-- ============================================================
-- 1. CATEGORIES
-- ============================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),

  name text not null unique,

  slug text not null unique,

  description text,

  created_at timestamptz not null default now()
);


-- ============================================================
-- 2. TEAMS
-- ============================================================

create table public.teams (
  id uuid primary key default gen_random_uuid(),

  category_id uuid not null
    references public.categories(id)
    on delete cascade,

  name text not null,

  slug text not null unique,

  logo_url text,

  created_at timestamptz not null default now(),

  constraint teams_category_name_unique
    unique (category_id, name)
);


-- ============================================================
-- 3. PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key
    references auth.users(id)
    on delete cascade,

  username text not null unique,

  team_id uuid
    references public.teams(id)
    on delete set null,

  avatar_url text,

  created_at timestamptz not null default now(),

  constraint username_length
    check (char_length(username) between 3 and 30)
);


-- ============================================================
-- 4. THREADS
-- ============================================================

create table public.threads (
  id uuid primary key default gen_random_uuid(),

  category_id uuid not null
    references public.categories(id)
    on delete cascade,

  author_id uuid not null
    references public.profiles(id)
    on delete cascade,

  title text not null,

  content text not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint thread_title_length
    check (char_length(title) between 3 and 200),

  constraint thread_content_length
    check (char_length(content) >= 1)
);


-- ============================================================
-- 5. COMMENTS
-- ============================================================

create table public.comments (
  id uuid primary key default gen_random_uuid(),

  thread_id uuid not null
    references public.threads(id)
    on delete cascade,

  author_id uuid not null
    references public.profiles(id)
    on delete cascade,

  parent_id uuid
    references public.comments(id)
    on delete cascade,

  content text not null,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint comment_content_length
    check (char_length(content) >= 1)
);


-- ============================================================
-- 6. THREAD VOTES
-- ============================================================

create table public.thread_votes (
  id uuid primary key default gen_random_uuid(),

  thread_id uuid not null
    references public.threads(id)
    on delete cascade,

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  value smallint not null,

  created_at timestamptz not null default now(),

  constraint vote_value_check
    check (value in (-1, 1)),

  constraint one_vote_per_user
    unique (thread_id, user_id)
);


-- ============================================================
-- 7. SEED CATEGORIES
-- ============================================================

insert into public.categories (
  name,
  slug,
  description
)
values
(
  'Esports',
  'esports',
  'General esports discussions, tournaments, teams and players.'
),
(
  'BGMI',
  'bgmi',
  'Battlegrounds Mobile India discussions.'
),
(
  'Valorant',
  'valorant',
  'Valorant esports, teams, tournaments and competitive play.'
),
(
  'Chess',
  'chess',
  'Chess discussions, tournaments, players and strategy.'
),
(
  'Free Fire',
  'free-fire',
  'Free Fire esports and community discussions.'
),
(
  'Off-topic',
  'off-topic',
  'Anything outside the main esports categories.'
);


-- ============================================================
-- 8. SEED STARTER TEAMS
-- ============================================================

insert into public.teams (
  category_id,
  name,
  slug,
  logo_url
)
select
  c.id,
  t.name,
  t.slug,
  t.logo_url
from public.categories c
join (
  values

  -- Valorant
  (
    'valorant',
    'Sentinels',
    'sentinels',
    null
  ),
  (
    'valorant',
    'FNATIC',
    'fnatic',
    null
  ),
  (
    'valorant',
    'Paper Rex',
    'paper-rex',
    null
  ),
  (
    'valorant',
    'Gen.G',
    'gen-g',
    null
  ),

  -- BGMI
  (
    'bgmi',
    'Team SouL',
    'team-soul',
    null
  ),
  (
    'bgmi',
    'GodLike Esports',
    'godlike-esports',
    null
  ),
  (
    'bgmi',
    'Revenant XSpark',
    'revenant-xspark',
    null
  ),

  -- Free Fire
  (
    'free-fire',
    'Fluxo',
    'fluxo',
    null
  ),
  (
    'free-fire',
    'LOUD',
    'loud',
    null
  ),

  -- Chess
  (
    'chess',
    'India',
    'india',
    null
  ),
  (
    'chess',
    'USA',
    'usa',
    null
  ),
  (
    'chess',
    'FIDE',
    'fide',
    null
  ),

  -- General Esports
  (
    'esports',
    'Global Esports',
    'global-esports',
    null
  )

) as t(category_slug, name, slug, logo_url)
on c.slug = t.category_slug;


-- ============================================================
-- 9. INDEXES
-- ============================================================

create index teams_category_id_idx
  on public.teams(category_id);

create index profiles_team_id_idx
  on public.profiles(team_id);

create index threads_category_id_idx
  on public.threads(category_id);

create index threads_author_id_idx
  on public.threads(author_id);

create index threads_created_at_idx
  on public.threads(created_at desc);

create index threads_category_created_at_idx
  on public.threads(category_id, created_at desc);

create index comments_thread_id_idx
  on public.comments(thread_id);

create index comments_author_id_idx
  on public.comments(author_id);

create index comments_created_at_idx
  on public.comments(created_at);

create index thread_votes_thread_id_idx
  on public.thread_votes(thread_id);

create index thread_votes_user_id_idx
  on public.thread_votes(user_id);


-- ============================================================
-- 10. ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.categories enable row level security;

alter table public.teams enable row level security;

alter table public.profiles enable row level security;

alter table public.threads enable row level security;

alter table public.comments enable row level security;

alter table public.thread_votes enable row level security;


-- ============================================================
-- 11. CATEGORY POLICIES
-- ============================================================

create policy "Categories are publicly readable"
on public.categories
for select
to anon, authenticated
using (true);


-- ============================================================
-- 12. TEAM POLICIES
-- ============================================================

create policy "Teams are publicly readable"
on public.teams
for select
to anon, authenticated
using (true);


-- ============================================================
-- 13. PROFILE POLICIES
-- ============================================================

create policy "Profiles are publicly readable"
on public.profiles
for select
to anon, authenticated
using (true);


create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) = id
);


create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = id
)
with check (
  (select auth.uid()) = id
);


create policy "Users can delete their own profile"
on public.profiles
for delete
to authenticated
using (
  (select auth.uid()) = id
);


-- ============================================================
-- 14. THREAD POLICIES
-- ============================================================

create policy "Threads are publicly readable"
on public.threads
for select
to anon, authenticated
using (true);


create policy "Authenticated users can create threads"
on public.threads
for insert
to authenticated
with check (
  (select auth.uid()) = author_id
);


create policy "Users can update their own threads"
on public.threads
for update
to authenticated
using (
  (select auth.uid()) = author_id
)
with check (
  (select auth.uid()) = author_id
);


create policy "Users can delete their own threads"
on public.threads
for delete
to authenticated
using (
  (select auth.uid()) = author_id
);


-- ============================================================
-- 15. COMMENT POLICIES
-- ============================================================

create policy "Comments are publicly readable"
on public.comments
for select
to anon, authenticated
using (true);


create policy "Authenticated users can create comments"
on public.comments
for insert
to authenticated
with check (
  (select auth.uid()) = author_id
);


create policy "Users can update their own comments"
on public.comments
for update
to authenticated
using (
  (select auth.uid()) = author_id
)
with check (
  (select auth.uid()) = author_id
);


create policy "Users can delete their own comments"
on public.comments
for delete
to authenticated
using (
  (select auth.uid()) = author_id
);


-- ============================================================
-- 16. VOTE POLICIES
-- ============================================================

create policy "Votes are publicly readable"
on public.thread_votes
for select
to anon, authenticated
using (true);


create policy "Authenticated users can create votes"
on public.thread_votes
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
);


create policy "Users can update their own votes"
on public.thread_votes
for update
to authenticated
using (
  (select auth.uid()) = user_id
)
with check (
  (select auth.uid()) = user_id
);


create policy "Users can delete their own votes"
on public.thread_votes
for delete
to authenticated
using (
  (select auth.uid()) = user_id
);


-- ============================================================
-- 17. DATABASE GRANTS
-- ============================================================

revoke all on table
  public.categories,
  public.teams,
  public.profiles,
  public.threads,
  public.comments,
  public.thread_votes
from anon, authenticated;


grant select on
  public.categories,
  public.teams,
  public.profiles,
  public.threads,
  public.comments,
  public.thread_votes
to anon, authenticated;


grant insert, update, delete on
  public.profiles,
  public.threads,
  public.comments,
  public.thread_votes
to authenticated;