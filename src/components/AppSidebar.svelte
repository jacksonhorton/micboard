<script lang="ts">
	import { onMount } from "svelte";
	import FormDialog, { type FormDialogField } from "./FormDialog.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import CalendarIcon from "@lucide/svelte/icons/calendar";
	import CheckIcon from "@lucide/svelte/icons/check";
	import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
	import GalleryVerticalEndIcon from "@lucide/svelte/icons/gallery-vertical-end";
	import HouseIcon from "@lucide/svelte/icons/house";
	import InboxIcon from "@lucide/svelte/icons/inbox";
	import MoonIcon from "@lucide/svelte/icons/moon";
	import SearchIcon from "@lucide/svelte/icons/search";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import SunIcon from "@lucide/svelte/icons/sun";
	import PlusIcon from "@lucide/svelte/icons/plus";

	type Project = {
		id: string;
		name: string;
	};

	type AppSidebarProps = {
		userName?: string;
		projects?: Project[];
		defaultProjectId?: string;
	};

	const fallbackProjects: Project[] = [
		{ id: "micboard", name: "Micboard" },
		{ id: "voice-studio", name: "Voice Studio" },
		{ id: "meeting-notes", name: "Meeting Notes" },
	];

	let {
		userName = "User",
		projects = fallbackProjects,
		defaultProjectId = "",
	}: AppSidebarProps = $props();

	const availableProjects = $derived(projects.length > 0 ? projects : fallbackProjects);

	let selectedProjectId = $state("");

	$effect(() => {
		const hasDefault = availableProjects.some((project) => project.id === defaultProjectId);
		const hasSelection = availableProjects.some((project) => project.id === selectedProjectId);

		if (!hasSelection) {
			selectedProjectId = hasDefault
				? defaultProjectId
				: (availableProjects[0]?.id ?? "");
		}
	});

	const selectedProject = $derived(
		availableProjects.find((project) => project.id === selectedProjectId) ?? availableProjects[0]
	);

	const logoutUrl = "/api/auth/logout?returnTo=/auth";
	const logoutFormId = "sidebar-logout-form";
	const newProjectUrl = "/api/projects";
	const dashboardThemeKey = "dashboard-theme";
	let showNewProjectDialog = $state(false);

	const newProjectFields: FormDialogField[] = [
		{
			id: "project_name",
			name: "Project Name",
			type: "text",
			placeholder: "My Project",
			required: true,
			autocomplete: "off",
		},
		{
			id: "project_description",
			name: "Project Description",
			type: "textarea",
			placeholder: "Short description",
		},
		// {
		// 	id: "project_visibility",
		// 	name: "Visibility",
		// 	type: "select",
		// 	value: "private",
		// 	options: [
		// 		{ value: "private", label: "Private" },
		// 		{ value: "public", label: "Public" },
		// 	],
		// },
	];

	let isDarkMode = $state(false);

	function applyDashboardTheme(dark: boolean) {
		document.documentElement.classList.toggle("dashboard-dark", dark);
	}

	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
		applyDashboardTheme(isDarkMode);
		localStorage.setItem(dashboardThemeKey, isDarkMode ? "dark" : "light");
	}

	onMount(() => {
		const storedTheme = localStorage.getItem(dashboardThemeKey);
		isDarkMode =
			storedTheme === "dark" ||
			(storedTheme === null && document.documentElement.classList.contains("dashboard-dark"));
		applyDashboardTheme(isDarkMode);
	});

	const navItems = [
		{
			title: "Home",
			url: "/dashboard",
			icon: HouseIcon,
		},
		{
			title: "Inbox",
			url: "#",
			icon: InboxIcon,
		},
		{
			title: "Calendar",
			url: "#",
			icon: CalendarIcon,
		},
		{
			title: "Search",
			url: "#",
			icon: SearchIcon,
		},
	];
</script>

<Sidebar.Provider class="w-auto shrink-0">
	<Sidebar.Root>
		<Sidebar.Header>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton
									size="lg"
									class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									{...props}
								>
									<div
										class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
									>
										<GalleryVerticalEndIcon class="size-4" />
									</div>
									<div class="flex flex-col gap-0.5 leading-none">
										<span class="font-semibold">Projects</span>
										<span>{selectedProject?.name ?? "No projects"}</span>
									</div>
									<ChevronsUpDownIcon class="ms-auto" />
								</Sidebar.MenuButton>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							class="w-[var(--bits-dropdown-menu-anchor-width)] min-w-56"
							align="start"
						>
							{#each availableProjects as project (project.id)}
								<DropdownMenu.Item onSelect={() => (selectedProjectId = project.id)}>
									{project.name}
									{#if project.id === selectedProjectId}
										<CheckIcon class="ms-auto" />
									{/if}
								</DropdownMenu.Item>
							{/each}
							<DropdownMenu.Separator />
							<DropdownMenu.Item onSelect={() => (showNewProjectDialog = true)}>
								<PlusIcon class="inline size-4 align-middle" />
								New Project
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Header>

		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each navItems as item (item.title)}
							<Sidebar.MenuItem>
								<Sidebar.MenuButton>
									{#snippet child({ props })}
										<a href={item.url} {...props}>
											<item.icon class="text-sidebar-primary" />
											<span class="text-sidebar-primary">{item.title}</span>
										</a>
									{/snippet}
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>

		<Sidebar.Footer>
			<Sidebar.Menu>
				<Sidebar.MenuItem>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Sidebar.MenuButton
									class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									{...props}
								>
									<SettingsIcon />
									<span>Settings</span>
									<ChevronsUpDownIcon class="ms-auto" />
								</Sidebar.MenuButton>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							side="top"
							align="start"
							class="w-[var(--bits-dropdown-menu-anchor-width)] min-w-48"
						>
							<p class="px-2 py-1.5 text-sm font-semibold">Profile</p>
							<p class="px-2 py-1.5 text-sm text-muted-foreground">{userName}</p>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onSelect={toggleDarkMode}>
								{#if isDarkMode}
									<SunIcon />
									Light mode
								{:else}
									<MoonIcon />
									Dark mode
								{/if}
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<form id={logoutFormId} method="post" action={logoutUrl}></form>
							<DropdownMenu.Item>
								{#snippet child({ props })}
									<button class="w-full" type="submit" form={logoutFormId} {...props}>Log out</button>
								{/snippet}
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</Sidebar.MenuItem>
			</Sidebar.Menu>
		</Sidebar.Footer>
	</Sidebar.Root>

	<FormDialog
		bind:open={showNewProjectDialog}
		showTrigger={false}
		title="Create New Project"
		description="Add a project to your workspace."
		action={newProjectUrl}
		fields={newProjectFields}
		cancelTitle="Cancel"
		submitTitle="Create Project"
	/>
</Sidebar.Provider>
