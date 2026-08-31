export type Business = {
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
};

export type BusinessWithDistance = Business & {
  distanceKm: number | null;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  imageUrl: string | null;
  isAvailable: boolean;
  businessId: string;
};

export type ProductWithBusiness = Product & {
  businessName: string;
  businessLatitude: number;
  businessLongitude: number;
  businessPaymentMethods: string[];
};

export type CreateBusinessData = {
  name: string;
  type: string;
  address: string;
  phone: string;
  scheduleDays?: string;
  scheduleHours?: string;
  isDelivery?: boolean;
  paymentMethods?: string[];
  paymentPlatform?: string | null;
  paymentNote?: string | null;
  latitude: number;
  longitude: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
