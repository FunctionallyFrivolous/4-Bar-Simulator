
function swapInputOutput() {
    const nodeA = getPoint("A")
    const nodeB = getPoint("B")
    const nodeAB = getPoint("AB")
    const nodeD = getPoint("D")
    const nodeC = getPoint("C")
    const nodeDC = getPoint("DC")

    const oldA = structuredClone(nodeA)
    const oldB = structuredClone(nodeB)
    const oldAB = structuredClone(nodeAB)
    const oldD = structuredClone(nodeD)
    const oldC = structuredClone(nodeC)
    const oldDC = structuredClone(nodeDC)

    nodeA.x = oldD.x
    nodeA.y = oldD.y
    nodeB.x = oldC.x
    nodeB.y = oldC.y
    nodeAB.x = oldDC.x
    nodeAB.y = oldDC.y
    nodeD.x = oldA.x
    nodeD.y = oldA.y
    nodeC.x = oldB.x
    nodeC.y = oldB.y
    nodeDC.x = oldAB.x
    nodeDC.y = oldAB.y

    setLinkPoints()
    updateTPoints()
}

function invertLinkage() {
    const nodeA = getPoint("A")
    const nodeB = getPoint("B")
    const nodeD = getPoint("D")
    const nodeC = getPoint("C")

    // const distAB = getDistBtwPoints(nodeB, nodeA)
    // const distDC = getDistBtwPoints(nodeD, nodeC)

    const angleAB = coordToLink(getJointsAngle(nodeA, nodeB),"angle")
    const angleDC = coordToLink(getJointsAngle(nodeD, nodeC),"angle")

    placePointPolar(nodeB, nodeA, linkToCoord(-angleAB, "angle"), AB, true)
    placePointPolar(nodeC, nodeD, linkToCoord(-angleDC, "angle"), DC, true)

    setLinkPoints()
    tPointFollow()
    updateOpenCrossed()
    updateInputLimits()
    updateOutputLimits()
}

function cycleCognates() {
    cognateNumber ++
    if (cognateNumber > 3) cognateNumber = 1
    const nodeA = getPoint("A")
    const nodeB = getPoint("B")
    const nodeC = getPoint("C")
    const nodeD = getPoint("D")
    const nodeE = getPoint("BC")
    
    // Get new D node
    const nodeD0 = cognateData.find(g => g.id === "D0")
    nodeD0.x = nodeA.x
    nodeD0.y = nodeA.y

    // Get new A node
    // const distBC = getDistBtwPoints(getPoint("B"), getPoint("C"))
    // const distBE = getDistBtwPoints(getPoint("B"), getPoint("BC"))
    // const distAD = getDistBtwPoints(getPoint("A"), getPoint("D"))

    const distA0D0 = BE/BC * AD
    const angDAA0 = getAngleBtwPoints(getPoint("BC"), getPoint("C"), getPoint("B"))
    const angAD = getJointsAngle(nodeA,nodeD,true)
    const nodeA0 = cognateData.find(g => g.id === "A0")
    placePointPolar(nodeA0, nodeA, (angDAA0+angAD), distA0D0, true)

    // Get new C node
    const angD0C0 = getJointsAngle(getPoint("B"), getPoint("BC"), false)
    const distD0C0 = getDistBtwPoints(getPoint("B"), getPoint("BC"))
    const nodeC0 = cognateData.find(g => g.id === "C0")
    placePointPolar(nodeC0, nodeA, angD0C0, distD0C0, true)

    // Get new B node
    const angEC0B0 = getAngleBtwPoints(getPoint("BC"), getPoint("C"), getPoint("B"))
    const distC0E = getDistBtwPoints(nodeC0, getPoint("BC"))
    const distC0B0 = BE/BC * distC0E
    const angC0E0 = getJointsAngle(nodeC0, getPoint("BC"), false)
    const nodeB0 = cognateData.find(g => g.id === "B0")
    placePointPolar(nodeB0, nodeC0, angEC0B0 + angC0E0, distC0B0, true)

    const nodeE0 = cognateData.find(g => g.id === "E0")
    nodeE0.x = nodeE.x
    nodeE0.y = nodeE.y

    nodeA.x = nodeA0.x
    nodeA.y = nodeA0.y
    nodeB.x = nodeB0.x
    nodeB.y = nodeB0.y
    nodeC.x = nodeC0.x
    nodeC.y = nodeC0.y
    nodeD.x = nodeD0.x
    nodeD.y = nodeD0.y

    updateTPoints(false, "BC")
    setLinkPoints()
    tPointFollow()
}

