var modelViewMatrix;
var modelViewMatrixLoc;
var projectionMatrix;
var projectionMatrixLoc;
var modelViewStack=[];

var points=[];
var colors=[];

var cmtStack=[];

var Ratio=1.618;   // ratio used for canvas and for world window

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Generate the points for the 3 components of the planet
    GenerateBackCircles();
    GenerateCircle();
    GenerateFrontCircles();

    modelViewMatrix = mat4();
    projectionMatrix = ortho(-8, 8, -8, 8, -1, 1);
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.2, 0.2, 0.5, 1.0 );

    //
    //  Load shaders and initialize attribute buffers
    //
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

    render();
}

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

var backCircleCount = 180;
var circlePointCount = 360;
var frontCircleCount = 180;
var colorPresets = [vec4(1,0.5,0.5,1), vec4(1,0,0,1), vec4(1,1,.25,1), vec4(0,1,0,1)];
var ringCount = 4;
var ringDistanceOffset = 2;

function GenerateRing(x,y, radius, color, back)
{
    for (var i = 0; i < backCircleCount; i++)
    {
        x = radius * Math.cos(i)/1.618;
        if (back)
            y = Math.abs(radius * Math.sin(i)/3.236); //back half of rings
        else
            y = -Math.abs(radius * Math.sin(i)/3.236); //front half of rings
        points.push(vec2(x, y));
        colors.push(color);
    }
}

function GenerateBackCircles()
{
    modelViewMatrix = mat4(); //default identity matrix
    var x,y;
    var t; //translation matrix
    var r; //rotation matrix
    
    
    for (var i = 0; i < ringCount; i++)
    {
        GenerateRing(x,y,i+ringDistanceOffset, colorPresets[i], true);
    }

    gl.drawArrays(gl.LINE_STRIP, 0, backCircleCount*ringCount);
}

function GenerateCircle()
{
    modelViewMatrix = mat4(); //default identity matrix
    var radius = 1;
    var x,y;
    for (var i = 0; i < circlePointCount; i++)
    {
        x = radius * Math.cos(i)/1.618; //divide by golden ratio to set it back to a circle
        y = radius * Math.sin(i);
        points.push(vec2(x, y));
        colors.push(vec4(1,1,0,1)); //yellow
    }

    gl.drawArrays(gl.TRIANGLE_FAN, backCircleCount*4, circlePointCount);
}

function GenerateFrontCircles()
{
    modelViewMatrix = mat4(); //default identity matrix
    var x,y;
    var t; //translation matrix
    var r; //rotation matrix
    
    
    for (var i = 0; i < ringCount; i++)
    {
        GenerateRing(x,y,i+ringDistanceOffset, colorPresets[i], false);
    }

    gl.drawArrays(gl.LINE_STRIP, backCircleCount*4+circlePointCount, frontCircleCount*ringCount);
}


function DrawFullPlanet()
{   
    var t; //translation
    var r; //rotation
    var s; //scale
    var ringRotationAngle = 70;
    
    t = mult(modelViewMatrix, translate(-2, 2, 0));
    modelViewMatrix = mult(t, modelViewMatrix);
    
    r = mult(modelViewMatrix, rotate(ringRotationAngle, 0, 0, 1));
    modelViewMatrix = mult(t, r);

    s = mult(modelViewMatrix, scale4(.5, .25, .5));
    modelViewMatrix = mult(t, s);

    //apply modelViewMatrix
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    // Draw Back Circles
    GenerateBackCircles();

    //transform planet
    modelViewMatrix = mult(t, modelViewMatrix);
    modelViewMatrix = mult(t, modelViewMatrix);
    
    s = mult(modelViewMatrix, scale4(.75, .75, .75));
    modelViewMatrix = mult(t, s);
    
    //apply modelViewMatrix
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    
    // draw planet
    GenerateCircle();

    //rotate the rings
    modelViewMatrix = mult(t, r);

    s = mult(modelViewMatrix, scale4(.5, .25, .5));
    modelViewMatrix = mult(t, s);

    //apply modelViewMatrix
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    
    // Draw Front Circles
    GenerateFrontCircles();
    
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    
    DrawFullPlanet();
}
