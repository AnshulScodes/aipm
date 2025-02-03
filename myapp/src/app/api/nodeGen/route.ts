import { NextResponse } from "next/server";
import { HfInference } from "@huggingface/inference";
import { EventEmitter } from "events";
import { Exo } from "next/font/google";

let lastGeneratedNodes: any = null;

const newEventEmitter = new EventEmitter();
export async function POST(req: Request) {
  try {
    const { fullResponse } = await req.json(); 
    // console.log('fullResponse', fullResponse);
    // Generate nodes from the full response
    const nodes = await generateNodes(fullResponse);
    lastGeneratedNodes = nodes;
    // console.log('nodes', nodes);
    newEventEmitter.emit('nodesGenerated', nodes);


    if (fullResponse === undefined) {
      console.error('fullResponse is undefined');
      return NextResponse.json({ error: 'fullResponse is undefined' }, { status: 400 });
    }

    // Return the full response or process it as needed
    return (NextResponse.json({ message: nodes }));
  } catch (error) {
    console.error('Error generating nodes:', error);
    return NextResponse.json(

      { error: 'Failed to generate nodes' },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!lastGeneratedNodes) {
    return NextResponse.json({ error: 'No nodes generated yet' }, { status: 404 });
  }
  return NextResponse.json({ message: lastGeneratedNodes });
}

async function generateNodes(fullResponse: string) {
  // Implement node generation logic here
  const client = new HfInference(process.env.HUGGINGFACE_API_KEY);

  try {

    const prompt4 = ` 
I need you to generate a **Mermaid flowchart** that maps out every possible navigation path a user can take within this application based on the PRD: **${fullResponse}**.  

### **📌 Rules & Structure:**  

#### **1️⃣ Use the Correct Mermaid Syntax**
- Start with **"graph TD;"** at the top.  
- Each screen or feature should be a **node**, written in this format:  
  "
  ScreenName[Screen Label]

  "
- **Arrows ("-->")** must connect nodes to represent navigation paths.  
- If an action or transition has a **specific name**, label it using "|Action Label|":  
  "


  ScreenA -->|Clicks Button| ScreenB
  "
- If a node links back to an existing node, **do NOT duplicate it**—just reference the existing node.  

#### **2️⃣ Define a Clear User Flow**
- The **starting point** should be "Start" or "App Entry".  
- **Step-by-step breakdown** of how the user progresses through the app.  
- **Group related features** logically under their parent screens.  
- Include **all core features, settings, and any subfeatures** from the PRD.  

#### **3️⃣ No Dead Ends**
- Every screen should **connect to another screen** or return to a logical starting point.  
- Example: If a settings menu leads to a subpage, make sure the user can return:  
  "
  Settings --> NotificationSettings
  NotificationSettings --> Settings
  "

#### **4️⃣ Example of Expected Output**  
_(Use this as a reference when generating the structure)_  

"mermaid
graph TD;
    Start["App Launch"] -->|First-time user| Onboarding;
    Start -->|Returning user| HomeScreen;


    Onboarding --> HomeScreen;

    HomeScreen -->|Opens Feature A| FeatureA;
    FeatureA --> SubFeatureA1;
    FeatureA --> SubFeatureA2;
    SubFeatureA2 --> FeatureA;  %% Returns to FeatureA

    HomeScreen -->|Opens Feature B| FeatureB;
    FeatureB --> SubFeatureB1;
    FeatureB --> SubFeatureB2;
    SubFeatureB2 --> FeatureB;  %% Returns to FeatureB

    HomeScreen -->|Goes to Settings| Settings;
    Settings --> NotificationSettings;
    NotificationSettings --> Settings; %% Returns to Settings

    Settings --> HomeScreen; %% Back to HomeScreen
"

### **🔍 Important Notes for the AI:**  
- **DO NOT** create duplicate nodes at the same level—everything must be properly nested.  
- If a **screen reappears later**, use the same name and **connect back** instead of rewriting it.  
- Ensure that every transition **makes sense logically** based on the PRD.  
- **Follow the Mermaid syntax exactly**—don't add extra characters, missing arrows, or misplaced nodes.  

### **💡 Expected Output Format**  
- The output **must** be valid MermaidJS syntax so it can be copied into:  
  - **Mermaid Live Editor:** [https://mermaid-js.github.io/mermaid-live-editor](https://mermaid-js.github.io/mermaid-live-editor)  
  - **Markdown (.md) files with Mermaid support** (GitHub, VS Code, Obsidian).  
  - **Any webpage using Mermaid.js.**  

🚀 Generate the **fully structured Mermaid flowchart** based on the PRD, ensuring all navigation paths are correct and formatted properly.`
    // Prepare the prompt for task and feature extraction
    const prompt3 = `Generate a quick app flow in a structured, hierarchical format that clearly maps out possible navigation paths that a user can go through based off this PRD: ${fullResponse}. The output should be hierarchical, like this: ""Start
        Onboarding
            HomeScreen
                FeatureA
                    SubFeatureA1
                SubFeatureA2
            FeatureB      
                SubFeatureB1
                SubFeatureB2
        Settings  
            HomeScreen"
`
    const prompt2 = `I need you to generate a detailed app flow in a structured, hierarchical format that clearly maps out every possible navigation path a user can take within this application that is outlined by this PRD: ${fullResponse}. The app flow should start at a clear entry point and progress step by step, ensuring that each transition is nested correctly under its respective parent node.
    
    The output should be hierarchical, like this:
    "Start
        Onboarding
            HomeScreen
                FeatureA
                    SubFeatureA1
                SubFeatureA2
            FeatureB      
                SubFeatureB1
                SubFeatureB2
        Settings  
            HomeScreen"
    
    Also, make sure that the nodes are all unique and that there are no duplicate nodes at the same level. As well as that, label each node with the level of the node. Format each node like this: "NodeName (level)"
    `








    const prompt = `I need you to generate a detailed app flow in a structured format that clearly maps out every possible navigation path a user can take within this application that is outlined by this PRD: ${fullResponse}. The app flow should start at a clear entry point (e.g., “Start”) and progress step by step, ensuring that each transition is nested correctly under its respective parent node.

Key Requirements:
Strict Hierarchical Structure:

Each node represents a screen or state in the app.
Every node should have indented transitions that define the possible navigation paths a user can take.
DO NOT create duplicate nodes at the same level; all steps must be structured within their parent node unless it’s a return path.
Step-by-Step Navigation:

Define the main app flow and how users progress through the app.
Each step should clearly outline where users can go next and what actions trigger these transitions.
Example format (Follow this exactly):
Start
    to: Onboarding
        to: HomeScreen
            to: FeatureA
                to: SubFeatureA1
                to: SubFeatureA2
            to: FeatureB
                to: SubFeatureB1
                to: SubFeatureB2
        to: Settings
            to: HomeScreen
The hierarchy must be clear—child nodes should be properly indented under their parent nodes.
App-Specific Flow Considerations:

Ensure that your app’s core functionalities are properly represented in the flow.
Consider the following common sections in most apps:
Onboarding/Login (First-time user experience)
Main Dashboard/Home (Where users land after onboarding)
Core Features (The main tools and actions available to the user)
Subfeatures (Breakdown of each major feature into smaller, actionable steps)
Settings & Profile Management (User account, preferences, notifications)
Save & Export (If applicable, where users can save/download their work)
Navigation Loops (Users should always be able to return to the main screen)
Every major action should have a logical next step.
No Dead Ends or Missing Transitions:

If a user reaches a final step, they should be redirected back to a logical part of the app (e.g., HomeScreen, Dashboard).
If a setting or feature leads to a new screen, ensure there’s a way back.
Do not leave any floating nodes without a connection back to the main app flow.
Expected Output:
A complete text-based app flow structure that a developer can use immediately to implement navigation logic, without additional explanations or modifications. The structure should strictly follow the defined indentation style and ensure smooth transitions between all app sections.

What I need the output to be is just this list of nodes, each formatted as "NodeName (level)" and each node should be properly indented under its parent node. DON'T output any FeatureA, FeatureB, etc. The nodes and edges should be the actual names of the screens and features that come from the PRD.

`;

    const response = await client.chatCompletion({
      // model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B", 
      // model: "meta-llama/Meta-Llama-3-8B-Instruct",
      // inputs: prompt,
      // parameters: {
      //   max_new_tokens: 1024,
      //   temperature: 0.2,
      //   top_p: 0.95,
      //   repetition_penalty: 1.15,
      // }
      // model: "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
      model: "meta-llama/Meta-Llama-3-8B-Instruct",
      messages: [
        {
          role: "user",
          content: prompt4
        }
      ],
      provider: "hf-inference",
      max_tokens: 2048
    });


    // console.log("response", response.choices[0].message.content)
    const generatedText = response.choices[0].message.content;

    // const textWithoutThinking = generatedText.split('</think>')[1];
    // console.log("nodes: ", textWithoutThinking);
    return generatedText;





  } catch (error) {
    console.error("Error generating nodes:", error);
    throw error;
  }
  return ['node1', 'node2', 'node3']; // Example nodes
}

export { newEventEmitter };