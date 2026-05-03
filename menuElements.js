
openCrossedButton
    .attr("x", buttonMargin*2 + buttonHeight)
    .attr("y", windowHeight-35)
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
        saveUndoNodes()
        nodeMode = false
        cuspMode = false
        synthModeCycleButton
            .style("display", "none")
        synthModeCycleIcon
            .style("display", "none")
        synthCycle = 0
        toggleOpenCrossed()
        saveNodes()
    })
const openCrossedToolTip = openCrossedButton
    .append("title")
    .text("Toggle Open / Crossed")

openCrossedIcon
    .attr("x", buttonMargin*2 + buttonHeight+buttonHeight/2)
    .attr("y", windowHeight-+buttonHeight/2-buttonMargin)
    .attr("font-size", "16pt")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    // .text("Open ⇋ Crossed") // ⇵ ⇅ ⨁ ⨂ ⨀ ○ ⦶ ⦵
// openCrossedIcon
//     .attr("stroke", "black")
//     .attr("stroke-width", 2)
//     .style("stroke-linecap", "round")
//     .style("stroke-linejoin", "round")
//     .attr("fill", "none")
//     .attr("d", drawOpenCrossedIcon()[linkageOpen ? 1 : 0])
//     .style("pointer-events", "none") 
// const OC_DiagIcon = overlayGroup.append("path")
//     .attr("stroke", "black")
//     .attr("stroke-width", 1)
//     .style("stroke-linecap", "round")
//     .style("stroke-linejoin", "round")
//     .style("stroke-dasharray", "2,2")
//     .attr("fill", "none")
//     .attr("d", drawOpenCrossedIcon()[2])
//     .style("pointer-events", "none") 


crossoverButton
    .attr("x", buttonMargin*2 + buttonHeight)
    // .attr("y", windowHeight-35)
    .attr("y", windowHeight-buttonMargin-buttonHeight*2)
    .attr("width", buttonHeight)
    .attr("height", buttonHeight)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", fgColor)
    .attr("fill-opacity", 0.0)
    // .attr("fill", "lightgray")
    // .attr("fill-opacity", 0.25)
    // .attr("stroke", "black")
    // .attr("stroke-width", 1)
    // .attr("stroke-opacity", 0.25)
    .on("click", function() {
        if (inputClass === "Crank") return
        allowCrossover = !allowCrossover
        updateTrace(false)
        updateLinkGeometry()
        crossoverToolTip
            .text(allowCrossover ? "Crossover (Enabled)" : "Crossover (Disabled)")
        localStorage.setItem("crossOver", `${allowCrossover}`)
        
    })
const crossoverToolTip = crossoverButton
    .append("title")
    .text(allowCrossover ? "Crossover (Enabled)" : "Crossover (Disabled)")

// crossoverIcon
//     .attr("x", buttonMargin*3 + buttonHeight*2 + buttonHeight/2)
//     .attr("y", windowHeight-+buttonHeight/2-buttonMargin)
//     .attr("dy", "0.03em")
//     .attr("font-size", "16pt")
//     .attr("font-family", "sans-serif")
//     .attr("font-weight", "bold")
//     .attr("text-anchor", "middle")
//     .attr("alignment-baseline", "middle")
//     // .attr("opacity", 0.25)
//     .style("pointer-events", "none")
//     // .text("Crossover") //⇎ ⇔

crossoverIcon
    .attr("stroke-width", 1.5)
    .attr("fill", "none")
    .style("stroke-linecap", "round")
    .style("pointer-events", "none")

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
        // darkMode = !darkMode
        localStorage.setItem("darkMode", `${!darkMode}`)
        toggleDarkMode()
        updateLinkGeometry()
        darkModeToolTip
            .text(darkMode ? "Switch to Light Mode" : "Switch to Dark Mode")
    })
const darkModeToolTip = darkModeButton
    .append("title")
    .text(darkMode ? "Switch to Light Mode" : "Switch to Dark Mode")

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
// darkModeIcon
//     .attr("x", windowWidth-buttonMargin-30/2)
//     .attr("y", windowHeight-buttonHeight/2-buttonMargin)
//     .attr("opacity", 0.85)
//     .attr("font-size", "18pt")
//     .attr("font-family", "sans-serif")
//     .attr("font-weight", "bold")
//     .attr("text-anchor", "middle")
//     .attr("alignment-baseline", "middle")
//     .attr("dy", "0.1em")
//     .style("pointer-events", "none")
//     // .text("⬔")

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
const playToolTip = playButton
        .append("title")
        .text("Animate Actuation")

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
    .attr("x", buttonMargin)
    .attr("y", windowHeight-buttonMargin-buttonHeight*2)
    .attr("width", buttonHeight)
    .attr("height", buttonHeight)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", fgColor)
    .attr("fill-opacity", 0.0)
    // .attr("fill", "lightgray")
    // .attr("fill-opacity", 0.75)
    // .attr("stroke", "black")
    // .attr("stroke-width", 1)
    // .attr("stroke-opacity", 0.75)
    .on("click", function() {
        animateDir = animateDir * -1
        reverseIcon.text(animateDir > 0 ? "⟲" : "⟳")
    })
