
const linksData = [
    {id: "AD", points: [], len: 10, color: "indigo", type: "fixed", ternary: false, tAng: 10, tLen: 10, visible: true},
    {id: "BC", points: [], len: 12, color: "darkgreen", type: "coupler", ternary: true, tAng: 10, tLen: 10, visible: true},
    {id: "DC", points: [], len: 8, color: "darkblue", type: "output", ternary: false, tAng: 10, tLen: 10, visible: true},
    {id: "AB", points: [], len: 5, color: "darkred", type: "input", ternary: false, tAng: 10, tLen: 10, visible: true},
];
// To do (here):
    // Calc angle of output link (given link lengths above)
        // Calc node C coords from this. Apply this to the nodesData
    // Calc initial ternary node points
        // This is a one-off action
            // But relies on function that will be frequently repeated: transform node coord relative to angle of base link
            // So actually a specific call of a general function
            // Maybe do this after developing the general transform functions?
        // Keep a simple logic here for initial nodes placement. E.g. mid-link w/ constant offset
        // Short term: manually dictate node coords
const nodesData = [
    {id: "A", x: originCoords.x, y: originCoords.y, color: "none", ground: true, trace: false, points: [], allPoints: []}, 
    {id: "B", x: originCoords.x, y: originCoords.y-getLinkByID("AB").len*coordScale, color: "darkred", ground: false, trace: false, points: [], allPoints: []},  
    {id: "C", x: originCoords.x+11.7*coordScale, y: originCoords.y-7.8*coordScale, color: "darkblue", ground: false, trace: false, points: [], allPoints: []},
    {id: "D", x: originCoords.x+getLinkByID("AD").len*coordScale, y: originCoords.y, color: "none", ground: true, trace: false, points: [], allPoints: []},
    {id: "AB", x: 100, y: 250, color: "darkred", ground: false, trace: false, points: [], allPoints: []},
    {id: "BC", x: 260, y: 140, color: "darkgreen", ground: false, trace: true, points: [], allPoints: []},
    {id: "DC", x: 400, y: 250, color: "darkblue", ground: false, trace: false, points: [], allPoints: []},
    {id: "AD", x: 450, y: 250, color: "none", ground: false, trace: false, points: [], allPoints: []},
]

// const traceData = [{id: "BC", points: []}]

const linkLines = linkLineGroup.selectAll("polygon")
    .data(linksData)
    .enter()
    .append("polygon")
    .attr("class", "link")
    .attr("opacity", 0.5)
    .style("stroke-linecap", "round")
    .style("stroke-linejoin", "round")
    .attr("stroke-width", 25)
    .call(d3.drag()
        .on("start", function(event, d) {
            tempX = event.x
            tempY = event.y
            const pivotNode = getLinkNodes(d.id)[0]
            const tempNode = {id: "tempNode", x: tempX, y: tempY}
            tempAngle = getNodesAngle(pivotNode, tempNode)
            traceSteps = traceStepsCoarse
        })
        .on("drag", function(event, d) {
            if (d.type === "input") {
                const currentAngle = getLinkAngle("AB")
                const pivotNode = getLinkNodes(d.id)[0]
                let eventAngle = Math.atan2((pivotNode.y-event.y),(event.x-pivotNode.x))
                eventAngle = getNetAngle(radToDeg(eventAngle))
                const deltaAngle = eventAngle - tempAngle
                const newAngle = currentAngle + deltaAngle

                doActuate(newAngle)

                tempX = event.x
                tempY = event.y
                const tempNode = {id: "tempNode", x: tempX, y: tempY}
                tempAngle = getNodesAngle(pivotNode, tempNode)
            }
            // else if (d.type === "output") {
            //     const dx = event.x - tempX
            //     // const dy = event.y - tempY
            //     for (i = 0; i < nodesData.length; i++) {
            //         if (d.id.includes(nodesData[i].id)){//d.id[0] || nodesData[i].id === d.id[1]) {
            //             nodesData[i].x = nodesData[i].x + dx
            //             // nodesData[i].y = nodesData[i].y + dy
            //         } 
            //     }
            //     tempX = event.x
            //     tempY = event.y
            // }
            else {
                const dx = event.x - tempX
                const dy = event.y - tempY
                for (i = 0; i < nodesData.length; i++) {
                    if (d.id.includes(nodesData[i].id)){//d.id[0] || nodesData[i].id === d.id[1]) {
                        nodesData[i].x = nodesData[i].x + dx
                        nodesData[i].y = nodesData[i].y + dy
                    } 
                }
                tempX = event.x
                tempY = event.y
            }
            updateTNodes()
            setLinkNodes()
            updateTrace()
            updateLinkGeometry();
        })
        .on("end", function(event,d) {
            traceSteps = traceStepsFine
            updateTrace()
            updateLinkGeometry();
        })
    )

