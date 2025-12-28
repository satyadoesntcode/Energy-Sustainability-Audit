import { GoogleGenAI, Type } from "@google/genai";
import { Audit, EEM, ComplianceAction } from "../types";

// NOTE: The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AIAnalysisResponse {
  analysis: string;
  recommendations: Omit<EEM, 'id'>[];
  complianceRoadmap: Omit<ComplianceAction, 'id'>[];
}

export const generateAuditAnalysis = async (audit: Audit): Promise<AIAnalysisResponse> => {
  try {
    const prompt = `
      You are an expert Senior Energy Auditor following ASHRAE Level 2 Audit procedures and the ECBC (Energy Conservation Building Code) standards.
      Analyze the following commercial building data.
      
      Building Data:
      - Name: ${audit.name}
      - Type: ${audit.buildingType}
      - Size: ${audit.grossFloorArea} sq ft
      - EPI: ${audit.epi} kWh/m²/yr (Benchmark: ${audit.benchmarkEpi || 'N/A'})
      - Current Rating: ${audit.complianceRating}
      
      Utility Data:
      ${JSON.stringify(audit.utilityData)}
      
      End Use Breakdown:
      ${JSON.stringify(audit.endUseBreakdown)}
      
      Provide a JSON response with:
      1. 'analysis': Executive summary (Markdown).
      2. 'recommendations': 2-3 General Efficiency Measures (EEMs).
      3. 'complianceRoadmap': A specific list of actions required to achieve the NEXT rating level (e.g., if Compliant, how to get to ECBC+; if Not Compliant, how to get to Compliant). Include investment estimates and responsible teams (e.g., "Facility Manager", "HVAC Vendor").
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  estimatedCost: { type: Type.NUMBER },
                  estimatedSavings: { type: Type.NUMBER },
                  paybackPeriod: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ['No-Cost/Low-Cost', 'Capital Investment', 'O&M'] }
                },
                required: ['title', 'description', 'estimatedCost', 'estimatedSavings', 'paybackPeriod', 'type']
              }
            },
            complianceRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  system: { type: Type.STRING, description: "Affected System e.g., HVAC" },
                  description: { type: Type.STRING, description: "Action to take" },
                  investment: { type: Type.NUMBER, description: "Total Investment Required" },
                  responsibleTeam: { type: Type.STRING, description: "Who leads this?" },
                  targetLevel: { type: Type.STRING, enum: ['ECBC Compliant', 'ECBC+', 'Super ECBC'] }
                },
                required: ['system', 'description', 'investment', 'responsibleTeam', 'targetLevel']
              }
            }
          },
          required: ['analysis', 'recommendations', 'complianceRoadmap']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysisResponse;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      analysis: "Error: Could not connect to AI service.",
      recommendations: [],
      complianceRoadmap: []
    };
  }
};