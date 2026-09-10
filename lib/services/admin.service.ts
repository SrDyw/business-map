import { prisma } from "./../db";

export type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  createdAt: Date;
  _count: { businesses: number };
};

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { businesses: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function setUserRole(userId: string, role: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function setUserActive(userId: string, isActive: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });
}

export async function deleteUser(userId: string) {
  return prisma.user.delete({ where: { id: userId } });
}
