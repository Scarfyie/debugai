import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { error, language } = await req.json();

  if (!error || error.trim().length === 0) {
    return NextResponse.json(
      { message: "No error provided" },
      { status: 400 }
    );
  }

  // Mock delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const result = {
    what: `This is a ${language} error that occurs when you try to access a property on undefined.`,
    why: "This typically happens when data hasn't loaded yet or a variable was never assigned.",
    fix: [
      "Step 1: Check where the variable is defined.",
      "Step 2: Add optional chaining like data?.map().",
      "Step 3: Add a loading state before rendering.",
    ],
    codeExample: `// ✅ Safe version\nconst items = data ?? [];\nitems.map(item => item.name);`,
  };

  // Get session
  const session = await getServerSession(authOptions);
  console.log("SESSION:", JSON.stringify(session?.user));

  if (session?.user?.id) {
    try {
      const saved = await prisma.debug.create({
        data: {
          userId: session.user.id,
          language,
          error,
          what: result.what,
          why: result.why,
          fix: result.fix,
          code: result.codeExample,
        },
      });
      console.log("✅ Saved to DB:", saved.id);
    } catch (err) {
      console.error("🔴 DB Save Error:", err);
    }
  } else {
    console.log("⚠️ No session — not saving");
  }

  return NextResponse.json(result);
}