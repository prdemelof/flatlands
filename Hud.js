var hud = {
	canvas_parent: $('canvas')[0],
	//start_menu_color: "#1e1e1e", //dark gray
	font_size: 12,
	font_family: 'Arial',
	start_menu_image: new Image(),
	object_inspector_box_timeout: null,
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
	setFont: function(o) {
		hud.canvas.fillStyle = ( typeof o != 'undefined' && typeof o.color != 'undefined' ? o.color : 'black' );
		hud.canvas.font = "" +
			(typeof o != 'undefined' && typeof o.size != 'undefined' ? o.size : hud.font_size ) + "px " +
			(typeof o != 'undefined' && typeof o.family != 'undefined' ? o.family : hud.font_family );
		//hud.canvas.font = hud.font_size + "px "+hud.font_family;
	},
	init: function() {
		$('canvas')[0].width = $('#canvas_parent').innerWidth();
		$('canvas')[0].height = $('#canvas_parent').innerHeight();
		//hud.start_menu_image.src = 'image/start_menu.jpg';
		hud.canvas = $('canvas')[0].getContext('2d');
		hud.setFont();
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
	drawStartMenu: function() {
		//hud.canvas.drawImage(hud.start_menu_image, 0, 0);
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
