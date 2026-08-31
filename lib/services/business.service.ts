import { prisma } from "./../db";
import { calculateDistanceKm } from "./../geo";
import {
  parsePaymentMethods,
  serializePaymentMethods,
} from "./../validators";
import type {
  CreateBusinessInput,
  QueryBusinessesInput,
} from "./../validators";

export type BusinessWithDistance = {
  id: string;
  name: string;
  type: string;
  address: string;
  phone: string;
  scheduleDays: string | null;
  scheduleHours: string | null;
  latitude: number;
  longitude: number;
  isDelivery: boolean;
  photoUrl: string | null;
  paymentMethods: string[];
  paymentPlatform: string | null;
  paymentNote: string | null;
  isActive: boolean;
  distanceKm: number | null;
};

const BUSINESS_FIELDS = {
  id: true,
  name: true,
  type: true,
  address: true,
  phone: true,
  scheduleDays: true,
  scheduleHours: true,
  latitude: true,
  longitude: true,
  isDelivery: true,
  photoUrl: true,
  paymentMethods: true,
  paymentPlatform: true,
  paymentNote: true,
  isActive: true,
} as const;

export async function listBusinesses(
  query: QueryBusinessesInput,
): Promise<BusinessWithDistance[]> {
  const businesses = await prisma.business.findMany({
    where: { isActive: true },
    select: BUSINESS_FIELDS,
    orderBy: { name: "asc" },
  });

  const hasCoordinates =
    query.latitude !== undefined && query.longitude !== undefined;

  return businesses.map((business) => {
    const distanceKm =
      hasCoordinates && query.latitude !== undefined && query.longitude !== undefined
        ? calculateDistanceKm(
            query.latitude,
            query.longitude,
            business.latitude,
            business.longitude,
          )
        : null;

    return {
      ...business,
      paymentMethods: parsePaymentMethods(business.paymentMethods),
      distanceKm,
    };
  });
}

export async function createBusiness(data: CreateBusinessInput) {
  const methods = data.paymentMethods ?? ["cash"];
  const includesTransfer = methods.includes("transfer");
  const created = await prisma.business.create({
    data: {
      name: data.name,
      type: data.type,
      address: data.address,
      phone: data.phone,
      scheduleDays: data.scheduleDays || null,
      scheduleHours: data.scheduleHours || null,
      isDelivery: data.isDelivery,
      photoUrl: data.photoUrl || null,
      paymentMethods: serializePaymentMethods(methods),
      paymentPlatform: includesTransfer ? data.paymentPlatform || null : null,
      paymentNote: includesTransfer ? data.paymentNote || null : null,
      latitude: data.latitude,
      longitude: data.longitude,
      isActive: true,
    },
    select: BUSINESS_FIELDS,
  });

  return {
    ...created,
    paymentMethods: parsePaymentMethods(created.paymentMethods),
  };
}

export function isDuplicatePhoneError(error: unknown): boolean {
  if (error === null || typeof error !== "object") return false;

  const candidate = error as {
    code?: unknown;
    meta?: { target?: unknown };
    message?: unknown;
  };

  const code = candidate.code;

  if (code === "P2002") {
    const target = candidate.meta?.target;
    if (Array.isArray(target)) {
      return target.some((field) => field === "phone");
    }
    if (typeof candidate.message === "string" && candidate.message.includes("phone")) {
      return true;
    }
  }

  return false;
}
