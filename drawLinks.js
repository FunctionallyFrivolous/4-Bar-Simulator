
const linksData = [
    {id: "AD", points: [], len: 10, color: "indigo", type: "fixed", ternary: false, tAng: 10, tLen: 10, tSnap: false, visible: true},
    {id: "BC", points: [], len: 12, color: "darkgreen", type: "coupler", ternary: true, tAng: 10, tLen: 10, tSnap: false, visible: true},
    {id: "DC", points: [], len: 8, color: "darkblue", type: "output", ternary: false, tAng: 10, tLen: 10, tSnap: false, visible: true},
    {id: "AB", points: [], len: 5, color: "darkred", type: "input", ternary: false, tAng: 10, tLen: 10, tSnap: false, visible: true},
];

// To do (here)?:
    // Calc angle of output link (given link lengths above)
        // Calc node C coords from this. Apply this to the jointsData
    // Calc initial ternary node points
        // This is a one-off action
            // But relies on function that will be frequently repeated: transform node coord relative to angle of base link
            // So actually a specific call of a general function
            // Maybe do this after developing the general transform functions?
        // Keep a simple logic here for initial nodes placement. E.g. mid-link w/ constant offset
        // Short term: manually dictate node coords
const jointsData = [
    {id: "A", x: originCoords.x, y: originCoords.y, color: "none", ground: true, trace: false, points: [], allPoints: []}, 
    {id: "B", x: originCoords.x, y: originCoords.y-getLinkByID("AB").len*coordScale, color: "darkred", ground: false, trace: false, points: [], allPoints: []},  
    {id: "C", x: originCoords.x+11.7*coordScale, y: originCoords.y-7.8*coordScale, color: "darkblue", ground: false, trace: false, points: [], allPoints: []},
    {id: "D", x: originCoords.x+getLinkByID("AD").len*coordScale, y: originCoords.y, color: "none", ground: true, trace: false, points: [], allPoints: []},
    {id: "AB", x: 100, y: 250, color: "darkred", ground: false, trace: false, points: [], allPoints: []},
    {id: "BC", x: 260, y: 140, color: "darkgreen", ground: false, trace: true, points: [], allPoints: []},
    {id: "DC", x: 400, y: 250, color: "darkblue", ground: false, trace: false, points: [], allPoints: []},
    {id: "AD", x: 450, y: 250, color: "none", ground: false, trace: false, points: [], allPoints: []},
]

const synthPoints = [
    {id: "E1", x: 260, y: 140, type: "none", inAng: 0, isOpen: true, display: "block", rings: 1, tableCoords: {x1: 50, y1: 50, x2: 100, y2: 50}},
    {id: "E2", x: 130, y: 250, type: "none", inAng: 0, isOpen: true, display: "none", rings: 2, tableCoords: {x1: 50, y1: 100, x2: 100, y2: 100}},
    {id: "E3", x: 100, y: 200, type: "none", inAng: 0, isOpen: true, display: "none", rings: 3, tableCoords: {x1: 50, y1: 150, x2: 100, y2: 150}},
]

const defaultJoints = structuredClone(jointsData); //Used to reset to default linkage 
const defaultLinks = structuredClone(linksData)

const altTraceData = {points: []}

const fixedStatus = localStorage.getItem("fixedStatus")
if (fixedStatus !== null && fixedStatus !== "") {
    getLinkByType("fixed").visible = fixedStatus === "true" ? true : false
}
const crossOverStatus = localStorage.getItem("crossOver")
if (crossOverStatus !== null && crossOverStatus !== "") {
    allowCrossover = crossOverStatus === "true" ? true : false
}

for (i = 0; i < linksData.length; i++) {
    const linkName = linksData[i].id
    const linkTernary = localStorage.getItem(`${linkName}_t`)
    if (linkTernary !== null && linkTernary !== "") {
        linksData[i].ternary = linkTernary === "true" ? true : false
    }
}

