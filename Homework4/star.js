/*
Drew Lickman
Professor Li
Homework 4
*/

var canvas, gl;
var program;
var modelViewStack = [];
var modelViewMatrix;
var scaleFactor;
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
    scaleFactor = 1/20;
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
        //drawBranch();

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

var TOTAL_STEPS = 100;
var stepCount = 0;

// This is the starting and ending location of the animation
var startX = -0.75, startY = -0.75; // upper left corner
var target1X = 0, target1Y = 0.75;  // top middle
var target2X = 0.75, target2Y = -0.75; // bottomright corner

var locationX = startX;
var locationY = startY;

//direction 1 means going up, 2 means going down
var direction = 1;

function newLocation(current, target, start)
{
    //returns the calculated formula for adding a translation delta
    return (current + (target-start)/TOTAL_STEPS);
}

function render() 
{
    gl.clear(gl.COLOR_BUFFER_BIT);

    //variable to hold translation matrix
    var t;

    if (direction == 1)
    {
         //update to new position
        locationX = newLocation(locationX, target1X, startX);
        locationY = newLocation(locationY, target1Y, startY);

        stepCount++;
        if (stepCount >= TOTAL_STEPS)
        {
            stepCount = 0;
            direction = 2;
        }
    }
    else if (direction == 2)
    {
         //update to new position
        locationX =  + newLocation(locationX, target2X, target1X);
        locationY =  + newLocation(locationY, target2Y, target1Y);

        stepCount++;
        if (stepCount >= TOTAL_STEPS)
        {
            direction = -1;
        }
    }
    else
    {
        //stop at the 2nd target
        locationX = target2X;
        locationY = target2Y;
    }

    //apply the translation to the star, then render it
    t = translate(locationX, locationY, 0);
    modelViewMatrix = t;
    drawStar();

    requestAnimationFrame(render);
}