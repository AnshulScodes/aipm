import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";

export async function POST(req: Request) {
  try {
    const { fullResponse } = await req.json(); // Expecting the full response string
    // console.log('Backend Received full response'); // Log the received full response

    // Generate nodes from the full response
    const nodes = await generateNodes(fullResponse);
    // console.log('Generated nodes:', nodes); 
    //sending nodes to frontend
    

    // Check if fullResponse is undefined
    if (fullResponse === undefined) {
      console.error('fullResponse is undefined');
      return NextResponse.json({ error: 'fullResponse is undefined' }, { status: 400 });
    }

    // Return the full response or process it as needed
    return NextResponse.json({ message: 'Node generation endpoint hit successfully WE IN THE BACKEND NOW WHOO'});
  } catch (error) {
    console.error('Error generating nodes:', error);
    return NextResponse.json(
      { error: 'Failed to generate nodes' },
      { status: 500 }
    );
  }
}

async function generateNodes(fullResponse: string) {
  // Implement node generation logic here
  const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

  try {
    // Prepare the prompt for task and feature extraction
    const prompt = `Given this PRD description, extract and list the main tasks and features:${fullResponse}. The next thing you need to do is generate nodes for a flow chart of the app, describe each step of the process sequentially, using phrases like "then," "if," "else," and "next," clearly indicating decision points and potential outcomes, while also specifying the input and output at each stage. Format your response as: Tasks: - Task 1 - Task 2 Features: - Feature 1 - Feature 2. Flow chart stuff as said. DONT INCLUDE ANYTHING ELSE, ESPECIALLY NOT THE PROMPT.`;

    const response = await client.textGeneration({
      model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B", 
      inputs: prompt,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.2,
        top_p: 0.95,
        repetition_penalty: 1.15,
      }
    });

    const generatedText = response.generated_text;
    const textWithoutThinking = generatedText.split('</think>')[1];

    return textWithoutThinking;

  } catch (error) {
    console.error("Error generating nodes:", error);
    throw error;
  }
  return ['node1', 'node2', 'node3']; // Example nodes
}

