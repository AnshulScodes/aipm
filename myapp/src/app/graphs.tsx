import { useEffect, useRef, useState } from "react";
import cytoscape, { ElementsDefinition } from "cytoscape";
import { toCytoscapeElements } from "graph-selector";
import { newEventEmitter } from './api/nodeGen/route'; // Adjust the import path as necessary

const GraphComponent: React.FC = () => {
  console.log("GraphComponent is rendering"); // Debugging log
  const cyRef = useRef<HTMLDivElement | null>(null);
  const [elements, setElements] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [emittedData, setEmittedData] = useState<any>(null); // State to hold emitted data

  // Effect to listen for nodes generated event
  // useEffect(() => {
  //   console.log("Setting up event listener for nodesGenerated"); // Debugging log
  //   const handleNodesGenerated = (nodes: any) => {
  //     console.log("Emitted Nodes Received:", nodes); // Log the emitted nodes to the console
  //     if (nodes) { // Check if nodes is not null
  //       setEmittedData(nodes); // Store the emitted nodes in state

  //       const cytoscapeElements = toCytoscapeElements(nodes);
  //       setElements({
  //         nodes: cytoscapeElements.filter(el => !el.data.source),
  //         edges: cytoscapeElements.filter(el => el.data.source),
  //       });
  //     } else {
  //       console.error("Received null or undefined nodes");
  //     }
  //   };

  //   eventEmitter.on('nodesGenerated', handleNodesGenerated);

  //   // Cleanup listener on unmount
  //   return () => {
  //     eventEmitter.off('nodesGenerated', handleNodesGenerated);
  //   };
  // }, []); // Empty dependency array to run only on mount
  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const response = await fetch('/api/nodeGen');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
        const data = await response.json();
        console.log("Latest nodes data:", data.message);
      } catch (error) {
        console.error("Error fetching nodes:", error);
      }
    };
  
    fetchNodes();
    const interval = setInterval(fetchNodes, 5000); // Poll every 5s
  
    return () => clearInterval(interval);
  }, []);
  
  // Effect to initialize Cytoscape
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

    // Event listener for hover effects
    cy.on("mouseover", "node, edge", (evt) => {
      const element = evt.target;
      const originalColor = element.style("background-color");
      element.style({ "background-color": "#ff0000" });

      element.one("mouseout", () => {
        element.style({ "background-color": originalColor });
      });
    });

    // Cleanup Cytoscape instance on unmount
    return () => {
      cy.destroy();
    };
  }, [elements]);

  return (
    <div className="flex flex-col items-center justify-center text-gray-700 text-size-2xl">
      <div>
        <div ref={cyRef} style={{ width: "100%", height: "500px" }} />
      </div>
      <h3 >Generated Nodes:</h3>
      <ul>

        {elements.nodes.map((node) => (
          <li key={node.data.id}>{node.data.label}</li>
        ))}
      </ul>
      <h3>Emitted Data:</h3>
      <pre>{JSON.stringify(emittedData, null, 2)}</pre> {/* Display the emitted data */}
    </div>
  );
};

export default GraphComponent;