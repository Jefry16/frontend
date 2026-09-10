import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import { AppWriteGate } from "./AppWriteGate";

const { canWrite } = vi.hoisted(() => ({ canWrite: { value: true } }));

vi.mock("../hooks/use-permissions", () => ({
	usePermissions: () => ({ canWrite: canWrite.value, isOwner: false }),
}));

const Body = vi.fn(() => <p>Edit form</p>);

describe("AppWriteGate", () => {
	beforeEach(() => {
		Body.mockClear();
		canWrite.value = true;
	});

	it("renders the page body for a member who may write", () => {
		renderWithProviders(
			<AppWriteGate>
				<Body />
			</AppWriteGate>,
		);

		expect(screen.getByText("Edit form")).toBeInTheDocument();
	});

	it("shows AppNotPermitted instead when the member may not", () => {
		canWrite.value = false;
		renderWithProviders(
			<AppWriteGate>
				<Body />
			</AppWriteGate>,
		);

		expect(screen.queryByText("Edit form")).not.toBeInTheDocument();
		expect(screen.getByRole("paragraph")).toBeInTheDocument();
	});

	it("never mounts the body it denied, so its query never fires", () => {
		canWrite.value = false;
		renderWithProviders(
			<AppWriteGate>
				<Body />
			</AppWriteGate>,
		);

		expect(Body).not.toHaveBeenCalled();
	});
});
