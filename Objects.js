var Objects = {
	scene: {
		//"teleporter": { image: {"w":32, "h":64}, animations: {"idle": {"x":0, "y":0, "frames":8, "speed":2}} },
		water_grass_fields: { image: {w:32, h:32}, animations: {idle: {x:0, y:0, frames:8, speed:2}} },
		water_jungle: { image: {w:32, h:32}, animations: {idle: {x:0, y:0, frames:8, speed:2}} },
	},
	mob: {
		mushroom_1: { scale: 2, image: {w:16, h:16}, walk_speed: 1, animations: {idle: {x:0, y:0, frames:4, speed:2}, moving: {x:0, y:1, frames:4, speed:2}} },
		mushroom_2: { scale: 2, image: {w:16, h:16}, walk_speed: 1, animations: {idle: {x:0, y:0, frames:4, speed:2}, moving: {x:0, y:1, frames:4, speed:2}} },
		mushroom_3: { scale: 2, image: {w:16, h:16}, walk_speed: 1, animations: {idle: {x:0, y:0, frames:4, speed:2}, moving: {x:0, y:1, frames:4, speed:2}} },
		mushroom_4: { scale: 2, image: {w:16, h:16}, walk_speed: 1, animations: {idle: {x:0, y:0, frames:4, speed:2}, moving: {x:0, y:1, frames:4, speed:2}} },
		bee_1: { scale: 2, image: {w:18, h:18}, walk_speed: 2, animations: {idle: {x:0, y:0, frames:4, speed:1}} },
		bomb_1: { scale: 2, image: {w:17, h:17}, walk_speed: 1, animations: {idle: {x:0, y:0, frames:4, speed:1}, moving: {x:0, y:1, frames:4, speed:2}} },
	},
	item: {
		coin_1: { scale:2, image: {w:16, h:16}, animations: {idle: {x:0, y:0, frames:12, speed:2}} },
		honey_1: { scale:2, image: {w:16, h:16}, animations: {idle: {x:0, y:0, frames:4, speed:2}} },
		heart_1: { scale:2, image: {w:16, h:16}, animations: {idle: {x:0, y:0, frames:4, speed:2}} },
		key_1: { scale:2, image: {w:16, h:16}, animations: {idle: {x:0, y:0, frames:4, speed:2}} },
		mush_1: { scale:2, image: {w:16, h:16}, animations: {idle: {x:0, y:0, frames:4, speed:2}} },
		mush_2: { scale:2, image: {w:16, h:16}, animations: {idle: {x:0, y:0, frames:4, speed:2}} },
		mush_3: { scale:2, image: {w:16, h:16}, animations: {idle: {x:0, y:0, frames:4, speed:2}} },
		mush_4: { scale:2, image: {w:16, h:16}, animations: {idle: {x:0, y:0, frames:4, speed:2}} }
	}
};

