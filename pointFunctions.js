
function getPoint(id) {
    let joint = null
    if (id[0] === "E") joint = synthPoints.find(p => p.id === id)
    else joint = jointsData.find(j => j.id == id)
    return joint
}

function rotatePoint(joint, deg, pivot, doit=true) {
    const dx = joint.x - pivot.x
    const dy = joint.y - pivot.y
    let dist = Math.sqrt(dx*dx + dy*dy)

    // if (joint.id.length === 2) {
    //     const thisLink = getLinkByID(joint.id)
    //     dist = thisLink.tLen
    // }

    const newX = pivot.x + Math.cos(degToRad(deg)) * dist
    const newY = pivot.y - Math.sin(degToRad(deg)) * dist

    if (doit) {
        joint.x = newX;
        joint.y = newY;
    }

    return [newX, newY]
}

function placePointPolar(joint, origin, deg, dist, doit=false) {
    const newX = origin.x + Math.cos(degToRad(deg)) * dist
    const newY = origin.y - Math.sin(degToRad(deg)) * dist

    if (doit) {
        joint.x = newX
        joint.y = newY
    }

    const newjoint = {x: newX, y: newY}
    return newjoint
}

function tPointFollow() {
    for (i = 0; i < linksData.length; i++) {
        const thisLink = linksData[i]
        const linkDeg = getLinkAngle(thisLink.id)
        const pivotJoint = getPoint(thisLink.id[0])
        const tPoint = getPoint(thisLink.id)
        const newDeg = linkDeg + thisLink.tAng
        // rotatePoint(tPoint, linkDeg + thisLink.tAng, pivotJoint)

        tPoint.x = pivotJoint.x + Math.cos(degToRad(newDeg)) * thisLink.tLen
        tPoint.y = pivotJoint.y - Math.sin(degToRad(newDeg)) * thisLink.tLen
    }
}

function updateTPoints(snap=false, point="") {
    for (i = 0; i < linksData.length; i++) {
        const linkID = linksData[i].id
        const tPoint = getPoint(linkID)
        const linkAngle = getJointsAngle(getPoint("B"),getPoint("C"))//getLinkAngle(linkID)
        const pJoint = getPoint(linkID[0])

        let tDeg = getAngleBtwPoints(tPoint, getPoint(linkID[1]), pJoint)
        
        if (linksData[i].tSnap && point !== linkID) tDeg = linksData[i].tAng
        if (snap) {
            if (point === linkID) {
                if (Math.abs(tDeg) < snapAngle) {
                    tDeg = 0
                    linksData[i].tSnap = true
                } else if (Math.abs(tDeg-180) < snapAngle) {
                    tDeg = -180
                    linksData[i].tSnap = true
                } else linksData[i].tSnap = false
            } else linksData[i].tSnap = false
        }

        linksData[i].tAng = tDeg

        const tDist = getDistBtwPoints(getPoint(linkID), pJoint)
        linksData[i].tLen = tDist  
    }
    // setLinkPoints()
    tPointFollow()
    // updateLinkGeometry() 
}

function getJointsAngle(startJoint, endPoint, neg=false) {
    let jointsAngle = Math.atan2((startJoint.y-endPoint.y),(endPoint.x-startJoint.x))
    jointsAngle = getNetAngle(radToDeg(jointsAngle),neg);

    return jointsAngle;
}

function getAngleBtwnLines(line1_start, line1_end, line2_start, line2_end) {
    const line1 = getJointsAngle(line1_start, line1_end, false)
    const line2 = getJointsAngle(line2_start, line2_end, false)
    const line1_alt = getJointsAngle(line1_end, line1_start, false)
    const line2_alt = getJointsAngle(line2_end, line2_start, false)

    const tempAng1 = Math.abs(line2 - line1)
    const tempAng2 = Math.abs(line1 - line2)
    const tempAng3 = Math.abs(line2_alt - line1_alt)
    const tempAng4 = Math.abs(line1_alt - line2_alt)

    const minAng = Math.min(tempAng1, tempAng2, tempAng3, tempAng4)

    let startAng = line1
    let endAng = line2

    if (!(tempAng1 === minAng && tempAng2 === minAng)) {
        startAng = line1_alt
        endAng = line2_alt
    }

    let btwnAngle = line2-line1

    // if (endAng < startAng) {
    //     btwnAngle = 360 - btwnAngle
    // }

    return btwnAngle
}

function getAngleBtwPoints(point, from, origin) {
    const totAngle = getAngleBtwnLines(origin, from, origin, point)
    return totAngle
}

function getDistBtwPoints(startPoint, endPoint) {
    const nDist = Math.sqrt((endPoint.x-startPoint.x)*(endPoint.x-startPoint.x) + (startPoint.y-endPoint.y)*(startPoint.y-endPoint.y))
    return nDist
}

