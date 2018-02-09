"use strict";

var moment = require('moment');
var total_project_hours = function( obj ) { return obj.duration; };
var sum = function( data ) { return data.reduce( function( a,b ) { return a + b; }, 0); };



module.exports = {
    title: "Test Report",
    recipient: ["Nic Schumann"],
    /**
     * Aggregation rules are rules that reduce a set of datapoints
     * to an aggregate value representing some kind of sum,
     * product, or average over the underlying data.
     */
    aggregations: [
        {
            users: ["Nic Schumann"],
            selector: total_project_hours,
            from: moment().day(0),
            to: moment(),
            aggregation: sum
        }
    ],
    histograms: [
        {
            users: ["Nic Schumann"],

        }
    ],
    timeseries: [],
    active: true,
    schedule: {
        second: "0",
        minute: "30", // 0 - 59
        hour: "4",// 0 - 23
        dayOfMonth: "*", // 1 - 31
        month: "*",// 1 - 31
        dayOfWeek: "1" // [0...7], where both 0 and 7 are sunday.
    }
};
