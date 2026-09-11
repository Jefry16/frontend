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

	it("keeps the loaded body when a refetch fails, rather than replacing it", () => {
		renderWithProviders(
			<AppQueryState
				query={state<string>({
					data: "draft in progress",
					error: refused("blip"),
				})}
				chrome={chrome}
				loading={<p>Loading</p>}
			>
				{(value) => <p>{value}</p>}
			</AppQueryState>,
		);

		expect(screen.getByText("draft in progress")).toBeVisible();
		expect(screen.queryByText("blip")).not.toBeInTheDocument();
	});

	it("tells the chrome which phase it is wrapping", () => {
		const phases: string[] = [];
		const spy = (body: React.ReactNode, phase: string) => {
			phases.push(phase);
			return body;
		};
		const view = (q: QueryState<string>) => (
			<AppQueryState query={q} chrome={spy} loading={<p>Loading</p>}>
				{(value) => <p>{value}</p>}
			</AppQueryState>
		);
		const { rerender } = renderWithProviders(
			view(state<string>({ isPending: true })),
		);
		rerender(view(state<string>({ error: refused("no") })));
		rerender(view(state<string>({ data: "x" })));

		expect(phases).toEqual(["pending", "error", "loaded"]);
	});

	it("renders nothing when the body is false, chrome included", () => {
		const { container } = renderWithProviders(
			<AppQueryState
				query={state({ data: [] as string[] })}
				chrome={chrome}
				loading={<p>Loading</p>}
			>
				{(rows) => rows.length > 0 && <p>{rows.length}</p>}
			</AppQueryState>,
		);

		expect(container).toBeEmptyDOMElement();
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
