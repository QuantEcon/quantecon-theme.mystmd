import {
  BannerStateProvider,
  TabStateProvider,
  UiStateProvider,
  useThemeTop,
} from '@myst-theme/providers';
import { Toolbar } from './toolbar/Toolbar';
import { ContentsSidebar } from './ContentsSidebar';

function NavigationAndArticleWrapperInternal({
  children,
}: {
  hide_toc?: boolean;
  hideSearch?: boolean;
  children: React.ReactNode;
}) {
  const top = useThemeTop();
  return (
    <>
      <Toolbar />
      <ContentsSidebar />
      <TabStateProvider>
        <article className="article content" style={{ marginTop: top }}>
          {children}
        </article>
      </TabStateProvider>
    </>
  );
}

export function NavigationAndArticleWrapper({
  children,
  hide_toc,
  hideSearch,
}: {
  hide_toc?: boolean;
  hideSearch?: boolean;
  children: React.ReactNode;
}) {
  return (
    <UiStateProvider>
      <BannerStateProvider>
        <NavigationAndArticleWrapperInternal
          children={children}
          hide_toc={hide_toc}
          hideSearch={hideSearch}
        />
      </BannerStateProvider>
    </UiStateProvider>
  );
}
