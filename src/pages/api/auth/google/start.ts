import type { APIRoute } from "astro";
import { getServerEnv } from "../../../../lib/server-env";

const STATE_COOKIE_NAME = "google_oauth_state";
const STATE_COOKIE_MAX_AGE = 60 * 10;

function getSiteUrl(locals: App.Locals, request: Request): string {
	return getServerEnv(locals, "SITE_URL") ?? getServerEnv(locals, "PUBLIC_SITE_URL") ?? new URL(request.url).origin;
}

export const GET: APIRoute = async ({ cookies, locals, request }) => {
	const clientId =
		getServerEnv(locals, "GOOGLE_CLIENT_ID") ??
		getServerEnv(locals, "OAUTH_CLIENT_ID") ??
		getServerEnv(locals, "PUBLIC_OAUTH_CLIENT_ID");
	if (!clientId) {
		return new Response("Missing GOOGLE_CLIENT_ID, OAUTH_CLIENT_ID, or PUBLIC_OAUTH_CLIENT_ID", { status: 500 });
	}

	if (!clientId.endsWith(".apps.googleusercontent.com")) {
		return new Response("Invalid GOOGLE_CLIENT_ID format", { status: 500 });
	}

	const siteUrl = getSiteUrl(locals, request);
	const secureCookies = new URL(siteUrl).protocol === "https:";
	const state = crypto.randomUUID();
	const redirectUri = new URL("/api/auth/google/callback", siteUrl).toString();

	cookies.set(STATE_COOKIE_NAME, state, {
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secure: secureCookies,
		maxAge: STATE_COOKIE_MAX_AGE,
	});

	const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
	googleAuthUrl.searchParams.set("client_id", clientId);
	googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
	googleAuthUrl.searchParams.set("response_type", "code");
	googleAuthUrl.searchParams.set("scope", "openid email profile");
	googleAuthUrl.searchParams.set("state", state);
	googleAuthUrl.searchParams.set("include_granted_scopes", "true");

	return new Response(null, {
		status: 302,
		headers: {
			Location: googleAuthUrl.toString(),
		},
	});
};
