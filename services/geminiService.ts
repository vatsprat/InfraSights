import { GoogleGenAI } from "@google/genai";
import { 
  SYSTEM_PROMPT, 
  ANALYSIS_PROMPT_SUFFIX, 
  REPORT_PROMPT_SUFFIX,
  ANALYSIS_SCHEMA,
  REPORT_SCHEMA 
} from "../constants";
import { AnalysisResult, CostReport, Question } from "../types";

const getApiKey = (): string => {
  return process.env.API_KEY as string;
};

// Stage 1: Vision Analysis -> JSON
export const analyzeArchitecture = async (
  imageBase64: string, 
  mimeType: string, 
  userContext: string
): Promise<AnalysisResult> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";

  try {
    const response = await ai.models.generateContent({
      model: model,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA
      },
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64
            }
          },
          {
            text: `User Context: "${userContext}"\n\n${ANALYSIS_PROMPT_SUFFIX}`
          }
        ]
      }
    });

    if (!response.text) throw new Error("No response from model");
    return JSON.parse(response.text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

// Stage 2: Cost Estimation -> JSON
export const generateCostReport = async (
  analysisResult: AnalysisResult,
  userAnswers: Record<string, string>
): Promise<CostReport> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash"; // Using flash for speed, could switch to pro for complex math

  // Format Q&A for the model
  const qaString = analysisResult.questions.map(q => 
    `Q: ${q.text}\nA: ${userAnswers[q.id] || "Not specified"}`
  ).join("\n\n");

  const prompt = `
    Based on the previous analysis of the architecture and the user's answers below, generate the final cost report.

    PREVIOUS ANALYSIS:
    ${JSON.stringify(analysisResult, null, 2)}

    USER ANSWERS TO CLARIFYING QUESTIONS:
    ${qaString}

    ${REPORT_PROMPT_SUFFIX}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1, // Very low for math consistency
        responseMimeType: "application/json",
        responseSchema: REPORT_SCHEMA
      },
      contents: {
        parts: [{ text: prompt }]
      }
    });

    if (!response.text) throw new Error("No response from model");
    return JSON.parse(response.text) as CostReport;
  } catch (error) {
    console.error("Gemini Report Error:", error);
    throw error;
  }
};
