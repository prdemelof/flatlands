//PLAYER
var player = {
	name: "player",
	race: 'human', //player will be able to choose a race
	image: {
		width:16, height:16, scale:2, sprite_sheet: new Image(),
		animation: {
			frame: 0,
			frames_passed: 0,
			idle: {x:0, y:0, frames:8, speed:5},
			moving: {x:0, y:1, frames:6, speed:2},
			ascending: {x:0, y:2, frames:1, speed:2},
			descending: {x:1, y:2, frames:1, speed:2},
			climbing: {x:3, y:4, frames:1, speed:5},
		}
	},
	hair: {style:null, color:null},
	sfx: {
		jump: SoundEngine.getSfx({file: "player/jump_1.wav"}),
		//land: SoundEngine.getSfx({file:"player/jumpland.wav"}),
		land: SoundEngine.getSfx({file: "player/land_1.ogg"}),
	},
	dir: 'right', //looking towards which direction
	coords: {x:config.player_start_coords.x, y:config.player_start_coords.y},
	velocity: {y:0.0}, //x velocity is being handled by "speed"
	walk_speed: 5, //to use as a reference of different movements speeds
	climb_speed: 3, //current climbing speed
	speed: 0, //current movement speed
	movement_state: 'idle', //idle, moving, ascending, descending, climbing
	on_ground: false,
	startJump: function() {
		//space key down
		if(!config.paused) {
			if(player.on_ground || player.movement_state == 'climbing') {
				player.sfx.jump.play();
				player.velocity.y = -15.0;
				player.on_ground = false;
			}
		}
	},
	endJump: function() {
		//space key up
		if(player.velocity.y < -6.0) {
			//stop going up if releasing the key before reaching max height
			player.velocity.y = -6.0;
		}
	},
	update: function() {
		//TODO: update stuff is currently in draw function. need to move it here
	},
	draw: function() {
		//control speed
		if(!config.paused) player.speed = player.walk_speed;
		else player.speed = 0;
		
		//jump - keeps jumping if holding down key. otherwise, currently handled in InputManager
		/*if(inputManager.key_space) {
			player.startJump();
		} else {
			player.endJump();
		}*/
		
		//teleport
		var teleporting = false;
		if(player.on_ground && player.movement_state == 'idle' && inputManager.key_w) {
			var teleporting = player.collideWithTeleporters();
			if(teleporting) {
				//console.log(teleporting);
				config.pause();
				$("#loading_teleporter_1").fadeIn(100, function() {
					//reset the player
					//player.on_ground = true;
					//player.movement_state = 'idle';
					World.loadMap({"biome":teleporting.to_biome, "map":teleporting.to_map});
					//player.coords.x = teleporting.to_coords.x;
					//player.coords.y = teleporting.to_coords.y;
					player.coords.x = teleporting.to_coords.x * World.map.tileset.tilewidth;
					player.coords.y = teleporting.to_coords.y * World.map.tileset.tileheight;
					Camera.centerOnPlayer();
					setTimeout(function() {
						config.unpause();
						$("#loading_teleporter_1").fadeOut(100);
					}, 200);
				});
				return; //while teleporting, we dont need to run any calculations so we stop the entire process until teleportation is complete
			}
		}
		
		//handle colliding with ground
		var colliding_with_ground = this.collideWithGround();
		if(colliding_with_ground) {
			if(player.movement_state == 'descending') {
				//landing
				player.on_ground = true;
				player.velocity.y = 0;
				if(!config.paused) player.sfx.land.play();
			} else if(player.movement_state == 'ascending') {
				//hitting something above, fall back down
				//player.velocity.y = 6.0;
			}
		} else {
			if(player.movement_state != 'ascending') {
				player.on_ground = false;
			} else if(player.movement_state == 'ascending') {
				//hitting something above, fall back down
				//player.velocity.y = 6.0;
			}
		}
		
		//handle colliding with climbables
		var at_climbable = false;
		//if(!config.paused && (inputManager.key_w || inputManager.key_s)) { //dont allow moving left or right on ladders
		if(!config.paused) { //allow moving left or right on ladders
			if(inputManager.key_s) {
				//down
				var collide_climbables_coords = {
					"x": Math.floor( player.coords.x + ((player.image.width*player.image.scale)/2)  ),
					"y": Math.floor( player.coords.y + player.climb_speed )
				}
			} else {
				//up
				var collide_climbables_coords = {
					"x": Math.floor( player.coords.x + ((player.image.width*player.image.scale)/2)  ),
					"y": Math.floor( player.coords.y  ) 
				}
			}
			at_climbable = player.collideWithClimbables({"coords":collide_climbables_coords});
		}
		
		if(player.movement_state == 'climbing') {
			//TODO: handle the climbing case
		} else {
			if(!player.on_ground) {
				//if(player.velocity.y <= 15) { //limit fall speed
					player.velocity.y += World.gravity;
				//}
			}
			player.velocity.y += 0;
			player.coords.y += player.velocity.y;
		}
		
		//find out the movement state and facing direction
		if(
			(player.speed && (inputManager.key_a || inputManager.key_d)) ||
			(inputManager.key_w || inputManager.key_s) && at_climbable && player.climb_speed
		) {
			if( player.movement_state != 'climbing' && player.speed && (inputManager.key_a || inputManager.key_d) ) {
				//moving left or right
				player.movement_state = 'moving';
				if(inputManager.key_a && player.coords.x > 0) {
					player.dir = 'left';
				}
				if(inputManager.key_d && player.coords.x < World.size.x * World.map.tileset.tilewidth - (player.image.width*player.image.scale)) {
					player.dir = 'right';
				}
			}
			if( (inputManager.key_w || inputManager.key_s) && at_climbable && player.climb_speed ) {
				//climbing
				if( inputManager.key_w && Math.floor(player.coords.y / World.map.tileset.tileheight) >= 0 ) { //if the character is not at the top of the map
					player.movement_state = 'climbing';
					player.dir = 'up';
				} else if( inputManager.key_s && Math.floor(player.coords.y / World.map.tileset.tileheight) < World.size.y ) { //if the character is not at the bottom of the map
					player.movement_state = 'climbing';
					player.dir = 'down';
				}
			}
		} else {
			if( player.movement_state != 'climbing' ) {
				player.movement_state = 'idle';
			}
		}
		
		//move the character left, right or up, down if climbing
		if(player.movement_state == 'moving') {
			if(player.dir == 'left') {
				player.coords.x = player.coords.x - player.speed;
				Camera.moveRight();
			}
			if(player.dir == 'right') {
				player.coords.x = player.coords.x + player.speed;
				Camera.moveLeft();
			}
		} else if(player.movement_state == 'climbing' && at_climbable) {
			if(player.dir == 'up' && inputManager.key_w) {
				player.coords.y = player.coords.y - player.climb_speed;
				//Camera.moveLeft();
			} else if(player.dir == 'down' && !colliding_with_ground && inputManager.key_s) {
				player.coords.y = player.coords.y + player.climb_speed;
				//Camera.moveLeft();
			} else if(inputManager.key_a) {
				//going left on the climbable
				player.coords.x = player.coords.x - 1;
				//Camera.moveRight();
				Camera.centerOnPlayer();
			} else if(inputManager.key_d) {
				//going right on the climbable
				player.coords.x = player.coords.x + 1;
				Camera.centerOnPlayer();
				//Camera.moveLeft();
			}
		}
		
		//ascending or descending
		if(!player.on_ground) {
			//player.movement_state = (player.velocity.y < 0 ? 'ascending' : 'descending' );
			if(player.velocity.y < 0) player.movement_state = 'ascending';
			//if(player.velocity.y > 0) player.movement_state = 'descending';
			if(player.velocity.y > 0 && player.movement_state != 'climbing') player.movement_state = 'descending';
		}
		
		var animation = player.image.animation[player.movement_state];
		
		//make sure we dont mis-render the wrong frame when player is changing movement state
		if(player.image.animation.frame > animation.frames - 1) {
			player.image.animation.frame = 0;
		}
		
		//render the player
		//flip the image if moving left
		var flip = (player.dir == 'left');
		hud.canvas.save();
		hud.canvas.scale(flip ? -1 : 1, 1);
		hud.canvas.drawImage(
			//image file
			player.image.sprite_sheet,
			
			//source coords
			(
				animation.frames > 1 ? (animation.x * player.image.width) + (player.image.width * player.image.animation.frame) :
				animation.x * player.image.width
			),
			player.image.height * animation.y,
			
			//source dimensions
			player.image.width,
			player.image.height,
			
			//destination coords
			(flip ? ((player.image.width*player.image.scale) * -1)-player.coords.x : 0+player.coords.x), //flip or no flip
			player.coords.y,
			
			//source dimensions
			player.image.width * player.image.scale,
			player.image.height * player.image.scale,
		);
		
		//render the hair
		if( player.hair.style != null && player.hair.style.image != null ) {
			hud.canvas.drawImage(
				//image file
				player.hair.style.image,
				
				//source coords
				(
					animation.frames > 1 ? (animation.x * player.hair.style.width) + (player.hair.style.width * player.image.animation.frame) :
					animation.x * player.hair.style.width
				),
				player.hair.style.height * animation.y,
				
				//source dimensions
				player.hair.style.width,
				player.hair.style.height,
				
				//destination coords
				(flip ? ((player.hair.style.width*player.hair.style.scale) * -1)-player.coords.x : 0+player.coords.x), //flip or no flip
				player.coords.y,
				
				//source dimensions
				player.hair.style.width * player.hair.style.scale,
				player.hair.style.height * player.hair.style.scale,
			);
			
			//update the hair color
			if(player.hair.color != null) {
				player.applyHairColor();
			}
		}
		hud.canvas.restore();
		
		if(player.image.animation.frames_passed > animation.speed) {
			if(player.image.animation.frame < animation.frames - 1) player.image.animation.frame++;
			else player.image.animation.frame = 0;
			player.image.animation.frames_passed = 0;
		} else {
			player.image.animation.frames_passed++;
		}
	},
	setHairStyle: function(hair_id) {
		//choose a new hair style
		player.hair.style = Hairs[player.race][hair_id];
		player.hair.style.image = System.loadImage({path: 'image/spritesheets/hair/'+player.race+'/'+hair_id+'.png'});
		//player.setHairColor({r:65, g:24, b:6});
	},
	setHairColor: function(color) {
		//choose a new hair color
		player.hair.color = color;
	},
	applyHairColor: function() {
		//replace the spritesheet pixels to the correct color chosen by the player
		const canvas = document.querySelector("canvas");
		const { width, height } = canvas;
		const aaa = hud.canvas.getImageData(0, 0, width, height);
		const { data } = aaa;
		const { length } = data;
		
		//#e510da - 229, 16, 218, 255 - color values in spritesheet
		for(let i=0; i<length; i+=4) { //red, green, blue, and alpha
			const r = data[i + 0];
			const g = data[i + 1];
			const b = data[i + 2];
			const a = data[i + 3];
			if(a === 255) { //alpha is 100%
				if(r === 229 && g === 16 && b === 218) { //this pixel of the image is the one we need to replace with something else
					data[i + 0] = player.hair.color.r;
					data[i + 1] = player.hair.color.g;
					data[i + 2] = player.hair.color.b;
				}
			}
		}
		
		//replace all relevant pixels on the entire canvas
		hud.canvas.putImageData(aaa, 0, 0);
	},
	getCollisionRange: function(o) {
		if(typeof o == 'undefined') o = {};
		//var tiles = 2; //how far should we scan for collision
		var tiles = ( typeof o.tiles != 'undefined' ? o.tiles : 2 ); //how far should we scan for collision
		if( typeof o.type == 'undefined' || o.type == 'tile') {
			return {
				//left: Math.floor( (player.coords.x - ((tiles - 0) * World.map.tileset.tilewidth)) / World.map.tileset.tilewidth ),
				left: Math.floor( (player.coords.x - ((tiles - 0) * World.map.tileset.tilewidth)) / World.map.tileset.tilewidth ),
				right: Math.ceil( (player.coords.x + ((tiles - 1) * World.map.tileset.tilewidth)) / World.map.tileset.tilewidth ),
				top: Math.floor( (player.coords.y - ((tiles - 0) * World.map.tileset.tilewidth)) / World.map.tileset.tileheight ),
				bottom: Math.floor( (player.coords.y + (player.image.height*player.image.scale) + ((tiles - 1) * World.map.tileset.tileheight)) / World.map.tileset.tileheight ),
			};
		} else {
			return {
				left: player.coords.x - (tiles * World.map.tileset.tilewidth),
				right: player.coords.x + (tiles * World.map.tileset.tilewidth),
				top: player.coords.y - (tiles * World.map.tileset.tilewidth),
				bottom: player.coords.y + (player.image.height*player.image.scale) + (tiles * World.map.tileset.tilewidth),
			};
		}
	},
	getTileId: function(o) {
		var tile_x = Math.floor( o.coords.x / World.map.tileset.tilewidth );
		var tile_y = Math.floor( o.coords.y / World.map.tileset.tileheight );
		if( typeof o.layer.data[tile_y] != 'undefined' && typeof o.layer.data[tile_y][tile_x] != 'undefined' ) {
			var tile_id = o.layer.data[tile_y][tile_x];
		} else {
			
		}
		return tile_id - 1; //-1 because tiles actually start from 0
	},
	getTileCoords: function() {
		return {
			x: Math.round(player.coords.x / World.map.tileset.tilewidth),
			y: Math.round(player.coords.y / World.map.tileset.tileheight)
		};
	},
	collideWithGeometry: function(o) {
		
		//NOT IMPLEMENTED
		return;
		
		if(player.movement_state == 'idle') {
			//not moving, obviously not going to collide (edit: unless falling into something)
			//return false;
		}
		if( // o.
			typeof World.map.tileset.colliders == 'undefined' || !World.map.tileset.colliders.length()
		) {
			//no collidable object in the tilesheet
			return false;
		}
		
		for(var layer=0; layer<World.map.layers.length; layer++) {
			
			//if( World.map.layers[layer].type == 'tilelayer' && World.map.layers[layer].visible ) {
			if( true ) { //we dont check if the layer is visible because we might want invisible colliders
				//only scan for collisions near the player
				var view_range = player.getCollisionRange();
				for(var y=view_range.top; y<view_range.bottom; y++) {
					//any better way to handle this?
					if(y<0) {continue;} //too much margin, skip this inexistent row
					else if(y>World.size.y) break; //reached the bottom, stop everything
					var row = World.map.layers[layer].data[y];
					for(var x=view_range.left; x<view_range.right; x++) {
						if(x<0) {continue;} //too much margin, skip this inexistent tile
						else if(x>World.size.x) break; //reached the farthest, next row
						
						//if getting x then ignore tiles above and below
						if(
							(typeof o != 'undefined' && o.dir == 'x') &&
							(y >= ( player.coords.y / World.map.tileset.tileheight ) || y > ( player.coords.y / World.map.tileset.tileheight ))
						) {
							continue;
						}
						
						//why row becomes undefined???
						if(typeof row == 'undefined') {
							continue;
						}
						
						var tile_id = row[x];
						if(!tile_id) continue; //empty tile, void
						tile_id--; //we need this because the tileset doesnt start at 0, it starts at 1
						
						//if(typeof World.map.tileset.tiles[tile_id] == 'undefined' || !World.map.tileset.tiles[tile_id].visible) {
						if(typeof World.map.tileset.colliders[tile_id] == 'undefined' ) {
							//this tile is not collidable or is disabled
							continue;
						}
						
						var next_step = $.parseJSON(JSON.stringify(player.coords));
						if(!player.on_ground && player.movement_state == 'ascending') {
							next_step.y = next_step.y + player.velocity.y;
						} else if(!player.on_ground && player.movement_state == 'descending') {
							next_step.y = next_step.y + player.velocity.y;
						} else if(typeof o != 'undefined' && o.dir == 'y') {
							next_step.y = next_step.y + player.velocity.y+1;
						}
						if(inputManager.key_a) {
							next_step.x = next_step.x - player.speed;
						} else if(inputManager.key_d) {
							next_step.x = next_step.x + player.speed;
						}
						
						colliding = CollisionDetection.isColliding([
							{x:next_step.x, y:next_step.y, z:player.image.height*player.image.scale, w:player.image.width*player.image.scale},
							//tile
							{
								x: World.map.tileset.tilewidth * x, y: (World.map.tileset.tileheight * y),
								z: World.map.tileset.tileheight, w: World.map.tileset.tileheight
							}
						]);
						
						if(colliding) {
							if(!player.on_ground && player.movement_state == 'ascending') {
								config.player_start_coords.y = (y*32) + 32 + (player.image.height*player.image.scale);
							} else if(!player.on_ground && player.movement_state == 'descending') {
								config.player_start_coords.y = (y*32) - 32;
							}
							return colliding;
						}
						
					}
				}
				
			}
			
		}
		return false;
	},
	collideWithGround: function(o) {
		if(
			typeof World.map.tileset.colliders == 'undefined' || !World.map.tileset.colliders.length()
		) {
			//no collidable object in the tilesheet
			return false;
		}
		
		//TODO: update this code to use the new Player.getTileId() y-1 to get tile under the character
		
		for(var layer=0; layer<World.map.layers.length; layer++) {
			if( true && World.map.layers[layer].collidable ) { //we dont check if the layer is visible because we might want invisible colliders
				//only scan for collisions near the player
				var view_range = player.getCollisionRange({tiles: 1});
				var y = view_range.bottom; //below the player character
				for(var x=view_range.left; x<view_range.right+1; x++) {
					//SHOW BOUNDING BOX - SCANNED TILES
					if( false ) {
						hud.canvas.fillStyle = "green";
						hud.canvas.fillRect(
							//destination coords
							x * 32,
							parseInt(player.coords.y) + parseInt(player.image.height*player.image.scale),
							//destination size
							World.map.tileset.tilewidth,
							World.map.tileset.tileheight
						);
					}
					if(y<0) {
						//too much margin, skip this inexistent row
						//console.log('1');
						continue;
					} else if(y>World.size.y) {
						//reached the bottom, stop everything
						//console.log('2');
						continue;
					};
					var row = World.map.layers[layer].data[y];
					if(x<0) {
						//too much margin, skip this inexistent tile
						//console.log('3');
						continue;
					} else if(x>World.size.x) {
						//reached the farthest, next row
						//console.log('4');
						continue;
					};
					//why row becomes undefined???
					if(typeof row == 'undefined') {
						//console.log('5');
						continue;
					}
					var tile_id = row[x];
					if(!tile_id) {
						//empty tile, void
						//console.log('6 - tile_id: '+tile_id);
						continue;
					};
					tile_id--; //we need this because the tileset doesnt start at 0, it starts at 1
					if(typeof World.map.tileset.colliders[tile_id] == 'undefined' ) {
						//this tile is not collidable or is disabled
						//console.log('7 - not colidable - tile_id: '+tile_id);
						continue;
					}
					var collided_tile_coords = {
						x: x * World.map.tileset.tilewidth,
						y: y * World.map.tileset.tileheight,
						z: World.map.tileset.colliders[tile_id].height,
						w: World.map.tileset.colliders[tile_id].width
					};
					colliding = CollisionDetection.isColliding([
						
						//{x:player.coords.x, y:player.coords.y + (player.image.height*player.image.scale) - player.velocity.y, z:1 + player.velocity.y, w:player.image.width*player.image.scale},
						{
							x:player.coords.x,
							y:player.coords.y + (player.image.height*player.image.scale) - player.velocity.y,
							z:1 + player.velocity.y,
							w:player.image.width*player.image.scale
						},
						
						//tile
						{
							x: collided_tile_coords.x, y: collided_tile_coords.y, //-1
							z: 1, w: collided_tile_coords.w
						}
					], false);
					if(!colliding) continue; //try the next tile.. we try a total of 3 underneath the character
					if(colliding) {
						if( player.coords.y != y*(player.image.height*player.image.scale) && player.movement_state != 'ascending' ) {
							//player is colliding with ground but is not exactly level with the ground... sometimes this happens for some reason, character digs into the ground a little
							player.coords.y = y * World.map.tileset.tileheight - (player.image.height*player.image.scale);
						}
					}
					return colliding;
				}
			}
		}
		//return true;
	},
	collideWithTeleporters: function(o) {
		var colliding = false;
		var player_tile_coords = player.getTileCoords();
		if(
			typeof World.map.teleporters != 'undefined' &&
			typeof World.map.teleporters[player_tile_coords.y] != 'undefined' &&
			typeof World.map.teleporters[player_tile_coords.y][player_tile_coords.x] != 'undefined'
		) {
			//we are in a teleporter
			colliding = true;
		}
		if(colliding) {
			return World.map.teleporters[player_tile_coords.y][player_tile_coords.x];
		} else {
			return false;
		}
	},
	collideWithClimbables: function(o) {
		if(player.movement_state == 'idle') {
			//not moving, obviously not going to collide (edit: unless falling into something)
			//return false;
		}
		
		//TODO: loop through the layers of this map
		
		var tile_id = player.getTileId({"layer":World.map.layers[0], "coords": {"x":o.coords.x, "y":o.coords.y}});
		return $.inArray(tile_id, World.map.tileset.climbables) !== -1;
	}
};

player.image.sprite_sheet.src = "image/player/player_sprite_sheet.png";
//player.hair_image.sprite_sheet.src = "image/player/hair_sprite_sheet.png";
