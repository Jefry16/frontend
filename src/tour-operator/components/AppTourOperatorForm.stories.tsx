import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, type AuthUser } from "#/auth";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppTourOperatorForm } from "./AppTourOperatorForm";

const meta = {
	title: "TourOperator/AppTourOperatorForm",
	component: AppTourOperatorForm,
	decorators: [
		(Story) => (
			<AuthProvider>
				<Story />
			</AuthProvider>
		),
	],
} satisfies Meta<typeof AppTourOperatorForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const ONBOARDING_USER: AuthUser = {
	id: "u-1",
	context: "users",
	name: "Ada Lovelace",
	avatarUrl: null,
	language: "en",
	tourOperators: [],
};

const qc = storyQueryClient();
qc.setQueryData(queryKeys.authProfile, ONBOARDING_USER);

export const Onboarding: Story = {
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<Story />
				</AuthProvider>
			</QueryClientProvider>
		),
	],
};
