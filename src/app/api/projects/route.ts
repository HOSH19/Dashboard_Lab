import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { tasks: true } },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET /api/projects", error);
    return NextResponse.json(
      { error: "Failed to load projects." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Project name is required." },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: { name, description },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects", error);
    return NextResponse.json(
      { error: "Failed to create project." },
      { status: 500 },
    );
  }
}
