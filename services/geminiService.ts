import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePhotoCaption = async (base64Image: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Memories...";

  try {
    // Clean base64 string if it contains metadata header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: cleanBase64,
            },
          },
          {
            text: "Write a very short, cute, handwritten-style diary caption for this photo (max 6 words). Do not use hashtags. Keep it sentimental or fun.",
          },
        ],
      },
      config: {
        temperature: 0.7,
      },
    });

    return response.text?.trim() || "Captured moment";
  } catch (error) {
    console.error("Gemini caption generation error:", error);
    return "My awesome photo";
  }
};