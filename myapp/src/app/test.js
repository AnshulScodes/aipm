"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graph_selector_1 = require("graph-selector");
var cytoscape = require('cytoscape');
// 1. Express your graph using Graph Selector syntax
var graph = "\nNode1\n  to: Node2\nNode3\n  from: (Node1)\nNode4\n  to: (Node1)\n";
// 2. Parse it
var data = (0, graph_selector_1.parse)(graph);
// 3. Graph Selector provides some helpers for transforming data to common
// data visualization formats
var elements = (0, graph_selector_1.toCytoscapeElements)(data);
// 4. Use it!
var cy = cytoscape({
    container: document.getElementById('app'),
    elements: elements,
});
cy.style("\nnode { label: data(label); }\nedge { label: data(label); }\n");
