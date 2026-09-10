import { screen } from "@testing-library/react";
import { LayoutDashboard } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { SidebarProvider } from "#/components/ui/sidebar";
import { renderWithProviders } from "#/test/test-utils";
import type { NavLeaf } from "../nav-items";
import { SidebarNavLeaf } from "./SidebarNavLeaf";

const { matchMock } = vi.hoisted(() => ({ matchMock: vi.fn() }));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		useMatchRoute: () => matchMock,
		Link: ({
			children,
			to,
			...rest
		}: {
			children: React.ReactNode;
			to: string;
		}) => (
			<a href={to} {...rest}>
				{children}
			</a>
		),
	};
});

const item = {
	label: "Dashboard",
	icon: LayoutDashboard,
	link: { to: "/tour-operators/$tourOperatorId" },
} as unknown as NavLeaf;

const render = (active: boolean) => {
	matchMock.mockReturnValue(active ? {} : false);
	return renderWithProviders(
		<SidebarProvider>
			<SidebarNavLeaf item={item} />
		</SidebarProvider>,
	);
};

describe("SidebarNavLeaf", () => {
	it("announces the active leaf as the current page", () => {
		render(true);
		expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
			"aria-current",
			"page",
		);
	});

	it("leaves aria-current off an inactive leaf", () => {
		render(false);
		expect(
			screen.getByRole("link", { name: /dashboard/i }),
		).not.toHaveAttribute("aria-current");
	});
});
