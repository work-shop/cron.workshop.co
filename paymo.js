"use strict";

var request = require("request-promise");
var base64 = require("base-64");

var validPaymoTypes = ["bookings", "clientcontacts", "clients", "comments", "company", "discussions", "estimatetemplates", "timeentries", "users", "projects", "tasklists", "tasks"];

function Paymo( key, config ) {
    if (!(this instanceof Paymo)) { return new Paymo( key, config ); }
    var self = this;

    self.key = key;
    self.paymo_url = config.paymo_url;

}

/** Make an authenticated API get request */
Paymo.prototype.get = function( type, query ) {

    if ( validPaymoTypes.indexOf( type ) === -1 ) { throw new Error("Error: \"" +type+ "\" is not a valid Paymo request type."); }

    query = ( typeof query === "undefined" ) ? "" : "?" + query;

    var encodedKey = this.key + ":X";

    return request({
        uri: [this.paymo_url, type, query].join(''),
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Authorization": ["Basic", base64.encode( encodedKey ) ].join(" "),
        },
        json: true
    });

};

/** Make an authenticated API get request */
Paymo.prototype.post = function( type, data ) {

    if ( validPaymoTypes.indexOf( type ) === -1 ) { throw new Error("Error: \"" +type+ "\" is not a valid Paymo request type."); }

    var encodedKey = this.key + ":X";

    return request({
        uri: [this.paymo_url, type].join(''),
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": ["Basic", base64.encode( encodedKey ) ].join(" "),
        },
        body: data,
        json: true
    });

};

module.exports = Paymo;
