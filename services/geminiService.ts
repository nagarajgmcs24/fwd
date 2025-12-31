
import { GoogleGenAI, Type, Part } from "@google/genai";

export const analyzeIssue = async (title: string, description: string, base64Image?: string) => {
  // Use named parameter for apiKey and direct process.env usage
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const parts: Part[] = [
      { text: `Analyze this infrastructure issue for a local ward management system in Bengaluru.
      Title: ${title}
      Description: ${description}
      
      Determine if this is a genuine public issue. If it looks fake or harmful, set priority to Low and mention it in the summary.
      Provide a concise summary, suggest an appropriate category (Roads, Waste Management, Lighting, Water, Public Safety, Sewage), and recommend a priority level (Low, Medium, High).` }
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
      // Use correct contents structure as per guidelines
      contents: { parts },
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

    // Access text property directly
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
};
