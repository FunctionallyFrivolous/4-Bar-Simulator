// Functions that manipulate nodes
    // Rotate a node about a given point
    // Reflect a node about a given line (two points)
    //

// Rotate a given node, about a given pivot point, to a given final angle
function rotateNode(node, deg, pivot) {
    const dx = node.x - pivot.x
    const dy = node.y - pivot.y
    const dist = Math.sqrt(dx*dx + dy*dy)

    const newX = pivot.x + Math.cos(degToRad(deg)) * dist
    const newY = pivot.y - Math.sin(degToRad(deg)) * dist

    return [newX, newY]
}