/**
 * Expose the Layer class.
 */
module.exports = Layer;


/**
 * Dependencies.
 */
var debug = require('debug')('protoo:Router:Layer');
// var debugerror = require('debug')('protoo:ERROR:Router:Layer');
var pathRegexp = require('path-to-regexp');


/**
 * Local variables..
 */
hasOwnProperty = Object.prototype.hasOwnProperty;  // jshint ignore:line


function Layer(path, options, fn) {
	debug('new() | [path:%s]', path);

	options = options || {};

	this.handle = fn;
	this.name = fn.name || '<anonymous>';
	this.params = undefined;
	this.path = undefined;
	this.keys = [];
	this.regexp = pathRegexp(path, this.keys, options);

	if (path === '/' && options.end === false) {
		this.regexp.fast_slash = true;
	}
}


Layer.prototype.handle_request = function handle(req, next) {
	var fn = this.handle;

	if (fn.length > 2) {
		// Not a standard request handler.
		return next();
	}

	try {
		fn(req, next);
	} catch(error) {
		next(error);
	}
};


Layer.prototype.handle_error = function handle_error(error, req, next) {
	var fn = this.handle;

	if (fn.length !== 3) {
		// Not a standard error handler.
		return next(error);
	}

	try {
		fn(error, req, next);
	} catch(error) {
		next(error);
	}
};


/**
 * Check if this route matches `path`, if so
 * populate `.params`.
 */
Layer.prototype.match = function match(path) {
	if (path === null) {
		// No path, nothing matches.
		this.params = undefined;
		this.path = undefined;
		return false;
	}

	if (this.regexp.fast_slash) {
		// Fast path non-ending match for / (everything matches).
		this.params = {};
		this.path = '';
		return true;
	}

	var m = this.regexp.exec(path);
	if (! m) {
		this.params = undefined;
		this.path = undefined;
		return false;
	}

	// Store values.
	this.params = {};
	this.path = m[0];

	var keys = this.keys;
	var params = this.params;
	var prop;
	var n = 0;
	var key;
	var val;

	for (var i=1, len=m.length; i<len; ++i) {
		key = keys[i - 1];
		prop = key ? key.name : n++;
		val = decode_param(m[i]);

		if (val !== undefined || ! hasOwnProperty.call(params, prop)) {
			params[prop] = val;
		}
	}

	return true;
};


function decode_param(val){
	if (typeof val !== 'string') {
		return val;
	}

	try {
		return decodeURIComponent(val);
	} catch(e) {
		var err = new TypeError('Failed to decode param "' + val + '"');
		err.status = 400;  // TODO: jeje
		throw err;
	}
}