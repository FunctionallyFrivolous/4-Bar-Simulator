// Functions that assess or effect properties of the linkage mechanism

// Function to set the new input link angle to actuate the mechanism
    // This will be executed as a result of draging the input handle and any other actuation method implemented
function doActuate(deg) {
    let inAngle = deg

    let checkAngle = getNetAngle(coordToLink(inAngle, "angle"))

    if (inputLimits.min < 0 && checkAngle > 180) {
        checkAngle = checkAngle - 360
    }
    if (inputClass !== "Crank") {
        if (checkAngle < inputLimits.min) {
            inAngle = getNetAngle(linkToCoord(inputLimits.min, "angle")) + limitThreshold;
            recentLimit = "min"
            if (!recentCrossover && checkAngle < inputLimits.min + crossoverDeadband && allowCrossover) {
                toggleOpenCrossed()
                recentCrossover = true
            }
        } else if (checkAngle > inputLimits.max) {
            inAngle = getNetAngle(linkToCoord(inputLimits.max, "angle")) - limitThreshold;
            recentLimit = "max"
            if (!recentCrossover && checkAngle > inputLimits.max - crossoverDeadband && allowCrossover) {
                toggleOpenCrossed()
                recentCrossover = true
            }
        }
        if (checkAngle > inputLimits.min + crossoverDeadband && checkAngle < inputLimits.max - crossoverDeadband) {
                recentCrossover = false
                recentLimit = "none"
        } 
    }

    // document.getElementById("debugOutputs").innerHTML = `
    //     ${checkAngle.toFixed(1)}, 
    //     ${(inputLimits.min + crossoverDeadband).toFixed(1)},
    //     ${recentCrossover},
    //     ${recentLimit},
    //     `
    
    inputAngle = getNetAngle(coordToLink(inAngle, "angle"))

    const outAngle = calcOutputAngle(inputAngle)
    updateOutputAngle();

    setLinkAngle(getLinkByType("input").id, inAngle)
    setLinkAngle(getLinkByType("output").id, outAngle)
    tNodeFollow()
    
    updateLinkGeometry();
}

