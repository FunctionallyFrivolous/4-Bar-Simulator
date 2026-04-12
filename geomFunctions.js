// Functions that assess or effect properties of the linkage mechanism

// Function to set the new input link angle to actuate the mechanism
    // This will be executed as a result of draging the input handle and any other actuation method implemented
function doActuate(deg) {
    let inAngle = deg
    inputAngle = coordToLink(inAngle, "angle")

    if (inputClass !== "Crank") {
        if (inputLimits.min < 0) {
            let tempDeg = inputAngle
            if (inputAngle > 180) {
                tempDeg = tempDeg - 360
            }
            if (tempDeg < inputLimits.min) {
                inAngle = inputLimits.min + limitThreshold;
                inAngle = linkToCoord(inAngle, "angle")
                if (!recentCrossover && tempDeg < inputLimits.min + crossoverDeadband && allowCrossover) {
                    toggleOpenCrossed()
                    recentCrossover = true
                }
            } else if (tempDeg > inputLimits.max) {
                inAngle = inputLimits.max - limitThreshold;
                inAngle = linkToCoord(inAngle, "angle")
                if (!recentCrossover && tempDeg > inputLimits.max - crossoverDeadband && allowCrossover) {
                    toggleOpenCrossed()
                    recentCrossover = true
                }
            }
            if (tempDeg > inputLimits.min + crossoverDeadband && tempDeg < inputLimits.max - crossoverDeadband) {
                recentCrossover = false
            }
        } else {
            if (inputAngle < inputLimits.min) {
                inAngle = linkToCoord(inputLimits.min, "angle") + limitThreshold;
                if (!recentCrossover && inAngle < inputLimits.min + crossoverDeadband && allowCrossover) {
                    toggleOpenCrossed()
                    recentCrossover = true
                }
            } 
            if (inputAngle > inputLimits.max) {
                inAngle = linkToCoord(inputLimits.max, "angle") - limitThreshold;
                if (!recentCrossover && inAngle > inputLimits.max - crossoverDeadband && allowCrossover) {
                    toggleOpenCrossed()
                    recentCrossover = true
                }
            }
            if (inAngle > inputLimits.min + crossoverDeadband && inAngle < inputLimits.max - crossoverDeadband) {
                recentCrossover = false
            }
        }
    }
    
    inputAngle = coordToLink(inAngle, "angle")

    const inputLink = getLinkByType("input")
    const outputLink = getLinkByType("output")
    const outAngle = calcOutputAngle()

    setLinkAngle(inputLink.id, inAngle)
    setLinkAngle(outputLink.id, outAngle)
    
    updateLinkGeometry();
}

// Function to calc/return the angle of the output link based on all link lengths and input angle
function calcOutputAngle() {
    const a = getLinkByType("input").len
    const b = getLinkByType("output").len
    const c = getLinkByType("coupler").len
    const d = getLinkByType("fixed").len

    const inAngle = degToRad(inputAngle)

    const U = a*a + b*b - c*c + d*d - 2*a*d*Math.cos(inAngle)
    const V = 2*a*b*Math.sin(inAngle)
    const W = 2*b*(d - a*Math.cos(inAngle))

    const configFactor = linkageOpen ? 1 : -1
    const halfTan = (-V + configFactor * Math.sqrt(V*V - U*U + W*W))/(W-U)
    let outAngle = Math.atan2(halfTan, 1) * 2
    outAngle = radToDeg(outAngle)
    if (outAngle < 0) outAngle + 360

    outputAngle = outAngle;

    outAngle = linkToCoord(outAngle, "angle")

    return outAngle;
}

function updateLinkageConfig() {
    updateOpenCrossed()

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

    let A_min_deg = radToDeg(Math.acos(A_min_temp));
    if (A_min_deg < 0 )  A_min_deg = 360 + A_min_deg;

    let A_max_deg = radToDeg(Math.acos(A_max_temp));
    if (A_max_deg < 0 )  A_max_deg = 360 + A_max_deg;
    
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

    if (inputClass === "Rocker" & nodesData[1].y > nodesData[0].y) {
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

    // document.getElementById("debugOutputs").innerHTML = `${baseAngle.toFixed(1)}`
}

function updateOpenCrossed() {
    const AB_th = getNodesAngle(getNode("A"), getNode("B"))
    const DA_th = getNodesAngle(getNode("D"), getNode("A"))
    const DB_th = DA_th - getNodesAngle(getNode("D"), getNode("B"))
    let DC_th = DA_th - getNodesAngle(getNode("D"), getNode("C"))

    if (AB_th < DA_th) {
        if (DC_th < 0) DC_th = DC_th + 360
        if (DC_th < DB_th || DC_th > DB_th+180) linkageOpen = false;
        else linkageOpen = true
    } else {
        if (DC_th < DB_th || DC_th > DB_th+180) linkageOpen = false;
        else linkageOpen = true
    }

    toggleConfigIcon.text(linkageOpen ? "Open ⇋ Crossed" : "Crossed ⇋ Open")
    // document.getElementById("debugOutputs").innerHTML = `AB: ${AB_th.toFixed(1)}, DA: ${DA_th.toFixed(1)}, DC: ${DC_th.toFixed(1)}, DB: ${DB_th.toFixed(1)}, DB': ${(DB_th+180).toFixed(1)}`
} 
function toggleOpenCrossed() {
    const DB_th = getNodesAngle(getNode("D"), getNode("B"))
    const DC_th = getNodesAngle(getNode("D"), getNode("C"))
    const newDC_th = 2*DB_th - DC_th
    rotateNode(getNode("C"),newDC_th,getNode("D"))
    updateOpenCrossed()
    updateLinkGeometry()
}

function updateLinkGeometry() {
    nodeDrag
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
    fixedNodes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
    nodeDots
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)

    setLinkNodes()

    linkLines
        .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
        .attr("stroke", d => d.type === "fixed" ? "black" : d.color)
        .attr("opacity", d => d.type === "fixed" ? 1 : 0.5)
        .attr("stroke-width", d => d.type === "fixed" ? 4 : 20)

    toggleCrossoverIcon.attr("opacity", allowCrossover && inputClass !== "Crank" ? 1 : 0.5)
    toggleCrossoverButton.attr("stroke-opacity", allowCrossover && inputClass !== "Crank" ? 1 : 0.5)

    updateLinkageConfig()

    // document.getElementById("debugOutputs").innerHTML = 
    // `${linkageOpen ? "Open" : "Crossed"}`
}