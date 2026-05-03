
function toggleDarkMode(){
    const dMode = localStorage.getItem("darkMode") === "true" ? true : false
    darkMode = dMode
    bgColor = darkMode ? darkColor : lightColor
    fgColor = darkMode ? lightColor : darkColor
    whtnColor = darkMode ? 0.25 : 0
    background.attr("fill", bgColor)
    darkModeIconTop.attr("fill", bgColor)
    darkModeIconBottom.attr("fill", fgColor)
    // darkModeIcon.text(darkMode ? "⬔" : "⬕")
    nodeDrag.attr("fill", darkMode ? "white" : "black")

    synthModeCycleIcon.attr("fill", fgColor)
    synthModeCycleButton.attr("fill", fgColor)
    reverseIcon.attr("fill", fgColor)
    crossoverIcon.attr("stroke", fgColor)

    document.body.style.backgroundColor = bgColor
    document.getElementById("pageLab").style.color = fgColor
    document.getElementById("topView").style.border = `1px solid ${fgColor}`
}

function updateToolTips() {
    linkLinesToolTip
        .text(d => `${d.type} link (L = ${d.len.toFixed(1)})`)
    nodeDragToolTip
        .text(d => `(${coordToLink(d.x,"x").toFixed(1)}, ${coordToLink(d.y,"y").toFixed(1)})`)
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

function drawOpenCrossedIcon(){

    const iconX = buttonMargin*3 + buttonHeight*2 + buttonHeight/2
    const iconY = windowHeight-buttonMargin-buttonHeight/2
    const iconHeight = 16
    const iconWidth = 16

    const iconCrossed = `
        M ${iconX-iconWidth/2} ${iconY+iconHeight/2*0.5}
        L  ${iconX-iconWidth/2} ${iconY-iconHeight/2*0.25}
        L  ${iconX} ${iconY+iconHeight/2*1.1}
        L  ${iconX+iconWidth/2} ${iconY+iconHeight/2*0.5}
    `

    const iconOpen = `
        M ${iconX-iconWidth/2} ${iconY+iconHeight/2*0.5}
        L  ${iconX-iconWidth/2} ${iconY-iconHeight/2*0.25}
        L  ${iconX+iconWidth/2*0.75} ${iconY-iconHeight/2*0.75}
        L  ${iconX+iconWidth/2} ${iconY+iconHeight/2*0.5}
    `

    const iconDiag = `
        M ${iconX-iconWidth/2} ${iconY-iconHeight/2*0.25}
        L  ${iconX+iconWidth/2} ${iconY+iconHeight/2*0.5}
    `

    return [iconCrossed, iconOpen, iconDiag]
}

function drawCrossoverIcon(x,y) {
    const w = 21 / 2;
    const ah = w*0.8;
    const vh = ah/2;

    const xOver = allowCrossover ? `` : `M ${x} ${y-vh} L ${x} ${y+vh}`
    return [
        `M ${x-w} ${y} L ${x+w} ${y} 
        M ${x-w  + ah*0.6} ${y-ah / 2} L ${x-w} ${y} L ${x-w  + ah*0.6} ${y+ah / 2} 
        M ${x+w - ah*0.6} ${y-ah / 2} L ${x+w} ${y} L ${x+w} ${y} L ${x+w - ah*0.6} ${y+ah / 2}`,
        xOver
    ].join(" ");
}