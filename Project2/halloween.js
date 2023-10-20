/** @type {WebGLRenderingContext} */
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
    projectionMatrix = ortho(-8, 8, -8, 8, -1, 1);

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
    //GenerateGhost();
    //GeneratePlanet();
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

    pointCount += 4;
}

function DrawSky()
{
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // body
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

    pointCount += 4;
}

function DrawGround()
{
    gl.drawArrays(gl.TRIANGLE_FAN, 4, 4); // body
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

//5 points per star
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
}

const mountainCount = 7;
const mountainPoints = 3;

function GenerateMountain(x, y)
{
    points.push(vec2(x, y));
}

function GenerateMountains()
{
    for (var i = 0; i < mountainCount; i++)
    {
        //generate peak of mountain position
        let x = -32 + Math.random()*32;
        let y = -8 + Math.random()*16; 
        GenerateMountain(x, y);
    }
}

function DrawMountains()
{
    modelViewMatrix = mult(modelViewMatrix, scale4(starSize, starSize*Ratio, 1)); 
    for (var i = 0; i < starCount; i++)
    {
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.TRIANGLE_FAN, pointCount + i*starPoints, starPoints);
    }
    pointCount += mountainCount*3;
}


function GenerateRing(radius, color, back)
{
    var x,y;
    for (var i = 0; i < ringDetail; i++)
    {
        x = radius * Math.cos(i);
        y = Math.abs(radius * Math.sin(i)); //back half of rings
        if (back)
            y = -y; //front half of rings
        points.push(vec2(x, y));
        colors.push(color);
    }
}

var ringDetail = 180;
var ringCount = 4;
var planetPointCount = 360;
function GeneratePlanet() 
{
    var planetColorPresets = [vec4(1,0.5,0.5,1), vec4(1,0,0,1), vec4(1,1,.25,1), vec4(0,1,0,1)];
    var ringCount = 4;
    var ringDistanceOffset = 2;
    var x, y;
    //back rings
    for (var i = 0; i < ringCount; i++)
    {
        GenerateRing(i+ringDistanceOffset, planetColorPresets[i], false); //issue 
    }

    //planet ball
	var Radius = 1.0;
	var numPoints = 80;

	// TRIANGLE_FAN : for solid circle
	for( var i=0; i<numPoints; i++ ) 
    {
		var Angle = i * (2.0 * Math.PI/numPoints);
		var X = Math.cos(Angle) * Radius;
		var Y = Math.sin(Angle) * Radius;
        colors.push(vec4(0.7, 0.7, 0, 1));  
		points.push(vec2(X, Y));
	}
    
    //front rings
    for (var i = 0; i < ringCount; i++)
    {
        GenerateRing(i+ringDistanceOffset, planetColorPresets[i], true); //issue 
    }

}

function DrawGhost() 
{
    modelViewMatrix = mult(modelViewMatrix, scale4(1/20, 1/20, 1));
    modelViewMatrix = mult(modelViewMatrix, translate(-30, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.LINE_LOOP, 80, 87); // body
    gl.drawArrays(gl.LINE_LOOP, 167, 6);  // mouth
    gl.drawArrays(gl.LINE_LOOP, 173, 5);  // nose

    gl.drawArrays(gl.LINE_LOOP, 178, 9);  // left eye
    gl.drawArrays(gl.TRIANGLE_FAN, 187, 7);  // left eye ball

    modelViewMatrix = mult(modelViewMatrix, translate(2.6, 0, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.LINE_STRIP, 178, 9);  // right eye
    gl.drawArrays(gl.TRIANGLE_FAN, 187, 7);  // right eye ball
    modelViewMatrix = mat4();
}

//do modelViewMatrix here
function DrawFullPlanet() 
{
    var t; //translation
    var r; //rotation
    var s; //scale
    var ringRotationAngle = 70;
	modelViewMatrix = mat4();

	t = mult(modelViewMatrix, translate(-4, 5, 0));
    r = mult(modelViewMatrix, rotate(ringRotationAngle, 0, 0, 1));
    s = mult(modelViewMatrix, scale4(.5, .35, 1));
    modelViewMatrix = mult(modelViewMatrix, t);
    modelViewMatrix = mult(modelViewMatrix, r);
    modelViewMatrix = mult(modelViewMatrix, s);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    // draw planet circle

    //modelViewMatrix = mult(modelViewMatrix, r);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.POINTS, 194, ringDetail*ringCount); //account for Ghost points
    gl.drawArrays(gl.TRIANGLE_FAN, (ringDetail*ringCount)+194, planetPointCount); //issue
    gl.drawArrays(gl.POINTS, 194+(ringDetail*ringCount)+planetPointCount, ringDetail*ringCount);
}

function render() 
{
        gl.clear(gl.COLOR_BUFFER_BIT );
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

       // draw ground and sky first
        DrawSky();
        DrawGround();
       // draw stars and mountains
        DrawStars();
        DrawMountains();
        
        // then, draw ghost
        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, translate(-3, -2, 0));
        modelViewMatrix = mult(modelViewMatrix, scale4(2, 2, 1));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        //DrawGhost();

        // then, draw back rings, planet, front rings
        //DrawFullPlanet();
       // add other things, like bow, arrow, spider, flower, tree ...
}
