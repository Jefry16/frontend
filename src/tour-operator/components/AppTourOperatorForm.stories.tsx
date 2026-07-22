import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, type AuthUser } from "#/auth";
import { queryKeys } from "#/lib/query-keys";
import { AppTourOperatorForm } from "./AppTourOperatorForm";

// Connected: reads useAuth + fetches reference data. The story provides
// AuthProvider (router + query come from the framework + preview decorator).
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

// Onboarding: a signed-in user with no operators yet. Seeding the profile makes
// `isOnboarding` true, so the "wait for an invitation" hint renders below the
// form (the state a freshly-registered user lands on).
const ONBOARDING_USER: AuthUser = {
	id: "u-1",
	context: "users",
	name: "Ada Lovelace",
	avatarUrl: null,
	language: "en",
	tourOperators: [],
};

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
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
