import { ErrorDocumentNotFound, ErrorUnhandled } from '@myst-theme/site';
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { NavigationAndArticleWrapper } from '~/components/NavigationAndArticleWrapper';

export function ErrorPage() {
  const error = useRouteError();
  return (
    <NavigationAndArticleWrapper>
      <main className="article">
        {isRouteErrorResponse(error) ? (
          <ErrorDocumentNotFound />
        ) : (
          <ErrorUnhandled error={error as any} />
        )}
      </main>
    </NavigationAndArticleWrapper>
  );
}
