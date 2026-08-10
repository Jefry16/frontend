import { act, renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { MEDIA_ACCEPT, useMediaUpload } from "./use-media-upload";

const { toastMock } = vi.hoisted(() => ({
	toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";
const OP = "op-1";
const URL_ = `${API}/tour-operators/${OP}/media`;

const file = (name: string, type: string, bytes = 10) => {
	const f = new File(["x"], name, { type });
	Object.defineProperty(f, "size", { value: bytes });
	return f;
};

const accepting = (posted: ReturnType<typeof vi.fn>) =>
	http.post(URL_, () => {
		posted();
		return new HttpResponse(null, { status: 201 });
	});

const render = () => {
	const { Wrapper } = wrapperWithProviders();
	return renderHook(() => useMediaUpload(OP), { wrapper: Wrapper });
};

const upload = async (
	result: { current: { upload: (f: File[]) => void } },
	files: File[],
) => {
	await act(async () => {
		result.current.upload(files);
	});
};

/**
 * The gate in front of the network — a file the backend would reject never
 * leaves the browser.
 *
 * What is deliberately NOT covered, and why. A multipart `authApi.post` never
 * resolves under MSW + jsdom: the handler runs, the response never reaches
 * axios, and the mutation sits pending forever. Measured against this same
 * client — JSON resolves in ~20ms, the identical call with FormData times out.
 * So `onSuccess` cannot run here, and the partial-failure behaviour
 * (`Promise.allSettled` keeping the successes, both toasts on a mixed result,
 * invalidating only when something landed) has no test.
 *
 * The requests themselves DO arrive, so *what a file causes to be sent* is
 * assertable, and that is where these stop. The same limit applies to every
 * other multipart hook — user avatar, brand images, the SEO og:image.
 */
describe("useMediaUpload", () => {
	beforeEach(() => {
		toastMock.success.mockReset();
		toastMock.error.mockReset();
	});

	it("sends one request per valid file", async () => {
		const posted = vi.fn();
		server.use(accepting(posted));
		const { result } = render();

		await upload(result, [
			file("a.png", "image/png"),
			file("b.pdf", "application/pdf"),
		]);

		await waitFor(() => expect(posted).toHaveBeenCalledTimes(2));
	});

	// Rejected before the network, so a bad file never reaches a 415 or a 413.
	it.each([
		["an unaccepted type", "a.gif", "image/gif", 10],
		["a file over 25 MB", "big.png", "image/png", 25 * 1024 * 1024 + 1],
	])("never sends %s", async (_label, name, type, size) => {
		const posted = vi.fn();
		server.use(accepting(posted));
		const { result } = render();

		await upload(result, [file(name, type, size)]);

		expect(posted).not.toHaveBeenCalled();
		expect(toastMock.error).toHaveBeenCalled();
	});

	it("accepts a file exactly at the limit", async () => {
		const posted = vi.fn();
		server.use(accepting(posted));
		const { result } = render();

		await upload(result, [file("edge.png", "image/png", 25 * 1024 * 1024)]);

		await waitFor(() => expect(posted).toHaveBeenCalledTimes(1));
	});

	// The common case is a dragged folder. Refusing the whole batch because one
	// file is wrong would make the operator re-pick the ones that were fine.
	it("uploads the valid files from a mixed selection and names the rest", async () => {
		const posted = vi.fn();
		server.use(accepting(posted));
		const { result } = render();

		await upload(result, [
			file("good.png", "image/png"),
			file("bad.gif", "image/gif"),
		]);

		await waitFor(() => expect(posted).toHaveBeenCalledTimes(1));
		expect(toastMock.error).toHaveBeenCalledWith(
			expect.stringContaining("bad.gif"),
		);
	});

	it("sends nothing when every file is rejected", async () => {
		const posted = vi.fn();
		server.use(accepting(posted));
		const { result } = render();

		await upload(result, [file("a.gif", "image/gif")]);

		expect(posted).not.toHaveBeenCalled();
	});

	// The picker's `accept` attribute is built from the same set the hook
	// validates against, so the dialog cannot offer a type the hook refuses.
	it("exports an accept string covering exactly the allowed types", () => {
		expect(MEDIA_ACCEPT.split(",").sort()).toEqual([
			"application/pdf",
			"image/jpeg",
			"image/png",
			"image/webp",
		]);
	});
});
