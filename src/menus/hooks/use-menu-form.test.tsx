import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useMenuForm } from "./use-menu-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";

// The POST used to be fired by the component, which awaited handleSubmit and
// then checked form.state.isValid itself. Wiring useForm's onSubmit moves that
// decision into form-core, so what these pin is the half that could regress
// silently: an invalid form must not reach the network at all.
const submit = (
	form: {
		setFieldValue: (n: "handle" | "title", v: string) => void;
		handleSubmit: () => Promise<void>;
	},
	values: { handle: string; title: string },
) => {
	act(() => {
		form.setFieldValue("handle", values.handle);
		form.setFieldValue("title", values.title);
	});
	return act(async () => {
		await form.handleSubmit();
	});
};

describe("useMenuForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("posts the menu and navigates to it (id from Location)", async () => {
		const posted = vi.fn();
		server.use(
			http.post(`${API}/tour-operators/${OP}/menus`, async ({ request }) => {
				posted(await request.json());
				return new HttpResponse(null, {
					status: 201,
					headers: { Location: `/api/tour-operators/${OP}/menus/m-9` },
				});
			}),
		);
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useMenuForm(OP), { wrapper: Wrapper });

		await submit(result.current.form, {
			handle: "main-menu",
			title: "Main menu",
		});

		await waitFor(() =>
			expect(navigateMock).toHaveBeenCalledWith({
				to: "/tour-operators/$tourOperatorId/content/menus/$menuId",
				params: { tourOperatorId: OP, menuId: "m-9" },
			}),
		);
		expect(posted).toHaveBeenCalledWith({
			handle: "main-menu",
			title: "Main menu",
		});
	});

	it("does not post when the handle fails the slug rule", async () => {
		const posted = vi.fn();
		server.use(
			http.post(`${API}/tour-operators/${OP}/menus`, () => {
				posted();
				return new HttpResponse(null, { status: 201 });
			}),
		);
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useMenuForm(OP), { wrapper: Wrapper });

		await submit(result.current.form, {
			handle: "Not A Slug",
			title: "Main menu",
		});

		expect(posted).not.toHaveBeenCalled();
		expect(navigateMock).not.toHaveBeenCalled();
	});

	it("names a taken handle rather than echoing the raw 409", async () => {
		server.use(
			http.post(`${API}/tour-operators/${OP}/menus`, () =>
				HttpResponse.json({ message: "conflict" }, { status: 409 }),
			),
		);
		const { Wrapper } = wrapperWithProviders();
		const { result } = renderHook(() => useMenuForm(OP), { wrapper: Wrapper });

		await submit(result.current.form, {
			handle: "main-menu",
			title: "Main menu",
		});

		await waitFor(() => expect(result.current.errorMessage).toBeTruthy());
		expect(result.current.errorMessage).not.toBe("conflict");
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
