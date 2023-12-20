// ******************************************
// Draw simple and primitive objects
// ******************************************

function RenderCube(length)
{
    mvMatrixStack.push(modelViewMatrix);

    transformations(0, 0, 0, 0, 0, 0, length, length, length);
    //gl.uniform1i(gl.getUniformLocation(program, "texture"), 1);
    gl.drawArrays(gl.TRIANGLES, shapesInfo["cube"].start, shapesInfo["cube"].count);
    //gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

    modelViewMatrix = mvMatrixStack.pop();
}

function RenderSphere()
{
    mvMatrixStack.push(modelViewMatrix);

    //just drawing 2 round cylinders to at least get the solid shape
    gl.drawArrays(gl.TRIANGLES, shapesInfo["sphere"].start, shapesInfo["sphere"].count);
    transformations(0, 0, 0, 0, 0, 90, 1, 1, 1);
    gl.drawArrays(gl.TRIANGLES, shapesInfo["sphere"].start, shapesInfo["sphere"].count);

    modelViewMatrix = mvMatrixStack.pop();
}

function RenderWall(thickness, gridUnitSize)
{
    mvMatrixStack.push(modelViewMatrix);

    transformations(0.5, 0.5 * thickness, 0.5, 0, 0, 0, 1, thickness, 1);
    RenderCube(gridUnitSize);

    modelViewMatrix = mvMatrixStack.pop();
}

function RenderCylinder(x, y, z, rotX, rotY, rotZ, scaR, scaH)
{
    mvMatrixStack.push(modelViewMatrix);

    transformations(x, y, z, rotX, rotY, rotZ, scaR, scaH, scaR);
    gl.drawArrays(gl.TRIANGLES, shapesInfo["cylinder"].start, shapesInfo["cylinder"].count);

    modelViewMatrix = mvMatrixStack.pop();
}

// ******************************************
// Draw composite objects
// ******************************************
function RenderGround(thickness, gridUnitSize)
{
    mvMatrixStack.push(modelViewMatrix);

    lightAmbient = vec4(0.3, 0.3, 0.3, 1.0);
    lightDiffuse = vec4(.8, .8, .8, 1.0);
    lightSpecular = vec4(.8, .8, .8, 1.0);

    materialAmbient = vec4(.95, 0.9, 0.8, 1.0);
    materialDiffuse = vec4(0.1, 0.8, 0.2, 1.0); //main coloring
    materialSpecular = vec4(0, 0, 0, 1.0);
    sendLightingToGPU();


    //enable large tiling
    var tiling = false;
    if (tiling)
    {
        for (var i = 0; i < gridSize; i++)
        {
            mvMatrixStack.push(modelViewMatrix);
            transformations(i, 0, 0, 0, 0, 0, 1, 1, 1);
            for (var j = 0; j < gridSize; j++)
            {
                //transformations(0, , 1, 0, 0, 0, 1, 1, 1);
                transformations(0, 0, 1, 0, 0, 0, 1, 1, 1);
                RenderWall(thickness, gridUnitSize);
            }
            modelViewMatrix = mvMatrixStack.pop();
        }
    }


    // First Tile
    RenderWall(thickness, gridUnitSize);

    //Second Tile
    transformations(0, 0, -1, 0, 0, 0, 1, 1, 1);
    RenderWall(thickness, gridUnitSize);

    resetLighting();
    modelViewMatrix = mvMatrixStack.pop();
    transformations(0, thickness + 0.0001, 0, 0, 0, 0, 1, 1, 1); //move everything above the ground
}

function RenderSun(x, y, z, sca)
{
    mvMatrixStack.push(modelViewMatrix);

    lightDiffuse = vec4(1, 1, 1, 1.0);
    materialAmbient = vec4(1, 1, 1, 1.0);
    materialDiffuse = vec4(0.5, 0.5, 0, 1.0); //yellow sun
    sendLightingToGPU();

    transformations(x, y, z, 0, 0, 0, sca, sca, sca);
    RenderSphere();

    resetLighting();

    modelViewMatrix = mvMatrixStack.pop();
}

function RenderPyramid(x, y, z, rotX, rotY, rotZ, scale)
{
    mvMatrixStack.push(modelViewMatrix);

    lightAmbient = vec4(.0, .0, .0, 1.0);
    lightDiffuse = vec4(.8, .8, .8, 1.0);
    lightSpecular = vec4(.8, .8, .8, 1.0);

    materialAmbient = vec4(.8, .8, .8, 1.0);
    materialDiffuse = vec4(0.9, 0.7, 0.4, 1.0); //main coloring
    materialSpecular = vec4(1, 1, 1, 1.0);
    sendLightingToGPU();
    transformations(x, y, z, rotX, rotY, rotZ, scale, scale, scale);
    /*
    for (var i = shapesInfo["pyramid"].start; i < shapesInfo["pyramid"].start + shapesInfo["pyramid"].count - 3; i++)
    {
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }
    */
    gl.drawArrays(gl.TRIANGLES, shapesInfo["pyramid"].start, shapesInfo["pyramid"].count);

    resetLighting();

    modelViewMatrix = mvMatrixStack.pop();
}

function RenderTorus(x, y, z, rotX, rotY, rotZ, sca)
{
    mvMatrixStack.push(modelViewMatrix);
    lightAmbient = vec4(.0, .0, .0, 1.0);
    lightDiffuse = vec4(.8, .8, .8, 1.0);
    lightSpecular = vec4(.8, .8, .8, 1.0);

    materialAmbient = vec4(.8, .8, .8, 1.0);
    materialDiffuse = vec4(0.9, 0.2, 0.2, 1.0); //main coloring
    materialSpecular = vec4(1, 1, 1, 1.0);
    sendLightingToGPU();
    /*
    var start = shapesInfo["torus"].start;
    var count = shapesInfo["torus"].count;
    for (var i = start; i < start + count - 1; i += 3)
    {
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }
    */
    transformations(x, y, z, rotX, rotY, rotZ, sca, sca, sca);
    //render drawArrays
    //gl.drawArrays(gl.TRIANGLES, shapesInfo["torus"].start, shapesInfo["torus"].count);
    gl.drawArrays(gl.LINE_STRIP, shapesInfo["torus"].start, shapesInfo["torus"].count);
    transformations(0, 0, 0, 90, 0, 0, 1, 1, 1);
    gl.drawArrays(gl.LINE_STRIP, shapesInfo["torus"].start, shapesInfo["torus"].count);
    transformations(0, 0, 0, 0, 90, 0, 1, 1, 1);
    gl.drawArrays(gl.LINE_STRIP, shapesInfo["torus"].start, shapesInfo["torus"].count);

    resetLighting();
    modelViewMatrix = mvMatrixStack.pop();
}

function RenderCircle(x, y, z, rotX, rotY, rotZ, sca)
{
    mvMatrixStack.push(modelViewMatrix);

    transformations(x, y, z, rotX, rotY, rotZ, sca, sca, sca);
    gl.drawArrays(gl.LINE_STRIP, shapesInfo["circle"].start, shapesInfo["circle"].count);
    //console.log("start", shapesInfo["circle"].start);
    //console.log("count", shapesInfo["circle"].count);

    modelViewMatrix = mvMatrixStack.pop();
}

function RenderTree(x, y, z, rotX, rotY, rotZ, sca)
{
    mvMatrixStack.push(modelViewMatrix);



    transformations(x, y, z, rotX, rotY, rotZ, sca, sca, sca);
    gl.drawArrays(gl.TRIANGLES, shapesInfo["tree"].start, shapesInfo["tree"].count);

    modelViewMatrix = mvMatrixStack.pop();
}