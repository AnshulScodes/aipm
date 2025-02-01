import { useEffect, useRef } from "react";
import cytoscape, { ElementsDefinition } from "cytoscape";
import { parse, toCytoscapeElements } from "graph-selector";

const GraphComponent: React.FC = () => {
  const cyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!cyRef.current) return;

    // 1. Define the graph using Graph Selector syntax
    const graph = `
      Node1
        to: Node2
      Node3
        from: (Node1)
      Node4
        to: (Node1)
    `;

    // 2. Parse the graph data
    const data = parse(graph);

    // 3. Convert to Cytoscape elements
    const elements = {
        nodes: toCytoscapeElements(data).filter(el => !el.data.source),
        edges: toCytoscapeElements(data).filter(el => el.data.source)
    };

    // 4. Initialize Cytoscape
    const cy = cytoscape({
      container: cyRef.current,
      elements: elements as ElementsDefinition,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "#0074D9",
            "text-valign": "center",
            "color": "#fff",
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

    return () => cy.destroy(); // Cleanup Cytoscape instance on unmount
  }, []);

  return <div ref={cyRef} style={{ width: "100%", height: "500px" }} />;
};

export default GraphComponent;
