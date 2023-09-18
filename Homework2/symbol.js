/*
Drew Lickman
Professor Cen Li
Homework 2
*/
var gl, program;
var points;
var SIZE; 
var CIRCLESIZE;
var CIRCLEangle;

function main() 
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { console.log( "WebGL isn't available" ); return; }

	var center= vec2(0.0, 0.0);  // location of the center of the circle
    var radius = 0.5;    // radius of the circle
    var Radius = 1;
    var points = GeneratePoints(center, radius, Radius);
    console.log(points); //points go to GPU for rendering
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    if (!program) { console.log('Failed to intialize shaders.'); return; }
	gl.useProgram( program );
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};


// generate points to draw a symbol from two concentric circles, 
// the inner circle one with radius, the outer circle with Radius 
// centered at (center[0], center[1]) using GL_Line_STRIP
function GeneratePoints(center, radius, Radius)
{
    var vertices=[];
    SIZE=6; // slices, there are 6 points

    var angle = 2*Math.PI/SIZE;
    var alpha = Math.PI/SIZE;
	
    CIRCLESIZE=100;
    CIRCLEangle = 2*Math.PI/CIRCLESIZE;

    //vertices for symbol
    for (var i=0; i<SIZE; i++) 
    {

        // point from inner circle
        vertices.push(vec2(center[0]+radius*Math.cos(i*angle), center[1]+radius*Math.sin(i*angle)));

        // point from outer circle
        vertices.push(vec2(center[0]+Radius*Math.cos((i*angle)+alpha), center[1]+Radius*Math.sin((i*angle)+alpha)));

    }
    vertices.push(vec2(center[0]+radius*Math.cos(0), center[1]+radius*Math.sin(0))); //close the loop by going back to the first point of the symbol
    
    //vertices for circle
    for  (var i=0; i<CIRCLESIZE+1; i++) 
    {
        vertices.push([center[0]+Radius*Math.cos(i*CIRCLEangle), 
                        center[1]+Radius*Math.sin(i*CIRCLEangle)]);
    }

    return vertices;
}

function render() 
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.uniform1i(gl.getUniformLocation(program, "colorIndex"), 2); //blue
    gl.drawArrays( gl.LINE_STRIP, 0, SIZE*2+1); //skip last index, so that center line is removed!
    gl.drawArrays( gl.LINE_STRIP, SIZE*2+1, CIRCLESIZE+1); //draw the circle after the symbol
}
