/** @type {WebGLRenderingContext} */
var funMode = false;
var gl;
var modelViewMatrix=mat4(); // identity
var modelViewMatrixLoc;
var projectionMatrix;
var projectionMatrixLoc;
var modelViewStack=[];
var Ratio = 1.618;
var pointCount = 0;
var cmtStack=[];

var points=[];
var colors=[];

function main() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    GeneratePoints();

    modelViewMatrix = mat4();
    projectionMatrix = ortho(-8, 8, -8, 8, -8, 8);

    initWebGL();

    render();
}

function initWebGL() 
{
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc= gl.getUniformLocation(program, "projectionMatrix");
}

function scale4(a, b, c) 
{
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

function GeneratePoints() 
{
    GenerateSky();
    GenerateGround();
    GenerateStars();
    GenerateMountains();
    GenerateGhost();
    GeneratePlanet();
    GenerateBow();
    GenerateArrow();
    GenerateString();
}

//4 points
function GenerateSky()
{
    points.push(vec2(-8, 8)); //top left
    colors.push(vec4(75/256, 0/256, 130/256, 1));

    points.push(vec2(8, 8)); //top right
    colors.push(vec4(75/256, 0/256, 130/256, 1)); 

    points.push(vec2(8, 0)); //bottom right
    colors.push(vec4(238/256, 130/256, 238/256, 1)); 
    
    points.push(vec2(-8, 0)); //bottom left
    colors.push(vec4(238/256, 130/256, 238/256, 1)); 
}

function DrawSky()
{
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // body
    pointCount += 4;
}

//4 points
function GenerateGround()
{
    points.push(vec2(-8, 0)); //top left
    colors.push(vec4(0/256, 100/256, 0/256, 1)); 

    points.push(vec2(8, 0)); //top right
    colors.push(vec4(0/256, 100/256, 0/256, 1)); 

    points.push(vec2(8, -8)); //bottom right
    colors.push(vec4(107/256, 142/256, 35/256, 1)); 
    
    points.push(vec2(-8, -8)); //bottom left
    colors.push(vec4(107/256, 142/256, 35/256, 1));
}

function DrawGround()
{
    gl.drawArrays(gl.TRIANGLE_FAN, pointCount, 4); // body
    pointCount += 4;
}


const starCount = 20;
const starPoints = 5
const starSize = .25;
const starCoords =
[
    vec2(-17, 6), vec2(-15, 16), vec2(-5, 17), vec2(-14, 13), vec2(12, 8),   
    vec2(-7, 14), vec2(-13, 7), vec2(11, 15), vec2(21, 10), vec2(-2, 17), vec2(-1, 18), 
    vec2(5, 12), vec2(12, 16),  vec2(16, 10), vec2(8, 14), vec2(0, 10),   
    vec2(20, 11), vec2(14, 12),  vec2(17, 13), vec2(-12, 16), 
];

//5 points per star, and 20 stars
//Generate a single star given x, y
function GenerateStar(x, y)
{
    points.push(vec2(x,         y + starSize)); //up
    points.push(vec2(x - starSize,  y)); //left
    points.push(vec2(x,         y - starSize)); //down
    points.push(vec2(x + starSize,  y)); //right
    points.push(vec2(x,         y + starSize)); //up

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
    modelViewMatrix = mult(modelViewMatrix, scale4(starSize, starSize*Ratio, 1)); 
    for (var i = 0; i < starCount; i++)
    {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLE_FAN, pointCount + i*starPoints, starPoints);
    }
    pointCount += starPoints*starCount;
    modelViewMatrix = mat4();
}

const mountainCount = 7;
const mountainPoints = 3;
const mountainSize = 0.05;
//3 points per mountain, and 7 mountains
function GenerateMountain(x, y)
{
    points.push(vec2(x, y)); //tip of the mountain
    if (funMode)
        {colors.push(vec4(Math.random(), Math.random(), Math.random(), 1));} //activate fun mode
    else
        {colors.push(vec4(.9, .9, .9, 1));}
    
    let minWidth = y*2;
    let minHeight = y*2+5;
    let widthMultiplier = 16;
    let heightMultiplier = 3;

    let width = Math.random()*widthMultiplier + minWidth;
    let height = Math.random()*heightMultiplier + minHeight;

    let widthRandom = Math.random()*minWidth;
    if (Math.random() < .5)
    {widthRandom = -widthRandom;}

    points.push(vec2(x - width + widthRandom, y - height)); //left
    points.push(vec2(x + width + widthRandom, y - height)); //right
    //colors.push(vec4(0/256, 100/256, 0/256, 1)); 
    //colors.push(vec4(0/256, 100/256, 0/256, 1)); 
    colors.push(vec4(139/255/2, 69/255/2, 19/255/2, 1));
    colors.push(vec4(139/255/2, 69/255/2, 19/255/2, 1));
}

