import { type RouteConfig } from '@react-router/dev/routes';
import { flatRoutes } from '@react-router/fs-routes';

// File-based routes from app/routes/, in the flat-file naming convention the
// theme already used under Remix.
export default flatRoutes() satisfies RouteConfig;
