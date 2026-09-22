-- ============================================================
-- FORMUS PHASE 5
-- THREAD STATISTICS VIEW
-- ============================================================

drop view if exists public.thread_stats;


create view public.thread_stats
with (security_invoker = true)
as
select
  t.id,
  t.title,
  t.content,
  t.created_at,
  t.updated_at,
  t.deleted_at,

  t.category_id,
  c.name as category_name,
  c.slug as category_slug,

  t.author_id,
  p.username as author_username,
  p.role as author_role,

  tm.name as team_name,

  t.score,
  t.vote_count,
  t.comment_count

from public.threads t

join public.categories c
  on c.id = t.category_id

join public.profiles p
  on p.id = t.author_id

left join public.teams tm
  on tm.id = p.team_id;


-- ============================================================
-- ALLOW PUBLIC READ ACCESS
-- ============================================================

grant select
on public.thread_stats
to anon, authenticated;
