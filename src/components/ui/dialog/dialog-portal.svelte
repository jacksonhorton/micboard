<script lang="ts">
	import { Dialog as DialogPrimitive } from "bits-ui";

	let { ref = $bindable(null), ...restProps }: DialogPrimitive.PortalProps = $props();
</script>

<DialogPrimitive.Portal bind:ref data-slot="dialog-portal" {...restProps} />
