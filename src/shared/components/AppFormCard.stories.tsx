import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { Field, FieldGroup, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { AppAlert } from "./AppAlert";
import { AppFormActions } from "./AppFormActions";
import { AppFormCard } from "./AppFormCard";

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

export const Default: Story = {};

export const WithError: Story = {
	args: { errorMessage: "Handle is already taken." },
};

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
