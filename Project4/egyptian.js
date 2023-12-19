/*
Project 4
Giuliano Cancilla and Drew Lickman
Professor Li
Phase 1: due 11/20
Phase 2: due 11/30
Phase 3: due 12/12
*/

var canvas;
var gl;
var program;

//???
var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333, 1);

var sunX = 0.5;
var sunY = 1.25;
var sunZ = 0;

//default lighting
var lightPosition = vec4(sunX, sunY, sunZ, 0);

var lightAmbient = vec4(.2, .2, .2, 1.0);
var lightDiffuse = vec4(.8, .8, .8, 1.0);
var lightSpecular = vec4(.8, .8, .8, 1.0);

var materialAmbient = vec4(.2, .2, .2, 1.0);
var materialDiffuse = vec4(0.0, 0.5, 1, 1.0); //main coloring
var materialSpecular = vec4(1, 1, 1, 1.0);

var materialShininess = 50.0;

var ambientColor, diffuseColor, specularColor;

var modelViewMatrix;
var projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var mvMatrixStack = [];

var defaultZoom = 0.1;
var zoomFactor = defaultZoom;
var translateFactorX = -0.5;
var translateFactorY = 0.25;
var eye = [.3, .6, .6];
var at = [.1, .1, 0];
var up = [0, 1, 0];
var pan = 0.1;
var zoom = 0.05;
var animating = false;
var frame = 0;

var numTimesToSubdivide = 5;

var sounds = [];

var pointsArray = [];
var normalsArray = [];

var texCoordsArray = [];
var texture = [];
var textureSources = ['egyptian texture 2.jpg', 'egyptian texture 1.jpg'];

//4 corners of each texture
var texCoord =
	[
		vec2(0, 0),
		vec2(0, 1),
		vec2(1, 1),
		vec2(1, 0)
	];

var left = -10;
var right = 10;
var ytop = 10;
var bottom = -10;
var near = -100;
var far = 100;
//var deg = 5;

/*
	  F ----  G
	 /|     / |
	B ---  C  |
	| |    |  |
	| E----+- H
	|/     | /
	A------D/                 
*/

//positions of cube coordinates
const vLeft = -0.5;
const vRight = 0.5;
const vTop = 0.5;
const vBottom = -0.5;
const vNear = -0.5;
const vFar = 0.5;

var vertices =
	[
		vec4(vLeft, vBottom, vFar, 1.0),	//A0
		vec4(vLeft, vTop, vFar, 1.0),		//B1
		vec4(vRight, vTop, vFar, 1.0),		//C2
		vec4(vRight, vBottom, vFar, 1.0),	//D3
		vec4(vLeft, vBottom, vNear, 1.0),	//E4
		vec4(vLeft, vTop, vNear, 1.0),		//F5
		vec4(vRight, vTop, vNear, 1.0),		//G6
		vec4(vRight, vBottom, vNear, 1.0)	//H7
	];

const sandstormMaxHeight = 200;
const sandstormMaxWidth = 100;

const gridSize = 10;

