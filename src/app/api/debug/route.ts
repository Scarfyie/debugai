import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export async function POST(req: NextRequest) {
  const { error, language } = await req.json();

  if (!error || error.trim().length === 0) {
    return NextResponse.json(
      { message: "No error provided" },
      { status: 400 }
    );
  }

  const prompt = `
You are an expert developer assistant. A developer is getting this ${language} error:

\`\`\`
${error}
\`\`\`

Respond in this EXACT JSON format with no extra text, no markdown, no backticks:
{
  "what": "Plain-English explanation of what this error means (2-3 sentences)",
  "why": "Why this error typically happens (2-3 sentences)",
  "fix": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "codeExample": "A short corrected code snippet if applicable, otherwise empty string"
}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const response = await model.generateContent(prompt);
    const raw = response.response.text();
    const clean = raw.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Failed to analyze error" },
      { status: 500 }
    );
  }
}