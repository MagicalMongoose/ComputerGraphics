var canvas, gl;
var program;
var points = [];
//var branches = 4;
//var depth = 6; // branches^depth = number of points in the fern
var color = 1;      // choose color for display, press key 'c'
var drawAlt = 1;  // choose patten for display, mouse click
var debug = true;
var total = 50;
var i = 0;


function main()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { console.log( "WebGL isn't available" ); return; }

    //sets
    var presetValues1 = 
    [       //s0    s1    s2     s3
        /*a*/[0.0,  0.2,  -0.15,  0.75],
        /*b*/[0.0, -0.26,  0.28,  0.04],
        /*c*/[0.0,  0.23,  0.26, -0.04],
        /*d*/[0.16, 0.22,  0.24,  0.85],
        /*e*/[0.01, 0.01,  0.01,  0.01],
        /*f*/[0.0,  1.6,   0.44,  1.6],
        /*p*/[0.1,  0.08,  0.08,  0.74] //p[] sum == 1
    ]
        //probability ranges
        //(0-0.1) (0.1-0.18) (0.18-0.26) (0.26-1)
    
        var presetValues2 = 
        [       //s0    s1    s2     s3
            /*a*/[0.0,  0.2,   -0.15, 0.85],
            /*b*/[0.0,  -0.26, 0.28,  0.04],
            /*c*/[0.0,  0.23,  0.26,  -0.04],
            /*d*/[0.16, 0.22,  0.24,  0.85],
            /*e*/[0.0,  0.0,   0.0,   0.0],
            /*f*/[0.0,  1.6,   0.44,  1.6],
            /*p*/[0.01,  0.07,  0.07,  0.85] //p[] sum == 1
        ]
        //probability ranges
        //(0-0.1) (0.1-0.18) (0.18-0.26) (0.26-1)

        //set 0: stem
        //set 1: largest left-hand leaflets
        //set 2: largest right-hand leaflets
        //set 3: successively smaller leaflets

    //primary function
    //fern(presetValues, x, y, depth);
    points = generatePoints(presetValues1);
    console.log("points: ", points);

    //  Configure WebGL
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    /*
    //update this to generate both on first load, and save both in buffer, rather than regenerating same data each time
    canvas.addEventListener("mousedown", function()
    {
        drawAlt = !drawAlt; //toggle which fern to render
        
        if (drawAlt == 1)
            {generatePoints(presetValues1);}
        else 
            {generatePoints(presetValues2);}
        render();
        console.log("mouse down detected, now using pattern: ", drawAlt);
    });
    */
    // always return upper case letter
    window.addEventListener("keydown", function ()
    {
    if (event.keyCode == 67) //C
    {
        if (color==1)
            {color = 0;}
        else
            {color = 1;}
        console.log("switching to color ", color);
        render();
    }
    });
    

    render();
};

//create a random number, then determine which set to use
function determineSet(presetValues)
{
    var setNum;

    var rand = Math.random();
    if (debug) {console.log("rand: " + rand);}
    
    //structured like this to return as early as possible
    if (rand < (presetValues[6][0]))
    {setNum = 0;}

    else if (rand < (presetValues[6][1]) + (presetValues[6][0]))
    {setNum = 1;}

    else if (rand < (presetValues[6][2]) + (presetValues[6][1]) + (presetValues[6][0]))
    {setNum = 2;}

    else
    {setNum = 3;}

    if (debug) {console.log("setNum: " + setNum);}
    return setNum;
}

function formula(x,y,setNum)
{
    console.log("formula starting with: ", x, y, setNum);
    var nextX = 0;
    var nextY = 0;
    if (setNum == 0)
    {
        nextX = (0.0*x) + (0.0*y) + 0.0;
        nextY = (0.0*x) + (0.16*y) + 0.0;
    }
    else if (setNum == 1)
    {
        nextX = (0.85*x) + (0.04*y) + 0.0;
        nextY = (0.04*x) + (0.85*y) + 1.6;
    }
    else if (setNum == 2)
    {
        nextX = (0.2*x) + (0.26*y) + 0.0;
        nextY = (0.23*x) + (0.22*y) + 1.6;
    }
    else if (setNum == 3)
    {
        nextX = (-0.15*x) + (0.28*y) + 0.0;
        nextY = (0.26*x) + (0.24*y) + 0.44;
    }
    console.log("formula result: ", nextX, nextY);
    return nextX, nextY;
}

