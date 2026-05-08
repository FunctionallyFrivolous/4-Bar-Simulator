
function getCircle3Points(point1, point2, point3) {
    const x1 = point1.x
    const y1 = point1.y
    const x2 = point2.x
    const y2 = point2.y
    const x3 = point3.x
    const y3 = point3.y

    const a = getDistBtwNodes(point1, point2)
    const b = getDistBtwNodes(point2, point3)
    const c = getDistBtwNodes(point3, point1)

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