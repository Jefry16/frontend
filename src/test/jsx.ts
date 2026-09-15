/**
 * The props text of every `<Tag …>` opening tag in a source file, for the
 * gates that read what a page passes to a shared component. Brace depth is
 * tracked so a `>` inside a JSX prop does not end the tag early.
 */
export const openingTagProps = (source: string, tag: string): string[] => {
	const open = `<${tag}`;
	const found: string[] = [];
	let from = source.indexOf(open);
	while (from !== -1) {
		const next = source[from + open.length];
		if (next && /[A-Za-z0-9]/.test(next)) {
			from = source.indexOf(open, from + open.length);
			continue;
		}
		let depth = 0;
		let i = from + open.length;
		for (; i < source.length; i++) {
			const c = source[i];
			if (c === "{") depth += 1;
			else if (c === "}") depth -= 1;
			else if (c === ">" && depth === 0) break;
		}
		found.push(source.slice(from + open.length, i));
		from = source.indexOf(open, i);
	}
	return found;
};