const groundLine = groundLineGroup.selectAll("polyline")
    .data(linksData)
    .enter()
    .append("polyline")
    .attr("opacity", 1)
    .style("stroke-linecap", "round")
    .style("stroke-linejoin", "round")
    .attr("opacity", 0.85)
    .attr("stroke-width", 4)
    .attr("fill", "none")
    .style("display", d => d.type === "fixed" ? "block" : "none")
    .style("pointer-events", "none")

const fixedNodes = fixedNodeGroup.selectAll("circle")
    .data(nodesData)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 8.5)
    .attr("fill", d => d.ground ? fgColor : "none")
    // .attr("opacity", 0.75)

const nodeDots = nodeDotGroup.selectAll("cirlce")
    .data(nodesData)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("fill", bgColor)
    .style("pointer-events", "none")

const nodeDrag = nodeDragGroup.selectAll("cirlce")
    .data(nodesData)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 20)
    .attr("fill", fgColor)
    .attr("opacity", 0)
    .call(d3.drag()
        .on("start", function(event, d) {
            nodeDrag.attr("opacity", n => n.id === d.id ? 0.1 : 0)
            traceSteps = traceStepsCoarse
        })
        .on("drag", function(event, d) {
            if (d.id === "A") return
            // if (d.id === "D") {
            //     d.x = Math.max(event.x, getNode("A").x);
            // }
            // if (d.id !== "D") {
                d.x = event.x
                d.y = event.y
            // }
            updateTNodes()
            setLinkNodes()
            updateTrace()
            updateLinkGeometry();
        })
        .on("end", function() {
            nodeDrag.attr("opacity", 0)
            traceSteps = traceStepsFine
            updateTrace()
            updateLinkGeometry();
        })
    )

const traceDots = traceDotGroup.selectAll("circle")
    .data(nodesData)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 3)
    .style("pointer-events", "none")
const traceLines = traceLineGroup.selectAll("polyline")
    .data(nodesData)
    .enter()
    .append("polyline")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .style("stroke-linecap", "round")
    .attr("stroke-dasharray", "3,5")
    .style("pointer-events", "none")
    .style("display", "none")
const fullTraceLines = fullTraceGroup.selectAll("polyline")
    .data(nodesData)
    .enter()
    .append("polyline")
    .attr("fill", "none")
    .attr("opacity", 0.15)
    .attr("stroke-width", 2)
    .style("stroke-linecap", "round")
    .style("pointer-events", "none")

// const smoothTraces = smoothTraceGroup.selectAll("")

// const smoothData = [{x: 0, y: 80}, {x: 100, y: 100}, {x: 200, y: 30}, {x: 300, y: 50}];
// const lineGenerator = d3.line()
//     // .data(smoothData)
//     .x(d => d.x)
//     .y(d => d.y)
//     .curve(d3.curveCatmullRom.alpha(1))

// const smoothTrace = zoomGroup.append("path")
//   .attr("d", lineGenerator(smoothData))
//   .attr("fill", "none")
//   .attr("stroke", "steelblue");



svg.selectAll(".link")
  .on("pointerdown", linkDoubleTap);

svg.selectAll(".node")
  .on("pointerdown", nodeDoubleTap);

function linkDoubleTap(event, d) {
    const now = Date.now();
    if (now - lastTapTime < 300) {
        if(d.type !== "fixed") {
            d.ternary = !d.ternary
        } else {
            d.visible = !d.visible
        }
        setLinkNodes()
        updateLinkGeometry()
    }
    lastTapTime = now;
}

function nodeDoubleTap(event, d) {
    const now = Date.now();
    if (now - lastTapTime < 300) {
        if(d.ground) {
            const thisLink = getLinkByType("fixed")
            thisLink.visible = !thisLink.visible
        } else {
            d.trace = !d.trace
        }
        updateLinkGeometry()
    }
    lastTapTime = now;
}

// setLinkNodes()
updateOutputAngle()
updateTNodes()
setLinkNodes()
updateTrace()
updateLinkGeometry();