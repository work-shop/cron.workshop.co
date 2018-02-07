"use strict";

/**
 * This module contains the set of all scheduled tasks.
 * These tasks are scheduled once, on system start. Modifying
 * This file at runtime will not have an effect on job schedule.
 */
module.exports = [
    {
        // Content
        name: "Test Task from Node",
        description: "Greg, complete this task tomorrow morning if you see it.",
        project: ".Internal",
        tasklist: "Greg",
        users: ["Nic Schumann", "Greg Nemes"],

        // Scheduling and Management
        active: true,
        schedule: {
            second: "*",// 0 - 59, * = every
            minute: "/5", // 0 - 59
            hour: "*",// 0 - 23
            dayOfMonth: "*", // 1 - 31
            month: "*",// 1 - 31
            dayOfWeek: "2" // [0...7], where both 0 and 7 are sunday.
        }
    }

];
