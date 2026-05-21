
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
    tPointFollow()
    
    updateLinkGeometry();
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
    
    const crossAngle = coordToLink(getJointsAngle(getPoint("D"), getPoint("B")),"angle")

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
    const AB_th = coordToLink(getJointsAngle(getPoint("A"), getPoint("B")), "angle")

    let DB_th = coordToLink(getJointsAngle(getPoint("D"), getPoint("B"), true), "angle")
    const BD_th = coordToLink(getJointsAngle(getPoint("B"), getPoint("D"), true), "angle")

    let DC_th = coordToLink(getJointsAngle(getPoint("D"), getPoint("C"), true), "angle")
    const BC_th = coordToLink(getJointsAngle(getPoint("B"), getPoint("C"), true), "angle")
    
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
    const DB_th = getJointsAngle(getPoint("D"), getPoint("B"))
    const DC_th = getJointsAngle(getPoint("D"), getPoint("C"))
    const newDC_th = 2*DB_th - DC_th
    rotatePoint(getPoint("C"),newDC_th,getPoint("D"))
    updateOpenCrossed()
    tPointFollow()
    if (retrace) updateTrace()
    updateLinkGeometry()
}

function updateLinkGeometry() {
    // pathCrunodeSynth(false)
    jointDrag
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

    setLinkPoints()

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
        .style("display", !jointsData.find(n => n.id === "BC").trace || !linksData.find(l => l.id === "BC").ternary ? "none" : "block")

    synthDots
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("fill", d3.interpolateRgb("darkgreen","white")(whtnColor*2))
        // .style("display", nodeMode ? d => d.display : "none")
        .style("display", nodeMode ? "block" : "none")
        .attr("opacity", d => d.display === "block" ? 1 : 0.25)
    synthDrag
        // .attr("cx", d => d.x)
        // .attr("cy", d => d.y)
        .attr("d", d => drawConcentricCircles(d.x, d.y, d.rings))
        .attr("fill", fgColor)
        .attr("stroke", fgColor)
        // .style("display", nodeMode ? d => d.display : "none")
        .style("display", nodeMode ? "block" : "none")
        .attr("stroke-opacity", d => d.display === "block" ? 0.25 : 0.05)
        .attr("stroke-width", d => d.display === "block" ? 2 : 1)
        // .attr("stroke-dasharray", d => d.display === "block" ? "none" : "2,3")
        // .style("pointer-events", d => d.display === "block" ? "auto" : "none")

    getFocusPoint(true)
    // focusDot
    //     .attr("cx", focusPoint.x)
    //     .attr("cy", focusPoint.y)
    // // getE2(false)//synthPointCount < 2)
    // const kF = getCircle3Points(getPoint("A"), getPoint("D"), synthPoints[0])
    // const kF_cent = {x: kF[0], y: kF[1]}
    // const kF_rad = kF[2]/2

    // const angle_kFE2 = getJointsAngle(kF_cent, synthPoints[1])

    // const new_E2 = placePointPolar(synthPoints[1],kF_cent,angle_kFE2,kF_rad,false)

    // synthPoints[1].x = new_E2.x
    // synthPoints[1].y = new_E2.y
    getE2()
    // getE3(false)//synthPointCount < 3)
        
    // intersectionDot
    //     .attr("cx", getLinesIntersection(getPoint("B"),getPoint("A"),getPoint("C"),getPoint("D"))[0])
    //     .attr("cy", getLinesIntersection(getPoint("B"),getPoint("A"),getPoint("C"),getPoint("D"))[1])
    //     .attr("fill", fgColor)
    // lineAE
    //     .attr("x1", getPoint("A").x)
    //     .attr("y1", getPoint("A").y)
    //     .attr("x2", synthPoints[0].x)
    //     .attr("y2", synthPoints[0].y)
    //     .attr("stroke", fgColor)
    // lineDE
    //     .attr("x1", getPoint("D").x)
    //     .attr("y1", getPoint("D").y)
    //     .attr("x2", synthPoints[0].x)
    //     .attr("y2", synthPoints[0].y)
    //     .attr("stroke", fgColor)
    // lineAF
    //     .attr("x1", getPoint("A").x)
    //     .attr("y1", getPoint("A").y)
    //     .attr("x2", focusPoint.x)
    //     .attr("y2", focusPoint.y)
    //     .attr("stroke", fgColor)
    // lineDF
    //     .attr("x1", getPoint("D").x)
    //     .attr("y1", getPoint("D").y)
    //     .attr("x2", focusPoint.x)
    //     .attr("y2", focusPoint.y)
    //     .attr("stroke", fgColor)
    // lineFE2
    //     .attr("x1", focusPoint.x)
    //     .attr("y1", focusPoint.y)
    //     .attr("x2", synthPoints[1].x)
    //     .attr("y2", synthPoints[1].y)
    //     .attr("stroke", fgColor)
    // lineDE2
    //     .attr("x1", getPoint("D").x)
    //     .attr("y1", getPoint("D").y)
    //     .attr("x2", synthPoints[1].x)
    //     .attr("y2", synthPoints[1].y)
    //     .attr("stroke", fgColor)
    // lineAE2
    //     .attr("x1", getPoint("A").x)
    //     .attr("y1", getPoint("A").y)
    //     .attr("x2", synthPoints[1].x)
    //     .attr("y2", synthPoints[1].y)
    //     .attr("stroke", fgColor)

    // update_kFCircle()
    kFCircle
        .attr("cx", kFCirc[0])
        .attr("cy", kFCirc[1])
        .attr("r", kFCirc[2]/2)
        .attr("stroke", fgColor)
    // ADCircle
    //     .attr("cx", getCircle2Points(getPoint("A"), getPoint("D"))[0])
    //     .attr("cy", getCircle2Points(getPoint("A"), getPoint("D"))[1])
    //     .attr("r", getCircle2Points(getPoint("A"), getPoint("D"))[2]/2)
    //     .attr("stroke", fgColor)
    // inputCircle
    //     .attr("cx", getPoint("A").x)
    //     .attr("cy", getPoint("A").y)
    //     .attr("r", 6*20)
    //     .attr("stroke", fgColor)
    // outputCircle
    //     .attr("cx", getPoint("D").x)
    //     .attr("cy", getPoint("D").y)
    //     .attr("r", 4.5*20)
    //     .attr("stroke", fgColor)

    // const angAEB = getAngleBtwPoints(getPoint("B"), getPoint("A"), getPoint("BC"))
    // const angDEC = getAngleBtwPoints(getPoint("C"), getPoint("D"), getPoint("BC"))

    // document.getElementById("debugOutputs").innerHTML = `
    //         ${angAEB.toFixed(1)} \n<br>
    //         ${angDEC.toFixed(1)} \n<br>
    // `

    // updateLinkageConfig()
    updateOpenCrossed()
    updateInputLimits()
    updateOutputLimits()

    openCrossedButton
        .attr("fill-opacity", nodeMode ? 0.25 : 0.75)
        .attr("stroke-opacity", nodeMode ? 0.25 : 0.75)
        .style("pointer-events", nodeMode ? "none" : "auto")
    openCrossedIcon.attr("opacity", nodeMode ? 0.25 : 1)

    synthCycleButton
        .style("display", nodeMode ? "block" : "none")
        // .attr("x", buttonMargin*5 + buttonHeight*4 + (nodeMode ? buttonHeight+buttonMargin : 0))
    synthCycleIcon
        .style("display", nodeMode ? "block" : "none")
        // .attr("x", buttonHeight/2 + buttonMargin*5 + buttonHeight*4 + (nodeMode ? buttonHeight+buttonMargin : 0))


    crossoverIcon
        .attr("opacity", inputClass === "Crank" ? 0.25 : 1)
        .attr("d", 
            drawCrossoverIcon(buttonMargin*2 + buttonHeight+ buttonHeight/2,
                windowHeight-buttonMargin-buttonHeight*1.75 + buttonHeight*0.75/2)
            )
        // .attr("text-decoration", allowCrossover ? "none" : "line-through")
        // .text(allowCrossover ? "↔" : "⇹")
    // crossoverButton
    //     .attr("stroke-opacity", inputClass === "Crank" ? 0.25 : 0.75)
    //     .attr("fill-opacity", inputClass === "Crank" ? 0.25 : 0.75)

    cognateIcon
        .attr("opacity", getLinkByType("coupler").ternary ? 1 : 0.25)
    cognateButton
        // .attr("opacity", getLinkByType("coupler").ternary ? 0.75 : 0.25)
        .attr("stroke-opacity", getLinkByType("coupler").ternary ? 0.75 : 0.25)
        .attr("fill-opacity", getLinkByType("coupler").ternary ? 0.75 : 0.25)
        .style("pointer-events", getLinkByType("coupler").ternary ? "auto" : "none")

    nodeModeIcon
        .attr("opacity", nodeMode ? 1 : 0.5)

    nodeModeMenu.style("display", nodeMode ? "block" : "none")
    nodeModeCrunodeLabel.style("display", nodeMode ? "block" : "none")
    nodeModeCuspLabel.style("display", nodeMode ? "block" : "none")


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
    //     .attr("x1", getPoint("D").x)
    //     .attr("y1", getPoint("D").y)
    //     .attr("x2", getPoint("B").x)
    //     .attr("y2", getPoint("B").y)

    // const angE1B = getJointsAngle(getPoint("E1"),getPoint("B"))
    // const test_BE = (AE1*AE1 - AE2*AE2)/(2*AE1*Math.cos(degToRad(getAngleBtwPoints(getPoint("A"),getPoint("B"),getPoint("E1")))) - 2*AE2)
    // const ztest = (DE1*DE1 - DE2*DE2)/((((AE1*AE1 - AE2*AE2)/(2*BE*AE1))+(AE2/AE1)-(DE2/DE1))*2*DE1)
    // const ztest2 = (AE1*AE1 - AE2*AE2)/((((DE1*DE1 - DE2*DE2)/(2*CE*DE1))+(DE2/DE1)-(AE2/AE1))*2*AE1)
    // const ztest = (test_BE*test_BE + AE1*AE1 - AB*AB)/(2*test_BE*AE1)
    // const cosTest = Math.cos(degToRad(getAngleBtwPoints(getPoint("A"),getPoint("B"),getPoint("E1"))))
    const test_CE = (DE1*DE1 - DE2*DE2)/((((AE1*AE1 - AE2*AE2)/(2*BE*AE1))-(AE2/AE1)-(DE2/DE1))*2*DE1)
    const test_BE = -(AE2*AE2 - AE1*AE1)/(2*AE1*Math.cos(degToRad(getAngleBtwPoints(getPoint("A"), getPoint("B"), getPoint("E1")))) + 2*AE2)


    // document.getElementById("debugOutputs").innerHTML = `
    //     testCE: ${test_CE.toFixed(1)} \n<br>
    //     testBE: ${test_BE.toFixed(1)} \n<br>
    //     AE1: ${AE1.toFixed(1)} \n<br>
    //     DE1: ${DE1.toFixed(1)} \n<br>
    //     AE2: ${AE2.toFixed(1)} \n<br>
    //     DE2: ${DE2.toFixed(1)} \n<br>
    //     AB: ${AB.toFixed(1)} \n<br>
    //     BE: ${BE.toFixed(1)} \n<br>
    //     DC: ${DC.toFixed(1)} \n<br>
    //     CE: ${CE.toFixed(1)} \n<br>
    //     AE1B: ${getAngleBtwPoints(getPoint("A"),getPoint("B"),getPoint("E1")).toFixed(1)} \n<br>
    //     DE1C: ${getAngleBtwPoints(getPoint("D"),getPoint("C"),getPoint("E1")).toFixed(1)} \n<br>
    //     AE2B: ${getAngleBtwPoints(getPoint("A"),getPoint("B"),getPoint("E2")).toFixed(1)} \n<br>
    //     DE2C: ${getAngleBtwPoints(getPoint("D"),getPoint("C"),getPoint("E2")).toFixed(1)} \n<br>
    // `
}

