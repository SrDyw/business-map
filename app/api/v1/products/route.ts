import { NextRequest, NextResponse } from "next/server";
import { queryProductsSchema } from "@/lib/validators";
import { listProducts } from "@/lib/services/product.service";
import type { ApiResponse } from "@/types";
import { wait } from "@/lib/systemuitls";

export async function GET(request: NextRequest) {
  try {
    await wait(2000)
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") ?? undefined;
    const businessId = searchParams.get("businessId") ?? undefined;

    const parse = queryProductsSchema.safeParse({ q, businessId });

    if (!parse.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Invalid query parameters" },
        { status: 400 },
      );
    }

    const products = await listProducts(parse.data);
    return NextResponse.json<ApiResponse<typeof products>>({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error listing products:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
