import { HfInference } from "@huggingface/inference";
import { NextResponse } from 'next/server';
import axios from 'axios';

const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    // Create a TransformStream for streaming
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();
    let fullResponse = '';

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
              fullResponse += content;
              await writer.write(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }
        }
        await sendPRDToNodeGen(fullResponse);
        await sendPRDToBackend(fullResponse)



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

async function sendPRDToNodeGen(fullResponse: string) {
  try {
    const nodeGenResponse = await fetch('http://localhost:3000/api/nodeGen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullResponse }),
    });
    const nodeGenData = await nodeGenResponse.json();
    console.log('Node Gen Response:', nodeGenData);
  } catch (error) {
    console.error('Error sending PRD to NodeGen:', error);
  }
}

async function sendPRDToBackend(data: string) {
  try {
    const response = await fetch('http://localhost:8000/api/prdGenData', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
    const backendData = await response.json();
    console.log('Backend Response:');
    return backendData;
  } catch (error) {
    console.error('Error sending PRD to Backend:', error);
  }
}
