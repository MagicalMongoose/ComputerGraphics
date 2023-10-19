/** @type {WebGLRenderingContext} */
var gl;
var modelViewMatrix=mat4(); // identity
var modelViewMatrixLoc;
var projectionMatrix;
var projectionMatrixLoc;
var modelViewStack=[];
var Ratio = 1.618;

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
    GeneratePlanet();
    //GenerateGhost();
}

function GenerateRing(radius, color, back)
{
    var x,y;
    for (var i = 0; i < ringDetail; i++)
    {
        x = radius * Math.cos(i)/Ratio;
        y = Math.abs(radius * Math.sin(i)/(Ratio*2)); //back half of rings
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
    var colorPresets = [vec4(1,0.5,0.5,1), vec4(1,0,0,1), vec4(1,1,.25,1), vec4(0,1,0,1)];
    var ringCount = 4;
    var ringDistanceOffset = 2;
    var x, y;
    //back rings
    for (var i = 0; i < ringCount; i++)
    {
        GenerateRing(i+ringDistanceOffset, colorPresets[i], false); //issue 
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
        GenerateRing(i+ringDistanceOffset, colorPresets[i], true); //issue 
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
    s = mult(modelViewMatrix, scale4(.5, .5, 1));
    modelViewMatrix = mult(modelViewMatrix, t);
    modelViewMatrix = mult(modelViewMatrix, s);

	modelViewMatrix = mult(modelViewMatrix, scale4(1, 1.618, 1));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    // draw planet circle

    modelViewMatrix = mult(modelViewMatrix, r);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.drawArrays(gl.POINTS, 0, ringDetail*ringCount);
    gl.drawArrays(gl.TRIANGLE_FAN, ringDetail*ringCount, planetPointCount); //issue
    gl.drawArrays(gl.POINTS, ringDetail*4+planetPointCount, ringDetail*ringCount);
}

function render() 
{
        gl.clear(gl.COLOR_BUFFER_BIT );
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

       // draw ground and sky first

       // draw stars and mountains

       // then, draw back rings, planet, front rings
        DrawFullPlanet();

        // then, draw ghost
        modelViewMatrix = mat4();
        modelViewMatrix = mult(modelViewMatrix, translate(-3, -2, 0));
        modelViewMatrix = mult(modelViewMatrix, scale4(2, 2, 1));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        //DrawGhost();

       // add other things, like bow, arrow, spider, flower, tree ...
}
