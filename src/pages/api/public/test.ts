import type { APIRoute } from "astro";
import { getServerEnv } from "../../../lib/server-env";


export const GET: APIRoute = async ({ locals }) => {
	const keys: Record<string, string> = {};

	keys["SITE_URL"] = getServerEnv(locals, "SITE_URL") ?? "NONE FOUND";
	keys["ALLOW_HTTP_LOGINS"] = getServerEnv(locals, "ALLOW_HTTP_LOGINS") ?? "NONE FOUND";
	keys["JWT_SECRET_SET"] = getServerEnv(locals, "JWT_SECRET") ? "true" : "false";
	keys["OAUTH_CLIENT_ID_SET"] = getServerEnv(locals, "OAUTH_CLIENT_ID") ? "true" : "false";
	keys["OAUTH_CLIENT_SECRET_SET"] = getServerEnv(locals, "OAUTH_CLIENT_SECRET") ? "true" : "false";

	return new Response(JSON.stringify(keys), {
		status: 200,
		headers: {
			"content-type": "application/json",
		},
	});
};
