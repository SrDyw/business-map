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

async function isNameTaken(name: string): Promise<boolean> {
  const existing = await prisma.user.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });
  return existing !== null;
}

export async function registerUser(data: RegisterUserInput) {
  const parsed = registerUserSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const name = parsed.data.name.trim();
  const email = normalizeEmail(parsed.data.email);
  const { password } = parsed.data;

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