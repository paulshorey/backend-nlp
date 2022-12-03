let __root = new URL("../", import.meta.url).pathname
if (__root[__root.length - 1] === "/") {
  __root = __root.slice(0, -1)
}
global["__root"] = __root

/*
 * Debugging (and other flags)
 */
global["DEBUG_PATHS"] = false

/*
 * CLI control (pm2 and other bash commands)
 */
import * as child_process from "child_process"
const exec = child_process.exec
global["execute"] = function (command, callback) {
  exec(command, function (error, stdout) {
    if (callback) {
      callback(stdout, error)
    }
  })
}

/*
 * Host
 */
import * as os from "os"
global["hostname"] = os.hostname()
global["hosttype"] = os.type()
global["DEVELOPMENT"] = global["hosttype"].toLowerCase().includes("darwin")

/*
 *
 * Logging
 *
 */
//
// Errors
//
import * as Airbrake from "@airbrake/node"
global["airbrake"] = new Airbrake.Notifier({
  projectId: 268629,
  projectKey: "a51fcfa809e5edfa05e612f8de171f48",
  environment: process.env._system_name !== "OSX" ? "production" : "development"
})
global.handleError = (err) => {
  try {
    // log to cloud
    global["airbrake"].notify(err)
    // log to server
    let err_str = global["cconsole"].error_message(err) || err.message ? err.message : err
    global["cconsole"].error("err_str", err_str)
    // dislay message to client
    if (global.res && global.http_response) {
      global.http_response(global.res, 500, "Something broke. Please try again later... " + err_str)
    }
  } catch (e) {
    // fatal misconfiguration - redeploy codebase
    console.error("Fatal misconfigration! ", e)
    global.execute(`bash ${__root}/_bash/_start.sh`)
  }
}
process.on("uncaughtException", global.handleError)
process.on("unhandledRejection", global.handleError)
// //
// // Cloud
// //
// import logdna from "logdna"
// let dnaOptions: any = {
//   hostname: global["hostname"],
//   hosttype: global["hosttype"],
//   ip: global["clientIP"],
//   app: "nlpbe-node-api",
//   source: process.env._system_name !== "OSX" ? "production" : "development",
//   meta: true,
//   tags: []
// }
// let dnaConsole = logdna.createLogger("42ce61a790ba92d5c1661e4ad3affb83", dnaOptions)
// // LogDNA stops listening after a while, then starts again AFTER it receives a message.
// // Unfortunately, it drops the first 1 or 2 messages after a long silence!
// // So, ping it every 60 seconds, to keep its listener alive.
// let nlogged = 0
// setInterval(function () {
//   nlogged++
//   dnaConsole.log(nlogged + "", { level: "debug" })
// }, 60000)
// // Specify LogDNA level, by wrapping in custom functions.
// // Also, add AirBrake for Level "Error". (disabled)
// const cloudConsoleLog = function () {
//   dnaConsole.log(arguments.toString(), { level: "log" })
// }
// const cloudConsoleInfo = function () {
//   dnaConsole.log(arguments.toString(), { level: "info" })
// }
// const cloudConsoleWarn = function () {
//   dnaConsole.log(arguments.toString(), { level: "warn" })
// }
// const cloudConsoleError = function () {
//   // global['airbrake'].notify(arguments.toString())
//   dnaConsole.log(arguments.toString(), { level: "error" })
// }
//
// Local
//
import { cconsoleInit } from "@ps/cconsole"
global["cconsole"] = cconsoleInit({
  useTrace: true,
  useColor: true,
  logToCloud: {
    log: () => {},
    info: () => {},
    warn: () => {},
    error: () => {}
  }
})
