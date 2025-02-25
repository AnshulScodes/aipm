'use client';

import { useState, useEffect, useRef } from 'react';
import { parse } from 'graph-selector';
import GraphComponent from './graphs';

// import { parseGraph } from '@flowcharter/parser';

export default function Home() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState('');

  let modelThinking = false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(''); // Clear previous response
    try {
      const res = await fetch('/api/prdGen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // messages: [{ role: 'user', content: 'just say hi in 50 words or more'}]
          messages: [{ role: 'user', content: `Make a detailed PRD (Product Requirements Document) for an app that does ${input}. The PRD should have the following sections, each separated by a title using three hashtags (###) to indicate the section header. Inside each section, subheaders should use two hashtags (##) to break things down further. Be as detailed as possible, so anyone reading it—technical or non-technical—can fully understand the app. Here's the structure:

Project Overview
Explain the app in simple, clear language for non-technical stakeholders. Include the problem it solves, the target audience, and the high-level value it provides.
Features/Requirements
List out all the app's functionalities in detail. Include core features, optional features, and how each should behave.
User Flows
Map out common user journeys step-by-step, showing how users interact with the app to achieve their goals. Keep it simple yet thorough.
Non-Functional Requirements
Detail performance expectations, security needs, scalability requirements, compliance standards, and any other technical constraints.
Page Designs for UI/UX Designers
Create a detailed guide for how each app page should look and function. Include wireframe descriptions, key design elements, and interaction details for every screen.
App Flows
Lay out the overall app flow and user experience from start to finish. Include how pages connect, key navigation paths, and transitions.
Additional Sections (optional)
Add any other relevant sections, like Technical Stack, Risks/Challenges, or Launch Plan, if needed.` }]
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the stream data
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        // Process each line
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setResponse(prev => prev + (data.content || ''));

              // Call parseGraph with the data received
              // const parsedGraph = parseGraph(data.content);
              // console.log('Parsed Graph:', parsedGraph);

            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while fetching the response.');
    } finally {
      console.log("finished loading");
      // callNodesAndEdgesGenData();
      setLoading(false);
      const graph = parse(`
        Node A
          goes to: Node B
          `);
          
          const { nodes, edges } = graph;
          console.log("NODES", nodes)
          console.log("EDGES", edges)
    }
  };


  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PRD Generator</h1>
      <div className="mb-4 bg-blue-200 border border-gray-300 rounded-lg p-4">
        <GraphComponent />
      </div>
      <div className="mb-4">
        <p>{data ? data : "backend python data" }</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What App do you Want to have a PRD for?"
          className="w-full p-2 border rounded bg-gray-700"
          disabled={loading}
        />
        
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-700"
        >
          {loading ? 'Thinking...' : 'Send'}
          {loading ? modelThinking = false : modelThinking = true}
        </button>
      </form>

      {response && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Response:</h2>
          <div className="p-4 bg-gray-700 rounded whitespace-pre-wrap">
            {response.includes('</think>') ? (
              <>
                <details className="mb-4">
                  <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                    Show AI Thinking Process
                  </summary>
                  <div className="mt-2 text-gray-400 pl-4 border-l border-gray-600">
                    {response.split('</think>')[0]}
                  </div>
                </details>
                {response.split('</think>')[1]}
              </>
            ) : response}
          </div>
        </div>
      )}
    </main>
  );
}