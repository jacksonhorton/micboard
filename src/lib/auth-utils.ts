import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
	sub: string;
	email?: string;
	name?: string;
	picture?: string;
	iat: number;
	exp: number;
}

export function createSessionToken(
	payload: Omit<SessionPayload, "iat" | "exp">,
	secret: string,
	ttlSeconds = DEFAULT_TTL_SECONDS,
): string {
	const now = Math.floor(Date.now() / 1000);
	const fullPayload: SessionPayload = {
		...payload,
		iat: now,
		exp: now + ttlSeconds,
	};

	const payloadPart = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
	const signaturePart = createHmac("sha256", secret).update(payloadPart).digest("base64url");
	return `${payloadPart}.${signaturePart}`;
}

export function verifySessionToken(token: string, secret: string): SessionPayload | null {
	const [payloadPart, signaturePart] = token.split(".");
	if (!payloadPart || !signaturePart) {
		return null;
	}

	const expectedSignature = createHmac("sha256", secret).update(payloadPart).digest();

	let actualSignature: Buffer;
	try {
		actualSignature = Buffer.from(signaturePart, "base64url");
	} catch {
		return null;
	}

	if (
		actualSignature.length !== expectedSignature.length ||
		!timingSafeEqual(actualSignature, expectedSignature)
	) {
		return null;
	}

	try {
		const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as SessionPayload;
		if (!payload.sub || typeof payload.exp !== "number") {
			return null;
		}

		const now = Math.floor(Date.now() / 1000);
		if (payload.exp <= now) {
			return null;
		}

		return payload;
	} catch {
		return null;
	}
}
