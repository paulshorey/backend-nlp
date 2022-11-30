/*
 * IMPORTS
 */
import { performance } from "perf_hooks"
import cli_whois from "@ps/nlp/api/domain_availability/availability/promise_one/cli_whois"
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
   * WHOIS (1 domain)
   *
   */
  {
    let url = "/v1/whois"
    expressApp.get(url, async function (req, res) {
      if (DEBUG1) global.cconsole.info("/v1/whois", req.query, req.body)
      let start_time = Date.now()
      if (DEBUG_TIME) start_time = performance.now()
      try {
        let results: any = { domain: req.query.domain, expiry: "", whois: "not found" }
        let doms_dict: any = await cli_whois(req.query.domain, { whois: true })
        if (doms_dict) {
          let data = doms_dict[results.domain]
          if (data) {
            results.expiry = data[2]
            results.whois = data[3]
          }
        }

        /*
         * authenticate
         */
        if (req.headers["experimental"]) {
          let user
          try {
            // user = await auth_captcha(req)
          } catch (e) {
            console.log("captcha auth error", e)
          }
          if (user) {
            console.log("captcha auth success! user=", user)
            // response.auth_expires = user.expires
            // response.user_id = user.id
          }
        } else {
          // coming soon - validate RapidAPI referrer,
          // and optionally include Captcha if configured for site_id
        }

        /*
         * return data
         */
        if (DEBUG_TIME) global.cconsole.info(url + " " + Math.round(performance.now() - start_time) + " ms")
        http_response(res, 200, results)
      } catch (err) {
        err.user_id =
          req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress
        global.ccconsole.error("GET " + url, err)
        if (DEBUG_TIME) global.cconsole.warn(url + " " + Math.round(performance.now() - start_time) + " ms")
        http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
      }
    })
  }
}
