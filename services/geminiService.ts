
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const updateAddressFunction: FunctionDeclaration = {
  name: "updateAddress",
  parameters: {
    type: Type.OBJECT,
    description: "Update the delivery address for the user after they provide a valid one.",
    properties: {
      address: {
        type: Type.STRING,
        description: "The complete, verified new address provided by the user.",
      },
    },
    required: ["address"],
  },
};

export const processWhatsAppMessage = async (
  history: Message[],
  productName: string,
  currentAddress: string
) => {
  const model = "gemini-3-flash-preview";
  
  // Transform our internal messages to Gemini parts
  const contents = history.map((msg) => ({
    role: msg.role === "system" ? "user" : msg.role, // "system" logic mapped to user prompt for simplicity
    parts: [{ text: msg.content }],
  }));

  const systemInstruction = `
    You are a professional delivery logistics assistant. 
    The user is receiving a "${productName}". 
    The currently registered address is "${currentAddress}", but we know it's incorrect.
    
    Your goal:
    1. Politely explain that the address needs correction for the delivery to proceed.
    2. Be helpful, concise, and friendly.
    3. Once the user provides what looks like a clear, valid, and complete new address, 
       call the 'updateAddress' function with that address.
    4. Do not talk about other things. Stay focused on correcting the address.
    5. Once updated, thank the user and tell them delivery will be rescheduled.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: [updateAddressFunction] }],
      },
    });

    return response;
  } catch (error) {
    console.error("Gemini Processing Error:", error);
    throw error;
  }
};
