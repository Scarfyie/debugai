import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    const sessions = await prisma.session.findMany();
    const accounts = await prisma.account.findMany();
    const debugs = await prisma.debug.findMany();

    return NextResponse.json({ 
      users,
      sessions,
      accounts,
      debugs,
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error),
    });
  }
}