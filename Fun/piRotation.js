/** @type {WebGLRenderingContext} */
var funMode = true;
var gl;
var modelViewMatrix=mat4(); // identity
var modelViewMatrixLoc;
var projectionMatrix;
var projectionMatrixLoc;
var modelViewStack=[];
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
    projectionMatrix = ortho(-8, 8, -8, 8, -8, 8);
    //projectionMatrix = mult(projectionMatrix, scale4(0.5, 0.5, 0.5));

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

function incrementPointCount(n)
{
    //can do safety math here if needed
    pointCount += n;
}

function scale4(a, b, c) 
{
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

//used in a loop, returns color vector
function hueToRGB(i, detail)
{
    const frequency = (2 * Math.PI) / detail;
    //Hue rotation
    const red = (Math.sin(frequency * i + 0) * 127 + 128)/255;
    const green = (Math.sin(frequency * i + (2 * Math.PI / 3)) * 127 + 128)/255;
    const blue = (Math.sin(frequency * i + (4 * Math.PI / 3)) * 127 + 128)/255;
    return vec4(red,green,blue,1);
}

//helper function
function GeneratePolygon(cx, cy, r, color, polygonDetail)
{
    let increment = (2 * Math.PI / polygonDetail);
    for (var i = 0; i < polygonDetail; i++)
    {
        let angle = i * increment;
        let x = cx + r * Math.cos(angle);
        let y = cy + r * Math.sin(angle);
        points.push(vec2(x, y));
        if (funMode)
        {colors.push(hueToRGB(i, polygonDetail));}
        else
        {colors.push(color);}
    }
    points.push(vec2(r * Math.cos(0), r * Math.sin(0)));
    if (funMode)
    {
        //colors.push(vec4(0,0,0,1));
    }
    else
    {colors.push(color);}
}

function GeneratePoints() 
{
    GenerateCircle();
}

const center = vec2(0,0);
var branchLength = 2;
var nodes = [];

function GenerateCircle()
{
    
    //nodes = [center, vec2(0,branchLength)];

    for (var i = 0; i < 4; i++)
    {
        nodes.push(vec2(0, -i*branchLength));
        points.push(nodes[i]);
        colors.push(vec4(1,1,1,1));
    }
    console.log("original nodes:", nodes);
}

function DrawCircle(frame)
{
    
    for (var i = 0 ; i < nodes.length; i++)
    {
        var t = translate(Math.cos(frame), Math.sin(frame), 0)
        //modelViewMatrix = mult(modelViewMatrix, t);
        //modelViewMatrix = mult(modelViewMatrix, rotate(i*0.01, [0, 0, 1]));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.drawArrays(gl.LINE_STRIP, i, 2);

    }    
}

var frame = 0;

function render() 
{
        gl.clear(gl.COLOR_BUFFER_BIT );
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

        for (var i = 0; i < nodes.length; i++)
        {
            //nodes[i][0] = Math.cos(i+frame*0.00001);
        }
        DrawCircle(frame);
        frame++;

        //funny spin
        projectionMatrix = mult(projectionMatrix, rotate(-.1, [0, 0, 1])); 
        requestAnimationFrame(render);
}
