
function getLinkNodes(link) {
    const getNodes = []
    getNodes[0] = getNode(link[0])
    getNodes[1] = getNode(link[1])
    getNodes[2] = getNode(link)

    return getNodes
}

function setLinkNodes() {

    for (i=0; i<linksData.length; i++) {
        const link_id = linksData[i].id
        const [sNode, eNode, cNode] = getLinkNodes(link_id)

        linksData[i].points = []

        linksData[i].points[0] = {x: sNode.x, y: sNode.y}
        linksData[i].points[1] = {x: eNode.x, y: eNode.y}
        if (linksData[i].ternary) linksData[i].points[2] = {x: cNode.x, y: cNode.y};
        if (sNode.ground && eNode.ground) linksData[i].type = "fixed"
        linksData[i].len = getLinkLength(linksData[i].id)
    }

    const inLink = getLinkByType("input").id
    const outLink = getLinkByType("output").id
    const fixLink = getLinkByType("fixed").id

    inputAngle = getNetAngle(coordToLink(getLinkAngle(inLink), "angle"))
    outputAngle = coordToLink(getLinkAngle(outLink), "angle")
    baseAngle = getLinkAngle(fixLink)

}

function getLinkAngle(link) {
    const linkAngle = getNodesAngle(getNode(link[0]), getNode(link[1]), true)
    return linkAngle;
}
function setLinkAngle(link, deg) {
    const thisLink = getLinkByID(link)
    const linkNodes = getLinkNodes(link)
    const pivotNode = getNode(link[0])

    for (i = 0; i < linkNodes.length; i++) {
        const mobileNode = linkNodes[i]
        if (mobileNode.id.length === 1) {
            rotateNode(mobileNode, deg, pivotNode)
        }
    }
}

function getLinkLength(link) {
    const thisLink = getLinkByID(link)
    const node0_x = thisLink.points[0].x;
    const node0_y = thisLink.points[0].y*1;
    const node1_x = thisLink.points[1].x*1;
    const node1_y = thisLink.points[1].y*1;

    const link_len = Math.sqrt((node0_x-node1_x)*((node0_x-node1_x))+(node0_y-node1_y)*(node0_y-node1_y))/coordScale

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
