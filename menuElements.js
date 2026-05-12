
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
        saveUndoPoints()
        nodeMode = false
        cuspMode = false
        // synthModeCycleButton
        //     .style("display", "none")
        // synthModeCycleIcon
        //     .style("display", "none")
        synthCycle = 0
        toggleOpenCrossed()
        savePoints()
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
        reverseIcon
            .attr("opacity", animationActive ? 1 : 0.25)
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
    .attr("opacity", 0.25)
    .attr("font-size", "19px")
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
        if (nodeMode || cuspMode) {
            // linkageOpen = synthModeOpen
            // doActuate(getNetAngle(linkToCoord(synthPoints[0].inAng,"angle")))
            cycleCognates()
            setLinkPoints()
            updateOpenCrossed()
            // synthModeOpen = linkageOpen
        } else {
            cycleCognates()
        }
        savePoints()
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
        cuspMode = false
        for (i = 0; i < synthPoints.length; i++) {
            synthPoints[i].display = "none"
        }
        for (i = 0; i < nodeModeTable.length; i++){
            nodeModeTable[i].active = false
        }
        synthCycle = 0
        defaultLinkage()
        fitView(500)
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
        swapStatus = !swapStatus
        swapInputOutput()
        savePoints()
        updateLinkGeometry()
        // nodeMode = false
        // cuspMode = false
        // synthModeCycleButton
        //     .style("display", "none")
        // synthModeCycleIcon
        //     .style("display", "none")
        synthCycle = 0
        updateTrace(false)
        updateLinkGeometry()
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
    .text("↹") //♻ ⭾ ↹

// invertLinkageButton
//     .attr("x", buttonMargin*4 + buttonHeight*3)
//     .attr("y", windowHeight-buttonMargin-buttonHeight)
//     .attr("width", buttonHeight)
//     .attr("height", buttonHeight)
//     .attr("rx", 5)
//     .attr("ry", 5)
//     .attr("fill", "lightgray")
//     .attr("fill-opacity", 0.75)
//     .attr("stroke", "black")
//     .attr("stroke-width", 1)
//     .attr("stroke-opacity", 0.75)
//     .on("click", function() {
//         invertStatus = !invertStatus
//         invertLinkage()
//         savePoints()
//         updateTrace()
//         updateLinkGeometry()
//         // nodeMode = false
//         // cuspMode = false
//         // synthCycle = 0
//         updateTrace(false)
//         updateLinkGeometry()
//     })
// const invertLinkageToolTip = invertLinkageButton
//         .append("title")
//         .text("Invert Linkage")

// invertLinkageIcon
//     .attr("x", buttonMargin*4 + buttonHeight*3 + buttonHeight/2)
//     .attr("y", windowHeight-buttonHeight/2-buttonMargin)
//     .attr("font-size", "21px")
//     .attr("font-family", "sans-serif")
//     .attr("font-weight", "bold")
//     .attr("text-anchor", "middle")
//     .attr("alignment-baseline", "middle")
//     .attr("dy", "0.1em")
//     .style("pointer-events", "none")
//     .text("⇅") // ↹


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
        invertStatus = false
        swapStatus = false
        cuspMode = false
        nodeMode = !nodeMode
        synthPointCount = nodeMode ? 1 : 0
        for (i = 0; i < synthPoints.length; i++) {
            synthPoints[i].display = i < synthPointCount ? "block" : "none"
        }
        if (!nodeMode) {
            for (i = 0; i < nodeModeTable.length; i++){
                nodeModeTable[i].active = false
            }
        }

        synthPoints[0].x = getJoint("BC").x
        synthPoints[0].y = getJoint("BC").y
        synthPoints[0].type = "crunode"

        nodeModeTable[0].active = nodeMode
        nodeModeMenu.attr("stroke-opacity", n => n.id === "E1_crunode" && n.active ? 0.5 : 0.1)
        
        // pathNodeSynth(true)
        pathNodeModeSynth(true)
        updateLinkGeometry()
        updateTrace()
        updateLinkGeometry()
        savePoints()
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

