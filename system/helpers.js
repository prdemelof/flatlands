//helper function
/*Object.size = function(obj) {
    var size = 0, key;
    for(key in obj) {
        if(obj.hasOwnProperty(key)) size++;
    }
    return size;
};*/

Object.defineProperty(Object.prototype, "toArray", { 
    value: function() {
		return ($.map(this, function(value, index) { return [value]; }));
	},
    enumerable : false
});

Object.defineProperty(Object.prototype, "join", { 
    value: function(d) {
		return (this.toArray()).join(d);
	},
    enumerable : false
});

Object.defineProperty(Object.prototype, "length", { 
    value: function() {
		var size = 0, key;
		for(key in this) {
			if(this.hasOwnProperty(key)) size++;
		}
		return size;
	},
    enumerable : false
});
