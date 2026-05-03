
function doActuate(deg) {
    let inAngle = deg

    let checkAngle = coordToLink(inAngle, "angle")

    if (inputLimits.min < 0 && checkAngle > 180) {
        checkAngle = checkAngle - 360
    }
    if (inputClass !== "Crank") {
        if (checkAngle < inputLimits.min) {
            inAngle = linkToCoord(inputLimits.min, "angle") + limitThreshold;
            recentLimit = "min"
            if (!recentCrossover && checkAngle < inputLimits.min + crossoverDeadband && allowCrossover) {
                toggleOpenCrossed(false)
                recentCrossover = true
            }
        } else if (checkAngle > inputLimits.max) {
            inAngle = linkToCoord(inputLimits.max, "angle") - limitThreshold;
            recentLimit = "max"
            if (!recentCrossover && checkAngle > inputLimits.max - crossoverDeadband && allowCrossover) {
                toggleOpenCrossed(false)
                recentCrossover = true
            }
        }
        if (checkAngle > inputLimits.min + crossoverDeadband && checkAngle < inputLimits.max - crossoverDeadband) {
                recentCrossover = false
                recentLimit = "none"
        } 
    }

    inputAngle = coordToLink(inAngle, "angle")

    // const outAngle = calcOutputAngle(inputAngle)
    outputAngle = calcOutputAngle(inputAngle)
    // updateOutputAngle();

    setLinkAngle(getLinkByType("input").id, inAngle)
    setLinkAngle(getLinkByType("output").id, outputAngle)
    tNodeFollow()
    
    updateLinkGeometry();

    // nodeMode = false
    cuspMode = false
    // synthModeCycleButton
    //     .style("display", "none")
    // synthModeCycleIcon
    //     .style("display", "none")
    // synthCycle = 0
}

function calcOutputAngle(inDeg=inputAngle, open=linkageOpen) {
    const a = getLinkByType("input").len
    const b = getLinkByType("output").len
    const c = getLinkByType("coupler").len
    const d = getLinkByType("fixed").len

    const inAngle = degToRad(inDeg)

    const U = a*a + b*b - c*c + d*d - 2*a*d*Math.cos(inAngle)
    const V = 2*a*b*Math.sin(inAngle)
    const W = 2*b*(d - a*Math.cos(inAngle))

    const configFactor = open ? 1 : -1
    const halfTan = (-V + configFactor * Math.sqrt(Math.max((V*V - U*U + W*W),0)))/(W-U)
    let outAngle = Math.atan(halfTan) * 2
    outAngle = getNetAngle(radToDeg(outAngle))

    outAngle = linkToCoord(outAngle, "angle")

    return outAngle;
}
// function updateOutputAngle() {
//     outputAngle = calcOutputAngle(inputAngle)
// }

function updateInputLimits() {
    const a = getLinkByType("input").len
    const b = getLinkByType("output").len
    const c = getLinkByType("coupler").len
    const d = getLinkByType("fixed").len

    let A_min = 0;
    let A_max = 360;

    const A_min_temp = ((c-b)*(c-b) - a*a - d*d)/(2*a*d);
    const A_max_temp = ((c+b)*(c+b) - a*a - d*d)/(2*a*d);

    const A_min_rad = Math.acos(A_min_temp);
    const A_max_rad = Math.acos(A_max_temp);

    let A_min_deg = getNetAngle(radToDeg(Math.acos(A_min_temp)));

    let A_max_deg = getNetAngle(radToDeg(Math.acos(A_max_temp)));
    
    if (Number.isNaN(A_min_rad) & Number.isNaN(A_max_rad)) {
        A_min = 0;
        A_max = 360;
        inputClass = "Crank";
    } else if (Number.isNaN(A_min_rad)) {
        A_max = 180-A_max_deg;
        A_min = -A_max;
        inputClass = "0-Rocker";
    } else if (Number.isNaN(A_max_rad)) {
        A_min = 180-A_min_deg;
        A_max = 360-A_min;
        inputClass = "π-Rocker";
    } else {
        A_min = 180-A_min_deg;
        A_max = 180-A_max_deg;
        inputClass = "Rocker";
    }

    if (inputClass === "Rocker" && inputAngle > 180) {
        A_min = 360-A_min;
        A_max = 360-A_max;
    }
    
    if (A_min > A_max) {
        const A_swap = A_min;
        A_min = A_max;
        A_max = A_swap;
    }

    inputLimits.min = A_min;
    inputLimits.max = A_max;
}

