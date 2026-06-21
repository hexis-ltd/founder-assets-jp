// Preview provider for design-sync.
//
// The synced components are Next.js App Router client components: AuthForm,
// AuthPanel and Directory call useRouter()/usePathname()/useSearchParams() from
// "next/navigation", which throw outside an App Router context. Standalone
// preview cards have no Next runtime, so we supply the same context objects
// next/navigation reads from, with inert values. esbuild bundles these
// shared-runtime modules once, so the Context identity here matches the one the
// hooks consume.
import React from "react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {
  PathnameContext,
  PathParamsContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";

const noopRouter = {
  push: async () => {},
  replace: async () => {},
  refresh: () => {},
  back: () => {},
  forward: () => {},
  prefetch: async () => {},
};

export function DesignProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterContext.Provider value={noopRouter as never}>
      <PathnameContext.Provider value="/">
        <PathParamsContext.Provider value={{}}>
          <SearchParamsContext.Provider value={new URLSearchParams() as never}>
            {children}
          </SearchParamsContext.Provider>
        </PathParamsContext.Provider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  );
}
