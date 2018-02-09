"use strict";

var union = require('array-union');
var async = require('async');
var scheduler = require('node-schedule');
var Paymo = require('./paymo.js');


function where_in_specified( selector, ids ) {
    return "where=" + selector + " in (" + ids.join(",") + ")";
}


function user_name_in( names ) {
    return names.map( function( user ){ return "name=\"" + user + "\""; }).join(" or ");
}

function select_objects( names, objects ) {
    return ( names.length > 0 ) ? objects.filter( function( object ) { return names.indexOf( object.name ) !== -1; }) : objects;
}

function merge_projects_and_users( projects, users ) {
    var project_domain = users.reduce( function(a,b) { return a.concat( b.assigned_projects ); }, []);
    return projects.filter( function( project ) { return project_domain.indexOf( project.id ) !== -1; }).map( function( project ) { return project.id; });
}



/**
 *
 *
 */
function Reporter( key, config ) {
    if ( !(this instanceof Reporter)) { return new Reporter(); }
    var self = this;

    self.paymo = new Paymo( key, config );
    self.cache = {};

}


Reporter.prototype.runReport = function( template ) {

};

Reporter.prototype.getDomain = function( parameters, callback ) {

    var self = this;

    self.getObjects( "users", parameters.users, function( e, users ) {

        if ( e ) { callback( e ); }

        var user_domain = users.map( function( user ) { return user.id; });

        self.getObjects("projects", parameters.projects, function( e, projects ) {

            if ( e ) { callback( e ); }

            var project_domain = merge_projects_and_users( projects, users );

            self.getIdentifiedObjects( "tasklists", "project_id", project_domain, parameters.tasklists, function( e, tasklists ) {

                if ( e ) { callback( e ); }

                var tasklist_domain = tasklists.map( function( list ) { return list.id; });

                self.getIdentifiedObjects( "tasks", "tasklist_id", tasklist_domain, parameters.tasks, function( e, tasks ) {

                    if ( e ) { callback( e ); }

                    var task_domain = tasks.map( function( t ) { return t.id; });

                    self.getEntries( user_domain, task_domain, parameters.from, parameters.to, function( e, data ) {

                        console.log( data.entries.filter( function( e ) { return user_domain.indexOf( e.user_id ) === -1; }));

                        callback( e, data.entries );

                    });

                });
            });
        });
    });
};


Reporter.prototype.getIdentifiedObjects = function( type, selector, ids, object_names, callback ) {
    if ( typeof object_names === "undefined" ) { object_names = []; }

    var where = where_in_specified( selector, ids );

    this.paymo  .get( type, where )
                .then( function( objects ) {  callback( null, select_objects( object_names, objects[ type ] )); })
                .catch( callback );

};


Reporter.prototype.getObjects = function( type, object_names, callback ) {
    if ( typeof object_names === "undefined" ) { object_names = []; }

    this.paymo  .get( type )
                .then( function( objects ) { callback( null, select_objects( object_names, objects[ type ] ) ); })
                .catch( callback );
};

Reporter.prototype.getEntries = function( user_ids, task_ids, from, to, callback ) {

    console.log( from.format() );
    console.log( to.format() );

    this.paymo  .get( "entries", "where=user_id in (" + user_ids.join(",") + ") and task_id in (" + task_ids.join(",") + " ) and time_interval in (" + ["\""+from.format()+"\"", "\""+to.format()+"\""].join(",") + ")"  )
                .then( function( entries ) { callback( null, entries ); })
                .catch( callback );

};


Reporter.prototype.runAggregation = function( aggregation_rule, callback ) {
    this.getDomain( aggregation_rule, function( e, entries ) {
        if ( e ) { callback( e ); }

        callback( null, aggregation_rule.aggregation( entries.map( aggregation_rule.selector ) ) );

    });
};



module.exports = Reporter;
