import { isFlatSite } from "@myst-theme/common";
import { data, type LoaderFunctionArgs } from "react-router";
import { getConfig, getPage } from "~/backend/loaders.server";

function api404(message = "No API route found at this URL") {
  return data(
    {
      status: 404,
      message,
    },
    { status: 404 }
  );
}

/**
 * A page's JSON (`/<path>.json`), which hover previews and cross-references
 * fetch. The segments come from the route params, which are relative to the
 * router's basename, rather than from the request URL, which is not.
 * `/myst.xref.json` and `/myst.search.json` have routes of their own.
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const [first, ...rest] = [
    params.project,
    params.a,
    params.b,
    params.c,
    params.d,
    params.slug,
  ].filter((part): part is string => !!part);
  const config = await getConfig();
  const flat = isFlatSite(config);
  const project = flat ? undefined : first;
  const slugParts = flat ? [first, ...rest] : rest;
  const slug = slugParts.join(".");
  const pageData = await getPage(request, { project, slug });
  if (!pageData) return api404("No page found at this URL.");
  return data(pageData, {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}
