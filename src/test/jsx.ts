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

export const propExpression = (
	props: string,
	name: string,
): string | undefined => {
	const at = props.search(new RegExp(`\\b${name}=\\{`));
	if (at === -1) return undefined;
	let depth = 0;
	const start = props.indexOf("{", at);
	for (let i = start; i < props.length; i++) {
		const c = props[i];
		if (c === "{") depth += 1;
		else if (c === "}") {
			depth -= 1;
			if (depth === 0) return props.slice(start + 1, i);
		}
	}
	return props.slice(start + 1);
};
