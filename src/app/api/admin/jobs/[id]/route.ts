import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        {
          error: "Поле isActive должно быть boolean.",
        },
        { status: 400 }
      );
    }

    const job = await prisma.job.update({
      where: {
        id,
      },
      data: {
        isActive: body.isActive,
      },
      include: {
        employer: {
          include: {
            user: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: body.isActive
        ? "Вакансия опубликована."
        : "Вакансия снята с публикации.",
      job,
    });
  } catch (error) {
    console.error("Admin job PATCH error:", error);

    return NextResponse.json(
      {
        error: "Не удалось обновить статус вакансии.",
      },
      { status: 500 }
    );
  }
}