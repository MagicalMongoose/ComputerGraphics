// ******************************************
// geometry generating functions below this:
// ******************************************
function triangle(a, b, c) 
{
    normalsArray.push(vec3(a[0], a[1], a[2]));
    normalsArray.push(vec3(b[0], b[1], b[2]));
    normalsArray.push(vec3(c[0], c[1], c[2]));

    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);
}

function vTriangle(v1, v2, v3)
{
    normalsArray.push(vec3(v1[0], v1[1], v1[2]));
    normalsArray.push(vec3(v2[0], v2[1], v2[2]));
    normalsArray.push(vec3(v3[0], v3[1], v3[2]));

    pointsArray.push(v1);
    pointsArray.push(v2);
    pointsArray.push(v3);

    texCoordsArray.push(texCoord[0]);
    texCoordsArray.push(texCoord[1]);
    texCoordsArray.push(texCoord[2]);
}

function divideTriangle(a, b, c, count) 
{
    if (count > 0) 
    {
        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else
    {
        triangle(a, b, c);
    }
}

//update this to use triangle()
function quadFromCube(a, b, c, d) 
{
    /*
      F ----  G
     /|     / |
    B ---  C  |
    | |    |  |
    | E----+- H
    |/     | /
    A------D/                 
    */

    //A0
    //B1
    //C2
    //D3
    //E4
    //F5
    //G6
    //H7

    var t1 = subtract(vertices[b], vertices[a]);
    var t2 = subtract(vertices[c], vertices[b]);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
    normal = normalize(normal);

    //first triangle
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(vertices[b]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[3]);

    //second triangle
    pointsArray.push(vertices[a]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(vertices[c]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[3]);

    pointsArray.push(vertices[d]);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);
}

//update this to use vTriangle()
//vQuad is a modification of quad to take in 4 vertex coordinates manually
function vQuad(v1, v2, v3, v4)
{
    var t1 = subtract(v2, v1);
    var t2 = subtract(v3, v2);
    var normal = cross(t1, t2);
    var normal = vec3(normal);
    normal = normalize(normal);

    //first triangle
    pointsArray.push(v1);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(v2);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(v3);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[3]);

    //second triangle
    pointsArray.push(v1);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(v3);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[3]);

    pointsArray.push(v4);
    normalsArray.push(normal);
    texCoordsArray.push(texCoord[0]);
}

// better texture on 3D mesh
function quad(a, b, c, d, s1, s2, t1, t2)
{
    //triangle 1
    pointsArray.push(a);
    texCoordsArray.push(vec2(s1, t1));
    pointsArray.push(b);
    texCoordsArray.push(vec2(s2, t1));
    pointsArray.push(c);
    texCoordsArray.push(vec2(s2, t2));

    //triangle 2
    pointsArray.push(a);
    texCoordsArray.push(vec2(s1, t1));
    pointsArray.push(c);
    texCoordsArray.push(vec2(s2, t2));
    pointsArray.push(d);
    texCoordsArray.push(vec2(s1, t2));
}

function GenerateCube()
{
    var start = pointsArray.length;

    quadFromCube(1, 0, 3, 2);
    quadFromCube(2, 3, 7, 6);
    quadFromCube(3, 0, 4, 7);
    quadFromCube(6, 5, 1, 2);
    quadFromCube(4, 5, 6, 7);
    quadFromCube(5, 4, 0, 1);

    var end = pointsArray.length;

    shapesInfo["cube"].count = end - start;
    //console.log("cube count:", shapesInfo["cube"].count);
}

function GenerateSphere()
{
    var start = pointsArray.length;

    // generate vertices for sphere
    var radius = 1.0;
    var stacks = 48;
    var slices = 24;
    var textureTInc = 1.0 / stacks;
    var textureSInc = 1.0 / slices;
    var curr1, curr2, prev1, prev2;
    var t1, t2, s1, s2;
    var half = [];
    for (var i = 0; i < stacks + 1; i++)
    {
        half.push(vec4(radius, Math.cos(Math.PI * i / stacks), Math.sin(Math.PI * i / stacks), 1.0));
    }
    for (var i = 0; i < stacks; i++)
    {
        prev1 = init1 = half[i];
        prev2 = init2 = half[i + 1];
        t1 = textureTInc * i;
        t2 = textureTInc * (i + 1);
        for (var j = 0; j < slices; j++)
        {
            var m = rotate((j + 1) * 360 / slices, 0, 1, 0);
            curr1 = multiply(m, init1);
            curr2 = multiply(m, init2);
            s1 = textureSInc * j;
            s2 = textureSInc * (j + 1);
            quad(prev1, curr1, curr2, prev2, s1, s2, t1, t2);
            prev1 = curr1;
            prev2 = curr2;
        }
    }

    var end = pointsArray.length;
    shapesInfo["sphere"].count = end - start;
    //console.log("sphere count:", shapesInfo["sphere"].count);
}

