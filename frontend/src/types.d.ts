declare module 'react-router-dom' {
  export const Routes: any;
  export const Route: any;
  export const Navigate: any;
  export const BrowserRouter: any;
  export const useNavigate: () => any;
  export const useLocation: () => any;
  export const useParams: () => any;
  export const useRoutes: (routes: any) => any;
  export const useResolvedPath: (to: string) => any;
  export const useHref: (to: string) => string;
  export const useMatch: (pattern: string) => any;
  export const useBlocker: (blocker: any) => () => void;
  export const useBeforeUnload: (handler: any) => () => void;
  export const useFetcher: () => any;
  export const useFetcher: (key: string) => any;
  export const useMatches: () => any[];
  export const useLoaderData: () => any;
  export const useActionData: () => any;
  export const useNavigation: () => any;
  export const useRouteError: () => any;
  export const useRouteLoaderData: (routeId: string) => any;
  export const useRouteActionData: (routeId: string) => any;
  export const useSearchParams: () => [URLSearchParams, (nextInit: any) => void];
  export const useSubmit: () => (data: FormData | URLSearchParams | string | Record<string, any>, options: any) => void;
}
