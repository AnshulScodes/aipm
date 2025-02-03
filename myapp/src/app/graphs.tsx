import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import cytoscape, { ElementsDefinition } from "cytoscape";

const GraphComponent: React.FC = () => {
  const cyRef = useRef<HTMLDivElement | null>(null);
  const [elements, setElements] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [latestNodes, setLatestNodes] = useState<string | null>(null); // Change to string to hold raw text

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
        setLatestNodes(null); // Set null on error
      }
    };

    fetchNodes();
    const interval = setInterval(fetchNodes, 5000); // Poll every 5s

    return () => clearInterval(interval);
  }, []);

  // Format text to extract Mermaid chart (graph TD)
  function formatTextToMermaid(rawText: string | null) {
    if (!rawText) return "";
    const mermaidText = rawText.split("```mermaid")[1]?.split("```")[0]; // Get text between ```mermaid
    return mermaidText ? mermaidText.replace(/\\n/g, '\n').replace(/['+]/g, '').trim() : "";
  }

  const mermaidFlowchart = formatTextToMermaid(latestNodes);

  // Initialize Mermaid on the `mermaid` div after the chart string is updated
  useEffect(() => {
    if (mermaidFlowchart) {
      console.log("Initializing Mermaid with:", mermaidFlowchart); // Debug the flowchart content
      mermaid.init(undefined, '.mermaid'); // Initialize Mermaid for the chart
    }
  }, [mermaidFlowchart]); // Re-initialize only when flowchart changes

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
        {/* Render the Mermaid content inside a div with the `mermaid` class */}
        <div className="mermaid">{mermaidFlowchart}</div>
      </pre>
    </div>
  );
};

export default GraphComponent;
