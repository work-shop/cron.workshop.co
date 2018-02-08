"use strict";

var path = require("path");
var async = require("async");
var fs = require("fs");

module.exports = function( directory, callback ) {

    fs.readdir( path.join( __dirname, directory ), function( ls_err, files ) {

        if ( ls_err ) { callback( ls_err ); }

        files = files.map( function( file ) { return ["./", directory, "/", file ].join(''); });

        callback( null, files.map( require ) );

    });

};
