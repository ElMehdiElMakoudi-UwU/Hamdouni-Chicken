import { createHmac, timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";

const COOKIE_NAME = "hamdouni_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

// A `Secure` cookie is dropped by browsers when set over plain HTTP. The login
// response still renders (Next reads the just-set cookie in that same request),
// but every following navigation has no session and bounces back to the login
// page. So only mark it Secure when the request actually came in over HTTPS
// (as reported by the reverse proxy). COOKIE_SECURE=true/false forces it.
async function shouldUseSecureCookie(): Promise<boolean> {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  if (process.env.NODE_ENV !== "production") return false;

  const headerStore = await headers();
  const proto = headerStore.get("x-forwarded-proto")?.split(",")[0].trim();
  return proto === "https";
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export async function createAdminSession(adminId: string) {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${adminId}.${expires}`;
  const signature = sign(payload);
  const value = `${payload}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: await shouldUseSecureCookie(),
    sameSite: "lax",
    path: "/",
    expires: new Date(expires),
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<{ adminId: string } | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return null;

  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [adminId, expiresStr, signature] = parts;

  const expected = sign(`${adminId}.${expiresStr}`);
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (
    expectedBuf.length !== signatureBuf.length ||
    !timingSafeEqual(expectedBuf, signatureBuf)
  ) {
    return null;
  }

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;

  return { adminId };
}
