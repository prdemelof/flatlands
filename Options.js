var Options = {
	//properties
	data: {},
	//core functions
	init: function() {
		this.loadData();
	},
	loadData: function() {
		var d = JSON.parse(localStorage.getItem('options'));
		if(!d) d = {};
		//default options
		Options.data = $.extend({
			sfx: {
				volume: 10,
			},
			music: {
				volume: 10,
			}
		}, d);
	},
	get: function() { return Options.data; },
	set: function(o) {
		Options.data = $.extend(true, Options.data, o);
		localStorage.setItem('options', JSON.stringify(Options.data));
	},
	//sound
	
};
