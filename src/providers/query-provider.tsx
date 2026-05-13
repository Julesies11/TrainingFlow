import { ReactNode, useState } from 'react';
import { RiErrorWarningFill } from '@remixicon/react';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { errorLogsApi } from '@/services/api/system/error-logs.api';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';

const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            const message =
              error.message || 'Something went wrong. Please try again.';

            // Log to database
            errorLogsApi.capture({
              message: `TanStack Query Error: ${message}`,
              stack: error instanceof Error ? error.stack : undefined,
              component_name: 'QueryProvider',
              severity: 'error',
            });

            toast.custom(
              () => (
                <Alert variant="mono" icon="destructive" close={false}>
                  <AlertIcon>
                    <RiErrorWarningFill />
                  </AlertIcon>
                  <AlertTitle>{message}</AlertTitle>
                </Alert>
              ),
              {
                position: 'top-center',
              },
            );
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            const message =
              error.message || 'Something went wrong. Please try again.';

            // Log mutation failures to database
            errorLogsApi.capture({
              message: `TanStack Mutation Error: ${message}`,
              stack: error instanceof Error ? error.stack : undefined,
              component_name: 'MutationProvider',
              severity: 'error',
            });

            // We don't show a global toast for mutations because most components
            // (like our Garmin Import Dialog) handle their own mutation toast
            // feedback specifically.
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export { QueryProvider };
