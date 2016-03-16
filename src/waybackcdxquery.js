/*jshint node: true*/
/*global require, module */

/**
 * Utility for querying the Wayback Machine CDX server.
 */

'use strict';
var querystring = require('querystring'),
    request     = require('request');

var WbTransform = require('./transform'),
    FIELDS      = require('./fields');


var CDX_SERVER = 'http://web.archive.org/cdx/search/cdx',
    FIELDS = {
        URLKEY: "urlkey",
        TIMESTAMP: "timestamp",
        ORIGINAL: "original",
        MIMETYPE: "mimetype",
        STATUSCODE: "statuscode",
        DIGEST: "digest",
        LENGTH: "length"
    };

var defaults = {
    url: '',
    fl: [
        FIELDS.URLKEY,
        FIELDS.TIMESTAMP,
        FIELDS.ORIGINAL,
        FIELDS.MIMETYPE,
        FIELDS.STATUSCODE,
        FIELDS.DIGEST,
        FIELDS.LENGTH
    ],
    outputFormat: 'json',
    matchType: 'exact',
    gzip: 'true',
    filter: null,
    limit: null,
    offset: null
};

/**
 * @private
 *
 * Merge two objects. If the keys match, the target object will
 * be updated the new obj[key] value.
 */
function merge(target, obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            target[key] = obj[key];
        }
    }

    return target;
}

function WaybackCdxQuery(cfgs) {
    //this.defaults = defaults;
    this.params = cfgs;

    this.transformer = new WbTransform({
        objectMode: true
    });
    //this.params = merge(this.defaults, cfgs);
}

/**
 * Returns the URL to query.
 */
WaybackCdxQuery.prototype.url = function () {
    return CDX_SERVER + '?' + this.queryString();
};

/**
 * Builds a querying based on cfgs.
 */
WaybackCdxQuery.prototype.queryString = function () {
    return querystring.stringify(this.params);
};

/**
 * Call to query the CDX server.
 *
 * @return error, response, body
 */
WaybackCdxQuery.prototype.query = function (callback) {

    return request(this.url(), function (error, response, body) {
        if (error) {
            callback(error);
        }
        
        return callback(error, response, body);
    });
};

// @TODO implement data stream
// see http://blog.yld.io/2016/01/13/using-streams/#.VuW7hHUrI3o
WaybackCdxQuery.prototype.queryStream = function (callback) {
    return request(this.url()).pipe( this.transformer );
};

/**
 * Performs a CDX query but returns a Promise.
 *
 * @return {Promise}
 *
WaybackCdxQuery.prototype.queryPromise = function () {
    var self = this;
    
    return request.getAsync(this.getCdxUrl()).spread(function (response, body) {
        if (response.statusCode !== 200) {
            throw new Error('Unsuccessful attempt. Code: ' + response.statusCode);
        }
        return JSON.parse(body);
    });
};
*/

/*
var GetNumPages = function () {
    return var http://web.archive.org/cdx/search/cdx?url=archive.org&showNumPages=true
};
*/

module.exports = WaybackCdxQuery;