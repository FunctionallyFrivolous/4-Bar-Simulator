
function cycleCognates() {
    const nodeA = getNode("A")
    const nodeB = getNode("B")
    const nodeC = getNode("C")
    const nodeD = getNode("D")
    const nodeE = getNode("BC")
    
    // Get new D node
    const nodeD0 = cognateData.find(g => g.id === "D0")
    nodeD0.x = nodeA.x
    nodeD0.y = nodeA.y

    // Get new A node
    const distBC = getDistBtwNodes(getNode("B"), getNode("C"))
    const distBE = getDistBtwNodes(getNode("B"), getNode("BC"))
    const distAD = getDistBtwNodes(getNode("A"), getNode("D"))

    const distA0D0 = distBE/distBC * distAD
    const angDAA0 = getAngleBtwNodes(getNode("BC"), getNode("C"), getNode("B"))
    const angAD = getNodesAngle(nodeA,nodeD,true)
    const nodeA0 = cognateData.find(g => g.id === "A0")
    placeNodePolar(nodeA0, nodeA, (angDAA0+angAD), distA0D0, true)

    // Get new C node
    const angD0C0 = getNodesAngle(getNode("B"), getNode("BC"), false)
    const distD0C0 = getDistBtwNodes(getNode("B"), getNode("BC"))
    const nodeC0 = cognateData.find(g => g.id === "C0")
    placeNodePolar(nodeC0, nodeA, angD0C0, distD0C0, true)

    // Get new B node
    const angEC0B0 = getAngleBtwNodes(getNode("BC"), getNode("C"), getNode("B"))
    const distC0E = getDistBtwNodes(nodeC0, getNode("BC"))
    const distC0B0 = distBE/distBC * distC0E
    const angC0E0 = getNodesAngle(nodeC0, getNode("BC"), false)
    const nodeB0 = cognateData.find(g => g.id === "B0")
    placeNodePolar(nodeB0, nodeC0, angEC0B0 + angC0E0, distC0B0, true)

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

    updateTNodes(false, "BC")
    setLinkNodes()
    tNodeFollow()
}

function pathNodeSynth(doit=false) {
    if (!nodeMode) return

    getLinkByType("coupler").tSnap = false

    const nodeA = getNode("A")
    const nodeB = getNode("B")
    const nodeD = getNode("D")
    const nodeE = getNode("BC")

    const oldC = getNode("C")

    const EC = getDistBtwNodes(nodeE, oldC)

    const angleAEB = getAngleBtwNodes(nodeA, nodeB, nodeE)
    const angleED = getNodesAngle(nodeE, nodeD, false)
    let angleEC = getNetAngle(angleED - angleAEB - 180*nodeIncr)

    const newC = placeNodePolar(oldC, nodeE, angleEC, EC, doit)

    setLinkNodes()
    updateTNodes()
    updateInputLimits()
    updateOutputLimits()

    return [newC[0], newC[1]]

}