function updateOutputLimits() {

    const a = getLinkByType("input").len
    const b = getLinkByType("output").len
    const c = getLinkByType("coupler").len
    const d = getLinkByType("fixed").len

    let B_min = 0;
    let B_max = 360;

    const B_min_temp = ((c-a)*(c-a) - b*b - d*d)/(2*b*d);
    const B_max_temp = ((c+a)*(c+a) - b*b - d*d)/(2*b*d);

    const B_min_rad = Math.acos(B_min_temp);
    const B_max_rad = Math.acos(B_max_temp);
    

    if (Number.isNaN(B_min_rad) & Number.isNaN(B_max_rad)) {
        B_min = 0;
        B_max = 360;
        outputClass = "Crank";
    } else if (Number.isNaN(B_min_rad)) {
        B_max = radToDeg(B_max_rad);
        B_min = 360-B_max;
        outputClass = "π-Rocker"
    } else if (Number.isNaN(B_max_rad)) {
        B_min = radToDeg(B_min_rad);
        B_max = -B_min;
        outputClass = "0-Rocker"
    } else {
        B_min = radToDeg(B_min_rad);
        B_max = radToDeg(B_max_rad);
        outputClass = "Rocker"
    }

    if (!linkageOpen & outputClass !== "0-Rocker") {
        B_min = 360-B_min;
        B_max = 360-B_max;
    }
    
    const crossAngle = coordToLink(getNodesAngle(getNode("D"), getNode("B")),"angle")

    if (!linkageOpen & outputClass === "Rocker" && inputClass === "Rocker" && crossAngle < 180) {
        B_min = 360-B_min;
        B_max = 360-B_max;
    }
    if (linkageOpen & outputClass === "Rocker" & inputClass === "Rocker" & crossAngle > 180 ) {
        B_min = 360-B_min;
        B_max = 360-B_max;
    }
    
    if (B_min > B_max) {
        const B_swap = B_min;
        B_min = B_max;
        B_max = B_swap;
    }

    outputLimits.min = B_min;
    outputLimits.max = B_max;

}

// function updateLinkageConfig() {
//     updateOpenCrossed()
//     updateInputLimits()
//     updateOutputLimits()
// }

function updateOpenCrossed() {
    const AB_th = coordToLink(getNodesAngle(getNode("A"), getNode("B")), "angle")

    let DB_th = coordToLink(getNodesAngle(getNode("D"), getNode("B"), true), "angle")
    const BD_th = coordToLink(getNodesAngle(getNode("B"), getNode("D"), true), "angle")

    let DC_th = coordToLink(getNodesAngle(getNode("D"), getNode("C"), true), "angle")
    const BC_th = coordToLink(getNodesAngle(getNode("B"), getNode("C"), true), "angle")
    
    if (AB_th < DB_th && DC_th < DB_th) {
        linkageOpen = true
    } else if (BC_th < DC_th && BC_th > BD_th) {
        linkageOpen = true
    } else linkageOpen = false

    // openCrossedIcon.text(linkageOpen ? "Open ⇋ Crossed" : "Crossed ⇋ Open")
    openCrossedIcon.text(linkageOpen ? "⨀" : "⨂")
    // openCrossedIcon.attr("d", drawOpenCrossedIcon()[linkageOpen ? 1 : 0])
} 

function toggleOpenCrossed(retrace=true) {
    const DB_th = getNodesAngle(getNode("D"), getNode("B"))
    const DC_th = getNodesAngle(getNode("D"), getNode("C"))
    const newDC_th = 2*DB_th - DC_th
    rotateNode(getNode("C"),newDC_th,getNode("D"))
    updateOpenCrossed()
    tNodeFollow()
    if (retrace) updateTrace()
    updateLinkGeometry()
}

