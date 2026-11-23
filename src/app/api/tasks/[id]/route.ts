import { NextResponse } from "next/server";
import { isTaskPriority, isTaskStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    const body = await request.json();
    const data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      assigneeId?: string | null;
    } = {};

    if (body.title !== undefined) {
      const title = typeof body.title === "string" ? body.title.trim() : "";
      if (!title) {
        return NextResponse.json(
          { error: "Task title cannot be empty." },
          { status: 400 },
        );
      }
      data.title = title;
    }

    if (body.description !== undefined) {
      data.description =
        typeof body.description === "string" ? body.description.trim() : "";
    }

    if (body.status !== undefined) {
      if (!isTaskStatus(body.status)) {
        return NextResponse.json(
          { error: "Invalid status. Use todo, in_progress, or done." },
          { status: 400 },
        );
      }
      data.status = body.status;
    }

    if (body.priority !== undefined) {
      if (!isTaskPriority(body.priority)) {
        return NextResponse.json(
          { error: "Invalid priority. Use low, medium, or high." },
          { status: 400 },
        );
      }
      data.priority = body.priority;
    }

    if (body.assigneeId !== undefined) {
      if (body.assigneeId === null || body.assigneeId === "") {
        data.assigneeId = null;
      } else if (typeof body.assigneeId === "string") {
        const person = await prisma.person.findUnique({
          where: { id: body.assigneeId },
        });
        if (!person) {
          return NextResponse.json(
            { error: "Assignee not found." },
            { status: 400 },
          );
        }
        data.assigneeId = body.assigneeId;
      } else {
        return NextResponse.json(
          { error: "Invalid assigneeId." },
          { status: 400 },
        );
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data,
      include: { assignee: true },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("PATCH /api/tasks/[id]", error);
    return NextResponse.json(
      { error: "Failed to update task." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/tasks/[id]", error);
    return NextResponse.json(
      { error: "Failed to delete task." },
      { status: 500 },
    );
  }
}
