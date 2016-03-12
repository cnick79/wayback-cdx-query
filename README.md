Wayback Machine CDX Query
-------------------

The `wayback-cdx-query` module is a package to perform queries on the [wayback machine](http://web.archive.org) CDX server.


Installation
-------------------

`npm install wayback-cdx-query`


Usage
-------------------
```
var WaybackCdxQuery = require('wayback-cdx-query');

var waybackCdx = new WaybackCdxQuery();
waybackCdx.query( function (error, data) {
    console.log(data);
});
```


Support
-------------------

Please file issues here at Github

This software is licensed under the MIT License.