for (i = 0; i < jointsData.length; i++) {
    const nodeName = jointsData[i].id
    const nodeTrace = localStorage.getItem(`${nodeName}_trace`)
    if (nodeTrace !== null && nodeTrace !== "") {
        jointsData[i].trace = nodeTrace === "true" ? true : false
    }
}

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
            saveUndoPoints()
            tempX = event.x
            tempY = event.y
            const pivotNode = getLinkPoints(d.id)[0]
            const tempNode = {id: "tempNode", x: tempX, y: tempY}
            tempAngle = getJointsAngle(pivotNode, tempNode)
            if (d.type !== "input") traceSteps = traceStepsCoarse
        })
        .on("drag", function(event, d) {
            // if (d.type === "output" && cuspMode && synthPointCount > 1) return
            if (activeSynthPoint !== "E1" && d.type !== "input") return
            if (d.type === "input") {
                const currentAngle = getLinkAngle("AB")
                const pivotNode = getLinkPoints(d.id)[0]
                let eventAngle = Math.atan2((pivotNode.y-event.y),(event.x-pivotNode.x))
                eventAngle = getNetAngle(radToDeg(eventAngle))
                const deltaAngle = eventAngle - tempAngle
                const newAngle = currentAngle + deltaAngle
                // document.getElementById("debugOutputs").innerHTML = `${recentLimit}`

                if (recentLimit === "max") {
                    const tempLimit = linkToCoord(inputLimits.max, "angle") - limitThreshold
                    if (eventAngle > tempLimit || Math.abs(tempLimit-eventAngle) > crossoverDeadband*10) {
                        doActuate(tempLimit)
                    }
                    else doActuate(eventAngle)
                }
                else if (recentLimit === "min") {
                    const tempLimit = linkToCoord(inputLimits.min, "angle") + limitThreshold
                    const eventAng = tempLimit < 0 ? eventAngle - 360 : eventAngle
                    if (eventAngle < tempLimit || Math.abs(tempLimit-eventAng) > crossoverDeadband*10) {
                        doActuate(tempLimit)
                    }
                    else doActuate(eventAngle)
                }
                else {
                    doActuate(eventAngle)
                }

                tempX = event.x
                tempY = event.y
                const tempNode = {id: "tempNode", x: tempX, y: tempY}
                tempAngle = getJointsAngle(pivotNode, tempNode)
            }
            // else if (d.type === "output") {
            //     const dx = event.x - tempX
            //     // const dy = event.y - tempY
            //     for (i = 0; i < jointsData.length; i++) {
            //         if (d.id.includes(jointsData[i].id)){//d.id[0] || jointsData[i].id === d.id[1]) {
            //             jointsData[i].x = jointsData[i].x + dx
            //             // jointsData[i].y = jointsData[i].y + dy
            //         } 
            //     }
            //     tempX = event.x
            //     tempY = event.y
            // }
            else {
                const dx = event.x - tempX
                const dy = event.y - tempY
                for (i = 0; i < jointsData.length; i++) {
                    if (d.id.includes(jointsData[i].id)) {//d.id[0] || jointsData[i].id === d.id[1]) {
                        jointsData[i].x = jointsData[i].x + dx
                        jointsData[i].y = jointsData[i].y + dy
                    } 
                }
                tempX = event.x
                tempY = event.y
                if (d.type === "coupler") {
                    synthPoints[0].x = getJoint(d.id).x
                    synthPoints[0].y = getJoint(d.id).y
                }
                updateTPoints(false, d.id)
                pathNodeModeSynth(nodeMode, d.type === "output")
                // pathNodeSynth(nodeMode, d.type === "output")
                pathNodeModeSynth(cuspMode)
                // pathCuspSynth(cuspMode)
                setLinkPoints()
                updateTrace()
                updateLinkGeometry();
            }
        })
        .on("end", function(event,d) {
            traceSteps = traceStepsFine
            savePoints()
            if (d.type !== "input") {
                updateTrace()
                synthModeOpen = linkageOpen
            }
            updateLinkGeometry();
        })
    )
const linkLinesToolTip = linkLines
    .append("title")
    .text(d => `${d.type} link (L = ${d.len.toFixed(1)})`)

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
    .data(jointsData)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 8.5)
    .attr("fill", d => d.ground ? fgColor : "none")
    // .attr("opacity", 0.75)

const nodeDots = nodeDotGroup.selectAll("cirlce")
    .data(jointsData)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("fill", bgColor)
    .style("pointer-events", "none")

