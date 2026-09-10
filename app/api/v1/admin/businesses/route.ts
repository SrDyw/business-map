import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        address: true,
        phone: true,
        isActive: true,
        isDelivery: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: businesses });
  } catch (error) {
    console.error("Error listing businesses:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
