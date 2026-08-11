/**
 * Drives the real admin against a real backend and fails on anything the unit
 * suite cannot see.
 *
 * It exists because 304 passing tests did not notice that every experience save
 * was returning 422: the suite asserts the payload the form *builds*, and the
 * form was perfectly self-consistent while disagreeing with the API. Nothing
 * that stubs the network can catch that. This does, in about a minute.
 *
 * Not in CI — it needs the backend, Postgres and the dev seed. Run it after any
 * change to a request or response shape, on either side of the repo boundary.
 *
 *   pnpm smoke                  # every flow
 *   pnpm smoke experiences      # only flows whose name contains "experiences"
 */
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const APP = process.env.SMOKE_APP ?? "http://localhost:3000";
const API = process.env.SMOKE_API ?? "http://localhost:8080/api";
const EMAIL = process.env.SMOKE_EMAIL ?? "admin@vointika.test";
const PASSWORD = process.env.SMOKE_PASSWORD ?? "password";
const FILTER = process.argv[2];

const problems = [];
const note = (flow, what) => problems.push(`${flow}: ${what}`);

/** Requests the admin makes on a cold load before a session exists. */
const EXPECTED_FAILURES = [/\/auth\/refresh$/];

const preflight = async () => {
	for (const [name, url] of [
		["dev server", APP],
		["backend", `${API}/auth/profile`],
	]) {
		try {
			await fetch(url, { signal: AbortSignal.timeout(4000) });
		} catch {
			console.error(`\n  ${name} is not reachable at ${url}`);
			console.error("  Start it, then re-run. This script needs both.\n");
			process.exit(2);
		}
	}
};

const TOKEN_CACHE = ".smoke-token";

/**
 * A token for the discovery calls, cached between runs.
 *
 * Login is throttled per EMAIL — 20 attempts per 15 minutes, successes
 * included — and reports as "Invalid credentials" whether it is the password or
 * the throttle, deliberately, so it cannot be used as a lockout oracle. Signing
 * in twice per run (here and in the browser) halves how often the script can be
 * run before it locks itself out of the account it is testing with.
 *
 * So this one is cached and the browser's is not: signing in through the UI is
 * a flow worth exercising every run, and reading an id is not.
 */
