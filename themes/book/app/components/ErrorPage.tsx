import { ErrorDocumentNotFound, ErrorUnhandled } from '@myst-theme/site';
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';

/** A missing page or a loader failure, in the book's paper and type. */
export function ErrorPage() {
  const error = useRouteError();
  return (
    <main className="qb-wrap qb-error" id="skip-to-article">
      {isRouteErrorResponse(error) ? <ErrorDocumentNotFound /> : <ErrorUnhandled error={error as any} />}
    </main>
  );
}
