var hud = {
	canvas_parent: $('canvas')[0],
	//start_menu_color: "#1e1e1e", //dark gray
	font_size: 12,
	font_family: 'Arial',
	inventory: {
		scale: 2,
		image: null, //we really dont want to do this. we need separate sprites for each piece of a Window and assemble the entire box with the individual pieces
		margin: 6, //(pixel) margin from the edge of the window to the point where we can start drawing stuff
	},
	start_menu_image: new Image(),
	object_inspector_box_timeout: null,
	platform: 'desktop',
	mobile_controls: {
		margin: 32, //margin from the edges of the screen
		finger_dimensions: 60, //pixels
	},
	init: function() {
		hud.inventory.image = System.loadImage({path: "image/hud/menu.png"});
		if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
			//mobile
			//console.log('hud init: mobile');
			hud.platform = 'mobile';
			
			$('#canvas_parent').css('top', 0);
			$('#canvas_parent').css('left', 0);
			$('#canvas_parent').css('transform', 'none');
			
			$('#canvas_parent').css('width', window.innerWidth);
			$('#canvas_parent').css('height', window.innerHeight);
			
			$('canvas')[0].width = $('#canvas_parent').innerWidth();
			$('canvas')[0].height = $('#canvas_parent').innerHeight();
			//hud.start_menu_image.src = 'image/start_menu.jpg';
			hud.canvas = $('canvas')[0].getContext('2d');
			hud.setFont();
			
			//for both rendering and input handling (inputManager.js)
			hud.mobile_controls['coords'] = {
				jump: {
					x: (window.innerWidth - hud.mobile_controls.finger_dimensions - hud.mobile_controls.margin),
					y: (window.innerHeight - hud.mobile_controls.finger_dimensions - hud.mobile_controls.margin),
				},
				move_left: {
					x: (0 + hud.mobile_controls.finger_dimensions + hud.mobile_controls.margin),
					y: (window.innerHeight - hud.mobile_controls.finger_dimensions - hud.mobile_controls.margin),
				},
				move_right: {
					x: (0 + (hud.mobile_controls.finger_dimensions*2) + (hud.mobile_controls.margin*2)),
					y: (window.innerHeight - hud.mobile_controls.finger_dimensions - hud.mobile_controls.margin),
				},
			};
			
		} else {
			//desktop
			//console.log('hud init: desktop');
			hud.platform = 'desktop';
			$('canvas')[0].width = $('#canvas_parent').innerWidth();
			$('canvas')[0].height = $('#canvas_parent').innerHeight();
			//hud.start_menu_image.src = 'image/start_menu.jpg';
			hud.canvas = $('canvas')[0].getContext('2d');
			hud.setFont();
		}
	},
	update: function() {
		if(hud.object_inspector_box_timeout) {
			hud.updateInspection({
				coords:{
					x: player.coords.x + $('#canvas_parent').position().left + (player.image.width / 2) + Camera.offset.x,
					y: player.coords.y + $('#canvas_parent').position().top - Camera.offset.y - 25 //5 for the box padding,
					//x: hovered_object.individuals[0].coords.x + (hovered_object.image.width / 2) + $('#canvas_parent').position().left + Camera.offset.x,
					//y: hovered_object.individuals[0].coords.y - $('#canvas_parent').position().top - Camera.offset.y - 25 //5 for the box padding
				},
			});
		}
	},
	draw: function() {
		//draw stuff
		
		hud.drawInventory();
		
	},
	setFont: function(o) {
		hud.canvas.fillStyle = ( typeof o != 'undefined' && typeof o.color != 'undefined' ? o.color : 'black' );
		hud.canvas.font = "" +
			(typeof o != 'undefined' && typeof o.size != 'undefined' ? o.size : hud.font_size ) + "px " +
			(typeof o != 'undefined' && typeof o.family != 'undefined' ? o.family : hud.font_family );
		//hud.canvas.font = hud.font_size + "px "+hud.font_family;
	},
	drawPlayerStats: function() {
		//
	},
	show_menu: false,
	toggleMenu: function() {
		if(!hud.show_start_menu) {
			//dont allow to open menu when in start menu screen
			if(hud.show_menu) {
				hud.show_menu = false;
				$('#ingame_menu').fadeOut('fast', function() {
					$(hud.canvas_parent).parent().removeClass('blur');
					config.unpause();
				});
			} else {
				config.pause();
				hud.show_menu = true;
				$(hud.canvas_parent).parent().addClass('blur');
				//$('#ingame_menu').fadeIn('fast');
				$('#ingame_menu').show();
			}
		} else {
			//pressing ESC while in start menu screen, quit the game?
		}
	},
	show_start_menu: false,
	toggleStartMenu: function() {
		if(hud.show_start_menu) {
			hud.show_start_menu = false;
			config.unpause();
			$('#start_menu').fadeOut('fast', function() {
				//#$(hud.canvas_parent).parent().removeClass('blur');
				//#config.unpause();
			});
		} else {
			//#config.pause();
			config.pause();
			hud.show_start_menu = true;
			//#$(hud.canvas_parent).parent().addClass('blur');
			//$('#start_menu').fadeIn('fast');
			$('#start_menu').show();
		}
	},
	show_inventory: false,
	toggleInventory: function(show) {
		if(!config.paused) {
			if(typeof show != 'undefined') {
				hud.show_inventory = !show; //if show is false, we make it become true which will cause it to hide
			}
			if(hud.show_inventory) {
				hud.show_inventory = false;
			} else {
				hud.show_inventory = true;
			}
		}
	},
	drawStartMenu: function() {
		//hud.canvas.drawImage(hud.start_menu_image, 0, 0);
	},
	drawInventory: function() {
		if(hud.show_inventory) {
			
			//draw inventory UI (window)
			hud.canvas.drawImage(
				//image file
				hud.inventory.image,
				
				//source coords
				0,
				0,
				
				//source dimensions
				hud.inventory.image.width,
				hud.inventory.image.height,
				
				//destination coords
				128 + Camera.getViewRange({type:'pixel'}).left,
				128 + Camera.getViewRange({type:'pixel'}).top,
				
				//destination dimensions
				hud.inventory.image.width * hud.inventory.scale,
				hud.inventory.image.height * hud.inventory.scale
			);
			
			//draw player in the inventory
			hud.canvas.drawImage(
				//image file
				player.image.sprite_sheet,
				
				//source coords
				0,
				0,
				
				//source dimensions
				player.image.width,
				player.image.height,
				
				//destination coords
				128 + Camera.getViewRange({type:'pixel'}).left + (9 * hud.inventory.scale), //18,
				128 + Camera.getViewRange({type:'pixel'}).top + (19 * hud.inventory.scale), //38,
				
				//destination dimensions
				(player.image.width * player.image.scale) * hud.inventory.scale,
				(player.image.height * player.image.scale) * hud.inventory.scale
			);
			//draw player hair (including the color change thing)
			if( player.hair.style != null && player.hair.style.image != null ) {
				var hair_width_difference = (player.hair.style.width - player.image.width) * hud.inventory.scale;
				hud.canvas.drawImage(
					//image file
					player.hair.style.image,
					
					//source coords
					0,
					0,
					
					//source dimensions
					player.hair.style.width,
					player.hair.style.height,
					
					//destination coords
					128 + Camera.getViewRange({type:'pixel'}).left + (9 * hud.inventory.scale) - (hair_width_difference * 2), //18,
					128 + Camera.getViewRange({type:'pixel'}).top + (19 * hud.inventory.scale), //38,
					
					//destination dimensions
					(player.hair.style.width * player.hair.style.scale) * hud.inventory.scale,
					(player.hair.style.height * player.hair.style.scale) * hud.inventory.scale
				);
				
				//update the hair color
				if(player.hair.color != null) {
					player.applyHairColor();
				}
			}
			
			//draw objects in the inventory
			
			//if( player.inventory[player.inventory.active_category].content.length() ) {
			var player_active_inventory = player.inventory.getActive();
			if( player_active_inventory.length() ) {
				for(var slot_id in player_active_inventory) {
					var item = Objects.item[player_active_inventory[slot_id].item_id];
					var image = System.loadImage({path: "image/spritesheets/item/"+player_active_inventory[slot_id].item_id+".png"});
					
					//TODO: this method to load image every single time sucks.. we have to either improve the system to do a proper
					//asset management to avoid loading duplicate image files, and or change the item system to pre-load and hold their own images in the ram when the game launches
					
					var per_row = player.inventory.max_cols;
					var row = Math.ceil(slot_id / per_row) - 1;
					var col = (((slot_id / per_row) - row) * per_row) - 1;
					
					var coords_x = (128 + Camera.getViewRange({type:'pixel'}).left) + (44 * col) + (hud.inventory.margin * hud.inventory.scale);
					var coords_y = (128 + Camera.getViewRange({type:'pixel'}).top + (76 * hud.inventory.scale)) + (44 * row);
					
					hud.canvas.drawImage(
						//image file
						image,
						
						//source coords
						0,
						0,
						
						//source dimensions
						item.image.w,
						item.image.h,
						
						//destination coords
						coords_x,
						coords_y,
						
						//destination dimensions
						item.image.w * hud.inventory.scale,
						item.image.h * hud.inventory.scale
					);
				}
			}
			
			
			
			
			
			
			
			
			
			
			
		}
	},
	drawInspection: function(o) {
		$('#object_inspector_box p').html(o.text);
		var object_inspector_box = $('#object_inspector_box');
		object_inspector_box.css('left', o.coords.x - ( object_inspector_box.css('width').replace('px', '') / 2 ));
		object_inspector_box.css('top', o.coords.y - ( object_inspector_box.css('height').replace('px', '') / 2 ));
		object_inspector_box.show();
		if(hud.object_inspector_box_timeout) clearTimeout(hud.object_inspector_box_timeout);
		hud.object_inspector_box_timeout = setTimeout(function() {
			hud.object_inspector_box_timeout = null;
			$('#object_inspector_box').fadeOut();
		}, 4000);
	},
	updateInspection: function(o) {
		var object_inspector_box = $('#object_inspector_box');
		object_inspector_box.css('left', o.coords.x - ( object_inspector_box.css('width').replace('px', '') / 2 ));
		object_inspector_box.css('top', o.coords.y - ( object_inspector_box.css('height').replace('px', '') / 2 ));
	},
};

/*INGAME MENU*/

//$(document).on('click', '.toggle_music', function() {
//	SoundEngine.toggleMusic({button:'.toggle_music'});
//});
$(document).on('change', '.range_volume', function() {
	SoundEngine.changeVolume({ type:$(this).attr('data-type'), volume:$(this).val()/1 });
});

/*END INGAME MENU*/



/*START MENU*/

$(document).on('click', '.start_menu_play', function() {
	hud.toggleStartMenu();
	SoundEngine.changeMusic({path: 'grass_fields_1.mp3'});
});

/*END START MENU*/
