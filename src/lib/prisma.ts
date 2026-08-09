import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaMssql({
  server: process.env.DB_SERVER ?? "localhost",
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME ?? "GbAccount",

  authentication: {
    type: "default",
    options: {
      userName: process.env.DB_USERNAME ?? "",
      password: process.env.DB_PASSWORD ?? "",
    },
  },

  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT !== "false",
  },
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}