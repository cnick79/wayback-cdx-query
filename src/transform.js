/*jshint node: true*/
/*global require, module */

/**
 * A stream.Transform to convert CDX Query input into a JSON object.
 */

'use strict';

var util        = require('util'),
    stream      = require('stream');

function WaybackCdxQueryTransform(options) {
    var self = this;

    self.body = '';

    if ( ! (this instanceof WaybackCdxQueryTransform)) {
        return new WaybackCdxQueryTransform(options);    
    }
    
    if (! options) {
        options = {};
    }

    options.objectMode = true;
    
    stream.Transform.call(self, options);
}

util.inherits(WaybackCdxQueryTransform, stream.Transform);

WaybackCdxQueryTransform.prototype._transform = function (data, encoding, nextData) {
    
    //console.log( data.toString().indexOf(' ') );

    console.log( data.toString().split(' ', 6));

    //this.body += String(data);

    this.push(String(data) + '********');
    nextData();
/*
    for (var i =data.length - 1; i >= 0; i--) {
       var d = data[i];
console.log(d);
       var record = {
            url: d[0],
            timestamp: d[1],
            original: d[2],
            mimetype: d[3],
            statuscode: d[4],
            digest: d[5],
            length: d[6]
        }

        this.push(record);
    };
    
    nextData();
*/
};

WaybackCdxQueryTransform.prototype._flush = function (next) {
    this._transform(data);
    next();
/*
    var data;

    data = {
        statusCode: this.statusCode,
        //headers: this.headers,
        body: JSON.parse(this.body)
    };

    console.log(data);

    if (this.statusCode === '200') {
        this.push(JSON.stringify(data));
        next();
    }
    else {
        next(data);
    }
    */
};


module.exports = WaybackCdxQueryTransform;
