/*jshint node: true*/
/*global define, require, module */

/**
 * Class for fetching and building the results of the
 * Wayback machine CDX restoration.
 */
'use strict';

var Promise      = require('bluebird'),
    request      = require('request'),
    fs           = require('fs'),
    util         = require('util'),
    EventEmitter = require('events').EventEmitter;

var Url          = require("../utils/url"),
    CdxRecord    = require("./cdxrecord");

Promise.promisifyAll(require("request"), { multiArgs: true });

/**
 * @param {Object}  configs     Default configs to apply
 */
var CdxQuery = function CdxQuery(config) {
    EventEmitter.call(this);

    this.domainName = config.domainName;

    this.filename = config.filename || this.domainName + '.cdx';

    this.max_timestamp = config.max_timestamp || ''; // Don't include restores after this date

    this.archive_source = 'http://web.archive.org';

    // store CdxRecords returned by query
    this.records = null;

    this.cdxUrl = this.archive_source + "/cdx/search/cdx?url=" +
        this.domainName + "*" +
        "&output=json" +
        "&gzip=false" +
        "&filter=statuscode:200" +
        "&collapse=timestamp:8,digest";
}

util.inherits(CdxQuery, EventEmitter);

/**
 * @return the Url used to query
 *
 * @public
 */
CdxQuery.prototype.getCdxUrl = function () {
    return this.cdxUrl;
};

/**
 * Fetch the content of a CDX query.
 *
 * @return {Promise} A Promise with the CDX query body which should be JSON format.
 */
CdxQuery.prototype.fetch = function () {
    var self = this;
    return request.getAsync(this.getCdxUrl()).spread(function (response, body) {
        if (response.statusCode !== 200) {
            throw new Error('Unsuccessful attempt. Code: ' + response.statusCode);
        }
//console.log(body);
        return JSON.parse(body);
    });
};

/**
 * @param     {json[]}         json     The results of a CDX query
 */
CdxQuery.prototype.createCdxJson = function (json) {
    var count;

    this.records = {};

    if (json) {
        for (count = 0; count < json.length; count++) {
            if (count > 0) {
                var record = json[count];

                // This defines the fields of a CDX record.
                var urlkey = record[0],
                    timestamp = record[1],
                    original = record[2],
                    mimetype = record[3];

                //var key = Url.makeRelative(original);
                var key = this.convertLinkToCdxKey(original);

                if (!this.records.hasOwnProperty(key) || timestamp <= this.max_timestamp) {
                    // Store the CDX record.
                    /*this.records[key] = {
                        key: key,
                        original: original,
                        timestamp: timestamp,
                        type: mimetype
                        //type: setPageType(mimetype)
                    };*/

                    // @TODO - Create CDX Record object
                    var cdxRecord = new CdxRecord();
                    cdxRecord.set('key', key);
                    cdxRecord.set('original', original);
                    cdxRecord.set('timestamp', timestamp);
                    cdxRecord.set('type', mimetype);

                    this.records[key] = cdxRecord;
                }
            }
        }
    }
};

/**
 * This function finds a link (key) that was returned in the CDX query, create_cdx_json().
 *
 * @param {string} key A relative link to search for in the CDX record set.
 * @return {boolean/string} The CDX record.
 *
 * @public
 */
CdxQuery.prototype.findRecordByKey = function (key) {
    if (this.records.hasOwnProperty(key)) {
        return this.records[key];
    } else {
        return false;
    }
};

CdxQuery.prototype.findRecordByLink = function (link) {
    var key = this.convertLinkToCdxKey(link);

    // does the link/key match a record returned by the CDX query?
    return this.findRecordByKey(key);
};

CdxQuery.prototype.save = function (file) {
    var filename = file || this.filename;

    fs.writeFile(filename, JSON.stringify(this.records));
    //console.log(this);
    
};

/**
 * Opens a CDX from a file.
 *
 * Events:
 *      ready
 */
CdxQuery.prototype.open = function (file) {
    var cdx = this;

    this.filename = file || this.filename;

    fs.openFile(this.filename, function () {
        //cdx.emit('ready');
    });
};

CdxQuery.prototype.load = function () {
    var cdx = this;

    cdx
        .fetch()
        .then(function (json) {
            if (json) {
                cdx.createCdxJson(json);
                cdx.save();
                cdx.emit('loaded');
                //setImmediate(cdx.test, cdx);
            }
        });
};

CdxQuery.prototype.setFilename = function (name) {
    this.filename = name;
};


/**
 * Converts a link to a key used by the CDX Query.
 */
CdxQuery.prototype.convertLinkToCdxKey = function (link) {
    var key = Url.makeRelative(link);

    var re = new RegExp(this.archive_source, "i");

    key = key.replace(re, '');

    re = new RegExp('(\/web\/[0-9]+([imjscd_\/]+)?(http[s]?:\/\/[0-9a-zA-Z-_\.]*' + this.domainName + ')?)', 'gim');
    key = key.replace(re, '');

    // remove leading slashes
    key = key.replace(/^\/+/i, '');

    return '/' + key;
};

module.exports = CdxQuery;