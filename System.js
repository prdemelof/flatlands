var System = {
	loadImage: function(o) {
		var log_prefix = 'System could not load image: ';
		if(typeof o == 'undefined') {
			console.log(log_prefix+'missing params');
		} else if(typeof o != 'object') {
			console.log(log_prefix+'invalid params');
		} else if(typeof o.path != 'string') {
			console.log(log_prefix+'invalid file path');
		} else {
			var img = new Image();
			img.src = o.path;
			return img;
		}
	},
	//load the tileset settings for this map. stuff like which tiles have collision boxes, which tiles act as portals, etc
	loadTileset: function(map) {
		if(typeof map == 'object') {
			$.ajax({
				async: false,
				data_type: 'JSON',
				type: 'GET',
				url: 'map/'+map.tileset_source,
				success: function(tileset) {
					map.tileset = tileset;
				}
			});
		}
		return map;
	},
	//convert the Tiled layers data into our own format
	convertLayersData: function(map) {
		if(typeof map == 'object') {
			var num_layers = map.layers.length;
			var map_width = map.width; //in tiles
			//var map_height = map.height; //in tiles
			for(var i = 0; i < num_layers; i++) {
				map.layers[i] = {
					//data: System.listToMatrix(map.layers[i].data, map_width),
					data: ( map.layers[i].type == "tiles" ? System.listToMatrix(map.layers[i].data, map_width) : map.layers[i].data ),
					name: map.layers[i].name,
					collidable: map.layers[i].collidable,
					visible: map.layers[i].visible,
					type: map.layers[i].type,
				}
			}
		}
		return map;
	},
	//map converter helper function
	listToMatrix: function(list, elementsPerSubArray) {
		var matrix = [], i, k;
		for (i = 0, k = -1; i < list.length; i++) {
			if (i % elementsPerSubArray === 0) {
				k++;
				matrix[k] = [];
			}
			matrix[k].push(list[i]);
		}
		return matrix;
	},
	//rounding helper function. originally designed to round to exactly 5
	roundNearest: function(round_to, x) {
		return (x % round_to) >= (round_to / 2) ? parseInt(x / round_to) * round_to + round_to : parseInt(x / round_to) * round_to;
	},
	randomNumberBetween: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	
};
