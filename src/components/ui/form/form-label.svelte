<script lang="ts">
	import { cn, type WithElementRef } from "$lib/utils.js";
	import type { LabelAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<LabelAttributes, HTMLLabelElement> = $props();
</script>

<label
	bind:this={ref}
	data-slot="form-label"
	class={cn("text-sm font-medium leading-none", className)}
	{...restProps}
>
	{@render children?.()}
</label>
