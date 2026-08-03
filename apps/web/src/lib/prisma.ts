import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

// Polyfill de Web Crypto API para Next.js 15 / Prisma 6
if (typeof globalThis.crypto === "undefined") {
  (globalThis as any).crypto = crypto.webcrypto;
} else if (!globalThis.crypto.getRandomValues) {
  (globalThis as any).crypto.getRandomValues = crypto.webcrypto.getRandomValues.bind(crypto.webcrypto);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