function updateLinkGeometry() {
    // pathNodeSynth(false)
    nodeDrag
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .style("display", d => d.id.length === 1 ? "block" : getLinkByID(d.id).ternary ? "block" : "none")
    fixedNodes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("fill", d => d.ground ? fgColor : "none")
        .style("display", d => d.id.length === 1 ? "block" : getLinkByID(d.id).ternary ? "block" : "none")
    nodeDots
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.ground ? 4 : d.trace ? 5.5 : 5)
        .attr("fill", bgColor)
        .style("display", d => d.id.length === 1 ? "block" : getLinkByID(d.id).ternary ? "block" : "none")

    setLinkNodes()

    linkLines
        .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
        .attr("stroke", d => d3.interpolateRgb(d.color,"white")(whtnColor))
        .attr("fill", d => d3.interpolateRgb(d.color,"white")(whtnColor))
        .attr("opacity", d => d.type === "fixed" ? 0 : darkMode ? 0.8 : 0.65)
        // .attr("stroke-width", d => d.type === "fixed" ? 4 : 20)
        .style("display", d => d.visible ? "block" : "none")
    groundLine
        .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
        .attr("stroke", fgColor)
        .style("display", d => d.type === "fixed" && d.visible ? "block" : "none")
        .attr("stroke-dasharray", d => d.type === "fixed" ? "4,8" : "none")
    traceDots
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("fill", d => d3.interpolateRgb(d.color,"white")(whtnColor*2))
        .style("display", d => !d.trace ? "none" : d.id.length === 2 && !linksData.find(l => l.id === d.id).ternary ? "none" : "block")
    traceLines
        .attr("stroke", d => d3.interpolateRgb(d.color,"white")(whtnColor*2))
        .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
        .style("display", d => !d.trace ? "none" : d.id.length === 2 && !linksData.find(l => l.id === d.id).ternary ? "none" : "block")
    fullTraceLines
        .attr("stroke", d => d3.interpolateRgb(d.color,"white")(whtnColor*2))
        .attr("points", d => d.allPoints.map(j => `${j.x},${j.y}`).join(" "))
        .style("display", d => !d.trace ? "none" : d.id.length === 2 && !linksData.find(l => l.id === d.id).ternary ? "none" : "block")
    altTraceLine
        .attr("stroke", d3.interpolateRgb("darkgreen","white")(whtnColor*2))
        .attr("points", altTraceData.points.map(j => `${j.x},${j.y}`).join(" "))
        .style("display", !nodesData.find(n => n.id === "BC").trace || !linksData.find(l => l.id === "BC").ternary ? "none" : "block")

    synthDots
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("fill", d3.interpolateRgb("darkgreen","white")(whtnColor*2))
        .style("display", nodeMode || cuspMode ? d => d.display : "none")
    synthDrag
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("fill", fgColor)
        .attr("stroke", fgColor)
        .style("display", nodeMode || cuspMode ? d => d.display : "none")

    // updateLinkageConfig()
    updateOpenCrossed()
    updateInputLimits()
    updateOutputLimits()

    crossoverIcon
        .attr("opacity", inputClass === "Crank" ? 0.25 : 1)
        // .attr("text-decoration", allowCrossover ? "none" : "line-through")
        .text(allowCrossover ? "↔" : "⇹")
    crossoverButton
        .attr("stroke-opacity", inputClass === "Crank" ? 0.25 : 0.75)
        .attr("fill-opacity", inputClass === "Crank" ? 0.25 : 0.75)

    cognateIcon
        .attr("opacity", getLinkByType("coupler").ternary ? 1 : 0.25)
    cognateButton
        .attr("stroke-opacity", getLinkByType("coupler").ternary ? 0.75 : 0.25)
        .attr("fill-opacity", getLinkByType("coupler").ternary ? 0.75 : 0.25)
        .style("pointer-events", getLinkByType("coupler").ternary ? "auto" : "none")

    nodeModeIcon
        .attr("opacity", nodeMode ? 1 : 0.5)
    cuspModeIcon
        .attr("opacity", cuspMode ? 1 : 0.5)


    inputLinkVal
        .attr("fill", d3.interpolateRgb(getLinkByType("input").color,"white")(whtnColor*2))
        .text(`Input: ${inputLimits.min < 0 ? coordToLink(getLinkAngle("AB"),"angle").toFixed(1) : getNetAngle(inputAngle).toFixed(1)}°`)
    inputLinkProps
        .attr("fill", d3.interpolateRgb(getLinkByType("input").color,"white")(whtnColor*2))
        .text(`${inputClass} (${inputLimits.min.toFixed(1)}°, ${inputLimits.max.toFixed(1)}°)`)

    outputLinkVal
        .attr("fill", d3.interpolateRgb(getLinkByType("output").color,"white")(whtnColor*2))
        .text(`Output: ${outputLimits.min < 0 ? outputAngle.toFixed(1) : getNetAngle(outputAngle).toFixed(1)}°`)
    outputLinkProps 
        .attr("fill", d3.interpolateRgb(getLinkByType("output").color,"white")(whtnColor*2))
        .text(`${outputClass} (${outputLimits.min.toFixed(1)}°, ${outputLimits.max.toFixed(1)}°)`)

    updateToolTips()

    // DBLink
    //     .attr("x1", getNode("D").x)
    //     .attr("y1", getNode("D").y)
    //     .attr("x2", getNode("B").x)
    //     .attr("y2", getNode("B").y)

    // document.getElementById("debugOutputs").innerHTML = `${synthModeInputAngle.toFixed(1)}`
}

