// Twisted Tritheta using Tessellation
// The Outer triangle is tessellated 5 timesa
// The points of the resulting triangle are twisted "theta" degrees

var theta=110/180*Math.PI;
var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 5;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
        
    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of the triangle with three points.
    // triangle centered at origin (radius 0.6)
    var vertices = 
    [
        vec2( -.52, -.3 ),
        vec2(  0,  .6 ),
        vec2(  .52, -.3 )
    ];

    divideTritheta(vertices[0], vertices[1], vertices[2], NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
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

function triangle( a, b, c )
{
    var aa, bb, cc;

    // twist the three points "theta" degrees 
    // according their distance to the origin 
    aa = twist(a);
    bb = twist(b);
    cc = twist(c);

    points.push( aa, bb, cc );
}

function twist(p)
{
    var x, y;
    var distance;

    distance = Math.sqrt(p[0]*p[0] + p[1]*p[1]);

    x = p[0]*Math.cos(distance*theta) - p[1]*Math.sin(distance*theta);
    y = p[0]*Math.sin(distance*theta) + p[1]*Math.cos(distance*theta);

    return (vec2(x, y));
}

function divideTritheta( a, b, c, count )
{

    // check for end of recursion
    
    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {
    
        //bisect the sides
        
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );

        --count;

        // three new triangle
        
        divideTritheta( a, ab, ac, count );
        divideTritheta( c, ac, bc, count );
        divideTritheta( b, bc, ab, count );
        divideTritheta( ab, bc, ac, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
