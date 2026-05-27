import { GoogleGenAI } from "@google/genai";

// Inicialización segura para que no crashee la app si falta la API key
let ai: any = null;
try {
  // Vite usa import.meta.env, y evitamos que crashee pasándole un string vacío si no existe
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.warn("AI no inicializada (Falta API key)");
}

export async function generateReminderMessage(clientName: string, shopName: string, serviceName: string, timeUntil: string) {
  try {
    if (!ai) throw new Error("AI no configurada");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Eres un asistente virtual de una aplicación de reservas premium llamada STEYLOOK. 
      Escribe un mensaje de notificación corto y elegante para el cliente ${clientName}.
      Se le recordará su cita para el servicio de "${serviceName}" en "${shopName}".
      La cita es en "${timeUntil}".
      El tono debe ser profesional, cercano y motivador. Máximo 25 palabras.`,
    });
    return response.text?.trim() || `Hola ${clientName}, STEYLOOK te recuerda tu cita hoy en ${shopName} para ${serviceName}. ¡Te esperamos!`;
  } catch (error) {
    console.error("Error generating reminder:", error);
    return `Hola ${clientName}, recordatorio de tu cita en ${shopName} para ${serviceName}.`;
  }
}

export async function generateWelcomeMessage(clientName: string) {
    try {
      if (!ai) throw new Error("AI no configurada");
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Escribe un mensaje de bienvenida corto (máximo 15 palabras) para ${clientName} que acaba de entrar a la app Steylook. 
        Menciona que encontrará los mejores barberos y salones.`,
      });
      return response.text?.trim() || `¡Bienvenido a StyleBook, ${clientName}! Encuentra tu mejor estilo hoy.`;
    } catch (error) {
      return `¡Bienvenido a StyleBook, ${clientName}!`;
    }
}
