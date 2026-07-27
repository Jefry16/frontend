import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "#/auth";
import type { AuthUser } from "#/auth/types";
import { storyQueryClient } from "#/dev/story-utils";
import { queryKeys } from "#/lib/query-keys";
import { AppOperatorLogoCard } from "./AppOperatorLogoCard";

const SAMPLE =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		"<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='%234f46e5'/></svg>",
	);

const USER: AuthUser = {
	id: "u-1",
	context: "users",
	name: "Ada Lovelace",
	avatarUrl: null,
	language: "en",
	tourOperators: [],
};

const qc = storyQueryClient();
qc.setQueryData(queryKeys.authProfile, USER);

const meta = {
	title: "TourOperator/AppOperatorLogoCard",
	component: AppOperatorLogoCard,
	args: { tourOperatorId: "op-1" },
	decorators: [
		(Story) => (
			<QueryClientProvider client={qc}>
				<AuthProvider>
					<div className="max-w-2xl">
						<Story />
					</div>
				</AuthProvider>
			</QueryClientProvider>
		),
	],
} satisfies Meta<typeof AppOperatorLogoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoLogo: Story = { args: { logoUrl: null } };
export const WithLogo: Story = { args: { logoUrl: SAMPLE } };
