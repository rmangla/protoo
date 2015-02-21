/**
 * Expose the Response class.
 */
module.exports = Response;


/**
 * Dependencies.
 */
var debug = require('debug')('protoo:Response');
var debugerror = require('debug')('protoo:ERROR:Response');
debugerror.log = console.warn.bind(console);


function Response(msg) {
	// Attributes.
	this.id = msg.id;
	this.data = msg.data || {};

	debug('new() | [id:%s]', this.id);
}


Response.prototype.isResponse = function() {
	return true;
};


Response.prototype.isRequest = function() {
	return false;
};