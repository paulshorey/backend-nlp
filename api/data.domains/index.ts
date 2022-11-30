/*
 * IMPORTS
 */
import { data_domains_get_all } from "../data.domains/pgdb"
import domain_key from "../data.domains/promise/key" // get one domain (from key)
import domain_row_update from "../data.domains/promise/row_update" // get row (from row), but update synonyms first
import domain_syns_of_syns from "../data.domains/promise/key_syns_of_syns" // get dictionary of syns1:syns2

const validate_req = function (req) {
  if (!req.headers.host.includes(":")) {
    throw new Error("This API is private.")
  }
}

/*
 * Monitor API requests
 */
let requests_limit = 10
let requests_count = 0
let requests_total = 0

/*
 * API
 */
let DEBUG1 = false
export default function (expressApp, http_response) {
  /**
   * GET
   * one domain
   * @params: key
   * @returns: row
   */
  expressApp.get("/api/data/domain/:key", async function (req, res) {
    global.res = res
    try {
      validate_req(req)

      const results = await domain_key(req.params.key, { parse: false })
      http_response(res, 200, results)
    } catch (err) {
      err.where = "api"
      http_response(res, 500, err)
    }
    /*
     * Log
     */
    if (process.env._system_name !== "OSX") {
      if (DEBUG1) global.ccconsole.info(`GET "/api/data/domain/${req.params.key}"`, { host: global["hostname"] })
      /*
       * Too many requests ?!?
       */
      requests_count++
      if (requests_count >= requests_limit) {
        requests_total += requests_count
        requests_count = 0
        throw new Error(`GET data.domains requests_total=${requests_total}`)
      }
    }
  })

  /**
   * GET
   * all domains
   * @returns: array of rows
   */
  expressApp.get("/api/data/domains", async function (req, res) {
    global.res = res
    try {
      validate_req(req)

      const results = await data_domains_get_all("key,syns1,syns")
      http_response(res, 200, results)
    } catch (err) {
      err.where = "api"
      http_response(res, 500, err)
    }
    /*
     * Log
     */
    if (process.env._system_name !== "OSX") {
      if (DEBUG1) global.ccconsole.info(`GET "/api/data/domain/${req.params.key}"`, { host: global["hostname"] })
      /*
       * Too many requests ?!?
       */
      requests_count++
      if (requests_count >= requests_limit) {
        requests_total += requests_count
        requests_count = 0
        throw new Error(`GET data.domains requests_total=${requests_total}`)
      }
    }
  })

  /**
   * GET
   * dictionary of domain syns1:syns2
   * @param key
   * @response incomplete DB row: { syn1: [ syn2, ], }
   */
  expressApp.get("/api/data/domain_syns_of_syns/:key", async function (req, res) {
    global.res = res
    try {
      validate_req(req)
      const results = await domain_syns_of_syns(req.params.key)
      http_response(res, 200, results)
    } catch (err) {
      err.where = "api"
      http_response(res, 500, err)
    }
    /*
     * Log
     */
    if (process.env._system_name !== "OSX") {
      if (DEBUG1) global.ccconsole.info(`GET "/api/data/domain/${req.params.key}"`, { host: global["hostname"] })
      /*
       * Too many requests ?!?
       */
      requests_count++
      if (requests_count >= requests_limit) {
        requests_total += requests_count
        requests_count = 0
        throw new Error(`GET data.domains requests_total=${requests_total}`)
      }
    }
  })

  /**
   * PUT
   * update romain row - pass new row with any key/value pair
   * @params: key
   * @body: edited DB row: { key: '', syns1: [], syns2: [], }
   *    may be incomplete, but must include at least a "key" property
   * @response: {message: 'success'} or {error: 'failed'}
   */
  expressApp.put("/api/data/domain/:key", async function (req, res) {
    global.res = res
    try {
      validate_req(req)

      let row: any = await domain_row_update(req.body)
      if (row && row.list_count) {
        http_response(res, 200, { message: `updated ${row.key}` })
      } else {
        http_response(res, 400, { error: true, message: `failed domain row.key="${req.body.key}"` })
      }
    } catch (err) {
      err.where = "api"
      http_response(res, 500, err)
    }
    /*
     * Log
     */
    if (process.env._system_name !== "OSX") {
      if (DEBUG1) global.ccconsole.info(`GET "/api/data/domain/${req.params.key}"`, { host: global["hostname"] })
      /*
       * Too many requests ?!?
       */
      requests_count++
      if (requests_count >= requests_limit) {
        requests_total += requests_count
        requests_count = 0
        throw new Error(`GET data.domains requests_total=${requests_total}`)
      }
    }
  })
}
