import * as child_process from "child_process"
import "dotenv/config"
import "./global"
import * as fs from "fs"
import * as http from "http"
import * as https from "https"
import bodyParser from "body-parser/index"
import import_expressApp from "express/index"
import cors from "cors"
import { serverStartError } from "./lib/process"
import { http_response } from "./lib/http"
import * as RequestIp from "@supercharge/request-ip"
const { getClientIp } = RequestIp
import * as os from "os"
const os_platform = os.platform()
const host_is_dev = os_platform === "darwin"
let __root = new URL("../", import.meta.url).pathname
if (__root[__root.length - 1] === "/") {
  __root = __root.slice(0, -1)
}
const expressApp = import_expressApp()
const PORT = "1080"
const DEBUG1 = false

// debug Headers
if (DEBUG1) {
  // app.use(... is same as app.all('/*',...
  expressApp.use(function (req, res, next) {
    global.cconsole.warn(`"${req.method}"`, req.path)
    global.cconsole.log("headers", req.headers)
    global.cconsole.log("query", req.query)
    global.cconsole.log("body", req.body)
    next()
  })
}

// expressApp CORS
expressApp.use(cors())

// detect real IP address of request
expressApp.use(function (req, res, next) {
  req.client_ip = getClientIp(req)
  req.host_is_dev = host_is_dev
  next()
})

// Parse input
expressApp.use(bodyParser.urlencoded({ extended: false }))
expressApp.use(bodyParser.json())

// Modify output
// const responseInterceptor = function(req, res, next) {
//   const originalSend = res.send
//
//   res.send = function() {
//     console.log("arguments", arguments)
//     arguments[0] = "TEST " + arguments[0]
//     originalSend.apply(res, arguments)
//   }
//   next()
// }
// expressApp.use(responseInterceptor)

// Endpoint errored!
expressApp.use(function (err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render("error", { error: err })
})

// No endpoint
expressApp.get("/", async function (req, res) {
  global.cconsole.info("/")
  let greetings = [
    "hi",
    "howdy",
    "hey",
    "shalom",
    "salam",
    "aloha",
    "hola",
    "goodbye",
    "bonjour",
    "ciao",
    "wassup",
    "hello",
    "salutation",
    "welcome",
    "hullo",
    "hallo",
    "hiya",
    "hug",
    "kiss",
    "welcome",
    "hello there"
  ]
  http_response(res, 200, {
    time: Date.now(),
    randomGreeting: greetings[Math.floor(Math.random() * 22)]
    // message: "Please see https://besta.domains/api for API documentation."
  })
})

// Redeploy codebase
expressApp.all("/_bash/_deploy", function (req, res) {
  global.cconsole.warn(`bash ${__root}/_bash/_deploy.sh`)
  child_process.exec(`bash ${__root}/_bash/_deploy.sh`)
  http_response(res, 200, {
    message: "Github Hook received!",
    query: req.query,
    body: req.body
  })
})

import api_3rdparty from "./3rdparty"

api_3rdparty(expressApp, http_response)

import api_domains from "./data.domains"

api_domains(expressApp, http_response)

import api_words from "./data.words"

api_words(expressApp, http_response)

import api_wordio from "./wordio"

api_wordio(expressApp, http_response)

import domain_suggestions from "./domain_suggestions"

domain_suggestions(expressApp, http_response)

import domain_availability from "./domain_availability"

domain_availability(expressApp, http_response)

import domain_tools from "./domain_tools"

domain_tools(expressApp, http_response)

import api_crawl from "./crawl"

api_crawl(expressApp, http_response)

/*
 * Endpoint not found
 */
expressApp.get("*", async function (req, res) {
  res.status(404)
  let err = "Could not find API"
  global.cconsole.error(`*`, err)
  http_response(res, 404, err)
})

// HTTP
const httpServer = http.createServer(expressApp)
httpServer.on("error", serverStartError)
httpServer.listen(PORT, () => {
  global.cconsole.log("HTTP Server running on port " + PORT)
})
// HTTPS
if (!host_is_dev) {
  try {
    const ssl_key = fs.readFileSync(
      __root + `/_certs/api${process.env.PRODUCTION ? "" : "-staging"}.wordio.co.key`,
      "utf8"
    )
    const ssl_crt = fs.readFileSync(
      __root + `/_certs/api${process.env.PRODUCTION ? "" : "-staging"}.wordio.co.crt`,
      "utf8"
    )
    const ssl_credentials = { key: ssl_key, cert: ssl_crt }
    console.log("ssl_credentials", ssl_credentials)
    const httpsServer = https.createServer(ssl_credentials, expressApp)
    httpsServer.on("error", serverStartError)
    httpsServer.listen(1443, () => {
      global.cconsole.log("HTTPS Server running on port 1443")
    })
  } catch (e) {
    global.cconsole.error(e)
  }
}

/*
 * EXIT
 */
process.on("exit", function (code) {
  return global.cconsole.log(`About to exit with code ${code}`)
})
