var SoundEngine = {
	music: null,
	sfx: [], //keep a reference to the sound effects so we can manipulate them
	path: {sfx: 'sound/sfx/', music: 'sound/music/'},
	init: function() {
		//no longer using // SoundEngine.music = SoundEngine.getMusic({file:'biochemie.ogg', loop: true});
		// in-game music 1 // SoundEngine.music = SoundEngine.getMusic({file:'revampedPRO/bgm_action_1.mp3', loop: true});
		//we load the menu music first because the player always gets the menu screen first when loading the game
		//5 sep 2020 - we disabled this because chrome now doesnt allow sounds until the window is interacted with
		//SoundEngine.music = SoundEngine.getMusic({file:'OveMelaa/FullScores/Ove Melaa - Approaching The Green Grass.ogg', loop: true});
		//if(Options.get().music.play) {
			//SoundEngine.toggleMusic();
			//SoundEngine.music.play();
		//} else {
			//SoundEngine.toggleMusic();
			//SoundEngine.toggleMusicBtn();
		//}
		//set the volume
		$.each($('.range_volume'), function() {
			var v = Options.get()[$(this).attr('data-type')].volume;
			if(v === null) v = 10;
			$(this).val(v);
			//SoundEngine.changeVolume({ type:$(this).attr('data-type'), volume:v });
		});
		
	},
	getSfx: function(o) {
		var sfx = new Audio(SoundEngine.path.sfx + o.file);
		if(typeof o.loop == 'boolean') {
			sfx.loop = o.loop;
		}
		SoundEngine.sfx.push(sfx);
		return sfx;
	},
	getMusic: function(o) {
		var music = new Audio(SoundEngine.path.music + o.file);
		if(typeof o.loop == 'boolean') {
			music.loop = o.loop;
		}
		return music;
	},
	changeVolume: function(o) {
		//change the volume of currently playing sounds
		if(o.type == 'music') {
			//if(Options.get().music.play) {
			if(typeof SoundEngine.music == 'object') {
				SoundEngine.music.volume = o.volume / 10;
			}
		} else if(o.type == 'sfx') {
			//if(Options.get().music.play) {
			for(var i=0; i<SoundEngine.sfx.length; i++) {
				if(typeof SoundEngine.sfx[i] == 'object') {
					SoundEngine.sfx[i].volume = o.volume / 10;
				}
			}
		}
		//save the changes
		var d = {};
		d[o.type] = {volume: o.volume};
		Options.set(d);
	},
	toggleMusic: function() {
		if(this.music) {
			if(!SoundEngine.music.paused) {
				//Options.get().music.play = false;
				SoundEngine.music.pause();
				//$('.toggle_music').text("Music On");
				//SoundEngine.toggleMusicBtn();
				//Options.set({music: {play: false}});
			} else {
				//Options.get().music.play = true;
				SoundEngine.music.play();
				//$('.toggle_music').text("Music Off");
				//SoundEngine.toggleMusicBtn();
				//Options.set({music: {play: true}});
			}
		}
	},
	/*toggleMusicBtn: function() {
		if($('.toggle_music').text() == "Music Off") {
			$('.toggle_music').text("Music On");
		} else {
			$('.toggle_music').text("Music Off");
		}
	},*/
	changeMusic: function(o) {
		if(true || this.music) {
			//var currently_playing = Options.get().music.play; //we need to stop and restart after switching
			//if(currently_playing) {
				//music currently playing, stop it
				SoundEngine.toggleMusic({button:'.toggle_music'});
			//}
			if(typeof o != 'undefined' && typeof o.path) {
				SoundEngine.music = SoundEngine.getMusic({file:o.path, loop: true});
				SoundEngine.changeVolume({ type:'music', volume:Options.get().music.volume });
				//console.log('music switched to: '+o.path);
			} else {
				console.log('requested to change music without file path. typeof params: '+(typeof o));
			}
			//if(currently_playing) {
				//music was playing, start it again
				SoundEngine.toggleMusic();
			//}
		}
	},
	
};
