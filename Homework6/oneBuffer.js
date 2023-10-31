var canvas;
var gl;
var program;
var image;

var pointsArray = [];
var texCoordsArray = [];

var texture;

var verticesTexCoords = new Float32Array([
    // Vertex coordinates, texture coordinate
    -0.5,  0.5,   0.0, 1.0,
    -0.5, -0.5,   0.0, 0.0,
     0.5,  0.5,   1.0, 1.0,
     0.5, -0.5,   1.0, 0.0,
  ]);

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    // ================  Initiailze Vertex buffers =============
    var vtBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vtBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW );
    
    var FSIZE=verticesTexCoords.BYTES_PER_ELEMENT;
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, FSIZE*4, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, FSIZE*4, FSIZE*2 );
    gl.enableVertexAttribArray( vTexCoord );

    // ==============  Establish Textures =================
    // create the texture object
    texture = gl.createTexture();

    // create the image object
    texture.image = new Image();

    // register the event handler to be called on loading an image
    texture.image.onload = function() {  loadTexture(texture);}

    // Tell the broswer to load an image
    texture.image.src='culture.jpg';

    render();
}

function loadTexture(texture, image) 
{
    // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // Enable texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // bind the texture object to the target
    gl.bindTexture( gl.TEXTURE_2D, texture );

    // set the texture image
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image );

    // set the texture parameters
    //gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    // set the texture unit 0 the sampler
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
};

var render = function()
{
    gl.clear( gl.COLOR_BUFFER_BIT);

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4);
    requestAnimFrame(render);
}
