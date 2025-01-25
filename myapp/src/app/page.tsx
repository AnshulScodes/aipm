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
          messages: [{ role: 'user', content: `ou are a Product Manager creating a detailed Product Requirements Document (PRD) for an app that does ${input}. Write this PRD so it is clear, detailed, and formatted properly for technical and non-technical stakeholders. Follow this exact structure and formatting, and use examples where necessary to ensure clarity. Each section title must be written using three hashtags (###) as the header, and subheaders must use two hashtags (##). The content must provide both high-level overviews and specific details. Use clear, formal language. Here’s the exact structure and formatting to follow:

Project Overview
Explain the app simply and clearly.

Purpose: Clearly state what the app does in 2-3 sentences. For example: "This app helps users manage tasks effectively by allowing them to prioritize, schedule, and track progress in one place."
Problem it solves: Identify the specific problem your app addresses. For example: "Users often struggle to manage multiple to-do lists scattered across apps. Our app centralizes this process."
Target Audience: Break down the audience into specific groups. Example: "Primary: Busy professionals and students. Secondary: Small teams and entrepreneurs."
Value: Explain what value the app delivers. Example: "The app simplifies task management, reduces mental load, and improves productivity."
Features/Requirements
Break this into detailed lists of core features and optional features. Use bullet points and ensure each feature is explained with behavior and functionality expectations.

Core Features
Feature Name: A one-line description of the feature, e.g., "Task Prioritization."
How it works: Detailed behavior of the feature, e.g., "Users can drag and drop tasks into a priority order. Tasks are color-coded by urgency."
Optional Features
Feature Name: Describe optional functionality. Example: "Team Collaboration."
How it works: Example: "Users can share task lists and assign tasks to team members with due dates and reminders."
User Flows
Explain step-by-step how users interact with the app to achieve their goals. Use bullet points or numbered lists for each flow.

Example User Flow: Task Creation
The user opens the app and lands on the homepage.
They tap the "Add Task" button.
A modal opens where they input the task name, due date, and priority.
After saving, the task appears in their to-do list.
Example User Flow: Account Signup
The user clicks "Sign Up" on the homepage.
They enter their email, create a password, and optionally link a Google account.
After verifying their email, they land on the onboarding screen.
Non-Functional Requirements
List all technical and operational expectations here. Be detailed and specific.

Performance: Example: "The app must load the main dashboard within 2 seconds for 90% of users."
Security: Example: "Data must be encrypted both in transit and at rest, following industry standards like AES-256."
Scalability: Example: "The app must support up to 1 million users without performance degradation."
Compliance: Example: "The app must comply with GDPR for European users."
Page Designs for UI/UX Designers
Provide specific descriptions of how each page in the app should look and function. Include key design elements, wireframe descriptions, and interaction details.

Homepage
Description: "A clean dashboard showing an overview of tasks for the day, week, and month."
Key Elements:
Task List: "A scrollable list with task names, due dates, and a priority icon."
Add Task Button: "A floating action button in the bottom-right corner."
Task Modal
Description: "A popup for creating or editing a task."
Key Elements:
Input Fields: "Task name, due date, and priority dropdown."
Save Button: "Large and prominent, styled in green to encourage action."
App Flows
Outline the overall structure and navigation of the app, showing how pages connect and how users move between them.

Example App Flow
Splash Screen: App logo appears for 3 seconds.
Homepage: Users see their task list and can navigate to Settings or create a new task.
Task Modal: Opens when the "Add Task" button is clicked.
Settings Page: Allows users to manage their account and app preferences.
Additional Sections (Optional)
Include any relevant additional information, like:

Technical Stack
Example: "Frontend: React Native. Backend: Node.js with MongoDB."
Risks/Challenges
Example: "Challenge: Ensuring cross-platform consistency for iOS and Android. Solution: Adopt a design system."
Launch Plan
Example: "Beta launch in Q2 for 500 users, followed by a full public release in Q4."` }]
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