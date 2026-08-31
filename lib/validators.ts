import { z } from "zod";

export const BUSINESS_TYPES = [
  "restaurant",
  "cafeteria",
  "grocery_store",
  "pharmacy",
  "clothing",
  "hardware_store",
  "butcher_shop",
  "bakery",
  "technology",
  "beauty_salon",
  "optical",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  restaurant: "Restaurant",
  cafeteria: "Cafeteria",
  grocery_store: "Grocery Store",
  pharmacy: "Pharmacy",
  clothing: "Clothing Store",
  hardware_store: "Hardware Store",
  butcher_shop: "Butcher Shop",
  bakery: "Bakery",
  technology: "Technology Store",
  beauty_salon: "Beauty Salon",
  optical: "Optical",
};

export const PAYMENT_METHODS = ["cash", "transfer"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  transfer: "Transfer",
};

export const PAYMENT_METHODS_SEPARATOR = ",";

export function serializePaymentMethods(methods: string[]): string {
  return Array.from(new Set(methods)).join(PAYMENT_METHODS_SEPARATOR);
}

export function parsePaymentMethods(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(PAYMENT_METHODS_SEPARATOR)
    .map((part) => part.trim())
    .filter((part): part is PaymentMethod =>
      (PAYMENT_METHODS as readonly string[]).includes(part),
    );
}

export const PAYMENT_PLATFORMS = ["enzona", "transfermovil"] as const;
export type PaymentPlatform = typeof PAYMENT_PLATFORMS[number];
export const PAYMENT_PLATFORM_LABELS: Record<PaymentPlatform, string> = {
  enzona: "Enzona",
  transfermovil: "Transfermóvil",
};

export const CUBA_BOUNDS = {
  latMin: 19.8,
  latMax: 23.3,
  lngMin: -85,
  lngMax: -74,
} as const;

const PHONE_MIN_DIGITS = 8;
const SCHEDULE_MAX = 64;
const NAME_MIN = 3;
const NAME_MAX = 100;
const ADDRESS_MIN = 5;
const ADDRESS_MAX = 200;
const PHOTO_URL_MAX = 500;
const PAYMENT_NOTE_MAX = 120;

const phoneRegex = /^[0-9]{8,}$/;

const latitudeCuba = z
  .number({ error: "Latitude must be a number" })
  .gt(-90, "Latitude must be greater than -90")
  .lt(90, "Latitude must be less than 90")
  .gte(CUBA_BOUNDS.latMin, "Latitude must be within Cuba")
  .lte(CUBA_BOUNDS.latMax, "Latitude must be within Cuba");

const longitudeCuba = z
  .number({ error: "Longitude must be a number" })
  .gt(-180, "Longitude must be greater than -180")
  .lt(180, "Longitude must be less than 180")
  .gte(CUBA_BOUNDS.lngMin, "Longitude must be within Cuba")
  .lte(CUBA_BOUNDS.lngMax, "Longitude must be within Cuba");

export const createBusinessSchema = z.object({
  name: z
    .string("Name is required")
    .trim()
    .min(NAME_MIN, `Name must be at least ${NAME_MIN} characters`)
    .max(NAME_MAX, `Name cannot exceed ${NAME_MAX} characters`),
  type: z.enum(BUSINESS_TYPES, {
    error: "Invalid business type",
  }),
  address: z
    .string("Address is required")
    .trim()
    .min(
      ADDRESS_MIN,
      `Address must be at least ${ADDRESS_MIN} characters`,
    )
    .max(
      ADDRESS_MAX,
      `Address cannot exceed ${ADDRESS_MAX} characters`,
    ),
  phone: z
    .string("Phone is required")
    .trim()
    .regex(
      phoneRegex,
      `Phone must have at least ${PHONE_MIN_DIGITS} digits and numbers only`,
    ),
  scheduleDays: z
    .string("Schedule is required")
    .trim()
    .min(1, "Please select the operating days")
    .max(SCHEDULE_MAX, `Schedule cannot exceed ${SCHEDULE_MAX} characters`),
  scheduleHours: z
    .string("Schedule is required")
    .trim()
    .min(1, "Please select the opening hours")
    .max(SCHEDULE_MAX, `Schedule cannot exceed ${SCHEDULE_MAX} characters`),
  isDelivery: z.boolean().optional().default(false),
  photoUrl: z
    .url({ error: "The photo must be a valid URL" })
    .max(PHOTO_URL_MAX, `The photo URL cannot exceed ${PHOTO_URL_MAX} characters`)
    .optional()
    .or(z.literal("")),
  paymentMethods: z
    .array(z.enum(PAYMENT_METHODS))
    .min(1, "Select at least one payment method")
    .optional()
    .default(["cash"]),
  paymentPlatform: z.enum(PAYMENT_PLATFORMS).optional().nullable(),
  paymentNote: z
    .string()
    .trim()
    .max(
      PAYMENT_NOTE_MAX,
      `Payment note cannot exceed ${PAYMENT_NOTE_MAX} characters`,
    )
    .optional()
    .or(z.literal("")),
  latitude: latitudeCuba,
  longitude: longitudeCuba,
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;

export const queryBusinessesSchema = z.object({
  latitude: latitudeCuba.optional(),
  longitude: longitudeCuba.optional(),
});

export type QueryBusinessesInput = z.infer<typeof queryBusinessesSchema>;

const PRODUCT_NAME_MAX = 120;
const PRODUCT_CATEGORY_MAX = 60;
const PRODUCT_UNIT_MAX = 30;

export const createProductSchema = z.object({
  name: z
    .string("Product name is required")
    .trim()
    .min(1, "Product name is required")
    .max(PRODUCT_NAME_MAX, `Product name cannot exceed ${PRODUCT_NAME_MAX} characters`),
  price: z
    .number({ error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .max(10000000, "Price is too large"),
  unit: z
    .string("Unit is required")
    .trim()
    .min(1, "Unit is required")
    .max(PRODUCT_UNIT_MAX, `Unit cannot exceed ${PRODUCT_UNIT_MAX} characters`)
    .default("unit"),
  category: z
    .string("Category is required")
    .trim()
    .min(1, "Category is required")
    .max(PRODUCT_CATEGORY_MAX, `Category cannot exceed ${PRODUCT_CATEGORY_MAX} characters`)
    .default("general"),
  imageUrl: z
    .url({ error: "The image must be a valid URL" })
    .max(PHOTO_URL_MAX, `The image URL cannot exceed ${PHOTO_URL_MAX} characters`)
    .optional()
    .or(z.literal("")),
  isAvailable: z.boolean().optional().default(true),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const queryProductsSchema = z.object({
  q: z.string().trim().optional(),
  businessId: z.string().min(1).optional(),
});

export type QueryProductsInput = z.infer<typeof queryProductsSchema>;
