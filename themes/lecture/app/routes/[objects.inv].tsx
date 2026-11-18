import type { LoaderFunction } from "@remix-run/node";
import { getObjectsInv } from "~/backend/loaders.server";

export const loader: LoaderFunction = async (): Promise<Response> => {
  const inv = await getObjectsInv();
  if (!inv) return new Response("Inventory not found", { status: 404 });
  return new Response(new Uint8Array(inv));
};
