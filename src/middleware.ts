import { defineMiddleware } from "astro/middleware";
import { verifySessionToken } from "./lib/auth-utils";
import { getServerEnv } from "./lib/server-env";

export const onRequest = defineMiddleware(async (context, next) => {
	const pathname = context.url.pathname;

	// Allow public pages and login/public OAuth APIs without authentication.
	const isPublicPage = !pathname.startsWith("/dashboard") && !pathname.startsWith("/api");
	const isPublicApi =
		pathname.startsWith("/api/login") ||
		pathname.startsWith("/api/public/") ||
		pathname.startsWith("/api/auth/google/start") ||
		pathname.startsWith("/api/auth/google/callback") ||
		pathname.startsWith("/api/auth/logout");

	if (isPublicPage || isPublicApi) {
		return next();
	}

	const jwtSecret = getServerEnv(context.locals, "JWT_SECRET") ?? getServerEnv(context.locals, "PUBLIC_JWT_SECRET");
	const token = context.cookies.get("token")?.value;

	if (token && jwtSecret) {
		const session = verifySessionToken(token, jwtSecret);
		if (session) {
			context.locals.auth = {
				userId: session.sub,
				email: session.email,
				name: session.name,
				picture: session.picture,
			};
			return next();
		}
	}

	// APIs return 401, pages redirect to auth.
	if (pathname.startsWith("/api")) {
		return new Response("Unauthorized", {
			status: 401,
		});
	}

	return new Response(null, {
		status: 302,
		headers: {
			Location: "/auth",
		},
	});
});
