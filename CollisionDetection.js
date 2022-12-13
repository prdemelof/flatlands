var CollisionDetection = {
	isColliding: function(o, render) {
		/*o = [
			{
				x: //horizontal position
				y: //vertical position
				z: //height
				w: //width
			}, two: ...
		]*/
		//SHOW BOUNDING BOX
		if(false || (typeof render != 'undefined' && render)) {
			hud.canvas.fillStyle = "purple";
			hud.canvas.fillRect(
				//destination coords
				o[0].x,
				o[0].y,
				//destination size
				o[0].w,
				o[0].z
			);
			hud.canvas.fillStyle = "red";
			hud.canvas.fillRect(
				//destination coords
				o[1].x,
				o[1].y,
				//destination size
				o[1].w,
				o[1].z
			);
		}
		//SHOW BOUNDING BOX
		return !(
			//((o[0].y + o[0].z) < (o[1].y)) || // < here was causing a false collision when moving left to right because the char y coord + char height is the same as below tile y coord
			((o[0].y + o[0].z) <= (o[1].y)) ||
			(o[0].y > (o[1].y + o[1].z)) ||
			((o[0].x + o[0].w) < o[1].x) ||
			(o[0].x > (o[1].x + o[1].w))
		);
	}
	
}
