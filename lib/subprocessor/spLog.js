
/**
 * 
 * 
 * 
 * @class LogProcessor
 * @constructor
 * @since V1.0.0
 * @module Subprocessor
 * @param {Object} options
 * @param {String} options.file The name of the file to scan.
 * 
 * @param {Object} [libraries] Override libraries used by name. Primarily for testing but allows
 * 		replacement of standard libraries for specialized functions as well.
 */

/**
 * Represents the default options for a Log Subprocessor.
 * @property defaults
 * @type Object
 * @static
 */
var defaults = {
	"scanDelay": 100
};

/* TODO:
 * + Track name
 * + Track time active while scanning data
 * + Track starts
 * + Track stops
 * + Track create, start, stop, offline, last, uptime since last start
 * + Emit log data events for relevant state changes
 * + Status return (file URI connection, libraries are static)
 */

module.exports = function(options, libraries) {
	var subprocessor = this;
	options = Object.assign({}, defaults, options);
	libraries = libraries || {};

	var fs = libraries.fs || require("fs"),
		es = libraries.es || require("event-stream"),
		Alert = libraries.Alert || require("../array/alert"),
		Scan = libraries.Scan || require("../array/scan");

	var file = options.file;
	var storage = options.storage || new Store();
	
	var configuration = {},
	statistics = {},
	summary = {},
	indicies = [],
	exceptions = [],
	index = {},

	manifold = null,

	line = 0,
	/**
	 * Counts the number of log rotations that have
	 * been detected.
	 * @param rotation
	 * @type number
	 * @private
	 */
	rotation = 0,
	/**
	 * Tracks stream offset.
	 * 
	 * A rotation is detected when the stream tries to index to
	 * a start position and reads nothing AND the file has some
	 * size less than the read count. This results in read being
	 * reset to 0 and another read stream being created.
	 * @param read
	 * @type number
	 * @private
	 */
	read = 0,
	/**
	 * 
	 * @property stats
	 * @type fs.Stats
	 * @private
	 */
	stats = null,
	/**
	 * 
	 * @property timer
	 * @type TimeoutID
	 * @private
	 */
	timer = null,
	watcher = null,
	stream = null,
	busy = false;

	try {
		stats = fs.statSync(file);
	} catch(initError) {
		console.warn("File \"" + file + "\" missing?", initError);
	}

	this.initialize = function() {
		if(!file) {
			return new Alert("No file descriptor was received", 10);
		}
		
		busy = true;

		configuration = {};
		indicies = [];
		index = {};

		summary = {};
		summary.entries = 0;
		summary.fields = {};
		
		statistics = {};
		statistics.entries = 0;
		statistics.fields = {};

		if(options.indicies) {
			indicies = options.indicies;
			indicies.forEach(function(field) {
				statistics.fields[field] = new Field();
			})
		} else {
			indicies = false;
		}

		options.scanDelay = options.scanDelay || 100;
		return null;
	};

	this.reinitialize = function(settings) {
		if(busy || stream || watcher) {
			return new Alert("Can not reconfigure while subprocessor is busy", 0)
		}
		options = settings || options;
		subprocessor.initialize();
		return null;
	};

	this.shutdown = function(settings) {
		busy = false;
		clearTimeout(timer);
		stream.close();
	};

	this.start = function(array) {
		manifold = array;
		scan();
	};

	this.status = function() {
		return {
			"bound": !!manifold,
			"state": {
				"blocking": busy,
				"streaming": !!stream,
				"watching": !!timer
			},
			"file": {
				"name": file,
				"line": line,
				"rotation": rotation,
				"stats": stats
			},
			"exceptions": exceptions,
			"read": read,
			"time": {
				"recent": storage.getTimeline().splice(0, 5)
			}
		};
	};

	this.diagnostic = function(level) {
		
	};
	
	var report = function() {
		
	};

	var getLine = function(line, rotation) {
		return new Promise(function(done, fail) {

		});
	};

	var watch = function() {
		// fs.watch is slow to notify of changes actively, to solve this,
		// the file size is checked periodically as the log should be cummulative
		// until it isn't, at which point it shold be treated as a rotation of the
		// original file and stats should continue to be collected and line numbers
		// "versioned" with a rotation count
		if(stats) {
			timer = setTimeout(watching, options.scanDelay);
		} else {
			timer = setTimeout(scan, options.scanDelay);
		}
	};

	var scan = function() {
		try {
			stats = fs.statSync(file);
		} catch(error) {
			timer = setTimeout(watch, options.scanDelay);
			return error;
		}

		var length;
		if(stats.size < read) {
			read = 0;
			line = 0;
			rotation++;
		}

		stream = fs.createReadStream(file, {start: read});

		stream
		.pipe(es.split())
		.pipe(es.mapSync(function(data) {
			stream.pause();

			if(data) {
				length = data.length;
				if(data instanceof String || data.constructor.name === "String") {
					data = JSON.parse(data);
				}
				data.key = line + "r" + rotation;
				data._length = length;
				
				data = storage.track(++line, rotation, data);
				stat(data);

				manifold.emit("entry", data, summary);
			}

			stream.resume();
		}))
		.on("open", function(data) {
			console.log("stream Open: ", file);
		})
		.on("data", function(data) {
			console.log("Data[" + line + "." + rotation + "]: ", data.toString());
		})
		.on("close", function() {
			read += stream.bytesRead;
			console.log("stream Closed[" + stream.bytesRead + "|" + read + "]: ", file);
			console.log(
//					JSON.stringify(statistics, null, 4)
//					JSON.stringify(statistics.fields.level.values, null, 4)
			);
			stream = null;
			watch();
		})
		.on("error", function(error) {
			console.log("stream Error: ", error);

			var exception = {};
			exception.message = "Error reading file data stream: " + error.message;
			exception.stack = error.stack;
			exception.timestamp = Date.now();
			exception.cause = error;

			exception.fields = {};
			exception.fields.filename = file;

			exceptions.push(exception);
		});
	};

	var watching = function() {
		var compare;

		try {
			compare = fs.statSync(file);
		} catch(fileMIA) {
			var exception = {};
			exception.message = "Error watching file: " + fileMIA.message;
			exception.stack = fileMIA.stack;
			exception.timestamp = Date.now();
			exception.cause = fileMIA;

			exception.fields = {};
			exception.fields.filename = file;

			exceptions.push(exception);

			compare = false;
		}
		// Using size as modified time in theory doesn't matter for a log
		// and may falsely trigger a re-read to due stream open/close modifications
		if(!compare || compare.size === stats.size) {
			timer = setTimeout(watching, options.scanDelay);
		} else {
			timer = null;
			scan();
		}
	};
	
	var stat = function(data) {
		data = flatten(data);
		var keys = options.indicies || Object.keys(data);
		
		statistics.entries++;
		summary.entries++;
		
		keys.forEach(function(field) {
			if(!statistics.fields[field]) {
				statistics.fields[field] = new Field(field);
				summary.fields[field] = {};
				summary.fields[field].entries = 0;
			}
			statistics.fields[field].addEntry(data.key, data[field]);
			
			summary.fields[field].entries++;
			summary.fields[field].values = {};
			Object.keys(statistics.fields[field].values).splice(0,20).forEach(function(value) {
				summary.fields[field].values[value] = statistics.fields[field].values[value].count;
			});
		});
	};
};

