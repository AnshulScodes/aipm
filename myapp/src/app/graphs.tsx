import { useEffect, useRef, useState } from "react";
import cytoscape, { ElementsDefinition } from "cytoscape";
import { toCytoscapeElements } from "graph-selector";

const GraphComponent: React.FC = () => {
  const cyRef = useRef<HTMLDivElement | null>(null);
  const [elements, setElements] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch('/api/prdGen', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'just say hi in 50 words or more' }]
          }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No reader available');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.nodes) {
                  const nodes = data.nodes; // Get nodes from the response
                  setElements({
                    nodes: toCytoscapeElements(nodes).filter(el => !el.data.source),
                    edges: toCytoscapeElements(nodes).filter(el => el.data.source)
                  });
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchGraphData();
  }, []);

  useEffect(() => {
    if (!cyRef.current || elements.nodes.length === 0) return;

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

    cy.on("mouseover", "node, edge", function (evt: any) {
      const element = evt.target;
      const originalColor = element.style("background-color");
      element.style({ "background-color": "#ff0000" });
      console.log(`Hovering over: ${element.data("label")}`);
      element.one("mouseout", function () {
        element.style({ "background-color": originalColor });
      });
    });

    return () => cy.destroy();
  }, [elements]);

  return <div ref={cyRef} style={{ width: "100%", height: "500px" }} />;
};

export default GraphComponent;
