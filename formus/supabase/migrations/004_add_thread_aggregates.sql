ALTER TABLE public.threads
ADD COLUMN comment_count bigint DEFAULT 0,
ADD COLUMN score bigint DEFAULT 0,
ADD COLUMN vote_count bigint DEFAULT 0;

-- Function to update counts
CREATE OR REPLACE FUNCTION public.update_thread_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    IF (TG_TABLE_NAME = 'comments') THEN
      UPDATE public.threads SET comment_count = comment_count + 1 WHERE id = NEW.thread_id;
    ELSIF (TG_TABLE_NAME = 'thread_votes') THEN
      UPDATE public.threads SET score = score + NEW.value, vote_count = vote_count + 1 WHERE id = NEW.thread_id;
    END IF;
  ELSIF (TG_OP = 'DELETE') THEN
    IF (TG_TABLE_NAME = 'comments') THEN
      UPDATE public.threads SET comment_count = comment_count - 1 WHERE id = OLD.thread_id;
    ELSIF (TG_TABLE_NAME = 'thread_votes') THEN
      UPDATE public.threads SET score = score - OLD.value, vote_count = vote_count - 1 WHERE id = OLD.thread_id;
    END IF;
  ELSIF (TG_OP = 'UPDATE') THEN
     IF (TG_TABLE_NAME = 'thread_votes') THEN
      UPDATE public.threads SET score = score - OLD.value + NEW.value WHERE id = NEW.thread_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_comment_count
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.update_thread_stats();

CREATE TRIGGER update_thread_score
AFTER INSERT OR DELETE OR UPDATE ON public.thread_votes
FOR EACH ROW EXECUTE FUNCTION public.update_thread_stats();

-- Backfill data
UPDATE public.threads t
SET comment_count = (SELECT count(*) FROM public.comments c WHERE c.thread_id = t.id),
    score = (SELECT coalesce(sum(v.value), 0) FROM public.thread_votes v WHERE v.thread_id = t.id),
    vote_count = (SELECT count(*) FROM public.thread_votes v WHERE v.thread_id = t.id);
