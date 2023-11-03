/*
Drew Lickman
Professor Li
Project 3
*/
/** @type {WebGLRenderingContext} */
var funMode = true;
var debugOutput = true;
var gl;
var modelViewMatrix = mat4(); // identity
var modelViewMatrixLoc;
var projectionMatrix;
var projectionMatrixLoc;
var modelViewStack = [];
var Ratio = 1.618;
var pointCount = 0;
var cmtStack = [];

var points = [];
var colors = [];

function main() 
{
    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    GeneratePoints();

    modelViewMatrix = mat4();
    projectionMatrix = ortho(-8, 8, -8, 8, -8, 8);
    //projectionMatrix = mult(projectionMatrix, scale4(0.5, 0.5, 0.5));

    initWebGL();

    //spawn ghost
    document.addEventListener('keydown', function (event)
    {
        if (event.key == 's' || event.key == 'S')
        {
            lastKeyPressed = "S";
            ghostX = Math.random() * 100 - 50;
            ghostY = Math.random() * 20 - 10;
            visibleGhost = 1;
            printDebug();
            requestAnimationFrame(render);
        }
    });

    //despawn ghost
    document.addEventListener('keydown', function (event)
    {
        if (event.key == 'b' || event.key == 'B')
        {
            lastKeyPressed = "B";
            visibleGhost = 0;
            resetArrow();
            resetBow();
            printDebug();
            requestAnimationFrame(render);
        }
    });

    //rotate bow
    let maxBowAngle = 60;
    document.addEventListener('keydown', function (event)
    {
        if (event.key == 'l' || event.key == 'L')
        {
            lastKeyPressed = "L";
            if (bowAngle < maxBowAngle)
            {
                bowAngle += 1;
                if (arrowY == starterArrowY)
                { arrowAngle += 1; }
            }
        }

        if (event.key == 'r' || event.key == 'R')
        {
            lastKeyPressed = "R";
            if (bowAngle > -maxBowAngle)
            {
                bowAngle -= 1;
                if (arrowY == starterArrowY)
                { arrowAngle -= 1; }
            }
        }

        printDebug();
        requestAnimationFrame(render);
    });

    //fire bow
    document.addEventListener('keydown', function (event)
    {
        if (event.key == 'f' || event.key == 'F') 
        {
            lastKeyPressed = "F";
            animateArrow();
            printDebug();
            requestAnimationFrame(render);
        }
    });

    render();
}

var lastKeyPressed = "?";
function printDebug()
{
    if (debugOutput == true)
    {
        console.log("Last key pressed:", lastKeyPressed);
        console.log("ghostX, ghostY:", ghostX, ghostY);
        console.log("arrowX, arrowY, arrowScale:", arrowX, arrowY, arrowScale);
        console.log("bowAngle, arrowAngle:", bowAngle, arrowAngle);
        console.log("");
    }
}

function initWebGL() 
{
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
}

function incrementPointCount(n)
{
    if (n < 0) 
    {
        console.error("Error: Negative incrementation");
        return;
    }
    pointCount += n;
}

