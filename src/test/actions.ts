import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { wrapperWithProviders } from "./test-utils";

// Renders a `use-*-actions` hook and records which query keys its mutations
// invalidate.
//
// That set is what these tests exist for. A wrong key is invisible everywhere
// else: the request still succeeds, the types still check, no error is thrown —
// the screen just keeps showing the row the operator has already changed.
export const renderActions = <T>(hook: () => T) => {
	const { Wrapper, queryClient } = wrapperWithProviders();
	const spy = vi.spyOn(queryClient, "invalidateQueries");
	const { result } = renderHook(hook, { wrapper: Wrapper });

	return {
		result,
		queryClient,
		invalidated: () => spy.mock.calls.map((call) => call[0]?.queryKey),
	};
};

/** Runs a mutation to completion, swallowing the rejection an error case wants. */
export const fire = (run: () => Promise<unknown>) =>
	act(async () => {
		await run().catch(() => undefined);
	});
