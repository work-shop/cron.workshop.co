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
        description: "Nic, complete this task tomorrow morning if you see it.",
        project: ".Internal",
        tasklist: "Nic",
        users: ["Nic Schumann"],

        // Scheduling and Management
        active: true,
        schedule: {
            second: "*/30",// 0 - 59, * = every
            minute: "*", // 0 - 59
            hour: "*",// 0 - 23
            dayOfMonth: "*", // 1 - 31
            month: "*",// 1 - 31
            dayOfWeek: "*" // [0...7], where both 0 and 7 are sunday.
        }
    }

];
