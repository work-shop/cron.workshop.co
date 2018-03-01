# `cron.workshop.co`

Hi, there! Welcome to the docs for me, `cron.workshop.co`. I'm a little guy that schedules tasks and creates digest reports for you from Work-Shop's Paymo instance. My main use cases are to create recurring tasks in Paymo for specific users, to create recurring tasks for groups of users, and to compile digest reports of weekly activity to shoot over to you via email. In the future, I'd very much like to be able to respond to events that happen on Paymo and execute arbitrary HTTP tasks – but I can't do that yet.

## Environment

This repository and the associated `package.json` manifest contain almost everything you need to get me running on your local machine! There's one more file, `.env.json`, which contains our API keys and secrets for the Paymo API. You'll need this environment to get me running on your machine. Contact your sysadmin if you need this.

## Recurring tasks

So, you might be interested in scheduling recurring tasks for paymo. No problem. [Paymo's Task API](https://github.com/paymoapp/api/blob/master/sections/tasks.md) let's you post tasks to specific tasks, specific tasklists inside of tasks, and assign them to specific groups of users quite easily. I put a little layer over this API to allow you to schedule recurring updates to tasks. In the my root directory, there's a directory called `tasks`. Inside of this directory, you'll find a number of files. Each file in this directory is a single recurring task, structured as a node module that exports an object containing a few properties. Each task file in this directory requires **at least** the following:

```js
module.exports = {
     // Task Content Goes here:
     /**
      * The name of this task:
      */
     name: "The name of this recurring task.",
     /**
      * An optional description for this task.
      * You can leave this empty "".
      */
     description: "The description for this recurring task.",
     /**
      * The name of the project in Paymo.
      * Note that this name must be spelled EXACTLY
      * as it occurs in Paymo, including spaces and punctuation.
      */
     project: ".Internal", // The name of the project in Paymo to attach
     /**
      * The name of the tasklist for the project in Paymo
      * Note that this name must be spelled EXACTLY
      * as it occurs in Paymo, including spaces and punctuation.
      */
     tasklist: "Nic",
     /**
      * A list of usernames to assign the task to. This list can
      * be left empty to leave the task unassigned.
      */
     users: ["Nic Schumann"],

     /**
      * A single user name representing the assigning user.
      * This **must** be defined, or the application won't be
      * able to obtain an API key with which to authenticate.
      */
     assigner: "Greg Nemes"

     // Task Scheduling and Management Goes here:
     /**
      * If you longer want to schedule this task, but want
      * to keep this data around as a record, or for future use,
      * change this to false.
      */
     active: true,
     /**
      * The scheduler uses crontab style scheduling.
      */
     schedule: {
         second: "*/30",// 0 - 59, * = every */30 = every 30 seconds.
         minute: "*", // 0 - 59
         hour: "*",// 0 - 23
         dayOfMonth: "*", // 1 - 31
         month: "*",// 1 - 31
         dayOfWeek: "*" // [0...7], where both 0 and 7 are sunday.
     }
};
```

This task is scheduled using `crontab`-style scheduling. For a description and usage examples of the specific form of crontab syntax we can use, refer to [`node-schedule`](https://www.npmjs.com/package/node-schedule), the scheduling library we're utilizing. For a fun (ish) introduction to crontab syntax, check out [this site – "corntab"](http://corntab.com/).

Note that additions to the tasks folder are not hot-loaded by the running application. In order to add or remove a task from the schedule, you should make a change to your local copy of the project, and deploy the change to our live server. This will bring down the scheduler, and restart it, adding the task. Since schedules are time-based, any previously scheduled tasks should simply be rescheduled for the same time, resulting in no observable difference in system behavior the majority of reasonable cases.

## Recurring reports

*Not yet implemented.*
