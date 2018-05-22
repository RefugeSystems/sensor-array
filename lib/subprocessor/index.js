
/**
 * Classes for Subprocessor to mount to a Sensor Array.
 * @module Subprocessor
 * @main
 */

module.exports.Log = require("./spLog.js");

module.exports.SubprocessorStatus = require("./status").status;
module.exports.SubprocessorConnection = require("./status").connection;

/**
 * 
 * @class Subprocessor
 * @constructor
 * @abstract
 * @module Subprocessor
 * @param {Object} [options] Options with which to configure the subprocessor.
 * @param {Object} [libraries] Libraries to use within the Subprocess. By name, the modules
 * 		off of this object should be used before attempting to require the module.
 */

/**
 * 
 * @method status
 * @return {SubprocessorStatus | Object} If returning an Object, the fields must match the fields
 * 		specified in SubprocessorStatus.
 */


{};