function scale4(a, b, c) 
{
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//used in a loop, returns color vector
function hueToRGB(i, detail)
{
    const frequency = (2 * Math.PI) / detail;
    //Hue rotation
    const red = (Math.sin(frequency * i + 0) * 127 + 128) / 255;
    const green = (Math.sin(frequency * i + (2 * Math.PI / 3)) * 127 + 128) / 255;
    const blue = (Math.sin(frequency * i + (4 * Math.PI / 3)) * 127 + 128) / 255;
    return vec4(red, green, blue, 1);
}

//helper function
function GeneratePolygon(cx, cy, r, color, polygonDetail)
{
    let increment = (2 * Math.PI / polygonDetail);
    for (var i = 0; i < polygonDetail; i++)
    {
        let angle = i * increment;
        let x = cx + r * Math.cos(angle);
        let y = cy + r * Math.sin(angle);
        points.push(vec2(x, y));
        if (funMode)
        { colors.push(hueToRGB(i, polygonDetail)); }
        else
        { colors.push(color); }
    }
    points.push(vec2(r * Math.cos(0), r * Math.sin(0)));
    if (funMode)
    {
        //colors.push(vec4(0,0,0,1));
    }
    else
    { colors.push(color); }
}

function GeneratePoints() 
{
    GenerateSky();
    GenerateGround();
    GenerateStars();
    GenerateMountains();
    GeneratePlanet();
    GenerateGhost();
    GenerateBow();
    GenerateArrow();
    GenerateString();
    GenerateCandy();
}

//4 points
function GenerateSky()
{
    points.push(vec2(-8, 8)); //top left
    points.push(vec2(8, 8)); //top right
    points.push(vec2(8, 0)); //bottom right
    points.push(vec2(-8, 0)); //bottom left

    if (funMode)
    {
        for (var i = 0; i < 4; i++)
        {
            colors.push(vec4((Math.random() * 255) / 255, (Math.random() * 255) / 255, (Math.random() * 255) / 255, 1));
        }
    }
    else
    {
        colors.push(vec4(75 / 256, 0 / 256, 130 / 256, 1));
        colors.push(vec4(75 / 256, 0 / 256, 130 / 256, 1));
        colors.push(vec4(238 / 256, 130 / 256, 238 / 256, 1));
        colors.push(vec4(238 / 256, 130 / 256, 238 / 256, 1));
    }
}

function DrawSky()
{
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // body
    incrementPointCount(4);
}

//4 points
function GenerateGround()
{
    points.push(vec2(-8, 0)); //top left
    colors.push(vec4(0 / 256, 100 / 256, 0 / 256, 1));

    points.push(vec2(8, 0)); //top right
    colors.push(vec4(0 / 256, 100 / 256, 0 / 256, 1));

    points.push(vec2(8, -8)); //bottom right
    colors.push(vec4(107 / 256, 142 / 256, 35 / 256, 1));

    points.push(vec2(-8, -8)); //bottom left
    colors.push(vec4(107 / 256, 142 / 256, 35 / 256, 1));
}

function DrawGround()
{
    gl.drawArrays(gl.TRIANGLE_FAN, pointCount, 4); // body
    incrementPointCount(4);
}


const starCount = 20;
const starPoints = 5;
const starSize = .25;
const starCoords =
    [
        vec2(20, 15), vec2(-14, 14), vec2(-5, 17), vec2(-13, 13), vec2(14, 15),
        vec2(-7, 14), vec2(-10, 12), vec2(11, 15), vec2(21, 14), vec2(-2, 17), vec2(-1, 15),
        vec2(5, 12), vec2(12, 16), vec2(16, 15), vec2(8, 14), vec2(0, 13),
        vec2(20, 13), vec2(14, 12), vec2(17, 13), vec2(-12, 16),
    ];

//5 points per star, and 20 stars
//Generate a single star given x, y
function GenerateStar(x, y)
{
    points.push(vec2(x, y + starSize)); //up
    points.push(vec2(x - starSize, y)); //left
    points.push(vec2(x, y - starSize)); //down
    points.push(vec2(x + starSize, y)); //right
    points.push(vec2(x, y + starSize)); //up

    for (var i = 0; i < starPoints; i++)
    {
        colors.push(vec4(1, 1, 0, 1)); //yellow
    }
}

//Use starCoords array to generate stars
function GenerateStars()
{
    for (var i = 0; i < starCoords.length; i++)
    {
        let x = starCoords[i][0];
        let y = starCoords[i][1];
        GenerateStar(x, y);
    }
}

//Render the stars
function DrawStars()
{
    modelViewMatrix = mult(modelViewMatrix, scale4(starSize, starSize * Ratio, 1));
    modelViewMatrix = mult(modelViewMatrix, translate(0, -starSize, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(0, 0, 0, 1));
    modelViewMatrix = mult(modelViewMatrix, translate(0, +starSize, 0));
    for (var i = 0; i < starCount; i++)
    {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLE_FAN, pointCount + i * starPoints, starPoints);
    }
    incrementPointCount(starPoints * starCount);
}

const mountainPoints = 3;
const mountainCoords =
    [
        vec2(-2, 2), vec2(-7, 2), vec2(-4, 2), vec2(5, 3), vec2(-3, 1),
        vec2(1, 2), vec2(3, 3), vec2(2, 1), vec2(4, 2), vec2(7, 1)
    ];
const mountainCount = mountainCoords.length;

//3 points per mountain, and 7 mountains
function GenerateMountain(x, y)
{
    points.push(vec2(x, y)); //tip of the mountain
    if (funMode)
    { colors.push(vec4(Math.random(), Math.random(), Math.random(), 1)); } //activate fun mode
    else
    { colors.push(vec4(.9, .9, .9, 1)); }

    let minWidth = 1;
    let minHeight = y / 2;
    let heightMultiplier = 2;

    let width = minWidth;
    let height = heightMultiplier + minHeight;

    points.push(vec2(x - width, y - height)); //left
    points.push(vec2(x + width, y - height)); //right
    colors.push(vec4(139 / 255 / 2, 69 / 255 / 2, 19 / 255 / 2, 1));
    colors.push(vec4(139 / 255 / 2, 69 / 255 / 2, 19 / 255 / 2, 1));
}

function GenerateMountains()
{
    for (var i = 0; i < mountainCount; i++)
    {
        //generate peak of mountain position
        let maxHeight = 20;
        //let x = -100 + Math.random()*200;
        //let y = Math.random()*maxHeight; 
        let x = mountainCoords[i][0];
        let y = mountainCoords[i][1];
        GenerateMountain(x, y);
    }

}

function DrawMountains()
{
    modelViewMatrix = mat4();
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    for (var i = 0; i < mountainCount; i++)
    {
        gl.drawArrays(gl.TRIANGLES, pointCount + i * mountainPoints, mountainPoints);
    }
    incrementPointCount(mountainPoints * mountainCount);
}

const ringDetail = 180;
const ringCount = 4;
const ringDistanceOffset = 3;
const ringColorPresets = [vec4(1, 0.5, 0.5, 1), vec4(1, 0, 0, 1), vec4(1, 1, .25, 1), vec4(0, 1, 0, 1)];

const planetDetail = 360;
const planetRadius = 1;

//generates ringDetail * ringCount points
function GenerateRing(radius, color, front)
{
    for (var i = 0; i < ringDetail; i++)
    {
        let angle = i * (2 * Math.PI / ringDetail);
        let x = radius * Math.cos(angle);
        let y = Math.abs(radius * Math.sin(angle));     //back half of rings
        if (front) { y = -y; }                        //front half of rings
        points.push(vec2(x, y));
        colors.push(color);
    }
}

//generates 2*(ringDetail*ringCounts) + planetPointCount
function GeneratePlanet() 
{
    //back rings
    for (var i = 0; i < ringCount; i++)
    { GenerateRing(i + ringDistanceOffset, ringColorPresets[i], false); } //issue

    //planet ball
    var planetColor = vec4(0.7, 0.7, 0, 1);
    if (funMode)
    {
        for (var i = 0; i < planetDetail; i++) 
        {
            var planetAngle = i * (2 * Math.PI / planetDetail);
            var X = Math.cos(planetAngle) * planetRadius;
            var Y = Math.sin(planetAngle) * planetRadius;
            points.push(vec2(X, Y));
            colors.push(hueToRGB(i, planetDetail));
        }
        points.push(vec2(Math.cos(0) * planetRadius, Math.sin(0) * planetRadius));
        colors.push(vec4(0.7, 0.7, 0, 0.01 * i));
    }
    else
    { GeneratePolygon(0, 0, planetRadius, planetColor, planetDetail); }

    //front rings
    for (var i = 0; i < ringCount; i++)
    { GenerateRing(i + ringDistanceOffset, ringColorPresets[i], true); } //issue
}

//do modelViewMatrix here
function DrawFullPlanet() 
{
    var x = -5;
    var y = 5;
    var t; //translation
    var r; //rotation
    var s; //scale
    var ringRotationAngle = 70; //70

    t = mult(modelViewMatrix, translate(x, y, 0));
    r = mult(modelViewMatrix, rotate(ringRotationAngle, 0, 0, 1));
    s = mult(modelViewMatrix, scale4(.5, .2 / Ratio, 1));

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, t);
    modelViewMatrix = mult(modelViewMatrix, r);
    modelViewMatrix = mult(modelViewMatrix, s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    //back rings 
    gl.drawArrays(gl.LINE_STRIP, pointCount, ringDetail * ringCount);
    incrementPointCount(ringDetail * ringCount);

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, t);
    modelViewMatrix = mult(modelViewMatrix, scale4(1 / Ratio, 1, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    //planet ball
    gl.drawArrays(gl.TRIANGLE_FAN, pointCount, planetDetail);
    incrementPointCount(planetDetail + 1);

    //figure out how to use modelViewStack for this 
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, t);
    modelViewMatrix = mult(modelViewMatrix, r);
    modelViewMatrix = mult(modelViewMatrix, s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    //front rings 
    gl.drawArrays(gl.LINE_STRIP, pointCount, ringDetail * ringCount);
    incrementPointCount(ringDetail * ringCount);
}

var ghostX = -30;
var ghostY = 0;
var ghostWidth;
var ghostHeight;
var visibleGhost = 0;
//114 points (eyes use same vertices)
function DrawGhost() 
{
    let bodyPointCount = 87;
    let mouthPointCount = 6;
    let nosePointCount = 5;
    let eyePointCount = 9;
    let eyeBallPointCount = 7;
    let ghostTotalPoints = bodyPointCount + mouthPointCount + nosePointCount + eyePointCount + eyeBallPointCount;
    if (visibleGhost == 1)
    {
        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, scale4(2, 2, 1));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        let scale = 1 / 20;
        modelViewMatrix = mult(modelViewMatrix, scale4(scale, scale, 1));
        modelViewMatrix = mult(modelViewMatrix, translate(ghostX, ghostY, 0));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        gl.drawArrays(gl.LINE_LOOP, pointCount, bodyPointCount); // body
        // Calculate the width and height of the ghost using the points
        ghostWidth = Math.max(...points.slice(pointCount, pointCount + bodyPointCount).map(p => p[0])) - Math.min(...points.slice(pointCount, pointCount + bodyPointCount).map(p => p[0]));
        ghostHeight = Math.max(...points.slice(pointCount, pointCount + bodyPointCount).map(p => p[1])) - Math.min(...points.slice(pointCount, pointCount + bodyPointCount).map(p => p[1]));
        incrementPointCount(bodyPointCount);

        gl.drawArrays(gl.LINE_LOOP, pointCount, mouthPointCount);  // mouth
        incrementPointCount(mouthPointCount);

        gl.drawArrays(gl.LINE_LOOP, pointCount, nosePointCount);  // nose
        incrementPointCount(nosePointCount);

        gl.drawArrays(gl.LINE_LOOP, pointCount, eyePointCount);  // left eye
        gl.drawArrays(gl.TRIANGLE_FAN, pointCount, eyeBallPointCount);  // left eye ball

        //copy left eye to right
        modelViewMatrix = mult(modelViewMatrix, translate(2.6, 0, 0));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        gl.drawArrays(gl.LINE_STRIP, pointCount, eyePointCount);  // right eye
        gl.drawArrays(gl.TRIANGLE_FAN, pointCount, eyeBallPointCount);  // right eye ball
        incrementPointCount(eyePointCount);
        incrementPointCount(eyeBallPointCount);
    }
    else
    { incrementPointCount(ghostTotalPoints); }
}

const bowDetail = 180;
const bowX = -Math.PI; //bowX displaced due to being Math.PI into cosine wave
const bowY = -5;
var bowAngle = 0;
var bowWidth = Math.abs(2 * Math.PI);
var bowHeight = Math.abs(Math.cos(Math.PI) - Math.cos(3 * Math.PI));
const bowCenterX = bowX + bowWidth / 2;
const bowCenterY = bowY + bowHeight / 2;

function GenerateBow()
{
    for (var i = Math.PI; i < 3 * Math.PI; i += (Math.PI / bowDetail) * 2)
    {
        let x = i;
        let y = Math.cos(i);
        //let y = Math.cos(i);
        points.push(vec2(x, y));
        colors.push(vec4(1, 1, .5, 1)); //yellow
    }
}

function DrawBow()
{
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, translate(bowX, bowY, 0));
    modelViewMatrix = mult(modelViewMatrix, scale4(.5, .5, 1));

    modelViewMatrix = mult(modelViewMatrix, translate(bowWidth, bowHeight, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(bowAngle, 0, 0, 1));
    modelViewMatrix = mult(modelViewMatrix, translate(-bowWidth, -bowHeight, 0));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.LINE_STRIP, pointCount, bowDetail);
    incrementPointCount(bowDetail + 1);
}