// cuspModeButton
//     .attr("x", buttonMargin*6 + buttonHeight*5)
//     .attr("y", windowHeight-buttonMargin-buttonHeight)
//     .attr("width", buttonHeight)
//     .attr("height", buttonHeight)
//     .attr("rx", 5)
//     .attr("ry", 5)
//     .attr("fill", "lightgray")
//     .attr("fill-opacity", 0.75)
//     .attr("stroke", "black")
//     .attr("stroke-width", 1)
//     .attr("stroke-opacity", 0.75)
//     .on("click", function() {
//         invertStatus = false
//         swapStatus = false
//         nodeMode = false
//         cuspMode = !cuspMode
//         activeSynthPoint = "E1"
//         synthPointCount = cuspMode ? 1 : 0
//         for (i = 0; i < synthPoints.length; i++) {
//             synthPoints[i].display = i < synthPointCount ? "block" : "none"
//         }

//         synthPoints[0].x = getJoint("BC").x
//         synthPoints[0].y = getJoint("BC").y

//         pathCuspSynth()
//         updateLinkGeometry()
//         updateTrace()
//         updateLinkGeometry()
//         savePoints()
//     })
// const cuspModeToolTip = cuspModeButton
//     .append("title")
//     .text("Cusp Mode")

// // cuspModeIcon
// //     .attr("x", buttonMargin*8 + buttonHeight*7 + buttonHeight/2)
// //     .attr("y", windowHeight-buttonHeight/2-buttonMargin)
// //     .attr("font-size", "20pt")
// //     .attr("font-family", "sans-serif")
// //     .attr("font-weight", "bold")
// //     .attr("text-anchor", "middle")
// //     .attr("alignment-baseline", "middle")
// //     .attr("dy", "0.1em")
// //     .style("pointer-events", "none")
// //     .text("⯏") //⎎ , ⥿ , ⯏ , ⯎

// cuspModeIcon// = overlayGroup.append("path")
//     .attr("stroke", "black")
//     .attr("stroke-width", 2)
//     .attr("fill", "none")
//     .attr("d", 
//         drawCuspIcon(
//             buttonMargin*6 + buttonHeight*5+ buttonHeight/2,
//             windowHeight-buttonHeight/2-buttonMargin
//         )
//         // drawCrossoverIcon()
//     )
//     .style("pointer-events", "none")

// synthPlusButton
//     .attr("x", buttonMargin*6 + buttonHeight*5)
//     .attr("y", windowHeight-buttonMargin-buttonHeight*2)
//     .attr("width", buttonHeight)
//     .attr("height", buttonHeight)
//     .attr("rx", 5)
//     .attr("ry", 5)
//     .attr("fill", fgColor)
//     .attr("fill-opacity", 0.0)
//     .on("click", function(event, d) {
//         if (!nodeMode && !cuspMode) return
//         if (synthPointCount >= 2) synthPointCount--
//         else synthPointCount++
//         doActuate(getNetAngle(linkToCoord(synthPoints[0].inAng,"angle")))
//         for (i = 0; i < synthPoints.length; i++) {
//             synthPoints[i].display = i < synthPointCount ? "block" : "none"
//         }
//         // pathCuspSynth(cuspMode)
//         // pathNodeSynth(nodeMode)
//         pathNodeModeSynth(nodeMode||cuspMode)
//         setLinkPoints()
//         updateTrace()
//         updateLinkGeometry()
//     })
// const synthPlusToolTip = synthPlusButton
//     .append("title")
//     .text("Reverse Actuation Direction")

// synthPlusIcon
//     .attr("x", buttonHeight/2 + buttonMargin*6 + buttonHeight*5)
//     .attr("y", windowHeight-buttonMargin-buttonHeight*1.75 + buttonHeight*0.75/2)
//     .attr("dy", "0.2em")
//     // .attr("dx", "0.02em")
//     .attr("fill", fgColor)
//     // .attr("opacity", 0.25)
//     .attr("font-size", "19px")
//     .attr("font-family", "sans-serif")
//     // .attr("font-weight", "bold")
//     .attr("text-anchor", "middle")
//     .attr("alignment-baseline", "middle")
//     .style("pointer-events", "none")
//     .text("+") //⟲

