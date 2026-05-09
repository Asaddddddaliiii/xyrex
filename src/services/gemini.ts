import { GoogleGenAI, Type } from "@google/genai";

export interface DecisionAnalysis {
  openingLine: string;
  collaborativeFraming: string;
  options: {
    title: string;
    pros: string[];
    cons: string[];
  }[];
  tradeOffs: string;
  insightLayer: string;
  interpretationLayer: string;
  reflectiveQuestion: string;
}

export interface ProblemAnalysis {
  openingLine: string;
  collaborativeFraming: string;
  rootCauses: string[];
  solutions: {
    title: string;
    pros: string[];
    cons: string[];
    difficulty: string;
  }[];
  stepByStepPlan: string[];
  insightLayer: string;
  interpretationLayer: string;
  reflectiveQuestion: string;
}

export interface ThoughtAnalysis {
  openingLine: string;
  collaborativeFraming: string;
  analysis: string;
  outcomes: string[];
  risks: string[];
  longTermImpact: string;
  reflectionQuestions: string[];
  insightLayer: string;
  interpretationLayer: string;
  reflectiveQuestion: string;
  isHarmful: boolean;
  supportMessage?: string;
}

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    // Note: In AI Studio, GEMINI_API_KEY is usually injected.
    // If it's missing, we inform the user to check their Secrets.
    throw new Error("GEMINI_API_KEY is not configured. Please add it to Settings -> Secrets.");
  }
  return new GoogleGenAI({ apiKey });
};

const MODEL_NAME = "gemini-3-flash-preview";

export const geminiService = {
  async analyzeThought(thought: string): Promise<ThoughtAnalysis> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
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

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      throw new Error("Failed to parse analysis response");
    }
  },

  async analyzeDecision(
    question: string,
    providedOptions?: string[]
  ): Promise<DecisionAnalysis> {
    const ai = getAI();
    const optionsText = providedOptions && providedOptions.length > 0 ? `Options: ${providedOptions.join(", ")}` : "No specific options provided.";
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
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

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      throw new Error("Failed to parse analysis response");
    }
  },

  async analyzeProblem(description: string): Promise<ProblemAnalysis> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
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

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      throw new Error("Failed to parse analysis response");
    }
  },

  async clarifyInput(input: string): Promise<string> {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Rewrite this user input to be clearer and more structured, keeping the original meaning: "${input}"`,
      });
      return response.text || input;
    } catch {
      return input;
    }
  },
};
