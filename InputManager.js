var inputManager = {
	key_w: false,
	key_s: false,
	key_a: false,
	key_d: false,
	key_left: false,
	key_right: false,
	key_space: false,
	key_esc: false,
};

//EVENTS
hud.canvas_parent.addEventListener('mousemove', function(e) {
	inputManager.mouse_coords = {x:e.clientX, y:e.clientY}; //coordinates within the browser window
	inputManager.canvas_mouse_coords = {x:e.clientX - $('#canvas_parent').position().left, y:e.clientY - $('#canvas_parent').position().top}; //coordinates within the canvas
	inputManager.world_mouse_coords = {x:inputManager.canvas_mouse_coords.x - Camera.offset.x, y:inputManager.canvas_mouse_coords.y - Camera.offset.y}; //coordinates within the game world
}, false);
document.addEventListener('keydown', function(e) {
	if((e.keyCode==65 || e.keyCode==37) && !inputManager.key_a) {
		inputManager.key_a = true;
	}
	if((e.keyCode==68 || e.keyCode==39) && !inputManager.key_d) {
		inputManager.key_d = true;
	}
	if(e.keyCode==83 && !inputManager.key_s) {
		inputManager.key_s = true;
	}
	if(e.keyCode==87 && !inputManager.key_w) {
		inputManager.key_w = true;
	}
	if(e.keyCode==32 && !inputManager.key_space) {
		inputManager.key_space = true;
		player.startJump(); //only one jump even if holding down key
	}
	if(e.keyCode==27 && !inputManager.key_esc) {
		inputManager.key_esc = true;
		hud.toggleMenu();
	}
}, false);
document.addEventListener('keyup', function(e) {
	if(e.keyCode==65 || e.keyCode==37) {
		inputManager.key_a = false;
	}
	if(e.keyCode==68 || e.keyCode==39) {
		inputManager.key_d = false;
	}
	if(e.keyCode==83) {
		inputManager.key_s = false;
	}
	if(e.keyCode==87) {
		inputManager.key_w = false;
	}
	if(e.keyCode==32) {
		inputManager.key_space = false;
		player.endJump(); //only one jump even if holding down key
	}
	if(e.keyCode==27) {
		inputManager.key_esc = false;
		//hud.toggleMenu();
	}
}, false);
