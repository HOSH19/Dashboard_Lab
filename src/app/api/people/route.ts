import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const people = await prisma.person.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { tasks: true } },
      },
    });
    return NextResponse.json(people);
  } catch (error) {
    console.error("GET /api/people", error);
    return NextResponse.json(
      { error: "Failed to load people." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!name) {
      return NextResponse.json(
        { error: "Name is required." },
        { status: 400 },
      );
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required." },
        { status: 400 },
      );
    }

    const person = await prisma.person.create({
      data: { name, email },
      include: {
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json(person, { status: 201 });
  } catch (error) {
    console.error("POST /api/people", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That email is already in use." },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Failed to create person." },
      { status: 500 },
    );
  }
}
