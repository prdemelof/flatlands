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

var touchInputHandlerStart = function(e) {
	//e.preventDefault();
	
	//TODO: must handle at least 2 touches. 1 for left control and 1 for the right control
	
	if( typeof e.touches != 'undefined' && e.touches.length ) {
		
		//jump
		var colliding_jump = CollisionDetection.isColliding([
			//control coords
			{
				x: hud.mobile_controls.coords.jump.x,
				y: hud.mobile_controls.coords.jump.y,
				z: hud.mobile_controls.finger_dimensions,
				w: hud.mobile_controls.finger_dimensions
			},
			//touch coords
			{
				x: e.touches[0].pageX,
				y: e.touches[0].pageY,
				z: hud.mobile_controls.finger_dimensions,
				w: hud.mobile_controls.finger_dimensions
			}
		], false);
		if(colliding_jump) {
			inputManager.key_space = true;
			player.startJump(); //only one jump even if holding down key
		}
		
		//move left
		var colliding_move_left = CollisionDetection.isColliding([
			//control coords
			{
				x: hud.mobile_controls.coords.move_left.x,
				y: hud.mobile_controls.coords.move_left.y,
				z: hud.mobile_controls.finger_dimensions,
				w: hud.mobile_controls.finger_dimensions
			},
			//touch coords
			{
				x: e.touches[0].pageX,
				y: e.touches[0].pageY,
				z: hud.mobile_controls.finger_dimensions,
				w: hud.mobile_controls.finger_dimensions
			}
		], false);
		if(colliding_move_left) {
			inputManager.key_a = true;
		}
		
		//move right
		var colliding_move_right = CollisionDetection.isColliding([
			//control coords
			{
				x: hud.mobile_controls.coords.move_right.x,
				y: hud.mobile_controls.coords.move_right.y,
				z: hud.mobile_controls.finger_dimensions,
				w: hud.mobile_controls.finger_dimensions
			},
			//touch coords
			{
				x: e.touches[0].pageX,
				y: e.touches[0].pageY,
				z: hud.mobile_controls.finger_dimensions,
				w: hud.mobile_controls.finger_dimensions
			}
		], false);
		if(colliding_move_right) {
			inputManager.key_d = true;
		}
		
		//...
		
	} else {
		//stop touch. handled separately
	}
	
}

var touchInputHandlerMove = function(e) {
	return true;
	//e.preventDefault();
	
	//TODO: must handle at least 2 touches. 1 for left control and 1 for the right control
	
	if( typeof e.touches != 'undefined' && e.touches.length ) {
		var finger_dimensions = 60; //pixels
		
		
		
		//if( touch_coords.y >= 775-finger_dimensions ) {
		//	//right side - jump
		//}
		
		
		
		
		
		
		
		
		/*
		var touch_coords = {
			x: e.touches[0].pageX,
			y: e.touches[0].pageY
		};
		*/
		var touch_coords = {
			x: e.touches[0].pageX,
			y: e.touches[0].pageY,
			z: finger_dimensions,
			w: finger_dimensions
		};
		
		
		console.log('touch: '+touch_coords.x+', '+touch_coords.y);
		
		
		
		
		
		var control_jump_coords = {
			x: 1045 - (finger_dimensions / 2),
			y: 790 - (finger_dimensions / 2),
			z: finger_dimensions,
			w: finger_dimensions
		};
		
		
		
		colliding = CollisionDetection.isColliding([ control_jump_coords, touch_coords ], false);
		
		
		
		
		console.log(colliding);
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
	} else {
		//stop touch. handled separately
	}
	
}

var touchInputHandlerEnd = function(e) {
	//e.preventDefault();
	
	//TODO: must handle at least 2 touches. 1 for left control and 1 for the right control
	
	//how to know which touch has ended in the case of multiple touches?
	
	//also, how to know the coords of the previous touch so we can tell which button was released?
	
	inputManager.key_space = false;
	player.endJump(); //only one jump even if holding down key
	
	inputManager.key_a = false;
	
	inputManager.key_d = false;
	
}

//MOBILE EVENTS
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
	//mobile
	console.log('inputManager: mobile');
	//touch handlers
	hud.canvas_parent.addEventListener("touchstart", touchInputHandlerStart);
	hud.canvas_parent.addEventListener("touchmove", touchInputHandlerMove);
	hud.canvas_parent.addEventListener("touchend", touchInputHandlerEnd);
	hud.canvas_parent.addEventListener("touchcancel", touchInputHandlerEnd);
} else {
	//desktop
	console.log('inputManager: desktop');
	//DESKTOP EVENTS
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
}


