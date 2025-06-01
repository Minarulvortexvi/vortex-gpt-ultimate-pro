import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { message, apiKey, provider, model } = await req.json();
  
  if (!message || !apiKey) {
    return NextResponse.json({ error: "Missing message or API key" }, { status: 400 });
  }
  
  if (provider === "grok") {
    try {
      const response = await axios.post(
        "https://api.x.ai/v1/generate",
        {
          prompt: message,
          model: "grok-3",
        },
        {
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      return NextResponse.json({ reply: response.data.generated_text });
    } catch (error) {
      console.error("Grok API error:", error);
      return NextResponse.json({ error: "Failed to chat: " + (error as Error).message }, { status: 500 });
    }
  }
  
  if (provider === "huggingface") {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model || "google/gemma-2-27b"}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: message, parameters: { max_length: 200, temperature: 0.7 } }),
        }
      );
      
      const data = await response.json();
      if (!data || !data[0]?.generated_text) {
        return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
      }
      
      return NextResponse.json({ reply: data[0].generated_text });
    } catch (error) {
      console.error("Hugging Face API error:", error);
      return NextResponse.json({ error: "Failed to chat: " + (error as Error).message }, { status: 500 });
    }
  }
  
  return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
}