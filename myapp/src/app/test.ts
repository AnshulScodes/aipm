import { parse, toCytoscapeElements } from 'graph-selector';
const cytoscape = require('cytoscape');

// 1. Express your graph using Graph Selector syntax
const graph = `
Node1
  to: Node2
Node3
  from: (Node1)
Node4
  to: (Node1)
`;

// 2. Parse it
const data = parse(graph);

// 3. Graph Selector provides some helpers for transforming data to common
// data visualization formats
const elements = toCytoscapeElements(data);

// 4. Use it!
const cy = cytoscape({
  container: document.getElementById('app'),
  elements,
});

cy.style(`
node { label: data(label); }
edge { label: data(label); }
`);
