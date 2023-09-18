/*
Homework 1
Drew Lickman
Dr. Cen Li
*/
var gl;
var program;

function main() 
{
    //create the canvas
    var canvas = document.getElementById( "gl-canvas" );

    //initialize the webgl context
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //Vertices array to be sent to GPU
    var vertices = [
        //top left square
        vec2(0.0, 0.0), //Mid
        vec2(0.0, 0.5), //TR
        vec2(-0.5, 0.5), //TL
        vec2(-0.5,  0.0), //BL

        //bottom right square
        vec2(0.0, 0.0), //Mid
        vec2(0.5, 0.0), //TR
        vec2(0.5, -0.5), //BR
        vec2(0.0, -0.5), //BL

        //top right triangle
        vec2(0.5, 0.0), //R
        vec2(0.25, 0.5), //T
        vec2(0.0, 0.0), //Mid

        //bottom left triangle
        vec2(-0.5, -0.5), //L
        vec2(0.0, -0.5), //R
        vec2(-0.25, 0.0) //T
    ];

    //Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    //Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function render() 
{
    //clear the screen before drawing shapes
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );

    //draw the squares
    gl.uniform1i(gl.getUniformLocation(program, "colorChoice"), 1);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 8 );
    //gl.drawArrays( gl.TRIANGLE_FAN, 4, 4 );

    //draw the triangles
    gl.uniform1i(gl.getUniformLocation(program, "colorChoice"), 0);
    gl.drawArrays( gl.TRIANGLES, 8, 6 );
    //gl.drawArrays( gl.TRIANGLES, 11, 3 );

}
