const windowWidth = 500;
const windowHeight = 500;
const windowCenter = {x: windowWidth/2, y: windowHeight/2}

let inputAngle = 0;


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
const actuateHandle = zoomGroup.append("circle")
