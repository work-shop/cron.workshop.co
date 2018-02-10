"use strict";

var moment = require('moment');

var project = function( entry ) { return entry.project.name; };
var task = function( entry ) { return entry.task.name; };
var duration = function( entry ) { return entry.duration; };
var sum = function( values ) { return values.reduce( function( a,b ) { return a + b; }, 0); };



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
            selector: duration,
            aggregation: sum,
            from: moment().day(0),
            to: moment()
        }
    ],
    histograms: [
        {
            users: ["Nic Schumann"],
            domain_selectors: [project, task],
            range_selector: duration,
            aggregation: sum,
            from: moment().day(0),
            to: moment()
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
