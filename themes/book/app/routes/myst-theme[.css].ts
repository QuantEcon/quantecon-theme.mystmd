import { type LoaderFunction } from '@remix-run/node';
import { type ThemeCssOptions, themeCSS, cssResponse } from '@myst-theme/site';
import { getConfig, getCustomStyleSheet } from '@quantecon/theme-common/backend/loaders.server';

// The theme options' CSS variables, then the book's own stylesheet
// (`site.options.style`), as upstream book-theme serves them.
export const loader: LoaderFunction = async (): Promise<Response> => {
  const site = await getConfig();
  const css = await getCustomStyleSheet();
  return cssResponse(themeCSS(site?.options as ThemeCssOptions, css));
};