// Symbols:
    // Function generation: ⦡ , ⌔
    // Other: ⮓, ⮒ , ⌥ , ⬲ , ⬰ , ⥂ , ⥈ , ⤟ , ⤰, ⎇(alt solution)
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
    savePoints()
    playIcon.text("▶") //⏵
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

// synthModeCycleButton
//     .attr("x", buttonMargin*6 + buttonHeight*5)
//     .attr("y", windowHeight-buttonMargin-buttonHeight*2)
//     .attr("width", buttonHeight)
//     .attr("height", buttonHeight)
//     .attr("rx", 5)
//     .attr("ry", 5)
//     .attr("fill", fgColor)
//     .attr("fill-opacity", 0.0)
//     .style("display", "none")
//     .on("click", function() {
//         synthCycle++
//         if (nodeMode) {
//             pathNodeSynth(true)
//             updateLinkGeometry()
//             updateTrace()
//             updateLinkGeometry()
//             savePoints()
//         }
//         // if (cuspMode) {
//         //     pathCuspSynth()
//         //     updateLinkGeometry()
//         //     updateTrace()
//         //     updateLinkGeometry()
//         //     savePoints()
//         // }
//     })
// const synthModeCycleToolTip = synthModeCycleButton
//     .append("title")
//     .text("Cycle Alt Configs")

// synthModeCycleIcon
//     .attr("x", buttonMargin*6 + buttonHeight*5 + buttonHeight/2)
//     .attr("y", windowHeight-buttonMargin-buttonHeight*1.75 + buttonHeight*0.75/2)
//     .attr("dy", "0.075em")
//     .attr("dx", "0.02em")
//     .attr("font-size", "14pt")
//     .attr("font-family", "sans-serif")
//     .attr("font-weight", "bold")
//     .attr("text-anchor", "middle")
//     .attr("fill", fgColor)
//     .attr("alignment-baseline", "middle")
//     .style("pointer-events", "none")
//     .style("display", "none")
//     .text("↻") // ⥁ , ↻ , ⟳


// NODE MODE MENU
const nodeMenuCol1 = 23
const nodeMenuColPitch = 38
const nodeMenuRow1 = 90
const nodeMenuRowPitch = 35

const nodeModeTable = [
    {id: "E1_crunode", x: nodeMenuCol1, y: nodeMenuRow1, rings: 1, active: false},
    {id: "E2_crunode", x: nodeMenuCol1, y: nodeMenuRow1+nodeMenuRowPitch, rings: 2, active: false},
    {id: "E3_crunode", x: nodeMenuCol1, y: nodeMenuRow1+nodeMenuRowPitch*2, rings: 3, active: false},
    {id: "E1_cusp", x: nodeMenuCol1+nodeMenuColPitch, y: nodeMenuRow1, rings: 1, active: false},
    {id: "E2_cusp", x: nodeMenuCol1+nodeMenuColPitch, y: nodeMenuRow1+nodeMenuRowPitch, rings: 2, active: false},
    {id: "E3_cusp", x: nodeMenuCol1+nodeMenuColPitch, y: nodeMenuRow1+nodeMenuRowPitch*2, rings: 3, active: false},
]

