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

async function safeRequest(body: any) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Server error");
  }

  return response.json();
}

export const geminiService = {
  async analyzeThought(thought: string): Promise<ThoughtAnalysis> {
    return safeRequest({ type: "thought", input: thought });
  },

  async analyzeDecision(
    question: string,
    providedOptions?: string[]
  ): Promise<DecisionAnalysis> {
    return safeRequest({
      type: "decision",
      input: question,
      options: providedOptions,
    });
  },

  async analyzeProblem(description: string): Promise<ProblemAnalysis> {
    return safeRequest({
      type: "problem",
      input: description,
    });
  },

  async clarifyInput(input: string): Promise<string> {
    try {
      const data = await safeRequest({
        type: "clarify",
        input,
      });

      return data?.text || input;
    } catch {
      return input;
    }
  },
};
