import { describe, expect, it } from "vitest";
import { brandColorsSchema, brandSocialLinksSchema } from "./brand";

const colors = (background: string, foreground = "#ffffff") =>
	brandColorsSchema.safeParse({
		primary: [{ background, foreground }],
		secondary: [],
	});

const links = (rows: { platform: string; url: string }[]) =>
	brandSocialLinksSchema.safeParse({ socialLinks: rows });

describe("brandColorsSchema", () => {
	it("accepts a six-digit hex", () => {
		expect(colors("#0b3d5c").success).toBe(true);
	});

	// The backend lower-cases before its CHECK; doing it here too means the box
	// shows what will be stored rather than reading back different after a save.
	it("lower-cases what the operator pasted from a design tool", () => {
		const result = colors("#0B3D5C");
		expect(result.success && result.data.primary[0].background).toBe("#0b3d5c");
	});

	// HexColor rejects shorthand rather than expanding it: the column is
	// VARCHAR(7) and a value that round-trips differently is worse than a refusal.
	it("rejects three-digit shorthand rather than expanding it", () => {
		expect(colors("#abc").success).toBe(false);
	});

	it.each([
		"0b3d5c",
		"#0b3d5",
		"#0b3d5cc",
		"#gggggg",
		"rebeccapurple",
		"",
	])("rejects %o", (value) => {
		expect(colors(value).success).toBe(false);
	});

	// Both halves are colours — a valid background must not carry a bad
	// foreground through, or the pair renders unreadable text.
	it("checks the foreground too, not just the background", () => {
		expect(colors("#0b3d5c", "#fff").success).toBe(false);
	});

	it("accepts an empty palette — that is how an operator clears it", () => {
		expect(
			brandColorsSchema.safeParse({ primary: [], secondary: [] }).success,
		).toBe(true);
	});
});

describe("brandSocialLinksSchema", () => {
	it("accepts one link per platform", () => {
		expect(
			links([
				{ platform: "INSTAGRAM", url: "https://instagram.com/acme" },
				{ platform: "WHATSAPP", url: "https://wa.me/18095551234" },
			]).success,
		).toBe(true);
	});

	// The table's key is (operator, platform). The form filters taken platforms
	// out, so this catches only what the UI cannot — but the backend 422s either
	// way, and failing client-side names the problem beside the field.
	it("rejects two links for the same platform", () => {
		expect(
			links([
				{ platform: "INSTAGRAM", url: "https://instagram.com/a" },
				{ platform: "INSTAGRAM", url: "https://instagram.com/b" },
			]).success,
		).toBe(false);
	});

	// Restricted to http/https on purpose: the value is rendered as a link on a
	// public page, and `javascript:` is not a link.
	it.each([
		"javascript:alert(1)",
		"data:text/html,x",
		"ftp://x.test",
		"acme",
	])("rejects %o", (url) => {
		expect(links([{ platform: "INSTAGRAM", url }]).success).toBe(false);
	});

	it("rejects a platform outside the backend's closed list", () => {
		// V10 shipped Shopify's nine; V11 replaced Snapchat/Tumblr/Vimeo with
		// TripAdvisor and WhatsApp. Picking off the old list is a 422.
		expect(
			links([{ platform: "SNAPCHAT", url: "https://snapchat.com/acme" }])
				.success,
		).toBe(false);
	});

	it("rejects a URL past the 500-character column", () => {
		const url = `https://instagram.com/${"a".repeat(500)}`;
		expect(links([{ platform: "INSTAGRAM", url }]).success).toBe(false);
	});

	it("accepts an empty list — that is how an operator clears them", () => {
		expect(links([]).success).toBe(true);
	});
});