function GenerateCylinder(radius, height)
{
    var start = pointsArray.length;

    GenerateCircle();
    var end = pointsArray.length;
    extrude(start, end, height, 'z');
    end = pointsArray.length;


    shapesInfo["cylinder"].count = end - start;
    //console.log("cylinder count:", shapesInfo["cylinder"].count);

    /*
    var stacks = 48;
    var slices = 24;
    //var sliceInc = 2 * Math.PI / slices;
    var textureTInc = 1.0 / stacks;
    var textureSInc = 1.0 / slices;

    var curr1, curr2, prev1, prev2;
    var t1, t2, s1, s2;

    var half = [];
    // number of stacks = number of points - 1 = 25 - 1 = 24
    for (var i = 0; i < stacks + 1; i++)
    {
        half.push(vec4(radius, height * i / stacks, 0, 1.0));
    }

    for (var i = 0; i < stacks; i++)
    {
        // the initial two points
        prev1 = init1 = half[i];
        prev2 = init2 = half[i + 1];

        // texture T coordinates
        t1 = textureTInc * i;
        t2 = textureTInc * (i + 1);

        // rotate around y axis
        for (var j = 0; j < slices; j++)
        {
            var m = rotate((j + 1) * 360 / slices, 0, 1, 0);
            curr1 = multiply(m, init1);
            curr2 = multiply(m, init2);

            //texture S coordinates
            s1 = textureSInc * j;
            s2 = textureSInc * (j + 1);

            //quad(prev1, curr1, curr2, prev2);
            quad(prev1, curr1, curr2, prev2, s1, s2, t1, t2);

            // currs used as prevs for the next two points
            prev1 = curr1;
            prev2 = curr2;
        }
    }
    */
}


function GeneratePyramid()
{
    var start = pointsArray.length;
    var pyramidVertices =
        [
            vec4(.5, -0.5, -0.5, 1.0), // back right 0
            vec4(-0.5, -0.5, -0.5, 1.0), // back left 1
            vec4(0.5, -0.5, 0.5, 1.0), // front right 2
            vec4(-0.5, -0.5, 0.5, 1.0), //front left 3 
            vec4(0.0, 0.5, 0.0, 1.0) // Apex 
        ];

    var pyramidIndices =
        [
            0, 1, 2, 0, 2, 3, 0, 1, 3,// Base
            4, 0, 2, 4, // Side 1
            4, 3, 2, 4, // Side 2
            4, 3, 1, 4, // Side 3
            4, 1, 0, 4 // Side 4
        ];

    for (var i = 0; i < pyramidIndices.length; i++)
    {
        var vertexIndex = pyramidIndices[i];
        var vertex = pyramidVertices[vertexIndex];
        pointsArray.push(vertex);
    }

    //console.log("points for pyramid", pointsArray);
    //console.log(start);
    var end = pointsArray.length;
    //console.log(end);
    shapesInfo["pyramid"].count = end - start;
}

function GenerateTorus(torusRadius, torusTubeRadius, torusSlices, torusStacks)
{
    //torusStacks is the number of points per slice, meaning 3 = triangular torus, etc. default is 20
    var start = pointsArray.length;
    // generate points for a torus
    for (var i = 0; i < torusSlices; i++)
    {
        var u = i / torusSlices * 2 * Math.PI;
        var cosU = Math.cos(u);
        var sinU = Math.sin(u);
        for (var j = 0; j <= torusStacks; j++)
        {
            var v = j / torusStacks * 2 * Math.PI;
            var cosV = Math.cos(v);
            var sinV = Math.sin(v);
            var x = (torusRadius + torusTubeRadius * cosV) * cosU;
            var y = (torusRadius + torusTubeRadius * cosV) * sinU;
            var z = torusTubeRadius * sinV;
            var normal = vec3(x, y, z);
            var texCoord = vec2(i / torusSlices, j / torusStacks);
            pointsArray.push(vec4(x, y, z, 1.0));
            normalsArray.push(normal);
            texCoordsArray.push(texCoord);
        }
    }
    //add a point to close the shape
    pointsArray.push(vec4(torusRadius + torusTubeRadius, 0, 0, 1.0));
    var end = pointsArray.length;
    shapesInfo["torus"].count = end - start;
}

function GenerateCircle()
{
    var start = pointsArray.length;
    const circleDetail = 2000;

    for (var i = 0; i < circleDetail; i++)
    {
        var angle = i * (2 * Math.PI / circleDetail);
        var x = Math.cos(angle);
        var y = Math.sin(angle);
        pointsArray.push(vec4(x, y, 0, 1));
    }
    //close the circle.
    angle = 0;
    pointsArray.push(vec4(Math.cos(angle), Math.sin(angle), 0, 1));

    var end = pointsArray.length;

    shapesInfo["circle"].count = end - start;
}

function GenerateTree()
{
    var start = pointsArray.length;

    GenerateCube();
    //transformations(0, 0, 0, 0, 0, 0, 1, 1, 1);
    //GenerateCube();

    var end = pointsArray.length;
    shapesInfo["tree"].count = end - start;
}