import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { registrationSchema, toFieldErrors } from "@/lib/validation";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Please fix the highlighted fields.",
        errors: toFieldErrors(parsed.error),
      },
      { status: 422 },
    );
  }

  const d = parsed.data;

  // Honeypot filled in: pretend success, save nothing
  if (d.website) return NextResponse.json({ id: 0 }, { status: 201 });

  try {
    const created = await prisma.registration.create({
      data: {
        training: d.training,
        fullName: d.fullName,
        phone: d.phone,
        email: d.email || null,
        age: d.age,
        gender: d.gender,
        province: d.province,
        district: d.district,
        municipality: d.municipality,
        address: d.address,
        education: d.education,
        hasExperience: d.hasExperience,
        experienceNote: d.hasExperience ? d.experienceNote || null : null,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "This phone number is already registered.",
          errors: { phone: "This number is already registered" },
        },
        { status: 409 },
      );
    }
    console.error("Registration failed:", err);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
