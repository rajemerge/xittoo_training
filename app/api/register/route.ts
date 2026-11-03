import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { registrationSchema, toFieldErrors } from "@/lib/validation";

function generateRegistrationNo(id: number) {
  const year = new Date().getFullYear();

  return `XT-${year}-${String(id).padStart(3, "0")}`;
}

async function verifyCaptcha(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    throw new Error("Turnstile secret key is missing");
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) return false;

  const result = await response.json();

  return result.success === true;
}

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

  if (d.website) {
    return NextResponse.json({ id: 0 }, { status: 201 });
  }

  if (!d.captchaToken) {
    return NextResponse.json(
      { message: "Please complete the CAPTCHA." },
      { status: 400 },
    );
  }

  try {
    const isValid = await verifyCaptcha(d.captchaToken);

    if (!isValid) {
      return NextResponse.json(
        {
          message: "CAPTCHA verification failed. Please try again.",
        },
        { status: 403 },
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const registration = await tx.registration.create({
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

          registrationNo: crypto.randomUUID().replace(/-/g, "").slice(0, 20),
        },
        select: {
          id: true,
        },
      });

      const registrationNo = generateRegistrationNo(registration.id);

      return await tx.registration.update({
        where: {
          id: registration.id,
        },
        data: {
          registrationNo,
        },
        select: {
          id: true,
          registrationNo: true,
        },
      });
    });

    return NextResponse.json(
      {
        id: created.id,
        registrationNo: created.registrationNo,
        message: "Registration successful!",
      },
      { status: 201 },
    );
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "This phone number is already registered.",
          errors: {
            phone: "This number is already registered",
          },
        },
        { status: 409 },
      );
    }

    console.error("Registration failed:", err);

    return NextResponse.json(
      {
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
