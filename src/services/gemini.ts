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
    difficulty: "Easy" | "Medium" | "Hard";
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

export const geminiService = {
  async analyzeThought(thought: string): Promise<ThoughtAnalysis> {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'thought', input: thought }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Analysis failed');
    }
    return response.json();
  },

  async analyzeDecision(question: string, providedOptions?: string[]): Promise<DecisionAnalysis> {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'decision', input: question, options: providedOptions }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Analysis failed');
    }
    return response.json();
  },

  async analyzeProblem(description: string): Promise<ProblemAnalysis> {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'problem', input: description }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Analysis failed');
    }
    return response.json();
  },

  async clarifyInput(input: string): Promise<string> {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'clarify', input }),
    });
    if (!response.ok) return input;
    const data = await response.json();
    return data.text || input;
  },
};
