// Next Tasks:
    // Add a ternary node for each link (in node data)
        // Show/hide nodes and include/exclude polygone points based on status
        // Add a status to link data (ternary: true/false)
        // Change status via dblclick
        // Ternary nodes always exist (and update with linakge changes) just hide when not active

const windowWidth = 500;
const windowHeight = 500;
const windowCenter = {x: windowWidth/2, y: windowHeight/2}
const originCoords = {x: 140, y: 300}
const coordScale = 20;

let tempX = 0;
let tempY = 0;

let inputLimits = {min: 0, max: 360};
let outputLimits = {min: 0, max: 360};
const limitThreshold = 0.001

let inputAngle = 90;
let outputAngle = 80;
let baseAngle = 0;
let linkageOpen = true;
let allowCrossover = false;
let recentCrossover = false;
let crossoverDeadband = 1
let inputClass = "Crank"
let outputClass = "Rocker"

const svg = d3.select("#topView"); // Defining the svg window (references element from index.html)
const background = svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "white")
const zoomGroup = svg.append("g"); // Defines group that will contain all SVG elements that are effected by zoom/pan
const overlayGroup = svg.append("g"); // Defines group that will contain SVG elements that ignore zoom/pan and remain overlaid on window

// Zoom & Pan stuff
let currentZoomTransform = d3.zoomIdentity;

function viewTransform() {
    const zoom = `
        translate(${currentZoomTransform.x}, ${currentZoomTransform.y})
        scale(${currentZoomTransform.k})
    `;
    zoomGroup.attr("transform", `${zoom}`);
    // fitViewButton
    //     .attr("fill-opacity", 0)
    //     .attr("stroke-opacity", 0.25)
}

const zoom = d3.zoom()
    .scaleExtent([0.25, 10])
    .on("zoom", (event) => {
        // zoomGroup.attr("transform", event.transform);
        currentZoomTransform = event.transform;
        viewTransform();
    });
svg.call(zoom)
    .on("dblclick.zoom", null);

// Initialize and order svg groups and elements
const linkLineGroup = zoomGroup.append("g")
const fixedNodeGroup = zoomGroup.append("g")
const nodeDragGroup = zoomGroup.append("g")
const nodeDotGroup = zoomGroup.append("g")

const toggleConfigButton = overlayGroup.append("rect")
const toggleConfigIcon = overlayGroup.append("text")
const toggleCrossoverButton = overlayGroup.append("rect")
const toggleCrossoverIcon = overlayGroup.append("text")