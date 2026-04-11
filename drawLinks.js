
const linksData = [
    {id: "AB", points: [], len: 5, color: "darkred", type: "input"},
    {id: "BC", points: [], len: 12, color: "darkgreen", type: "coupler"},
    {id: "DC", points: [], len: 8, color: "darkblue", type: "output"},
    {id: "AD", points: [], len: 10, color: "indigo", type: "fixed"},
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
    {id: "B", x: originCoords.x, y: originCoords.y-linksData[0].len*coordScale, ground: false},  
    {id: "C", x: originCoords.x+11.7*coordScale, y: originCoords.y-7.8*coordScale, ground: false},
    {id: "D", x: originCoords.x+linksData[3].len*coordScale, y: originCoords.y, ground: true},
    // {id: "AB_c", x: 100, y: 250, ground: false},
    // {id: "BC_c", x: 190, y: 150, ground: false},
    // {id: "CD_c", x: 400, y: 250, ground: false},
]

const linkLines = linkLineGroup.selectAll("polygon")
    .data(linksData)
    .enter()
    .append("polygon")
    .attr("opacity", 0.5)
    .style("stroke-linecap", "round")
    .style("stroke-linejoin", "round")
    .call(d3.drag()
        .on("start", function(event, d) {
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
                    if (nodesData[i].id === d.id[0] || nodesData[i].id === d.id[1]) {
                        nodesData[i].x = nodesData[i].x + dx
                        nodesData[i].y = nodesData[i].y + dy
                    } 
                }
                tempX = event.x
                tempY = event.y
                updateLinkGeometry();
            }
        })
    )

const fixedNodes = fixedNodeGroup.selectAll("circle")
    .data(nodesData)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 7)
    .attr("fill", d => d.ground ? "black" : "none")

const nodeDots = nodeDotGroup.selectAll("cirlce")
    .data(nodesData)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 4)
    .attr("fill", "white")
    .style("pointer-events", "none")

const nodeDrag = nodeDragGroup.selectAll("cirlce")
    .data(nodesData)
    .enter()
    .append("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 15)
    .attr("fill", "black")
    .attr("opacity", 0)
    .call(d3.drag()
        .on("start", function(event,d) {
            nodeDrag.attr("opacity", n => n.id === d.id ? 0.1 : 0);
        })
        .on("drag", function(event, d) {
            // if (d.id !== "A") {
                d.x = event.x;
                d.y = event.y
            // }
            updateLinkGeometry();
        })
        .on("end", function(event, d) {
            nodeDrag.attr("opacity", 0)
        })
    )

updateLinkGeometry();

function updateLinkGeometry() {
    nodeDrag
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
    fixedNodes
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
    nodeDots
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)

    setLinkNodes()

    linkLines
        .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
        .attr("stroke", d => d.type === "fixed" ? "black" : d.color)
        .attr("opacity", d => d.type === "fixed" ? 1 : 0.5)
        .attr("stroke-width", d => d.type === "fixed" ? 4 : 20)

    updateLinkageConfig()

    // document.getElementById("debugOutputs").innerHTML = 
    // `${inputClass}, 
    // min: ${inputLimits.min.toFixed(1)}, 
    // max: ${inputLimits.max.toFixed(1)}, 
    // input: ${inputAngle.toFixed(1)}, 
    // base: ${baseAngle.toFixed(1)}`
}