window.onload = function init() 
{
	canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) { alert("WebGL isn't available"); }

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	gl.enable(gl.DEPTH_TEST);
	//
	//  Load shaders and initialize attribute buffers
	//
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// generate the points/normals
	GenerateShapes();

	sounds.push(new Audio("assets/egyptian-music.mp3"));

	// pass data onto GPU
	var nBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

	var vNormal = gl.getAttribLocation(program, "vNormal");
	gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vNormal);

	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	// load textures
	var tBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

	var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
	gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vTexCoord);

	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

	sendLightingToGPU();

	for (var i = 0; i < textureSources.length; i++)
	{
		(function (index) //closure resolves textures not loading
		{
			//console.log(index);
			texture[index] = gl.createTexture();
			texture[index].image = new Image();
			texture[index].image.onload = function () { loadTexture(texture[index], gl.TEXTURE[index]); };
			texture[index].image.src = 'assets/' + textureSources[index];

		})(i);
	}

	//HTML buttons on user interface (have to be in this window scope)
	function buttonClick(id, action)
	{
		document.getElementById(id).onclick = action;
	}

	buttonClick("panUp", function () { translateFactorY += pan; });
	buttonClick("panLeft", function () { translateFactorX -= pan; });
	buttonClick("panRight", function () { translateFactorX += pan; });
	buttonClick("panDown", function () { translateFactorY -= pan; });
	buttonClick("zoomIn", function () { zoomFactor *= 1 - zoom; });
	buttonClick("zoomOut", function () { zoomFactor *= 1 + zoom; });
	buttonClick("toggleAnimation", function () { animating = !animating; toggleSound(0); });
	buttonClick("reset", function () { animating = false; toggleSound(0); resetCamera(); });
	buttonClick("atUp", function () { at[1] += 0.1; });
	buttonClick("atLeft", function () { at[0] -= 0.1; });
	buttonClick("atRight", function () { at[0] += 0.1; });
	buttonClick("atDown", function () { at[1] -= 0.1; });
	buttonClick("eyeUp", function () { eye[1] -= 0.1; });
	buttonClick("eyeLeft", function () { eye[0] += 0.1; });
	buttonClick("eyeRight", function () { eye[0] -= 0.1; });
	buttonClick("eyeDown", function () { eye[1] += 0.1; });

	render();
};

function loadTexture(texture, whichTexture)
{
	// Flip the image's y axis
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	// Enable texture
	gl.activeTexture(gl.activeTexture(whichTexture));

	// bind the texture object to the target
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// set the texture image
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image);

	// set the texture parameters
	//gl.generateMipmap( gl.TEXTURE_2D );
	//gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
	//gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

	//using these lines so the image doesn't have to be 256x256
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	// set the texture unit 0 the sampler
	//gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

	//uncomment that ^
}

// Define an key map to call actions
const keyActions =
{
	'ArrowUp': () => { translateFactorY += pan; }, //Panning up for 'ArrowUp'
	'ArrowDown': () => { translateFactorY -= pan; }, //Panning down for 'ArrowDown'
	'ArrowLeft': () => { translateFactorX -= pan; }, //Panning left for 'ArrowLeft'
	'ArrowRight': () => { translateFactorX += pan; }, //Panning right for 'ArrowRight'
	'A': () => { at[0] -= 0.1; }, //Left rotation for 'A'
	'a': () => { at[0] -= 0.1; }, //Left rotation for 'a'
	'D': () => { at[0] += 0.1; }, //Right rotation for 'D'
	'd': () => { at[0] += 0.1; }, //Right rotation for 'd'
	'W': () => { at[1] += 0.1; }, //Upward rotation for 'W'
	'w': () => { at[1] += 0.1; }, //Upward rotation for 'w'
	'S': () => { at[1] -= 0.1; }, //Downward rotation for 'S'
	's': () => { at[1] -= 0.1; }, //Downward rotation for 's'
	'J': () => { eye[0] += 0.1; }, //Left rotation for 'J'
	'j': () => { eye[0] += 0.1; }, //Left rotation for 'j'
	'L': () => { eye[0] -= 0.1; }, //Right rotation for 'L'
	'l': () => { eye[0] -= 0.1; }, //Right rotation for 'l'
	'K': () => { eye[1] += 0.1; }, //Upward rotation for 'K'
	'k': () => { eye[1] += 0.1; }, //Upward rotation for 'k'
	'I': () => { eye[1] -= 0.1; }, //Downward rotation for 'I'
	'i': () => { eye[1] -= 0.1; }, //Downward rotation for 'i'
	'Z': () => { zoomFactor *= 1 - zoom; }, //Update the eye position for zooming in 
	'z': () => { zoomFactor *= 1 - zoom; }, //Update the eye position for zooming in
	'X': () => { zoomFactor *= 1 + zoom; }, //Update the eye position for zooming out
	'x': () => { zoomFactor *= 1 + zoom; }, //Update the eye position for zooming out
	'N': () => { animating = !animating; toggleSound(0); },  //toggle animation
	'n': () => { animating = !animating; toggleSound(0); }, //toggle animation
	'B': () => { resetCamera(); animating = false; toggleSound(0); },  //reset to defaults
	'b': () => { resetCamera(); animating = false; toggleSound(0); }, //reset to defaults
};

