import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppTranslationNotice } from "./AppTranslationNotice";

const meta = {
	title: "Shared/AppTranslationNotice",
	component: AppTranslationNotice,
} satisfies Meta<typeof AppTranslationNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

// Fixed content — it takes no props, because the fallback rule is the same on
// every per-locale editor. The five that show it sit under their own modules.
export const Default: Story = {};
