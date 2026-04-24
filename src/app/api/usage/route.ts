import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FREE_DAILY_LIMIT = 3;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const today = new Date().toISOString().split("T")[0];
  const usageLog = await prisma.usageLog.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });

  const count = usageLog?.count ?? 0;
  return NextResponse.json({
    usageCount: count,
    limit: FREE_DAILY_LIMIT,
    remaining: Math.max(0, FREE_DAILY_LIMIT - count),
    limitReached: count >= FREE_DAILY_LIMIT,
  });
}