//Listen for keyboard input, then use keyActions to call functions
document.addEventListener('keydown', function (event)
{
	const action = keyActions[event.key];
	if (action)
	{ action(); }
});

function toggleSound(i)
{
	if (animating) { sounds[i].play(); }
	else
	{
		sounds[i].pause();
		sounds[i].currentTime = 0;
	}
}

//reset to defaults
function resetCamera()
{
	eye = [.3, .6, .6];
	at = [.1, .1, 0];
	up = [0, 1, 0];
	translateFactorX = -0.5;
	translateFactorY = 0.25;
	zoomFactor = defaultZoom;
	animating = false;
	frame = 0;
}

function sendLightingToGPU()
{
	ambientProduct = mult(lightAmbient, materialAmbient);
	diffuseProduct = mult(lightDiffuse, materialDiffuse);
	specularProduct = mult(lightSpecular, materialSpecular);

	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
	gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
}

//set the lighting back to default
function resetLighting()
{
	lightPosition = vec4(sunX, sunY, sunZ, 0);

	lightAmbient = vec4(.2, .2, .2, 1.0);
	lightDiffuse = vec4(.8, .8, .8, 1.0);
	lightSpecular = vec4(.8, .8, .8, 1.0);

	materialAmbient = vec4(.2, .2, .2, 1.0);
	materialDiffuse = vec4(0.0, 0.5, 1, 1.0); //main coloring
	materialSpecular = vec4(1, 1, 1, 1.0);

	materialShininess = 50.0;

	sendLightingToGPU();
}

// ******************************************
// supporting functions below this:
// ******************************************

function scale4(a, b, c)
{
	var result = mat4();
	result[0][0] = a;
	result[1][1] = b;
	result[2][2] = c;
	return result;
}

// a 4x4 matrix multiple by a vec4
function multiply(m, v)
{
	var vv = vec4(
		m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2] + m[0][3] * v[3],
		m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2] + m[1][3] * v[3],
		m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2] + m[2][3] * v[3],
		m[3][0] * v[0] + m[3][1] * v[1] + m[3][2] * v[2] + m[3][3] * v[3]);
	return vv;
}

// input translations, rotations, and scaling parameters
// applies matrix transformations to modelViewMatrix

//Translate, rotate, scale
function transformations(tX, tY, tZ, rX, rY, rZ, sX, sY, sZ)
{
	var Mt = translate(tX, tY, tZ);
	var MrX = rotate(rX, 1, 0, 0);
	var MrY = rotate(rY, 0, 1, 0);
	var MrZ = rotate(rZ, 0, 0, 1);
	var Ms = scale4(sX, sY, sZ);
	modelViewMatrix = mult(modelViewMatrix, Mt);
	modelViewMatrix = mult(modelViewMatrix, MrX);
	modelViewMatrix = mult(modelViewMatrix, MrY);
	modelViewMatrix = mult(modelViewMatrix, MrZ);
	modelViewMatrix = mult(modelViewMatrix, Ms);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
}

