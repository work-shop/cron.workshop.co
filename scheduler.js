"use strict";

var async = require('async');
var schedule = require('node-schedule');
var Paymo = require('./paymo.js');

module.exports = function Scheduler( key, config ) {
    if ( !(this instanceof Scheduler)) { return new Scheduler(); }
    var self = this;

    var paymo = new Paymo( key, config );

    self.scheduleTask = function( task ) {

        async.parallel({
                users: function( done ) {
                    paymo   .get( "users" )
                            .then( function( d ) { done( null, d.users.filter( function( user ) { return task.users.indexOf( user.name ) !== -1 || task.users.indexOf( user.email ) !== -1; } ) ); } )
                            .catch( done );
                },
                tasklist: function( done ) {
                    paymo   .get( "projects" )
                            .then( function( d ) {

                                var project = d.projects.filter( function ( project ) { return project.name.toLowerCase() === task.project.toLowerCase() || project.code === task.project_name; } );
                                if ( project.length > 1 ) { done( new Error("Error: Project Name \"" + task.project + "\" did not select a unique project." ) ); }
                                if ( project.length < 1 ) { done( new Error("Error: Project \"" + task.project + "\" doesn't exist." ) ); }


                                paymo   .get("tasklists", "where=project_id=" + project[0].id )
                                        .then( function( d ) {

                                            var tasklist = d.tasklists.filter( function( tasklist ) { return tasklist.name.toLowerCase() === task.tasklist.toLowerCase(); });
                                            if ( tasklist.length > 1 ) { done( new Error("Error: Tasklist Name \"" + task.tasklist + "\" did not select a unique tasklist." ) ); }
                                            if ( tasklist.length < 1 ) { done( new Error("Error: Tasklist \"" + task.tasklist + "\" doesn't exist." ) ); }

                                            done( null, tasklist[0] );

                                        })
                                        .catch( done );

                            })
                            .catch( done );

                }
            },
            function( e, results ) {

                if ( e ) { throw e; }

                paymo.post('tasks', {
                    "name": task.name,
                    "description": task.description,
                    "tasklist_id": results.tasklist.id,
                    "users": results.users.map( function( user ) { return user.id; })
                })
                .then( function( d ) {
                    console.log( d );
                })
                .catch( function( e ) {
                    console.error( e );
                });

            }
        );

    };




};
