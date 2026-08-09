import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { AppAlert } from "./AppAlert";
import { AppFormActions } from "./AppFormActions";
import { AppFormCard } from "./AppFormCard";

// The fields are raw here on purpose: a story has no TanStack form to hand the
// renderers, and what this component owns is the card, the banners and the
// footer — not how a field renders. src/shared/form-pattern.test.ts skips
// .stories.tsx, so this does not weaken §5's gate.
const fields = (
	<FieldGroup>
		<Field>
			<FieldLabel htmlFor="story-title">Title</FieldLabel>
			<Input id="story-title" defaultValue="Cascade hike" />
		</Field>
		<Field>
			<FieldLabel htmlFor="story-handle">Handle</FieldLabel>
			<Input id="story-handle" defaultValue="cascade-hike" />
		</Field>
	</FieldGroup>
);

const meta = {
	title: "Shared/AppFormCard",
	component: AppFormCard,
	args: {
		onSubmit: () => {},
		children: fields,
		actions: <AppFormActions isPending={false} submitLabel="Save changes" />,
	},
} satisfies Meta<typeof AppFormCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// The shape of every create and edit form in the app.
export const Default: Story = {};

// A rejected save: the reason sits above the fields that caused it, never in a
// toast, so the operator can read it and the field together.
export const WithError: Story = {
	args: { errorMessage: "Handle is already taken." },
};

// The translation editors add a fallback note above the error slot.
export const WithNotice: Story = {
	args: {
		notice: (
			<AppAlert
				variant="info"
				title="Translation"
				description="Leave a field empty and the storefront falls back to the canonical value."
			/>
		),
	},
};