function pathNodeModeSynth(doit=true,drag="E1") {
    if (!nodeMode) return
    // if (!nodeMode) {
    //     altTraceData.points = []
    //     return
    // }

    setLinkPoints()

    const pointA = getPoint("A")
    const pointB = getPoint("B")
    const pointC = getPoint("C")
    const pointD = getPoint("D")
    const pointE = getPoint("BC")

    const pointE1 = getPoint("E1")
    const pointE2 = getPoint("E2")
    const pointE3 = getPoint("E3")

    const dragPoint = drag[0] === "E" ? synthPoints.find(p=>p.id === drag) : getPoint(drag)

    // If dragging a focus point (i.e. A, D, or an E)...
        // Determine which 3 to use to define kF
        // Project the unused onto the new kF
    if (drag.includes("A") || drag.includes("D") || drag[0] === "E" || drag === "BC") {
        let kFPoint = drag === "D" ? pointD : pointA
        let adjPoint = drag === "D" ? pointA : pointD

        // This smooths out the cases where E2 is dragged over A or D
        if (drag[0] === "E") {
            kFPoint = AE2 > DE2 ? pointA : pointD
            adjPoint = AE2 > DE2 ? pointD : pointA
        }

        switch (synthPointCount) {
            case 1:
                update_kFCircle(pointE1, pointA, pointD)
                break;
            case 2:
                update_kFCircle(pointE1, pointE2, kFPoint)//[0])
                break;
            case 3:
                update_kFCircle(pointE1, pointE2, pointE3)
                break;
        }
        const kF_center = {x: kFCirc[0], y: kFCirc[1]}
        const kF_rad = kFCirc[2]/2
        let angle_kF = getJointsAngle(kF_center, adjPoint)

        const point_e12 = getMidPoint(pointE1,pointE2)
        const angle_e12 = getJointsAngle(point_e12,kF_center)
        let angleFixed = angle_e12
        const moveFixed = AE2 > DE2 ? pointA : pointD

        const fixed_rad = checkClosestPolar(moveFixed,kF_center,angleFixed,kF_rad,-kF_rad)

        // This helps prevent issues when transitioning from cusp-cusp to cusp-crunode
        if ((Math.abs(DE2-DE1)<limitThreshold) && synthPointCount > 1 && !(pointE1.type === "cusp" && pointE2.type === "cusp")) {
            placePointPolar(moveFixed, kF_center, angleFixed-10, fixed_rad, true)
        }

        placePointPolar(moveFixed, kF_center, angleFixed, fixed_rad, (pointE1.type === "cusp" && pointE2.type === "cusp"))

        placePointPolar(adjPoint, kF_center, angle_kF, kF_rad, synthPointCount > 1)
        setLinkPoints()
        updateTPoints()
        updateInputLimits()
        updateOutputLimits()
    }

    let angleE1D = getJointsAngle(pointE1, pointD, false)
    let angleE1A = getJointsAngle(pointE1, pointA, false)

    let angleE1B = getJointsAngle(pointE1, pointB, false)
    let angleE1C = getJointsAngle(pointE1, pointC, false)

    const angleAB = getJointsAngle(pointA, pointB, false)
    const angleDC = getJointsAngle(pointD, pointC, false)

    const kF_center = {x: kFCirc[0], y: kFCirc[1]} 

    const angleE1_E2 = getNetAngle(getAngleBtwPoints(pointE2,pointE1,kF_center), false)
    const angleE1_A = getNetAngle(getAngleBtwPoints(pointA,pointE1,kF_center), false)
    const angleE2_E1 = getNetAngle(getAngleBtwPoints(pointE1,pointE2,kF_center), false)
    const angleD_E1 = getNetAngle(getAngleBtwPoints(pointE1,pointD,kF_center), false)

    const overAD = (pointE2.type !== "none" && angleE1_E2 > angleE1_A && angleE2_E1 > angleD_E1) || (angleE1_E2 < angleE1_A && angleE2_E1 < angleD_E1)

    // Determine whether to place B & C to new locations
    let placeC = drag !== "C" && (drag === "B" || (AE2 > DE2 && pointE2.type !== "cusp") || (AE2 < DE2 && pointE2.type === "cusp"))// || (pointE2.type === "cusp"))
    if (pointE1.type === "cusp" && pointE2.type === "cusp"){
        placeC = AE2 > DE2 ? true : false
    } 
    
    if (placeC){

        let new_angleE1B = angleE1B
        let newBE = BE

        if (pointE1.type === "cusp") {
            new_angleE1B = angleE1A
        } else if (pointE2.type === "cusp" && !overAD) {
            newBE = (AE1*AE1 - AE2*AE2)/(2*AE1*Math.cos(degToRad(getAngleBtwPoints(pointA, pointB, pointE1))) - 2*AE2)
        } else if (pointE2.type === "cusp" && overAD) {
            newBE = (AE1*AE1 - AE2*AE2)/(2*AE1*Math.cos(degToRad(getAngleBtwPoints(pointA, pointB, pointE1))) + 2*AE2)
        }

        newBE = checkClosestPolar(pointB, pointE1, new_angleE1B, newBE, -newBE)
        placePointPolar(pointB, pointE1, new_angleE1B, newBE, true)
        setLinkPoints()
        updateTPoints()
        updateInputLimits()
        updateOutputLimits()

        const angleAE1B = getAngleBtwPoints(pointA, pointB, pointE1)
        let new_angleE1C = angleE1C
        new_angleE1C = getNetAngle(angleE1D - angleAE1B)
        let newCE = CE

        if (pointE2.type === "none") {
            newCE = CE
        }
        if (pointE2.type === "crunode" && !overAD){
            newCE = (DE1*DE1 - DE2*DE2)/(((BE*BE + AE1*AE1 - AB*AB)*DE1/(BE*AE1))-((BE*BE + AE2*AE2 - AB*AB)*DE2/(BE*AE2)))
        }
        if (pointE2.type === "crunode" && overAD){
            newCE = (DE1*DE1 - DE2*DE2)/(((BE*BE + AE1*AE1 - AB*AB)*DE1/(BE*AE1))+((BE*BE + AE2*AE2 - AB*AB)*DE2/(BE*AE2)))
        }
        if (pointE2.type === "cusp" && !overAD){
            newCE = (DE1*DE1 - DE2*DE2)/((((AE1*AE1 - AE2*AE2)/(2*BE*AE1))+(AE2/AE1)-(DE2/DE1))*2*DE1)
        }
        if (pointE2.type === "cusp" && overAD){
            newCE = (DE1*DE1 - DE2*DE2)/((((AE1*AE1 - AE2*AE2)/(2*BE*AE1))-(AE2/AE1)-(DE2/DE1))*2*DE1)
        }

        // if (pointE1.type === "crunode" && pointE2.type === "crunode" && !overAD){
        //     newCE = (DE1*DE1 - DE2*DE2)/(((BE*BE + AE1*AE1 - AB*AB)*DE1/(BE*AE1))-((BE*BE + AE2*AE2 - AB*AB)*DE2/(BE*AE2)))
        // }
        // if (pointE1.type === "crunode" && pointE2.type === "crunode" && overAD){
        //     newCE = (DE1*DE1 - DE2*DE2)/(((BE*BE + AE1*AE1 - AB*AB)*DE1/(BE*AE1))+((BE*BE + AE2*AE2 - AB*AB)*DE2/(BE*AE2)))
        // }
        // if (pointE1.type === "cusp" && pointE2.type === "crunode" && !overAD){
        //     newCE = (DE1*DE1 - DE2*DE2)/(((BE*BE + AE1*AE1 - AB*AB)*DE1/(BE*AE1))-((BE*BE + AE2*AE2 - AB*AB)*DE2/(BE*AE2)))
        // }
        // if (pointE1.type === "cusp" && pointE2.type === "crunode" && overAD){
        //     newCE = (DE1*DE1 - DE2*DE2)/(((BE*BE + AE1*AE1 - AB*AB)*DE1/(BE*AE1))+((BE*BE + AE2*AE2 - AB*AB)*DE2/(BE*AE2)))
        //     // THIS IS THE SAME AS FOR crunode-crunode overAD. COMBINE THEM
        // }
        // if (pointE1.type === "crunode" && pointE2.type === "cusp" && !overAD){
        //     newCE = (DE1*DE1 - DE2*DE2)/((((AE1*AE1 - AE2*AE2)/(2*BE*AE1))+(AE2/AE1)-(DE2/DE1))*2*DE1)
        // }
        // if (pointE1.type === "cusp" && pointE2.type === "cusp" && !overAD){
        //     newCE = (DE1*DE1 - DE2*DE2)/((((AE1*AE1 - AE2*AE2)/(2*BE*AE1))+(AE2/AE1)-(DE2/DE1))*2*DE1)
        // }
        // if (pointE1.type === "crunode" && pointE2.type === "cusp" && overAD){
        //     newCE = (DE1*DE1 - DE2*DE2)/((((AE1*AE1 - AE2*AE2)/(2*BE*AE1))-(AE2/AE1)-(DE2/DE1))*2*DE1)
        // }
        // if (pointE1.type === "cusp" && pointE2.type === "cusp" && overAD){
        //     newCE = (DE1*DE1 - DE2*DE2)/(((BE*BE + AE1*AE1 - AB*AB)*DE1/(BE*AE1))+((BE*BE + AE2*AE2 - AB*AB)*DE2/(BE*AE2)))
        // }

        newCE = checkClosestPolar(pointC, pointE1, new_angleE1C, newCE, -newCE) // Checks whether +-newCE is closer to old CE
        placePointPolar(pointC, pointE1, new_angleE1C, newCE, true)

        setLinkPoints()

        if (synthPointCount > 1 && checkImaginaryNode(newCE,placeC)){
            new_angleE1B = angleE1B
            newBE = BE
            if (pointE1.type === "cusp") {
            new_angleE1B = angleE1A
            } else if (!overAD) {
                newBE = (AE1*AE1 - AE2*AE2)/(2*AE1*Math.cos(degToRad(getAngleBtwPoints(pointA, pointB, pointE1))) - 2*AE2)
            } 
            // else if (overAD) {
            //     newBE = (AE1*AE1 - AE2*AE2)/(2*AE1*Math.cos(degToRad(getAngleBtwPoints(pointA, pointB, pointE1))) + 2*AE2)
            // }
            newBE = checkClosestPolar(pointB, pointE1, new_angleE1B, newBE, -newBE)
            placePointPolar(pointB, pointE1, new_angleE1B, newBE, true)
            setLinkPoints()
            updateTPoints()
            updateInputLimits()
            updateOutputLimits()

            if (!overAD){
                newCE = (DE1*DE1 - DE2*DE2)/((((AE1*AE1 - AE2*AE2)/(2*BE*AE1))+(AE2/AE1)-(DE2/DE1))*2*DE1)
            }
            // if (overAD){
            //     newCE = (DE1*DE1 - DE2*DE2)/((((AE1*AE1 - AE2*AE2)/(2*BE*AE1))-(AE2/AE1)-(DE2/DE1))*2*DE1)
            // }
            newCE = checkClosestPolar(pointC, pointE1, new_angleE1C, newCE, -newCE)
            placePointPolar(pointC, pointE1, new_angleE1C, newCE, true)
        }

        // document.getElementById("debugOutputs").innerHTML = `
        //     ${checkImaginaryNode(pointC)} \n<br>
        //     ${Math.abs(DC+newCE).toFixed(1)} < ${DE2.toFixed(1)}: ${Math.abs(DC+newCE) < DE2} \n<br>
        //     ${Math.abs(DC-newCE).toFixed(1)} > ${DE2.toFixed(1)}: ${Math.abs(DC-newCE) > DE2} \n<br>
        // `

    }
    else {

        let new_angleE1C = angleE1C
        let newCE = CE 

        if (pointE1.type === "cusp" ){ 
            new_angleE1C = angleE1D
        } else if (pointE2.type === "cusp" && !overAD) {
            newCE = (DE1*DE1 - DE2*DE2)/(2*DE1*Math.cos(degToRad(getAngleBtwPoints(pointD, pointC, pointE1))) - 2*DE2)
        } else if (pointE2.type === "cusp" && overAD) {
            newCE = (DE2*DE2 - DE1*DE1)/(2*DE1*Math.cos(degToRad(getAngleBtwPoints(pointD, pointC, pointE1))) + 2*DE2)
        }

        newCE = checkClosestPolar(pointC, pointE1, new_angleE1C, newCE, -newCE)
        placePointPolar(pointC, pointE1, new_angleE1C, newCE, true)
        setLinkPoints()
        updateTPoints()
        updateInputLimits()
        updateOutputLimits()

        const angleDE1C = getAngleBtwPoints(pointD, pointC, pointE1)
        let new_angleE1B = angleE1B
        new_angleE1B = getNetAngle(angleE1A - angleDE1C)
        let newBE = BE

        if (pointE2.type === "none") {
            newBE = BE
        }
        if (pointE2.type === "crunode" && !overAD){
            newBE = (AE1*AE1 - AE2*AE2)/(((CE*CE + DE1*DE1 - DC*DC)*AE1/(CE*DE1))-((CE*CE + DE2*DE2 - DC*DC)*AE2/(CE*DE2)))
        }
        if (pointE2.type === "crunode" && overAD){
            newBE = (AE1*AE1 - AE2*AE2)/(((CE*CE + DE1*DE1 - DC*DC)*AE1/(CE*DE1))+((CE*CE + DE2*DE2 - DC*DC)*AE2/(CE*DE2)))
        }
        if (pointE2.type === "cusp" && !overAD){
            newBE = (AE1*AE1 - AE2*AE2)/((((DE1*DE1 - DE2*DE2)/(2*CE*DE1))+(DE2/DE1)-(AE2/AE1))*2*AE1)
        }
        if (pointE2.type === "cusp" && overAD){
            newBE = (AE1*AE1 - AE2*AE2)/((((DE1*DE1 - DE2*DE2)/(2*CE*DE1))-(DE2/DE1)-(AE2/AE1))*2*AE1)
        }

        // if (pointE1.type === "crunode" && pointE2.type === "crunode" && !overAD){
        //     newBE = (AE1*AE1 - AE2*AE2)/(((CE*CE + DE1*DE1 - DC*DC)*AE1/(CE*DE1))-((CE*CE + DE2*DE2 - DC*DC)*AE2/(CE*DE2)))
        // }
        // if (pointE1.type === "crunode" && pointE2.type === "crunode" && overAD){
        //     newBE = (AE1*AE1 - AE2*AE2)/(((CE*CE + DE1*DE1 - DC*DC)*AE1/(CE*DE1))+((CE*CE + DE2*DE2 - DC*DC)*AE2/(CE*DE2)))
        // }
        // if (pointE1.type === "cusp" && pointE2.type === "crunode" && !overAD){
        //     newBE = (AE1*AE1 - AE2*AE2)/(((CE*CE + DE1*DE1 - DC*DC)*AE1/(CE*DE1))-((CE*CE + DE2*DE2 - DC*DC)*AE2/(CE*DE2)))
        // }
        // if (pointE1.type === "cusp" && pointE2.type === "crunode" && overAD){
        //     newBE = (AE1*AE1 - AE2*AE2)/(((CE*CE + DE1*DE1 - DC*DC)*AE1/(CE*DE1))+((CE*CE + DE2*DE2 - DC*DC)*AE2/(CE*DE2)))
        //     // THIS IS THE SAME AS FOR crunode-crunode overAD. COMBINE THEM
        // }
        // if (pointE1.type === "crunode" && pointE2.type === "cusp" && !overAD){
        //     newBE = (AE1*AE1 - AE2*AE2)/((((DE1*DE1 - DE2*DE2)/(2*CE*DE1))+(DE2/DE1)-(AE2/AE1))*2*AE1)
        // }
        // if (pointE1.type === "cusp" && pointE2.type === "cusp" && !overAD){
        //     newBE = (AE1*AE1 - AE2*AE2)/((((DE1*DE1 - DE2*DE2)/(2*CE*DE1))+(DE2/DE1)-(AE2/AE1))*2*AE1)
        // }
        // if (pointE1.type === "crunode" && pointE2.type === "cusp" && overAD){
        //     newBE = (AE1*AE1 - AE2*AE2)/((((DE1*DE1 - DE2*DE2)/(2*CE*DE1))-(DE2/DE1)-(AE2/AE1))*2*AE1)
        // }
        // if (pointE1.type === "cusp" && pointE2.type === "cusp" && overAD){
        //     newBE = (AE1*AE1 - AE2*AE2)/(((CE*CE + DE1*DE1 - DC*DC)*AE1/(CE*DE1))+((CE*CE + DE2*DE2 - DC*DC)*AE2/(CE*DE2)))
        // }

        newBE = checkClosestPolar(pointB, pointE1, new_angleE1B, newBE, -newBE) // Checks whether +-newCE is closer to old CE
        placePointPolar(pointB, pointE1, new_angleE1B, newBE, true)

        setLinkPoints()

        if (synthPointCount > 1 && checkImaginaryNode(newBE,placeC)){
            new_angleE1C = angleE1C
            newCE = CE 
            if (pointE1.type === "cusp" ){ 
                new_angleE1C = angleE1D
            } else if (!overAD) {
                newCE = (DE1*DE1 - DE2*DE2)/(2*DE1*Math.cos(degToRad(getAngleBtwPoints(pointD, pointC, pointE1))) - 2*DE2)
            } 
            // else if (overAD) {
            //     newCE = (DE2*DE2 - DE1*DE1)/(2*DE1*Math.cos(degToRad(getAngleBtwPoints(pointD, pointC, pointE1))) + 2*DE2)
            // }
            newCE = checkClosestPolar(pointC, pointE1, new_angleE1C, newCE, -newCE)
            placePointPolar(pointC, pointE1, new_angleE1C, newCE, true)
            setLinkPoints()
            updateTPoints()
            updateInputLimits()
            updateOutputLimits()

            if (!overAD){
                newBE = (AE1*AE1 - AE2*AE2)/((((DE1*DE1 - DE2*DE2)/(2*CE*DE1))+(DE2/DE1)-(AE2/AE1))*2*AE1)
            }
            // if (overAD){
            //     newBE = (AE1*AE1 - AE2*AE2)/((((DE1*DE1 - DE2*DE2)/(2*CE*DE1))-(DE2/DE1)-(AE2/AE1))*2*AE1)
            // }
            newBE = checkClosestPolar(pointB, pointE1, new_angleE1B, newBE, -newBE)
            placePointPolar(pointB, pointE1, new_angleE1B, newBE, true)
        }

    }

    // if (!checkPointsCoincident(pointE,pointE1)) {
    //     pointE.x = pointE1.x
    //     pointE.y = pointE1.y
    //     document.getElementById("debugOutputs").innerHTML = `this`
    // } else document.getElementById("debugOutputs").innerHTML = ``

    setLinkPoints()
    updateTPoints()
    updateInputLimits()
    updateOutputLimits()

    pointE1.inAng = inputAngle
    pointE1.isOpen = linkageOpen

    const temp_inAng = pointE2.inAng
    const angleAE2 = getJointsAngle(pointA, pointE2)
    const angle_be = radToDeg(Math.acos((AB*AB + AE2*AE2 - BE*BE)/(2*AB*AE2)))
    pointE2.inAng = coordToLink(angleAE2 - angle_be,"angle")
    // if (isNaN(angle_be)) pointE2.inAng = inputLimits.min // < This is causing an issue... 
        // When the input angle is initially unreachable
    if (isNaN(angle_be)) pointE2.inAng = temp_inAng

    // Need to assign E2.isOpen...

    // document.getElementById("debugOutputs").innerHTML = `
    //         CE: ${CE} \n<br>
    //         angleE1D: ${angleE1D} \n<br>
    //         angleAE1B: ${getAngleBtwPoints(pointA, pointB, pointE1)} \n<br>
    //         new_angleE1C: ${angleE1D-getAngleBtwPoints(pointA, pointB, pointE1)} \n<br>
    //         angleE1C: ${getJointsAngle(pointE1,pointC)} \n<br>
    //         angleDC: ${coordToLink(getJointsAngle(pointD,pointC),"angle")} \n<br>
    //     `

}

