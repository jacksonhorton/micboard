<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import * as Form from "$lib/components/ui/form/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	type FormFieldType =
		| "text"
		| "email"
		| "password"
		| "number"
		| "date"
		| "datetime-local"
		| "time"
		| "tel"
		| "url"
		| "search"
		| "textarea"
		| "select"
		| "checkbox"
		| "hidden";

	type SelectOption = {
		value: string;
		label: string;
	};

	export type FormDialogField = {
		id: string;
		name?: string;
		label?: string;
		type?: FormFieldType;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		value?: string | number | boolean;
		min?: string | number;
		max?: string | number;
		step?: string | number;
		autocomplete?: string;
		options?: SelectOption[];
	};

	type Props = {
		title: string;
		description?: string;
		action: string;
		fields: FormDialogField[];
		cancelTitle?: string;
		submitTitle?: string;
		triggerTitle?: string;
		method?: "get" | "post";
		enctype?: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";
		open?: boolean;
		showTrigger?: boolean;
		resetOnOpen?: boolean;
	};

	let {
		title,
		description,
		action,
		fields,
		cancelTitle = "Cancel",
		submitTitle = "Submit",
		triggerTitle = "Open Form",
		method = "post",
		enctype = "application/x-www-form-urlencoded",
		open = $bindable(false),
		showTrigger = true,
		resetOnOpen = true,
	}: Props = $props();

	let formResetKey = $state(0);
	let wasOpen = $state(false);

	$effect(() => {
		if (resetOnOpen && open && !wasOpen) {
			formResetKey += 1;
		}

		wasOpen = open;
	});

	function normalizeType(type: FormDialogField["type"]): FormFieldType {
		return type ?? "text";
	}

	function resolveName(field: FormDialogField): string {
		// Standardize posted key names by using each field id.
		return field.id;
	}

	function resolveLabel(field: FormDialogField): string {
		if (field.label?.trim()) {
			return field.label;
		}

		if (field.name?.trim()) {
			return field.name
				.replace(/[_-]+/g, " ")
				.replace(/\b\w/g, (char) => char.toUpperCase());
		}

		return field.id
			.replace(/[_-]+/g, " ")
			.replace(/\b\w/g, (char) => char.toUpperCase());
	}
</script>

<Dialog.Root bind:open>
	{#if showTrigger}
		<Dialog.Trigger>
			{#snippet child({ props })}
				<Button {...props}>{triggerTitle}</Button>
			{/snippet}
		</Dialog.Trigger>
	{/if}
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{title}</Dialog.Title>
			{#if description}
				<Dialog.Description>{description}</Dialog.Description>
			{/if}
		</Dialog.Header>

		{#key formResetKey}
			<form class="space-y-4" {method} {action} {enctype}>
				{#each fields as field (field.id)}
					{@const fieldType = normalizeType(field.type)}
					{@const fieldName = resolveName(field)}
					{@const fieldLabel = resolveLabel(field)}

					{#if fieldType === "hidden"}
						<input
							id={field.id}
							name={fieldName}
							type="hidden"
							value={field.value === undefined ? "" : String(field.value)}
						/>
					{:else if fieldType === "textarea"}
						<div class="grid gap-2">
							<Form.Label for={field.id}>{fieldLabel}</Form.Label>
							<textarea
								id={field.id}
								name={fieldName}
								class="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
								placeholder={field.placeholder}
								required={field.required}
								disabled={field.disabled}
								autocomplete={field.autocomplete}
							>{field.value === undefined ? "" : String(field.value)}</textarea>
						</div>
					{:else if fieldType === "select"}
						<div class="grid gap-2">
							<Form.Label for={field.id}>{fieldLabel}</Form.Label>
							<select
								id={field.id}
								name={fieldName}
								class="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
								required={field.required}
								disabled={field.disabled}
							>
								{#each field.options ?? [] as option (option.value)}
									<option
										value={option.value}
										selected={String(field.value ?? "") === option.value}
									>
										{option.label}
									</option>
								{/each}
							</select>
						</div>
					{:else if fieldType === "checkbox"}
						<div class="flex items-center gap-2 pt-1">
							<input
								id={field.id}
								name={fieldName}
								type="checkbox"
								value="true"
								checked={Boolean(field.value)}
								required={field.required}
								disabled={field.disabled}
								class="border-input focus-visible:ring-ring/50 size-4 rounded border focus-visible:ring-2"
							/>
							<Form.Label for={field.id}>{fieldLabel}</Form.Label>
						</div>
					{:else}
						<div class="grid gap-2">
							<Form.Label for={field.id}>{fieldLabel}</Form.Label>
							<Input
								id={field.id}
								name={fieldName}
								type={fieldType}
								placeholder={field.placeholder}
								required={field.required}
								disabled={field.disabled}
								min={field.min}
								max={field.max}
								step={field.step}
								autocomplete={field.autocomplete}
								value={field.value === undefined ? "" : String(field.value)}
							/>
						</div>
					{/if}
				{/each}

				<Dialog.Footer class="pt-2">
					<Dialog.Close>
						{#snippet child({ props })}
							<Button variant="outline" type="button" {...props}>{cancelTitle}</Button>
						{/snippet}
					</Dialog.Close>
					<Button type="submit">{submitTitle}</Button>
				</Dialog.Footer>
			</form>
		{/key}
	</Dialog.Content>
</Dialog.Root>
