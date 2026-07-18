import { Fragment } from 'react/jsx-runtime';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertContent, AlertDescription, AlertTitle, AlertIcon } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface Error500Props {
  error?: Error | null;
}

export function Error500({ error }: Error500Props = {}) {
  return (
    <Fragment>
      <div className="mb-10">
        <img
          src={toAbsoluteUrl('/media/illustrations/20.svg')}
          className="dark:hidden max-h-[160px]"
          alt="image"
        />
        <img
          src={toAbsoluteUrl('/media/illustrations/20-dark.svg')}
          className="light:hidden max-h-[160px]"
          alt="image"
        />
      </div>

      <Badge variant="destructive" appearance="outline" className="mb-3">
        500 Error
      </Badge>

      <h3 className="text-2xl font-semibold text-mono text-center mb-2">
        Internal Server Error
      </h3>

      <div className="text-base text-center text-secondary-foreground mb-6">
        Server error occurred. Please try again later or &nbsp;
        <a
          href="https://devs.keenthemes.com"
          className="text-primary font-medium hover:text-primary-active"
        >
          Contact Us
        </a>
        &nbsp; for assistance.
      </div>

      {error && (
        <div className="w-full max-w-lg mb-8 text-left">
          <Alert variant="destructive" appearance="light" size="md">
            <AlertIcon>
              <AlertCircle className="h-5 w-5 animate-pulse" />
            </AlertIcon>
            <AlertContent>
              <AlertTitle className="font-bold lowercase">
                technical details / data issue detected
              </AlertTitle>
              <AlertDescription className="text-xs mt-1">
                <p className="font-medium mb-2 leading-relaxed lowercase text-muted-foreground">
                  We encountered an error that might be caused by incorrect format or bad structure in the loaded data:
                </p>
                <div className="bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 rounded-md p-3 font-mono break-words text-[11px] text-destructive whitespace-pre-wrap">
                  {error.message || String(error)}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed lowercase">
                  tip: if you recently imported/pasted text (such as AI plans or CSV files), verify the formatting, columns, and data types, and try again.
                </p>
              </AlertDescription>
            </AlertContent>
          </Alert>
        </div>
      )}

      <Button asChild>
        <a href="/">Back to Home</a>
      </Button>
    </Fragment>
  );
}
