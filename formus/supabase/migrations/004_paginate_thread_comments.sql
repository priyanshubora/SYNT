create index if not exists comments_thread_parent_created_active_idx
  on public.comments(thread_id, parent_id, created_at, id)
  where deleted_at is null;

create index if not exists threads_category_author_active_idx
  on public.threads(category_id, author_id)
  where deleted_at is null;

-- Include voter IDs in delete events so the active voter can skip a redundant refresh.
alter table public.thread_votes replica identity full;
alter table public.comment_votes replica identity full;

create or replace function public.get_thread_comment_page(
  p_thread_id uuid,
  p_page_size integer default 30,
  p_page integer default 1,
  p_comment_id uuid default null
)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with recursive
  settings as (
    select greatest(1, least(coalesce(p_page_size, 30), 100)) as page_size
  ),
  active_comments as (
    select
      c.id,
      c.thread_id,
      c.author_id,
      c.parent_id,
      c.content,
      c.created_at,
      c.updated_at
    from public.comments c
    where c.thread_id = p_thread_id
      and c.deleted_at is null
  ),
  roots as (
    select
      c.id,
      row_number() over (order by c.created_at, c.id) as root_rank
    from active_comments c
    where c.parent_id is null
      or not exists (
        select 1
        from active_comments parent
        where parent.id = c.parent_id
      )
  ),
  root_count as (
    select count(*)::bigint as total
    from roots
  ),
  target_ancestors(id, parent_id, path) as (
    select c.id, c.parent_id, array[c.id]::uuid[]
    from active_comments c
    where c.id = p_comment_id

    union all

    select parent.id, parent.parent_id, child.path || parent.id
    from active_comments parent
    join target_ancestors child on child.parent_id = parent.id
    where not parent.id = any(child.path)
  ),
  target_root as (
    select roots.root_rank
    from roots
    join target_ancestors on target_ancestors.id = roots.id
    order by roots.root_rank
    limit 1
  ),
  page_request as (
    select greatest(
      1,
      least(
        coalesce(
          (select ceil(target_root.root_rank / settings.page_size::numeric)::integer from target_root),
          greatest(1, coalesce(p_page, 1))
        ),
        greatest(1, ceil(root_count.total / settings.page_size::numeric)::integer)
      )
    ) as page
    from settings
    cross join root_count
  ),
  page_roots(id, path) as (
    select roots.id, array[roots.id]::uuid[]
    from roots
    cross join settings
    cross join page_request
    where roots.root_rank > (page_request.page - 1) * settings.page_size
      and roots.root_rank <= page_request.page * settings.page_size
  ),
  comment_tree(id, path) as (
    select id, path
    from page_roots

    union all

    select child.id, parent.path || child.id
    from active_comments child
    join comment_tree parent on child.parent_id = parent.id
    where not child.id = any(parent.path)
  ),
  numbered_comments as (
    select
      c.*,
      row_number() over (order by c.created_at, c.id)::integer as comment_number
    from active_comments c
  ),
  selected_comments as (
    select c.*
    from numbered_comments c
    join comment_tree tree on tree.id = c.id
  )
  select jsonb_build_object(
    'comments', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', c.id,
            'thread_id', c.thread_id,
            'author_id', c.author_id,
            'parent_id', c.parent_id,
            'content', c.content,
            'created_at', c.created_at,
            'updated_at', c.updated_at,
            'comment_number', c.comment_number
          )
          order by c.created_at, c.id
        )
        from selected_comments c
      ),
      '[]'::jsonb
    ),
    'totalCommentCount', (select count(*) from active_comments),
    'currentPage', page_request.page,
    'totalPages', greatest(
      1,
      ceil(root_count.total / settings.page_size::numeric)::integer
    )
  )
  from page_request
  cross join root_count
  cross join settings;
$$;

revoke all on function public.get_thread_comment_page(uuid, integer, integer, uuid)
  from public;

grant execute on function public.get_thread_comment_page(uuid, integer, integer, uuid)
  to anon, authenticated;

create or replace function public.get_category_stats(p_category_id uuid)
returns table (discussion_count bigint, member_count bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select
    count(*)::bigint,
    count(distinct t.author_id)::bigint
  from public.threads t
  where t.category_id = p_category_id
    and t.deleted_at is null;
$$;

revoke all on function public.get_category_stats(uuid) from public;

grant execute on function public.get_category_stats(uuid)
  to anon, authenticated;

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'comment_votes'
  ) then
    execute 'alter publication supabase_realtime add table public.comment_votes';
  end if;
end;
$$;