function mirrorNodeSynth(doit=true) {
    const nodeA = getPoint("A")
    const nodeE = getPoint("BC")
    const nodeB = getPoint("B")

    const nodeC = getPoint("C")
    const nodeD = getPoint("D")

    // const EB = getDistBtwPoints(nodeE,nodeB)
    let angleAEB = getAngleBtwPoints(nodeA, nodeB, nodeE)
    // if (angleAEB > 180) angleAEB = 360-angleAEB
    const angleEA = getJointsAngle(nodeE,nodeA)
    const old_angleEB = getJointsAngle(nodeE,nodeB)
    const new_angleEB = angleEA + angleAEB

    placePointPolar(nodeB, nodeE, new_angleEB, BE, doit)

    // const EC = getDistBtwPoints(nodeE,nodeC)
    const angleDEC = getAngleBtwPoints(nodeD, nodeC, nodeE)
    const angleED = getJointsAngle(nodeE,nodeD)
    const old_angleEC = getJointsAngle(nodeE,nodeC)
    const new_angleEC = angleED + angleDEC

    placePointPolar(nodeC, nodeE, new_angleEC, CE, doit)

    setLinkPoints()
    // updateTPoints()
    // updateTrace()
    // updateLinkGeometry()
}

function snapToSynthPoint(point="E1") {
    const synthPoint = synthPoints.find(p=>p.id === point)
    const couplerPoint = getPoint("BC")

    let inverted = false

    // If the angle to be snapped to is outside of the current input limits, this indicates that inversion is required in order to complete the snap
    if (synthPoint.inAng > inputLimits.max || synthPoint.inAng < inputLimits.min) {
        invertLinkage()
        inverted = true
    }
    // linkageOpen = synthPoint.isOpen // < this causes E1 to bounce off limits during dragging. Is is necessary in other cases?
    doActuate(getNetAngle(linkToCoord(synthPoint.inAng,"angle")))

    // If, after actuating to the synth point angle (and inverting if necessary), the coupler point has not reached the synth point, then the open/crossed config must also be toggled
    if (!checkPointsCoincident(synthPoint,couplerPoint)) {
        toggleOpenCrossed()
        // linkageOpen = synthPoint.isOpen // < this causes same limit bounce issue
        doActuate(getNetAngle(linkToCoord(synthPoint.inAng,"angle")))
    }

    return inverted // In order to track whether the system was inverted via above
}

function cycleSynthSolution(solution=1){

    const adjPoint = solution%2 > 0 ? getPoint("A") : getPoint("D")

    const kF_center = {x: kFCirc[0], y: kFCirc[1]}
    const kF_rad = kFCirc[2]/2
    let angle_kF = getJointsAngle(kF_center, adjPoint)

    placePointPolar(adjPoint, kF_center, angle_kF, -kF_rad, solution>1)

    setLinkPoints()
    updateTPoints()
    updateInputLimits()
    updateOutputLimits()
}

function checkImaginaryNode(newXE, placeC=true) {
    let imaginary = false
    const fixed_X = placeC ? DC : AB
    const fixed_E2 = placeC ? DE2 : AE2

    if (Math.abs(fixed_X + newXE) < fixed_E2 || Math.abs(fixed_X - newXE) > fixed_E2) {
        imaginary = true
    }

    return imaginary
}