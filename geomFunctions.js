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
            if (!recentCrossover && checkAngle < inputLimits.min + crossoverDeadband && allowCrossover) {
                toggleOpenCrossed()
                recentCrossover = true
            }
        } else if (checkAngle > inputLimits.max) {
            inAngle = getNetAngle(linkToCoord(inputLimits.max, "angle")) - limitThreshold;
            if (!recentCrossover && checkAngle > inputLimits.max - crossoverDeadband && allowCrossover) {
                toggleOpenCrossed()
                recentCrossover = true
            }
        }
        if (checkAngle > inputLimits.min + crossoverDeadband && checkAngle < inputLimits.max - crossoverDeadband) {
                recentCrossover = false
        }
    }
    
    inputAngle = getNetAngle(coordToLink(inAngle, "angle"))

    const outAngle = calcOutputAngle(inputAngle)
    updateOutputAngle();

    setLinkAngle(getLinkByType("input").id, inAngle)
    setLinkAngle(getLinkByType("output").id, outAngle)
    tNodeFollow()
    
    updateLinkGeometry();
}

// Function to calc/return the angle of the output link based on all link lengths and input angle
function calcOutputAngle(inDeg) {
    const a = getLinkByType("input").len
    const b = getLinkByType("output").len
    const c = getLinkByType("coupler").len
    const d = getLinkByType("fixed").len

    const inAngle = degToRad(inDeg)

    const U = a*a + b*b - c*c + d*d - 2*a*d*Math.cos(inAngle)
    const V = 2*a*b*Math.sin(inAngle)
    const W = 2*b*(d - a*Math.cos(inAngle))

    const configFactor = linkageOpen ? 1 : -1
    const halfTan = (-V + configFactor * Math.sqrt(Math.max((V*V - U*U + W*W),0)))/(W-U)
    let outAngle = Math.atan(halfTan) * 2
    outAngle = getNetAngle(radToDeg(outAngle))

    outAngle = getNetAngle(linkToCoord(outAngle, "angle"))

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
    const AB_th = coordToLink(getNodesAngle(getNode("A"), getNode("B")),"angle")
    const DA_th = coordToLink(getNodesAngle(getNode("D"), getNode("A")), "angle")
    const DB_th = DA_th - coordToLink(getNodesAngle(getNode("D"), getNode("B")), "angle")
    let DC_th = DA_th - coordToLink(getNodesAngle(getNode("D"), getNode("C")), "angle")

    if (AB_th < DA_th) DC_th = getNetAngle(DC_th)

    if (DC_th < DB_th || DC_th > DB_th+180) linkageOpen = false;
    else linkageOpen = true

    document.getElementById("debugOutputs").innerHTML = `
        DBraw: ${getNodesAngle(getNode("D"),getNode("B")).toFixed(1)}, 
        DCraw: ${getNodesAngle(getNode("D"),getNode("C")).toFixed(1)}, \n<br>
        AB: ${AB_th.toFixed(1)}, 
        DA: ${DA_th.toFixed(1)}, 
        DC: ${DC_th.toFixed(1)}, 
        DB: ${DB_th.toFixed(1)} \n<br>
        `

    toggleConfigIcon.text(linkageOpen ? "Open ⇋ Crossed" : "Crossed ⇋ Open")
    // document.getElementById("debugOutputs").innerHTML = `AB: ${AB_th.toFixed(1)}, DA: ${DA_th.toFixed(1)}, DC: ${DC_th.toFixed(1)}, DB: ${DB_th.toFixed(1)}, DB': ${(DB_th+180).toFixed(1)}`
} 
function toggleOpenCrossed() {
    const DB_th = getNodesAngle(getNode("D"), getNode("B"))
    const DC_th = getNodesAngle(getNode("D"), getNode("C"))
    const newDC_th = 2*DB_th - DC_th
    rotateNode(getNode("C"),newDC_th,getNode("D"))
    updateOpenCrossed()
    tNodeFollow()
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
        .attr("r", d => d.id.length === 2 ? 5 : d.ground ? 4 : 4.5)
        .attr("fill", bgColor)
        .style("display", d => d.id.length === 1 ? "block" : getLinkByID(d.id).ternary ? "block" : "none")

    setLinkNodes()

    linkLines
        .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
        .attr("stroke", d => d3.interpolateRgb(d.color,"white")(whtnColor))
        .attr("fill", d => d3.interpolateRgb(d.color,"white")(whtnColor))
        .attr("opacity", d => d.type === "fixed" ? 0 : darkMode ? 0.8 : 0.6)
        // .attr("stroke-width", d => d.type === "fixed" ? 4 : 20)
        .style("display", d => d.visible ? "block" : "none")
    groundLine
        .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
        .attr("stroke", fgColor)
        .style("display", d => d.type === "fixed" && d.visible ? "block" : "none")
        .attr("stroke-dasharray", d => d.type === "fixed" ? "4,8" : "none")

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
        .text(`Input: ${inputAngle.toFixed(1)}°`)
    inputLinkProps
        .attr("fill", d3.interpolateRgb(getLinkByType("input").color,"white")(whtnColor*2))
        .text(`${inputClass} (${inputLimits.min.toFixed(1)}°, ${inputLimits.max.toFixed(1)}°)`)

    outputLinkVal
        .attr("fill", d3.interpolateRgb(getLinkByType("output").color,"white")(whtnColor*2))
        .text(`Output: ${outputAngle.toFixed(1)}°`)
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