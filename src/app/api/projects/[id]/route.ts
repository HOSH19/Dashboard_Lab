import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          include: { assignee: true },
          orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("GET /api/projects/[id]", error);
    return NextResponse.json(
      { error: "Failed to load project." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 },
      );
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/projects/[id]", error);
    return NextResponse.json(
      { error: "Failed to delete project." },
      { status: 500 },
    );
  }
}
