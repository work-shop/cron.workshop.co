"use strict";

var env = require('./.env.json');
var config = require('./package.json');

var Scheduler = require('./scheduler.js');
var scheduler = new Scheduler( env.key, config );

var tasks = require('./tasks.js');

scheduler.scheduleTask( tasks[0] );
