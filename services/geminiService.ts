
import { GoogleGenAI, Type, Part } from "@google/genai";

export const analyzeIssue = async (title: string, description: string, base64Image?: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const parts: Part[] = [
      { text: `Analyze this infrastructure issue for a local ward management system:
      Title: ${title}
      Description: ${description}
      
      Provide a concise summary, suggest an appropriate category (e.g., Roads, Waste Management, Lighting, Water, Public Safety), and recommend a priority level (Low, Medium, High).` }
    ];

    if (base64Image) {
      const imageData = base64Image.split(',')[1];
      const mimeType = base64Image.split(',')[0].split(':')[1].split(';')[0];
      
      parts.push({
        inlineData: {
          data: imageData,
          mimeType: mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: 'user', parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            category: { type: Type.STRING },
            priority: { type: Type.STRING },
            suggestedAction: { type: Type.STRING }
          },
          required: ["summary", "category", "priority"]
        }
      }
    });

    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Analysis failed", error);
    return null;
  }
};