var arrowX = bowX + bowWidth / 2 * Math.cos(bowAngle); //middle of bow
const starterArrowY = bowY + .75;
var arrowY = starterArrowY;
const arrowLength = 2;
const arrowDetail = 20;
const shortLine = 0.25;
const topFletchling = -2 / 3;
const midFletchling = -3 / 4;
const botFletchling = -4 / 5;
var arrowAngle = 90;
var arrowScale = 1;

function GenerateArrow()
{
    points.push(vec2(-shortLine, -shortLine)); //left tip
    points.push(vec2(0, 0));
    points.push(vec2(shortLine, -shortLine)); //right tip

    points.push(vec2(0, 0));
    points.push(vec2(0, -arrowLength)); //arrow body

    //top fletchlings
    points.push(vec2(0, topFletchling * arrowLength));
    points.push(vec2(-shortLine, (topFletchling * arrowLength) - shortLine));
    points.push(vec2(0, topFletchling * arrowLength));
    points.push(vec2(shortLine, (topFletchling * arrowLength) - shortLine));
    points.push(vec2(0, topFletchling * arrowLength));

    //middle fletchling
    points.push(vec2(0, midFletchling * arrowLength));
    points.push(vec2(-shortLine, (midFletchling * arrowLength) - shortLine));
    points.push(vec2(0, midFletchling * arrowLength));
    points.push(vec2(shortLine, (midFletchling * arrowLength) - shortLine));
    points.push(vec2(0, midFletchling * arrowLength));

    //bottom fletchlings
    points.push(vec2(0, botFletchling * arrowLength));
    points.push(vec2(-shortLine, (botFletchling * arrowLength) - shortLine));
    points.push(vec2(0, botFletchling * arrowLength));
    points.push(vec2(shortLine, (botFletchling * arrowLength) - shortLine));
    points.push(vec2(0, botFletchling * arrowLength));

    for (var i = 0; i < arrowDetail; i++)
    {
        colors.push(vec4(1, 0, 0, 1));
    }
}

