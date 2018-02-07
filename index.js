"use strict";


var async = require('async');

var env = require('./.env.json');
var config = require('./package.json');

var Scheduler = require('./scheduler.js');
var scheduler = new Scheduler( env.key, config );

var tasks = require('./tasks.js');

//scheduler.postTask( tasks[0], function( e ) { if (e) {console.error( e );} } );
scheduler.scheduleTask( tasks[0] );
