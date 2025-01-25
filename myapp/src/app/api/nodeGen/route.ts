import { NextResponse } from "next/server";

let allContent: string[] = []; // Accumulate all chunks in this array

export async function POST(req: Request) {
  try {
    const reader = req.body?.getReader(); // Access the readable stream
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No readable stream found in the request body");
    }

    // Read the stream and accumulate chunks
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      allContent.push(chunk.trim()); // Accumulate trimmed chunks
    }

    console.log('All Content:', allContent); // Debug final accumulated content
    const parsedAllContent = allContent.map((item) => JSON.parse(item).prdData).join('');
    console.log('FIXED CONTENT:', parsedAllContent);
    // Return a response with all the accumulated chunks
    return NextResponse.json({
      message: 'Node generation endpoint hit successfully',
      prdData: allContent.join(''), // Combine all chunks into a single string
    });
  } catch (error) {
    console.error('Error generating nodes:', error);
    return NextResponse.json(
      { error: 'Failed to generate nodes' },
      { status: 500 }
    );
  }
}


