import {
  createSitemapResponse,
  getSiteSlugs,
  getDomainFromRequest,
} from "@myst-theme/site";
import type { LoaderFunctionArgs } from "react-router";
import { getConfig } from "~/backend/loaders.server";

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  const config = await getConfig();
  return createSitemapResponse(
    getDomainFromRequest(request),
    getSiteSlugs(config)
  );
}
