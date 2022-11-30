/*
 * IMPORTS
find ./common -depth -name "*.js" -exec sh -c 'mv "$1" "${1%.js}.ts"' _ {} \;
 */
import {
  data_word_delete,
  data_word_put,
  data_word_get_parsed,
  data_word_sentiment_of_synonym,
  data_word_proper_of_synonym,
  data_word_add_poswords,
  data_word_remove_words,
  data_word_add_to_others
} from "./pgdb"

import str_row from "./promise/str_row"
import key_syns from "./promise/key_tlds"
import auth_captcha from "../auth_captcha"

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
let DEBUG_ENDPOINTS = true
let DEBUG1 = false
export default function (expressApp, http_response) {
  // GET
  expressApp.get("/api/data/domain_extensions/:key", async function (req, res) {
    global.res = res
    try {
      validate_req(req)

      const results = await key_syns(req.params.key)
      http_response(res, 200, results)
    } catch (err) {
      http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
    }
  })

  // GET
  expressApp.get("/api/data/word/:key", async function (req, res) {
    global.res = res
    try {
      validate_req(req)

      const results = await data_word_get_parsed(req.params.key)
      http_response(res, 200, results)
    } catch (err) {
      http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
    }
    /*
     * Log
     */
    if (process.env._system_name !== "OSX") {
      if (DEBUG1) global.ccconsole.info(`GET "/api/data/word/${req.params.key}"`, { host: global["hostname"] })
      /*
       * Too many requests ?!?
       */
      requests_count++
      if (requests_count >= requests_limit) {
        requests_total += requests_count
        requests_count = 0
        throw new Error(`GET data.words requests_total=${requests_total}`)
      }
    }
  })
  // DELETE
  expressApp.delete("/api/data/word/:key", async function (req, res) {
    global.res = res
    try {
      validate_req(req)

      const results = await data_word_delete(req.params.key)
      http_response(res, 200, results)
    } catch (err) {
      http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
    }
    /*
     * Log
     */
    if (process.env._system_name !== "OSX") {
      if (DEBUG1) global.ccconsole.info(`DELETE "/api/data/word/${req.params.key}"`, { host: global["hostname"] })
      /*
       * Too many requests ?!?
       */
      requests_count++
      if (requests_count >= requests_limit) {
        requests_total += requests_count
        requests_count = 0
        throw new Error(`DELETE data.words requests_total=${requests_total}`)
      }
    }
  })
  // PUT (ADD OR EDIT)
  expressApp.put("/api/data/word/:key", async function (req, res) {
    global.res = res
    try {
      validate_req(req)

      const results = await data_word_put(req.body, true)
      if (results) {
        http_response(res, 200, results)
      } else {
        http_response(res, 400, { error: `failed word row.key="${req.body.key}"` })
      }
    } catch (err) {
      http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
    }
    /*
     * Log
     */
    if (process.env._system_name !== "OSX") {
      if (DEBUG1) global.ccconsole.info(`GET "/api/data/word/${req.params.key}"`, { host: global["hostname"] })
      /*
       * Too many requests ?!?
       */
      requests_count++
      if (requests_count >= requests_limit) {
        requests_total += requests_count
        requests_count = 0
        throw new Error(`GET data.words requests_total=${requests_total}`)
      }
    }
  })
  // PUT (SENTIMENT OF SYNONYM OF WORD)
  expressApp.put("/api/data/word_sentiment_of_synonym", async function (req, res) {
    global.res = res
    try {
      validate_req(req)

      const results = await data_word_sentiment_of_synonym(req.body.key, req.body.synonym, req.body.sentiment)
      if (results) {
        http_response(res, 200, results)
      } else {
        http_response(res, 400, { error: `failed word row.key="${req.body.key}"` })
      }
    } catch (err) {
      http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
    }
    /*
     * Log
     */
    if (process.env._system_name !== "OSX") {
      if (DEBUG1) global.ccconsole.info(`GET "/api/data/word_sentiment_of_synonym`, { host: global["hostname"] })
      /*
       * Too many requests ?!?
       */
      requests_count++
      if (requests_count >= requests_limit) {
        requests_total += requests_count
        requests_count = 0
        throw new Error(`GET data.words requests_total=${requests_total}`)
      }
    }
  })
  // PUT (SENTIMENT OF SYNONYM OF WORD)
  expressApp.put("/api/data/word_proper_of_synonym/:key/:synonym", async function (req, res) {
    global.res = res
    try {
      validate_req(req)

      const results = await data_word_proper_of_synonym(req.params.key, req.params.synonym, req.body.proper)
      if (results) {
        http_response(res, 200, results)
      } else {
        http_response(res, 400, { error: `failed word row.key="${req.params.key}"` })
      }
    } catch (err) {
      http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
    }
    /*
     * Log
     */
    if (process.env._system_name !== "OSX") {
      if (DEBUG1) global.ccconsole.info(`GET "/api/data/word/${req.params.key}"`, { host: global["hostname"] })
      /*
       * Too many requests ?!?
       */
      requests_count++
      if (requests_count >= requests_limit) {
        requests_total += requests_count
        requests_count = 0
        throw new Error(`GET data.words requests_total=${requests_total}`)
      }
    }
  })
  // PUT (add poswords)
  expressApp.put("/api/data/word_add_poswords", async function (req, res) {
    global.res = res
    try {
      validate_req(req)

      const results = await data_word_add_poswords({
        key: req.body.key,
        pos: req.body.pos,
        poswords: req.body.poswords
      })
      if (results) {
        http_response(res, 200, results)
      } else {
        http_response(res, 400, { error: `failed word row.key="${req.body.key}"` })
      }
    } catch (err) {
      http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
    }
    /*
     * Log
     */
    if (process.env._system_name !== "OSX") {
      if (DEBUG1) global.ccconsole.info(`GET "/api/data/word/${req.params.key}"`, { host: global["hostname"] })
      /*
       * Too many requests ?!?
       */
      requests_count++
      if (requests_count >= requests_limit) {
        requests_total += requests_count
        requests_count = 0
        throw new Error(`GET data.words requests_total=${requests_total}`)
      }
    }
  })
  // PUT (remove words)
  expressApp.put("/api/data/word_remove_words", async function (req, res) {
    global.res = res
    try {
      validate_req(req)

      const results = await data_word_remove_words({ key: req.body.key, words: req.body.words })
      if (results) {
        http_response(res, 200, results)
      } else {
        http_response(res, 400, { error: `failed word row.key="${req.body.key}"` })
      }
    } catch (err) {
      http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
    }
    /*
     * Log
     */
    if (process.env._system_name !== "OSX") {
      if (DEBUG1) global.ccconsole.info(`GET "/api/data/word/${req.params.key}"`, { host: global["hostname"] })
      /*
       * Too many requests ?!?
       */
      requests_count++
      if (requests_count >= requests_limit) {
        requests_total += requests_count
        requests_count = 0
        throw new Error(`GET data.words requests_total=${requests_total}`)
      }
    }
  })
  // PUT (word to multiple other key/pos)
  expressApp.put("/api/data/word_add_to_others", async function (req, res) {
    global.res = res
    try {
      validate_req(req)

      const results = await data_word_add_to_others({
        word: req.body.word,
        pos: req.body.pos,
        addtoothers: req.body.addtoothers
      })
      if (results) {
        http_response(res, 200, results)
      } else {
        http_response(res, 400, { error: `failed word row.key="${req.body.key}"` })
      }
    } catch (err) {
      http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
    }
    /*
     * Log
     */
    if (process.env._system_name !== "OSX") {
      if (DEBUG1) global.ccconsole.info(`GET "/api/data/word/${req.params.key}"`, { host: global["hostname"] })
      /*
       * Too many requests ?!?
       */
      requests_count++
      if (requests_count >= requests_limit) {
        requests_total += requests_count
        requests_count = 0
        throw new Error(`GET data.words requests_total=${requests_total}`)
      }
    }
  })
}
