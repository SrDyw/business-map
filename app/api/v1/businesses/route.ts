import { NextRequest, NextResponse } from "next/server";
import { createBusinessSchema, queryBusinessesSchema } from "@/lib/validators";
import {
  createBusiness,
  isDuplicatePhoneError,
  listBusinesses,
} from "@/lib/services/business.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const latitudeRaw = searchParams.get("latitude");
    const longitudeRaw = searchParams.get("longitude");

    const parse = queryBusinessesSchema.safeParse({
      latitude: latitudeRaw !== null ? Number(latitudeRaw) : undefined,
      longitude: longitudeRaw !== null ? Number(longitudeRaw) : undefined,
    });

    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters" },
        { status: 400 },
      );
    }

    const businesses = await listBusinesses(parse.data);
    return NextResponse.json({ success: true, data: businesses });
  } catch (error) {
    console.error("Error listing businesses:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parse = createBusinessSchema.safeParse(body);

    if (!parse.success) {
      const firstError = parse.error.issues[0]?.message ?? "Invalid data";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const business = await createBusiness(parse.data);
    return NextResponse.json({ success: true, data: business }, { status: 201 });
  } catch (error) {
    if (isDuplicatePhoneError(error)) {
      return NextResponse.json(
        { success: false, error: "A business with that phone already exists" },
        { status: 409 },
      );
    }

    console.error("Error creating business:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
