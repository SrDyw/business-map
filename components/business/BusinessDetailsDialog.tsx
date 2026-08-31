"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DragToDismiss } from "@/components/ui/drag-to-dismiss";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { isOpenNow } from "@/lib/systemuitls";
import { Skeleton } from "@/components/ui/skeleton";
import { BusinessImage } from "@/components/business/BusinessImage";
import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ApiResponse, Business, ProductWithBusiness } from "@/types";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_PLATFORM_LABELS,
} from "@/lib/validators";
import {
  Banknote,
  ChevronDown,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Search,
  Store,
} from "lucide-react";

const BREADCRUMB_IMAGE = "/wp8227877.jpg";

const MOCK_IMAGES: string[] = [
  BREADCRUMB_IMAGE,
  "https://picsum.photos/seed/shop1/600/400",
  "https://picsum.photos/seed/shop2/600/400",
  "https://picsum.photos/seed/shop3/600/400",
];

type BusinessDetailsDialogProps = {
  business: Business;
  distanceKm: number | null;
};

type NewProductForm = {
  name: string;
  price: string;
  unit: string;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
};

const EMPTY_PRODUCT_FORM: NewProductForm = {
  name: "",
  price: "",
  unit: "unit",
  category: "general",
  imageUrl: "",
  isAvailable: true,
};

