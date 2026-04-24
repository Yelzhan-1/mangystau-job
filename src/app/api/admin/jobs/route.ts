import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Admin jobs GET error:", error);

    return NextResponse.json(
      {
        error: "Не удалось загрузить вакансии для модерации.",
      },
      { status: 500 }
    );
  }
}