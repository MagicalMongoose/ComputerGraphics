var gl, program;
var points;
var SIZE;
var color=1;  // choose color for display, press key 'c'
var drawStrip=1;  // choose patten for display, mouse click

function main() {
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { console.log( "WebGL isn't available" ); return; }

	var center= vec2(0.2, 0.2);  // location of the center of the circle
    var radius = 0.3;    // radius of the circle
    var Radius = 0.7;
    var points = GeneratePoints(center, radius, Radius);

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

    window.addEventListener("mousedown", function(){
        drawStrip = !drawStrip;
        render();
    });

    // always return upper case letter
    window.addEventListener("keydown", function () {
        // checkout event keycode table here:
        // https://css-tricks.com/snippets/javascript/javascript-keycodes/
	if (event.keyCode == 67) {
            if (color==1)
                color = 0;
            else
                color = 1;

            render();

	} // end if
    });

    render();
};


// generate points to draw a symbol from two concentric circles,
// the inner circle one with radius, the outer circle with Radius
// centered at (center[0], center[1]) using GL_Line_STRIP
function GeneratePoints(center, radius, Radius)
{
    var vertices=[];
    SIZE=8; // slices

    var angle = 2*Math.PI/SIZE;

    for (var i=0; i<SIZE; i+=2) {

        vertices.push(vec2(center[0], center[1]));
        // point from outer circle
        vertices.push(vec2(center[0]+Radius*Math.cos(i*angle), center[1]+Radius*Math.sin(i*angle)));
       // point from inner circle
        vertices.push(vec2(center[0]+radius*Math.cos((i+1)*angle), center[1]+radius*Math.sin((i+1)*angle)));

        vertices.push(vec2(center[0], center[1]));
       // point from inner circle
        vertices.push(vec2(center[0]+radius*Math.cos((i+1)*angle), center[1]+radius*Math.sin((i+1)*angle)));
        // point from outer circle
        vertices.push(vec2(center[0]+Radius*Math.cos((i+2)*angle), center[1]+Radius*Math.sin((i+2)*angle)));
    }

    return vertices;
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    // interleaving color symbol
    for (var i=0; i<SIZE; i+=2)
    {
      if (drawStrip==1)
      {
        gl.uniform1i(gl.getUniformLocation(program, "colorIndex"), color);
        gl.drawArrays( gl.TRIANGLES, i*3, 3);
        gl.drawArrays( gl.TRIANGLES, (i+1)*3, 3);
      }
      else {
        gl.uniform1i(gl.getUniformLocation(program, "colorIndex"), color);
        gl.drawArrays( gl.TRIANGLES, i*3, 3);
        gl.uniform1i(gl.getUniformLocation(program, "colorIndex"), 2);
        gl.drawArrays( gl.TRIANGLES, (i+1)*3, 3);
      }
    }
}
