/*
 * Execute CLI (usually for "pm2 stop all")
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
 * Get information about user
 */
import * as os from "os"
global["hostname"] = os.hostname()
global["hosttype"] = os.type()
global["DEVELOPMENT"] = global["hosttype"].includes("arwin")

// let ifaces = os.networkInterfaces()
// let VISITOR_IF_NAMES = []
// let VISITOR_IP_ADDRESSES = []
// Object.keys(ifaces).forEach(function (ifname) {
//   let alias = 0
//   ifaces[ifname].forEach(function (iface) {
//     if ("IPv4" !== iface.family || iface.internal !== false) {
//       // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
//       return
//     }
//     if (alias >= 1) {
//       // this single interface has multiple ipv4 addresses
//       VISITOR_IF_NAMES.push(ifname + ":" + alias)
//     } else {
//       // this interface has only one ipv4 adress
//       VISITOR_IF_NAMES.push(ifname)
//     }
//     ++alias
//     // use
//     VISITOR_IP_ADDRESSES.push(iface.address)
//   })
// })
// global["clientIP"] = VISITOR_IP_ADDRESSES[VISITOR_IP_ADDRESSES.length - 1]
// console.log('global["clientIP"]', global["clientIP"])

/*
 *
 * Log to console and cloud - with the same call!
 *
 */

//
// log fatal errors to Airbrake
//
import * as Airbrake from "@airbrake/node"

global["airbrake"] = new Airbrake.Notifier({
  projectId: 268629,
  projectKey: "a51fcfa809e5edfa05e612f8de171f48",
  environment: process.env._system_name !== "OSX" ? "production" : "development"
})

global.handleError = (err) => {
  // always log to cloud
  global["airbrake"].notify(err)
  // format error message for client
  try {
    let err_str = global["cconsole"].error_message(err) || err.message ? err.message : err
    global["cconsole"].error("err_str", err_str)
    // try displaying message to client
    // if (global.res && global.http_response) {
    //   global.http_response(global.res, 500, err_str)
    // }
  } catch (e) {
    console.error("pm2 handleError=", e)
    // that didn't work - stop server
    global.execute("pm2 restart all")
    process.exit()
  }
}

process.on("uncaughtException", global.handleError)
process.on("unhandledRejection", global.handleError)

//
// log everything to LogDNA
//
import logdna from "logdna"

let dnaOptions: any = {
  hostname: global["hostname"],
  hosttype: global["hosttype"],
  ip: global["clientIP"],
  app: "nlpbe-node-api",
  source: process.env._system_name !== "OSX" ? "production" : "development",
  meta: true,
  tags: []
}
let dnaConsole = logdna.createLogger("42ce61a790ba92d5c1661e4ad3affb83", dnaOptions)
// LogDNA stops listening after a while, then starts again AFTER it receives a message.
// Unfortunately, it drops the first 1 or 2 messages after a long silence!
// So, ping it every 60 seconds, to keep its listener alive.
let nlogged = 0
setInterval(function () {
  nlogged++
  dnaConsole.log(nlogged + "", { level: "debug" })
}, 60000)
// Specify LogDNA level, by wrapping in custom functions.
// Also, add AirBrake for Level "Error". (disabled)
const cloudConsoleLog = function () {
  dnaConsole.log(arguments.toString(), { level: "log" })
}
const cloudConsoleInfo = function () {
  dnaConsole.log(arguments.toString(), { level: "info" })
}
const cloudConsoleWarn = function () {
  dnaConsole.log(arguments.toString(), { level: "warn" })
}
const cloudConsoleError = function () {
  // global['airbrake'].notify(arguments.toString())
  dnaConsole.log(arguments.toString(), { level: "error" })
}

//
// log to console
//
import { cconsoleInit } from "@ps/cconsole/src"
// debug
global["cconsole"] = cconsoleInit({
  useTrace: true,
  useColor: true,
  logToCloud: {
    log: cloudConsoleLog,
    info: cloudConsoleInfo,
    warn: cloudConsoleWarn,
    error: cloudConsoleError
  }
})
// cloud-debug
global["ccconsole"] = cconsoleInit({
  useTrace: true,
  useColor: true,
  logToCloud: {
    log: cloudConsoleLog,
    info: cloudConsoleInfo,
    warn: cloudConsoleWarn,
    error: cloudConsoleError
  }
})
