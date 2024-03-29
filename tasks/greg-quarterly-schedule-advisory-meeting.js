"use strict";

/**
 * This module contains a scheduled task.
 * These tasks are scheduled once, on system start. Modifying
 * This file at runtime will not have an effect on job schedule.
 *
 * ==== Update Sales Tracking Spreadsheet ====
 *
 */
module.exports = {
    // Content
    name: "Schedule Quarterly Advisory Board Meeting",
    description: "",
    project: ".Internal",
    tasklist: "Greg",
    users: ["Greg Nemes"],
    assigner: "Nic Schumann",

    // Scheduling and Management
    active: true,
    schedule: {
        second: "0",
        minute: "30", // 0 - 59
        hour: "4",// 0 - 23
        dayOfMonth: "15", // 1 - 31
        month: "3,6,9,12",// 1 - 31
        dayOfWeek: "*" // [0...7], where both 0 and 7 are sunday.
    }
};
