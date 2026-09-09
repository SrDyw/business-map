import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listUsers, setUserRole, setUserActive, deleteUser } from "@/lib/services/admin.service";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const users = await listUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { userId, action, value } = body as {
      userId: string;
      action: "role" | "active" | "delete";
      value?: string | boolean;
    };

    if (!userId || !action) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    if (userId === session.user.id) {
      return NextResponse.json({ success: false, error: "No puedes modificar tu propia cuenta desde el admin" }, { status: 400 });
    }

    if (action === "role") {
      if (value !== "user" && value !== "admin") {
        return NextResponse.json({ success: false, error: "Rol inválido" }, { status: 400 });
      }
      const updated = await setUserRole(userId, value as string);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "active") {
      if (typeof value !== "boolean") {
        return NextResponse.json({ success: false, error: "Valor inválido" }, { status: 400 });
      }
      const updated = await setUserActive(userId, value);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "delete") {
      await deleteUser(userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Acción desconocida" }, { status: 400 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
