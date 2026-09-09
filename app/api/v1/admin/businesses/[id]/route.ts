import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await _request.json();
    const { isActive } = body as { isActive: boolean };

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ success: false, error: "Valor inválido" }, { status: 400 });
    }

    const business = await prisma.business.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, isActive: true },
    });

    return NextResponse.json({ success: true, data: business });
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  try {
    await prisma.business.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting business:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
