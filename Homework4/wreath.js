/*
Drew Lickman
Professor Li
Homework 4
*/

var canvas, gl;
var program;
var modelViewStack = [];
var modelViewMatrix;
var scaleFactor
var color = 0;
var points = [];
var debug = false;

function main()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) 
    {console.log( "WebGL isn't available" ); return;}
    
    //primary function
    points = generatePoints();

    if (debug) 
    {console.log("base branch points: ", points);}

    sendToGPU();
    render();
};

function sendToGPU()
{
    //  Configure WebGL
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Prepare to send the model view matrix to the vertex shader
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
}

// Form the 4x4 scale transformation matrix
function scale4(x, y, z) 
{
    var result = mat4();
    result[0][0] = x;
    result[1][1] = y;
    result[2][2] = z;
    return result;
} 

function drawBranch()
{
    var s; //scale
    //one branch
    modelViewStack.push(modelViewMatrix); //save the MVM

    s = scale4(scaleFactor, scaleFactor, 1);
    modelViewMatrix = mult(modelViewMatrix, s);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix)); //send MVM to vertex shader
    gl.drawArrays(gl.LINE_STRIP, 0, points.length);

    modelViewMatrix = modelViewStack.pop(); //undo scaling effect
}

function drawStar()
{
    var r; //rotation
    var starPoints = 5; 
    //draw a star
    for (var i = 0; i < starPoints; i++)
    {
        drawBranch();

        modelViewStack.push(modelViewMatrix); //save the MVM

        r = rotate((360/starPoints)*i, 0, 0, 1);
        modelViewMatrix = mult(modelViewMatrix, r);
        drawBranch();

        modelViewMatrix = modelViewStack.pop(); //undo rotation effect
    }

}

//generates the base branch
function generatePoints() 
{    
    var points = [];

    points.push(vec2(0, 2));
    points.push(vec2(0.1, 1));
    points.push(vec2(0.4, 1));
    points.push(vec2(0, 4));
    points.push(vec2(-1, -0.3));
    points.push(vec2(-0.5, -0.5));
    points.push(vec2(0, 2));

    return points;
}

function render() 
{
    gl.clear(gl.COLOR_BUFFER_BIT);

    var r, s, t;
    var radius = 0.35;
    var numStars = 12;
    var rotationStep = Math.PI/(numStars/2);

    modelViewMatrix = mat4(); //default identity matrix
    scaleFactor = 1/30;

    for (var i = 0; i < numStars; i++)
    {
        t = translate(radius * Math.cos(rotationStep * i), radius * Math.sin(rotationStep * i), 0);
        modelViewMatrix = t;
        
        r = rotate(25*i, 0, 0, 1);
        modelViewMatrix = mult(t,r);

        drawStar();
    }
    
    gl.uniform1i(gl.getUniformLocation(program, "colorIndex"), color);
    gl.drawArrays(gl.LINE_STRIP, 0, points.length);
}