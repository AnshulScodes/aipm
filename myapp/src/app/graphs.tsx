import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import svgPanZoom from "svg-pan-zoom";

const GraphComponent: React.FC = () => {
  const [mermaidOutput, setMermaidOutput] = useState<string>("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/nodeGen'); // Replace with your actual endpoint
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const flowData = await response.json();

      // Log the fetched data to understand its structure
      console.log("Fetched flow data:", flowData);

      // Access the message property that contains the Mermaid string
      const mermaidString = flowData.message; // Access the correct property
      if (typeof mermaidString !== 'string') {
        throw new Error('Mermaid data is not a string');
      }

      // Extract the Mermaid code from the flowData
      const extractedMermaidCode = extractMermaidCode(mermaidString);
      setMermaidOutput(extractedMermaidCode); // Set the Mermaid output directly
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const extractMermaidCode = (data: string): string => {
    // Use a regular expression to extract the Mermaid code
    const match = data.match(/```mermaid([\s\S]*?)```/);
    return match ? match[1].trim() : ""; // Return the extracted code or an empty string
  };

  useEffect(() => {
    if (!mermaidOutput || !containerRef.current) return;

    const renderChart = async () => {
      try {
        mermaid.initialize({ startOnLoad: false, theme: "default" });
        console.log("Rendering flowchart with output:", mermaidOutput); // Log the output being rendered
        const { svg } = await mermaid.render("flowchart", mermaidOutput);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg; // Set the rendered SVG
          const svgElement = containerRef.current.querySelector('svg');
          if (svgElement) {
            svgRef.current = svgElement;
            svgPanZoom(svgElement, {
              zoomEnabled: true,
              controlIconsEnabled: true,
              fit: true,
              center: true,
            });
          }
        }
      } catch (error) {
        console.error("Failed to render flowchart:", error);
      }
    };

    renderChart();
  }, [mermaidOutput]); // Re-run this effect when mermaidOutput changes

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-slate-700">Flowchart Preview</h2>
      <button onClick={fetchData} className="bg-blue-500 text-white p-2 rounded">
        Generate Flowchart
      </button>
      <div
        ref={containerRef}
        className="min-h-[300px] bg-white rounded-md border border-slate-200 p-4 overflow-auto"
      >
        {!mermaidOutput && (
          <div className="h-full flex items-center justify-center text-slate-400">
            Generated flowchart will appear here SKIBIDI SIGMA THIS IS FOR THE GIT COMMIT\


            \
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphComponent;
