var gl;
var program;
var modelViewStack=[];
var vertices =
[
    vec2(0.2, 0.0),
    vec2(0, 0.35),
    vec2(-0.2, 0.0),
    vec2(0.0, -0.1)
];

function main()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    vertices = GeneratePoints();

    initBuffers();

    render();
};

function initBuffers() 
{   
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height);
    gl.clearColor( 0.9, 0.9, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    if (!program) { console.log('Failed to intialize shaders.'); return; }
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Prepare to send the model view matrix to the vertex shader
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
}

// Form the 4x4 scale transformation matrix
function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

function drawCircle()
{
    var radius = 0.6;
    var pointCount = 360;

    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length);
}

function drawPetal()
{
    console.log(vertices);
    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length);
}

function GeneratePoints()
{
    modelViewMatrix = mat4(); //default identity matrix    
    var vertices=[];
    
    // generate the points and store in array "vertices"




    //drawCircle();
    drawPetal();

    return vertices;
}

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    // make sure to send modelViewMatrix to the vertex shader before each draw command
    
    /*
    modelViewStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, scale4(0.1, 0.1, 0.1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    */
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.LINE_STRIP, 0, 4);

}
