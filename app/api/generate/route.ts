export const runtime = "edge";

// Validate OpenAI API key format
// Supports both legacy keys (sk-abc...) and project keys (sk-proj-abc...)
function isValidApiKey(key: string): boolean {
  // Legacy format: sk-<32+ chars>
  // Project format: sk-proj-<32+ chars>  
  return /^sk-(proj-)?[a-zA-Z0-9_-]{32,}$/.test(key);
}

// Parse error message to user-friendly format
function parseOpenAIError(errorObj: { type?: string; message?: string; code?: string }): string {
  const code = errorObj.code || errorObj.type || "";
  
  if (code.includes("insufficient_quota") || code.includes("quota")) {
    return "Quota exceeded. For project API keys (sk-proj-...), check your PROJECT budget limit at platform.openai.com/settings → select your project → Limits.";
  }
  if (code.includes("invalid_api_key") || code.includes("api_key")) {
    return "Invalid or expired API key. Please check your key at platform.openai.com/api-keys";
  }
  if (code.includes("rate_limit")) {
    return "Rate limit exceeded. Please try again in a few seconds.";
  }
  
  return errorObj.message || "An error occurred while generating the response.";
}

export async function POST(req: Request) {
  try {
    const { apiKey, messages, model } = await req.json();

    // Validate required fields
    if (!apiKey || !messages) {
      return new Response(
        JSON.stringify({ error: "Missing apiKey or messages" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate API key format (don't log the key)
    if (!isValidApiKey(apiKey)) {
      return new Response(
        JSON.stringify({ error: "Invalid API key format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages must be a non-empty array" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Use specified model or default to gpt-4o-mini
    const selectedModel = model || "gpt-4o-mini";

    // Make direct call to OpenAI API for better error handling
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages,
        stream: true,
      }),
    });

    // Check for non-2xx responses
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      const errorMessage = parseOpenAIError(errorData.error || {});
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: openaiResponse.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Stream the response, parsing SSE and extracting content
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        const reader = openaiResponse.body?.getReader();
        if (!reader) {
          controller.enqueue(encoder.encode("__ERROR__:" + JSON.stringify({ error: "No response body" })));
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  
                  // Check for error in streamed response
                  if (parsed.error) {
                    const errorMessage = parseOpenAIError(parsed.error);
                    controller.enqueue(encoder.encode("__ERROR__:" + JSON.stringify({ error: errorMessage })));
                    controller.close();
                    return;
                  }
                  
                  // Extract content delta
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch {
                  // Skip invalid JSON lines
                }
              }
            }
          }
          controller.close();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Stream error";
          controller.enqueue(encoder.encode("__ERROR__:" + JSON.stringify({ error: message })));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error: unknown) {
    console.error("Generate API error:", error instanceof Error ? error.message : "Unknown error");

    return new Response(
      JSON.stringify({ error: "Failed to generate response. Please try again." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
