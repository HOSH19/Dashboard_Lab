import { NextResponse } from "next/server";
import { isTaskPriority, isTaskStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const projectId =
      typeof body.projectId === "string" ? body.projectId.trim() : "";
    const status = body.status ?? "todo";
    const priority = body.priority ?? "medium";
    const assigneeId =
      typeof body.assigneeId === "string" && body.assigneeId
        ? body.assigneeId
        : null;

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required." },
        { status: 400 },
      );
    }
    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required." },
        { status: 400 },
      );
    }
    if (!isTaskStatus(status)) {
      return NextResponse.json(
        { error: "Invalid status. Use todo, in_progress, or done." },
        { status: 400 },
      );
    }
    if (!isTaskPriority(priority)) {
      return NextResponse.json(
        { error: "Invalid priority. Use low, medium, or high." },
        { status: 400 },
      );
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json(
        { error: "Project not found." },
        { status: 404 },
      );
    }

    if (assigneeId) {
      const person = await prisma.person.findUnique({ where: { id: assigneeId } });
      if (!person) {
        return NextResponse.json(
          { error: "Assignee not found." },
          { status: 400 },
        );
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        status,
        priority,
        assigneeId,
      },
      include: { assignee: true },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks", error);
    return NextResponse.json(
      { error: "Failed to create task." },
      { status: 500 },
    );
  }
}
