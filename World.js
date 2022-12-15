var world_image_path = 'image/objects/';

var World = {
	map: null,
	starting_biome: "grass_fields",
	starting_map: "grass_fields_1",
	season: "spring",
	sky_color: "#55b4ff",
	gravity: 1,
	//size: {x:hud.canvas_parent.width / 32, y:0}, //not working because the world is created after setting canvas size
	size: {x:0, y:0},
	draw_margin: {top:10, left:10, right:10, bottom:10}, //amount of tiles to draw around the camera view range
	init: function() {
		//set world size
		//this.size.x = hud.canvas_parent.width / 32; //pixels
		this.size.x = 100; //tiles
		this.size.y = hud.canvas_parent.height / 32; //pixels
		
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
				World.map.tileset.spritesheet_image = System.loadImage({path: m.tileset.spritesheet_path});
			}
		});
	},
	setSeason: function(season) {
		World.season = season;
	},
	spawnObject: function(o) {
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
			//spawn_coords.x = o.coords.x - (World.map.tileset.tilewidth / 2);
			//spawn_coords.y = o.coords.y + (World.map.tileset.tileheight / 2);
			spawn_coords = {
				x: o.coords.x,
				y: o.coords.y
			};
		}
		
		//TODO: handle the case where the object may or may not have an animation. its either "animation" or "tile_id"
		
		if( !config.paused ) {
			var new_object = structuredClone(Objects[o.type][o.object_id]);
			new_object.coords = { "x": spawn_coords.x, "y": spawn_coords.y };
			World.map.objects.data.push(new_object);
		}
	},
	draw: function() {
		//draw geography
		for(var layer=0; layer<World.map.layers.length; layer++) {
			if( World.map.layers[layer].visible ) {
				if(World.map.layers[layer].type == 'tiles') {
					World.drawGeography(World.map.layers[layer]);
				}
			}
		}
		//draw objects
		World.drawTeleporters();
		World.drawObjects();
		if(typeof World.map.seasons != 'undefined') {
			World.updateSeasonColors();
		}
	},
	drawObjects: function() {
		var view_range = Camera.getViewRange({type:'pixel'}); //objects can be placed at pixel precision. not constrained to tiles
		for(var object_i=0; object_i<World.map.objects.data.length; object_i++) {
			var object = World.map.objects.data[object_i];
			//we loop through every object and filter out those outside of the screen
			if(
				object.coords.y < view_range.top - (World.draw_margin.top * World.map.tileset.tileheight) ||
				object.coords.y > view_range.bottom + (World.draw_margin.bottom * World.map.tileset.tileheight) ||
				object.coords.x < view_range.left - (World.draw_margin.left * World.map.tileset.tilewidth) ||
				object.coords.x > view_range.right + (World.draw_margin.right * World.map.tileset.tilewidth)
			) {
				continue;
			}
			/*if(typeof object.move != 'undefined') {
				//todo: find a way to specify whether the y position should be random or not
				//todo: find a way to specify whether the item should re-spawn when out of bounds and where to respawn
				if(object.direction == 'right') var new_x = object.coords.x + object.speed;
				else var new_x = object.coords.x - object.speed;
				if(new_x > World.size.x * 32) {
					//spawn back on the left
					new_x = 0 - World.objects[object_type][object].image.width;
					//randomize the y position
					object.coords.y = 60 + Math.floor(Math.random() * 150);
				}
				object.coords.x = new_x;
			}*/
			//draw
			/*//using single image per object
			hud.canvas.drawImage(
				World.data[object_type][object].image,
				this_object.coords.x,
				this_object.coords.y
			);*/
			
			if(typeof object.animation == 'undefined') {
				//static non-animated sprite
				hud.canvas.drawImage(
					//image
					World.map.tileset.spritesheet_image,
					//source coords
					//duno why, in normal draw layers thing we need to do tile_width-1 but here we dont need the -1
					((object.tile_id) % (World.map.tileset.spritesheet_width / World.map.tileset.tilewidth)) * World.map.tileset.tilewidth, //sx,
					~~((object.tile_id) / (World.map.tileset.spritesheet_width / World.map.tileset.tileheight)) * World.map.tileset.tileheight, //sy,
					//source size
					World.map.tileset.tilewidth,
					World.map.tileset.tileheight,
					//destination coords
					object.coords.x, //pixel precision
					object.coords.y - World.map.tileset.tileheight, //pixel precision
					//destination size
					World.map.tileset.tilewidth,
					World.map.tileset.tileheight
				);
			} else {
				//animated sprite
				
				hud.canvas.drawImage(
					//image
					World.map.tileset.spritesheet_image,
					
					//source coords
					//duno why, in normal draw layers thing we need to do tile_width-1 but here we dont need the -1
					(
						object.animation.frames > 1 ? (object.animation.x*World.map.tileset.tilewidth) + (World.map.tileset.tilewidth * object.animation.frame) :
						object.animation.x * World.map.tileset.tilewidth
					),
					World.map.tileset.tileheight * object.animation.y,
					
					//source size
					World.map.tileset.tilewidth,
					( typeof object.size != 'undefined' ? object.size.height * World.map.tileset.tileheight : World.map.tileset.tileheight),
					
					//destination coords
					object.coords.x, //pixel precision
					( typeof object.size != 'undefined' ? object.coords.y - (object.size.height * World.map.tileset.tileheight) : object.coords.y) - World.map.tileset.tileheight,
					
					//destination size
					World.map.tileset.tilewidth,
					( typeof object.size != 'undefined' ? object.size.height * World.map.tileset.tileheight : World.map.tileset.tileheight),
					
				);
				if(object.animation.frames_passed > object.animation.speed) {
					if(object.animation.frame < object.animation.frames - 1) object.animation.frame++;
					else object.animation.frame = 0;
					object.animation.frames_passed = 0;
				} else {
					object.animation.frames_passed++;
				}
			}
		}
	},
	drawTeleporters: function() {
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
				//console.log(World.map.teleporters[y][x]['name']);
				//draw
				/*//using single image per object
				hud.canvas.drawImage(
					World.data[object_type][object].image,
					this_object.coords.x,
					this_object.coords.y
				);*/
				
				if(typeof object.animation == 'undefined') {
					//static non-animated sprite
					
					//console.log(y * World.map.tileset.tileheight);
					
					hud.canvas.drawImage(
						//image
						World.map.tileset.spritesheet_image,
						//source coords
						//duno why, in normal draw layers thing we need to do tile_width-1 but here we dont need the -1
						((object.tile_id) % (World.map.tileset.spritesheet_width / World.map.tileset.tilewidth)) * World.map.tileset.tilewidth, //sx,
						~~((object.tile_id) / (World.map.tileset.spritesheet_width / World.map.tileset.tileheight)) * World.map.tileset.tileheight, //sy,
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
				} else {
					//animated sprite
					hud.canvas.drawImage(
						//image
						World.map.tileset.spritesheet_image,
						
						//source coords
						//duno why, in normal draw layers thing we need to do tile_width-1 but here we dont need the -1
						(
							object.animation.frames > 1 ? (object.animation.x*World.map.tileset.tilewidth) + (World.map.tileset.tilewidth * object.animation.frame) :
							object.animation.x * World.map.tileset.tilewidth
						),
						World.map.tileset.tileheight * object.animation.y,
						
						//source size
						World.map.tileset.tilewidth,
						( typeof object.size != 'undefined' ? object.size.height * World.map.tileset.tileheight : World.map.tileset.tileheight), //this sprite has a custom size?
						
						//destination coords
						x * World.map.tileset.tilewidth,
						//duno why, the teleporter is not exactly where expect it to be...
						//( typeof object.size != 'undefined' ? (y * World.map.tileset.tileheight) - (object.size.height * World.map.tileset.tileheight) : y * World.map.tileset.tileheight), //this sprite has a custom size?
						( typeof object.size != 'undefined' ? (y * World.map.tileset.tileheight) - ((object.size.height-1) * World.map.tileset.tileheight) : y * World.map.tileset.tileheight), //this sprite has a custom size?
						
						//destination size
						World.map.tileset.tilewidth,
						( typeof object.size != 'undefined' ? object.size.height * World.map.tileset.tileheight : World.map.tileset.tileheight), //this sprite has a custom size?
						
					);
					//update animation
					if(object.animation.frames_passed > object.animation.speed) {
						if(object.animation.frame < object.animation.frames - 1) object.animation.frame++;
						else object.animation.frame = 0;
						object.animation.frames_passed = 0;
					} else {
						object.animation.frames_passed++;
					}
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
	updateSeasonColors: function() {
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

//load tiles images
// World.tiles.ground_middle.image.src = "image/tile.png";
// World.tiles.ground_dirt.image.src = "image/tile_dirt.png";
