
var World = {
	map: null,
	starting_biome: "grass_fields",
	starting_map: "grass_fields_1",
	season: "spring",
	sky_color: "#55b4ff",
	gravity: 1,
	max_mobs: 0,
	//size: {x:hud.canvas_parent.width / 32, y:0}, //not working because the world is created after setting canvas size
	size: {x:0, y:0},
	draw_margin: {top:10, left:10, right:10, bottom:10}, //amount of tiles to draw around the camera view range
	init: function() {
		//set world size
		//this.size.x = hud.canvas_parent.width / 32; //pixels
		this.size.x = 100; //tiles
		this.size.y = hud.canvas_parent.height / 32; //pixels
		World.teleporter_image = System.loadImage({path: "image/spritesheets/teleporter_1.png"});
		this.loadMap({"biome":this.starting_biome, "map":this.starting_map});
	},
	loadMap: function(o) {
		var map_uri = 'map/'+o.biome+'/'+o.map+'.json';
		$.ajax({
			async: false,
			data_type: 'JSON',
			type: 'GET',
			url: map_uri,
			success: function(m) {
				//convert into our own format
				if(typeof m.tiledversion != 'undefined') {
					m = System.convertLayersData(m); //convert from Tiled format into our own format
					m = System.loadTileset(m); //load the tileset settings for this map
				}				
				World.map = m;
				World.map.tileset.image = System.loadImage({path: m.tileset.image_path});
				//spawn any initial objects
				if(typeof World.map.spawn_objects != 'undefined') {
					for(var i=0; i<World.map.spawn_objects.length; i++) {
						World.spawnObject({"ignore_pause":true, "type":World.map.spawn_objects[i].type, "object_id":World.map.spawn_objects[i].id, "count":World.map.spawn_objects[i].count, "coords":World.map.spawn_objects[i].coords });
					}
				}
			}
		});
	},
	setSeason: function(season) {
		World.season = season;
	},
	draw: function() {
		for(var layer=0; layer<World.map.layers.length; layer++) {
			if( World.map.layers[layer].visible ) {
				if(World.map.layers[layer].type == 'tiles') {
					World.drawGeography(World.map.layers[layer]);
				}
			}
		}
		World.drawTeleporters();
		World.drawObjects();
		if(typeof World.map.seasons != 'undefined') {
			World.applySeasonColors();
		}
	},
	update: function() {
		//update objects (mobs, npcs, items)
		if( typeof World.map.objects != 'undefined' && typeof World.map.objects['mob'] != 'undefined' ) {
			for(var i=0; i<World.map.objects['mob'].length; i++) {
				World.map.objects['mob'][i].update();
			}
		}
		//randomly spawn mobs up to a certain limit
		if(
			World.max_mobs > 0 &&
			(typeof World.map.objects['mob'] == 'undefined' || World.map.objects['mob'].length < World.max_mobs)
		) {
			var foo = Math.random() * 100;
			if(foo <= 0.5) { //% chance to spawn a new mob at this tick
				var mobs = Object.keys(Objects.mob);
				var mob_id = mobs[ mobs.length * Math.random() << 0];
				//TODO: this may spawn mobs in something, like in the ground or another tile
				var coords_x = System.randomNumberBetween(0, World.map.width) * World.map.tileset.tilewidth;
				var coords_y = System.randomNumberBetween(0, World.map.height) * World.map.tileset.tileheight;
				//console.log('spawn: ' + mob_id + ' '+coords_x+','+coords_y);
				World.spawnObject({"type":'mob', "object_id":mob_id, "count":1, "coords": { "x":coords_x, "y": coords_y } });
			}
		}
		//despawn objects outside of the world
		//mobs
		if(typeof World.map.objects['mob'] != 'undefined') {
			for(var i=0; i<World.map.objects['mob'].length; i++) {
				if(
					World.map.objects['mob'][i].coords.x < 0 || World.map.objects['mob'][i].coords.x + (World.map.objects['mob'][i].image.w * World.map.objects['mob'][i].scale) > (World.map.width * World.map.tileset.tilewidth) ||
					World.map.objects['mob'][i].coords.y < 0 || World.map.objects['mob'][i].coords.y + (World.map.objects['mob'][i].image.h * World.map.objects['mob'][i].scale) > (World.map.height * World.map.tileset.tileheight)
				) {
					//console.log('despawn OOB: ' + World.map.objects['mob'][i].id + ' '+World.map.objects['mob'][i].coords.x+','+World.map.objects['mob'][i].coords.y);
					//World.map.objects['mob'].splice(i, 1);
					World.despawnObject({type: "mob", index: i});
				}
			}
		}
		//npc
	},
	spawnObject: function(o) {
		
		//TODO: we need to move this entire function somewhere else. maybe to Objects.js
		
		//example: World.spawnObject({"type":"item", "object_id":"heart_1", "count":1, "coords": {"x":1248, "y": 650} });
		var spawn_coords;
		if(typeof o.coords == 'undefined') {
			//spawning under the mouse cursor
			if(typeof inputManager.world_mouse_coords != 'undefined') {
				spawn_coords = {
					x: inputManager.world_mouse_coords.x - (World.map.tileset.tilewidth / 2),
					y: inputManager.world_mouse_coords.y + (World.map.tileset.tileheight / 2)
				};
			}
		} else {
			//spawning at a specific position
			spawn_coords = {
				x: o.coords.x,
				y: o.coords.y
			};
		}
		if( !config.paused || (typeof o.ignore_pause != 'undefined' && o.ignore_pause) ) {
			//TODO: this entire thing sucks. need to find a better way to handle object instantiation, with prototyping or something
			var new_object = structuredClone(Objects[o.type][o.object_id]);
			//set important variables, such as this object's ID and it's image source
			new_object.coords = { "x": spawn_coords.x, "y": spawn_coords.y };
			new_object.id = o.object_id;
			//handle graphics and animation
			if(typeof new_object.animations != 'undefined') {
				new_object.animation = {frame:0, frames_passed:0};
			}
			new_object.image.file = System.loadImage({path: "image/spritesheets/"+o.type+"/"+o.object_id+".png"});
			//new_object.image.file.src = "image/spritesheets/"+o.type+"/"+o.object_id+".png";
			//handle functions
			addProperties(new_object, objectProperties['generic']);
			addMethods(new_object, objectMethods['generic']);
			if(o.type == 'mob') {
				addProperties(new_object, objectProperties['mob']);
				addMethods(new_object, objectMethods['mob']);
			} else if(o.type == 'npc') {
				//new_object.update = function() {};
				//addProperties(new_object, objectProperties['npc']);
				//addMethods(new_object, objectMethods['npc']);
			} else if(o.type == 'item') {
				//new_object.update = function() {};
				addProperties(new_object, objectProperties['item']);
				//addMethods(new_object, objectMethods['item']);
			}
			//put this object into the main map objects array
			if(typeof World.map.objects[o.type] == 'undefined') {
				World.map.objects[o.type] = [];
			}
			World.map.objects[o.type].push(new_object);
		}
	},
	despawnObject: function(o) {
		if(typeof o.coords == 'undefined') {
			World.map.objects[o.type].splice(o.index, 1);
		}
	},
	drawObjects: function() {
		var view_range = Camera.getViewRange({type:'pixel'}); //objects can be placed at pixel precision. not constrained to tiles
		for(const type in World.map.objects) {
			for(var object_i=0; object_i<World.map.objects[type].length; object_i++) {
				var object = World.map.objects[type][object_i];
				//we loop through every object and filter out those outside of the screen
				if(
					object.coords.y < view_range.top - (World.draw_margin.top * World.map.tileset.tileheight) ||
					object.coords.y > view_range.bottom + (World.draw_margin.bottom * World.map.tileset.tileheight) ||
					object.coords.x < view_range.left - (World.draw_margin.left * World.map.tileset.tilewidth) ||
					object.coords.x > view_range.right + (World.draw_margin.right * World.map.tileset.tilewidth)
				) {
					continue;
				}
				if(typeof object.animation == 'undefined') {
					//static non-animated object
					//...
				} else {
					//animated sprite
					var state = (typeof object.movement_state != 'undefined' && typeof object.animations[object.movement_state] != 'undefined' ? object.movement_state : 'idle'); //only really needed for mobs and stuff that move
					
					//flip the image if moving left
					var flip = false;
					if(typeof object.dir != 'undefined') {
						flip = (object.dir == 'left');
						hud.canvas.save();
						hud.canvas.scale(flip ? -1 : 1, 1);
					}
					
					hud.canvas.drawImage(
						//image
						object.image.file,
						
						//source coords
						//duno why, in normal draw layers thing we need to do tile_width-1 but here we dont need the -1
						(
							object.animations[state].frames > 1 ? (object.animations[state].x*object.image.w) + (object.image.w * object.animation.frame) :
							object.animations[state].x * object.image.w
						),
						object.image.h * object.animations[state].y,
						
						//source size
						object.image.w,
						object.image.h,
						
						//destination coords
						//object.coords.x, //pixel precision
						(flip ? ((object.image.w*object.scale) * -1)-object.coords.x : 0+object.coords.x), //flip or no flip
						object.coords.y,
						
						//destination size
						(typeof object.scale != 'undefined' ? object.image.w * object.scale : object.image.w),
						(typeof object.scale != 'undefined' ? object.image.h * object.scale : object.image.h)
					);
					if(typeof object.dir != 'undefined') {
						hud.canvas.restore();
					}
					if(object.animation.frames_passed > object.animations[state].speed) {
						if(object.animation.frame < object.animations[state].frames - 1) object.animation.frame++;
						else object.animation.frame = 0;
						object.animation.frames_passed = 0;
					} else {
						object.animation.frames_passed++;
					}
				}
			}
		}
	},
	drawTeleporters: function() {
		var animation_speed = 2;
		var animation_frames = 6;
		var view_range = Camera.getViewRange({type:'tile'}); //objects can be placed at pixel precision. not constrained to tiles
		for(const y in World.map.teleporters) {
			for(const x in World.map.teleporters[y]) {
				var object = World.map.teleporters[y][x];
				if(
					y < view_range.top - World.draw_margin.top ||
					y > view_range.bottom + World.draw_margin.bottom ||
					x < view_range.left - World.draw_margin.left ||
					x > view_range.right + World.draw_margin.right
				) {
					continue;
				}
				hud.canvas.drawImage(
					//image
					World.teleporter_image,
					
					//source coords
					32 * object.animation.frame,
					0,
					
					//source size
					32,
					64,
					
					//destination coords
					x * World.map.tileset.tilewidth,
					y * World.map.tileset.tileheight - 32,
					
					//destination size
					World.map.tileset.tilewidth,
					( typeof object.size != 'undefined' ? object.size.height * World.map.tileset.tileheight : World.map.tileset.tileheight), //this sprite has a custom size?
				);
				//update animation
				if(object.animation.frames_passed > animation_speed) {
					if(object.animation.frame < animation_frames - 1) object.animation.frame++;
					else object.animation.frame = 0;
					object.animation.frames_passed = 0;
				} else {
					object.animation.frames_passed++;
				}
				
			}
		}
	},
	drawGeography: function(layer) {
		var view_range = Camera.getViewRange();
		for(var y=view_range.top-World.draw_margin.top; y<view_range.bottom+World.draw_margin.bottom; y++) {
			//any better way to handle this?
			if(y<0) {continue;} //too much margin, skip this inexistent row
			else if(y>World.size.y) break; //reached the bottom, stop everything
			var row = layer.data[y];
			for(var x=view_range.left-World.draw_margin.left; x<view_range.right+World.draw_margin.right; x++) {
				if(x<0) {continue;} //too much margin, skip this inexistent tile
				else if(x>World.size.x) break; //reached the farthest, next row
				//why row becomes undefined???
				if(typeof row == 'undefined') {
					continue;
				} else {
					//console.log(row[x]);
				}
				var tile_id = row[x];
				if(!tile_id) continue; //empty tile, void
				tile_id--; //we need this because the tileset doesnt start at 0, it starts at 1
				hud.canvas.drawImage(
					//image
					World.map.tileset.image,
					//source coords
					(tile_id % (World.map.tileset.imagewidth / World.map.tileset.tilewidth)) * World.map.tileset.tilewidth, //sx,
					~~(tile_id / (World.map.tileset.imagewidth / World.map.tileset.tileheight)) * World.map.tileset.tileheight, //sy,
					//source size
					World.map.tileset.tilewidth,
					World.map.tileset.tileheight,
					//destination coords
					x * World.map.tileset.tilewidth,
					y * World.map.tileset.tileheight,
					//destination size
					World.map.tileset.tilewidth,
					World.map.tileset.tileheight
				);
			}
		}
	},
	applySeasonColors: function() {
		if(typeof World.map.seasons[World.season].colors == 'undefined') {
			//this season has no color change (spring is the default color in the spritesheet)
			return;
		}
		
		const canvas = document.querySelector("canvas");
		const { width, height } = canvas;
		const aaa = hud.canvas.getImageData(0, 0, width, height);
		const { data } = aaa;
		const { length } = data;
		
		for(var color_i=0; color_i<World.map.seasons[World.season].colors.length(); color_i++) {
			var color = World.map.seasons[World.season].colors[""+color_i+""];
			for(let i=0; i<length; i+=4) { //red, green, blue, and alpha
				const r = data[i + 0];
				const g = data[i + 1];
				const b = data[i + 2];
				const a = data[i + 3];
				if(a === 255) { //alpha is 100%
					//light
					if(r === color.light.original.r && g === color.light.original.g && b === color.light.original.b) { //this pixel of the image is the one we need to replace with something else
						data[i + 0] = color.light.replace.r;
						data[i + 1] = color.light.replace.g;
						data[i + 2] = color.light.replace.b;
					}
					//medium
					if(r === color.medium.original.r && g === color.medium.original.g && b === color.medium.original.b) { //this pixel of the image is the one we need to replace with something else
						data[i + 0] = color.medium.replace.r;
						data[i + 1] = color.medium.replace.g;
						data[i + 2] = color.medium.replace.b;
					}
					//dark
					if(r === color.dark.original.r && g === color.dark.original.g && b === color.dark.original.b) { //this pixel of the image is the one we need to replace with something else
						data[i + 0] = color.dark.replace.r;
						data[i + 1] = color.dark.replace.g;
						data[i + 2] = color.dark.replace.b;
					}
				}
			}
		}
		//replace all relevant pixels on the entire canvas
		hud.canvas.putImageData(aaa, 0, 0);
	},
	findHoveredObject: function() {
		if(typeof inputManager.world_mouse_coords != 'undefined' && !config.paused) {
			for(var layer_i=0; layer_i<World.map.layers.length; layer_i++) {
				var layer = World.map.layers[layer_i];
				if( layer.visible ) {
					if(layer.type == 'objectgroup') {
						var view_range = Camera.getViewRange({type:'pixel'}); //objects can be placed at pixel precision
						for(var object_i=0; object_i<layer.objects.length; object_i++) {
							var object = layer.objects[object_i];
							//we loop through every object and filter out those outside of the screen
							if(
								object.coords.y < view_range.top - (World.draw_margin.top * World.map.tileset.tileheight) ||
								object.coords.y > view_range.bottom + (World.draw_margin.bottom * World.map.tileset.tileheight) ||
								object.coords.x < view_range.left - (World.draw_margin.left * World.map.tileset.tilewidth) ||
								object.coords.x > view_range.right + (World.draw_margin.right * World.map.tileset.tilewidth)
							) {
								continue;
							}
							if(
								inputManager.world_mouse_coords.x >= object.coords.x && inputManager.world_mouse_coords.x <= object.coords.x + object.width &&
								inputManager.world_mouse_coords.y >= (object.coords.y - object.height) && inputManager.world_mouse_coords.y <= object.coords.y
							) {
								//todo: find a better way to handle this, instead of making copies and adding the current object into the individuals array
								var o = JSON.parse(JSON.stringify( object ));
								return o;
							}
						}
					}
				}
			}
		}
	}
};

$(document).on('click', '#canvas_parent', function() {
	var hovered_object = World.findHoveredObject();
	if(hovered_object) {
		
		//console.log(hovered_object);
		
		hud.drawInspection({
			coords:{
				x: player.coords.x + $('#canvas_parent').position().left + (player.image.width / 2) + Camera.offset.x,
				y: player.coords.y + $('#canvas_parent').position().top - Camera.offset.y - 25 //5 for the box padding,
				//x: hovered_object.individuals[0].coords.x + (hovered_object.image.width / 2) + $('#canvas_parent').position().left + Camera.offset.x,
				//y: hovered_object.individuals[0].coords.y - $('#canvas_parent').position().top - Camera.offset.y - 25 //5 for the box padding
			},
			text:hovered_object.description
		});
	}
});
