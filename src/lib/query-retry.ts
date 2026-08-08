import { isNotFound } from "./api-error";

// The library's default query retry (3 attempts, exponential backoff) minus the
// attempts that can never succeed. A 404 is a missing — or cross-tenant, since
// every by-id path binds the id to the operator — record, not a transient
// failure, so retrying it only delays AppResourceView's not-found state by the
// full 1s + 2s + 4s backoff. Every other error keeps the default.
export const notFoundAwareRetry = (failureCount: number, error: unknown) =>
	!isNotFound(error) && failureCount < 3;
