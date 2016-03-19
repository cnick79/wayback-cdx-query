/*global require, describe, it, expect*/

var fs = require('fs');

var FIELDS          = require('../../src/fields');
var WaybackCdxQuery = require('../../src/waybackcdxquery');

describe('Querying the Wayback Machine', function () {
    
    it("requires a `url` parameter", function () {
        var wbQuery = new WaybackCdxQuery({
            url: 'archive.org'
        });
        
        expect(wbQuery.params.url).toBeDefined();
    });
    
    it("accepts limiting results", function (done) {
        var test_limit = 3;
        
        var wbQuery = new WaybackCdxQuery({
            url: 'archive.org',
            output: 'json',
            limit: test_limit
        });
        
        wbQuery.query( function (error, response, body) {
            if (error) {
                throw new Error('Unsuccessful query: ' + error);
            }
        
            var result = JSON.parse(body);
            
            // account for first record being the field names
            expect(result.length-1).toBe(test_limit);
            
            done();
        });
        
    });

    it("returns a JSON object", function (done) {
        var wbQuery = new WaybackCdxQuery({
            url: 'archive.org',
            //output: 'json',
            limit: 3
        });
        
        var output = fs.createWriteStream('test.txt');
        
        //http://web.archive.org/cdx/search/cdx?url=archive.org&output=json&limit=3
        
        // pull in one record at a time.
        var stream = wbQuery.queryStream()
        //.pipe(output)
        .on('finish', function() {
            console.log('finish');
            done();
        }).on('error', function (error) {
            console.log('Error: ' + error);
            done();
        });
        
        //expect(wbQuery.params).toEqual(wbQuery.defaults);
    });
    
});