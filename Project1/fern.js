var canvas, gl;
var program;
var points = [];
var color = 1;      // choose color for display, press key 'c'
var drawAlt = 1;  // choose patten for display, mouse click
var debug = false;
var total = 20000;

function main()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) 
    {console.log( "WebGL isn't available" ); return;}

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

    //primary function
    generatePoints(presetValues1);

    if (debug) 
    {console.log("points: ", points);}

    //update this to generate both on first load, and save both in buffer, rather than regenerating same data each time
    canvas.addEventListener("mousedown", function()
    {
        drawAlt = !drawAlt; //toggle which fern to render
        points = []; //clear points array

        if (drawAlt)
        {
            generatePoints(presetValues1);
            if(debug)
            {console.log("generated presetValues1");}
        }
        else 
        {
            generatePoints(presetValues2);
            if(debug)
            {console.log("generated presetValues2");}
        }

        sendToGPU();
        render();

        if(debug)
        {console.log("mouse down detected, now using pattern: ", drawAlt);}
    });
    
    // always return upper case letter
    window.addEventListener("keydown", function ()
    {
    if (event.keyCode == 67) //C
    {
        if (color==1)
            {color = 0;}
        else
            {color = 1;}

        if(debug)
        {console.log("switching to color ", color);}

        render();
    }
    });

    //THIS IS IMPORTANT! Need to send all the new points to the GPU so it renders a new fern
    sendToGPU();
    render();
};

function sendToGPU()
{
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
}

//create a random number, then determine which set to use
function determineSet(presetValues)
{
    var setNum;

    var rand = Math.random();

    if (debug) 
    {console.log("rand: " + rand);}
    
    //structured like this to return as early as possible
    if (rand < (presetValues[6][0]))
    {setNum = 0;}

    else if (rand < (presetValues[6][1]) + (presetValues[6][0]))
    {setNum = 1;}

    else if (rand < (presetValues[6][2]) + (presetValues[6][1]) + (presetValues[6][0]))
    {setNum = 2;}

    else
    {setNum = 3;}

    if (debug) 
    {console.log("setNum: " + setNum);}

    return setNum;
}

//generate a list of points that will be used to draw the fern
function generatePoints(presetValues) 
{
    points = []; //clear points array
    let x = 0;
    let y = 0;
    var xMin = 0;
    var xMax = 0;
    var yMin = 0;
    var yMax = 0;    

    for (let i = 0; i < total; i++)
    {
        //set coefficients based on random set
        var set = determineSet(presetValues);
        var a = presetValues[0][set];
        var b = presetValues[1][set];
        var c = presetValues[2][set];
        var d = presetValues[3][set];
        var e = presetValues[4][set];
        var f = presetValues[5][set];

        //modular formula
        let nextX = (a*x) + (b*y) + e;
        let nextY = (c*x) + (d*y) + f;

        //determine xMin, xMax
        if (nextX > xMax)
        {xMax = nextX;}
        if (nextX < xMin)
        {xMin = nextX;}
        
        //determine yMin, yMax
        if (nextY > yMax)
        {yMax = nextY;}
        if (nextY < yMin)
        {yMin = nextY;}

        //update x/y so the fern moves as intended
        x = nextX;
        y = nextY;

        points.push(vec2(x, y));

        if (debug) 
        {
            console.log("x y: ", x, y);
            console.log("xMin xMax: ", xMin, xMax);
            console.log("yMin yMax: ", yMin, yMax);
            console.log("nextX nextY: ", nextX, nextY);
        }
    }

    for (let i = 0; i < points.length; i++)
    {
        //temporary names for readability
        var xPos = points[i][0];
        var yPos = points[i][1];

        //normalization
        if (xMax != xMin)
        {xPos = (xPos - xMin) / (xMax - xMin);}
        if (yMax != yMin)
        {yPos = (yPos - yMin) / (yMax - yMin);}

        //scale to be larger
        xPos = (xPos - 0.5) * 2;
        yPos = (yPos - 0.5) * 2;

        //replace points with normalized and scaled values
        points[i] = vec2(xPos, yPos);

        if (debug) 
        {console.log("x y: ", xPos, yPos);}
    
    }
}

function render() 
{
    if (debug) 
    {console.log(points);}
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1i(gl.getUniformLocation(program, "colorIndex"), color);
    gl.drawArrays(gl.POINTS, 0, points.length);
}