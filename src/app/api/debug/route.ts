import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const FREE_DAILY_LIMIT = 3;

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const today = getTodayString();

  // Get or create today's usage log
  const usageLog = await prisma.usageLog.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: {},
    create: { userId: user.id, date: today, count: 0 },
  });

  // Enforce limit
  if (usageLog.count >= FREE_DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: "limit_reached",
        message: "You've used all 3 free debugs for today. Upgrade to Pro for unlimited access.",
        usageCount: usageLog.count,
        limit: FREE_DAILY_LIMIT,
      },
      { status: 429 }
    );
  }

  // Parse request
  const { error, language } = await req.json();

  if (!error || !language) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Increment usage BEFORE running (prevents race conditions)
  await prisma.usageLog.update({
    where: { userId_date: { userId: user.id, date: today } },
    data: { count: { increment: 1 } },
  });

  // --- MOCK RESPONSE (swap for Gemini in Step 7) ---
  const mockResult = {
    what: `This is a ${language} error indicating an unexpected condition in your code.`,
    why: "This typically happens when a variable is undefined or a required dependency is missing.",
    fix: [
      "Check that all variables are properly initialized before use",
      "Verify your imports and dependencies are correct",
      "Look at the stack trace to identify the exact failing line",
    ],
    codeExample: `// Fixed example\nconst value = someVariable ?? 'default';\nconsole.log(value);`,
  };

  // Save to history — fields match Debug schema exactly
  const debug = await prisma.debug.create({
    data: {
      userId: user.id,
      error,
      language,
      what: mockResult.what,
      why: mockResult.why,
      fix: mockResult.fix,
      code: mockResult.codeExample,
    },
  });

  return NextResponse.json({ result: mockResult, id: debug.id });
}