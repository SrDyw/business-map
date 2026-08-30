import { prisma } from "./../db";
import type { CreateProductInput, QueryProductsInput } from "./../validators";

const STALE_AFTER_HOURS = 72;

export type ProductWithBusiness = {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  imageUrl: string | null;
  isAvailable: boolean;
  businessId: string;
  businessName: string;
};

const PRODUCT_FIELDS = {
  id: true,
  name: true,
  price: true,
  unit: true,
  category: true,
  imageUrl: true,
  isAvailable: true,
  businessId: true,
  updatedAt: true,
  business: { select: { name: true, isActive: true } },
} as const;

function toStaleCutoff(): Date {
  return new Date(Date.now() - STALE_AFTER_HOURS * 60 * 60 * 1000);
}

function toProductWithBusiness(
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    category: string;
    imageUrl: string | null;
    isAvailable: boolean;
    businessId: string;
    business: { name: string };
  },
): ProductWithBusiness {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    unit: product.unit,
    category: product.category,
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
    businessId: product.businessId,
    businessName: product.business.name,
  };
}

export async function listProducts(
  query: QueryProductsInput,
): Promise<ProductWithBusiness[]> {
  const cutoff = toStaleCutoff();

  const products = await prisma.product.findMany({
    where: {
      business: { isActive: true },
      isAvailable: true,
      updatedAt: { gte: cutoff },
      ...(query.businessId ? { businessId: query.businessId } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q } },
              { category: { contains: query.q } },
            ],
          }
        : {}),
    },
    select: PRODUCT_FIELDS,
    orderBy: { name: "asc" },
  });

  return products.map(toProductWithBusiness);
}

export async function createProduct(
  businessId: string,
  data: CreateProductInput,
) {
  return prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      unit: data.unit,
      category: data.category,
      imageUrl: data.imageUrl || null,
      isAvailable: data.isAvailable,
      businessId,
    },
  });
}

export async function businessExists(businessId: string): Promise<boolean> {
  const count = await prisma.business.count({
    where: { id: businessId, isActive: true },
  });
  return count > 0;
}
