
// Functions for converting values between unit systems, coordinate systems, etc.
function degToRad(deg) {
    const rad = deg/180*Math.PI
    return rad;
}
function radToDeg(rad) {
    const deg = rad/Math.PI*180
    return deg;
}

// Functions to convert between values (distances, angles, etc) within the global reference frame and the linkage reference frame
function coordToLink(val, type) {
    let dist = 0;
    if (type === "x") dist = (val-originCoords.x)/coordScale
    else if (type === "y") dist = (originCoords.y-val)/coordScale
    else if (type === "angle") {
        dist = val - baseAngle
        if (dist < 0) dist = dist + 360
    } else dist = val / coordScale

    return dist;
}
function linkToCoord(val, type) {
    let coord = 0;
    if (type === "x") coord = val*coordScale + originCoords.x
    else if (type === "y") coord =  originCoords.y - val*coordScale
    else if (type === "angle") {
        coord = val + baseAngle
        if (coord > 360) coord = coord - 360
        else if (coord < 0) coord = coord + 360
    } else coord = val * coordScale
    
    return coord;
}