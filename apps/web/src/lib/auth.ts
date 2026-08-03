import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import crypto from "crypto";
import bcrypt from "bcrypt";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "cambiar-en-produccion-clave-minimo-256-bits-segura"
);

const ALG = "HS256";

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

/**
 * Hashea una contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verifica una contraseña plana contra el hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Genera un Access Token (JWT)
 */
export async function signAccessToken(payload: TokenPayload): Promise<string> {
  const expiry = process.env.JWT_ACCESS_EXPIRY || "7d";
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .sign(JWT_SECRET);
}

/**
 * Verifica un Access Token (JWT)
 */
export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Genera y almacena un Refresh Token (Opaco seguro)
 */
export async function createRefreshToken(userId: number): Promise<string> {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresInDays = 7; // JWT_REFRESH_EXPIRY = 7d
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  await prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Establece las cookies HttpOnly para los tokens
 */
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  // Access Token Cookie
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 días para evitar cierres de sesión mientras pruebas
  });

  // Refresh Token Cookie
  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 días
  });
}

/**
 * Limpia las cookies de autenticación
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}
