
import { GoogleGenAI, Type } from "@google/genai";

export const analyzeIssue = async (title: string, description: string, base64Image?: string) => {
  // Use process.env.API_KEY directly for initialization as per @google/genai guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const parts: any[] = [
      { text: `Analyze this infrastructure issue for a local ward management system:
      Title: ${title}
      Description: ${description}
      
      Provide a concise summary, suggest an appropriate category (e.g., Roads, Waste Management, Lighting, Water, Public Safety), and recommend a priority level (Low, Medium, High).` }
    ];

    if (base64Image) {
      // Extract base64 data from the data URL
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

    // Access the .text property directly (not as a method) to extract content
    const jsonStr = response.text || "{}";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Analysis failed", error);
    return null;
  }
};
