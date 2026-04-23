
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
    updateLinkGeometry()
}

function updateToolTips() {
    linkLinesToolTip
        .text(d => `${d.type} link (L = ${d.len.toFixed(1)})`)
    nodeDragToolTip
        .text(d => `(${d.x.toFixed(1)}, ${d.y.toFixed(1)})`)
}