const reverseToolTip = reverseButton
    .append("title")
    .text("Reverse Actuation Direction")

reverseIcon
    .attr("x", buttonHeight/2 + buttonMargin)
    .attr("y", windowHeight-buttonMargin-buttonHeight*1.75 + buttonHeight*0.75/2)
    .attr("dy", "0.075em")
    // .attr("dx", "0.02em")
    // .attr("fill", fgColor)
    .attr("font-size", "18px")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .text("⟲") //⟲

cognateButton
    .attr("x", buttonMargin*4 + buttonHeight*3)
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
        saveNodes()
        updateLinkGeometry()
        updateTrace()
        updateLinkGeometry()
    })
const cognateToolTip = cognateButton
        .append("title")
        .text("Cycle Cognates")

cognateIcon
    .attr("x", buttonMargin*4 + buttonHeight*3 + buttonHeight/2)
    .attr("y", windowHeight-buttonHeight/2-buttonMargin)
    .attr("font-size", "20px")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("dy", "0.05em")
    .style("pointer-events", "none")
    .text("♺") //♻

resetLinkageButton
    .attr("x", buttonMargin*7 + buttonHeight*6)
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
        nodeMode = false
        cuspMode = false
        synthModeCycleButton
            .style("display", "none")
        synthModeCycleIcon
            .style("display", "none")
        synthCycle = 0
        defaultLinkage()
    })
const resetToolTip = resetLinkageButton
    .append("title")
    .text("Reset to Default Linkage")

undoRedoButton
    .attr("x", windowWidth-buttonMargin-buttonHeight)
    .attr("y", windowHeight-buttonMargin*3-buttonHeight*3)
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
        // mirrorNodeSynth()
        // setLinkNodes()
        // updateTNodes()
        // updateTrace()
        // updateLinkGeometry()
        undoRedo()
        undoRedoToolTip.text(undoStatus ? "Undo" : "Redo")
        undoRedoIcon.text(undoStatus ? "↶" : "↷")
    })
const undoRedoToolTip = undoRedoButton
    .append("title")
    .text("Undo")

undoRedoIcon
    .attr("x", windowWidth-buttonMargin-buttonHeight/2)
    .attr("y", windowHeight-buttonMargin*3-buttonHeight*3 + buttonHeight/2 +2)
    .attr("font-size", "20px")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .text("↶")

fitViewButton
    .attr("x", windowWidth-buttonMargin-buttonHeight)
    .attr("y", windowHeight-buttonMargin*2-buttonHeight*2)
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
        fitView(500)
    })
const fitViewToolTip = fitViewButton
    .append("title")
    .text("Fit View")

fitViewIcon
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("fill", "none")
    .attr("d", drawFitIcon(
        windowWidth-buttonMargin-buttonHeight/2,
        windowHeight-buttonHeight*2-buttonMargin*2 + buttonHeight/2)
    )
    .style("pointer-events", "none")

swapInOutButton
    .attr("x", buttonMargin*3 + buttonHeight*2)
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
        swapInputOutput()
        saveNodes()
        updateLinkGeometry()
        nodeMode = false
        cuspMode = false
        synthModeCycleButton
            .style("display", "none")
        synthModeCycleIcon
            .style("display", "none")
        synthCycle = 0
        updateTrace(false)
        updateLinkGeometry()
        // synthModeInputAngle = inputAngle
        // synthModeOpen = linkageOpen
    })
const swapInOutToolTip = swapInOutButton
        .append("title")
        .text("Swap Input/Output")

swapInOutIcon
    .attr("x", buttonMargin*3 + buttonHeight*2 + buttonHeight/2)
    .attr("y", windowHeight-buttonHeight/2-buttonMargin)
    .attr("font-size", "21px")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("dy", "0.05em")
    .style("pointer-events", "none")
    .text("↹") //♻

nodeModeButton
    .attr("x", buttonMargin*5 + buttonHeight*4)
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
        cuspMode = false
        nodeMode = !nodeMode
        synthCycle = 0
        synthModeCycleButton
            .attr("x", buttonMargin*5 + buttonHeight*4)
            .style("display", nodeMode ? "block" : "none")
        synthModeCycleIcon
            .attr("x", buttonMargin*5 + buttonHeight*4 + buttonHeight/2)
            .style("display", nodeMode ? "block" : "none")

        synthPoints[0].x = getNode("BC").x
        synthPoints[0].y = getNode("BC").y
        
        pathNodeSynth(true)
        updateLinkGeometry()
        updateTrace()
        updateLinkGeometry()
        saveNodes()
    })
const nodeModeToolTip = nodeModeButton
    .append("title")
    .text("Node Mode")

nodeModeIcon
    .attr("x", buttonMargin*5 + buttonHeight*4 + buttonHeight/2)
    .attr("y", windowHeight-buttonHeight/2-buttonMargin)
    .attr("dy", "0.12em")
    .attr("font-size", "15pt")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .text("⌘") // ⌘ , ↫ , ⅏

