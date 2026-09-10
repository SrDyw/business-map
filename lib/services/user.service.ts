import { resolveMx } from "node:dns/promises";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AUTH_ERROR_MESSAGES } from "./../auth-errors";
import { prisma } from "./../db";

export const registerUserSchema = z.object({
  name: z.string().min(2, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

const PASSWORD_SALT_ROUNDS = 10;

export class UserAlreadyExistsError extends Error {
  constructor() {
    super(AUTH_ERROR_MESSAGES.emailTaken);
    this.name = "UserAlreadyExistsError";
  }
}

export class UserNameTakenError extends Error {
  constructor() {
    super(AUTH_ERROR_MESSAGES.nameTaken);
    this.name = "UserNameTakenError";
  }
}

export class EmailNotFoundError extends Error {
  constructor() {
    super(AUTH_ERROR_MESSAGES.emailNotFound);
    this.name = "EmailNotFoundError";
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const DNS_OVER_HTTPS_URL = "https://dns.google/resolve";
const DEFINITIVE_DNS_ERROR_CODES = new Set(["ENOTFOUND", "ENODATA"]);

type DnsJsonResponse = {
  Status?: number;
  Answer?: unknown[];
};

async function domainCanReceiveEmail(domain: string): Promise<boolean> {
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch (error) {
    const code =
      error instanceof Error
        ? (error as NodeJS.ErrnoException).code ?? ""
        : "";
    if (DEFINITIVE_DNS_ERROR_CODES.has(code)) {
      return false;
    }
    return domainCanReceiveEmailViaDoh(domain);
  }
}

async function domainCanReceiveEmailViaDoh(
  domain: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `${DNS_OVER_HTTPS_URL}?name=${encodeURIComponent(domain)}&type=MX`,
    );
    if (!response.ok) {
      return false;
    }
    const result = (await response.json()) as DnsJsonResponse;
    return (
      result.Status === 0 &&
      Array.isArray(result.Answer) &&
      result.Answer.length > 0
    );
  } catch {
    return false;
  }
}

async function isNameTaken(name: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "User" WHERE name = ${name} COLLATE NOCASE LIMIT 1
  `;
  return rows.length > 0;
}

export async function registerUser(data: RegisterUserInput) {
  const parsed = registerUserSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const name = parsed.data.name.trim();
  const email = normalizeEmail(parsed.data.email);
  const { password } = parsed.data;

  const [, domain] = email.split("@");
  if (!domain || !(await domainCanReceiveEmail(domain))) {
    throw new EmailNotFoundError();
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new UserAlreadyExistsError();
  }

  if (await isNameTaken(name)) {
    throw new UserNameTakenError();
  }

  const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  return prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}
