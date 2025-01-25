import { HfInference } from "@huggingface/inference";
import { NextResponse } from 'next/server';

const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    // Create a TransformStream for streaming
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start processing in the background
    (async () => {
      try {
        const chatStream = await client.chatCompletionStream({
          // model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
          // model: "meta-llama/Meta-Llama-3-70B-Instruct",
          // model: "HuggingFaceH4/zephyr-7b-alpha",
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages,
          parameters: {
            max_new_tokens: 2048,
            temperature: 0.2,
            top_p: 0.95,
            repetition_penalty: 1.15,
          }
        });

        for await (const chunk of chatStream) {
          if (chunk.choices && chunk.choices.length > 0) {
            const content = chunk.choices[0].delta.content;
            if (content) {
              await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
        }
      } catch (error) {
        console.error('Stream error:', error);
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}