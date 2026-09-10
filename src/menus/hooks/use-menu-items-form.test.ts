import { act, renderHook } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { useMenuItemsForm } from "./use-menu-items-form";

const { navigateMock } = vi.hoisted(() => ({ navigateMock: vi.fn() }));
vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return { ...actual, useNavigate: () => navigateMock };
});
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const MENU = "menu-1";
const URL = `${API}/tour-operators/${OP}/menus/${MENU}/items`;

const menu = (items: unknown[]) =>
	({
		id: MENU,
		context: "menus",
		handle: "main-menu",
		title: "Main",
		items,
	}) as never;

const node = (over: Record<string, unknown> = {}) => ({
	title: "Home",
	linkType: "HOME",
	resourceId: null,
	url: null,
	titleTranslations: {},
	children: [],
	...over,
});

const render = (items: unknown[]) => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useMenuItemsForm(OP, menu(items)), {
		wrapper: Wrapper,
	});
};

const save = async (form: { handleSubmit: () => Promise<void> }) => {
	await act(async () => {
		await form.handleSubmit();
	});
};

const put = (body: ReturnType<typeof vi.fn>) =>
	http.put(URL, async ({ request }) => {
		body(await request.json());
		return new HttpResponse(null, { status: 204 });
	});

describe("useMenuItemsForm", () => {
	beforeEach(() => navigateMock.mockReset());

	it("sends only the target field the link kind uses", async () => {
		const body = vi.fn();
		server.use(put(body));
		const { result } = render([
			node({ title: "Boats", linkType: "EXPERIENCE", resourceId: "exp-1" }),
			node({ title: "Blog", linkType: "EXTERNAL_URL", url: "https://x.test" }),
			node({ title: "Home", linkType: "HOME" }),
		]);

		await save(result.current.form);

		const [experience, external, home] = body.mock.calls[0][0].items;
		expect(experience).toMatchObject({ resourceId: "exp-1" });
		expect(experience).not.toHaveProperty("url");
		expect(external).toMatchObject({ url: "https://x.test" });
		expect(external).not.toHaveProperty("resourceId");
		expect(home).not.toHaveProperty("resourceId");
		expect(home).not.toHaveProperty("url");
	});

	it("drops blank translations and omits the key entirely when none remain", async () => {
		const body = vi.fn();
		server.use(put(body));
		const { result } = render([
			node({ title: "Home", titleTranslations: { es: "Inicio", fr: "   " } }),
			node({ title: "About", titleTranslations: { es: "  " } }),
		]);

		await save(result.current.form);

		const [withEs, withNone] = body.mock.calls[0][0].items;
		expect(withEs.titleTranslations).toEqual({ es: "Inicio" });
		expect(withNone).not.toHaveProperty("titleTranslations");
	});

	it("preserves the nesting rather than flattening the tree", async () => {
		const body = vi.fn();
		server.use(put(body));
		const { result } = render([
			node({
				title: "Tours",
				children: [
					node({ title: "Boats", linkType: "EXPERIENCE", resourceId: "e1" }),
				],
			}),
		]);

		await save(result.current.form);

		const items = body.mock.calls[0][0].items;
		expect(items).toHaveLength(1);
		expect(items[0].children).toHaveLength(1);
		expect(items[0].children[0]).toMatchObject({ title: "Boats" });
	});

	it("trims titles", async () => {
		const body = vi.fn();
		server.use(put(body));
		const { result } = render([node({ title: "  Home  " })]);

		await save(result.current.form);

		expect(body.mock.calls[0][0].items[0].title).toBe("Home");
	});
});
