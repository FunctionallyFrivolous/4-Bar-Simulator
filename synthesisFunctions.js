
function swapInputOutput() {
    const nodeA = getJoint("A")
    const nodeB = getJoint("B")
    const nodeAB = getJoint("AB")
    const nodeD = getJoint("D")
    const nodeC = getJoint("C")
    const nodeDC = getJoint("DC")

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
    const nodeA = getJoint("A")
    const nodeB = getJoint("B")
    const nodeD = getJoint("D")
    const nodeC = getJoint("C")

    const distAB = getDistBtwPoints(nodeB, nodeA)
    const distDC = getDistBtwPoints(nodeD, nodeC)

    const angleAB = coordToLink(getJointsAngle(nodeA, nodeB),"angle")
    const angleDC = coordToLink(getJointsAngle(nodeD, nodeC),"angle")

    placePointPolar(nodeB, nodeA, linkToCoord(-angleAB, "angle"), distAB, true)
    placePointPolar(nodeC, nodeD, linkToCoord(-angleDC, "angle"), distDC, true)

    setLinkPoints()
    tPointFollow()
    updateOpenCrossed()
    updateInputLimits()
    updateOutputLimits()
}

function cycleCognates() {
    const nodeA = getJoint("A")
    const nodeB = getJoint("B")
    const nodeC = getJoint("C")
    const nodeD = getJoint("D")
    const nodeE = getJoint("BC")
    
    // Get new D node
    const nodeD0 = cognateData.find(g => g.id === "D0")
    nodeD0.x = nodeA.x
    nodeD0.y = nodeA.y

    // Get new A node
    const distBC = getDistBtwPoints(getJoint("B"), getJoint("C"))
    const distBE = getDistBtwPoints(getJoint("B"), getJoint("BC"))
    const distAD = getDistBtwPoints(getJoint("A"), getJoint("D"))

    const distA0D0 = distBE/distBC * distAD
    const angDAA0 = getAngleBtwPoints(getJoint("BC"), getJoint("C"), getJoint("B"))
    const angAD = getJointsAngle(nodeA,nodeD,true)
    const nodeA0 = cognateData.find(g => g.id === "A0")
    placePointPolar(nodeA0, nodeA, (angDAA0+angAD), distA0D0, true)

    // Get new C node
    const angD0C0 = getJointsAngle(getJoint("B"), getJoint("BC"), false)
    const distD0C0 = getDistBtwPoints(getJoint("B"), getJoint("BC"))
    const nodeC0 = cognateData.find(g => g.id === "C0")
    placePointPolar(nodeC0, nodeA, angD0C0, distD0C0, true)

    // Get new B node
    const angEC0B0 = getAngleBtwPoints(getJoint("BC"), getJoint("C"), getJoint("B"))
    const distC0E = getDistBtwPoints(nodeC0, getJoint("BC"))
    const distC0B0 = distBE/distBC * distC0E
    const angC0E0 = getJointsAngle(nodeC0, getJoint("BC"), false)
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
    if (synthSolution === 13) synthSolution = 1

    getLinkByType("coupler").tSnap = false

    const nodeA = getJoint("A")
    const nodeB = getJoint("B")
    const nodeD = getJoint("D")
    const nodeE = getJoint("BC")

    const oldC = getJoint("C")

    let EC = getDistBtwPoints(nodeE, oldC)

    const angleAEB = getAngleBtwPoints(nodeA, nodeB, nodeE)
    const angleED = getJointsAngle(nodeE, nodeD, false)
    let angleEC = getNetAngle(angleED - angleAEB)

    // if (cDrag) {
        const old_angleEC = getJointsAngle(nodeE, oldC, false)

        if (Math.abs(old_angleEC+180-angleEC) < Math.abs(old_angleEC-angleEC)) {
            angleEC = angleEC - 180 
        }
    // }

    const newC = placePointPolar(oldC, nodeE, angleEC, EC, doit)

    setLinkPoints()
    updateTPoints()
    updateInputLimits()
    updateOutputLimits()

    synthModeOpen = linkageOpen
    synthPoints[0].inAng = inputAngle
    synthPoints[0].isOpen = linkageOpen
    // synthPoints[0].x = nodeE.x
    // synthPoints[0].y = nodeE.y

    return [newC.x, newC.y]

}

function pathNodeModeSynth(doit=true) {
    if (!nodeMode) return

    const nodeE1 = synthPoints.find(n => n.id === "E1")
    if (nodeE1.type === "crunode") pathCrunodeSynth(true)
    else if (nodeE1.type === "cusp") pathCuspSynth(true)
}

function mirrorNodeSynth(doit=true) {
    const nodeA = getJoint("A")
    const nodeE = getJoint("BC")
    const nodeB = getJoint("B")

    const nodeC = getJoint("C")
    const nodeD = getJoint("D")

    const EB = getDistBtwPoints(nodeE,nodeB)
    let angleAEB = getAngleBtwPoints(nodeA, nodeB, nodeE)
    // if (angleAEB > 180) angleAEB = 360-angleAEB
    const angleEA = getJointsAngle(nodeE,nodeA)
    const old_angleEB = getJointsAngle(nodeE,nodeB)
    const new_angleEB = angleEA + angleAEB

    placePointPolar(nodeB, nodeE, new_angleEB, EB, doit)

    const EC = getDistBtwPoints(nodeE,nodeC)
    const angleDEC = getAngleBtwPoints(nodeD, nodeC, nodeE)
    const angleED = getJointsAngle(nodeE,nodeD)
    const old_angleEC = getJointsAngle(nodeE,nodeC)
    const new_angleEC = angleED + angleDEC

    placePointPolar(nodeC, nodeE, new_angleEC, EC, doit)

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
    const nodeA = getJoint("A")
    const nodeB = getJoint("B")
    const nodeC = getJoint("C")
    const nodeD = getJoint("D")

    let midAD = getMidPoint(nodeA,nodeD)
    let radAD = getDistBtwPoints(nodeA,nodeD)/2

    let inputLength = linkToCoord(getLinkByType("input").len, "dist")
    const outputLength = linkToCoord(getLinkByType("output").len, "dist")

    let angleAE = getJointsAngle(nodeA, nodeE)// - 180*(Math.floor(synthSolution/2))

    const inputAng = getJointsAngle(nodeB, nodeA)
    if (Math.abs(angleAE-inputAng) < 90) angleAE = angleAE - 180


    if (synthPointCount === 2) {
        // const nodeE2 = synthPoints[1]
        const kFCirc = getCircle3Points(nodeA, nodeE, nodeE2)
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
    const couplerPoint = getJoint("BC")

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