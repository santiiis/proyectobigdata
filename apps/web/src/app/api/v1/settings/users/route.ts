import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validators/user";
import { hashPassword } from "@/lib/auth";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
      throw new AppError("VALIDATION_ERROR", "Datos de usuario inválidos", 400, result.error.errors);
    }

    const { name, email, password, role } = result.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError("CONFLICT", "Ya existe un usuario con ese correo.", 409);
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    return successResponse(user, 201);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error creando al usuario.", 500));
  }
}
