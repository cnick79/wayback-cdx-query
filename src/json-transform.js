/*jshint node: true*/
/*global require, module */

/**
 * Takes a CDX Query array and converts it to a JSON object.
 */

'use strict';

var util        = require('util'),
    stream      = require('stream');

function JsonTransform(options) {

    if ( ! (this instanceof JsonTransform)) {
        return new JsonTransform(options);    
    }
    
    if (! options) {
        options = {};
    }

    options.objectMode = true;

    this._fields = options.fields;
    
    stream.Transform.call(this, options);
}

util.inherits(JsonTransform, stream.Transform);

JsonTransform.prototype._transform = function (data, encoding, nextData) {

    if (data.length != this._fields.length) {
        this.emit( "error", new Error( "Uneven number of fields in stream array" ) );    
    }
    
    var json = {};

    for(var f = 0; f < this._fields.length; f++) {
        var key = this._fields[f];

        json[key] = data[f];
    }

    this.push(new Buffer(JSON.stringify(json)));

    nextData();
};



module.exports = JsonTransform;
