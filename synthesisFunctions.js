
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

function pathCrunodeSynth(doit=false, cDrag=false) {
    if (!nodeMode) {
        altTraceData.points = []
        return
    }
    // if (synthSolution === 13) synthSolution = 1

    synthPointCount = 0
    for (i = 0; i < synthPoints.length; i++) {
        if (synthPoints[i].type !== "none") synthPointCount++
    }

    getLinkByType("coupler").tSnap = false

    const pointA = getPoint("A")
    const pointB = getPoint("B")
    const pointC = getPoint("C")
    const pointD = getPoint("D")
    const pointE = getPoint("BC")

    const pointE1 = synthPoints[0]
    const pointE2 = synthPoints[1]
    const pointE3 = synthPoints[2]

    update_kFCircle()
    const kF_center = {x: kFCirc[0], y: kFCirc[1]}
    const kF_rad = kFCirc[2]/2

    const angle_kF_D = getJointsAngle(kF_center,pointD) // Direction from kF center to D
    placePointPolar(pointD,kF_center,angle_kF_D,kF_rad,synthPointCount > 1)

    const angle_kF_A = getJointsAngle(kF_center,pointA) // Direction from kF center to A
    placePointPolar(pointA,kF_center,angle_kF_A,kF_rad,synthPointCount > 2)

    setLinkPoints()

    // const AB = getDistBtwPoints(pointA,pointB) // Input link length
    // const DC = getDistBtwPoints(pointD,pointC) // Output link length
    // const BE = getDistBtwPoints(pointB,pointE) // Input side of coupler link triangle
    // const CE = getDistBtwPoints(pointC,pointE) // Output side of coupler link triangle

    // const AE1 = getDistBtwPoints(pointA,pointE1) // Input-side fixed joint to first node location
    // const DE1 = getDistBtwPoints(pointD,pointE1) // Output-side fixed joint to first node location

    // const AE2 = getDistBtwPoints(pointA,pointE2) // Input-side fixed joint to second node location
    // const DE2 = getDistBtwPoints(pointD,pointE2) // Output-side fixed joint to second node location

    // // for DC
    // const W1 = (BE*AE1)/(CE*DE1)
    // const U1 = ((CE*CE + DE1*DE1)*BE*AE1)/(CE*DE1) - AE1*AE1 - BE*BE
    // const W2 = (BE*AE2)/(CE*DE2)
    // const U2 = ((CE*CE + DE2*DE2)*BE*AE2)/(CE*DE2) - AE2*AE2 - BE*BE

    // const DCsq = Math.abs((U2-U1)/(W2-W1))
    // const newDC = Math.sqrt(DCsq)

    // const angleDE1 = getJointsAngle(pointD,pointE1)
    // const angleCDE1 = radToDeg(Math.cos((DC*DC + DE1*DE1 - CE*CE)/(2*DC*DE1)))
    // const angleDC = angleDE1 + angleCDE1

    // placePointPolar(pointC,pointD,angleDC,newDC, synthPointCount > 1)
    // setLinkPoints()

    // const angleDEC = getAngleBtwPoints(pointD, pointC, pointE1)
    // const angleEA = getJointsAngle(pointE1, pointA, false)
    // let angleEB = getNetAngle(angleEA - angleDEC)

    // const old_angleEB = getJointsAngle(pointE, pointB, false)

    // if (Math.abs(old_angleEB+180-angleEB) < Math.abs(old_angleEB-angleEB)) {
    //     angleEB = angleEB - 180 
    // }

    // const newB = placePointPolar(pointB, pointE, angleEB, BE, doit)

    // if ((BE*AE1) < limitThreshold || (BE*AE2) < limitThreshold) {
    //     document.getElementById("debugOutputs").innerHTML = `no`
    // }

    // for AB
    const W1 = (CE*DE1)/(BE*AE1)
    const U1 = ((BE*BE + AE1*AE1)*CE*DE1)/(BE*AE1) - DE1*DE1 - CE*CE
    const W2 = (CE*DE2)/(BE*AE2)
    const U2 = ((BE*BE + AE2*AE2)*CE*DE2)/(BE*AE2) - DE2*DE2 - CE*CE

    const ABsq = Math.abs((U2-U1)/(W1-W2))
    let newAB = Math.sqrt(ABsq)

    if (synthPointCount > 1 && (synthPoints[1].type === "cusp" || Math.abs(BE-newAB) > AE2)) {
        newAB = BE-AE2
    }
    // if (synthPointCount > 1){
    //     if(synthp)
    // }
    
    const angleAE1 = getJointsAngle(pointA,pointE1)
    const angleBAE1 = radToDeg(Math.cos((AB*AB + AE1*AE1 - BE*BE)/(2*AB*AE1)))
    const angleAB = angleAE1 + angleBAE1

    placePointPolar(pointB,pointA,angleAB,newAB, synthPointCount > 1)

    setLinkPoints()

    // document.getElementById("debugOutputs").innerHTML = `
    //     ${synthPointCount} \n<br>
    //     ${angleAE1.toFixed(1)} \n<br>
    //     ${angleBAE1.toFixed(1)} \n<br>
    //     ${angleAB.toFixed(1)} \n<br>
    // `

    const angleAEB = getAngleBtwPoints(pointA, pointB, pointE1)
    const angleED = getJointsAngle(pointE, pointD, false)
    let angleEC = getNetAngle(angleED - angleAEB)

    // if (cDrag) {
        const old_angleEC = getJointsAngle(pointE, pointC, false)

        if (Math.abs(old_angleEC+180-angleEC) < Math.abs(old_angleEC-angleEC)) {
            angleEC = angleEC - 180 
        }
    // }

    let newCE = CE

    if (synthPointCount > 1 && (synthPoints[1].type === "cusp" || DC+newCE < DE2 || Math.abs(newCE-DC) > DE2)) {
        newCE = DE2-DC
    }

    const newC = placePointPolar(pointC, pointE, angleEC, newCE, doit)

    setLinkPoints()
    updateTPoints()
    updateInputLimits()
    updateOutputLimits()

    synthModeOpen = linkageOpen
    synthPoints[0].inAng = inputAngle
    synthPoints[0].isOpen = linkageOpen
    // synthPoints[0].x = pointE.x
    // synthPoints[0].y = pointE.y

    // document.getElementById("debugOutputs").innerHTML = `
    //     CE: ${newCE.toFixed(1)} \n<br>
    //     DC: ${DC.toFixed(1)} \n<br>
    //     DC_real: ${getDistBtwPoints(getPoint("D"),getPoint("C")).toFixed(1)} \n<br>
    //     \n<br>
    //     DE2: ${getDistBtwPoints(getPoint("D"),synthPoints[1]).toFixed(1)} \n<br>
    //     DC+CE: ${(getDistBtwPoints(getPoint("C"),getPoint("BC"))+getDistBtwPoints(getPoint("D"),getPoint("C"))).toFixed(1)} \n<br>
    //     DC-CE: ${(-getDistBtwPoints(getPoint("C"),getPoint("BC"))+getDistBtwPoints(getPoint("D"),getPoint("C"))).toFixed(1)} \n<br>
    // `

    return [newC.x, newC.y]
    // return [newB.x, newB.y]
}

