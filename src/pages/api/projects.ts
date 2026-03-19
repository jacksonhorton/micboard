import type { APIRoute } from "astro";
import { createDb } from "../../db/db";
import { createProject } from "../../db/projects";

type CreateProjectPayload = {
	project_name?: unknown;
	project_description?: unknown;
};

function getString(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}

function validateProjectInput(payload: CreateProjectPayload) {
	const projectName = getString(payload.project_name);
	const projectDescriptionRaw = getString(payload.project_description);
	const projectDescription = projectDescriptionRaw.length > 0 ? projectDescriptionRaw : null;
	const errors: string[] = [];

	if (projectName.length < 1) {
		errors.push("project_name is required");
	}
	if (projectName.length > 120) {
		errors.push("project_name must be 120 characters or fewer");
	}
	if (projectDescription && projectDescription.length > 2000) {
		errors.push("project_description must be 2000 characters or fewer");
	}

	return {
		errors,
		projectName,
		projectDescription,
	};
}

async function parsePayload(request: Request): Promise<CreateProjectPayload> {
	const contentType = request.headers.get("content-type") ?? "";

	if (contentType.includes("application/json")) {
		try {
			const json = (await request.json()) as CreateProjectPayload;
			return json ?? {};
		} catch {
			return {};
		}
	}

	const formData = await request.formData();
	return {
		project_name: formData.get("project_name"),
		project_description: formData.get("project_description"),
	};
}

function wantsHtmlResponse(request: Request): boolean {
	const accept = request.headers.get("accept") ?? "";
	return accept.includes("text/html");
}

function json(data: unknown, status: number): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
		},
	});
}

export const POST: APIRoute = async ({ request, locals }) => {
	const userId = locals.auth?.userId;
	if (!userId) {
		return json({ error: "Unauthorized" }, 401);
	}

	const d1 = locals.runtime?.env?.DB;
	if (!d1) {
		return json({ error: "Missing DB binding" }, 500);
	}

	const payload = await parsePayload(request);
	const { errors, projectName, projectDescription } = validateProjectInput(payload);
	if (errors.length > 0) {
		if (wantsHtmlResponse(request)) {
			return new Response(null, {
				status: 303,
				headers: {
					Location: `/dashboard?projectError=${encodeURIComponent(errors[0])}`,
				},
			});
		}

		return json({ error: "Validation failed", details: errors }, 400);
	}

	console.log(projectName);
	console.log(projectDescription);

	const db = createDb(d1);

	const project = await createProject(db.$client, {
		userId,
		name: projectName,
		description: projectDescription,
	});

	if (wantsHtmlResponse(request)) {
		return new Response(null, {
			status: 303,
			headers: {
				Location: `/dashboard?projectCreated=${encodeURIComponent(project.id)}`,
			},
		});
	}

	return json({ data: project }, 201);
};
