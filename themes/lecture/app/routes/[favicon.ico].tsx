import type { LoaderFunction } from "@remix-run/node";
import { getFavicon } from "~/backend/loaders.server";

export const loader: LoaderFunction = async (): Promise<Response> => {
  const favicon = await getFavicon();
  if (!favicon) return new Response("No favicon found", { status: 404 });
  return new Response(
    new Uint8Array(favicon.buffer),
    favicon.contentType
      ? { headers: { "Content-Type": favicon.contentType } }
      : undefined
  );
};
