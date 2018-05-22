
/**
 * 
 * 
 * 
 * @class PingProcessor
 * @constructor
 * @since V1.0.0
 * @module Subprocessor
 * @param {Object} [options]
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
};


/* Notes:
 * Could use https://www.npmjs.com/package/ping here, but each check would spawn a new ping
 * process.
 * 
 * Alternatively, a child process could simply be created that continuously pings. This saves
 * child process spin up but could be expensive on the system.
 * 
 * To this end, spConnectivity is a variant of this that spawns a continuous ping process. Where
 * the PingSubprocessor merely tests periodically.
 */



module.exports = function(options, libraries) {
	
};
