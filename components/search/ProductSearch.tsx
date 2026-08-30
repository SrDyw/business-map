"use client";

import { useEffect, useState } from "react";
import { Search, Store } from "lucide-react";

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
import { Spinner } from "@/components/ui/spinner";
import type { ApiResponse, ProductWithBusiness } from "@/types";

export function ProductSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductWithBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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
    <>
      <div className="absolute top-4 left-1/2 z-10 w-64 -translate-x-1/2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-8 text-sm font-medium text-foreground shadow-lg transition-colors hover:bg-muted/60"
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">Search products...</span>
          <span className="absolute right-3 hidden shrink-0 rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">
            Enter
          </span>
        </button>
      </div>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search products"
        description="Search for available products"
        className="top-16"
      >
        <Command>
          <CommandInput
            placeholder="Search products, stores, categories..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Spinner className="size-4" />
                Loading products...
              </div>
            ) : (
              <>
                <CommandEmpty>No products found.</CommandEmpty>
                {filteredProducts.length > 0 && (
                  <>
                    <CommandGroup heading="Products">
                      {filteredProducts.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={`${product.name} ${product.businessName}`}
                          onSelect={() => setOpen(false)}
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
                          </div>
                          <span className="ml-auto shrink-0 text-sm font-semibold text-primary">
                            ${formatPrice(product.price)}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            /{product.unit}
                          </span>
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
    </>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(price);
}
