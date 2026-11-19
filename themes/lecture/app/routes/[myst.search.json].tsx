import { data } from "react-router";
import { getMystSearchJson } from "~/backend/loaders.server";

// A route of its own, not a case of the page-JSON route: the static renderer
// writes out every fixed (non-dynamic) route, so this is how the search index
// reaches a statically built site.
export async function loader() {
  const search = await getMystSearchJson();
  if (!search) {
    return data({ message: "myst.search.json not found", status: 404 }, { status: 404 });
  }
  return search;
}
