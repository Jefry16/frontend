import { act, renderHook } from "@testing-library/react";
import { vi } from "vitest";
import { wrapperWithProviders } from "./test-utils";

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

export const fire = (run: () => Promise<unknown>) =>
	act(async () => {
		await run().catch(() => undefined);
	});
