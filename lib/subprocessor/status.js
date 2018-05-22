
/**
 * 
 * @class SubprocessorStatus
 * @constructor
 * @module Subprocessor
 * @param {Object} details General details of the status.
 * @param {Array} [libraries] Array of Strings naming the libraries that are currently in use by
 * 		the Subprocessor.
 * @param {Object} [connections] Links connections by their name in the subprocessor to details
 * 		describing that connection. See {{#crossLink "SubprocessorConnection"}}{{/crossLink}}
 * 		for required object fields.
 */
module.exports.status = function(details, libraries, connections) {
	Object.assign(this, details);
	
	/**
	 * Internally tracked name of the Subprocessor.
	 * @property name
	 * @type String
	 */

	/**
	 * When the subprocessor was created.
	 * @property created
	 * @type Number
	 */

	/**
	 * When the subprocess was last started.
	 * @property started
	 * @type Number
	 */

	/**
	 * How long the Subprocessor has been active since its last start.
	 * @property uptime
	 * @type Number
	 */
	
	/**
	 * When the subprocessor was last shutdown by a Subsystem
	 * @property offline
	 * @type Number
	 */
	
	/**
	 * When the last scan aggregation collected data from the subprocessor.
	 * @property last
	 * @type Number
	 */

	/**
	 * How many times the subprocessor has been started
	 * @property starts
	 * @type Number
	 */

	/**
	 * When the subprocess was last stopped.
	 * @property stops
	 * @type Number
	 */
	
	/**
	 * How long the subprocessor has spent in an active state processing data.
	 * @property active
	 * @Number
	 */
	
	/**
	 * 
	 * @property libraries
	 * @type Array | String
	 */
	this.libraries = libraries || this.libraries || [];
	
	/**
	 * 
	 * @property connections
	 * @type Object | SubprocessorConnection
	 */
	this.connections = this.connections || {};
	Object.assign(this.connections, connections);
};


/**
 * 
 * @class SubprocessorConnection
 * @constructor
 * @module Subprocessor
 * @param {Object} details General details of the connection.
 */
module.exports.connection = function(details) {
	Object.assign(this, details);
	
	/**
	 * Internally tracked name of the connection within the Subprocessor.
	 * @property name
	 * @type String
	 */
	
	/**
	 * Describing protocol.
	 * 
	 * Examples:
	 * + `http` Hypertext Transfer Protocol
	 * + `mongodb` MongoDB Database
	 * + `postgresql` PostgreSQL database
	 * + `file` File on a filesystem
	 * + `wss` Secure Websocket
	 * + `tcp` Raw TCP socket
	 * + `icmp` Ping/Routing Tests
	 * 
	 * @property protocol
	 * @type String
	 */

	/**
	 * The remote address to which this connection goes.
	 * @property address
	 * @type Number
	 */

	/**
	 * The port at the remote where this connection goes if applicable. 
	 * @property port
	 * @type Number
	 * @optional
	 */

	/**
	 * The path in use by the connection if applicable.
	 * @property path
	 * @type Number
	 * @optional
	 */

	/**
	 * The primary application to which this connection traverses.
	 * 
	 * Specifically, this name should correspond to Resources in a related LCARSystem if
	 * one is associated with the SensorArray instance.
	 * 
	 * @property application
	 * @type String
	 */
	
	/**
	 * An Array detailing the usages of this connection beyond the URI description.
	 * 
	 * An example would be the names of Database tables or MongoDB collections being used.
	 * 
	 * Specifically, these names should correspond to Resources in a related LCARSystem if
	 * one is associated with the SensorArray instance.
	 * 
	 * @property usage
	 * @type Array | String
	 */

	/**
	 * Timestamp for when this connection was created.
	 * @property created
	 * @type Number
	 */

	/**
	 * Timestamp for when this connection was last accessed.
	 * @property last
	 * @type Number
	 */
};
