import {
  createRobotsTxtResponse,
  getDomainFromRequest,
} from "@myst-theme/site";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  return createRobotsTxtResponse(getDomainFromRequest(request));
}
