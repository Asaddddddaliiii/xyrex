import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.error("GEMINI_API_KEY is missing or using placeholder value.");
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
  }

  const { type, input, options } = req.body;

  if (!input) {
    return res.status(400).json({ error: "Missing input content" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = "gemini-3-flash-preview";
    let result;

    switch (type) {
      case "thought":
        result = await analyzeThought(ai, modelName, input);
        break;
      case "decision":
        result = await analyzeDecision(ai, modelName, input, options);
        break;
      case "problem":
        result = await analyzeProblem(ai, modelName, input);
        break;
      case "clarify":
        result = await clarifyInput(ai, modelName, input);
        break;
      default:
        return res.status(400).json({ error: "Invalid analysis type" });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ 
      error: "Analysis failed", 
      details: error.message || "Unknown error" 
    });
  }
}

async function analyzeThought(ai: GoogleGenAI, model: string, thought: string) {
  const response = await ai.models.generateContent({
    model,
    contents: `Thought: "${thought}"\nYou are a thinking companion—human, calm, and supportive. Analyze this thought with depth and empathy.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          openingLine: { type: Type.STRING },
          collaborativeFraming: { type: Type.STRING },
          analysis: { type: Type.STRING },
          outcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          longTermImpact: { type: Type.STRING },
          reflectionQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          insightLayer: { type: Type.STRING },
          interpretationLayer: { type: Type.STRING },
          reflectiveQuestion: { type: Type.STRING },
          isHarmful: { type: Type.BOOLEAN },
          supportMessage: { type: Type.STRING },
        },
        required: ["openingLine", "collaborativeFraming", "analysis", "outcomes", "risks", "longTermImpact", "reflectionQuestions", "insightLayer", "interpretationLayer", "reflectiveQuestion", "isHarmful"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

async function analyzeDecision(ai: GoogleGenAI, model: string, question: string, options?: string[]) {
  const optionsText = options && options.length > 0 ? `Options: ${options.join(", ")}` : "No specific options provided.";
  const response = await ai.models.generateContent({
    model,
    contents: `Decision: "${question}"\n${optionsText}\nYou are a decision-making helper. Explore the trade-offs naturally.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          openingLine: { type: Type.STRING },
          collaborativeFraming: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["title", "pros", "cons"],
            },
          },
          tradeOffs: { type: Type.STRING },
          insightLayer: { type: Type.STRING },
          interpretationLayer: { type: Type.STRING },
          reflectiveQuestion: { type: Type.STRING },
        },
        required: ["openingLine", "collaborativeFraming", "options", "tradeOffs", "insightLayer", "interpretationLayer", "reflectiveQuestion"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

async function analyzeProblem(ai: GoogleGenAI, model: string, description: string) {
  const response = await ai.models.generateContent({
    model,
    contents: `Problem: "${description}"\nYou are a problem-solving ally. Break it down into root causes and actionable solutions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          openingLine: { type: Type.STRING },
          collaborativeFraming: { type: Type.STRING },
          rootCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
          solutions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                difficulty: { type: Type.STRING },
              },
              required: ["title", "pros", "cons", "difficulty"],
            },
          },
          stepByStepPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
          insightLayer: { type: Type.STRING },
          interpretationLayer: { type: Type.STRING },
          reflectiveQuestion: { type: Type.STRING },
        },
        required: ["openingLine", "collaborativeFraming", "rootCauses", "solutions", "stepByStepPlan", "insightLayer", "interpretationLayer", "reflectiveQuestion"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

async function clarifyInput(ai: GoogleGenAI, model: string, input: string) {
  const response = await ai.models.generateContent({
    model,
    contents: `Rewrite this user input to be clearer and more structured, keeping the original meaning: "${input}"`,
  });
  return { text: response.text || input };
}
