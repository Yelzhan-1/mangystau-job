import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (typeof body.isVerified !== "boolean") {
      return NextResponse.json(
        {
          error: "Поле isVerified должно быть boolean.",
        },
        { status: 400 }
      );
    }

    const employer = await prisma.employerProfile.update({
      where: {
        id,
      },
      data: {
        isVerified: body.isVerified,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      message: body.isVerified
        ? "Работодатель отмечен как проверенный."
        : "Проверка работодателя снята.",
      employer,
    });
  } catch (error) {
    console.error("Admin employer PATCH error:", error);

    return NextResponse.json(
      {
        error: "Не удалось обновить статус работодателя.",
      },
      { status: 500 }
    );
  }
}