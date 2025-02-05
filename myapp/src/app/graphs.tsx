import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import cytoscape, { ElementsDefinition } from "cytoscape";

const GraphComponent: React.FC = () => {
  const cyRef = useRef<HTMLDivElement | null>(null);
  const [elements, setElements] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [latestNodes, setLatestNodes] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch('/api/nodeGen');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const nodes = data.message;
        setLatestNodes(nodes);
      } catch (error) {
        console.error("Error fetching nodes:", error);
        setLatestNodes(null);
      }
    };

    fetchNodes();
    const interval = setInterval(fetchNodes, 5000);

    return () => clearInterval(interval);
  }, []);

  function formatTextToMermaid(rawText: string | null) {
    if (!rawText) return "graph TD\n    Start[\"App Launch\"] -->|First-time user| Onboarding;\n    Start -->|Returning user| logged_in;\n    logged_in --> HomeScreen;";
    const mermaidText = rawText.split("```mermaid")[1]?.split("```")[0];
    const lines = mermaidText?.split("\n");
    const formattedLines = lines?.map(line => {
      // if (line.endsWith("|;")) {
      //   //go to the character before the ; and add the replacement word
      //   const index = line.lastIndexOf(";");
      //   return line.slice(0, index) + " Replacement" + line.slice(index + 1);
      // }
      // return line;

    });
    return formattedLines?.join("\n");


  }
  const mermaidFlowchart = latestNodes?.split("```")[1]?.split("```")[0];
  console.log("mermaidFlowchart", mermaidFlowchart)


  useEffect(() => {
    if (mermaidFlowchart) {
      mermaid.init(undefined, '.mermaid');
    }
  }, [mermaidFlowchart]);

  useEffect(() => {
    if (!cyRef.current || elements.nodes.length === 0) {
      return;
    }

    const cy = cytoscape({
      container: cyRef.current,
      elements: elements as ElementsDefinition,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "green",
            "text-valign": "center",
            color: "#fff",
          },
        },
        {
          selector: "edge",
          style: {
            label: "data(label)",
            "curve-style": "bezier",
            "target-arrow-shape": "triangle",
          },
        },
      ],
      layout: { name: "grid" },
    });

    cy.on("mouseover", "node, edge", (evt) => {
      const element = evt.target;
      const originalColor = element.style("background-color");
      element.style({ "background-color": "#ff0000" });

      element.one("mouseout", () => {
        element.style({ "background-color": originalColor });
      });
    });

    return () => {
      cy.destroy();
    };
  }, [elements]);

  return (
    <div className="flex flex-col items-center justify-center text-gray-700 text-size-2xl">
      <div ref={cyRef} style={{ width: "100%", height: "500px" }} />
      <h3>Latest Nodes Data:</h3>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-w-full">
        {JSON.stringify(latestNodes, null, 2)}
      </pre>
      <h3>Mermaid Flowchart:</h3>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-w-full">
        <div className="mermaid">{mermaidFlowchart}</div>
      </pre>
    </div>

  );
};

export default GraphComponent;