const signIn = async () => {
	const res = await fetch(`${API}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
	});
	if (res.status === 401) {
		console.error(`\n  Cannot sign in as ${EMAIL} (401).`);
		console.error(
			"  Most likely the per-email login throttle: 20 attempts per",
		);
		console.error(
			"  15 minutes, successes counted, reported as bad credentials.",
		);
		console.error(
			"  Wait a few minutes, or set SMOKE_EMAIL to another seeded user.\n",
		);
		process.exit(2);
	}
	if (!res.ok) {
		console.error(`\n  Cannot sign in as ${EMAIL} (${res.status}).`);
		console.error("  Is the dev seed applied?\n");
		process.exit(2);
	}
	const { accessToken } = await res.json();
	writeFileSync(TOKEN_CACHE, accessToken);
	return accessToken;
};

/** The seeded operator, and one row of each kind to edit. */
const discover = async () => {
	let accessToken = "";
	try {
		accessToken = readFileSync(TOKEN_CACHE, "utf8").trim();
	} catch {
		accessToken = await signIn();
	}
	// A failed lookup is reported, never swallowed. Silently returning an empty
	// list here is how six edit flows disappeared while the run still printed
	// "no errors": a list rejects `?limit=`, the 422 became `{data: []}`, and
	// every flow needing a row was skipped without a word.
	const lookupFailures = [];
	const get = async (path) => {
		const r = await fetch(`${API}${path}`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		if (!r.ok) {
			lookupFailures.push(`${r.status} ${path}`);
			return { data: [] };
		}
		return r.json();
	};
	let profile = await get("/auth/profile");
	if (lookupFailures.length > 0) {
		// The cached token expired or was rejected — spend one attempt, once.
		lookupFailures.length = 0;
		accessToken = await signIn();
		profile = await get("/auth/profile");
	}
	const op = profile.tourOperators?.[0]?.id;
	if (!op) {
		console.error("\n  The seeded admin belongs to no operator.\n");
		process.exit(2);
	}
	// No `?limit=`: a list accepts sort, cursor and filter only, and rejects
	// anything else with a 422 (backend #134). The first page is plenty.
	const first = async (path) => (await get(path)).data?.[0]?.id;
	const refs = {
		op,
		experience: await first(`/tour-operators/${op}/experiences`),
		audience: await first(`/tour-operators/${op}/audiences`),
		pickup: await first(`/tour-operators/${op}/pickup-locations`),
		page: await first(`/tour-operators/${op}/pages`),
		policy: await first(`/tour-operators/${op}/policies`),
	};
	if (lookupFailures.length > 0) {
		console.error("\n  Discovery could not read:");
		for (const f of lookupFailures) console.error(`    ${f}`);
		console.error("  Flows needing those rows would be skipped. Fix first.\n");
		try {
			unlinkSync(TOKEN_CACHE);
		} catch {}
		process.exit(2);
	}
	return refs;
};

/**
 * A flow is a path and, optionally, a save. The save is the point: opening a
 * form proves it renders, submitting it proves the payload is one the API
 * accepts — which is the half that broke.
 */
const flowsFor = (r) => {
	const base = `/tour-operators/${r.op}`;
	const view = (name, path) => ({ name, path });
	const edit = (name, path) => ({ name, path, save: true });
	return [
		view("dashboard", base),
		view("experiences list", `${base}/experiences`),
		r.experience &&
			view("experience detail", `${base}/experiences/${r.experience}`),
		r.experience &&
			edit("experience edit", `${base}/experiences/${r.experience}/edit`),
		view("availability list", `${base}/availability`),
		view("audiences list", `${base}/audiences`),
		r.audience && edit("audience edit", `${base}/audiences/${r.audience}/edit`),
		view("pickup locations list", `${base}/pickup-locations`),
		r.pickup &&
			edit("pickup location edit", `${base}/pickup-locations/${r.pickup}/edit`),
		view("pages list", `${base}/content/pages`),
		r.page && edit("page edit", `${base}/content/pages/${r.page}/edit`),
		view("policies list", `${base}/content/policies`),
		r.policy &&
			edit("policy edit", `${base}/content/policies/${r.policy}/edit`),
		view("media library", `${base}/content/media`),
		view("metafields", `${base}/content/metafields`),
		view("metaobjects", `${base}/content/metaobjects`),
		view("menus", `${base}/content/menus`),
		view("inbox", `${base}/inbox`),
		view("activity", `${base}/activity`),
		view("settings general", `${base}/settings/general`),
		view("settings languages", `${base}/settings/languages`),
		view("settings translations", `${base}/settings/translations`),
		view("settings members", `${base}/settings/members`),
	].filter(Boolean);
};

const run = async () => {
	await preflight();
	const refs = await discover();
	const flows = flowsFor(refs).filter(
		(f) => !FILTER || f.name.includes(FILTER),
	);
	if (flows.length === 0) {
		console.error(`  No flow matches "${FILTER}".`);
		process.exit(2);
	}

	const browser = await chromium.launch({ args: ["--no-sandbox"] });
	const page = await browser.newPage({
		viewport: { width: 1440, height: 1000 },
	});

	// `current` is whichever flow is in progress when the event fires, which is
	// not always the flow that caused it: an error from a query still in flight
	// lands after the next goto. Treat the label as a hint, the message as fact.
	let current = "login";
	page.on("pageerror", (e) =>
		note(current, `threw: ${String(e).slice(0, 400)}`),
	);
	page.on("console", (m) => {
		if (m.type() !== "error") return;
		// "Failed to load resource" is the browser restating a response the
		// listener below already reports, with the status and path attached.
		// Keeping both would double-count every failure and, worse, report the
		// expected ones the path filter is there to drop.
		if (/Failed to load resource/i.test(m.text())) return;
		note(current, `console: ${m.text().slice(0, 400)}`);
	});
	page.on("response", (res) => {
		if (res.status() < 400) return;
		const path = res.url().replace(/^https?:\/\/[^/]+/, "");
		if (EXPECTED_FAILURES.some((re) => re.test(path))) return;
		note(current, `${res.status()} ${res.request().method()} ${path}`);
	});

	await page.goto(`${APP}/auth/login`, { waitUntil: "domcontentloaded" });
	await page.waitForSelector('input[type="email"]', { timeout: 20000 });
	await page.fill('input[type="email"]', EMAIL);
	await page.fill('input[type="password"]', PASSWORD);
	await page.click('button[type="submit"]');
	await page.waitForURL((u) => !u.pathname.startsWith("/auth"), {
		timeout: 25000,
	});

	for (const flow of flows) {
		current = flow.name;
		const before = problems.length;
		await page.goto(`${APP}${flow.path}`, { waitUntil: "domcontentloaded" });
		// The shell paints before the data lands; a 4xx arrives after.
		await page.waitForTimeout(2200);

		if (flow.save) {
			const save = page.getByRole("button", { name: /save|create/i }).first();
			if (await save.count()) {
				await save.click();
				await page.waitForTimeout(2200);
			} else {
				note(flow.name, "no save button found");
			}
		}
		const failed = problems.length > before;
		console.log(`  ${failed ? "✗" : "✓"} ${flow.name}`);
	}

	await browser.close();

	if (problems.length === 0) {
		console.log(`\n  ${flows.length} flows, no errors.\n`);
		return;
	}
	console.log(`\n  ${problems.length} problem(s):\n`);
	for (const p of [...new Set(problems)]) console.log(`    ${p}`);
	console.log();
	process.exit(1);
};

await run();
