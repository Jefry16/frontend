// A red asterisk marking a required form field. aria-hidden — requiredness is
// conveyed to assistive tech via the input's aria-required, not this glyph.
export const RequiredMark = () => (
	<span aria-hidden="true" className="text-destructive">
		{" *"}
	</span>
);
