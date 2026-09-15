import { act, renderHook, screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "#/test/server";
import { wrapperWithProviders } from "#/test/test-utils";
import { MEDIA_ACCEPT, useMediaUpload } from "./use-media-upload";

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

describe("useMediaUpload", () => {
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

	it.each([
		["an unaccepted type", "a.gif", "image/gif", 10],
		["a file over 25 MB", "big.png", "image/png", 25 * 1024 * 1024 + 1],
	])("never sends %s", async (_label, name, type, size) => {
		const posted = vi.fn();
		server.use(accepting(posted));
		const { result } = render();

		await upload(result, [file(name, type, size)]);

		expect(posted).not.toHaveBeenCalled();
		expect(await screen.findByText(new RegExp(name))).toBeInTheDocument();
	});

	it("accepts a file exactly at the limit", async () => {
		const posted = vi.fn();
		server.use(accepting(posted));
		const { result } = render();

		await upload(result, [file("edge.png", "image/png", 25 * 1024 * 1024)]);

		await waitFor(() => expect(posted).toHaveBeenCalledTimes(1));
	});

	it("uploads the valid files from a mixed selection and names the rest", async () => {
		const posted = vi.fn();
		server.use(accepting(posted));
		const { result } = render();

		await upload(result, [
			file("good.png", "image/png"),
			file("bad.gif", "image/gif"),
		]);

		await waitFor(() => expect(posted).toHaveBeenCalledTimes(1));
		expect(await screen.findByText(/bad\.gif/)).toBeInTheDocument();
	});

	it("sends nothing when every file is rejected", async () => {
		const posted = vi.fn();
		server.use(accepting(posted));
		const { result } = render();

		await upload(result, [file("a.gif", "image/gif")]);

		expect(posted).not.toHaveBeenCalled();
	});

	it("exports an accept string covering exactly the allowed types", () => {
		expect(MEDIA_ACCEPT.split(",").sort()).toEqual([
			"application/pdf",
			"image/jpeg",
			"image/png",
			"image/webp",
		]);
	});
});
