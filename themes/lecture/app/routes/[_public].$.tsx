import type { LoaderFunctionArgs } from "react-router";
import { getCDNUrl } from "~/backend/loaders.server";

/**
 * `/_public/<file>`: a page's static file (an image, a download), proxied from
 * the content server. The static renderer writes every file in the site's
 * `public.json` through this route, and pages link there when the content
 * server is not reachable from the browser (a static build, or MYST_HIDE_CDN).
 */
export async function loader({ params }: LoaderFunctionArgs) {
  return fetch(getCDNUrl(params["*"] ?? ""));
}
