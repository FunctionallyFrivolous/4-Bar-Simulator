
function toggleDarkMode(){
    const dMode = localStorage.getItem("darkMode") === "true" ? true : false
    darkMode = dMode
    bgColor = darkMode ? darkColor : lightColor
    fgColor = darkMode ? lightColor : darkColor
    whtnColor = darkMode ? 0.25 : 0
    background.attr("fill", bgColor)
    darkModeIconTop.attr("fill", bgColor)
    darkModeIconBottom.attr("fill", fgColor)
    nodeDrag.attr("fill", darkMode ? "white" : "black")
    document.body.style.backgroundColor = bgColor
    document.getElementById("pageLab").style.color = fgColor
    document.getElementById("topView").style.border = `1px solid ${fgColor}`
}

function updateToolTips() {
    linkLinesToolTip
        .text(d => `${d.type} link (L = ${d.len.toFixed(1)})`)
    nodeDragToolTip
        .text(d => `(${d.x.toFixed(1)}, ${d.y.toFixed(1)})`)
}

function fitView(dur=0) {
    const midCoord_x = (minCoord_x + maxCoord_x)/2
    const midCoord_y = (minCoord_y + maxCoord_y)/2

    const centerScale = Math.min(windowWidth/(maxCoord_x-minCoord_x)*0.85,windowHeight/(maxCoord_y-minCoord_y)*0.7)

    svg.transition().duration(dur).call(zoom.transform, d3.zoomIdentity
        .translate(windowWidth/2, windowHeight/2)
        .scale(centerScale)
        .translate(-midCoord_x, -midCoord_y+20)
    );

    localStorage.setItem("trans_x", `${Math.max(0,currentZoomTransform.x)}`)
    localStorage.setItem("trans_y", `${Math.max(0,currentZoomTransform.y)}`)
    localStorage.setItem("scale", `${Math.max(0,currentZoomTransform.k)}`)

    // updateLinkGeometry()

    // fitViewButton
    //     .attr("fill-opacity", 0.125)
    //     .attr("stroke-opacity", 0.75)
}