import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  if (!ai) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  const { type, input, options } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'Missing input content' });
  }

  try {
    let result;
    switch (type) {
      case 'thought':
        result = await analyzeThought(input);
        break;
      case 'decision':
        result = await analyzeDecision(input, options);
        break;
      case 'problem':
        result = await analyzeProblem(input);
        break;
      case 'clarify':
        result = await clarifyInput(input);
        break;
      default:
        return res.status(400).json({ error: 'Invalid analysis type requested' });
    }
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed in production' });
  }
}

async function analyzeThought(thought: string) {
  if (!ai) throw new Error("AI not initialized");
  
  const prompt = `
    Thought: "${thought}"
    You are a thinking companion—human, calm, thoughtful, and supportive.
    
    RESPONSE EXPERIENCE MODEL:
    1. Human Opening: Start with a natural, emotionally aware sentence.
    2. Collaborative Framing: (e.g., "Let's explore this together").
    3. Insight Before Structure: A short human insight.
    4. Structured Analysis: Outcomes, Risks.
    5. Interpretation Layer: A summary.
    6. Reflective Question: End with a question.
    
    SAFETY: If harmful, set isHarmful: true and provide supportMessage.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
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

  return safeParse(response.text);
}

async function analyzeDecision(question: string, providedOptions?: string[]) {
  if (!ai) throw new Error("AI not initialized");

  const prompt = `
    Decision: "${question}"
    Options: ${providedOptions?.length ? providedOptions.join(", ") : "None provided"}
    You are a thinking companion.
    RESPONSE EXPERIENCE MODEL: Hook, Framing, Insight, Options (Pros/Cons), Interpretation, Reflective Question.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
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

  return safeParse(response.text);
}

async function analyzeProblem(description: string) {
  if (!ai) throw new Error("AI not initialized");

  const prompt = `
    Problem: "${description}"
    You are a thinking companion.
    RESPONSE EXPERIENCE MODEL: Hook, Framing, Insight, Root Causes, Solutions (Pros/Cons/Difficulty), Step-by-Step, Interpretation, Question.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 2048,
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
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
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

  return safeParse(response.text);
}

async function clarifyInput(input: string) {
  if (!ai) throw new Error("AI not initialized");

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: `Clarify the following user input to be more structured and clear: "${input}"`,
  });
  return { text: response.text || input };
}

function safeParse(text: string | undefined): any {
  if (!text) return {};
  try {
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return {};
  }
}
