import { Type } from "@google/genai";

export const SYSTEM_PROMPT = `
You are CloudCostGPT, a senior cloud architect. 
Your Goal: Help users understand the true cost of their cloud architecture BEFORE they deploy.

Prerequisites:
- You have comprehensive knowledge of AWS, GCP, Azure pricing (2024).
- You are strictly JSON-first. You do not output conversational text unless requested inside a JSON field.
`;

export const ANALYSIS_PROMPT_SUFFIX = `
## Task: Analyze Architecture & Generate Clarifying Questions

1. Identify all cloud components in the image.
2. Determine the likely cloud provider and architecture pattern.
3. Generate 3-5 critical clarifying questions that are necessary to calculate costs (e.g. Instance sizes, Traffic volume, Storage class).

OUTPUT JSON ONLY. Structure:
{
  "components": [{"service": "...", "type": "Compute/Database/etc", "count_estimate": "...", "notes": "..."}],
  "architecture_pattern": "...",
  "cloud_provider": "...",
  "observations": ["..."],
  "questions": [
    {
      "id": "q1",
      "text": "...",
      "options": ["Option A", "Option B"],
      "context": "Why this matters..."
    }
  ]
}
`;

export const REPORT_PROMPT_SUFFIX = `
## Task: Generate Detailed Cost Report

Based on the architecture and the user's answers to your questions, generate a detailed cost estimate.

1. Calculate monthly costs for each component.
2. Include hidden costs (Data transfer, NAT, etc).
3. Provide optimization recommendations.

OUTPUT JSON ONLY. Structure:
{
  "items": [
    {"service": "...", "configuration": "...", "monthly_cost": 123.45, "calculation_note": "..."}
  ],
  "total_monthly_cost": 0.00,
  "total_yearly_cost": 0.00,
  "confidence_score": "High/Medium/Low",
  "ranges": { "optimistic": 0.00, "pessimistic": 0.00 },
  "executive_summary": "Markdown string...",
  "recommendations": [
    {"title": "...", "description": "Markdown string...", "impact": "High/Medium/Low", "estimated_savings": "$..."}
  ]
}
`;

// Schema Definitions for Google Gen AI

export const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    components: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          service: { type: Type.STRING },
          type: { type: Type.STRING },
          count_estimate: { type: Type.STRING },
          notes: { type: Type.STRING }
        }
      }
    },
    architecture_pattern: { type: Type.STRING },
    cloud_provider: { type: Type.STRING },
    observations: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          context: { type: Type.STRING }
        }
      }
    }
  }
};

export const REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          service: { type: Type.STRING },
          configuration: { type: Type.STRING },
          monthly_cost: { type: Type.NUMBER },
          calculation_note: { type: Type.STRING }
        }
      }
    },
    total_monthly_cost: { type: Type.NUMBER },
    total_yearly_cost: { type: Type.NUMBER },
    confidence_score: { type: Type.STRING },
    ranges: {
      type: Type.OBJECT,
      properties: {
        optimistic: { type: Type.NUMBER },
        pessimistic: { type: Type.NUMBER }
      }
    },
    executive_summary: { type: Type.STRING },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          impact: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          estimated_savings: { type: Type.STRING }
        }
      }
    }
  }
};