function pathNodeModeSynth(doit=true,drag="E1") {
    if (!nodeMode) return

    // const nodeE1 = synthPoints.find(n => n.id === "E1")
    // if (nodeE1.type === "crunode") pathCrunodeSynth(true)
    // else if (nodeE1.type === "cusp") pathCuspSynth(true)

    setLinkPoints()

    const pointA = getPoint("A")
    const pointB = getPoint("B")
    const pointC = getPoint("C")
    const pointD = getPoint("D")
    const pointE = getPoint("BC")

    const pointE1 = getPoint("E1")
    const pointE2 = getPoint("E2")
    const pointE3 = getPoint("E3")

    // const AE1 = getDistBtwPoints(pointA,pointE1)
    // const AE2 = getDistBtwPoints(pointA,pointE2)
    // const AB = getDistBtwPoints(pointA,pointB)
    // let BE = getDistBtwPoints(pointB,pointE)

    // const DE1 = getDistBtwPoints(pointD,pointE1)
    // const DE2 = getDistBtwPoints(pointD,pointE2)
    // const DC = getDistBtwPoints(pointD,pointC)
    // let CE = getDistBtwPoints(pointC,pointE)

    const dragPoint = drag[0] === "E" ? synthPoints.find(p=>p.id === drag) : getPoint(drag)
    
    // const distE2A = getDistBtwPoints(drag[0] === "E" ? dragPoint : pointE2,pointA)
    // const distE2D = getDistBtwPoints(drag[0] === "E" ? dragPoint : pointE2,pointD)
    // const distE2A = getDistBtwPoints(pointE2,pointA)
    // const distE2D = getDistBtwPoints(pointE2,pointD)

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
        const angleFixed = angle_e12
        const moveFixed = AE2 > DE2 ? pointA : pointD
        placePointPolar(moveFixed, kF_center, angleFixed, kF_rad, (pointE1.type === "cusp" && pointE2.type === "cusp"))

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

    const overAD = (angleE1_E2 > angleE1_A && angleE2_E1 > angleD_E1) || (angleE1_E2 < angleE1_A && angleE2_E1 < angleD_E1)

    // document.getElementById("debugOutputs").innerHTML = `
    //     AE2>DE2: ${AE2>DE2} \n<br>
    //     overAD: ${overAD} \n<br>
    // `
    // Determine whether to place B & C to new locations
    let placeC = drag !== "C" && (drag === "B" || (AE2 > DE2 && pointE2.type !== "cusp") || (AE2 < DE2 && pointE2.type === "cusp"))// || (pointE2.type === "cusp"))
    if (pointE1.type === "cusp" && pointE2.type === "cusp"){
        placeC = AE2 > DE2 ? true : false
    } 
    // const placeB = !placeC || pointE2.type === "cusp"

    document.getElementById("debugOutputs").innerHTML = `${placeC}`
    
    if (placeC){
        const dragAngle = getAngleBtwPoints(pointA, pointB, pointE1)

        // if E1 is cusp, snap B to AE1 line
        if (pointE1.type === "cusp" || pointE2.type === "cusp"){ 
            let new_angleE1B = angleE1B
            let newBE = BE
            if (pointE1.type === "cusp") {
                new_angleE1B = angleE1A
                if (dragAngle > 90) new_angleE1B = new_angleE1B + 180
            }
            if (pointE2.type === "cusp"){
                if (pointE1.type === "cusp" && pointE2.type === "cusp") {
                    newBE = BE
                }
                else if (overAD) {
                    newBE = Math.abs((AE2*AE2 - AE1*AE1)/(2*AE1*Math.cos(degToRad(getAngleBtwPoints(pointA, pointB, pointE1))) + 2*AE2))
                } else {
                    newBE = (AE1*AE1 - AE2*AE2)/(2*AE1*Math.cos(degToRad(getAngleBtwPoints(pointA, pointB, pointE1))) - 2*AE2)
                }
            }
            placePointPolar(pointB, pointE1, new_angleE1B, newBE, true)
            setLinkPoints()
            updateTPoints()
            updateInputLimits()
            updateOutputLimits()
        }
        // Add E2 cusp to this ^
            // if E1 cusp, then calc new angle
            // If E2 cusp, then calc new dist
            // Execute placePoint if E1 or E2 are cusps

        const angleAE1B = getAngleBtwPoints(pointA, pointB, pointE1)
        const angleE1C = getJointsAngle(pointE1, pointC, false)
        let new_angleE1C = getNetAngle(angleE1D - angleAE1B)
        if (dragAngle > 90 && pointE1.type === "cusp") new_angleE1C = new_angleE1C + 180

        let newCE = CE
        if (synthPointCount > 1){// && pointE2.type !== "cusp") {
            if (overAD) {
                if (pointE2.type === "cusp") {
                    newCE = (DE1*DE1 - DE2*DE2)/((((AE1*AE1 - AE2*AE2)/(2*BE*AE1))-(AE2/AE1)-(DE2/DE1))*2*DE1)
                }
                else {
                    newCE = (DE1*DE1 - DE2*DE2)/(((BE*BE + AE1*AE1 - AB*AB)*DE1/(BE*AE1))+((BE*BE + AE2*AE2 - AB*AB)*DE2/(BE*AE2)))
                }
            } else {
                if (pointE2.type === "cusp") {
                    newCE = (DE1*DE1 - DE2*DE2)/((((AE1*AE1 - AE2*AE2)/(2*BE*AE1))+(AE2/AE1)-(DE2/DE1))*2*DE1)
                }
                else {
                    newCE = (DE1*DE1 - DE2*DE2)/(((BE*BE + AE1*AE1 - AB*AB)*DE1/(BE*AE1))-((BE*BE + AE2*AE2 - AB*AB)*DE2/(BE*AE2)))
                }
            }
        }

        // document.getElementById("debugOutputs").innerHTML = `
        //         newCE: ${newCE.toFixed(1)} \n<br>
        //         new_angleE1C: ${new_angleE1C.toFixed(1)} \n<br>
        //         overAD: ${overAD} \n<br>
        //         E2: ${pointE2.type} \n<br>
        //         AE2>DE2: ${AE2>DE2} \n<br>
        //     `

        placePointPolar(pointC, pointE1, new_angleE1C, newCE, true)

    }
    else {
        const dragAngle = getAngleBtwPoints(pointD, pointC, pointE1)

        // if E1 is cusp, snap C to DE1 line
        if (pointE1.type === "cusp" || pointE2.type === "cusp"){ 
            let new_angleE1C = angleE1C
            let newCE = CE 
            if (pointE1.type === "cusp"){
                new_angleE1C = angleE1D
                if (dragAngle > 90) new_angleE1C = new_angleE1C + 180
            }
            if (pointE2.type === "cusp"){
                if (pointE1.type === "cusp" && pointE2.type === "cusp") {
                    newCE = CE
                }
                else if (overAD) {
                    newCE = Math.abs((DE2*DE2 - DE1*DE1)/(2*DE1*Math.cos(degToRad(getAngleBtwPoints(pointD, pointC, pointE1))) + 2*DE2))
                } else {
                    newCE = (DE1*DE1 - DE2*DE2)/(2*DE1*Math.cos(degToRad(getAngleBtwPoints(pointD, pointC, pointE1))) - 2*DE2)
                } 
            }
            placePointPolar(pointC, pointE1, new_angleE1C, newCE, true)
            setLinkPoints()
            updateTPoints()
            updateInputLimits()
            updateOutputLimits()
        }

        const angleDE1C = getAngleBtwPoints(pointD, pointC, pointE1)
        const angleE1B = getJointsAngle(pointE1, pointB, false)
        let new_angleE1B = getNetAngle(angleE1A - angleDE1C)
        if (dragAngle > 90 && pointE1.type === "cusp") new_angleE1B = new_angleE1B + 180

        let newBE = BE
        if (synthPointCount > 1){// && pointE2.type !== "cusp") {
            if (overAD) {
                if (pointE2.type === "cusp") {
                    newBE = (AE1*AE1 - AE2*AE2)/((((DE1*DE1 - DE2*DE2)/(2*CE*DE1))-(DE2/DE1)-(AE2/AE1))*2*AE1)
                }
                else {
                    newBE = (AE1*AE1 - AE2*AE2)/(((CE*CE + DE1*DE1 - DC*DC)*AE1/(CE*DE1))+((CE*CE + DE2*DE2 - DC*DC)*AE2/(CE*DE2)))
                }
            } else {
                if (pointE2.type === "cusp") {
                    newBE = (AE1*AE1 - AE2*AE2)/((((DE1*DE1 - DE2*DE2)/(2*CE*DE1))+(DE2/DE1)-(AE2/AE1))*2*AE1)
                }
                else {
                    newBE = (AE1*AE1 - AE2*AE2)/(((CE*CE + DE1*DE1 - DC*DC)*AE1/(CE*DE1))-((CE*CE + DE2*DE2 - DC*DC)*AE2/(CE*DE2)))
                }
            }
            // document.getElementById("debugOutputs").innerHTML = `
            //     newBE: ${newBE.toFixed(1)} \n<br>
            //     new_angleE1B: ${new_angleE1B.toFixed(1)} \n<br>
            //     overAD: ${overAD} \n<br>
            //     E2: ${pointE2.type} \n<br>
            //     AE2>DE2: ${AE2>DE2} \n<br>
            // `
        }

        placePointPolar(pointB, pointE1, new_angleE1B, newBE, true)
        

    }

    setLinkPoints()
    updateTPoints()
    updateInputLimits()
    updateOutputLimits()

    synthModeOpen = linkageOpen
    synthPoints[0].inAng = inputAngle
    synthPoints[0].isOpen = linkageOpen


    const check_AE1B = getAngleBtwPoints(pointA,pointB,pointE)
    const check_DE1C = getAngleBtwPoints(pointD,pointC,pointE)
    const check_AE2B = getAngleBtwPoints(pointA,pointB,pointE2)
    const check_DE2C = getAngleBtwPoints(pointD,pointC,pointE2)

    // document.getElementById("debugOutputs").innerHTML = `
    //     AEB: ${check_AE1B.toFixed(1)} \n<br>
    //     DEC: ${check_DE1C.toFixed(1)} \n<br>
    // `

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

function pathCuspSynth(doit=true) {
    // if (!nodeMode) return

    setLinkPoints()

    const nodeE = synthPoints[0]
    const nodeE2 = synthPoints[1]
    const nodeA = getPoint("A")
    const nodeB = getPoint("B")
    const nodeC = getPoint("C")
    const nodeD = getPoint("D")

    let midAD = getMidPoint(nodeA,nodeD)
    let radAD = getDistBtwPoints(nodeA,nodeD)/2

    let inputLength = linkToCoord(getLinkByType("input").len, "dist")
    const outputLength = linkToCoord(getLinkByType("output").len, "dist")

    let angleAE = getJointsAngle(nodeA, nodeE)// - 180*(Math.floor(synthSolution/2))

    const inputAng = getJointsAngle(nodeB, nodeA)
    if (Math.abs(angleAE-inputAng) < 90) angleAE = angleAE - 180


    if (synthPointCount === 2) {
        // const nodeE2 = synthPoints[1]
        update_kFCircle()
        const kFCenter = {x: kFCirc[0], y: kFCirc[1]}
        const kFRad = kFCirc[2]/2

        kFCircle
            .attr("cx", kFCirc[0])
            .attr("cy", kFCirc[1])
            .attr("r", kFCirc[2]/2)

        const e12 = getMidPoint(nodeE, nodeE2)
        const angleE1E2 = getJointsAngle(nodeE, nodeE2)
        const angle_e12 = angleE1E2 + 90

        let dist_e12 = kFRad + getDistBtwPoints(e12, kFCenter)

        let D_new = placePointPolar(nodeD, e12, angle_e12, dist_e12, false)

        if (getDistBtwPoints(kFCenter,D_new) - kFRad > 0.0001) {
            dist_e12 = kFRad - getDistBtwPoints(e12, kFCenter)
            D_new = placePointPolar(nodeD, e12, angle_e12, dist_e12, false)
        }
        nodeD.x = D_new.x
        nodeD.y = D_new.y

        setLinkPoints()

        midAD = getMidPoint(nodeA,nodeD)
        radAD = getDistBtwPoints(nodeA,nodeD)/2

        inputLength = 2*radAD * Math.cos(degToRad(coordToLink(getJointsAngle(nodeA, nodeE),"angle")))
        let B_new = placePointPolar(nodeB, nodeA, angleAE, inputLength, false)
        if (getDistBtwPoints(midAD,B_new)-radAD > 0.0001) {
            inputLength = -inputLength
        }
    }

    placePointPolar(nodeB, nodeA, angleAE, inputLength, doit)

    let angleDE = getJointsAngle(nodeD, nodeE)// - 180*synthSolution
    const outputAng = getJointsAngle(nodeC, nodeD)
    if (Math.abs(angleDE-outputAng) < 90) angleDE = angleDE - 180

    placePointPolar(nodeC, nodeD, angleDE, outputLength, doit)

    setLinkPoints()
    updateTPoints()
    updateInputLimits()
    updateOutputLimits()

    synthModeOpen = linkageOpen

    synthPoints[0].inAng = inputAngle
    synthPoints[0].isOpen = linkageOpen
    
    if (synthPointCount === 2) {
        let angleAE2 = getJointsAngle(nodeA, nodeE2)

        let B_new = placePointPolar(nodeB, nodeA, angleAE2, inputLength, false)
        if (getDistBtwPoints(midAD,B_new)-radAD > 0.0001) {
            angleAE2 = angleAE2 + 180
        }

        synthPoints[1].inAng = coordToLink(angleAE2,"angle")
        synthPoints[1].isOpen = linkageOpen
    }
}

function snapToSynthPoint(point="E1") {
    const synthPoint = synthPoints.find(p=>p.id === point)
    const couplerPoint = getPoint("BC")

    let inverted = false

    if (synthPoint.inAng > inputLimits.max || synthPoint.inAng < inputLimits.min) {
        invertLinkage()
        inverted = true
    }
    linkageOpen = synthPoint.isOpen
    doActuate(getNetAngle(linkToCoord(synthPoint.inAng,"angle")))

    if (Math.abs(couplerPoint.x-synthPoint.x) > limitThreshold || Math.abs(couplerPoint.y-synthPoint.y) > limitThreshold) {
        toggleOpenCrossed()
    }

    return inverted
}