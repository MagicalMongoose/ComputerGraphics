function GenerateGhost() 
{
        // begin body  (87 points)
	points.push(vec2(3, 0));
        
	points.push(vec2(3.1, 1));
        
	points.push(vec2(3.5, 2));
        
	points.push(vec2(4, 3.6));
        
	points.push(vec2(4, 4));
        
	points.push(vec2(4.1, 3.3));
        
	points.push(vec2(4.5, 3));
        
	points.push(vec2(5.5, 3));
        
	points.push(vec2(6,3.5));
        
	points.push(vec2(6.5, 4));
        
	points.push(vec2(6.7, 4.2));
        
	points.push(vec2(6.8, 2.8));
        
	points.push(vec2(7, 2.4));
        
	points.push(vec2(7.5, 2));
        
	points.push(vec2(8, 2));
        
	points.push(vec2(8.5, 1.7));
        
	points.push(vec2(9, 1.2));
        
	points.push(vec2(10, 0.8));
        
	points.push(vec2(10, -2));
        
	points.push(vec2(10.4, -2.8));
        
	points.push(vec2(10.5, -3.5));
        
	points.push(vec2(10.7, -1.7));
        
	points.push(vec2(11, -1.4));
        
	points.push(vec2(11.2, -1.5));
        
	points.push(vec2(12, -2));
        
	points.push(vec2(12.5, -2.5));
        
	points.push(vec2(13, -3));
        
	points.push(vec2(13, -2));
        
	points.push(vec2(12.8, -0.5));
        
	points.push(vec2(12, 0));
        
	points.push(vec2(12.5, 0.5));
        
	points.push(vec2(11, 1));
        
	points.push(vec2(10.8, 1.4));
        
	points.push(vec2(10.2, 2.5));
        
	points.push(vec2(10, 4));
        
	points.push(vec2(9.8, 7.5));
        
	points.push(vec2(7.5, 9.5));
        
	points.push(vec2(6, 11));
        
	points.push(vec2(3, 12));
        
	points.push(vec2(.5, 15));
        
	points.push(vec2(0, 17));
        
	points.push(vec2(-1.8, 17.4));
        
	points.push(vec2(-4, 16.6));
        
	points.push(vec2(-5, 14));
        
	points.push(vec2(-6, 10.5));
        
	points.push(vec2(-9, 10));
        
	points.push(vec2(-10.5, 8.5));
        
	points.push(vec2(-12, 7.5));
        
	points.push(vec2(-12.5, 4.5));
        
	points.push(vec2(-13, 3));
        
	points.push(vec2(-13.5, -1));
        
	points.push(vec2(-13, -2.3));
        
	points.push(vec2(-12, 0));
        
	points.push(vec2(-11.5, 1.8));
        
	points.push(vec2(-11.5, -2));
        
	points.push(vec2(-10.5, 0));
        
	points.push(vec2(-10, 2));
        
	points.push(vec2(-8.5, 4));
        
	points.push(vec2(-8, 4.5));
        
	points.push(vec2(-8.5, 7));
        
	points.push(vec2(-8, 5));
        
	points.push(vec2(-6.5, 4.2));
        
	points.push(vec2(-4.5, 6.5));
        
	points.push(vec2(-4, 4));
        
	points.push(vec2(-5.2, 2));
        
	points.push(vec2(-5, 0));
        
	points.push(vec2(-5.5, -2));
        
	points.push(vec2(-6, -5));
        
	points.push(vec2(-7, -8));
        
	points.push(vec2(-8, -10));
        
	points.push(vec2(-9, -12.5));
        
	points.push(vec2(-10, -14.5));
        
	points.push(vec2(-10.5, -15.5));
        
	points.push(vec2(-11, -17.5));
        
	points.push(vec2(-5, -14));
        
	points.push(vec2(-4, -11));
        
	points.push(vec2(-5, -12.5));
        
	points.push(vec2(-3, -12.5));
        
	points.push(vec2(-2, -11.5));
        
	points.push(vec2(0, -11.5));
        
	points.push(vec2(1, -12));
        
	points.push(vec2(3, -12));
        
	points.push(vec2(3.5, -7));
        
	points.push(vec2(3, -4));
        
	points.push(vec2(4, -3.8));
        
	points.push(vec2(4.5, -2.5));
        
	points.push(vec2(3, 0));
        
        // end body

	// begin mouth (6 points)
	points.push(vec2(-1, 6));
        
	points.push(vec2(-0.5, 7));
        
	points.push(vec2(-0.2, 8));
        
	points.push(vec2(-1, 8.6));
        
	points.push(vec2(-2, 7));
        
	points.push(vec2(-1.5, 5.8));
        
        // end mouth

	// begin nose (5 points)
	points.push(vec2(-1.8, 9.2));
        
	points.push(vec2(-1, 9.8));
        
	points.push(vec2(-1.1, 10.6));
        
	points.push(vec2(-1.6, 10.8));
        
	points.push(vec2(-1.9, 10));
        

        // begin left eye, translate (2.6, 0.2, 0) to draw the right eye
        // outer eye, draw line loop (9 points)
	points.push(vec2(-2.9, 10.8));
        
	points.push(vec2(-2.2, 11));
        
	points.push(vec2(-2, 12));
        
	points.push(vec2(-2, 12.8));
        
	points.push(vec2(-2.2, 13));
        
	points.push(vec2(-2.5, 13));
        
	points.push(vec2(-2.9, 12));
        
	points.push(vec2(-3, 11));
        
	points.push(vec2(-2.9, 10.5));
        

        // eye ball, draw triangle_fan (7 points)
	points.push(vec2(-2.5, 11.4));  // middle point
        
	points.push(vec2(-2.9, 10.8));
        
	points.push(vec2(-2.2, 11));
        
	points.push(vec2(-2, 12));
        
	points.push(vec2(-2.9, 12));
        
	points.push(vec2(-3, 11));
        
	points.push(vec2(-2.9, 10.5));
        
        // end left eye

        for (var i = 0; i < 114; i++)
                colors.push(vec4(1, 1, 1, 1)); //white
}
