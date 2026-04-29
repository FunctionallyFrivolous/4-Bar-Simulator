
function pathNodeSynth(doit=false) {
    const nodeA = getNode("A")
    const nodeB = getNode("B")
    const nodeD = getNode("D")
    const nodeE = getNode("BC")

    const oldC = getNode("C")

    const EC = getDistBtwNodes(nodeE, oldC)

    const angleAEB = getAngleBtwNodes(nodeA, nodeB, nodeE)
    const angleED = getNodesAngle(nodeE, nodeD, false)
    let angleEC = getNetAngle(angleED - angleAEB)
    // if (angleEC > 180) angleEC = angleEC - 360


    const newC = placeNodePolar(oldC, nodeE, angleEC, EC, nodeMode)

    // document.getElementById("debugOutputs").innerHTML = `
    //     BAE: ${angleAEB.toFixed(1)} \<br>
    //     ang_ED: ${angleED.toFixed(1)} \n<br>
    //     ang_EC: ${angleEC.toFixed(1)} \n<br>
    //     ${newC[0].toFixed(1)}, ${newC[1].toFixed(1)}
    // `
    setLinkNodes()
    updateTNodes()

    return [newC[0], newC[1]]

}