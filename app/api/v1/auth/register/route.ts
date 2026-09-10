import { NextRequest, NextResponse } from "next/server";
import {
  EmailNotFoundError,
  registerUser,
  registerUserSchema,
  UserAlreadyExistsError,
  UserNameTakenError,
} from "@/lib/services/user.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parse = registerUserSchema.safeParse(body);

    if (!parse.success) {
      const firstError = parse.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 },
      );
    }

    const user = await registerUser(parse.data);
    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 },
      );
    }

    if (
      error instanceof UserNameTakenError ||
      error instanceof EmailNotFoundError
    ) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    if (error instanceof Error && error.message) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    console.error("Error registering user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
