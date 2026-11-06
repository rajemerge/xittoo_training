import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const registration = await prisma.registration.findUnique({ where: { id: Number(id) } });
  if (!registration) return NextResponse.json({ message: "Registration not found." }, { status: 404 });
  return NextResponse.json(registration);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();
  const allowed = ["PENDING", "SHORTLISTED", "SELECTED", "REJECTED"];
  if (!allowed.includes(status)) return NextResponse.json({ message: "Invalid status." }, { status: 400 });
  try {
    const updated = await prisma.registration.update({
      where: { id: Number(id) }, data: { status },
      select: { id: true, status: true, updatedAt: true },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Registration not found." }, { status: 404 });
  }
}
