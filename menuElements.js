const buttonHeight = 30;
const buttonMargin = 5

toggleConfigButton
    .attr("x", buttonMargin)
    .attr("y", windowHeight-35)
    .attr("width", 100)
    .attr("height", buttonHeight)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "lightgray")
    .attr("fill-opacity", 0.75)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .on("click", function(event, d) {
        toggleOpenCrossed()
    })
toggleConfigIcon
    .attr("x", 100/2+buttonMargin)
    .attr("y", windowHeight-+buttonHeight/2-buttonMargin)
    .attr("font-size", "9.5pt")
    .attr("font-family", "ariel")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .text("Open ⇋ Crossed")

toggleCrossoverButton
    .attr("x", buttonMargin*2+100)
    .attr("y", windowHeight-35)
    .attr("width", 70)
    .attr("height", buttonHeight)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "lightgray")
    .attr("fill-opacity", 0.75)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.5)
    .on("click", function(event, d) {
        if (inputClass === "Crank") return
        allowCrossover = !allowCrossover
        updateLinkGeometry()
    })
toggleCrossoverIcon
    .attr("x", 70/2+buttonMargin*2+100)
    .attr("y", windowHeight-+buttonHeight/2-buttonMargin)
    .attr("font-size", "9.5pt")
    .attr("font-family", "ariel")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("opacity", 0.5)
    .style("pointer-events", "none")
    .text("Crossover")