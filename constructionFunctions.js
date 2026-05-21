
function getCircle3Points(point1, point2, point3) {
    const x1 = point1.x
    const y1 = point1.y
    const x2 = point2.x
    const y2 = point2.y
    const x3 = point3.x
    const y3 = point3.y

    const a = getDistBtwPoints(point1, point2)
    const b = getDistBtwPoints(point2, point3)
    const c = getDistBtwPoints(point3, point1)

    const s = (a+b+c)/2
    const K = Math.sqrt(s*(s-a)*(s-b)*(s-c))
    
    const determ = 2*(x1*(y2-y3)+x2*(y3-y1)+x3*(y1-y2))

    if (determ === 0) return

    const center_x = ((x1*x1+y1*y1)*(y2-y3)+(x2*x2+y2*y2)*(y3-y1)+(x3*x3+y3*y3)*(y1-y2))/determ
    const center_y = ((x1*x1+y1*y1)*(x3-x2)+(x2*x2+y2*y2)*(x1-x3)+(x3*x3+y3*y3)*(x2-x1))/determ

    const diam = (a*b*c)/(2*K)

    return [center_x, center_y, diam]
}

function getCircle2Points(point1, point2) {
    const x1 = point1.x
    const y1 = point1.y
    const x2 = point2.x
    const y2 = point2.y

    const diam = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2))

    const center_x = (x1+x2)/2
    const center_y = (y1+y2)/2

    return [center_x, center_y, diam]
}

function update_kFCircle(
    p1=nodeMode ? synthPoints[0] : focusPoint,
    p2=nodeMode && synthPointCount > 1 ? synthPoints[1] : getPoint("D"),
    p3=nodeMode && synthPointCount > 2 ? synthPoints[2] : getPoint("A")){
    // const circPoint1 = nodeMode ? synthPoints[0] : focusPoint
    // const circPoint2 = nodeMode && synthPointCount > 1 ? synthPoints[1] : getPoint("D")
    // const circPoint3 = nodeMode && synthPointCount > 2 ? synthPoints[2] : getPoint("A")

    const circPoint1 = p1
    const circPoint2 = p2
    const circPoint3 = p3

    kFCirc = getCircle3Points(circPoint1,circPoint2,circPoint3)
}

