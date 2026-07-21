import type { RequestHandler } from "msw";

// MSW request handlers for the test suite. Empty in the skeleton — each feature
// module adds the handlers its tests need (register/login for auth, etc.).
// `server.listen({ onUnhandledRequest: "error" })` (vitest.setup.ts) fails any
// request without a matching handler, so a test that hits the network must
// register one here first.
export const handlers: RequestHandler[] = [];