function updateTrace() {
    updateInputLimits()
    updateOutputLimits()

    let in_startAngle = inputLimits.min
    let in_endAngle = inputLimits.max
    const in_angleRange = in_endAngle-in_startAngle
    let in_angleStep = in_angleRange/traceSteps

    const inputLink = getLinkByType("input")
    const outputLink = getLinkByType("output")
    const couplerLink = getLinkByType("coupler")
    const fixedLink = getLinkByType("fixed")

    const nodeA = getNode(inputLink.id[0])
    const nodeB = getNode(inputLink.id[1])
    const nodeC = getNode(outputLink.id[1])
    const nodeD = getNode(outputLink.id[0])
    const nodeAB = getNode(inputLink.id)
    const nodeBC = getNode(couplerLink.id)
    const nodeDC = getNode(outputLink.id)
    const nodeAD = getNode(fixedLink.id)
    
    for (i = 0; i < nodesData.length; i++) {
        nodesData[i].points = []
        nodesData[i].allPoints = []
        altTraceData.points = []
    }

    let inAngle = in_startAngle
    let outAngle = calcOutputAngle(inAngle)

    let out_startAngle = outputLimits.max
    let out_endAngle = outputLimits.min

    // let dbgtxt = ``

    for (i = 0; i < traceSteps+1; i++) {

        inAngle = in_startAngle + in_angleStep * i
        outAngle = calcOutputAngle(inAngle, true)

        if (linkageOpen) {
            const out_temp = outputClass === "0-Rocker" && (coordToLink(outAngle,"angle") > 180) ? coordToLink(outAngle,"angle")-360 : coordToLink(outAngle,"angle")
            out_startAngle = Math.min(out_startAngle, out_temp)
            out_endAngle = Math.max(out_endAngle, out_temp)
        }

        const newB = {x: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[0], y: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[1]}
        const outAngle_temp = getNetAngle(calcOutputAngle(inAngle, true))
        const newC = {x: placeNodePolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false)[0], y: placeNodePolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false)[1]}
        const couplerAngle = getNodesAngle(newB,newC)
        const couplerTAngle = couplerAngle + couplerLink.tAng
        const couplerTDist = couplerLink.tLen
        const newBC = {x: placeNodePolar(nodeBC, newB, couplerTAngle, couplerTDist, false)[0], y: placeNodePolar(nodeBC, newB, couplerTAngle, couplerTDist, false)[1]}
        // const newAB = {x: placeNodePolar(nodeAB, nodeA, linkToCoord(inAngle, "angle")+inputLink.tAng, inputLink.tLen, false)[0], y: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle")+inputLink.tAng, inputLink.tLen, false)[1]}
        const newDC = {x: placeNodePolar(nodeDC, nodeD, outAngle+outputLink.tAng, outputLink.tLen, false)[0], y: placeNodePolar(nodeDC, nodeD, outAngle+outputLink.tAng, outputLink.tLen, false)[1]}

        let deltaBC = 0;
        if (nodeBC.allPoints.length > 0) {
            deltaBC = Math.sqrt((newBC.x - nodeBC.allPoints[nodeBC.allPoints.length-1].x)*(newBC.x - nodeBC.allPoints[nodeBC.allPoints.length-1].x) + (nodeBC.allPoints[nodeBC.allPoints.length-1].y - newBC.y)*(nodeBC.allPoints[nodeBC.allPoints.length-1].y - newBC.y))
        }
        if (i === 0 || deltaBC > traceDelta) {
            // nodeB.points.push(newB)
            // nodeAB.points.push(newAB)
            if (linkageOpen || (allowCrossover && inputClass !== "Crank")) {
                nodeBC.points.push(newBC)
            }

            // nodeB.allPoints.push(newB)
            // nodeAB.allPoints.push(newAB)
            if (linkageOpen || inputClass !== "Crank") {
                nodeC.allPoints.push(newC)
                nodeDC.allPoints.push(newDC)
                nodeBC.allPoints.push(newBC)
            }
        }
    }
    // document.getElementById("debugOutputs").innerHTML = dbgtxt

    for (i = 0; i < traceSteps+1; i++) {

        inAngle = in_endAngle - in_angleStep * i
        outAngle = calcOutputAngle(inAngle, false)

        if (!linkageOpen) {
            const out_temp = outputClass === "0-Rocker" && (coordToLink(outAngle,"angle") > 180) ? coordToLink(outAngle,"angle")-360 : coordToLink(outAngle,"angle")
            out_startAngle = Math.min(out_startAngle, out_temp)
            out_endAngle = Math.max(out_endAngle, out_temp)
        }

        const newB = {x: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[0], y: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[1]}
        const outAngle_temp = getNetAngle(calcOutputAngle(inAngle, false))
        const newC = {x: placeNodePolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false)[0], y: placeNodePolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false)[1]}
        const couplerAngle = getNodesAngle(newB,newC)
        const couplerTAngle = getNetAngle(couplerAngle + couplerLink.tAng)
        const couplerTDist = couplerLink.tLen
        const newBC = {x: placeNodePolar(nodeBC, newB, couplerTAngle, couplerTDist, false)[0], y: placeNodePolar(nodeBC, newB, couplerTAngle, couplerTDist, false)[1]}
        // const newAB = {x: placeNodePolar(nodeAB, nodeA, linkToCoord(inAngle, "angle")+inputLink.tAng, inputLink.tLen, false)[0], y: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle")+inputLink.tAng, inputLink.tLen, false)[1]}
        const newDC = {x: placeNodePolar(nodeDC, nodeD, outAngle+outputLink.tAng, outputLink.tLen, false)[0], y: placeNodePolar(nodeDC, nodeD, outAngle+outputLink.tAng, outputLink.tLen, false)[1]}

        let deltaBC = 0;
        if (nodeBC.allPoints.length > 0) {
            deltaBC = Math.sqrt((newBC.x - nodeBC.allPoints[nodeBC.allPoints.length-1].x)*(newBC.x - nodeBC.allPoints[nodeBC.allPoints.length-1].x) + (nodeBC.allPoints[nodeBC.allPoints.length-1].y - newBC.y)*(nodeBC.allPoints[nodeBC.allPoints.length-1].y - newBC.y))
        }
        
        if (i === 0 || deltaBC > traceDelta) {
            if (!linkageOpen || (allowCrossover && inputClass !== "Crank")) {
                nodeBC.points.push(newBC)
            }
            
            if (!linkageOpen || inputClass !== "Crank") {
                nodeBC.allPoints.push(newBC)
                nodeC.allPoints.push(newC)
                nodeDC.allPoints.push(newDC)
            }
        }
    }

    if (allowCrossover && inputClass !== "Crank") {
        out_startAngle = outputLimits.min
        out_endAngle = outputLimits.max
    }
    const out_angleRange = out_endAngle-out_startAngle
    const out_angleStep = out_angleRange/(traceSteps/traceReduction)
    let outAngle_C = out_startAngle

    for (i = 0; i < traceSteps/traceReduction+1; i++) {
        outAngle_C = out_startAngle + out_angleStep * i
        const newC = {x: placeNodePolar(nodeC, nodeD, linkToCoord(outAngle_C,"angle"), linkToCoord(outputLink.len), false)[0], y: placeNodePolar(nodeC, nodeD, linkToCoord(outAngle_C,"angle"), linkToCoord(outputLink.len), false)[1]}
        const newDC = {x: placeNodePolar(nodeDC, nodeD, linkToCoord(outAngle_C+outputLink.tAng,"angle"), outputLink.tLen, false)[0], y: placeNodePolar(nodeDC, nodeD, linkToCoord(outAngle_C+outputLink.tAng,"angle"), outputLink.tLen, false)[1]}

        nodeC.points.push(newC)
        nodeDC.points.push(newDC)
    }

    in_angleStep = in_angleRange/(traceSteps/traceReduction)

    for (i = 0; i < traceSteps/traceReduction+1; i++) {
        inAngle = in_startAngle + in_angleStep * i
        const newB = {x: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[0], y: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[1]}
        const newAB = {x: placeNodePolar(nodeAB, nodeA, linkToCoord(inAngle, "angle")+inputLink.tAng, inputLink.tLen, false)[0], y: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle")+inputLink.tAng, inputLink.tLen, false)[1]}

        nodeB.points.push(newB)
        nodeAB.points.push(newAB)

        nodeB.allPoints.push(newB)
        nodeAB.allPoints.push(newAB)
    }

    minCoord_x = null
    maxCoord_x = null
    minCoord_y = null
    maxCoord_y = null

    for (i = 0; i < nodesData.length; i++) {
        const thisNode = nodesData[i]
        const thisLink = linksData.find(l => l.id === thisNode.id) 
        minCoord_x = minCoord_x === null ? thisNode.x : Math.min(minCoord_x, thisNode.x)
        maxCoord_x = maxCoord_x === null ? thisNode.x : Math.max(maxCoord_x, thisNode.x)
        minCoord_y = minCoord_y === null ? thisNode.y : Math.min(minCoord_y, thisNode.y)
        maxCoord_y = maxCoord_y === null ? thisNode.y : Math.max(maxCoord_y, thisNode.y)

        if (!(thisNode.id.length === 2 && !thisLink.ternary)) {
            for (p = 0; p < thisNode.allPoints.length; p++) {
                minCoord_x = minCoord_x === null ? thisNode.allPoints[p].x : Math.min(minCoord_x, thisNode.allPoints[p].x)
                maxCoord_x = maxCoord_x === null ? thisNode.allPoints[p].x : Math.max(maxCoord_x, thisNode.allPoints[p].x)
                minCoord_y = minCoord_y === null ? thisNode.allPoints[p].y : Math.min(minCoord_y, thisNode.allPoints[p].y)
                maxCoord_y = maxCoord_y === null ? thisNode.allPoints[p].y : Math.max(maxCoord_y, thisNode.allPoints[p].y)
            }
        }
    }

    // let swapped = false
    // let alt_angleStep = 0
    // if (inputClass === "Rocker" && outputClass === "Crank") {
    //     swapped = true
    //     swapInputOutput()
    //     updateOpenCrossed()
    //     alt_angleStep = 360/traceSteps
    // } else {
    //     alt_angleStep = in_angleStep
    // }
    // for (i = 0; i < traceSteps+1; i++) {
    //     inAngle = 0 + alt_angleStep * i

    //     const newB = {x: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[0], y: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[1]}
    //     const outAngle_temp = getNetAngle(calcOutputAngle(inAngle, !linkageOpen))
    //     const newC = {x: placeNodePolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false)[0], y: placeNodePolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false)[1]}
    //     const couplerAngle = getNodesAngle(newB,newC)
    //     const couplerTAngle = getNetAngle(couplerAngle + couplerLink.tAng)
    //     const couplerTDist = couplerLink.tLen
    //     const newBC = {x: placeNodePolar(nodeBC, newB, couplerTAngle, couplerTDist, false)[0], y: placeNodePolar(nodeBC, newB, couplerTAngle, couplerTDist, false)[1]}

    //     if ((inputClass === "Crank" && outputClass === "Rocker" || inputClass === "Rocker" && outputClass === "Crank")) {
    //         altTraceData.points.push(newBC)
    //     }
    // }
    // if (swapped) {
    //     swapInputOutput()
    //     updateOpenCrossed()
    // }

    let swapped_n = false
    if (nodeMode && (inputClass === "Rocker" || outputClass === "Rocker")) {
        mirrorNodeSynth()
        setLinkNodes()
        updateTNodes()
        updateOpenCrossed()
        updateInputLimits()
        in_startAngle = inputLimits.min
        in_endAngle = inputLimits.max
        in_angleStep = (in_endAngle-in_startAngle)/traceSteps

        swapped_n = true

        for (i = 0; i < traceSteps+1; i++) {
            inAngle = in_startAngle + in_angleStep * i

            const newB = {x: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[0], y: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[1]}
            const outAngle_temp = getNetAngle(calcOutputAngle(inAngle, linkageOpen))
            const newC = {x: placeNodePolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false)[0], y: placeNodePolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false)[1]}
            const couplerAngle = getNodesAngle(newB,newC)
            const couplerTAngle = getNetAngle(couplerAngle + couplerLink.tAng)
            const couplerTDist = couplerLink.tLen
            const newBC = {x: placeNodePolar(nodeBC, newB, couplerTAngle, couplerTDist, false)[0], y: placeNodePolar(nodeBC, newB, couplerTAngle, couplerTDist, false)[1]}

            altTraceData.points.push(newBC)
        }
        for (i = 0; i < traceSteps+1; i++) {
            inAngle = in_endAngle - in_angleStep * i

            const newB = {x: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[0], y: placeNodePolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[1]}
            const outAngle_temp = getNetAngle(calcOutputAngle(inAngle, !linkageOpen))
            const newC = {x: placeNodePolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false)[0], y: placeNodePolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false)[1]}
            const couplerAngle = getNodesAngle(newB,newC)
            const couplerTAngle = getNetAngle(couplerAngle + couplerLink.tAng)
            const couplerTDist = couplerLink.tLen
            const newBC = {x: placeNodePolar(nodeBC, newB, couplerTAngle, couplerTDist, false)[0], y: placeNodePolar(nodeBC, newB, couplerTAngle, couplerTDist, false)[1]}

            if (inputClass === "Rocker") {
                altTraceData.points.push(newBC)
            }
        }
        if (swapped_n) {
            mirrorNodeSynth()
            setLinkNodes()
            updateTNodes()
            updateOpenCrossed()
        }
    }
}

