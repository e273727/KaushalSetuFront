import { createTRPCReact } from "@trpc/react-query";
import type { AnyTRPCRouter } from "@trpc/server";

// TODO: this used to import the real `AppRouter` type from the backend
// (`../../../server/routers`) when both lived in one monorepo. Now that the
// backend is a separate deployment/repo, that import doesn't resolve here.
// You still get end-to-end type safety once you either:
//   (a) publish the router type from your backend as a small npm package, or
//   (b) copy just the `router.ts` type definitions (no server logic) into
//       this repo, e.g. src/shared/server-types.ts, and import from there.
// Until then this falls back to a generic router shape, so calls compile
// but give no autocomplete/type-checking on specific inputs or outputs.
// (Using `AnyTRPCRouter` here instead of a bare `any` — with `any` directly,
// TS's conditional-type checks inside trpc/react-query distribute over the
// naked `any` and produce bogus "collides with a built-in method" errors.)
export type AppRouter = AnyTRPCRouter;

// Cast to `any` here (not just on AppRouter) — with a placeholder router
// type, trpc/react-query's internal collision-check conditional types
// distribute over the generic and leak into every call site otherwise.
// Once you wire up the real AppRouter type (see note above), replace this
// with a plain `createTRPCReact<AppRouter>()` for full type safety.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trpc = createTRPCReact<AppRouter>() as any;