// nodeModeMenu
const nodeModeMenu = nodeModeMenuGroup.selectAll("path")
    .data(nodeModeTable)
    .enter()
    .append("path")
    .attr("d", d => drawConcentricCircles(d.x, d.y, d.rings, 14))
    .attr("fill-opacity", 0)
    .attr("stroke-width", 1.25)
    .attr("stroke-opacity", 0.1)
    .attr("stroke", fgColor)
    .style("display", "none")
    .on("click", function (event, d) {
        const thisNode = synthPoints.find(p=>p.id === d.id.slice(0,2))
        const nodeNum = thisNode.id[1]
        const nodeType = d.id.substring(d.id.indexOf("_")+1)

        const oppType = nodeModeTable.find(n => 
            n.id.includes(thisNode.id)
            && !n.id.includes(nodeType)
        )

        if (thisNode.id === "E3") return // Only two nodes for now
        if (thisNode.id === "E1" && d.active) return // Don't allow disabling E1 (exit node-mode instead)
        if (d.active && nodeNum < synthPointCount) return // Can only disable the newest node
        if (nodeModeTable.find(b => b.id === "E1_crunode").active && thisNode.id !== "E1") return // if E1 is currently crunode, only allow changing of E1 to cusp
        if (nodeModeTable.find(b => b.id === "E1_cusp").active && thisNode.id !== "E1" && nodeType !== "cusp") return // if E1 is currently cusp, do not allow changing E2 to crunode

        // Toggle active status of the clicked button
        d.active = !d.active
        if (d.active) oppType.active = false

        // If E1 is crunode, no additional nodes are allowed (current limitation)
        if (thisNode.id === "E1" && d.active && nodeType === "crunode") {
            for (i = 0; i < nodeModeTable.length; i++) {
                if (nodeModeTable[i].id !== d.id) {
                    nodeModeTable[i].active = false
                }
            }
        }

        // When deactivating a button, update the relevant synthPoint type to "none"
        if (thisNode.type === nodeType) {
            thisNode.type = "none"
        // Otherwise, update synthPoint type based on this button
        } else thisNode.type = nodeType

        // Go through all the synthPoints and update types to match button statuses
        for (i = 0; i < synthPoints.length; i++){
            let activeNodeType
            const activeNodeButton = nodeModeTable.find(b => b.id.slice(0,2)===synthPoints[i].id && b.active)
            if (!activeNodeButton) activeNodeType = "none"
            else activeNodeType = activeNodeButton.id.substring(activeNodeButton.id.indexOf("_")+1)
            synthPoints[i].type = activeNodeType
            synthPoints[i].display = synthPoints[i].type === "none" ? "none" : "block"
        }

        // Set new synthPointCount (maybe irrelevant later?)
        synthPointCount = 0
        for (i = 0; i < synthPoints.length; i++) {
            if (synthPoints[i].type !== "none") synthPointCount++
        }
        
        nodeModeMenu.attr("stroke-opacity", d => d.active && d.id !== oppType.id ? 0.5 : 0.1)

        // document.getElementById("debugOutputs").innerHTML = `
        //     ${synthPoints[0].type}, ${nodeModeTable[0].active}, ${nodeModeTable[3].active} \n<br>
        //     ${synthPoints[1].type}, ${nodeModeTable[1].active}, ${nodeModeTable[4].active} \n<br>
        //     ${synthPoints[2].type}, ${nodeModeTable[2].active}, ${nodeModeTable[5].active} \n<br>
        // `
        pathNodeModeSynth(true)
        updateLinkGeometry()
        updateTrace()
        updateLinkGeometry()
        savePoints()
    })
nodeModeCrunodeLabel
    .attr("x", nodeMenuCol1)
    .attr("y", nodeMenuRow1-30)
    .attr("fill", fgColor)
    .attr("font-size", "14pt")
    .attr("font-family", "sans-serif")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .style("pointer-events", "none")
    .style("display", "none")
    .text("⌘")
const crunodeModeToolTip = nodeModeCrunodeLabel
    .append("title")
    .text("Crunode")

nodeModeCuspLabel
    .attr("stroke", fgColor)
    .attr("stroke-width", 1)
    .attr("fill-opacity", 0)
    .style("display", "none")
    .attr("d", 
        drawCuspIcon(nodeMenuCol1+nodeMenuColPitch, nodeMenuRow1-32)
    )
const cuspModeToolTip = nodeModeCuspLabel
    .append("title")
    .text("Cusp")
