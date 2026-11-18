import {
  createSitemapResponse,
  getSiteSlugs,
  getDomainFromRequest,
} from "@myst-theme/site";
import type { LoaderFunction } from "@remix-run/node";
import { getConfig } from "~/backend/loaders.server";

export const loader: LoaderFunction = async ({
  request,
}): Promise<Response> => {
  const config = await getConfig();
  return createSitemapResponse(
    getDomainFromRequest(request),
    getSiteSlugs(config)
  );
};
