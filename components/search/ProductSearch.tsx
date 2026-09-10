"use client";

import { useEffect, useState } from "react";
import { Filter, Navigation, Store } from "lucide-react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateDistanceKm } from "@/lib/geo";
import { PAYMENT_METHOD_LABELS } from "@/lib/validators";
import type { ApiResponse, ProductWithBusiness } from "@/types";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type SelectHandler = (
  coordinates: Coordinates,
  businessId?: string,
) => void;

type ProductSearchProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  myLocation?: Coordinates | null;
  onSelect?: SelectHandler;
};

type SearchType = "products" | "businesses";

export function ProductSearch({
  open,
  onOpenChange,
  myLocation,
  onSelect,
}: ProductSearchProps) {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("products");
  const [products, setProducts] = useState<ProductWithBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    fetch("/api/v1/products", { headers: { Accept: "application/json" } })
      .then((response) => response.json())
      .then((result: ApiResponse<ProductWithBusiness[]>) => {
        if (result.success && result.data) setProducts(result.data);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [open]);

  const filteredProducts = products.filter((product) => {
    const term = query.trim().toLowerCase();
    if (!term) return true;
    return (
      product.name.toLowerCase().includes(term) ||
      product.businessName.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term)
    );
  });

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar"
      description="Busca productos o locales cerca de ti"
      className="top-16"
    >
      <div className="flex items-center gap-2 border-b border-border px-3 pt-3 pb-3">
        <Filter className="size-4 shrink-0 text-muted-foreground" />
        <Select
          value={searchType}
          onValueChange={(value) => setSearchType(value as SearchType)}
        >
          <SelectTrigger aria-label="Filtrar búsqueda">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="products">Productos</SelectItem>
            <SelectItem value="businesses">Locales</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {searchType === "products"
            ? "Mostrando productos"
            : "Mostrando locales"}
        </span>
      </div>
      <Command>
        <CommandInput
          placeholder="Buscar productos, locales, categorías..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading ? (
            <ProductSearchSkeleton />
          ) : (
            <>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              {filteredProducts.length > 0 && (
                <>
                  <CommandGroup heading="Productos">
                    {filteredProducts.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={`${product.name} ${product.businessName}`}
                        onSelect={() => {
                          onOpenChange(false);
                          onSelect?.(
                            {
                              latitude: product.businessLatitude,
                              longitude: product.businessLongitude,
                            },
                            product.businessId,
                          );
                        }}
                        className="gap-3"
                      >
                        <Store className="size-4 shrink-0 text-muted-foreground" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate font-medium">
                            {product.name}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {product.businessName}
                          </span>
                          {myLocation && (
                            <BusinessDistance
                              myLocation={myLocation}
                              latitude={product.businessLatitude}
                              longitude={product.businessLongitude}
                            />
                          )}
                        </div>
                        <div className="ml-auto flex shrink-0 flex-col items-end">
                          <span className="text-sm font-semibold text-primary">
                            ${formatPrice(product.price)}
                            <span className="text-xs font-normal text-muted-foreground">
                              {" "}
                              /{product.unit}
                            </span>
                          </span>
                          <PaymentBadge
                            methods={product.businessPaymentMethods}
                          />
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(price);
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

function BusinessDistance({
  myLocation,
  latitude,
  longitude,
}: {
  myLocation: Coordinates;
  latitude: number;
  longitude: number;
}) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const distanceKm = calculateDistanceKm(
    myLocation.latitude,
    myLocation.longitude,
    latitude,
    longitude,
  );

  if (!Number.isFinite(distanceKm)) return null;

  return (
    <span className="flex items-center gap-1 text-xs text-green-300">
      <Navigation className="size-3" />
      {formatDistance(distanceKm)} away
    </span>
  );
}

function PaymentBadge({ methods }: { methods: string[] }) {
  const labels = methods
    .filter((m): m is keyof typeof PAYMENT_METHOD_LABELS => m in PAYMENT_METHOD_LABELS)
    .map((m) => PAYMENT_METHOD_LABELS[m]);

  if (labels.length === 0) return null;

  return (
    <span className="text-xs text-muted-foreground">{labels.join(" + ")}</span>
  );
}

function ProductSearchSkeleton() {
  return (
    <div
      className="flex flex-col gap-3 p-2"
      aria-label="Loading products"
      role="status"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-2 py-2" aria-hidden="true">
          <Skeleton className="size-4 shrink-0 rounded-sm" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-14 shrink-0" />
        </div>
      ))}
    </div>
  );
}