const nodeDrag = nodeDragGroup.selectAll("cirlce")
    .data(jointsData)
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
            saveUndoPoints()
            nodeDrag.attr("opacity", n => n.id === d.id ? 0.1 : 0)
            traceSteps = traceStepsCoarse
        })
        .on("drag", function(event, d) {
            if (d.id === "D" && cuspMode && synthPointCount > 1) return
            if (activeSynthPoint !== "E1") return
            // if (d.id === "A") return
            // if (d.id === "D") {
            //     d.x = Math.max(event.x, getJoint("A").x);
            // }
            // if (d.id !== "D") {
                d.x = event.x
                d.y = event.y
            // }
            if (d.id === "BC") {
                synthPoints[0].x = d.x
                synthPoints[0].y = d.y
            } else {
                synthPoints[0].x = getJoint("BC").x
                synthPoints[0].y = getJoint("BC").y
            }
            if (d.id.length === 2) updateTPoints(true, d.id)
            else updateTPoints()
            pathNodeModeSynth(nodeMode, d.type === "output")
            // pathNodeSynth(nodeMode, d.type === "output")
            pathNodeModeSynth(cuspMode)
            // pathCuspSynth(cuspMode)
            setLinkPoints()
            updateTrace()
            updateLinkGeometry();
        })
        .on("end", function() {
            nodeDrag.attr("opacity", 0)
            traceSteps = traceStepsFine
            savePoints()
            updateTrace()
            synthModeOpen = linkageOpen
            updateLinkGeometry()
        })
    )
const nodeDragToolTip = nodeDrag
    .append("title")
    .text(d => `(${d.x.toFixed(1)}, ${d.y.toFixed(1)})`)

const traceDots = traceDotGroup.selectAll("circle")
    .data(jointsData)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 3)
    .style("pointer-events", "none")
const traceLines = traceLineGroup.selectAll("polyline")
    .data(jointsData)
    .enter()
    .append("polyline")
    .attr("fill", "none")
    .attr("stroke-width", 2)
    .style("stroke-linecap", "round")
    .attr("stroke-dasharray", "3,5")
    .style("pointer-events", "none")
    .style("display", "none")
const fullTraceLines = fullTraceGroup.selectAll("polyline")
    .data(jointsData)
    .enter()
    .append("polyline")
    .attr("fill", "none")
    .attr("opacity", 0.2)
    .attr("stroke-width", 2)
    .style("stroke-linecap", "round")
    .style("pointer-events", "none")
const altTraceLine = zoomGroup
    .append("polyline")
    .attr("fill", "none")
    .attr("opacity", 0.2)
    .attr("stroke-width", 2)
    .style("stroke-linecap", "round")
    .style("pointer-events", "none")

const synthDots = synthDotGroup.selectAll("circle")
    .data(synthPoints)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 3)
    .style("pointer-events", "none")

