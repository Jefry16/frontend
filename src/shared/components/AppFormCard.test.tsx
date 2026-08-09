import { useForm } from "@tanstack/react-form";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FieldGroup } from "#/components/ui/field";
import { AppField } from "#/shared/components/AppField";
import { renderWithProviders } from "#/test/test-utils";
import { AppFormActions } from "./AppFormActions";
import { AppFormCard } from "./AppFormCard";

// Every converted form passes `form.handleSubmit` by reference rather than
// wrapping it in a thunk. That only works because form-core binds it in the
// FormApi constructor — a detail of the pinned version, not a language
// guarantee — and nothing else in the suite submits a form, so a regression
// here would take every create and edit page down while staying green.
const Harness = ({
	onSubmit,
	errorMessage,
}: {
	onSubmit: (name: string) => void;
	errorMessage?: string | null;
}) => {
	const form = useForm({
		defaultValues: { name: "" },
		onSubmit: ({ value }) => onSubmit(value.name),
	});

	return (
		<AppFormCard
			onSubmit={form.handleSubmit}
			errorMessage={errorMessage}
			actions={<AppFormActions isPending={false} submitLabel="Save" />}
		>
			<FieldGroup>
				<form.Field name="name">
					{(field) => <AppField field={field} label="Name" />}
				</form.Field>
			</FieldGroup>
		</AppFormCard>
	);
};

describe("AppFormCard", () => {
	it("submits through a bare form.handleSubmit reference", async () => {
		const onSubmit = vi.fn();
		renderWithProviders(<Harness onSubmit={onSubmit} />);

		await userEvent.type(screen.getByLabelText("Name"), "Cascade hike");
		await userEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("Cascade hike"));
	});

	it("does not reload the page — the submit event is prevented", async () => {
		const onSubmit = vi.fn();
		renderWithProviders(<Harness onSubmit={onSubmit} />);

		const submitted = vi.fn();
		// jsdom does not navigate, so a missed preventDefault surfaces as the
		// event reaching the document undefaulted rather than as a reload.
		document.addEventListener("submit", (e) => submitted(e.defaultPrevented));

		await userEvent.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() => expect(submitted).toHaveBeenCalledWith(true));
	});

	it("shows a server error above the fields, not in a toast", () => {
		renderWithProviders(
			<Harness onSubmit={vi.fn()} errorMessage="Handle is already taken." />,
		);

		expect(screen.getByText("Handle is already taken.")).toBeInTheDocument();
	});
});
