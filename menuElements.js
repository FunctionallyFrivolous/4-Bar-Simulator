const buttonHeight = 30;
const buttonMargin = 5

toggleConfigButton
    .attr("x", buttonMargin*3 + buttonHeight*2)
    .attr("y", windowHeight-35)
    .attr("width", 100)
    .attr("height", buttonHeight)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "lightgray")
    .attr("fill-opacity", 0.75)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.75)
    .on("click", function() {
        toggleOpenCrossed()
    })
toggleConfigIcon
    .attr("x", buttonMargin*3 + buttonHeight*2+100/2)
    .attr("y", windowHeight-+buttonHeight/2-buttonMargin)
    .attr("font-size", "8pt")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .text("Open ⇋ Crossed")

toggleCrossoverButton
    .attr("x", buttonMargin*4 + buttonHeight*2+100)
    .attr("y", windowHeight-35)
    .attr("width", 70)
    .attr("height", buttonHeight)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "lightgray")
    .attr("fill-opacity", 0.25)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.25)
    .on("click", function() {
        if (inputClass === "Crank") return
        allowCrossover = !allowCrossover
        updateTrace()
        updateLinkGeometry()
        // toggleCrossoverButton
        //     .append("title")
        //     .text(allowCrossover ? "Disabel Crossover" : "Enable Crossover")
    })
toggleCrossoverIcon
    .attr("x", buttonMargin*4 + buttonHeight*2+100 + 70/2)
    .attr("y", windowHeight-+buttonHeight/2-buttonMargin)
    .attr("font-size", "8pt")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("opacity", 0.25)
    .style("pointer-events", "none")
    .text("Crossover")

darkModeButton
    .attr("x", windowWidth-buttonMargin-30)
    .attr("y", windowHeight-35)
    .attr("width", 30)
    .attr("height", buttonHeight)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "lightgray")
    .attr("fill-opacity", 0.75)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.75)
    .on("click", function() {
        darkMode = !darkMode
        toggleDarkMode()
    })

function toggleDarkMode(){
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
    updateLinkGeometry()
}

function drawDarkModeIcons(){

    const iconX = windowWidth-buttonMargin-30/2
    const iconY = windowHeight-buttonMargin-buttonHeight/2
    const iconHeight = 16
    const iconWidth = 16

    const iconTop = `
        M ${iconX-iconWidth/2} ${iconY-iconHeight/2}
        L  ${iconX+iconWidth/2} ${iconY-iconHeight/2}
        L  ${iconX+iconWidth/2} ${iconY+iconHeight/2}
        L  ${iconX-iconWidth/2} ${iconY+iconHeight/2}
        Z
    `

    const iconBottom = `
        M ${iconX+iconWidth/2} ${iconY-iconHeight/2}
        L  ${iconX+iconWidth/2} ${iconY+iconHeight/2}
        L  ${iconX-iconWidth/2} ${iconY+iconHeight/2}
        Z
    `
    return [iconTop, iconBottom]
}

darkModeIconTop
    .attr("stroke", darkColor)
    .attr("stroke-width", 1)
    .style("stroke-linecap", "round")
    .style("stroke-linejoin", "round")
    .attr("fill", bgColor)
    .attr("d", drawDarkModeIcons()[0])
    .style("pointer-events", "none")
darkModeIconBottom
    .attr("stroke", darkColor)
    .attr("stroke-width", 1)
    .style("stroke-linecap", "round")
    .style("stroke-linejoin", "round")
    .attr("fill", fgColor)
    .attr("d", drawDarkModeIcons()[1])
    .style("pointer-events", "none")

playButton
    .attr("x", buttonMargin)
    .attr("y", windowHeight-buttonMargin-buttonHeight)
    .attr("width", buttonHeight)
    .attr("height", buttonHeight)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "lightgray")
    .attr("fill-opacity", 0.75)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.75)
    .on("click", function() {
        animationActive = !animationActive

        if (animationActive) {
            startAnimationLoop();
        } else {
            stopAnimationLoop();
        }
    })

playIcon
    .attr("x", buttonHeight/2+buttonMargin)
    .attr("y", windowHeight-buttonHeight/2-buttonMargin)
    .attr("font-size", "15px")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .text("▶")

reverseButton
    .attr("x", buttonMargin*2 + buttonHeight)
    .attr("y", windowHeight-buttonMargin-buttonHeight)
    .attr("width", buttonHeight)
    .attr("height", buttonHeight)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "lightgray")
    .attr("fill-opacity", 0.75)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.75)
    .on("click", function() {
        animateDir = animateDir * -1
        reverseIcon.text(animateDir > 0 ? "⟲" : "⟳")
    })

reverseIcon
    .attr("x", buttonHeight/2 + buttonMargin*2 + buttonHeight)
    .attr("y", windowHeight-buttonHeight/2-buttonMargin)
    .attr("font-size", "18px")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .text("⟲")

cognateButton
    .attr("x", buttonMargin*5 + buttonHeight*2+100 + 70)
    .attr("y", windowHeight-buttonMargin-buttonHeight)
    .attr("width", buttonHeight)
    .attr("height", buttonHeight)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", "lightgray")
    .attr("fill-opacity", 0.75)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.75)
    .on("click", function() {
        cycleCognates()
        updateTrace()
        updateLinkGeometry()
    })
cognateIcon
    .attr("x", buttonMargin*5 + buttonHeight*2+100+70 + buttonHeight/2)
    .attr("y", windowHeight-buttonHeight/2-buttonMargin)
    .attr("font-size", "20px")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .text("♺") //♻

function startAnimationLoop() {
    playIcon.text("⏸")
    animationTimer = d3.timer(() => {
        playAnimation();
    }
);
}
function stopAnimationLoop() {
    if (animationTimer) {
        animationTimer.stop();
        animationTimer = null;
    }
    playIcon.text("▶")
}