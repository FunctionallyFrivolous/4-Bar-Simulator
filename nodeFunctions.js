// Functions that manipulate nodes
    // Rotate a node about a given point
    // Reflect a node about a given line (two points)
    //

// Rotate a given node, about a given pivot point, to a given final angle
function rotateNode(node, deg, pivot) {
    const dx = node.x - pivot.x
    const dy = node.y - pivot.y
    let dist = Math.sqrt(dx*dx + dy*dy)

    // if (node.id.length === 2) {
    //     const thisLink = getLinkByID(node.id)
    //     dist = thisLink.tLen
    // }

    const newX = pivot.x + Math.cos(degToRad(deg)) * dist
    const newY = pivot.y - Math.sin(degToRad(deg)) * dist

    node.x = newX;
    node.y = newY;

    // return [newX, newY]
}
function tNodeFollow() {
    for (i = 0; i < linksData.length; i++) {
        const thisLink = linksData[i]
        const linkDeg = getLinkAngle(thisLink.id)
        const pivotNode = getNode(thisLink.id[0])
        const tNode = getNode(thisLink.id)
        const newDeg = linkDeg + thisLink.tAng
        // rotateNode(tNode, linkDeg + thisLink.tAng, pivotNode)

        tNode.x = pivotNode.x + Math.cos(degToRad(newDeg)) * thisLink.tLen
        tNode.y = pivotNode.y - Math.sin(degToRad(newDeg)) * thisLink.tLen
        // document.getElementById("debugOutputs").innerHTML = `${thisLink.tLen.toFixed(1)}, ${thisLink.tAng.toFixed(1)}`
    }
}

function updateTNodes() {
    for (i = 0; i < linksData.length; i++) {
        const linkID = linksData[i].id
        const tNode = getNode(linkID)
        // const linkAngle = getLinkAngle(linkID)
        const pNode = getNode(linkID[0])

        const tDeg = getAngleBtwNodes(tNode, getNode(linkID[1]), pNode)
        linksData[i].tAng = tDeg

        const tDist = getDistBtwNodes(getNode(linkID), pNode)
        linksData[i].tLen = tDist        
    }
}

function getNodesAngle(startNode, endNode, neg=false) {
    let nodesAngle = Math.atan2((startNode.y-endNode.y),(endNode.x-startNode.x))
    nodesAngle = getNetAngle(radToDeg(nodesAngle),neg);

    return nodesAngle;
}
function getNode(id) {
    const node = nodesData.find(j => j.id == id)
    return node
}

function getAngleBtwNodes(node, from, origin) {
    const fromAngle = getNodesAngle(origin, from)
    const nodeAngle = getNodesAngle(origin, node)
    const totAngle = nodeAngle - fromAngle

    return totAngle
}

function getDistBtwNodes(startNode, endNode) {
    const nDist = Math.sqrt((endNode.x-startNode.x)*(endNode.x-startNode.x) + (startNode.y-endNode.y)*(startNode.y-endNode.y))

    return nDist
}