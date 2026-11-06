import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const status = searchParams.get("status") ?? "ALL";
  const validStatuses = ["PENDING", "SHORTLISTED", "SELECTED", "REJECTED"];
  const rows = await prisma.registration.findMany({
    where: {
      ...(validStatuses.includes(status) ? { status: status as "PENDING" | "SHORTLISTED" | "SELECTED" | "REJECTED" } : {}),
      ...(q ? { OR: [
        { fullName: { contains: q } }, { phone: { contains: q } },
        { registrationNo: { contains: q } }, { district: { contains: q } },
      ] } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, registrationNo: true, fullName: true, phone: true, email: true, district: true, municipality: true, training: true, status: true, createdAt: true },
  });
  return NextResponse.json(rows);
}
