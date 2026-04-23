
function rotateNode(node, deg, pivot, doit=true) {
    const dx = node.x - pivot.x
    const dy = node.y - pivot.y
    let dist = Math.sqrt(dx*dx + dy*dy)

    // if (node.id.length === 2) {
    //     const thisLink = getLinkByID(node.id)
    //     dist = thisLink.tLen
    // }

    const newX = pivot.x + Math.cos(degToRad(deg)) * dist
    const newY = pivot.y - Math.sin(degToRad(deg)) * dist

    if (doit) {
        node.x = newX;
        node.y = newY;
    }

    return [newX, newY]
}
function placeNodePolar(node, origin, deg, dist, doit=false) {
    const newX = origin.x + Math.cos(degToRad(deg)) * dist
    const newY = origin.y - Math.sin(degToRad(deg)) * dist

    if (doit) {
        node.x = newX
        node.y = newY
    }

    return [newX, newY]
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
    }
}

function updateTNodes(snap=false, node="") {
    for (i = 0; i < linksData.length; i++) {
        const linkID = linksData[i].id
        const tNode = getNode(linkID)
        const linkAngle = getNodesAngle(getNode("B"),getNode("C"))//getLinkAngle(linkID)
        const pNode = getNode(linkID[0])

        let tDeg = getAngleBtwNodes(tNode, getNode(linkID[1]), pNode)
        
        if (linksData[i].tSnap && node !== linkID) tDeg = linksData[i].tAng
        if (snap) {
            if (node === linkID) {
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

        const tDist = getDistBtwNodes(getNode(linkID), pNode)
        linksData[i].tLen = tDist        
    }
    // setLinkNodes()
    tNodeFollow()
    updateLinkGeometry()
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
    const totAngle = getNetAngle(nodeAngle - fromAngle)

    return totAngle
}

function getDistBtwNodes(startNode, endNode) {
    const nDist = Math.sqrt((endNode.x-startNode.x)*(endNode.x-startNode.x) + (startNode.y-endNode.y)*(startNode.y-endNode.y))

    return nDist
}

function saveNodes() {

    for (i = 0; i < nodesData.length; i++) {
        const nodeName = `node${nodesData[i].id}`

        localStorage.setItem(`${nodeName}_x`, `${nodesData[i].x.toFixed(3)}`)
        localStorage.setItem(`${nodeName}_y`, `${nodesData[i].y.toFixed(3)}`)
    }
}

function loadNodes() {

    for (i = 0; i < nodesData.length; i++) {
        const nodeName = `node${nodesData[i].id}`

        if (localStorage.getItem(`${nodeName}_x`) !== null) {
            nodesData[i].x = Number(localStorage.getItem(`${nodeName}_x`))
            nodesData[i].y = Number(localStorage.getItem(`${nodeName}_y`))
        }
    }
}