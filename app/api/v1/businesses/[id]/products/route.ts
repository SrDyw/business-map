import { NextRequest, NextResponse } from "next/server";
import { createProductSchema } from "@/lib/validators";
import {
  businessExists,
  createProduct,
  listProducts,
} from "@/lib/services/product.service";
import type { ApiResponse } from "@/types";
import { wait } from "@/lib/systemuitls";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await wait(2000)
    const { id } = await context.params;

    if (!(await businessExists(id))) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Business not found" },
        { status: 404 },
      );
    }

    const products = await listProducts({ businessId: id });
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

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!(await businessExists(id))) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: "Business not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parse = createProductSchema.safeParse(body);

    if (!parse.success) {
      const firstError = parse.error.issues[0]?.message ?? "Invalid data";
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const product = await createProduct(id, parse.data);
    return NextResponse.json<ApiResponse<typeof product>>(
      { success: true, data: product },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
