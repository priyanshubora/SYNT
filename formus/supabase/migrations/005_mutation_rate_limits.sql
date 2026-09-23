create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.mutation_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  primary key (user_id, bucket)
);

alter table private.mutation_rate_limits enable row level security;
revoke all on table private.mutation_rate_limits from public, anon, authenticated;

create or replace function public.consume_mutation_rate_limit(p_bucket text)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := clock_timestamp();
  v_limit integer;
  v_window_seconds integer := 3600;
  v_window_started_at timestamptz;
  v_request_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  case p_bucket
    when 'reports.create' then v_limit := 7;
    when 'moderation.report_status' then v_limit := 60;
    when 'moderation.action' then v_limit := 35;
    when 'admin.moderators' then v_limit := 20;
    when 'account.delete' then
      v_limit := 10;
      v_window_seconds := 86400;
    when 'auth.signout' then v_limit := 25;
    else raise exception 'Unsupported rate limit bucket';
  end case;

  insert into private.mutation_rate_limits as current_limit (
    user_id,
    bucket,
    window_started_at,
    request_count
  )
  values (v_user_id, p_bucket, v_now, 1)
  on conflict (user_id, bucket) do update
  set
    window_started_at = case
      when current_limit.window_started_at + make_interval(secs => v_window_seconds) <= excluded.window_started_at
        then excluded.window_started_at
      else current_limit.window_started_at
    end,
    request_count = case
      when current_limit.window_started_at + make_interval(secs => v_window_seconds) <= excluded.window_started_at
        then 1
      else current_limit.request_count + 1
    end
  returning current_limit.window_started_at, current_limit.request_count
  into v_window_started_at, v_request_count;

  return query
  select
    v_request_count <= v_limit,
    greatest(
      1,
      ceil(extract(epoch from (v_window_started_at + make_interval(secs => v_window_seconds) - v_now)))::integer
    );
end;
$$;

revoke all on function public.consume_mutation_rate_limit(text) from public, anon;
grant execute on function public.consume_mutation_rate_limit(text) to authenticated;