export function BusinessDetailsDialog({
  business,
  distanceKm,
}: BusinessDetailsDialogProps) {
  const openStatus = isOpenNow(business.scheduleDays, business.scheduleHours);
  const formattedDistance =
    distanceKm !== null ? formatDistance(distanceKm) : null;

  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<ProductWithBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [productForm, setProductForm] =
    useState<NewProductForm>(EMPTY_PRODUCT_FORM);
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);

  function loadProducts() {
    setIsLoading(true);
    setLoadError(null);

    return fetch(`/api/v1/businesses/${business.id}/products`, {
      headers: { Accept: "application/json" },
    })
      .then((response) => response.json())
      .then((result: ApiResponse<ProductWithBusiness[]>) => {
        if (!result.success || !result.data) {
          setProducts([]);
          setLoadError(result.error ?? "Could not load products.");
          return;
        }
        setProducts(result.data);
      })
      .catch(() => {
        setProducts([]);
        setLoadError("Connection error while loading products.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) return;

    setProducts([]);
    setProductQuery("");
    loadProducts();
  }

  function updateProductField(field: keyof NewProductForm, value: string | boolean) {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setProductFormError(null);

    const price = Number(productForm.price);
    if (!productForm.name.trim()) {
      setProductFormError("Product name is required.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setProductFormError("Price must be a number greater than 0.");
      return;
    }

    setIsProductSubmitting(true);
    try {
      const response = await fetch(
        `/api/v1/businesses/${business.id}/products`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: productForm.name.trim(),
            price,
            unit: productForm.unit.trim() || "unit",
            category: productForm.category.trim() || "general",
            imageUrl: productForm.imageUrl.trim() || undefined,
            isAvailable: productForm.isAvailable,
          }),
        },
      );

      const result = (await response.json()) as ApiResponse<unknown>;

      if (!response.ok || !result.success) {
        setProductFormError(result.error ?? "Could not add the product.");
        return;
      }

      setIsAddOpen(false);
      setProductForm(EMPTY_PRODUCT_FORM);
      loadProducts();
    } catch {
      setProductFormError("Connection error. Please try again.");
    } finally {
      setIsProductSubmitting(false);
    }
  }

  const filteredProducts = products.filter((product) => {
    const query = productQuery.trim().toLowerCase();
    if (query === "") return true;
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  });

  return (
    <>
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="w-full rounded-full bg-white text-black hover:bg-white/90" />}>
        View full details
      </DialogTrigger>

      <DialogContent align="bottom" className="p-0 sm:max-w-lg">
        <DragToDismiss
          onDismiss={() => setOpen(false)}
          className="max-h-[85vh]"
          contentClassName="px-4 pb-4 sm:px-6"
        >
          <div className="flex flex-col gap-4">
            <div className="flex shrink-0 items-center justify-center pt-3">
              <div className="h-1.5 w-12 rounded-full bg-muted" />
            </div>
            <DialogHeader>
              <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-12 shrink-0">
              {business.photoUrl && (
                <AvatarImage src={business.photoUrl} alt={business.name} />
              )}
              <AvatarFallback className="text-base">
                <Store className="size-5" />
              </AvatarFallback>
            </Avatar>
              <DialogTitle className="min-w-0 truncate text-lg">
                {business.name}
              </DialogTitle>
            </div>
            <DialogDescription>{business.type}</DialogDescription>
          </DialogHeader>

          <div className="mt-1">
            <Carousel className="w-full">
              <CarouselContent>
                {MOCK_IMAGES.map((src, index) => (
                <CarouselItem key={src}>
                  <div className="aspect-[3/2] overflow-hidden rounded-xl ring-1 ring-foreground/10">
                    <BusinessImage
                      key={src}
                      src={src}
                      alt={`${business.name} photo ${index + 1}`}
                      className="h-full w-full"
                    />
                  </div>
                </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>

          <div className="flex flex-col gap-2">
            {formattedDistance && (
              <InfoRow
                icon={<Navigation className="size-4" />}
                text={`${formattedDistance} away`}
              />
            )}

            <OpenStatusBadge status={openStatus} />

            <PaymentInfo
              methods={business.paymentMethods}
              platform={business.paymentPlatform}
              note={business.paymentNote}
            />

            <Collapsible className="group mt-1">
              <CollapsibleTrigger className="flex w-fit items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
                More details
                <ChevronDown className="size-4 transition-transform group-data-open:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 flex flex-col gap-2">
                <InfoRow
                  icon={<MapPin className="size-4" />}
                  text={business.address}
                />
                {business.phone && (
                  <InfoRow
                    icon={<Phone className="size-4" />}
                    text={business.phone}
                  />
                )}
                {business.scheduleDays && (
                  <InfoRow
                    icon={<Clock className="size-4" />}
                    text={business.scheduleDays}
                  />
                )}
                {business.scheduleHours && (
                  <InfoRow
                    icon={<Clock className="size-4" />}
                    text={`Hours: ${business.scheduleHours}`}
                  />
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="mt-2">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-medium">Products</p>
              <div className="flex items-center gap-2">
                {products.length > 0 && (
                  <div className="relative w-40 sm:w-48">
                    <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                      placeholder="Search products"
                      className="pl-8"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  size="icon-sm"
                  onClick={() => {
                    setProductForm(EMPTY_PRODUCT_FORM);
                    setProductFormError(null);
                    setIsAddOpen(true);
                  }}
                  aria-label="Add product"
                  className="shrink-0"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <ProductListSkeleton rows={5} />
            ) : loadError ? (
              <p className="py-6 text-center text-sm text-destructive">
                {loadError}
              </p>
            ) : products.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No products available yet.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-foreground/10">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductItem key={product.id} product={product} />
                  ))
                ) : (
                  <li className="py-6 text-center text-sm text-muted-foreground">
                    No products match your search.
                  </li>
                )}
              </ul>
            )}
            </div>
          </div>
        </DragToDismiss>
      </DialogContent>
    </Dialog>

    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add product</DialogTitle>
          <DialogDescription>
            Register a new product for {business.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddProduct} className="space-y-4" noValidate>
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="product-name">Name</FieldLabel>
              <Input
                id="product-name"
                value={productForm.name}
                onChange={(e) => updateProductField("name", e.target.value)}
                placeholder="e.g. White rice"
                maxLength={120}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="product-price">Price (CUP)</FieldLabel>
                <Input
                  id="product-price"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => updateProductField("price", e.target.value)}
                  placeholder="0.00"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="product-unit">Unit</FieldLabel>
                <Input
                  id="product-unit"
                  value={productForm.unit}
                  onChange={(e) => updateProductField("unit", e.target.value)}
                  placeholder="e.g. kg, unit"
                  maxLength={30}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="product-category">Category</FieldLabel>
              <Input
                id="product-category"
                value={productForm.category}
                onChange={(e) =>
                  updateProductField("category", e.target.value)
                }
                placeholder="e.g. Food"
                maxLength={60}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="product-image">Image URL (optional)</FieldLabel>
              <Input
                id="product-image"
                type="url"
                value={productForm.imageUrl}
                onChange={(e) => updateProductField("imageUrl", e.target.value)}
                placeholder="https://example.com/product.png"
                maxLength={500}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldLabel htmlFor="product-available">
                Available
              </FieldLabel>
              <Switch
                id="product-available"
                checked={productForm.isAvailable}
                onCheckedChange={(checked) =>
                  updateProductField("isAvailable", checked)
                }
              />
            </Field>
          </div>

          {productFormError && (
            <p className="text-sm text-destructive">{productFormError}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isProductSubmitting}>
              {isProductSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Adding...
                </>
              ) : (
                "Add product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

function ProductListSkeleton({ rows }: { rows: number }) {
  return (
    <ul
      className="flex flex-col divide-y divide-foreground/10"
      aria-label="Loading products"
    >
      {Array.from({ length: rows }).map((_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 py-3"
          aria-hidden="true"
        >
          <Skeleton className="size-12 shrink-0 rounded-lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

function ProductItem({ product }: { product: ProductWithBusiness }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <BusinessImage
        src={product.imageUrl}
        alt={product.name}
        className="size-12 shrink-0 rounded-lg ring-1 ring-foreground/10"
        iconClassName="size-5"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{product.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {formatPrice(product.price)} <span className="text-xs">/ {product.unit}</span>
        </p>
      </div>
      <div className="shrink-0">
        <AvailabilityBadge isAvailable={product.isAvailable} />
      </div>
    </li>
  );
}

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      <span className="shrink-0 text-foreground">{icon}</span>
      <span className="min-w-0 break-words">{text}</span>
    </div>
  );
}

function PaymentInfo({
  methods,
  platform,
  note,
}: {
  methods: string[];
  platform: string | null;
  note: string | null;
}) {
  const includesTransfer = methods.includes("transfer");
  const includesCash = methods.includes("cash");
  const methodLabels: string[] = [];
  if (includesCash) methodLabels.push(PAYMENT_METHOD_LABELS.cash);
  if (includesTransfer) methodLabels.push(PAYMENT_METHOD_LABELS.transfer);
  const platformLabel =
    platform && platform in PAYMENT_PLATFORM_LABELS
      ? PAYMENT_PLATFORM_LABELS[platform as keyof typeof PAYMENT_PLATFORM_LABELS]
      : null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-2 text-sm text-foreground">
        <span className="text-foreground">
          {includesCash && !includesTransfer ? (
            <Banknote className="size-4" />
          ) : includesTransfer && !includesCash ? (
            <CreditCard className="size-4" />
          ) : (
            <Banknote className="size-4" />
          )}
        </span>
        <span className="font-medium">{methodLabels.join(" + ")}</span>
        {includesTransfer && platformLabel && (
          <span className="inline-flex w-fit items-center rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-medium text-green-400">
            {platformLabel}
          </span>
        )}
      </div>
      {includesTransfer && note && (
        <p className="text-sm text-muted-foreground">{note}</p>
      )}
    </div>
  );
}

function OpenStatusBadge({ status }: { status: boolean | null }) {
  if (status === null) return null;

  return status ? (
    <span className="inline-flex w-fit items-center rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-400">
      <span className="mr-1.5 size-1.5 rounded-full bg-green-400" />
      Open now
    </span>
  ) : (
    <span className="inline-flex w-fit items-center rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400">
      <span className="mr-1.5 size-1.5 rounded-full bg-red-400" />
      Currently closed
    </span>
  );
}

function AvailabilityBadge({ isAvailable }: { isAvailable: boolean }) {
  return isAvailable ? (
    <span className="inline-flex items-center rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
      Available
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      Unavailable
    </span>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CU", {
    style: "currency",
    currency: "CUP",
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
