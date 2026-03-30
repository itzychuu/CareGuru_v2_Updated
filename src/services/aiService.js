const API_KEY = import.meta.env.VITE_AI_API_KEY;

export async function getAIResponse(userMessage) {

  if (!API_KEY) {
    return `This is a demo AI response for: "${userMessage}". 
Please consult a medical professional for accurate advice.`;
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful medical assistant. Provide general wellness advice only. Never diagnose.",
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    return (
      data?.choices?.[0]?.message?.content ||
      "AI is currently unavailable."
    );

  } catch (error) {
    console.error("AI Error:", error);
    return "Sorry, I am unable to respond right now.";
  }
}