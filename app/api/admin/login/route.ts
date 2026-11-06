import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminCredentials } from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (typeof username !== "string" || typeof password !== "string" ||
        !verifyAdminCredentials(username, password)) {
      return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
    }
    await createAdminSession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ message: "Admin login is not configured correctly." }, { status: 500 });
  }
}
