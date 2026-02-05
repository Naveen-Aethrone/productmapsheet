
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ResearchResult } from "../types";

export const researchCompany = async (companyName: string): Promise<ResearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Research the company "${companyName}". 
Find and provide exactly these details in the following text format:
Website: [URL]
Category: [Brief description of what they sell/do]
Size: [Number of employees or size range from LinkedIn]
Countries: [List of countries where they have offices or major presence]
UAV Type: [Specify if they work with "Small UAVs", "Big UAVs", "Both", or "N/A"]
Launch Recovery: [Specify if they require "Launchers", "Parachute Recovery", "Both", or "N/A"]
Services: [Specify if they require "Design", "Simulation", "Software Integration", or a combination. Write "N/A" if none]
Manufacturing: [Specify "Yes" if they are a candidate for Precision Manufacturing services, otherwise "No"]
Composites: [Specify "Yes" if they are a candidate for Advanced Composites services, otherwise "No"]
Email: [Generic or contact email if public]
Phone: [Contact phone number]
LinkedIn: [Company LinkedIn page URL]

Use Google Search to find specific technical details related to their UAV/Drone operations and engineering requirements. If a specific field is not found, write "N/A".`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web?.uri)
      .filter(Boolean) || [];

    const lines = text.split('\n');
    const getVal = (label: string) => {
      const line = lines.find(l => l.toLowerCase().startsWith(label.toLowerCase()));
      return line ? line.split(':').slice(1).join(':').trim() : 'N/A';
    };

    return {
      website: getVal('Website'),
      category: getVal('Category'),
      size: getVal('Size'),
      countries: getVal('Countries'),
      uavType: getVal('UAV Type'),
      launchRecovery: getVal('Launch Recovery'),
      servicesRequired: getVal('Services'),
      manufacturing: getVal('Manufacturing'),
      composites: getVal('Composites'),
      email: getVal('Email'),
      phone: getVal('Phone'),
      linkedin: getVal('LinkedIn'),
      sources: sources
    };
  } catch (error: any) {
    console.error("Gemini Research Error:", error);
    throw new Error(error.message || "Failed to research company");
  }
};
