
function getLinkPoints(link) {
    const getJoints = []
    getJoints[0] = getPoint(link[0])
    getJoints[1] = getPoint(link[1])
    getJoints[2] = getPoint(link)

    return getJoints
}

function setLinkPoints() {

    for (i=0; i<linksData.length; i++) {
        const link_id = linksData[i].id
        const [sPoint, ePoint, tPoint] = getLinkPoints(link_id)

        linksData[i].points = []

        linksData[i].points[0] = {x: sPoint.x, y: sPoint.y}
        linksData[i].points[1] = {x: ePoint.x, y: ePoint.y}
        if (linksData[i].ternary) linksData[i].points[2] = {x: tPoint.x, y: tPoint.y};
        if (sPoint.ground && ePoint.ground) linksData[i].type = "fixed"
        linksData[i].len = getLinkLength(linksData[i].id)
    }

    const inLink = getLinkByType("input").id
    const outLink = getLinkByType("output").id
    const fixLink = getLinkByType("fixed").id

    inputAngle = getNetAngle(coordToLink(getLinkAngle(inLink), "angle"))
    outputAngle = coordToLink(getLinkAngle(outLink), "angle")
    baseAngle = getLinkAngle(fixLink)

    AB = getDistBtwPoints(getPoint("A"),getPoint("B"))
    BE = getDistBtwPoints(getPoint("B"),getPoint("BC"))
    DC = getDistBtwPoints(getPoint("D"),getPoint("C"))
    CE = getDistBtwPoints(getPoint("C"),getPoint("BC"))
    BC = getDistBtwPoints(getPoint("B"),getPoint("C"))
    AD = getDistBtwPoints(getPoint("A"),getPoint("D"))
    AE1 = getDistBtwPoints(getPoint("A"),getPoint("E1"))
    DE1 = getDistBtwPoints(getPoint("D"),getPoint("E1"))
    AE2 = getDistBtwPoints(getPoint("A"),getPoint("E2"))
    DE2 = getDistBtwPoints(getPoint("D"),getPoint("E2"))
    AE3 = getDistBtwPoints(getPoint("A"),getPoint("E3"))
    DE3 = getDistBtwPoints(getPoint("D"),getPoint("E3"))

}

function getLinkAngle(link) {
    const linkAngle = getJointsAngle(getPoint(link[0]), getPoint(link[1]), true)
    return linkAngle;
}
function setLinkAngle(link, deg) {
    const thisLink = getLinkByID(link)
    const linkPoints = getLinkPoints(link)
    const pivotPoint = getPoint(link[0])

    for (i = 0; i < linkPoints.length; i++) {
        const mobilePoint = linkPoints[i]
        if (mobilePoint.id.length === 1) {
            rotatePoint(mobilePoint, deg, pivotPoint)
        }
    }
}

function getLinkLength(link) {
    const thisLink = getLinkByID(link)
    const joint0_x = thisLink.points[0].x;
    const joint0_y = thisLink.points[0].y*1;
    const joint1_x = thisLink.points[1].x*1;
    const joint1_y = thisLink.points[1].y*1;

    const link_len = Math.sqrt((joint0_x-joint1_x)*((joint0_x-joint1_x))+(joint0_y-joint1_y)*(joint0_y-joint1_y))/coordScale

    return link_len;
}

function getLinkByType(type) {
    const link = linksData.find(j => j.type === type)
    return link
}
function getLinkByID(id) {
    const link = linksData.find(j => j.id === id)
    return link
}