function DrawArrow()
{
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, translate(arrowX, arrowY, 0));

    if (arrowY == starterArrowY) //if arrow is in the bow
    { modelViewMatrix = mult(modelViewMatrix, rotate(bowAngle, 0, 0, 1)); }
    else //if arrow is flying
    {
        //bug: if bow is rotated while arrow is moving, arrow continues to shrink
        modelViewMatrix = mult(modelViewMatrix, rotate(arrowAngle - 90, 0, 0, 1));
        arrowScale *= 0.96; //very sensitive value
        modelViewMatrix = mult(modelViewMatrix, scale4(arrowScale, arrowScale, 1));
    }

    //modelViewMatrix = mult(modelViewMatrix, translate(bowWidth / 2, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.LINE_STRIP, pointCount, arrowDetail);
    incrementPointCount(arrowDetail); //make sure this matches the arrow vertices count
}

const stringDetail = 3;
const arrowShot = false;

function GenerateString()
{
    let flatString = bowY + 4;
    let stringLoc = 1;
    points.push(vec2(-stringLoc, flatString));
    if (arrowY > bowY + 1)
        points.push(vec2(0, flatString)); //make string flat if arrow is shot
    else
        points.push(vec2(0, arrowY + (arrowLength * 1.25)));
    points.push(vec2(stringLoc, flatString));

    for (var i = 0; i < stringDetail; i++)
    {
        colors.push(vec4(1, 1, 1, 1)); //white
    }
}