function getLinesIntersection(line1_start, line1_end, line2_start, line2_end) {

    const x1 = line1_start.x
    const y1 = line1_start.y
    const x2 = line1_end.x
    const y2 = line1_end.y
    const x3 = line2_start.x
    const y3 = line2_start.y
    const x4 = line2_end.x
    const y4 = line2_end.y

    const denom = (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4)

    if (denom === 0) return

    const point_x = ((x1*y2 - y1*x2)*(x3-x4)-(x1-x2)*(x3*y4 - y3*x4))/denom
    const point_y = ((x1*y2 - y1*x2)*(y3-y4)-(y1-y2)*(x3*y4 - y3*x4))/denom

    return [point_x, point_y]
}

function getMidPoint(startPoint, endPoint) {
    const midPoint_x = (startPoint.x + endPoint.x)/2
    const midPoint_y = (startPoint.y + endPoint.y)/2

    const midPoint = {x: midPoint_x, y: midPoint_y}

    return midPoint
}

function getFocusPoint(place=false){
    const pointA = getPoint("A")
    const pointD = getPoint("D")
    const pointB = getPoint("B")
    const pointC = getPoint("C")
    const pointE = getPoint("BC")

    const angleBCE = getJointsAngle(pointD,pointA) - getAngleBtwPoints(pointB, pointE, pointC)
    const distDF = getDistBtwPoints(pointC,pointE)/getDistBtwPoints(pointB,pointC) * getDistBtwPoints(pointA,pointD)

    const pointF = placePointPolar(focusPoint, pointD, angleBCE, distDF,place)

    return pointF
}

function getE2(place=false) {
    const pointE1 = synthPoints[0] //getPoint("BC")
    const pointE2 = synthPoints[1]
    const pointBC = getPoint("BC")
    const pointA = getPoint("A")
    const pointB = getPoint("B")
    const pointC = getPoint("C")
    const pointD = getPoint("D")
    const pointF = getFocusPoint()

    const angleBEC = getAngleBtwPoints(pointC,pointB,pointBC)
    const angleAFD = getAngleBtwPoints(pointD,pointA,pointF)

    const distDE1 = getDistBtwPoints(pointD,pointE1)

    const circADF = getCircle3Points(pointA,pointD,pointF)
    const circCenter = {x: circADF[0], y: circADF[1]}

    // const angleDE1 = getJointsAngle(pointD,pointE1)
    const angleDcirc = getJointsAngle(pointD,circCenter)
    const angle_centerDE1 = getAngleBtwPoints(pointE1,circCenter,pointD)


    const newE2 = placePointPolar(pointE2,pointD,angleDcirc,circADF[2],place)

    const angleDE2F = getAngleBtwPoints(pointF,pointD,pointE2)//newE2)
    // const angleDE2F = getAngleBtwPoints(pointD,pointE2,pointF)//newE2)
    // const angleDE2F = getAngleBtwPoints(pointF,pointE2,pointD)//newE2)
    const angleAE1D = getAngleBtwPoints(pointD,pointA,pointE1)//newE2)
    const angleAE2D = getAngleBtwPoints(pointD,pointA,pointE2)//newE2)

    // document.getElementById("debugOutputs").innerHTML = `
    //        BE1C: ${angleBEC.toFixed(1)} \n<br>
    //        AFD: ${angleAFD.toFixed(1)} \n<br>
    //        AE2D: ${angleAE2D.toFixed(1)} \n<br>
    //        AE1D: ${angleAE1D.toFixed(1)} \n<br>
    // `

    return newE2
}

function getE3(place=false) {
    const pointE1 = synthPoints[0] //getPoint("BC")
    const pointE2 = synthPoints[1]
    const pointE3 = synthPoints[2]
    const pointBC = getPoint("BC")
    const pointA = getPoint("A")
    const pointB = getPoint("B")
    const pointC = getPoint("C")
    const pointD = getPoint("D")
    const pointF = getFocusPoint()

    const angleBEC = getAngleBtwPoints(pointC,pointB,pointBC)
    const angleAFD = getAngleBtwPoints(pointD,pointA,pointF)

    const distDE1 = getDistBtwPoints(pointD,pointE1)

    const circADF = getCircle3Points(pointA,pointD,pointF)
    const circCenter = {x: circADF[0], y: circADF[1]}

    // const angleDE1 = getJointsAngle(pointD,pointE1)
    const angleDcirc = getJointsAngle(pointD,circCenter)
    const angle_centerDE1 = getAngleBtwPoints(pointE1,circCenter,pointD)


    const newE3 = placePointPolar(pointE2,pointD,angleDcirc,circADF[2],place)

    const angleAE2D = getAngleBtwPoints(pointD,pointA,pointE2)//newE2)
    const angleAE3D = getAngleBtwPoints(pointD,pointA,pointE3)//newE2)

    document.getElementById("debugOutputs").innerHTML = `
           BE1C: ${angleBEC.toFixed(1)} \n<br>
           AFD: ${angleAFD.toFixed(1)} \n<br>
           AE2D: ${angleAE2D.toFixed(1)} \n<br>
           AE3D: ${angleAE3D.toFixed(1)} \n<br>
    `

    return newE3
}