function extrude(pointsStart, pointsEnd, distance, direction) 
{
	//direction is x, y, z based on which axis to extrude
	if (direction !== 'x' && direction !== 'y' && direction !== 'z')
	{
		console.log("invalid extrusion direction");
		return;
	}

	var count = pointsEnd - pointsStart;
	for (var i = 0; i < count; i++)
	{
		var vertex = pointsArray[pointsStart + i];
		var nextBottomVertex = pointsArray[pointsStart + (i + 1) % count];

		var topVertex = vec4(
			(direction === 'x') ? (vertex[0] + distance) : vertex[0],
			(direction === 'y') ? (vertex[1] + distance) : vertex[1],
			(direction === 'z') ? (vertex[2] + distance) : vertex[2],
			vertex[3]
		);
		var nextTopVertex = vec4(
			(direction === 'x') ? (nextBottomVertex[0] + distance) : nextBottomVertex[0],
			(direction === 'y') ? (nextBottomVertex[1] + distance) : nextBottomVertex[1],
			(direction === 'z') ? (nextBottomVertex[2] + distance) : nextBottomVertex[2],
			nextBottomVertex[3]
		);
		vQuad(vertex, nextBottomVertex, nextTopVertex, topVertex);
	}
}

// ******************************************
// main functions below:
// ******************************************

//(shapesInfo[""].start, shapesInfo[""].count)
var shapesInfo =
{
	"cube": { start: 0, count: 0 },
	"obelisk": { start: 0, count: 0 },
	"sphere": { start: 0, count: 0 },
	"cylinder": { start: 0, count: 0 },
	"sandstorm": { start: 0, count: 0 },
	"sarcophagus": { start: 0, count: 0 },
	"pyramid": { start: 0, count: 0 },
	"torus": { start: 0, count: 0 },
	"circle": { start: 0, count: 0 },
};

function setStartingIndexes()
{
	var startIndex = 0;
	for (var shape in shapesInfo)
	{
		shapesInfo[shape].start = startIndex;
		startIndex += shapesInfo[shape].count;

		if (true)
		{
			console.log(shape);
			console.log(shapesInfo[shape].start);
			console.log(shapesInfo[shape].start + shapesInfo[shape].count);
			console.log("(", shapesInfo[shape].count, ")");
			console.log("");
		}
	}
}

//initialize primitive shapes 
function GenerateShapes()
{
	GenerateCube();
	GenerateObelisk();
	GenerateSphere();
	GenerateCylinder(1, 2);
	GenerateSandstorm();
	GenerateSarcophagus();
	GeneratePyramid();
	GenerateTorus(.5, .1, 500, 20); //500, 20
	GenerateCircle();
	//GenerateAnkh();
	/*
	*/
	setStartingIndexes();
}

//List of all objects to be rendered
function RenderObjects(frame)
{
	RenderGround(0.02, 1);
	RenderSun(sunX, sunY, sunZ, .1);
	RenderObelisk(.15, 0.15, 0.2, 0.25, 0.25, 0.3, 0);
	RenderObelisk(.85, 0.15, 0.2, 0.25, 0.25, 0.3, 0);
	RenderJar(0.85, 0, .85, 0, 0, 0, .1);
	RenderSandstorm((Math.cos(frame / 500) * .5) + .5, 0, .75, frame, .005);
	RenderSarcophagus(0, 0, 0, 0, 0, 0, 1);
	//RenderCircle(.5, 1, 1, 0, 90, 0, .25);

	RenderTorus(.5, .5, 0, frame, frame, frame, .4);
	RenderAnkh(0, 0, 0, 0, 0, 0, .1);
	RenderPyramid(.5, .5, -0.5, 0, 0, 0, 1);
	/*
	*/

}

function render()
{
	var tX, tY, tZ;
	var rX, rY, rZ;
	var sX, sY, sZ;

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// set up view and projection

	projectionMatrix = ortho(left * zoomFactor - translateFactorX, right * zoomFactor - translateFactorX, bottom * zoomFactor - translateFactorY, ytop * zoomFactor - translateFactorY, near, far);
	modelViewMatrix = lookAt(eye, at, up);
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	//manual scene trasnformation variables
	tX = 0;
	tY = -0.5;
	tZ = 0;
	rX = 0;
	rY = 0;
	rZ = 0;
	sX = 1;
	sY = 1;
	sZ = 1;
	transformations(tX, tY, tZ, rX, rY, rZ, sX, sY, sZ);

	RenderObjects(frame);

	if (animating) { frame++; }
	requestAnimFrame(render);
}