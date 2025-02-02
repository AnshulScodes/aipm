import { useEffect, useRef, useState } from "react";
import cytoscape, { ElementsDefinition } from "cytoscape";


const GraphComponent: React.FC = () => {
  const cyRef = useRef<HTMLDivElement | null>(null);
  const [elements, setElements] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [latestNodes, setLatestNodes] = useState<any>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch('/api/nodeGen');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const nodes = data.message;
        // console.log("Latest nodes data:", nodes);
        setLatestNodes(nodes);


      } catch (error) {
        console.error("Error fetching nodes:", error);
        setLatestNodes(""); // Set empty string on error
      }
    };
  
    fetchNodes();
    const interval = setInterval(fetchNodes, 5000); // Poll every 5s
  
    return () => clearInterval(interval);
  }, []);




  console.log("Latest nodes data:", latestNodes);
  const flowData = formatTextToNodes(latestNodes);
  console.log("Formatted flow data:", flowData);

  function formatTextToNodes(rawText: string | null) {
    if (!rawText) return "";
    
    let textNoThink = rawText;
    if (rawText.includes('</think>')) {
      textNoThink = rawText.split('</think>')[1];
    }
    
    let lines = textNoThink.replace(/\n/g, "").split("  ");
    lines = lines.map(line => line.trim()).filter(line => line);
  
    let formattedLines: string[] = [];
    let indentLevel = 0;
    let prevIndent = 0;
  
    for (let line of lines) {
      let currIndent = (line.length - line.trimStart().length) / 4;
  
      if (currIndent > prevIndent) {
        indentLevel++;
      } else if (currIndent < prevIndent) {
        indentLevel--;
      }
  
      formattedLines.push("  ".repeat(indentLevel) + line.trim());
      prevIndent = currIndent;
  
  
    }
  
    return formattedLines.join("\n");
  }









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
      <div>
        <div ref={cyRef} style={{ width: "100%", height: "500px" }} />
      </div>
      <h3>Latest Nodes Data:</h3>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-w-full">
        {JSON.stringify(flowData, null, 2)}
      </pre>
    </div>


  );
};

export default GraphComponent;
