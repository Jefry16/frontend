import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { describe, expect, it, vi } from "vitest";
import type { QueryState } from "#/lib/query-state";
import { renderWithProviders } from "#/test/test-utils";
import { AppQueryState } from "./AppQueryState";

const chrome = (body: React.ReactNode) => (
	<section>
		<h2>Custom fields</h2>
		{body}
	</section>
);

const state = <T,>(over: Partial<QueryState<T>>): QueryState<T> => ({
	data: undefined,
	isPending: false,
	error: null,
	refetch: vi.fn(),
	...over,
});

const refused = (message: string) => {
	const error = new AxiosError(message);
	error.response = {
		data: { message },
		status: 404,
		statusText: "Not Found",
		headers: {},
		config: { headers: {} } as never,
	};
	return error;
};

describe("AppQueryState", () => {
	it("keeps the chrome while pending", () => {
		renderWithProviders(
			<AppQueryState
				query={state<string>({ isPending: true })}
				chrome={chrome}
				loading={<p>Loading</p>}
			>
				{(value) => <p>{value}</p>}
			</AppQueryState>,
		);

		expect(
			screen.getByRole("heading", { name: "Custom fields" }),
		).toBeVisible();
		expect(screen.getByText("Loading")).toBeVisible();
	});

	it("keeps the chrome on failure, and says why, and offers a retry", async () => {
		const refetch = vi.fn();
		const user = userEvent.setup();
		renderWithProviders(
			<AppQueryState
				query={state<string>({ error: refused("Not Found"), refetch })}
				chrome={chrome}
				loading={<p>Loading</p>}
			>
				{(value) => <p>{value}</p>}
			</AppQueryState>,
		);

		expect(
			screen.getByRole("heading", { name: "Custom fields" }),
		).toBeVisible();
		expect(screen.getByText("Not Found")).toBeVisible();

		await user.click(screen.getByRole("button", { name: /try again/i }));
		expect(refetch).toHaveBeenCalled();
	});

	it("renders nothing at all when the body is null, chrome included", () => {
		const { container } = renderWithProviders(
			<AppQueryState
				query={state({ data: [] as string[] })}
				chrome={chrome}
				loading={<p>Loading</p>}
			>
				{(rows) => (rows.length === 0 ? null : <p>{rows.length}</p>)}
			</AppQueryState>,
		);

		expect(container).toBeEmptyDOMElement();
	});
});
