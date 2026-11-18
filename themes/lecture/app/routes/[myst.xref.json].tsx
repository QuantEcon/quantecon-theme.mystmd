import { data } from "react-router";
import { getMystXrefJson } from "~/backend/loaders.server";

// A route of its own, like `/myst.search.json`, so the static renderer writes
// it out.
export async function loader() {
  const xref = await getMystXrefJson();
  if (!xref) {
    return data({ message: "myst.xref.json not found", status: 404 }, { status: 404 });
  }
  return xref;
}
