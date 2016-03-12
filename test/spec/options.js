/*global require, describe, it, expect*/

var FIELDS          = require('../../src/fields');
var WaybackCdxQuery = require('../../src/waybackcdxquery');

describe('Merging Wayback CDX Query options with defaults', function () {

    it("handles no options", function () {
        var wbQuery = new WaybackCdxQuery();
        
        expect(wbQuery.params).toEqual(wbQuery.defaults);
    });
    
    it("handles changing field list", function () {
        var fl = [
            FIELDS.TIMESTAMP,
            FIELDS.ORIGINAL,
            FIELDS.MIMETYPE,
            FIELDS.STATUSCODE,
            FIELDS.LENGTH
        ];

        var wbQuery = new WaybackCdxQuery({
            fl: fl
        });
        
        expect(wbQuery.params.fl).toEqual(fl);
    });
});