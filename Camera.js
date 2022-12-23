var Camera = {
	offset: {x:0, y:0},
	isPlayerCentered: function() {
		if(false) {
			//old method. it works, but its a bit wonky and it gives issues when teleporting at the edge of the map
			return ((Math.abs(Camera.offset.x) + hud.canvas_parent.width / 2).toFixed(0)/1 == (player.coords.x+16).toFixed(0)/1);
		} else {
			//new method
			var center_of_canvas = System.roundNearest(player.speed, (Math.abs(Camera.offset.x) + hud.canvas_parent.width / 2).toFixed(0)/1);
			var player_coords_x = System.roundNearest(player.speed, (player.coords.x + 16).toFixed(0) / 1);
			//compensate for active movement
			if( player.movement_state != 'idle' ) {
				if( player.dir == 'left' ) {
					player_coords_x = player_coords_x + player.speed;
				} else if(player.dir == 'right') {
					player_coords_x = player_coords_x - player.speed;
				} else if(player.movement_state == 'ascending') {
					//TODO: handle descending and ascending. use player.velocity.y
				} else if(player.movement_state == 'descending') {
					//TODO: handle descending and ascending. use player.velocity.y
				}
			}
			//DEBUG
			if( false ) {
				//center of canvas
				hud.canvas.fillStyle = "green";
				hud.canvas.fillRect(
					//destination coords
					center_of_canvas,
					player.coords.y-10,
					//destination size
					5,
					5
				);
				//player
				hud.canvas.fillStyle = "purple";
				hud.canvas.fillRect(
					//destination coords
					player_coords_x,
					player.coords.y-10,
					//destination size
					5,
					5
				);
			}
			//console.log( 'center_of_canvas: '+center_of_canvas+ ' , player_coords_x: '+player_coords_x + " ? "+(center_of_canvas == player_coords_x));
			return (center_of_canvas == player_coords_x);
		}
	},
	isAtLeftEdge: function() {
		return !(Math.abs(Camera.offset.x) + hud.canvas_parent.width <= (World.size.x*32) - 5);
	},
	isAtRightEdge: function() {
		return !(Camera.offset.x <= -5);
	},
	moveLeft: function() {
		//console.log('l');
		if(
			(!Camera.isAtLeftEdge() && Camera.isPlayerCentered()) //||
			//(!Camera.isAtRightEdge() && !Camera.isAtLeftEdge()) 
		) Camera.offset.x = Camera.offset.x - player.speed;
	},
	moveRight: function() {
		//console.log('r');
		if(
			(!Camera.isAtRightEdge() && Camera.isPlayerCentered()) //||
			//(!Camera.isAtLeftEdge() && !Camera.isAtRightEdge()) 
		) Camera.offset.x = Camera.offset.x + player.speed;
	},
	getViewRange: function(o) {
		if(typeof o != 'object' || typeof o.type != 'string' || o.type == 'tile') {
			//return the tile count
			var left = Math.floor( -Camera.offset.x / World.map.tileset.tilewidth );
			var right = Math.ceil( left + (hud.canvas_parent.width / World.map.tileset.tilewidth) ); //margin of error 1 tile towards the right
			var top = Math.floor( Camera.offset.y / World.map.tileset.tileheight );
			var bottom = Math.ceil( top + (hud.canvas_parent.height / World.map.tileset.tileheight) ); //margin of error 1 tile towards the bottom
		} else {
			//return the pixel count
			var left = Math.floor( -Camera.offset.x );
			var right = left + hud.canvas_parent.width;
			var top = Math.floor( Camera.offset.y );
			var bottom = top + hud.canvas_parent.height;
		}
		return {top:top, left:left, right:right, bottom:bottom};
	},
	centerOnPlayer: function() {
		//console.log('centering camera on player...');
		Camera.offset.x = -player.coords.x - 16 + (hud.canvas_parent.width/2) ;
		//a simple fix for a bug: when player is teleported to the edge of the map, and the camera is centered on the player, the camera gets stuck
		if(Camera.isAtRightEdge()) {
			while( Camera.isAtRightEdge() ) {
				Camera.offset.x--;
			}
		} else if(Camera.isAtLeftEdge()) {
			while( Camera.isAtLeftEdge() ) {
				Camera.offset.x++;
			}
		}
	}
};