function updateTrace(alt=true, oc=linkageOpen) {
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

    const nodeA = getPoint(inputLink.id[0])
    const nodeB = getPoint(inputLink.id[1])
    const nodeC = getPoint(outputLink.id[1])
    const nodeD = getPoint(outputLink.id[0])
    const nodeAB = getPoint(inputLink.id)
    const nodeBC = getPoint(couplerLink.id)
    const nodeDC = getPoint(outputLink.id)
    const nodeAD = getPoint(fixedLink.id)
    
    for (i = 0; i < jointsData.length; i++) {
        jointsData[i].points = []
        jointsData[i].allPoints = []
    }
    altTraceData.points = []


    let inAngle = in_startAngle
    let outAngle = calcOutputAngle(inAngle)

    let out_startAngle = outputLimits.max
    let out_endAngle = outputLimits.min

    // let dbgtxt = ``

    for (i = 0; i < traceSteps+1; i++) {

        inAngle = in_startAngle + in_angleStep * i
        outAngle = calcOutputAngle(inAngle, true)

        if (oc) {
            const out_temp = outputClass === "0-Rocker" && (coordToLink(outAngle,"angle") > 180) ? coordToLink(outAngle,"angle")-360 : coordToLink(outAngle,"angle")
            out_startAngle = Math.min(out_startAngle, out_temp)
            out_endAngle = Math.max(out_endAngle, out_temp)
        }

        const newB = {x: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).x, y: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).y}
        const outAngle_temp = getNetAngle(calcOutputAngle(inAngle, true))
        const newC = {x: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).x, y: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).y}
        const couplerAngle = getJointsAngle(newB,newC)
        const couplerTAngle = couplerAngle + couplerLink.tAng
        const couplerTDist = couplerLink.tLen
        const newBC = {x: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).x, y: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).y}
        // const newAB = {x: placePointPolar(nodeAB, nodeA, linkToCoord(inAngle, "angle")+inputLink.tAng, inputLink.tLen, false).x, y: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle")+inputLink.tAng, inputLink.tLen, false).y}
        const newDC = {x: placePointPolar(nodeDC, nodeD, outAngle+outputLink.tAng, outputLink.tLen, false).x, y: placePointPolar(nodeDC, nodeD, outAngle+outputLink.tAng, outputLink.tLen, false).y}

        let deltaBC = 0;
        if (nodeBC.allPoints.length > 0) {
            deltaBC = Math.sqrt((newBC.x - nodeBC.allPoints[nodeBC.allPoints.length-1].x)*(newBC.x - nodeBC.allPoints[nodeBC.allPoints.length-1].x) + (nodeBC.allPoints[nodeBC.allPoints.length-1].y - newBC.y)*(nodeBC.allPoints[nodeBC.allPoints.length-1].y - newBC.y))
        }
        if (i === 0 || deltaBC > traceDelta) {
            if (oc || (allowCrossover && inputClass !== "Crank")) {
                nodeBC.points.push(newBC)
            }

            if (oc || inputClass !== "Crank") {
                nodeC.allPoints.push(newC)
                nodeDC.allPoints.push(newDC)
                nodeBC.allPoints.push(newBC)
            }
        }
        if ((nodeMode || showGhostTrace) && !linkageOpen && inputClass === "Crank") altTraceData.points.push(newBC)
    }
    // document.getElementById("debugOutputs").innerHTML = dbgtxt

    for (i = 0; i < traceSteps+1; i++) {

        inAngle = in_endAngle - in_angleStep * i
        outAngle = calcOutputAngle(inAngle, false)

        if (!oc) {
            const out_temp = outputClass === "0-Rocker" && (coordToLink(outAngle,"angle") > 180) ? coordToLink(outAngle,"angle")-360 : coordToLink(outAngle,"angle")
            out_startAngle = Math.min(out_startAngle, out_temp)
            out_endAngle = Math.max(out_endAngle, out_temp)
        }

        const newB = {x: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).x, y: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).y}
        const outAngle_temp = getNetAngle(calcOutputAngle(inAngle, false))
        const newC = {x: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).x, y: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).y}
        const couplerAngle = getJointsAngle(newB,newC)
        const couplerTAngle = getNetAngle(couplerAngle + couplerLink.tAng)
        const couplerTDist = couplerLink.tLen
        const newBC = {x: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).x, y: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).y}
        // const newAB = {x: placePointPolar(nodeAB, nodeA, linkToCoord(inAngle, "angle")+inputLink.tAng, inputLink.tLen, false).x, y: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle")+inputLink.tAng, inputLink.tLen, false).y}
        const newDC = {x: placePointPolar(nodeDC, nodeD, outAngle+outputLink.tAng, outputLink.tLen, false).x, y: placePointPolar(nodeDC, nodeD, outAngle+outputLink.tAng, outputLink.tLen, false).y}

        let deltaBC = 0;
        if (nodeBC.allPoints.length > 0) {
            deltaBC = Math.sqrt((newBC.x - nodeBC.allPoints[nodeBC.allPoints.length-1].x)*(newBC.x - nodeBC.allPoints[nodeBC.allPoints.length-1].x) + (nodeBC.allPoints[nodeBC.allPoints.length-1].y - newBC.y)*(nodeBC.allPoints[nodeBC.allPoints.length-1].y - newBC.y))
        }
        
        if (i === 0 || deltaBC > traceDelta) {
            if (!oc || (allowCrossover && inputClass !== "Crank")) {
                nodeBC.points.push(newBC)
            }
            
            if (!oc || inputClass !== "Crank") {
                nodeBC.allPoints.push(newBC)
                nodeC.allPoints.push(newC)
                nodeDC.allPoints.push(newDC)
            }
        }
        if ((nodeMode || showGhostTrace) && linkageOpen && inputClass === "Crank") {
            altTraceData.points.push(newBC)
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
        const newC = {x: placePointPolar(nodeC, nodeD, linkToCoord(outAngle_C,"angle"), linkToCoord(outputLink.len), false).x, y: placePointPolar(nodeC, nodeD, linkToCoord(outAngle_C,"angle"), linkToCoord(outputLink.len), false).y}
        const newDC = {x: placePointPolar(nodeDC, nodeD, linkToCoord(outAngle_C+outputLink.tAng,"angle"), outputLink.tLen, false).x, y: placePointPolar(nodeDC, nodeD, linkToCoord(outAngle_C+outputLink.tAng,"angle"), outputLink.tLen, false).y}

        nodeC.points.push(newC)
        nodeDC.points.push(newDC)
    }

    in_angleStep = in_angleRange/(traceSteps/traceReduction)

    for (i = 0; i < traceSteps/traceReduction+1; i++) {
        inAngle = in_startAngle + in_angleStep * i
        const newB = {x: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).x, y: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).y}
        const newAB = {x: placePointPolar(nodeAB, nodeA, linkToCoord(inAngle, "angle")+inputLink.tAng, inputLink.tLen, false).x, y: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle")+inputLink.tAng, inputLink.tLen, false).y}

        nodeB.points.push(newB)
        nodeAB.points.push(newAB)

        nodeB.allPoints.push(newB)
        nodeAB.allPoints.push(newAB)
    }

    minCoord_x = null
    maxCoord_x = null
    minCoord_y = null
    maxCoord_y = null

    for (i = 0; i < jointsData.length; i++) {
        const thisNode = jointsData[i]
        let ternaryShown = false
        if (thisNode.id.length === 2) {
            const thisLink = linksData.find(l => l.id === thisNode.id)
            ternaryShown = thisLink.ternary
        }

        // minCoord_x = minCoord_x === null ? thisNode.x : Math.min(minCoord_x, thisNode.x)
        // maxCoord_x = maxCoord_x === null ? thisNode.x : Math.max(maxCoord_x, thisNode.x)
        // minCoord_y = minCoord_y === null ? thisNode.y : Math.min(minCoord_y, thisNode.y)
        // maxCoord_y = maxCoord_y === null ? thisNode.y : Math.max(maxCoord_y, thisNode.y)

        if (!(thisNode.id.length === 2 && !ternaryShown)) {
            for (p = 0; p < thisNode.allPoints.length; p++) {
                minCoord_x = minCoord_x === null ? thisNode.allPoints[p].x : Math.min(minCoord_x, thisNode.allPoints[p].x)
                maxCoord_x = maxCoord_x === null ? thisNode.allPoints[p].x : Math.max(maxCoord_x, thisNode.allPoints[p].x)
                minCoord_y = minCoord_y === null ? thisNode.allPoints[p].y : Math.min(minCoord_y, thisNode.allPoints[p].y)
                maxCoord_y = maxCoord_y === null ? thisNode.allPoints[p].y : Math.max(maxCoord_y, thisNode.allPoints[p].y)
            }
        }
    }

    // Show unreachable coupler curve regions - Rocker-Crank
    if ((nodeMode || showGhostTrace) && inputClass === "Rocker" && outputClass === "Crank"){//(inputClass === "Crank" || outputClass === "Crank") && outputClass !== "Rocker") {
        let swapped = false
        let alt_angleStep = 0
        if (inputClass === "Rocker" && outputClass === "Crank") {
            swapped = true
            swapInputOutput()
            updateOpenCrossed()
            alt_angleStep = 360/traceSteps
            in_startAngle = 0
        } else {
            alt_angleStep = in_angleStep
            in_startAngle = inputLimits.min
        }
        for (i = 0; i < traceSteps+1; i++) {
            inAngle = in_startAngle + alt_angleStep * i

            const newB = {x: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).x, y: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).y}
            const outAngle_temp = getNetAngle(calcOutputAngle(inAngle, !linkageOpen))
            const newC = {x: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).x, y: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).y}
            const couplerAngle = getJointsAngle(newB,newC)
            const couplerTAngle = getNetAngle(couplerAngle + couplerLink.tAng)
            const couplerTDist = couplerLink.tLen
            const newBC = {x: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).x, y: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).y}

            altTraceData.points.push(newBC)
        }
        if (swapped) {
            swapInputOutput()
            updateOpenCrossed()
        }
    }

    // Show unreachable coupler curve regions - Double Rocker
    if ((nodeMode || showGhostTrace) && (inputClass === "Rocker" && outputClass === "Rocker")) {
        let swapped = false
        invertLinkage()
        in_startAngle = inputLimits.min
        in_endAngle = inputLimits.max
        in_angleStep = (in_endAngle-in_startAngle)/traceSteps

        swapped = true

        for (i = 0; i < traceSteps+1; i++) {
            inAngle = in_startAngle + in_angleStep * i

            const newB = {x: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).x, y: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).y}
            const outAngle_temp = getNetAngle(calcOutputAngle(inAngle, linkageOpen))
            const newC = {x: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).x, y: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).y}
            const couplerAngle = getJointsAngle(newB,newC)
            const couplerTAngle = getNetAngle(couplerAngle + couplerLink.tAng)
            const couplerTDist = couplerLink.tLen
            const newBC = {x: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).x, y: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).y}

            altTraceData.points.push(newBC)
        }
        for (i = 0; i < traceSteps+1; i++) {
            inAngle = in_endAngle - in_angleStep * i

            const newB = {x: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).x, y: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).y}
            const outAngle_temp = getNetAngle(calcOutputAngle(inAngle, !linkageOpen))
            const newC = {x: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).x, y: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).y}
            const couplerAngle = getJointsAngle(newB,newC)
            const couplerTAngle = getNetAngle(couplerAngle + couplerLink.tAng)
            const couplerTDist = couplerLink.tLen
            const newBC = {x: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).x, y: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).y}

            altTraceData.points.push(newBC)
        }

        if (swapped) {
            invertLinkage()
        }
    }

    // // Show unreachable coupler curve regions - Intersecting loops
    // let swapped_n = false
    // if (!nodeMode || (inputClass !== "Rocker" && outputClass !== "Rocker")) {
    //     altTraceData.points = []
    // }
    // if (alt && nodeMode && ((inputClass === "Rocker" && outputClass === "Crank") || (outputClass === "Rocker" && inputClass === "Crank"))) {
    //     altTraceData.points = []
    //     mirrorNodeSynth()
    //     setLinkPoints()
    //     updateTPoints()
    //     updateOpenCrossed()
    //     updateInputLimits()
    //     in_startAngle = inputLimits.min
    //     in_endAngle = inputLimits.max
    //     in_angleStep = (in_endAngle-in_startAngle)/traceSteps

    //     swapped_n = true

    //     for (i = 0; i < traceSteps+1; i++) {
    //         inAngle = in_startAngle + in_angleStep * i

    //         const newB = {x: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).x, y: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false)[1]}
    //         const outAngle_temp = getNetAngle(calcOutputAngle(inAngle, linkageOpen))
    //         const newC = {x: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).x, y: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false)[1]}
    //         const couplerAngle = getJointsAngle(newB,newC)
    //         const couplerTAngle = getNetAngle(couplerAngle + couplerLink.tAng)
    //         const couplerTDist = couplerLink.tLen
    //         const newBC = {x: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).x, y: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false)[1]}

    //         // altTraceData.points.push(newBC) //
    //     }
    //     for (i = 0; i < traceSteps+1; i++) {
    //         inAngle = in_endAngle - in_angleStep * i

    //         const newB = {x: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).x, y: placePointPolar(nodeB, nodeA, linkToCoord(inAngle, "angle"), linkToCoord(inputLink.len), false).y}
    //         const outAngle_temp = getNetAngle(calcOutputAngle(inAngle, !linkageOpen))
    //         const newC = {x: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).x, y: placePointPolar(nodeC, nodeD, outAngle_temp, linkToCoord(outputLink.len), false).y}
    //         const couplerAngle = getJointsAngle(newB,newC)
    //         const couplerTAngle = getNetAngle(couplerAngle + couplerLink.tAng)
    //         const couplerTDist = couplerLink.tLen
    //         const newBC = {x: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).x, y: placePointPolar(nodeBC, newB, couplerTAngle, couplerTDist, false).y}

    //         if (inputClass === "Rocker") {
    //             // altTraceData.points.push(newBC)
    //         }
    //     }
    //     if (swapped_n) {
    //         mirrorNodeSynth()
    //         setLinkPoints()
    //         updateTPoints()
    //         updateOpenCrossed()
    //     }
    // }
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

    reverseIcon
        // .attr("opacity", animationActive ? 1 : 0.25)
        .text(animateDir > 0 ? "⟲" : "⟳")

    newAngle = linkToCoord(newAngle, "angle")
    doActuate(newAngle)

}

function defaultLinkage() {
    saveUndoPoints()
    getLinkByType("fixed").visible = true
    localStorage.setItem("fixedStatus", "")
    for (i = 0; i < jointsData.length; i++) {
        jointsData[i].x = defaultJoints[i].x
        jointsData[i].y = defaultJoints[i].y
        jointsData[i].trace = defaultJoints[i].trace

        localStorage.setItem(`${jointsData[i].id}_trace`, "")
    }
    for (i = 0; i < linksData.length; i++) {
        linksData[i].ternary = defaultLinks[i].ternary

        localStorage.setItem(`${linksData[i].id}_t`, "")
    }
    synthPoints[0].x = getPoint("BC").x
    synthPoints[0].y = getPoint("BC").y

    savePoints()
    updateTPoints()
    setLinkPoints()
    updateOpenCrossed()
    updateTrace()
    updateLinkGeometry();
}
