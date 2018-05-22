
/**
 * An Alert is raised from a Subprocessor when an issue has occurred that has caused it to
 * fail to collect data in some way.
 * 
 * The subprocess passes an Alert to its Manifold who in turn uses the level and number of
 * raised Alerts to determine its Health and the Health of the Subprocessor. When either
 * becomes too low, the one in danger is disabled and flagged for review by an Engineer.
 * 
 * Note that Alerts are for issues with functionality in a Subsystem. For Subprocessor
 * event emission results, regardless of the status of the result of the result, see
 * {{#crossLink "Scan"
 * 
 * @class Alert
 * @constructor
 * @module SensorArray
 * @param {String} message
 * @param {Number} [level] Level represents the criticality of the alert from 0 to 10.
 * 		Defaults to 5. 
 * @param {Object} [details] Field values to track for describing the issue.
 * @param {Error} [original] Tracks the underlying Error that caused the system to raise
 * 		the Alert, if one is available. 
 */
module.exports = function(message, level, details, original) {
	Object.assign(this, details);
	
	/**
	 * 
	 * @property message
	 * @type String
	 */
	this.message = message;

	/**
	 * Timestamp when this Alert was raised
	 * @property raised
	 * @type Number
	 */
	this.raised = Date.now();
	
	/**
	 * The time at which this Alert was determined to have occurred.
	 * 
	 * Defaults to the value of {{#crossLink "Alert/raised:property}}{{/crossLink}} if
	 * time is not present in the details of the Alert.
	 * @property time
	 * @type Number
	 */
	this.time = this.time || this.raised;
	
	/**
	 * Indicates the significance of the Alert. Values range from 0 to 10.
	 * 
	 * Level 0 means that the Alert should be considered informational and has no actual
	 * impact of system operation.
	 * 
	 * Level 10 means that system functionality should be considered completely offline. 
	 * @property level
	 * @type Number
	 */
	if(level === undefined) {
		this.level = 5;
	} else {
		this.level = level;
		if(this.level < 0) {
			this.level = 0;
		} else if(this.level > 10) {
			this.level = 10;
		}
	}
	
	if(original) {
		this.original = original;
		this.stack = original.stack;
		this.message += ": " + original.message;
	}
};
