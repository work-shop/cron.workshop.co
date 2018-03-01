"use strict";



var env = require("./.env.json");
var config = require("./package.json");

var loaddir = require("./load-directory-contents.js");

var Scheduler = require("./scheduler.js");
var scheduler = new Scheduler( env, config );


/**
 * Load the set of tasks out of the `./tasks` directory,
 * filter that set to the actively scheduled tasks,
 * and schedule recurring posts for each active task.
 */
loaddir( 'tasks', function( e, tasks ) {

    if ( e ) { console.error( e ); process.exit( 1 ); }

    tasks
        .filter( function( task ) { return task.active; })
        .forEach( function( task ) {
            scheduler.scheduleTask( task, function( e ) {
                if ( e ) { console.error( e ); }
            });
        });

});
