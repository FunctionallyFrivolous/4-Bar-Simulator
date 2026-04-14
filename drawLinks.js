
const linksData = [
    {id: "AD", points: [], len: 10, color: "indigo", type: "fixed", ternary: false, tAng: 10, tLen: 10, visible: true},
    {id: "BC", points: [], len: 12, color: "darkgreen", type: "coupler", ternary: true, tAng: 10, tLen: 10, visible: true},
    {id: "DC", points: [], len: 8, color: "darkblue", type: "output", ternary: false, tAng: 10, tLen: 10, visible: true},
    {id: "AB", points: [], len: 5, color: "darkred", type: "input", ternary: false, tAng: 10, tLen: 10, visible: true},
];
// To do (here):
    // Calc angle of output link (given link lengths above)
        // Calc node C coords from this. Apply this to the nodesData
    // Calc initial ternary node points
        // This is a one-off action
            // But relies on function that will be frequently repeated: transform node coord relative to angle of base link
            // So actually a specific call of a general function
            // Maybe do this after developing the general transform functions?
        // Keep a simple logic here for initial nodes placement. E.g. mid-link w/ constant offset
        // Short term: manually dictate node coords
const nodesData = [
    {id: "A", x: originCoords.x, y: originCoords.y, ground: true}, 
    {id: "B", x: originCoords.x, y: originCoords.y-getLinkByID("AB").len*coordScale, ground: false},  
    {id: "C", x: originCoords.x+11.7*coordScale, y: originCoords.y-7.8*coordScale, ground: false},
    {id: "D", x: originCoords.x+getLinkByID("AD").len*coordScale, y: originCoords.y, ground: true},
    {id: "AB", x: 100, y: 250, ground: false},
    {id: "BC", x: 260, y: 140, ground: false},
    {id: "DC", x: 400, y: 250, ground: false},
    {id: "AD", x: 450, y: 250, ground: false},
]

const linkLines = linkLineGroup.selectAll("polygon")
    .data(linksData)
    .enter()
    .append("polygon")
    .attr("class", "link")
    .attr("opacity", 0.5)
    .style("stroke-linecap", "round")
    .style("stroke-linejoin", "round")
    .attr("stroke-width", 25)
    // .on("dblclick", function(event, d){
    //     if(d.type !== "fixed") return
    //     d.visible = !d.visible
    //     updateLinkGeometry()
    // })
    .call(d3.drag()
        .on("start", function(event) {
            tempX = event.x
            tempY = event.y
        })
        .on("drag", function(event, d) {
            if (d.type === "input") {
                const pivotNode = getLinkNodes(d.id)[0]
                let newAngle = Math.atan2((pivotNode.y-event.y),(event.x-pivotNode.x))
                newAngle = radToDeg(newAngle)
                if(newAngle < 0) newAngle = newAngle + 360

                doActuate(newAngle)
            }
            else {
                const dx = event.x - tempX
                const dy = event.y - tempY
                for (i = 0; i < nodesData.length; i++) {
                    if (d.id.includes(nodesData[i].id)){//d.id[0] || nodesData[i].id === d.id[1]) {
                        nodesData[i].x = nodesData[i].x + dx
                        nodesData[i].y = nodesData[i].y + dy
                    } 
                }
                tempX = event.x
                tempY = event.y
                updateTNodes()
                updateLinkGeometry();
            }
        })
    )

const groundLine = groundLineGroup.selectAll("polyline")
    .data(linksData)
    .enter()
    .append("polyline")
    .attr("opacity", 1)
    .style("stroke-linecap", "round")
    .style("stroke-linejoin", "round")
    .attr("opacity", 1)
    .attr("stroke-width", 4)
    .attr("fill", "none")
    .style("display", d => d.type === "fixed" ? "block" : "none")
    .style("pointer-events", "none")

const fixedNodes = fixedNodeGroup.selectAll("circle")
    .data(nodesData)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 8.5)
    .attr("fill", d => d.ground ? fgColor : "none")

const nodeDots = nodeDotGroup.selectAll("cirlce")
    .data(nodesData)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 4.5)
    .attr("fill", bgColor)
    .style("pointer-events", "none")

const nodeDrag = nodeDragGroup.selectAll("cirlce")
    .data(nodesData)
    .enter()
    .append("circle")
    .attr("class", "ground")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 20)
    .attr("fill", fgColor)
    .attr("opacity", 0)
    .call(d3.drag()
        .on("start", function(event, d) {
            nodeDrag.attr("opacity", n => n.id === d.id ? 0.1 : 0);
        })
        .on("drag", function(event, d) {
            d.x = event.x;
            d.y = event.y
            updateTNodes()
            updateLinkGeometry();
        })
        .on("end", function() {
            nodeDrag.attr("opacity", 0)
        })
    )

// svg.selectAll(".link")
//     .on("dblclick", function(event, d) {
//         if(d.type !== "fixed") {
//             d.ternary = !d.ternary
//         } else {
//             d.visible = !d.visible
//         }
//         setLinkNodes()
//         updateLinkGeometry()
//     })

// svg.selectAll(".ground")
//     .on("dblclick", function(event, d) {
//         if(d.ground) {
//         const thisLink = getLinkByType("fixed")
//         thisLink.visible = !thisLink.visible
//         updateLinkGeometry()
//         }
//     })

svg.selectAll(".link")
  .on("pointerdown", linkDoubleTap);

svg.selectAll(".ground")
  .on("pointerdown", groundDoubleTap);

function linkDoubleTap(event, d) {
    const now = Date.now();
    if (now - lastTapTime < 300) {
        if(d.type !== "fixed") {
            d.ternary = !d.ternary
        } else {
            d.visible = !d.visible
        }
        setLinkNodes()
        updateLinkGeometry()
    }
    lastTapTime = now;
}

function groundDoubleTap(event, d) {
    const now = Date.now();
    if (now - lastTapTime < 300) {
        if(d.ground) {
        const thisLink = getLinkByType("fixed")
        thisLink.visible = !thisLink.visible
        updateLinkGeometry()
        }
    }
    lastTapTime = now;
}

// setLinkNodes()
updateTNodes()
updateLinkGeometry();