import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppDetailField } from "./AppDetailField";

describe("AppDetailField", () => {
	it("renders a dt/dd pair, so its <dl> is a real description list", () => {
		render(
			<dl>
				<AppDetailField label="Handle">/pages/about</AppDetailField>
			</dl>,
		);

		expect(screen.getByText("Handle").tagName).toBe("DT");
		expect(screen.getByText("/pages/about").tagName).toBe("DD");
	});
});
