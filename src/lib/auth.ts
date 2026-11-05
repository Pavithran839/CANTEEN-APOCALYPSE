
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "canteen_session";
const SESSION_DURATION = 60 * 60 * 24 * 7;

export interface SessionPayload {
  userId: number;
  name: string;
  role: string;
}

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET is missing or too short.");
  }

  return new TextEncoder().encode(secret);
}

// Create a signed session token
export async function createSession(payload: SessionPayload) {
  return new SignJWT({
    userId: payload.userId,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey());
}

// Verify a session token
export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    if (
      typeof payload.userId !== "number" ||
      typeof payload.name !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Retrieve the currently logged-in user
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySession(token);
}

export { COOKIE_NAME, SESSION_DURATION };
