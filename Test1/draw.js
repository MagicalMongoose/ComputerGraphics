var gl;
var program;
var modelViewStack=[];
var vertices = 
[
    vec2(0.2, 0.0),
    vec2(0, 0.35),
    vec2(-0.2, 0.0),
    vec2(0.0, -0.1),
    vec2(0.2, 0.0),
];

function main() 
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    generateCircle();

    initBuffers();

    render();
};

function initBuffers() 
{
    //  Configure WebGL
    gl.clearColor( 0.9, 0.9, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
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

function generateCircle()
{
    var radius = 0.35;
    var pointCount = 100;
    var angle = 2*Math.PI/pointCount;

    for (var i = 0; i < pointCount; i++) 
    {
        vertices.push(vec2(
            radius*Math.cos(i*angle), 
            radius*Math.sin(i*angle)));
    }

    vertices.push(vec2(radius*Math.cos(0), radius*Math.sin(0)));

    console.log(vertices);
}

function render() 
{
    gl.clear(gl.COLOR_BUFFER_BIT);

    //draw circle
    modelViewMatrix = mat4();
    modelViewStack.push(modelViewMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.LINE_STRIP, 5, vertices.length-5);
    modelViewMatrix = modelViewStack.pop();
    
    //draw petals
    var petalCount = 8;
    var angle = 2*Math.PI/petalCount;
    var radius = 0.5;
    var t, r, s;
    var scale = .75;

    modelViewMatrix = mat4();
    
    s = scale4(scale, scale, 1);
    for (var i = 0; i < petalCount; i++) 
    {
        modelViewStack.push(modelViewMatrix);
        //place squareCount squares in a circle
        t = translate(radius*Math.sin(i*angle), radius*Math.cos(i*angle), 0);
        r = rotate(-45*i, vec3(0, 0, 1));

        modelViewMatrix = mult(modelViewMatrix, t);
        modelViewMatrix = mult(modelViewMatrix, r);
        modelViewMatrix = mult(modelViewMatrix, s);
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.LINE_STRIP, 0, 5);
        modelViewMatrix = modelViewStack.pop();
    }    
}