function GenerateMountains()
{
    for (var i = 0; i < mountainCount; i++)
    {
        //generate peak of mountain position
        let maxHeight = 10;
        let x = -100 + Math.random()*200;
        let y = Math.random()*maxHeight; 
        GenerateMountain(x, y);
    }
    
}

function DrawMountains()
{
    modelViewMatrix = mult(modelViewMatrix, scale4(mountainSize, mountainSize*Ratio, 1)); 
    for (var i = 0; i < mountainCount; i++)
    {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLE_FAN, pointCount + i*mountainPoints, mountainPoints);
    }
    pointCount += mountainPoints*mountainCount;
}

//114 points (eyes use same vertices)
function DrawGhost() 
{
    let x = -30;
    let y = 0;
    let scale = 1/20
    modelViewMatrix = mult(modelViewMatrix, scale4(scale, scale, 1));
    modelViewMatrix = mult(modelViewMatrix, translate(x, y, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    let bodyPointCount = 87;
    let mouthPointCount = 6;
    let nosePointCount = 5;
    let eyePointCount = 9;
    let eyeBallPointCount = 7;

    gl.drawArrays(gl.LINE_LOOP, pointCount, bodyPointCount); // body
    pointCount += bodyPointCount;
    gl.drawArrays(gl.LINE_LOOP, pointCount, mouthPointCount);  // mouth
    pointCount += mouthPointCount;
    gl.drawArrays(gl.LINE_LOOP, pointCount, nosePointCount);  // nose
    pointCount += nosePointCount;
    
    gl.drawArrays(gl.LINE_LOOP, pointCount, eyePointCount);  // left eye
    gl.drawArrays(gl.TRIANGLE_FAN, pointCount, eyeBallPointCount);  // left eye ball
    
    //copy left eye to right
    modelViewMatrix = mult(modelViewMatrix, translate(2.6, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.drawArrays(gl.LINE_STRIP, pointCount, eyePointCount);  // right eye
    gl.drawArrays(gl.TRIANGLE_FAN, pointCount, eyeBallPointCount);  // right eye ball
    pointCount += eyePointCount;
    pointCount += eyeBallPointCount;
    modelViewMatrix = mat4();
}

const ringDetail = 180;
const ringCount = 4;
const ringDistanceOffset = 2;
const ringColorPresets = [vec4(1,0.5,0.5,1), vec4(1,0,0,1), vec4(1,1,.25,1), vec4(0,1,0,1)];

const planetPointCount = 360; //first 30 points are green from ring???
const planetRadius = 1;

//generates ringDetail * ringCount points
function GenerateRing(radius, color, front)
{
    for (var i = 0; i < ringDetail; i++)
    {
        let angle = i * (2 * Math.PI / ringDetail);
        let x = radius * Math.cos(angle);
        let y = Math.abs(radius * Math.sin(angle));     //back half of rings
        if (front) {y = -y;}                        //front half of rings
        points.push(vec2(x, y));
        colors.push(color); //color array misalignment 
    }
}

//generates 2*(ringDetail*ringCounts) + planetPointCount
function GeneratePlanet() 
{
    //back rings
    for (var i = 0; i < ringCount; i++)
    {GenerateRing(i+ringDistanceOffset, ringColorPresets[i], false);} //issue
    
    console.log(points.length);
    //planet ball
	for( var i = 0; i < planetPointCount; i++ ) 
    {
		var Angle = i * (2 * Math.PI / planetPointCount);
		var X = Math.cos(Angle) * planetRadius;
		var Y = Math.sin(Angle) * planetRadius;
		points.push(vec2(X, Y));
        if (funMode)
            {colors.push(vec4(0.7, 0.7, 0, 0.01*i));}
        else
            {colors.push(vec4(0.7, 0.7, 0, 1));}
	}
    
    console.log(points.length);
    //front rings
    for (var i = 0; i < ringCount; i++)
    {GenerateRing(i+ringDistanceOffset, ringColorPresets[i], true);} //issue 
    console.log(points.length);
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
    s = mult(modelViewMatrix, scale4(.5, .2/Ratio, 1));

	modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, t);
    modelViewMatrix = mult(modelViewMatrix, r);
    modelViewMatrix = mult(modelViewMatrix, s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    //back rings 
    gl.drawArrays(gl.LINE_STRIP, pointCount, ringDetail*ringCount);
    pointCount += ringDetail*ringCount

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, t);
    modelViewMatrix = mult(modelViewMatrix, scale4(1/Ratio, 1, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    //planet ball
    gl.drawArrays(gl.TRIANGLE_FAN, pointCount, planetPointCount);
    pointCount += planetPointCount;

    //figure out how to use modelViewStack for this 
    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, t);
    modelViewMatrix = mult(modelViewMatrix, r);
    modelViewMatrix = mult(modelViewMatrix, s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    //front rings 
    gl.drawArrays(gl.LINE_STRIP, pointCount, ringDetail*ringCount);
    pointCount += ringDetail*ringCount;
}

const bowDetail = 180;
const bowX = 1;
const bowY = -4;

function GenerateBow()
{
    for (var i = Math.PI; i < 3*Math.PI; i += (Math.PI/bowDetail)*2)
    {
        let x = i;
        let y = Math.cos(i);
        points.push(vec2(x, y));
        colors.push(vec4(1, 1, .5, 1)); //yellow
    }
}

function DrawBow()
{
    modelViewMatrix = mat4(); 
    modelViewMatrix = mult(modelViewMatrix, translate(bowX-Math.PI, bowY-1, 0));
    modelViewMatrix = mult(modelViewMatrix, scale4(.5, .5, 1));
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.LINE_STRIP, pointCount, bowDetail);
    pointCount += bowDetail+1;
}

var arrowX = bowX;
var arrowY = bowY;
const arrowLength = 2;
const arrowDetail = 20;
const shortLine = 0.25;
const topFletchling = -2/3;
const midFletchling = -3/4;
const botFletchling = -4/5;

function GenerateArrow()
{    
    points.push(vec2(-shortLine, -shortLine)); //left tip
    points.push(vec2(0, 0));
    points.push(vec2(shortLine, -shortLine)); //right tip
    
    points.push(vec2(0, 0));
    points.push(vec2(0, -arrowLength)); //arrow body

    //top fletchlings
    points.push(vec2(0, topFletchling*arrowLength)); 
    points.push(vec2(-shortLine, (topFletchling*arrowLength)-shortLine));
    points.push(vec2(0, topFletchling*arrowLength)); 
    points.push(vec2(shortLine, (topFletchling*arrowLength)-shortLine));
    points.push(vec2(0, topFletchling*arrowLength)); 

    //middle fletchling
    points.push(vec2(0, midFletchling*arrowLength)); 
    points.push(vec2(-shortLine, (midFletchling*arrowLength)-shortLine));
    points.push(vec2(0, midFletchling*arrowLength)); 
    points.push(vec2(shortLine, (midFletchling*arrowLength)-shortLine));
    points.push(vec2(0, midFletchling*arrowLength));

    //bottom fletchlings
    points.push(vec2(0, botFletchling*arrowLength)); 
    points.push(vec2(-shortLine, (botFletchling*arrowLength)-shortLine));
    points.push(vec2(0, botFletchling*arrowLength));
    points.push(vec2(shortLine, (botFletchling*arrowLength)-shortLine));
    points.push(vec2(0, botFletchling*arrowLength));

    for (var i = 0; i < arrowDetail; i++)
    {
        colors.push(vec4(1, 0, 0, 1));
    }
}

function DrawArrow()
{
    modelViewMatrix = mat4(); 
    modelViewMatrix = mult(modelViewMatrix, translate(arrowX, arrowY, 0));
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.LINE_STRIP, pointCount, arrowDetail);
    pointCount += arrowDetail; //make sure this matches the arrow vertices count
}

const stringDetail = 3;
const arrowShot = false;

function GenerateString()
{
    let flatString = bowY/3.3;
    points.push(vec2(-arrowLength/2, flatString));
    if (arrowY > bowY+1)
        points.push(vec2(bowX-arrowLength/2, flatString)); //make string flat if arrow is shot
    else
        points.push(vec2(bowX-arrowLength/2, arrowY+(arrowLength)));
    points.push(vec2(arrowLength/2, flatString));

    for (var i = 0; i < stringDetail; i++)
    {
        colors.push(vec4(1, 1, 1, 1)); //white
    }
}

function DrawString()
{
    modelViewMatrix = mat4(); 
    modelViewMatrix = mult(modelViewMatrix, translate(bowX, bowY, 0));
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.LINE_STRIP, pointCount, stringDetail);
    pointCount += stringDetail;
}

function render() 
{
        gl.clear(gl.COLOR_BUFFER_BIT );
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        //draw ground and sky first
        DrawSky();
        console.log(pointCount);
        DrawGround();
        console.log(pointCount);
        //draw stars and mountains
        DrawStars();
        console.log(pointCount);
        DrawMountains();
        console.log(pointCount);
        
        //then, draw ghost
        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, translate(-3, -2, 0));
        modelViewMatrix = mult(modelViewMatrix, scale4(2, 2, 1));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        DrawGhost();
        console.log(pointCount);

        //then, draw back rings, planet, front rings
        DrawFullPlanet();
        console.log(pointCount);
        //add other things, like bow, arrow, spider, flower, tree ...
        DrawBow();
        console.log(pointCount);
        DrawArrow();
        console.log(pointCount);
        DrawString();
}
