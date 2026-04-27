import { supabase } from '@/lib/supabase';

export interface ErrorLog {
  message: string;
  stack?: string;
  component_name?: string;
  severity?: 'error' | 'warning' | 'info';
  context?: Record<string, unknown>;
  url?: string;
}

/**
 * System API for logging errors to the database.
 * Used by ErrorBoundaries and global catch blocks.
 */
export const errorLogsApi = {
  /**
   * Captures an error and sends it to Supabase
   */
  async capture(log: ErrorLog): Promise<void> {
    try {
      // Get current user if available (non-blocking)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const entry = {
        user_id: user?.id || null,
        message: log.message,
        stack: log.stack || null,
        component_name: log.component_name || null,
        severity: log.severity || 'error',
        context: log.context || {},
        url: log.url || window.location.href,
        user_agent: navigator.userAgent,
      };

      // Use the anon client to send the log (RLS allows insert)
      const { error } = await supabase.from('tf_error_logs').insert(entry);

      if (error) {
        // Fail silently to avoid infinite error loops
        console.warn('Failed to log error to database:', error);
      }
    } catch (err) {
      // Final fallback
      console.warn('Critical failure in error logging system:', err);
    }
  },
};
