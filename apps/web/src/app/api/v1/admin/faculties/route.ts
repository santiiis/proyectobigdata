import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { facultySchema } from "@/lib/validators/admin";
import { successResponse } from "@/lib/responses";
import { AppError, errorResponse } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.faculty.findMany();
    return successResponse(data);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error obteniendo facultades.", 500));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = facultySchema.safeParse(body);
    if (!result.success) throw new AppError("VALIDATION_ERROR", "Datos inválidos", 400, result.error.errors);

    const { code, name } = result.data;

    const existing = await prisma.faculty.findUnique({ where: { code } });
    if (existing) throw new AppError("CONFLICT", "El código ya está en uso", 409);

    const created = await prisma.faculty.create({ data: { code, name } });
    return successResponse(created, 201);
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    return errorResponse(new AppError("INTERNAL_SERVER_ERROR", "Error creando facultad.", 500));
  }
}
