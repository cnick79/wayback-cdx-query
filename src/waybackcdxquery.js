/*jshint node: true*/
/*global require, module */

/**
 * Utility for querying the Wayback Machine CDX server.
 */

'use strict';
var querystring = require('querystring'),
    request     = require('request');

var ArrayTransform = require('./array-transform'),
    JsonTransform  = require('./json-transform'),
    FIELDS         = require('./fields');


var CDX_SERVER = 'http://web.archive.org/cdx/search/cdx';

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

    this.arrayTransform = new ArrayTransform({
        objectMode: true
    });

    this.jsonTransform = new JsonTransform({
        objectMode: true,
        fields: this.params.fl || defaults.fl
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
 * Builds a querystring based on cfgs.
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

/**
 * Returns a JSON object containing a CDX record.
 *
 * @return JSON string
 */
WaybackCdxQuery.prototype.queryStream = function () {
    return request(this.url())
        .pipe( this.arrayTransform )
        .pipe( this.jsonTransform );
};

module.exports = WaybackCdxQuery;