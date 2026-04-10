
const nodesData = [
    {id: "A", x: windowCenter.x-100, y: windowCenter.y+50, ground: true}, 
    {id: "B", x: windowCenter.x-40, y: windowCenter.y-50, ground: false}, 
    {id: "C", x: windowCenter.x+100, y: windowCenter.y-60, ground: false},
    {id: "D", x: windowCenter.x+110, y: windowCenter.y+50, ground: true},
]
const linksData = [
    {id: "AB", points: [], color: "darkred", fixed: false, },
    {id: "BC", points: [], color: "darkgreen", fixed: false},
    {id: "CD", points: [], color: "darkblue", fixed: false},
    {id: "DA", points: [], color: "indigo", fixed: true},
];

const linkLines = linkLineGroup.selectAll("polygon")
    .data(linksData)
    .enter()
    .append("polygon")
    // .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
    .attr("stroke", d => d.color)
    .attr("opacity", 0.5)
    .attr("stroke-width", 16)
    .style("stroke-linecap", "round")
    .style("stroke-linejoin", "round")
    .attr("fill", d => d.color)

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
    .attr("r", 3.5)
    .attr("fill", "white")
    .style("pointer-events", "none")
    // .attr("opacity", 0.5)
    // .call(d3.drag()
    //     .on("drag", function(event, d) {
    //         d.x = event.x;
    //         d.y = event.y
    //         updateNodePositions();
    //     })
    // )

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
            if (d.id !== "A") {
                d.x = event.x;
                d.y = event.y
            }
            updateLinkGeometry();
        })
        .on("end", function(event, d) {
            nodeDrag.attr("opacity", 0)
        })
    )

// actuateHandle
//     .attr("r", 10)
//     .call(d3.drag()
//         .on("drag", function(event, d) {

//         })
// )

addNode("BC",190,150)
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
        // .attr("fill", d => d.ground ? "none" : "white")
        // .attr("stroke", "black")
        // .attr("stroke-width", d => d.ground ? 1 : 0)

    for (i=0; i<4; i++) {
        const sNode = i
        let eNode = i + 1;
        if (eNode > 3) eNode = 0
        // linksData[i].id = nodesData[sNode].id + nodesData[eNode];
        linksData[i].points[0] = {x: nodesData[sNode].x, y: nodesData[sNode].y}
        linksData[i].points[1] = {x: nodesData[eNode].x, y: nodesData[eNode].y}
        linksData[i].fixed = nodesData[sNode].ground && nodesData[eNode].ground ? true : false;
    }

    linkLines
        .attr("points", d => d.points.map(j => `${j.x},${j.y}`).join(" "))
        .attr("stroke", d => d.fixed ? "black" : d.color)
        .attr("opacity", d => d.fixed ? 1 : 0.5)
        .attr("stroke-width", d => d.fixed ? 4 : 18)

    const inputMid_x = (linksData[0].points[0].x + linksData[0].points[1].x)/2;
    const inputMid_y = (linksData[0].points[0].y + linksData[0].points[1].y)/2;
    actuateHandle
        .attr("cx", inputMid_x)
        .attr("cy", inputMid_y)

}

function addNode(link,x,y) {
    const thisLink = linksData.find(j => j.id === link)
    // const oldNodeCount = linksData[1].points.length
    const oldNodeCount = thisLink.points.length

    nodesData.push({id: "y", x: x, y: y, ground: false},)

    for (i=0; i<4; i++) {
        const sNode = i
        let eNode = i + 1;
        if (eNode > nodesData.length-1) eNode = 0
        // linksData[i].id = nodesData[sNode].id + nodesData[eNode];
        thisLink.points[0] = {x: nodesData[sNode].x, y: nodesData[sNode].y}
        thisLink.points[1] = {x: nodesData[eNode].x, y: nodesData[eNode].y}
        thisLink.fixed = nodesData[sNode].ground && nodesData[eNode].ground ? true : false;
    }
    thisLink.points.push({x: x, y: y})

    updateLinkGeometry()
}

function updateInputAngle() {
    inputAngle = (linksData[0].points[1].y - linksData[0].points[0].y) / (linksData[0].points[1].x - linksData[0].points[0].x)
}