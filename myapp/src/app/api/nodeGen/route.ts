import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fullResponse } = await req.json(); // Expecting the full response string
    console.log('Received full response:', fullResponse); // Log the received full response

    // Check if fullResponse is undefined
    if (fullResponse === undefined) {
      console.error('fullResponse is undefined');
      return NextResponse.json({ error: 'fullResponse is undefined' }, { status: 400 });
    }

    // Return the full response or process it as needed
    return NextResponse.json({ message: 'Node generation endpoint hit successfully WE IN THE BACKEND NOW WHOO', fullResponse });
  } catch (error) {
    console.error('Error generating nodes:', error);
    return NextResponse.json(
      { error: 'Failed to generate nodes' },
      { status: 500 }
    );
  }
}