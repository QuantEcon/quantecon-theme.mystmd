import type { PageLoader } from '@myst-theme/common';
import React, { useMemo } from 'react';

type PageContextType = {
  page?: PageLoader;
};

const PageContext = React.createContext<PageContextType>({});

export function PageProvider({ page, children }: React.PropsWithChildren<{ page?: PageLoader }>) {
  const data = useMemo(() => ({ page }), [page]);
  return <PageContext.Provider value={data}>{children}</PageContext.Provider>;
}

export function usePage() {
  return React.useContext(PageContext).page;
}