cuspModeButton
    .attr("x", buttonMargin*6 + buttonHeight*5)
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
        nodeMode = false
        cuspMode = !cuspMode
        synthCycle = 0
        synthModeCycleButton
            // .attr("x", buttonMargin*6 + buttonHeight*5)
            .style("display", "none")
        synthModeCycleIcon
            // .attr("x", buttonMargin*6 + buttonHeight*5 + buttonHeight/2)
            .style("display", "none")

        synthPoints[0].x = getNode("BC").x
        synthPoints[0].y = getNode("BC").y

        pathCuspSynth()
        updateLinkGeometry()
        updateTrace()
        updateLinkGeometry()
        saveNodes()
    })
const cuspModeToolTip = cuspModeButton
    .append("title")
    .text("Cusp Mode")

// cuspModeIcon
//     .attr("x", buttonMargin*8 + buttonHeight*7 + buttonHeight/2)
//     .attr("y", windowHeight-buttonHeight/2-buttonMargin)
//     .attr("font-size", "20pt")
//     .attr("font-family", "sans-serif")
//     .attr("font-weight", "bold")
//     .attr("text-anchor", "middle")
//     .attr("alignment-baseline", "middle")
//     .attr("dy", "0.1em")
//     .style("pointer-events", "none")
//     .text("⯏") //⎎ , ⥿ , ⯏ , ⯎

cuspModeIcon// = overlayGroup.append("path")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("fill", "none")
    .attr("d", 
        drawCuspIcon(
            buttonMargin*6 + buttonHeight*5+ buttonHeight/2,
            windowHeight-buttonHeight/2-buttonMargin
        )
        // drawCrossoverIcon()
    )
    .style("pointer-events", "none")

// Symbols:
    // Function generation: ⦡ , ⌔
    // Other: ⮓, ⮒ , ⌥ , ⬲ , ⬰ , ⥂ , ⥈ , ⤟ , ⤰
    // Crossover: ↤ ↔ ⇼

function startAnimationLoop() {
    playIcon.text("⏸")
    animationTimer = d3.timer(() => {
        playAnimation();
    });
}
function stopAnimationLoop() {
    if (animationTimer) {
        animationTimer.stop();
        animationTimer = null;
    }
    saveNodes()
    playIcon.text("▶")
}


function drawCuspIcon(x,y) {
    const r = 17 / 2;
    const c = 6;

    return `
        M ${x+r} ${y-r} 
        Q ${x} ${y - r + c} ${x-r} ${y-r} 
        Q ${x - r + c} ${y} ${x-r} ${y+r} 
        Q ${x} ${y + r - c} ${x+r} ${y+r} 
        Q ${x + r - c} ${y} ${x+r} ${y-r} 
        Z
    `;
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

function drawFitIcon(x, y) {
    const boxSize = 14;
    const snapPath = `

    M ${x-boxSize/2} ${y-boxSize/4}
    L  ${x-boxSize/2} ${y-boxSize/2}
    L  ${x-boxSize/4} ${y-boxSize/2}

    M ${x+boxSize/2} ${y-boxSize/4}
    L  ${x+boxSize/2} ${y-boxSize/2}
    L  ${x+boxSize/4} ${y-boxSize/2}

    M ${x-boxSize/2} ${y+boxSize/4}
    L  ${x-boxSize/2} ${y+boxSize/2}
    L  ${x-boxSize/4} ${y+boxSize/2}
    
    M ${x+boxSize/2} ${y+boxSize/4}
    L  ${x+boxSize/2} ${y+boxSize/2}
    L  ${x+boxSize/4} ${y+boxSize/2}

    `
    return snapPath
}


synthModeCycleButton
    .attr("x", buttonMargin*6 + buttonHeight*5)
    .attr("y", windowHeight-buttonMargin-buttonHeight*2)
    .attr("width", buttonHeight)
    .attr("height", buttonHeight)
    .attr("rx", 5)
    .attr("ry", 5)
    .attr("fill", fgColor)
    .attr("fill-opacity", 0.0)
    .style("display", "none")
    .on("click", function() {
        synthCycle++
        if (nodeMode) {
            pathNodeSynth(true)
            updateLinkGeometry()
            updateTrace()
            updateLinkGeometry()
            saveNodes()
        }
        // if (cuspMode) {
        //     pathCuspSynth()
        //     updateLinkGeometry()
        //     updateTrace()
        //     updateLinkGeometry()
        //     saveNodes()
        // }
    })
const synthModeCycleToolTip = synthModeCycleButton
    .append("title")
    .text("Cycle Alt Configs")

synthModeCycleIcon
    .attr("x", buttonMargin*6 + buttonHeight*5 + buttonHeight/2)
    .attr("y", windowHeight-buttonMargin-buttonHeight*1.75 + buttonHeight*0.75/2)
    .attr("dy", "0.075em")
    .attr("dx", "0.02em")
    .attr("font-size", "14pt")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("text-anchor", "middle")
    .attr("fill", fgColor)
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .style("display", "none")
    .text("↻") // ⥁ , ↻ , ⟳