//formula but more modular
function calculatePoint(presetValues, x, y)
{
    var set = determineSet(presetValues);
    var a = presetValues[0][set];
    var b = presetValues[1][set];
    var c = presetValues[2][set];
    var d = presetValues[3][set];
    var e = presetValues[4][set];
    var f = presetValues[5][set];

    //general form of the series: 
    nextX = (a*x) + (b*y) + e;
    nextY = (c*x) + (d*y) + f;

    return nextX, nextY;
}

//generate a list of points that will be used to draw the fern
function generatePoints(presetValues) 
{
    points = []; //clear points array
    let x = 0;
    let y = 0;
    var xMin, xMax = 0;
    var yMin, yMax = 0;
    let i = 0;
    

    while (i < total)
    {
        //let nextX, nextY;
        /*
        var set = determineSet(presetValues);
        var a = presetValues[0][set];
        var b = presetValues[1][set];
        var c = presetValues[2][set];
        var d = presetValues[3][set];
        var e = presetValues[4][set];
        var f = presetValues[5][set];

        //general form of the series: 
        nextX = (a*x) + (b*y) + e;
        nextY = (c*x) + (d*y) + f;
        */
        /*
        console.log("looping with: ", x, y);
        nextX, nextY = formula(x, y, determineSet(presetValues));
        //nextX, nextY = calculatePoint(presetValues, x, y);

        console.log("nextX: " + nextX + " nextY: " + nextY);
        */
        const r = Math.random();

        let nextX, nextY;

        if (r <= 0.01) {
            nextX = 0;
            nextY = 0.16 * y;
        } else if (r <= 0.86) {
            nextX = 0.85 * x + 0.04 * y;
            nextY = -0.04 * x + 0.85 * y + 1.6;
        } else if (r <= 0.93) {
            nextX = 0.2 * x - 0.26 * y;
            nextY = 0.23 * x + 0.22 * y + 1.6;
        } else {
            nextX = -0.15 * x + 0.28 * y;
            nextY = 0.26 * x + 0.24 * y + 0.44;
        }
        //console.log("newX, newY: ", nextX, nextY);
        //x = nextX;
        //y = nextY;
        //console.log("loop after formula: x, y: ", x, y);

        //get the x/yMax and //get the x/yMin
        
        if (nextX > xMax)
        {xMax = nextX;}
        if (nextX < xMin && nextX != xMax)
        {xMin = nextX;}

        if (nextY > yMax)
        {yMax = nextY;}
        if (nextY < yMin && nextY != yMax)
        {yMin = nextY;}
        
        //normalization
        if (xMax != xMin)
        {nextX = (nextX - xMin) / (xMax - xMin);}
        if (yMax != yMin)
        {nextY = (nextY - yMin) / (yMax - yMin);}

        console.log("normalized nextX: " + nextX +  nextX + " normalized nextY: " + nextY);
        
        //update x/y so the fern moves as intended
        x = nextX;
        y = nextY;

        points.push(vec2(x, y));

        if (debug) 
        {
            /*
            console.log("a: ", a);
            console.log("b: ", b);
            console.log("c: ", c);
            console.log("d: ", d);
            console.log("e: ", e);
            console.log("f: ", f);
            */
            console.log("x y: ", x, y);
            //console.log("xMax yMax: ", xMax, yMax);
            //console.log("xMin yMin: ", xMin, yMin);
        }
        
        i++
    }
    return points;
}
    
/*
//recursively draw fern
function fern(presetValues, x, y, depth) 
{
    if (debug) 
    {
        console.log("fern depth: " + depth);
        console.log("x: " + x + " y: " + y);
    }
    //check for end of recursion
    if (depth === 0) 
    {generatePoints(presetValues);}
    else 
    {
        --depth;
        
        for (let i = 0; i < branches; i++)
        {fern(presetValues, x, y, depth);}
    }
}
*/

function render() 
{
    if (debug) 
    {//console.log(points);}
    }
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1i(gl.getUniformLocation(program, "colorIndex"), color);
    gl.drawArrays(gl.POINTS, 0, points.length);
}