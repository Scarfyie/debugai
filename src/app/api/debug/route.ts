import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { error, language } = await req.json();

  if (!error || error.trim().length === 0) {
    return NextResponse.json(
      { message: "No error provided" },
      { status: 400 }
    );
  }

  // Simulate AI thinking delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock response
  return NextResponse.json({
    what: `This is a ${language} error that occurs when you try to access a property or call a method on a value that is undefined. The program expected an object or array but received undefined instead.`,
    why: "This typically happens when data hasn't loaded yet, an API call returned nothing, or a variable was never assigned a value before being used.",
    fix: [
      "Step 1: Check where the variable is defined and make sure it has a value before using it.",
      "Step 2: Add a conditional check like `if (data)` or use optional chaining `data?.map()`.",
      "Step 3: If fetching from an API, add a loading state and only render the component when data exists.",
    ],
    codeExample: `// ❌ Before (causes error)
const items = undefined;
items.map(item => item.name);

// ✅ After (safe)
const items = data ?? [];
items.map(item => item.name);`,
  });
}


//For Working API 
// import { NextRequest, NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

// export async function POST(req: NextRequest) {
//   const { error, language } = await req.json();

//   if (!error || error.trim().length === 0) {
//     return NextResponse.json(
//       { message: "No error provided" },
//       { status: 400 }
//     );
//   }

//   const prompt = `
// You are an expert developer assistant. A developer is getting this ${language} error:

// \`\`\`
// ${error}
// \`\`\`

// Respond in this EXACT JSON format with no extra text, no markdown, no backticks:
// {
//   "what": "Plain-English explanation of what this error means (2-3 sentences)",
//   "why": "Why this error typically happens (2-3 sentences)",
//   "fix": [
//     "Step 1: ...",
//     "Step 2: ...",
//     "Step 3: ..."
//   ],
//   "codeExample": "A short corrected code snippet if applicable, otherwise empty string"
// }
// `;

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
//     const response = await model.generateContent(prompt);
//     const raw = response.response.text();
//     const clean = raw.replace(/```json|```/g, "").trim();
//     const result = JSON.parse(clean);

//     return NextResponse.json(result);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { message: "Failed to analyze error" },
//       { status: 500 }
//     );
//   }
// }