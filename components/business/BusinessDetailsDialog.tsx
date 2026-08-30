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
import { Spinner } from "@/components/ui/spinner";
import { BusinessImage } from "@/components/business/BusinessImage";
import type { ApiResponse, Business, ProductWithBusiness } from "@/types";
import { Clock, MapPin, Navigation, Phone, Search, Store } from "lucide-react";

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

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) return;

    setProducts([]);
    setLoadError(null);
    setProductQuery("");
    setIsLoading(true);

    fetch(`/api/v1/businesses/${business.id}/products`, {
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

  const filteredProducts = products.filter((product) => {
    const query = productQuery.trim().toLowerCase();
    if (query === "") return true;
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="w-full rounded-full bg-white text-black hover:bg-white/90" />}>
        View full details
      </DialogTrigger>

      <DialogContent align="bottom" className="p-0 sm:max-w-lg">
        <DragToDismiss
          onDismiss={() => setOpen(false)}
          className="flex max-h-[85vh] flex-col"
          contentClassName="px-4 pb-4 sm:px-6"
        >
          <div className="flex flex-col gap-4">
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
            <InfoRow icon={<MapPin className="size-4" />} text={business.address} />
            {business.phone && (
              <InfoRow icon={<Phone className="size-4" />} text={business.phone} />
            )}
            {business.scheduleDays && (
              <InfoRow icon={<Clock className="size-4" />} text={business.scheduleDays} />
            )}
            {business.scheduleHours && (
              <InfoRow icon={<Clock className="size-4" />} text={`Hours: ${business.scheduleHours}`} />
            )}
            {formattedDistance && (
              <InfoRow
                icon={<Navigation className="size-4" />}
                text={`${formattedDistance} away`}
              />
            )}

            <OpenStatusBadge status={openStatus} />
          </div>

          <div className="mt-2">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-medium">Products</p>
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
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Spinner className="size-4" />
                Loading products...
              </div>
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
