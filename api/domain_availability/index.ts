/*
 * IMPORTS
 */
import get_domains_availability from "./availability"
import { performance } from "perf_hooks"
import aggregate_req_body_query from "@ps/fn/io/req/aggregate_req_body_query_params"
// import auth_captcha from "../auth_captcha"

/*
 * APIs
 */
let DEBUG_ENDPOINTS = true
let DEBUG_TIME = false
let DEBUG1 = false // be reminded of where what when
let DEBUG2 = false // something broke
export default function (expressApp, http_response) {
  /*
   *
   * AVAILABILITY API
   * GET/POST (internal, from CLI)
   *
   */
  expressApp.all("/v1/*availability", async function (req, res) {
    global.res = res
    let start_time
    if (DEBUG_TIME) start_time = performance.now()
    if (DEBUG2) global.cconsole.log("/v1/availability", req.query, req.body)
    // aggregate POST data and URL parameters
    let query = aggregate_req_body_query(req)
    if (DEBUG2) global.cconsole.log("/v1/availability", query)
    if (query) {
      if (query.domains && typeof query.domains === "string") {
        query.domains = query.domains.split(",")
      }
    }
    if (DEBUG1) global.cconsole.log("/v1/availability", query.domains.length)
    if (!query || !query.domains) {
      http_response(res, 200, { type: typeof query.domains, val: query.domains })
    }
    try {
      /*
       * get availability
       */
      if (DEBUG_ENDPOINTS) global.cconsole.info("GET/v1/availability " + query.domains.length)
      let results: any = await get_domains_availability(query)
      if (!query.show_metadata) {
        results = { status: results.status, note: results.note }
      }

      /*
       * return data
       */
      if (DEBUG_TIME) global.cconsole.info("availability " + Math.round(performance.now() - start_time) + " ms")
      http_response(res, 200, results)
    } catch (err) {
      err.user_id = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress
      global.ccconsole.error("GET/POST /v1/availability", err)
      if (DEBUG_TIME) global.cconsole.warn("availability " + Math.round(performance.now() - start_time) + " ms")
      http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
    }
  })
}
