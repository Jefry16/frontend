import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { AppImageDropzone } from "./AppImageDropzone";

// A tiny inline SVG (data URI) so the preview story needs no network.
const SAMPLE =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		"<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' fill='%234f46e5'/></svg>",
	);

const meta = {
	title: "Shared/AppImageDropzone",
	component: AppImageDropzone,
	args: {
		accept: "image/*",
		maxBytes: 25 * 1024 * 1024,
		hint: "Drag an image here, or click to browse",
		onFile: () => {},
		onError: () => {},
		errorMessages: {
			wrongType: "That file type isn't supported. Please choose an image.",
			tooLarge: "That image is too large. Maximum size is 25 MB.",
		},
	},
	decorators: [
		(Story) => (
			<div className="max-w-md">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof AppImageDropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithPreview: Story = { args: { previewUrl: SAMPLE } };
export const Pending: Story = { args: { pending: true } };
export const Disabled: Story = { args: { disabled: true } };
// The square-tile form (e.g. the operator logo): sized via className, no hint.
export const CompactTile: Story = {
	args: { className: "size-28 min-h-0", hint: undefined },
};
export const CompactTileWithPreview: Story = {
	args: { className: "size-28 min-h-0", hint: undefined, previewUrl: SAMPLE },
};
