import type { APIRoute } from "astro";
import { getServerEnv } from "../../../lib/server-env";

const SESSION_COOKIE_NAME = "token";
const OAUTH_STATE_COOKIE_NAME = "google_oauth_state";

function getSiteUrl(locals: App.Locals, request: Request): string {
	return getServerEnv(locals, "SITE_URL") ?? getServerEnv(locals, "PUBLIC_SITE_URL") ?? new URL(request.url).origin;
}

function getRedirectTarget(url: URL): string {
	const returnTo = url.searchParams.get("returnTo");
	if (!returnTo) {
		return "/auth";
	}

	// Only allow same-origin relative paths.
	if (returnTo.startsWith("/") && !returnTo.startsWith("//")) {
		return returnTo;
	}

	return "/auth";
}

const clearAuthCookies: APIRoute = async ({ cookies, locals, request, url }) => {
	const siteUrl = getSiteUrl(locals, request);
	const allowHttpLogins = (getServerEnv(locals, "ALLOW_HTTP_LOGINS") ?? "false").toLowerCase() === "true";
	const secureCookies = new URL(siteUrl).protocol === "https:" && !allowHttpLogins;

	cookies.delete(SESSION_COOKIE_NAME, {
		path: "/",
		secure: secureCookies,
		sameSite: "lax",
	});
	cookies.delete(OAUTH_STATE_COOKIE_NAME, {
		path: "/",
		secure: secureCookies,
		sameSite: "lax",
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: getRedirectTarget(url),
		},
	});
};

export const GET = clearAuthCookies;
export const POST = clearAuthCookies;
