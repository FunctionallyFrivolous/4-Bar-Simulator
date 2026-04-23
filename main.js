// Next Tasks:
    // Animate actuation
        // Initial implementatin complete!
        // Things to add:
            // User actuate via slider
            // User adjust playback speed
            // User set actuation 
            // User defined limits
    // Organized menu system
        // Static menu bar which expands different grouped/categorized menus
            // Visual Preferences (dark/light mode, show/hide various things)
            // Linkage Configuration (open/crossed, crossover, manual limits?)
            // Animation (show/hide animation controlls)
                // Separate SVG window?
            // Save/Share options
    // Save/Share (URL)
    // Undo/Redo?
    // Button Icons:
        // Open/Crossed: generic linkage in current config, with opposite config ghost
        // Crossover: generic linkage at crossover point. Arrows/X indicating if crossover is allowed?
    // localStorage?
        // First localStorage application: remember previous darkMode setting!!!
        // Next:
            // Linkage? Save the node positions to localStorage. Apply save positions on loading
                // First, add a button to revert to default linkage? (since refresh will no longer do that)

const windowWidth = 500;
const windowHeight = 500;
const windowCenter = {x: windowWidth/2, y: windowHeight/2}
const originCoords = {x: 140, y: 300}
const coordScale = 20;

let tempX = 0;
let tempY = 0;
let tempAngle = 90;
let lastTapTime = 0;

let inputLimits = {min: 0, max: 360};
let outputLimits = {min: 0, max: 360};
const limitThreshold = 0.001
let recentLimit = "none";

let inputAngle = 90;
let outputAngle = 80;
let baseAngle = 0;
let linkageOpen = true;
let allowCrossover = false;
let recentCrossover = false;
let crossoverDeadband = 1
let inputClass = "Crank"
let outputClass = "Rocker"

let darkMode = false
const lightColor = "rgb(255, 255, 255)"
const darkColor = "rgb(26, 26, 26)"
let bgColor = lightColor
let fgColor = darkColor
let whtnColor = 0
document.body.style.backgroundColor = bgColor
document.getElementById("pageLab").style.color = fgColor
document.getElementById("topView").style.border = `1px solid ${fgColor}`

const traceStepsCoarse = 1000
const traceStepsFine = 4000
let traceSteps = traceStepsFine;
const traceDelta = 0.25
const traceReduction = 20

const snapAngle = 5;

let animationActive = false
let animationTimer = null
let animateSpeed = 10 // rpm
// let animateSteps = 100
let animateDir = 1


const svg = d3.select("#topView"); // Defining the svg window (references element from index.html)
const background = svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", bgColor)
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
const groundLineGroup = zoomGroup.append("g")
const nodeDotGroup = zoomGroup.append("g")
const nodeDragGroup = zoomGroup.append("g")
const traceDotGroup = zoomGroup.append("g")
const traceLineGroup = zoomGroup.append("g")
const fullTraceGroup = zoomGroup.append("g")


const openCrossedButton = overlayGroup.append("rect")
const openCrossedIcon = overlayGroup.append("text")
const crossoverButton = overlayGroup.append("rect")
const crossoverIcon = overlayGroup.append("text")
const darkModeButton = overlayGroup.append("rect")
const darkModeIconTop = overlayGroup.append("path")
const darkModeIconBottom = overlayGroup.append("path")

const playButton = overlayGroup.append("rect")
const playIcon = overlayGroup.append("text")
const reverseButton = overlayGroup.append("rect")
const reverseIcon = overlayGroup.append("text")
const cognateButton = overlayGroup.append("rect")
const cognateIcon = overlayGroup.append("text")

const inputLinkVal = overlayGroup.append("text")
const inputLinkProps = overlayGroup.append("text")
const outputLinkVal = overlayGroup.append("text")
const outputLinkProps = overlayGroup.append("text")

// const DBLink = zoomGroup.append("line")
//     .attr("x1", 250)
//     .attr("y1", 250)
//     .attr("x2", 100)
//     .attr("y2", 100)
//     .attr("stroke-width", 2)
//     .attr("stroke", "black")

const cognateData = [
    {id: "A0", x: 0, y: 0, color: "black"},
    {id: "B0", x: 0, y: 0, color: "darkred"}, 
    {id: "C0", x: 0, y: 0, color: "darkblue"}, 
    {id: "D0", x: 0, y: 0, color: "black"}, 
    {id: "E0", x: 0, y: 0, color: "darkgreen"},
]