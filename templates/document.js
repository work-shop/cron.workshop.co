"use strict";

var d3 = require("d3");
var jsdom = require("jsdom");


function makePage( d3, pages, pageWidth, pageHeight ) {
    return d3.select('body').append('div').attr('id', pages[ pages.length - 1 ] ).append('svg').attr({
        xmlns: "http://www.w3.org/2000/svg",
        width: pageWidth,
        height: pageHeight
    });
}


module.exports = function( sections, callback ) {

    var pageWidth = 2550;
    var pageHeight = 3300;

    jsdom.env({
        html: "",
        features: { QuerySelector: true },
        done: function( error, window ) {

            if ( error ) { callback( error ); }

            window.d3 = d3.select( window.document );

            var pages = ['p0'];

            var container = makePage( d3, pages, pageWidth, pageHeight );

            sections.forEach( function( section ) { section( window, container, pageWidth, pageHeight, function() {

                pages.push( 'p' + pages.length );

                container = makePage( d3, pages, pageWidth, pageHeight );

            }); });

            callback( null, pages.map( function( id ) { return d3.select( "#" + id ).html(); }) );

        }
    });

};