// Function to calc/return the angle of the output link based on all link lengths and input angle
function calcOutputAngle(inDeg, open=linkageOpen) {
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
function updateOutputAngle() {
    outputAngle = calcOutputAngle(inputAngle)
}

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

    if (inputClass === "Rocker" & getNodesAngle(getNode("A"), getNode("B")) > getNodesAngle(getNode("D"),getNode("A")) ) {
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
        // B_min = 360-B_max;
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
    const crossAngle = getNodesAngle(getNode(getLinkByType("output").id[0]), getNode(getLinkByType("input").id[1]))
    // const 

    if (!linkageOpen & outputClass === "Rocker" & inputClass === "Rocker" & crossAngle < getNodesAngle(getNode("D"),getNode("A")) ) {
        B_min = 360-B_min;
        B_max = 360-B_max;
    }
    if (linkageOpen & outputClass === "Rocker" & inputClass === "Rocker" & crossAngle > getNodesAngle(getNode("D"),getNode("A")) ) {
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

function updateLinkageConfig() {
    updateOpenCrossed()
    updateInputLimits()
    updateOutputLimits()
}

// Current issue: 
    // The issue arises when BDC straddles the horizontal
        // DB above and DC below - OR - DB below and C above
        // But also only when DA is not horiz
    // Old version does not have this issue, but also has the luxury of not accounting for angle of DA

function updateOpenCrossed() {
    const AB_th = coordToLink(getNodesAngle(getNode("A"), getNode("B")), "angle")
    // const DA_th = getNodesAngle(getNode("D"), getNode("A"), true)
    let DB_th = coordToLink(getNodesAngle(getNode("D"), getNode("B"), true), "angle")
    let DC_th = coordToLink(getNodesAngle(getNode("D"), getNode("C"), true), "angle")

    const DB_raw = DB_th
    const DC_raw = DC_th

    if (outputClass !== "0-Rocker" && outputClass !== "Crank") {
        if (AB_th < 0) DB_th = DB_th + 360
        if (DC_th < 0) DC_th = DC_th + 360
        if (DC_th < getNetAngle(DB_th,false)) linkageOpen = true
        else linkageOpen = false
    } 
    else if (outputClass === "Crank" || outputClass === "0-Rocker") {
        if (AB_th >= 0 && DC_th >= 0) {
            if (DC_th < getNetAngle(DB_th,false)) linkageOpen = true
            else linkageOpen = false
        } else if (AB_th >= 0 && DC_th < 0 && AB_th < DB_th){
            DB_th = coordToLink(getNodesAngle(getNode("B"),getNode("D"), true), "angle")
            if (DC_th > DB_th) linkageOpen = true
            else linkageOpen = false
        } else if (AB_th < 0 && DC_th < 0 && AB_th < DB_th){
            if (DC_th < getNetAngle(DB_th,false)) linkageOpen = false
            else linkageOpen = true
        } 
        else if (AB_th < 0 && DC_th < 0 && AB_th >= DB_th){
            if (getNetAngle(DC_th,false) > getNetAngle(DB_th,false)) linkageOpen = false
            else linkageOpen = true
        }
        else if (AB_th < 0 && DC_th >= 0 && AB_th < DB_th){
            DB_th = coordToLink(getNodesAngle(getNode("B"),getNode("D"), true), "angle")
            if (DC_th < DB_th) linkageOpen = false
            else linkageOpen = true
        }
        else if (AB_th < 0 && DC_th >= 0 && AB_th >= DB_th){
            DB_th = coordToLink(getNodesAngle(getNode("B"),getNode("D"), true), "angle")
            if (DC_th < getNetAngle(DB_th,false)) linkageOpen = false
            else linkageOpen = true
        }         
    }

    // document.getElementById("debugOutputs").innerHTML = `
    //     ${AB_th.toFixed(1)}, 
    //     ${DC_th.toFixed(1)}, 
    //     ${DB_th.toFixed(1)}
    //     `

    toggleConfigIcon.text(linkageOpen ? "Open ⇋ Crossed" : "Crossed ⇋ Open")
} 
function toggleOpenCrossed() {
    const DB_th = getNodesAngle(getNode("D"), getNode("B"))
    const DC_th = getNodesAngle(getNode("D"), getNode("C"))
    const newDC_th = 2*DB_th - DC_th
    rotateNode(getNode("C"),newDC_th,getNode("D"))
    updateOpenCrossed()
    tNodeFollow()
    updateTrace()
    updateLinkGeometry()
}

function updateLinkGeometry() {
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
        .attr("opacity", d => d.type === "fixed" ? 0 : darkMode ? 0.7 : 0.6)
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

    toggleCrossoverIcon
        .attr("opacity", inputClass === "Crank" ? 0.25 : 1)
        // .attr("font-weight", allowCrossover ? "bold" : "none")
        .attr("text-decoration", allowCrossover ? "none" : "line-through")
    toggleCrossoverButton
        .attr("stroke-opacity", inputClass === "Crank" ? 0.25 : 0.75)
        .attr("fill-opacity", inputClass === "Crank" ? 0.25 : 0.75)

    updateLinkageConfig()

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
    // .attr("x1", getNode("D").x)
    // .attr("y1", getNode("D").y)
    // .attr("x2", getNode("B").x)
    // .attr("y2", getNode("B").y)

    // document.getElementById("debugOutputs").innerHTML = A_angle.toFixed(1)
    // `${linkageOpen ? "Open" : "Crossed"}`
}

function updateToolTips() {
    toggleConfigButton
        .append("title")
        .text("Toggle Open / Crossed")
    linkLines
        .append("title")
        .text(d => `${d.type} link (L = ${d.len.toFixed(1)})`)
    nodeDrag
        .append("title")
        .text(d => `(${d.x.toFixed(1)}, ${d.y.toFixed(1)})`)
}

function getNetAngle(deg, neg=false) {
    let newDeg = deg
    if (newDeg > 360) newDeg = newDeg - 360
    if (!neg & newDeg < 0) newDeg = newDeg + 360

    return newDeg
}

// function cycleCongugate() {
//     const distAB = getDistBtwNodes(getNode("A"),getNode("B"))
//     const distBC = getDistBtwNodes(getNode("B"),getNode("C"))
//     const distCD = getDistBtwNodes(getNode("C"),getNode("D"))
//     const distDA = getDistBtwNodes(getNode("D"),getNode("A"))
//     const distBE = getDistBtwNodes(getNode("B"),getNode("BC"))
//     const distCE = getDistBtwNodes(getNode("C"),getNode("BC"))

//     const angCBE = getAngleBtwNodes(getNode("BC"), getNode("C"), getNode("B"))
    

//     const newCE = distAB
//     const newCD = distBE

//     const newBC = distBE/distBC * newCE // New coupler link length
//     const newBE = distCE/distBC * newCE // New coupler tDist

//     const newDA = distDA/distBC * distBE // New fixed link length
//     // const rotFixed = 

//     // const newA_Coord = {x: rotateNode(), y: }
//     const newD_Coord = {x: getNode("A").x, y: getNode("A").y}

// }


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
    }

    let inAngle = in_startAngle
    let outAngle = calcOutputAngle(inAngle)

    let out_startAngle = outputLimits.max
    let out_endAngle = outputLimits.min

    let dbgtxt = ``

    for (i = 0; i < traceSteps+1; i++) {

        inAngle = in_startAngle + in_angleStep * i
        outAngle = calcOutputAngle(inAngle, true)

        if (linkageOpen) {
            const out_temp = outputClass === "0-Rocker" && (outAngle > 180) ? outAngle-360 : outAngle
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
                nodeBC.allPoints.push(newBC)
                nodeC.allPoints.push(newC)
                nodeDC.allPoints.push(newDC)
            }
        }
        
    }
    // document.getElementById("debugOutputs").innerHTML = dbgtxt

    for (i = 0; i < traceSteps+1; i++) {

        inAngle = in_endAngle - in_angleStep * i
        outAngle = calcOutputAngle(inAngle, false)

        if (!linkageOpen) {
            const out_temp = outputClass === "0-Rocker" && (outAngle > 180) ? outAngle-360 : outAngle
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
        const newC = {x: placeNodePolar(nodeC, nodeD, outAngle_C, linkToCoord(outputLink.len), false)[0], y: placeNodePolar(nodeC, nodeD, outAngle_C, linkToCoord(outputLink.len), false)[1]}
        const newDC = {x: placeNodePolar(nodeDC, nodeD, outAngle_C+outputLink.tAng, outputLink.tLen, false)[0], y: placeNodePolar(nodeDC, nodeD, outAngle_C+outputLink.tAng, outputLink.tLen, false)[1]}

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

    // document.getElementById("debugOutputs").innerHTML = dbgtxt

}

function playAnimation() {
    const startAngle = getLinkAngle(getLinkByType("input").id)
    const angleRange = inputLimits.max - inputLimits.min
    const stepSize = angleRange/(animateSpeed*10)

    const loop = inputClass === "Crank" ? true : false

    let newAngle = startAngle + stepSize * animateDir

    if (!loop) {
        if (getNetAngle(newAngle, false) > inputLimits.max - limitThreshold) {
            newAngle = inputLimits.max - limitThreshold
            animateDir = animateDir * -1
            if (allowCrossover) linkageOpen = !linkageOpen
        }
        if (getNetAngle(newAngle, false) < inputLimits.min + limitThreshold) {
            newAngle = inputLimits.min + limitThreshold
            animateDir = animateDir * -1
            if (allowCrossover) linkageOpen = !linkageOpen
        }
    }

    doActuate(newAngle)

}