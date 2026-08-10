import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "#/test/test-utils";
import { AppImageDropzone } from "./AppImageDropzone";

const file = (name: string, type: string, bytes = 10) => {
	const f = new File(["x".repeat(bytes)], name, { type });
	// jsdom sizes a File from its parts, but the cases worth testing are files
	// too large to construct — so the size is defined outright.
	Object.defineProperty(f, "size", { value: bytes });
	return f;
};

const MESSAGES = { wrongType: "Wrong type", tooLarge: "Too large" };

const render = (
	props: Partial<Parameters<typeof AppImageDropzone>[0]> = {},
) => {
	const onFile = vi.fn();
	const onError = vi.fn();
	const { container } = renderWithProviders(
		<AppImageDropzone
			onFile={onFile}
			onError={onError}
			errorMessages={MESSAGES}
			{...props}
		/>,
	);
	const input = container.querySelector(
		'input[type="file"]',
	) as HTMLInputElement;
	return { onFile, onError, input, button: screen.getByRole("button") };
};

// fireEvent, not userEvent.upload: upload honours the input's `accept`
// attribute and drops a mismatched file before the component sees it. A real
// browser does not — `accept` is a filter hint and the picker offers an
// "All files" escape — so the component's own check is reachable and has to be
// tested with the file actually delivered.
const pick = (input: HTMLInputElement, picked: File) => {
	Object.defineProperty(input, "files", {
		value: [picked],
		configurable: true,
	});
	fireEvent.change(input);
};

describe("AppImageDropzone — accept matching", () => {
	// The three shapes an `accept` string takes in this app.
	it.each([
		["image/*", "image/png", true],
		["image/*", "application/pdf", false],
		["image/png,image/jpeg", "image/jpeg", true],
		["image/png,image/jpeg", "image/webp", false],
		["image/png", "image/png", true],
	])("accept=%s with %s → accepted: %s", async (accept, type, accepted) => {
		const { onFile, onError, input } = render({ accept });

		pick(input, file("a", type));

		expect(onFile).toHaveBeenCalledTimes(accepted ? 1 : 0);
		expect(onError).toHaveBeenCalledTimes(accepted ? 0 : 1);
	});

	it("reports the caller's wrong-type message, not a built-in string", async () => {
		const { onError, input } = render({ accept: "image/*" });

		pick(input, file("a", "application/pdf"));

		expect(onError).toHaveBeenCalledWith("Wrong type");
	});
});

describe("AppImageDropzone — size", () => {
	// Client-side, so an oversize file never reaches the network to be 413'd.
	it("rejects a file over maxBytes before calling onFile", async () => {
		const { onFile, onError, input } = render({ maxBytes: 100 });

		pick(input, file("big.png", "image/png", 101));

		expect(onFile).not.toHaveBeenCalled();
		expect(onError).toHaveBeenCalledWith("Too large");
	});

	it("accepts a file exactly at the limit", async () => {
		const { onFile, onError, input } = render({ maxBytes: 100 });

		pick(input, file("edge.png", "image/png", 100));

		expect(onFile).toHaveBeenCalledTimes(1);
		expect(onError).not.toHaveBeenCalled();
	});

	it("accepts any size when no limit is given", async () => {
		const { onFile, input } = render();

		pick(input, file("huge.png", "image/png", 10_000_000));

		expect(onFile).toHaveBeenCalledTimes(1);
	});
});

describe("AppImageDropzone — interaction", () => {
	// Re-picking the same file is a real action: an operator picks the wrong
	// one, fixes it on disk, and picks again. A browser leaves the filename in
	// `value`, so without the reset the second pick is not a change and onChange
	// never fires.
	//
	// jsdom refuses to set `value` on a file input, so the assignment is observed
	// through an accessor rather than by reading the value back. Installed after
	// the change event, because replacing the descriptor earlier breaks React's
	// input value tracker and onChange stops firing at all.
	it("resets the input value so the same file can be picked again", () => {
		const { onFile, input } = render();
		const assignments: string[] = [];
		Object.defineProperty(input, "value", {
			configurable: true,
			get: () => assignments.at(-1) ?? "",
			set: (next: string) => {
				assignments.push(next);
			},
		});

		pick(input, file("a.png", "image/png"));

		expect(onFile).toHaveBeenCalledTimes(1);
		expect(assignments).toContain("");
	});

	it("takes the first file from a drop", () => {
		const { onFile } = render();

		fireEvent.drop(screen.getByRole("button"), {
			dataTransfer: { files: [file("a.png", "image/png")] },
		});

		expect(onFile).toHaveBeenCalledTimes(1);
	});

	it("validates a dropped file the same way as a picked one", () => {
		const { onFile, onError } = render({ accept: "image/*" });

		fireEvent.drop(screen.getByRole("button"), {
			dataTransfer: { files: [file("a.pdf", "application/pdf")] },
		});

		expect(onFile).not.toHaveBeenCalled();
		expect(onError).toHaveBeenCalledWith("Wrong type");
	});

	it.each([
		["disabled", { disabled: true }],
		["pending", { pending: true }],
	])("ignores a drop while %s", (_label, props) => {
		const { onFile, onError } = render(props);

		fireEvent.drop(screen.getByRole("button"), {
			dataTransfer: { files: [file("a.png", "image/png")] },
		});

		expect(onFile).not.toHaveBeenCalled();
		expect(onError).not.toHaveBeenCalled();
	});

	// A real <button>, so the dialog opens on Enter and Space too — the file
	// input itself is sr-only and never reachable directly.
	it("opens the file dialog from the keyboard", async () => {
		const user = userEvent.setup();
		const { input, button } = render();
		const click = vi.spyOn(input, "click");

		button.focus();
		await user.keyboard("{Enter}");

		expect(click).toHaveBeenCalled();
	});

	it("does not open the dialog while inert", async () => {
		const { input, button } = render({ disabled: true });
		const click = vi.spyOn(input, "click");

		await userEvent.click(button, { pointerEventsCheck: 0 });

		expect(click).not.toHaveBeenCalled();
	});
});