function DrawString()
{
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, translate(0, bowY + 0.75, 0));

    //modelViewMatrix = mult(modelViewMatrix, translate(bowWidth, bowHeight, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(bowAngle, 0, 0, 1));
    //modelViewMatrix = mult(modelViewMatrix, translate(-bowWidth, -bowHeight, 0));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.LINE_STRIP, pointCount, stringDetail);
    incrementPointCount(stringDetail);
}

const candyDetail = 50;
const candyRadius = 5;
function GenerateCandy()
{
    var width = 12;
    var height = 6;

    //left side
    points.push(vec2(0, 0));
    points.push(vec2(-width, height));
    points.push(vec2(-width, -height));
    points.push(vec2(0, 0));
    colors.push(vec4(1, 0, 0, .1));
    colors.push(vec4(1, 0, 0, 1));
    colors.push(vec4(1, 0, 0, 1));
    colors.push(vec4(1, 0, 0, .1));

    //right side
    points.push(vec2(0, 0));
    points.push(vec2(width, height));
    points.push(vec2(width, -height));
    points.push(vec2(0, 0));
    colors.push(vec4(1, 0, 0, .1));
    colors.push(vec4(1, 0, 0, 1));
    colors.push(vec4(1, 0, 0, 1));
    colors.push(vec4(1, 0, 0, .1));

    //candy ball part
    GeneratePolygon(0, 0, candyRadius, vec4(0.6, 0.1, 0.7, 1), candyDetail);
}