var flatten = function(fluffed, arrays) {
	var destination = {};
	reduce("", fluffed, destination, arrays);
	return destination;
};

var reduce = function(lead, source, dest, arrays) {
	Object.keys(source).forEach(function(key) {
		if(source[key] instanceof Array && !arrays) {
			dest[lead + key] = source[key];
		} else if(source[key] instanceof Object || (source[key] instanceof Array && arrays)) {
			reduce(lead + key + ".", source[key], dest);
		} else{
			dest[lead + key] = source[key];
		}
	});
};

/**
 * 
 * 
 * @class Field
 * @constructor
 * @private
 */
var Field = function(name) {
	var field = this;
	this.name = name;
	this.occurrences = 0;
	this.entries = [];
	this.values = {};

	/**
	 * 
	 * @method addEntry
	 * @param {String} key Line number key
	 * @param {String} value The value of the field
	 */
	this.addEntry = function(key, value) {
		field.occurrences++;
		field.entries.push(key);
		if(!field.values[value]) {
			field.values[value] = new Occurrence(value);
		}
		field.values[value].addEntry(key);
	};
	
	this.toJSON = function() {
		return {
			"name": field.name,
			"entries": field.entries,
			"occurrences": field.occurrences,
			"values": field.values
		};
	};
};

var Occurrence = function(value) {
	var occurrence = this;
	this.value = value;
	this.count = 0;
	this.entries = [];

	/**
	 * 
	 * @method addEntry
	 * @param {String} key Line number key
	 * @param {String} value The value of the field
	 */
	this.addEntry = function(key) {
		occurrence.count++;
		occurrence.entries.push(key);
	};
	
	this.toJSON = function() {
		return {
			"value": occurrence.value,
			"count": occurrence.count,
			"entries": occurrence.entries
		};
	};
};

/**
 * 
 * A simple log entry storage system, replaceable through options.
 * 
 * Manages storing line information about log files for recollection
 * @class Store
 * @constructor
 * @private
 */
var Store = function() {
	var index = {};
	var timeline = {};

	this.track = function(line, rotation, data) {
		index[data.key] = data;
		
		var date = new Date(data.time);
		timeline[date.getTime()] = data;

		return data;
	};

	/**
	 * 
	 * @method retrieve
	 * @param {Number | String} line If not a raw line number, is the line key in the form "[Line Number]r[Rotation Number]".
	 * @param {Number} [rotation] The rotation number, if omitted treated as 0. 
	 * @return {Promise} Data describing that line entry. Implements a promise for abstraction purposes and to allow
	 * 		replacement with an asynchronous database structure.
	 */
	this.retrieve = function(line, rotation) {
		return new Promise(function(done) {
			if( !(line instanceof String) && line.constructor.name !== "String") {
				if(rotation === undefined) {
					rotation = 0;
				}
				line = line + "r" + rotation;
			}
			done(index[line]);
		});
	};


	this.getTimeline = function(start, finish) {
		return Object.keys(timeline).sort(function(a, b) {return parseInt(b)-parseInt(a);});
	};
};
