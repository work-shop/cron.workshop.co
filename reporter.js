"use strict";

var union = require('array-union');
var async = require('async');
var scheduler = require('node-schedule');
var FastMap = require('collections/fast-map');


var Paymo = require('./paymo.js');


/**
 * This helper generates a 'where in' string for a given
 * paymo filter selector and set of IDs for that selector.
 */
function where_in_specified( selector, ids ) {
    return "where=" + selector + " in (" + ids.join(",") + ")";
}

/**
 * This helper generates a special selector for reducing the set of entries by
 * a given set of user and task ids, which have been computed from the domain.
 * It further restricts a range to a given time slice specified in the aggregation rule.
 *
 */
function entries_selector( user_ids, task_ids, from, to ) {
    return "where=user_id in (" + user_ids.join(",") + ") and task_id in (" + task_ids.join(",") + " ) and time_interval in (" + ["\""+from.format()+"\"", "\""+to.format()+"\""].join(",") + ")&include=project.name,task.name,task.tasklist.name";
}

/**
 * `select_objects` is a generic helper which, given a set of names and a set of objects with a .name,
 * reduced the set of objects to the set matching those names.
 */
function select_objects( names, objects ) {
    return ( names.length > 0 ) ? objects.filter( function( object ) { return names.indexOf( object.name ) !== -1; }) : objects;
}

/**
 * This helper us used to build a domain of projects to select a
 * set of tasklists from. It does so by merging the set of requested
 * projects with the active projects for the specified users.
 */
function merge_projects_and_users( projects, users ) {
    var project_domain = users.reduce( function(a,b) { return a.concat( b.assigned_projects ); }, []);
    return projects.filter( function( project ) { return project_domain.indexOf( project.id ) !== -1; }).map( function( project ) { return project.id; });
}

/**
 * For a given API request string, construct a unique cache-key,
 * to be used in caching a result locally for future use.
 *
 */
function cache_key( type, where ) {
    return [type, "?", where].join("");
}


/**
 * Constructor for the reporter class. This class manages aggregating and generating
 * datasructures that feed report templates.
 */
function Reporter( key, config ) {
    if ( !(this instanceof Reporter)) { return new Reporter(); }
    var self = this;

    self.paymo = new Paymo( key, config );
    self.cache = new FastMap();

}


/**
 * For a given aggregation, histogram, or time-series, this routine
 * constructs that rule's domain, which is defined as the set of
 * time entries matching its specified criteria.
 *
 */
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

                        callback( e, data.entries );

                    });

                });
            });
        });
    });
};

/**
 * This routine requests a set of objects in some type from the paymo API, filtered by a
 * specified selector and set of ids for that selector, and further filtered by a discrete
 * set of labels that the objects must have. Used to produce tasklists and tasks for a given set of
 * projects and tasklists, respectively.
 *
 */
Reporter.prototype.getIdentifiedObjects = function( type, selector, ids, object_names, callback ) {
    if ( typeof object_names === "undefined" ) { object_names = []; }

    var self = this;

    var where = where_in_specified( selector, ids );
    var key = cache_key( type, where );

    var cached = self.cache.get( key );

    if ( typeof cached !== "undefined" ) {

        callback( null, select_objects( object_names, cached ) );

    } else {

        self.paymo  .get( type, where )
                    .then( function( objects ) {

                        var result = objects[ type ];

                        self.cache.set( key, result );

                        callback( null, select_objects( object_names, result ) );

                    })
                    .catch( callback );

    }


};

/**
 * This routine pulls a set of objects of some type from the Paymo api, filtered by
 * some set of labels that the requested objects must have. Used to produce a set of
 * users and projects.
 *
 */
Reporter.prototype.getObjects = function( type, object_names, callback ) {
    if ( typeof object_names === "undefined" ) { object_names = []; }

    var self = this;

    var key = cache_key( type, "" );
    var cached = self.cache.get( key );

    if ( typeof cached !== "undefined" ) {

        callback( null, select_objects( object_names, cached ) );

    } else {

        this.paymo  .get( type )
                    .then( function( objects ) {

                        var result = objects[ type ];

                        self.cache.set( key, result );

                        callback( null, select_objects( object_names, result ) );

                    })
                    .catch( callback );

    }


};

/**
 * Given a domain of user_ids, task_ids, and a time slice, this routine requests
 * the set of time entries matching this criterion from the paymo API. used to
 * produce the final set of entries matching the aggregation, histogram, or time-timeseries
 * selectors from the API.
 *
 */
Reporter.prototype.getEntries = function( user_ids, task_ids, from, to, callback ) {

    this.paymo  .get( "entries", entries_selector( user_ids, task_ids, from, to ) )
                .then( function( entries ) { callback( null, entries ); })
                .catch( callback );

};

/**
 * Given an aggregation rule, build the appropriate domain, and run the aggregation, producing
 * the corresponding aggregated datapoint.
 *
 * @return number
 */
Reporter.prototype.runAggregation = function( aggregation_rule, callback ) {
    this.getDomain( aggregation_rule, function( e, entries ) {
        if ( e ) { callback( e ); }

        callback( null, aggregation_rule.aggregation( entries.map( aggregation_rule.selector ) ) );

    });
};

function build_domain_selector_from( selector, i ) {
    if ( i === 0 ) {
        return function( segment ) { return segment.range.map( selector ); };
    } else {
        return function( segment ) { return segment.range.map( build_domain_selector_from( selector, i - 1 ) ); };
    }
}


function partition_entries( selector, entries ) {
    var map = {};

    entries.forEach( function( entry ) {

        var key = "" + selector( entry );

        if ( typeof map[ key ] === "undefined" ) {

            map[ key ] = [ entry ];

        } else {

            map[ key ].push( entry );

        }
    });

    return map;

}


function build_histogram_map( range_selector, aggregation, selectors, entries ) {
    if ( typeof selectors[0] === "undefined" ) {

        return { total: aggregation( entries.map( range_selector ) ), items: {}, entries: entries };

    } else {

        var histogram = { items: {}, total: 0};
        var partition = partition_entries( selectors[0], entries );
        var tail = selectors.slice( 1 );

        for ( var c1 in partition ) {
            if ( partition.hasOwnProperty( c1 ) ) {
                histogram.items[ c1 ] = build_histogram_map( range_selector, aggregation, tail, partition[ c1 ] );
            }
        }

        for ( var c2 in histogram.items ) {
            if ( histogram.items.hasOwnProperty( c2 ) ) {
                histogram.total += histogram.items[ c2 ].total;
            }
        }

        return histogram;

    }
}


function build_histogram_set( range_selector, aggregation, selectors, entries ) {



    return entries.map( function( entry ) {
        var row = {};

        selectors.forEach( function( ) {

        });


    });
}

/**
 * Given a histogram rule, build the appropriate domain and run the histogram, returning
 * an array containing a series of object mapping a histogram domain element to the corresponding histogram range element.
 */
Reporter.prototype.runHistogram = function( histogram_rule, callback ) {
    this.getDomain( histogram_rule, function( e, entries ) {
        if ( e ) { callback( e ); }

        callback( null, build_histogram_map(
            histogram_rule.range_selector,
            histogram_rule.aggregation,
            histogram_rule.domain_selectors,
            entries
        ) );

    });
};







module.exports = Reporter;