// const synthDrag = synthDragGroup.selectAll("circle")
//     .data(synthPoints)
//     .enter()
//     .append("circle")
//     // .attr("class", "synthPoint")
//     .attr("cx", d => d.x)
//     .attr("cy", d => d.y)
//     .attr("r", 20)
const synthDrag = synthDragGroup.selectAll("circle")
    .data(synthPoints)
    .enter()
    .append("path")
    // .attr("class", "synthPoint")
    .attr("d", d => drawConcentricCircles(d.x, d.y, d.rings))
    .attr("fill-opacity", 0)
    .attr("stroke-width", 2)
    .attr("stroke-opacity", 0.25)
    .on("click", function(event, d) {
        // if (!nodeMode) return
        // if (invertStatus) {
        //     invertLinkage()
        //     // mirrorNodeSynth() // ?
        //     invertStatus = false
        // }
        if (swapStatus) {
            swapInputOutput()
            // mirrorNodeSynth() // ?
            swapStatus = false
        }
        // If BC is at this synth point (and in node mode), mirror the input and output links to the alt solution
        if (nodeMode && Math.abs(d.x - getJoint("BC").x) < limitThreshold && Math.abs(d.y - getJoint("BC").y) < limitThreshold) {
            mirrorNodeSynth(true)
            setLinkPoints()
            tPointFollow()
            updateTrace()
            updateLinkGeometry()
            d.isOpen = linkageOpen
        }
        // Otherwise, snap to the active point input angle 
        else snapToSynthPoint(d.id)

        activeSynthPoint = d.id
        // d.isOpen = linkageOpen
        recentLimit = "none"
        updateTrace(false)
        updateLinkGeometry()
        savePoints()
    })
    .call(d3.drag()
        .on("start", function(event,d) {
            saveUndoPoints()

            synthModeTempAngle = inputAngle
            synthModeTempOpen = linkageOpen

            const activePoint = synthPoints.find(p => p.id === activeSynthPoint)
            if (Math.abs(activePoint.x-getJoint("BC").x) < limitThreshold && Math.abs(activePoint.y-getJoint("BC").y) < limitThreshold) {
                synthPointSnap = true
            } else synthPointSnap = false

            synthDrag.attr("fill-opacity", n => n.id === d.id ? 0.1 : 0)
        })
        .on("drag", function(event, d) {
            const activePoint = synthPoints.find(p => p.id === activeSynthPoint)

            // First, snap back to E1 position. Keep track of whether the linkage was inverted to get there
            const inverted = snapToSynthPoint("E1")

            // Drag the selected point
            d.x = event.x
            d.y = event.y
            // Snap the coupler point to E1
            getJoint("BC").x = synthPoints[0].x
            getJoint("BC").y = synthPoints[0].y
            
            // Perform the relevant node mode stuff
            pathNodeModeSynth(nodeMode||cuspMode)
            // pathNodeSynth(nodeMode)
            // pathCuspSynth(cuspMode)

            // Snap to the input angle of the active point
            let revertAngle = activePoint.inAng

            // Snap back to the input angle from before the drag event
            if (synthPointSnap) {
                if (inverted || revertAngle > inputLimits.max || revertAngle < inputLimits.min) { // If the linkage was previously inverted, revert it
                    invertLinkage()
                    updateOpenCrossed()
                    updateInputLimits()
                    updateOutputLimits()
                }
                linkageOpen = activePoint.isOpen
                doActuate(getNetAngle(linkToCoord(revertAngle,"angle")))
            } else {
                if (inverted){//  || synthModeTempOpen > inputLimits.max || synthModeTempOpen < inputLimits.min) {
                    // If we include limits ^, the coupler point can jump to other loop when dragging casuses it to reach a limit...
                    // If we exclude limits ^, the coupler point will jump to other loop if it gets pinched off from active point...
                    invertLinkage()
                    updateOpenCrossed()
                    updateInputLimits()
                    updateOutputLimits()
                }
                linkageOpen = synthModeTempOpen
                doActuate(getNetAngle(linkToCoord(synthModeTempAngle,"angle")))
            }
            // doActuate(getNetAngle(linkToCoord(revertAngle,"angle")))

            // Update all the things
            setLinkPoints()
            updateTPoints()
            updateTrace()
            // updateTrace(false, synthModeOpen)
            updateLinkGeometry()
        })
        .on("end", function(event,d) {
            savePoints()
            synthDrag.attr("fill-opacity", 0)
            synthModeTempAngle = inputAngle
        })
    )

svg.selectAll(".link")
  .on("pointerdown", linkDoubleTap);

svg.selectAll(".node")
  .on("pointerdown", nodeDoubleTap);

// svg.selectAll(".synthPoint")
//   .on("pointerdown", synthPointDoubleTap);

function linkDoubleTap(event, d) {
    const now = Date.now();
    if (now - lastTapTime < 300) {
        if(d.type !== "fixed") {
            d.ternary = !d.ternary
            localStorage.setItem(`${d.id}_t`, `${d.ternary}`)
        } else {
            // d.visible = !d.visible
            // localStorage.setItem("fixedStatus", `${d.visible}`)
            invertStatus = !invertStatus
            invertLinkage()
            savePoints()
            updateTrace()
            updateLinkGeometry()
        }
        setLinkPoints()
        updateTrace(false)
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
            localStorage.setItem("fixedStatus", `${thisLink.visible}`)
        } else {
            d.trace = !d.trace
            localStorage.setItem(`${d.id}_trace`, `${d.trace}`)
        }
        updateLinkGeometry()
    }
    lastTapTime = now;
}

// function synthPointDoubleTap(event, d) {
//     const now = Date.now();
//     if (now - lastTapTime < 300) {
//         // synthPointCount++
//         if (synthPointCount >= 2) synthPointCount--
//         else synthPointCount++
//         for (i = 0; i < synthPoints.length; i++) {
//             synthPoints[i].display = i < synthPointCount ? "block" : "none"
//         }
//         // document.getElementById("debugOutputs").innerHTML = `${synthPointCount}`
//         updateLinkGeometry()
//     }
//     lastTapTime = now;
// }

loadPoints()
calcOutputAngle()
updateTPoints()
setLinkPoints()
// updateInputLimits()
// updateOutputLimits()
updateOpenCrossed()
updateLinkGeometry()
updateTrace()
toggleDarkMode()
updateLinkGeometry()