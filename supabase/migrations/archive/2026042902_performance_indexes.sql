-- Dashboard Volume Chart Performance Optimizations
-- Adds composite indexes for common user + date queries

CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.tf_workouts (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_events_user_date ON public.tf_events (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_date ON public.tf_notes (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_user_date ON public.tf_daily_metrics (user_id, date DESC);
