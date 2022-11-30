// import { responseDataType } from "./types"
import get_domains_suggestions from "./suggestions/index"
import chunk_string from "@ps/nlp/api/lib/chunk_string"
import { performance } from "perf_hooks"
import aggregate_req_body_query from "@ps/fn/io/req/aggregate_req_body_query_params"
// import { responseData } from "./mocks"
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
   *
   * SUGGESTIONS API
   * GET/POST
   *
   *
   */
  expressApp.all("/v1/*suggestions-mock", async function (req, res) {
    global.res = res
    let response: any = {}
    http_response(res, 200, response)
  })
  expressApp.all("/v1/*suggestions", async function (req, res) {
    global.res = res
    let start_time
    if (DEBUG_TIME) start_time = performance.now()
    /*
     * validate input
     */
    let query = aggregate_req_body_query(req) // aggregate POST data and URL inputs
    // backwards compatibility
    if (!query.str && query.domain) {
      query.str = query.domain
      delete query.domain
    }
    // parse
    if (query) {
      if (query.tlds_use && typeof query.tlds_use === "string") {
        query.tlds_use = query.tlds_use.split(",")
      }
      if (query.tlds_ignore && typeof query.tlds_ignore === "string") {
        query.tlds_ignore = query.tlds_ignore.split(",")
      }
    }
    // input str
    let input_str = query.domain || query.str || "" // required
    if (input_str.length < 2) {
      let err = "domain or keyword str not specified"
      http_response(res, 500, err)
      return
    }
    // input tld
    let input_tlds_user = query.tld ? [query.tld] : query.tlds_use || ["com"] // default value
    /*
     * prepare response
     */
    let response: any = {}
    /*
     * AUTHENTICATE
     */
    // if (req.headers["experimental"]) {
    //   let user: any = await auth_captcha(req, {})
    //     throw user
    //   }
    //   if (user) {
    //     response.auth_expires = user.expires
    //     response.user_id = user.id
    //     response.user_is_local = user.is_local
    //   }
    // } else {
    //   /*
    //    * API client - only trust RapidAPI whitelisted IPs
    //    */
    //   // let user: any = await auth_rapidapi(req, {})
    //   // if (user instanceof Error) {
    //   //   http_response(res, 500, user)
    //   // }
    //   // if (user) {
    //   //   // ok, you may pass
    //   // }
    // }
    try {
      // if (typeof user !== "undefined" && user instanceof Error) {
      //   throw '!user';
      // }
      /*
       *
       * VALIDATE INPUTS
       *
       */
      if (input_str === "test_fail") throw new Error("test failed on purpose - hello_worl")
      // default value (should never be empty!)
      if (!input_str) {
        input_str = "best domain names"
      }
      // default value
      if (!input_tlds_user.length) {
        input_tlds_user.push("com")
      } else if (input_tlds_user[0] === "") {
        input_tlds_user = ["com"]
      }

      /*
       *
       * CHUNK STRING
       *
       */
      const chunks: any = await chunk_string(input_str, input_tlds_user[0], !!query.spell_check)
      response.string_original = chunks.string_original.toLowerCase()
      response.string = chunks.string.toLowerCase()
      response.tld = chunks ? chunks.tld : ""
      // dashes
      if (chunks.options.string_includes_dashes) {
        response.string = chunks.string.replace(/ /g, "-")
        query.use_dashes = chunks.options.string_includes_dashes
      }

      /*
       *
       * GENERATE SUGGESTIONS
       *
       */
      let results: any = await get_domains_suggestions(
        response.string_original,
        response.string,
        response.tld,
        chunks.chunks_keys,
        chunks.chunks_rows,
        query,
        input_tlds_user || [],
        query.tlds_ignore || [],
        chunks.bing_alts || []
      )

      /*
       *
       * RESPONSE
       *
       */
      if (!response.tld) {
        response.tld = results.tlds[0]
      }
      response = {
        ...response,
        ...results
      }
      // Temporary
      response.domains = response.domains_lists
      delete response.domains_lists
      //
      if (!req.host_is_dev && !req.headers["experimental"]) {
        // Production
        delete response.tlds_extra
        delete response.phrases
        delete response.phrase_lists
        delete response.word_hacks
        delete response.com_hacks
        delete response.phrase_hacks
        delete response.is_name
        delete response.is_tech
        delete response.is_brand
        delete response.is_about_nou
        delete response.is_about_ver
      } else {
        // Development
        // Simplify phrases
        if (response.phrases) {
          response.phrases = response.phrases.map((obj) => obj.string)
        }
      }

      /*
       *
       * RETURN
       *
       */
      http_response(res, 200, response)
    } catch (err) {
      err.user_id = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress
      global.ccconsole.error('GET/POST /v1/suggestions str="' + input_str + '"', err)
      http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
    }
  })
}