//draw pile of candies
function DrawCandy()
{
    modelViewMatrix = mat4();
    const wholeCandyDetail = candyDetail + 12;
    var scale = 0.1;
    var s = scale4(scale / Ratio, scale, 1);


    modelViewMatrix = mult(modelViewMatrix, s);
    modelViewMatrix = mult(modelViewMatrix, translate(70, -60, 1));
    modelViewMatrix = mult(modelViewMatrix, rotate(20, 0, 0, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, pointCount, wholeCandyDetail);

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, s);
    modelViewMatrix = mult(modelViewMatrix, translate(75, -60, 1));
    modelViewMatrix = mult(modelViewMatrix, rotate(-30, 0, 0, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, pointCount, wholeCandyDetail);

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, s);
    modelViewMatrix = mult(modelViewMatrix, translate(80, -70, 1));
    modelViewMatrix = mult(modelViewMatrix, rotate(30, 0, 0, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, pointCount, wholeCandyDetail);

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, s);
    modelViewMatrix = mult(modelViewMatrix, translate(50, -70, 1));
    modelViewMatrix = mult(modelViewMatrix, rotate(-30, 0, 0, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, pointCount, wholeCandyDetail);

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, s);
    modelViewMatrix = mult(modelViewMatrix, translate(55, -60, 1));
    modelViewMatrix = mult(modelViewMatrix, rotate(80, 0, 0, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, pointCount, wholeCandyDetail);

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, s);
    modelViewMatrix = mult(modelViewMatrix, translate(63, -70, 1));
    modelViewMatrix = mult(modelViewMatrix, rotate(10, 0, 0, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, pointCount, wholeCandyDetail);

    modelViewMatrix = mat4();
    incrementPointCount(wholeCandyDetail);
}

var arrowSpeed = 0.5;
var arrowMaxHeight = 0;
//when F is pressed
function animateArrow() 
{
    if (arrowY < arrowMaxHeight) 
    {
        arrowX += arrowSpeed * Math.cos(arrowAngle * Math.PI / 180);
        arrowY += arrowSpeed * Math.sin(arrowAngle * Math.PI / 180);
        DrawArrow();

        //not working
        GenerateString();
        DrawString();


        handleCollision();
        requestAnimationFrame(render);
    }
    else
    { resetArrow(); }
}

function resetArrow()
{
    arrowX = 0;
    arrowY = starterArrowY;
    arrowAngle = bowAngle + 90;
    arrowScale = 1;
}

function resetBow()
{
    bowAngle = 0;
}

function handleCollision() 
{
    if (checkCollision()) 
    {
        // Stop the animation
        cancelAnimationFrame(animateArrow);
        // Display a message
        alert("Ghost hit!");
    }
}

function checkCollision() 
{
    if (arrowX >= ghostX &&
        arrowX <= ghostX + ghostWidth &&
        arrowY >= ghostY &&
        arrowY <= ghostY + ghostHeight) 
    {
        return true;
    }
    return false;
}

function render() 
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    DrawSky();
    DrawGround();
    DrawStars();
    DrawMountains();
    DrawFullPlanet();
    DrawGhost();
    DrawBow();
    DrawArrow();
    DrawString();
    DrawCandy();
    //console.log(points);
    pointCount = 0;
    //requestAnimationFrame(render);

    //funny spin
    //projectionMatrix = mult(projectionMatrix, rotate(0.5, [1, 1, 1])); 
    //requestAnimationFrame(render);
}