var objectMethods = {
	'mob': {
		'getCollisionRange': function() {
			var tiles = 1;
			return {
				left: Math.floor( (this.coords.x - ((tiles - 0) * World.map.tileset.tilewidth)) / World.map.tileset.tilewidth ),
				right: Math.ceil( (this.coords.x + ((tiles - 1) * World.map.tileset.tilewidth)) / World.map.tileset.tilewidth ),
				top: Math.floor( (this.coords.y - ((tiles - 0) * World.map.tileset.tilewidth)) / World.map.tileset.tileheight ),
				bottom: Math.floor( (this.coords.y + (this.image.h*this.scale) + ((tiles - 1) * World.map.tileset.tileheight)) / World.map.tileset.tileheight ),
			};
		},
		'collideWithGround': function() {
			if(
				typeof World.map.tileset.colliders == 'undefined' || !World.map.tileset.colliders.length()
			) {
				//no collidable object in the tilesheet
				return false;
			}
			for(var layer=0; layer<World.map.layers.length; layer++) {
				if( true && World.map.layers[layer].collidable ) { //we dont check if the layer is visible because we might want invisible colliders
					//only scan for collisions near the character
					var view_range = this.getCollisionRange();
					var y = view_range.bottom; //below the character
					for(var x=view_range.left; x<view_range.right+1; x++) {
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
							{x:this.coords.x, y:this.coords.y + (this.image.h*this.scale) - this.velocity.y, z:1 + this.velocity.y, w:this.image.w*this.scale},
							//tile
							{
								x: collided_tile_coords.x, y: collided_tile_coords.y, //-1
								z: 1, w: collided_tile_coords.w
							}
						], false);
						if(!colliding) continue; //try the next tile.. we try a total of 3 underneath the character
						if(colliding) {
							if( this.coords.y != y*(this.image.h*this.scale) && this.movement_state != 'ascending' ) {
								//player is colliding with ground but is not exactly level with the ground... sometimes this happens for some reason, character digs into the ground a little
								this.coords.y = y * World.map.tileset.tileheight - (this.image.h*this.scale);
							}
						}
						return colliding;
					}
				}
			}
			//return false;
		},
		'randomDirection': function() {
			var dir = 'right';
			var foo = Math.random() * 100;
			if(foo <= 50) {
				dir = 'left';
			} else {
				dir = 'right';
			}
			return dir;
		},
		'randomMovementState': function() {
			var state = 'right';
			var foo = Math.random() * 100;
			if(foo < 50) {
				//0-89 = 90%
				state = 'idle';
			} else {
				//89-99 = 10%
				state = 'moving';
			}
			return state;
		},
		'update': function() {
			//if(!config.paused) this.speed = this.walk_speed;
			//else this.speed = 0;
			if(config.paused) return;
			
			//for now mobs can only walk. but later we will add fly_speed, swim_speed, climb_speed, etc
			this.speed = this.walk_speed;
			
			//simple AI
			if(true) {
				//decrement the timer
				this.ai.period_dir--;
				this.ai.period_movement_state--;
				var random_state = this.movement_state;
				var random_dir = this.dir;
				//decide facing direction and for how long
				if( this.ai.period_dir <= 0 ) {
					random_dir = this.randomDirection();
					var min_seconds = 1 * config.frame_rate;
					var max_seconds = 5 * config.frame_rate;
					this.ai.period_dir = System.randomNumberBetween(min_seconds, max_seconds);
				}
				//decide movement state and for how long
				if( this.ai.period_movement_state <= 0 ) {
					random_state = this.randomMovementState();
					var min_seconds = 1 * config.frame_rate;
					var max_seconds = 5 * config.frame_rate;
					this.ai.period_movement_state = System.randomNumberBetween(min_seconds, max_seconds);
				}
			}
			
			//handle colliding with ground
			if(true) {
				var colliding_with_ground = this.collideWithGround();
				if(colliding_with_ground) {
					if(this.movement_state == 'descending') {
						//landing
						this.on_ground = true;
						this.velocity.y = 0;
						//#################if(!config.paused) this.sfx.land.play();
					} else if(this.movement_state == 'ascending') {
						//hitting something above, fall back down
						//this.velocity.y = 6.0;
					}
				} else {
					if(this.movement_state != 'ascending') {
						this.on_ground = false;
					} else if(this.movement_state == 'ascending') {
						//hitting something above, fall back down
						//this.velocity.y = 6.0;
					}
				}
			}
			
			//handle gravity
			if(true) {
				if(this.movement_state == 'climbing') {
					//TODO: handle the climbing case
				} else {
					if(!this.on_ground) {
						//if(this.velocity.y <= 15) { //limit fall speed
						this.velocity.y += World.gravity;
						//}
					}
					this.velocity.y += 0;
					this.coords.y += this.velocity.y;
				}
			}
			
			//find out the movement state and facing direction
			if(true) {
				if(this.speed && random_state != 'idle') { //is_moving? AI thing
					if( this.movement_state != 'climbing' && this.speed ) {
						//moving left or right
						this.movement_state = 'moving';
						//if(inputManager.key_a && this.coords.x > 0) {
						if(random_dir == 'left' && this.coords.x > 0) {
							this.dir = 'left';
						}
						//if(inputManager.key_d && this.coords.x < World.size.x * World.map.tileset.tilewidth - (this.image.w*this.scale)) {
						if(random_dir == 'right' && this.coords.x < World.size.x * World.map.tileset.tilewidth - (this.image.w*this.scale)) {
							this.dir = 'right';
						}
					}
					/*if( (inputManager.key_w || inputManager.key_s) && at_climbable && this.climb_speed ) {
						//climbing
						if( inputManager.key_w && Math.floor(this.coords.y / World.map.tileset.tileheight) >= 0 ) { //if the character is not at the top of the map
							this.movement_state = 'climbing';
							this.dir = 'up';
						} else if( inputManager.key_s && Math.floor(this.coords.y / World.map.tileset.tileheight) < World.size.y ) { //if the character is not at the bottom of the map
							this.movement_state = 'climbing';
							this.dir = 'down';
						}
					}*/
				} else {
					if( this.movement_state != 'climbing' ) {
						this.movement_state = 'idle';
					}
				}
			}
			
			//move the character left, right or up, down if climbing
			if(true) {
				if(this.movement_state == 'moving') {
					if(this.dir == 'left') {
						this.coords.x = this.coords.x - this.speed;
					}
					if(this.dir == 'right') {
						this.coords.x = this.coords.x + this.speed;
					}
				} /*else if(this.movement_state == 'climbing' && at_climbable) {
					if(this.dir == 'up' && inputManager.key_w) {
						this.coords.y = this.coords.y - this.climb_speed;
					} else if(this.dir == 'down' && !colliding_with_ground && inputManager.key_s) {
						this.coords.y = this.coords.y + this.climb_speed;
					} else if(inputManager.key_a) {
						//going left on the climbable
						this.coords.x = this.coords.x - 1;
					} else if(inputManager.key_d) {
						//going right on the climbable
						this.coords.x = this.coords.x + 1;
					}
				}*/
			}
			
			//ascending or descending
			if(!this.on_ground) {
				if(this.velocity.y < 0) this.movement_state = 'ascending';
				if(this.velocity.y > 0 && this.movement_state != 'climbing') this.movement_state = 'descending';
			}
			
		}
	}
};

var objectProperties = {
	'mob': {
		'dir': 'right',
		'speed': 0,
		'velocity': {y:0.0},
		'movement_state': 'idle', //idle, moving
		'on_ground': false,
		'ai': {
			'period_dir': 0, //how long to remain on this dir until we roll again
			'period_movement_state': 0 //how long to remain on this movement state until we roll again
		}
	}
};

function addMethods(object, methods) {
	for(var name in methods) {
		//object[name] = structuredClone(methods[name]);
		object[name] = methods[name];
	}
};
function addProperties(object, properties) {
	for(var name in properties) {
		object[name] = structuredClone(properties[name]);
	}
};