function savePoints() {
    for (i = 0; i < jointsData.length; i++) {
        const jointName = `joint${jointsData[i].id}`

        localStorage.setItem(`${jointName}_x`, `${jointsData[i].x.toFixed(3)}`)
        localStorage.setItem(`${jointName}_y`, `${jointsData[i].y.toFixed(3)}`)
    }
    for (i = 0; i < synthPoints.length; i++) {
        const pointName = `point${synthPoints[i].id}`

        localStorage.setItem(`${pointName}_x`, `${synthPoints[i].x.toFixed(3)}`)
        localStorage.setItem(`${pointName}_y`, `${synthPoints[i].y.toFixed(3)}`)
    }
}

function loadPoints() {
    for (i = 0; i < jointsData.length; i++) {
        const jointName = `joint${jointsData[i].id}`

        if (localStorage.getItem(`${jointName}_x`) !== null) {
            jointsData[i].x = Number(localStorage.getItem(`${jointName}_x`))
            jointsData[i].y = Number(localStorage.getItem(`${jointName}_y`))
        }
    }
    for (i = 0; i < synthPoints.length; i++) {
        const pointName = `point${synthPoints[i].id}`

        if (localStorage.getItem(`${pointName}_x`) !== null) {
            synthPoints[i].x = Number(localStorage.getItem(`${pointName}_x`))
            synthPoints[i].y = Number(localStorage.getItem(`${pointName}_y`))
        }
    }
}

function saveUndoPoints() {
    for (i = 0; i < jointsData.length; i++) {
        const jointName = `undoJoint${jointsData[i].id}`

        localStorage.setItem(`${jointName}_x`, `${jointsData[i].x.toFixed(3)}`)
        localStorage.setItem(`${jointName}_y`, `${jointsData[i].y.toFixed(3)}`)
    }
    for (i = 0; i < synthPoints.length; i++) {
        const pointName = `undoPoint${synthPoints[i].id}`

        localStorage.setItem(`${pointName}_x`, `${synthPoints[i].x.toFixed(3)}`)
        localStorage.setItem(`${pointName}_y`, `${synthPoints[i].y.toFixed(3)}`)
    }
    
    undoStatus = true
    undoRedoToolTip.text(undoStatus ? "Undo" : "Redo")
    undoRedoIcon.text(undoStatus ? "↶" : "↷")
}

function undoRedo() {
    
    if (undoStatus) {
        for (i = 0; i < jointsData.length; i++) {
            const jointName = `tempJoint${jointsData[i].id}`

            localStorage.setItem(`${jointName}_x`, `${jointsData[i].x.toFixed(3)}`)
            localStorage.setItem(`${jointName}_y`, `${jointsData[i].y.toFixed(3)}`)
        }
        for (i = 0; i < synthPoints.length; i++) {
            const pointName = `tempPoint${synthPoints[i].id}`

            localStorage.setItem(`${pointName}_x`, `${synthPoints[i].x.toFixed(3)}`)
            localStorage.setItem(`${pointName}_y`, `${synthPoints[i].y.toFixed(3)}`)
        }

        for (i = 0; i < jointsData.length; i++) {
            const jointName = `undoJoint${jointsData[i].id}`

            if (localStorage.getItem(`${jointName}_x`) !== null) {
                jointsData[i].x = Number(localStorage.getItem(`${jointName}_x`))
                jointsData[i].y = Number(localStorage.getItem(`${jointName}_y`))
            }
        }
        for (i = 0; i < synthPoints.length; i++) {
            const pointName = `undoPoint${synthPoints[i].id}`

            if (localStorage.getItem(`${pointName}_x`) !== null) {
                synthPoints[i].x = Number(localStorage.getItem(`${pointName}_x`))
                synthPoints[i].y = Number(localStorage.getItem(`${pointName}_y`))
            }
        }

    } else {
        for (i = 0; i < jointsData.length; i++) {
            const jointName = `tempJoint${jointsData[i].id}`

            if (localStorage.getItem(`${jointName}_x`) !== null) {
                jointsData[i].x = Number(localStorage.getItem(`${jointName}_x`))
                jointsData[i].y = Number(localStorage.getItem(`${jointName}_y`))
            }
        }
        for (i = 0; i < synthPoints.length; i++) {
            const pointName = `tempPoint${synthPoints[i].id}`

            if (localStorage.getItem(`${pointName}_x`) !== null) {
                synthPoints[i].x = Number(localStorage.getItem(`${pointName}_x`))
                synthPoints[i].y = Number(localStorage.getItem(`${pointName}_y`))
            }
        }
    }

    // synthPoints[0].x = getPoint("BC").x
    // synthPoints[0].y = getPoint("BC").y

    savePoints()
    updateTPoints()
    setLinkPoints()
    updateOpenCrossed()
    updateTrace()
    updateLinkGeometry();
    undoStatus = !undoStatus
}

function checkPointsCoincident(point1, point2){
    const coincident = Math.abs(point1.x - point2.x) < limitThreshold && Math.abs(point1.y - point2.y) < limitThreshold
    return coincident
}