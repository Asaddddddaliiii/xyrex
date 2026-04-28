import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export default async function handler(req: any, res: any) {
  try {
    // 1. Method check
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST only" });
    }

    // 2. API key check
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    // 3. Init AI safely
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { type, input, options } = req.body || {};

    if (!input) {
      return res.status(400).json({ error: "Missing input" });
    }

    let prompt = "";

    // 4. Create prompt safely
    if (type === "thought") {
      prompt = `Respond in JSON.\nThought: ${input}`;
    } else if (type === "decision") {
      prompt = `Respond in JSON.\nDecision: ${input}\nOptions: ${options?.join(", ") || "none"}`;
    } else if (type === "problem") {
      prompt = `Respond in JSON.\nProblem: ${input}`;
    } else if (type === "clarify") {
      prompt = `Clarify this:\n${input}`;
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    // 5. Call Gemini safely
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.() || "";

    // 6. Safe JSON parse
    let data;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      data = JSON.parse(clean);
    } catch {
      data = { text }; // fallback
    }

    return res.status(200).json(data);

  } catch (error: any) {
    console.error("FULL ERROR:", error);

    return res.status(500).json({
      error: "Function crashed",
      details: error?.message || "Unknown error"
    });
  }
}