function playAnimation() {
    const linkageConfig = linkageOpen
    const startAngle = inputAngle
    const maxInput = inputLimits.max
    const minInput = inputLimits.min

    const angleRange = maxInput - minInput
    let stepSize = angleRange/(animateSpeed*10)

    let loop = false

    if (inputClass === "Crank") {
        loop = true
        stepSize = stepSize / 2
    }

    let newAngle = startAngle + stepSize * animateDir
    newAngle = inputClass === "0-Rocker" && newAngle > 180 ? newAngle - 360 : newAngle

    if (!loop) {
        if (newAngle > maxInput - limitThreshold) {
            newAngle = maxInput - limitThreshold
            animateDir = animateDir * -1
            if (allowCrossover) linkageOpen = !linkageConfig
        }
        if (newAngle < minInput + limitThreshold) {
            newAngle = minInput + limitThreshold
            animateDir = animateDir * -1
            if (allowCrossover) linkageOpen = !linkageConfig
        }
    }

    reverseIcon.text(animateDir > 0 ? "⟲" : "⟳")

    newAngle = linkToCoord(newAngle, "angle")
    doActuate(newAngle)

}

function defaultLinkage() {
    saveUndoNodes()
    getLinkByType("fixed").visible = true
    localStorage.setItem("fixedStatus", "")
    for (i = 0; i < nodesData.length; i++) {
        nodesData[i].x = defaultNodes[i].x
        nodesData[i].y = defaultNodes[i].y
        nodesData[i].trace = defaultNodes[i].trace

        localStorage.setItem(`${nodesData[i].id}_trace`, "")
    }
    for (i = 0; i < linksData.length; i++) {
        linksData[i].ternary = defaultLinks[i].ternary

        localStorage.setItem(`${linksData[i].id}_t`, "")
    }
    saveNodes()
    updateTNodes()
    setLinkNodes()
    updateOpenCrossed()
    updateTrace()
    updateLinkGeometry();
}
