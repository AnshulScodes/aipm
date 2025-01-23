'use client';

import { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(''); // Clear previous response
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `create a PRD for an app that does ${input} with the following sections: Project Overview that gives a high level overview of the app for even non-technical stakeholders, Features/Requirements that detail the functionality of the app, User Flows that detail common user journeys through the app, Non-Functional Requirements that detail the non-functional requirements of the app, Page Designs for UI/UX Designers that exceptionally detail how each page should look and function, App Flows how the app should flow and function (user experience), and any other sections that are relevant. Section each off with a title and a description. Be as detailed as possible for every section.` }]
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
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PRD Generator</h1>
      
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
        </button>
      </form>

      {response && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Response:</h2>
          <div className="p-4 bg-gray-700 rounded whitespace-pre-wrap">
            {response.includes('</think>') ? response.split('</think>')[1] : response}
          </div>
        </div>
      )}
    </main>
  );
}