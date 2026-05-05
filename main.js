// Next Tasks:
    // Animation features
        // User actuate via slider
        // User adjust playback speed (vertical slider above play button?)
        // User set actuation (input input angle)
        // User defined limits
    // Save/Share (URL)
        // Save:
            // Node positions
            // Ternary node show/hide status
            // Fixed node show/hide status?
            // Trace show/hide statuses
        // Export GIF!
    // Button Icons:
        // Text to path (for cross-browser consistency):
            // Play/Pause
        // Better symbols...
            // Open/Crossed?
                // Open version is kind of weird, and now it looks too much like the synth mode points...
        // Needs a symbol...
            // Default Linkage?
    // localStorage - More?
        // Animation direction? Meh
    // Synthesis Methods
        // Cognates - DONE!
        // Nodes - DONE!
            // Multi-nodes?
        // Cusps
            // One cusp - DONE!
            // Two cusps
                // Add 2ndary button(s) to allow add/remove cusp points
            // Three cusps?
            // Double click points to add/remove?
            // Show locations of joint B & C of the node solution pair
                // Eventually: Drag these to dictate the input (or output?) angle (OR, just use angle input to drive B location... probably this, but still could be useful to have this angle visuallized)
        // Symmetric Coupler Curves
    // Scale Linkage
        // Scale all link lengths uniformly
        // Scale outward from joint A
        // Option to lock link length ratios and scale by updating a single link length?
    // Organized menu system
        // Consolidate buttons/actions whenever possible
            // E.g. moving the animation reverse and crossover buttons as 2ndary buttons above related primaries (play/pause, open/crossed)
            // Bonus if hidden when not useful/usable
        // Interactive actions >>> buttons
            // E.g. Adding the interactive synth mode points eliminates an entire panel of buttons/inputs that would have been needed
        // Replace fit view button with double click on background?
    // Quirks & Bugs:
        // Ternary node snapping is based on angle rather than distance. Results in snap "strength" that varies based on distance from the reference node
            // This was just the easy/lazy way to get it done. Will fix later
        // Fit view result is kind of awkward in some cases
            // Should not be impacted by hidden ternary nodes, etc.
            // Also potentially an issue with calc of center location in some cases?


// localStorage.clear()

const windowWidth = 500;
const windowHeight = 500;
const windowCenter = {x: windowWidth/2, y: windowHeight/2}
const originCoords = {x: 140, y: 300}
const coordScale = 20;
let minCoord_x = null;
let maxCoord_x = null;
let minCoord_y = null;
let maxCoord_y = null;

let tempX = 0;
let tempY = 0;
let tempAngle = 90;
let lastTapTime = 0;

let inputLimits = {min: 0, max: 360};
let outputLimits = {min: 0, max: 360};
const limitThreshold = 0.0001
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

let undoStatus = true;

let synthModeInputAngle = 0
let synthModeOpen = linkageOpen
let synthModeTempAngle = 0
let synthModeTempOpen = linkageOpen
let synthCycle = 0
let nodeMode = false
let cuspMode = false

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
    .on("dblclick", function(){
        fitView(500)
    })
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
    localStorage.setItem("trans_x", `${currentZoomTransform.x}`)
    localStorage.setItem("trans_y", `${currentZoomTransform.y}`)
    localStorage.setItem("scale", `${currentZoomTransform.k}`)
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

let trans_x = localStorage.getItem("trans_x")
let trans_y = localStorage.getItem("trans_y")
let scale = localStorage.getItem("scale")

trans_x = trans_x === null ? currentZoomTransform.x : Number(trans_x)
trans_y = trans_y === null ? currentZoomTransform.y : Number(trans_y)
scale = scale === null ? currentZoomTransform.k : Number(scale)

svg.transition().duration(0).call(zoom.transform, d3.zoomIdentity
    .translate(trans_x, trans_y)
    .scale(scale)
);
viewTransform()


// Initialize and order svg groups and elements
const linkLineGroup = zoomGroup.append("g")
const fixedNodeGroup = zoomGroup.append("g")
const groundLineGroup = zoomGroup.append("g")
const nodeDotGroup = zoomGroup.append("g")
const nodeDragGroup = zoomGroup.append("g")
const traceDotGroup = zoomGroup.append("g")
const traceLineGroup = zoomGroup.append("g")
const fullTraceGroup = zoomGroup.append("g")

const synthDotGroup = zoomGroup.append("g")
const synthDragGroup = zoomGroup.append("g")

const openCrossedButton = overlayGroup.append("rect")
const openCrossedIcon = overlayGroup.append("text")
const crossoverButton = overlayGroup.append("rect")
const crossoverIcon = overlayGroup.append("path")
const darkModeButton = overlayGroup.append("rect")
const darkModeIconTop = overlayGroup.append("path")
const darkModeIconBottom = overlayGroup.append("path")
// const darkModeIcon = overlayGroup.append("text")

const playButton = overlayGroup.append("rect")
const playIcon = overlayGroup.append("text")
const reverseButton = overlayGroup.append("rect")
const reverseIcon = overlayGroup.append("text")
const cognateButton = overlayGroup.append("rect")
const cognateIcon = overlayGroup.append("text")
const resetLinkageButton = overlayGroup.append("rect")
const resetLinkageIcon = overlayGroup.append("text")
const undoRedoButton = overlayGroup.append("rect")
const undoRedoIcon = overlayGroup.append("text")
const fitViewButton = overlayGroup.append("rect")
const fitViewIcon = overlayGroup.append("path")
const swapInOutButton = overlayGroup.append("rect")
const swapInOutIcon = overlayGroup.append("text")
const nodeModeButton = overlayGroup.append("rect")
const nodeModeIcon = overlayGroup.append("text")
const cuspModeButton = overlayGroup.append("rect")
const cuspModeIcon = overlayGroup.append("path")

// const synthModeCycleButton = overlayGroup.append("rect")
// const synthModeCycleIcon = overlayGroup.append("text")

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

const buttonHeight = 30;
const buttonMargin = 5