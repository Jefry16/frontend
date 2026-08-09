import { act, render } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "./theme";

let toggle: () => void;
let setTheme: (t: "light" | "dark") => void;

const Consumer = () => {
	const ctx = useTheme();
	toggle = ctx.toggle;
	setTheme = ctx.setTheme;
	return <span data-testid="theme">{ctx.theme}</span>;
};

const mount = () =>
	render(
		<StrictMode>
			<ThemeProvider>
				<Consumer />
			</ThemeProvider>
		</StrictMode>,
	);

describe("ThemeProvider", () => {
	beforeEach(() => localStorage.clear());

	it("persists a toggle, and the write survives StrictMode's double render", async () => {
		const { getByTestId } = mount();
		await act(async () => toggle());

		expect(getByTestId("theme").textContent).toBe("dark");
		expect(localStorage.getItem("theme")).toBe("dark");
	});

	it("reads the stored choice on mount", async () => {
		localStorage.setItem("theme", "dark");
		const { getByTestId } = mount();
		expect(getByTestId("theme").textContent).toBe("dark");
	});

	// An unset theme means "follow the OS", so nothing is written until the
	// operator actually picks one — otherwise the first render would pin it.
	it("writes nothing until a choice is made", () => {
		mount();
		expect(localStorage.getItem("theme")).toBeNull();
	});

	it("setTheme persists too", async () => {
		mount();
		await act(async () => setTheme("dark"));
		expect(localStorage.getItem("theme")).toBe("dark");
	});
});
