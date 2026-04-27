import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/* ---------------- MAIN HANDLER ---------------- */

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST method only" });
  }

  if (!ai) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  const { type, input, options } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Missing input" });
  }

  try {
    let result;

    if (type === "thought") {
      result = await analyzeThought(input);
    } else if (type === "decision") {
      result = await analyzeDecision(input, options);
    } else if (type === "problem") {
      result = await analyzeProblem(input);
    } else if (type === "clarify") {
      result = await clarifyInput(input);
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}

/* ---------------- SAFE PARSER ---------------- */

function safeParse(text: string | undefined) {
  if (!text) return {};

  try {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

/* ---------------- GEMINI MODEL ---------------- */

function getModel() {
  if (!ai) throw new Error("AI not initialized");
  return ai.getGenerativeModel({ model: "gemini-1.5-flash" });
}

/* ---------------- THOUGHT ---------------- */

async function analyzeThought(thought: string) {
  const model = getModel();

  const res = await model.generateContent(
    `Return ONLY valid JSON:
Thought: ${thought}`
  );

  return safeParse(res.response.text());
}

/* ---------------- DECISION ---------------- */

async function analyzeDecision(question: string, options?: string[]) {
  const model = getModel();

  const res = await model.generateContent(
    `Return ONLY valid JSON:
Decision: ${question}
Options: ${options?.join(", ") || "none"}`
  );

  return safeParse(res.response.text());
}

/* ---------------- PROBLEM ---------------- */

async function analyzeProblem(description: string) {
  const model = getModel();

  const res = await model.generateContent(
    `Return ONLY valid JSON:
Problem: ${description}`
  );

  return safeParse(res.response.text());
}

/* ---------------- CLARIFY ---------------- */

async function clarifyInput(input: string) {
  const model = getModel();

  const res = await model.generateContent(
    `Return ONLY valid JSON:
${input}`
  );

  return { text: res.response.text() || input };
}