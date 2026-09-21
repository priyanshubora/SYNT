-- ============================================================
-- FORMUS PERFORMANCE INDEXES
-- ============================================================

create index if not exists threads_category_created_at_id_idx
  on public.threads(category_id, created_at desc, id desc);

create index if not exists threads_created_at_id_idx
  on public.threads(created_at desc, id desc);

create index if not exists comments_thread_created_at_parent_idx
  on public.comments(thread_id, created_at asc, parent_id);

create index if not exists comments_thread_parent_id_idx
  on public.comments(thread_id, parent_id);

create index if not exists thread_votes_thread_value_idx
  on public.thread_votes(thread_id, value desc);

create index if not exists thread_votes_user_thread_idx
  on public.thread_votes(user_id, thread_id);

create index if not exists thread_votes_comment_value_idx
  on public.comment_votes(comment_id, value desc);

create index if not exists thread_votes_comment_user_idx
  on public.comment_votes(comment_id, user_id);
