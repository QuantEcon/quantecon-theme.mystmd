import { type ThemeCssOptions, themeCSS, cssResponse } from "@myst-theme/site";
import { getConfig } from "~/backend/loaders.server";

export async function loader(): Promise<Response> {
  const site = await getConfig();
  return cssResponse(themeCSS(site?.options as ThemeCssOptions));
}
