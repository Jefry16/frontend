import { useForm } from "@tanstack/react-form";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import { AppComboboxField, type ComboboxItem } from "./AppComboboxField";

const ITEMS: ComboboxItem[] = [
	{ value: "es-id", label: "Spain" },
	{ value: "us-id", label: "United States" },
	{ value: "do-id", label: "Dominican Republic" },
];

let current = "";

const Harness = () => {
	const form = useForm({ defaultValues: { countryId: "" } });
	return (
		<form.Field name="countryId">
			{(field) => {
				current = field.state.value;
				return <AppComboboxField field={field} label="Country" items={ITEMS} />;
			}}
		</form.Field>
	);
};

describe("AppComboboxField", () => {
	// Command matches on the `value` prop it is handed, so items pass their
	// LABEL there. Search the name, store the id — get that backwards and typing
	// "Spain" finds nothing while typing a uuid finds everything.
	it("filters by label and stores the value", async () => {
		current = "";
		renderWithProviders(<Harness />);
		await userEvent.click(screen.getByRole("combobox"));

		await userEvent.type(screen.getByPlaceholderText(/search/i), "Domin");
		await waitFor(() =>
			expect(screen.queryByText("Spain")).not.toBeInTheDocument(),
		);

		await userEvent.click(screen.getByText("Dominican Republic"));
		await waitFor(() => expect(current).toBe("do-id"));
	});

	it("shows the chosen label on the trigger, not the id", async () => {
		current = "";
		renderWithProviders(<Harness />);
		await userEvent.click(screen.getByRole("combobox"));
		await userEvent.click(screen.getByText("Spain"));

		await waitFor(() =>
			expect(screen.getByRole("combobox")).toHaveTextContent("Spain"),
		);
		expect(screen.getByRole("combobox")).not.toHaveTextContent("es-id");
	});
});