function getABunchOfAngles() {
    const pointE1 = synthPoints[0] //getPoint("BC")
    const pointE2 = synthPoints[1]
    const pointBC = getPoint("BC")
    const pointA = getPoint("A")
    const pointB = getPoint("B")
    const pointC = getPoint("C")
    const pointD = getPoint("D")
    const pointF = getFocusPoint()    

    const distDE1 = getDistBtwPoints(pointD,pointE1)

    const circADF = getCircle3Points(pointA,pointD,pointF)
    const circCenter = {x: circADF[0], y: circADF[1]}

    // const angleDE1 = getJointsAngle(pointD,pointE1)
    const angleDcirc = getJointsAngle(pointD,circCenter)
    const angle_centerDE1 = getAngleBtwPoints(pointE1,circCenter,pointD)

    


    // All the AFD angles:
    const angleAFD = getAngleBtwPoints(pointD,pointA,pointF)
    const angleFDA = getAngleBtwPoints(pointA,pointF,pointD)
    const angleDAF = getAngleBtwPoints(pointF,pointD,pointA)

    // Coupler link angles:
    const angleBEC = getAngleBtwPoints(pointC,pointB,pointBC)
    const angleECB = getAngleBtwPoints(pointB,pointBC,pointC)
    const angleCBE = getAngleBtwPoints(pointBC,pointC,pointB) +360

    // All the AE1D angles
    const angleAE1D = getAngleBtwPoints(pointD,pointA,pointE1)
    const angleE1DA = getAngleBtwPoints(pointA,pointE1,pointD)
    const angleDAE1 = getAngleBtwPoints(pointE1,pointD,pointA) +360

    // All the AE2D angles:
    const angleAE2D = getAngleBtwPoints(pointD,pointA,pointE2)
    const angleE2DA = getAngleBtwPoints(pointA,pointE2,pointD)
    const angleDAE2 = getAngleBtwPoints(pointE2,pointD,pointA) +360

    // All the DE1F angles
    const angleDE1F = getAngleBtwPoints(pointF,pointD,pointE1)// This one is = DAF-180
    const angleE1FD = getAngleBtwPoints(pointD,pointE1,pointF)-360
    const angleFDE1 = getAngleBtwPoints(pointE1,pointF,pointD)+180

    // All the DE2F angles
    const angleDE2F = getAngleBtwPoints(pointF,pointD,pointE2)+360 // THIS ONE IS = DAF!!!
    const angleE2FD = getAngleBtwPoints(pointD,pointE2,pointF)
    const angleFDE2 = getAngleBtwPoints(pointE2,pointF,pointD)

    // All the AE2F angles
    const angleAE2F = -getAngleBtwPoints(pointF,pointA,pointE2) // This one = -FDA
    const angleE2FA = getAngleBtwPoints(pointA,pointE2,pointF)
    const angleFAE2 = -getAngleBtwPoints(pointE2,pointF,pointA)

    const angleBEA = getAngleBtwPoints(pointA,pointB,pointBC)
    const angleCED = getAngleBtwPoints(pointD,pointC,pointBC)


    // document.getElementById("debugOutputs").innerHTML = `
    //         AFD: ${angleAFD.toFixed(1)} \n<br>
    //         FDA: ${angleFDA.toFixed(1)} \n<br>
    //         DAF: ${angleDAF.toFixed(1)} \n<br>
    //     \n<br>
    //         BEA: ${(angleBEA).toFixed(1)} \n<br>
    //         CED: ${angleCED.toFixed(1)} \n<br>
    //         AE2D: ${angleAE2D.toFixed(1)} \n<br>
    //     `
    // AE2D: ${angleAE2D.toFixed(1)} \n<br>
    // AE2F: ${angleAE2F.toFixed(1)} \n<br>
    // DE2F: ${angleDE2F.toFixed(1)} \n<br>
    // BEC: ${angleBEC.toFixed(1)} \n<br>
    // ECB: ${angleECB.toFixed(1)} \n<br>
    // CBE: ${angleCBE.toFixed(1)} \n<br>

    // get:
        // BE1
        // AE1
        // AB
        // CE1
        // DE1
        // DC

        // BE2
        // AE2
        // CE2
        // DE2

    const AB = getDistBtwPoints(pointA,pointB)
    const DC = getDistBtwPoints(pointD,pointC)

    const AE1 = getDistBtwPoints(pointA,pointE1)
    const BE = getDistBtwPoints(pointB,pointBC)
    const CE = getDistBtwPoints(pointC,pointBC)
    const DE1 = getDistBtwPoints(pointD,pointE1)

    const AE2 = getDistBtwPoints(pointA,pointE2)
    // const BE2 = getDistBtwPoints(pointB,pointE2)
    // const CE2 = getDistBtwPoints(pointC,pointE2)
    const DE2 = getDistBtwPoints(pointD,pointE2)

    const W1 = (BE*AE1)/(CE*DE1)
    const U1 = ((CE*CE + DE1*DE1)*BE*AE1)/(CE*DE1) - AE1*AE1 - BE*BE

    const W2 = (BE*AE2)/(CE*DE2)
    const U2 = ((CE*CE + DE2*DE2)*BE*AE2)/(CE*DE2) - AE2*AE2 - BE*BE

    const DCsq = Math.abs((U2-U1)/(W1-W2))
    const newDC = Math.sqrt(DCsq)

    document.getElementById("debugOutputs").innerHTML = `
            DC: ${DC.toFixed(1)} \n<br>
            DC_calc: ${newDC.toFixed(1)} \n<br>
        `

    const cos_th = Math.cos(degToRad(angleBEA))
    const cos_law = (BE*BE + AE1*AE1 - AB*AB)/(2*BE*AE1)

    const ABsq = Math.abs((CE*CE + DE2*DE2 - DC*DC)/(CE*DE2)*BE*AE2 - AE2*AE2 - BE*BE)

    // document.getElementById("debugOutputs").innerHTML = `
    //     BE1A: ${angleBEA.toFixed(1)} \n<br>
    //     \n<br>
    //     AE2: ${AE2.toFixed(1)} \n<br>
    //     BE: ${BE.toFixed(1)} \n<br>
    //     CE: ${CE.toFixed(1)} \n<br>
    //     DE2: ${DE2.toFixed(1)} \n<br>
    //     DC: ${DC.toFixed(1)} \n<br>
    //     \n<br>
    //     AB: ${AB.toFixed(1)} \n<br>
    //     AB_calc: ${Math.sqrt(ABsq).toFixed(1)} \n<br>
    //     cos: ${cos_th.toFixed(1)} \n<br>
    //     cos_calc: ${cos_law.toFixed(1)} \n<br>
    // `
}