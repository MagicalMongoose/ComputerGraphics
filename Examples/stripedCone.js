// draw a 3D cone
// experiment with depth test and cull face features in 3D drawing
var gl, program, canvas;

var projectionMatrix;
var projectionMatrixLoc;
var modelviewMatrix;
var modelviewMatrixLoc;

var xrot = 0;
var yrot = 0;
var zrot = 0;
var deg = 5;

// start with normal view
var dtindex = 1;  // enable depth test
var cfindex = 2;  // disable cull face
var numSlices = 16;
var radius = 50;

function main()   {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    vertices = GeneratePoints();

    ConfigWebGL();
    
    PassInfoToGPU();

    SetupUserInterface();

    render();
};

function ConfigWebGL()   {
    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
}

function PassInfoToGPU()  {
    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    projectionMatrixLoc= gl.getUniformLocation(program, "projectionMatrix");
    modelviewMatrixLoc= gl.getUniformLocation(program, "modelviewMatrix");
}

function SetupUserInterface()  {
    // support user interface
    document.getElementById("xrotPlus").onclick=function(){xrot += deg;};
    document.getElementById("xrotMinus").onclick=function(){xrot -= deg;};
    document.getElementById("yrotPlus").onclick=function(){yrot += deg;};
    document.getElementById("yrotMinus").onclick=function(){yrot -= deg;};

    document.getElementById("ToggleDepth").onclick=function()
    {	 
        if (dtindex == 1)  
            dtindex = 2;
        else     
            dtindex = 1;
    };

    document.getElementById("ToggleCull").onclick=function()
    {    
        if (cfindex == 1)  
            cfindex = 2;
        else     
            cfindex = 1;
    };

    // keyboard handle
    window.onkeydown = HandleKeyboard;
}

function HandleKeyboard(event)  {
    switch (event.keyCode) 
    {
    case 37:  // left cursor key
            yrot -= deg;
            break;
    case 39:   // right cursor key
            yrot += deg;
            break;
    case 38:   // up cursor key
            xrot -= deg;
            break;
    case 40:    // down cursor key
            xrot += deg;
            break;
    }
}

function GeneratePoints()  {
    var points=[];

    var angleIncrement = 2*Math.PI/numSlices;

    // side triangle points, counter-clockwise triangles
    for (var angle = 0; angle < (2*Math.PI); angle += angleIncrement)  
    {
        // top point
        points.push(vec3(0, 0, radius+15)); // height of the cone > radius of the bottom circle

        // the other two points
        var x=radius*Math.cos(angle);
        var y=radius*Math.sin(angle);
        points.push(vec3(x, y, 0));

        x=radius*Math.cos(angle+angleIncrement);
        y=radius*Math.sin(angle+angleIncrement);
        points.push(vec3(x, y, 0));
    }

    // another circle to cover the bottom
    for (var angle = 0; angle <= 2*Math.PI; angle += angleIncrement)  
    {
        // center point
        points.push(vec3(0, 0, 0));

        // counter clock wise  --> the inside face is the front face
        var x=radius*Math.cos(angle);
        var y=radius*Math.sin(angle);
        points.push(vec3(x, y, 0));

        x=radius*Math.cos(angle+angleIncrement);
        y=radius*Math.sin(angle+angleIncrement);

        points.push(vec3(x, y, 0));
    }
    return points;
}

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    projectionMatrix = ortho(-100, 100, -100, 100, -100, 100);

    var r1 = rotate(xrot, 1, 0, 0);
    var r2 = rotate(yrot, 0, 1, 0);
    modelviewMatrix = mult(r1, r2);

    gl.uniformMatrix4fv(modelviewMatrixLoc, false, flatten(modelviewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // toggle Depth test: initially enabled
    if (dtindex == 1)
        gl.enable(gl.DEPTH_TEST);
    else if (dtindex == 2)
        gl.disable(gl.DEPTH_TEST);

    // toggle Cull face: initially enabled
    if (cfindex == 1)     {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);   // do not show back face k
        //gl.cullFace(gl.FRONT);   // do not show front
    }
    else if (cfindex == 2)
        gl.disable(gl.CULL_FACE);

    // draw sides
    for (var i = 0; i<numSlices; i++)
    {
        if (i%2 == 1)
            gl.uniform1i(gl.getUniformLocation(program, "colorIndex"), 1);
        else
            gl.uniform1i(gl.getUniformLocation(program, "colorIndex"), 2);
        gl.drawArrays( gl.TRIANGLES, i*3, 3);
    }

    // draw bottom
    for (var i = 0; i<numSlices; i++)
    {
        gl.uniform1i(gl.getUniformLocation(program, "colorIndex"), 3);
        gl.drawArrays(gl.TRIANGLES, numSlices*3+i*3, 3 );
    }

    requestAnimFrame(render);
}
