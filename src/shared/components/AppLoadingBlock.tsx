import { Spinner } from "#/components/ui/spinner";

// A centred spinner for a short swap inside chrome that is already painted —
// a locale tab changing, a card body reloading. COMPONENTS.md §4 calls this the
// Spinner case: no shape to reserve, so there is nothing to draw a skeleton of.
//
// Nine copies of this exact block sat across the translation editors.
export const AppLoadingBlock = () => (
	<div className="flex justify-center py-10">
		<Spinner />
	</div>
);
