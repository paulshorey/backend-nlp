import thesaurus from "./thesaurus"
import tokenization from "./tokenization"
import auth_captcha from "../auth_captcha"

let DEBUG_ENDPOINTS = true

export default function (expressApp, http_response) {
  thesaurus({ expressApp, http_response, req_authenticate, req_error })
  tokenization({ expressApp, http_response, req_authenticate, req_error })
}

/*
 *
 * LIBRARY
 *
 */
/*
 * VALIDATE REQUEST
 */
async function req_authenticate({ req, res, req_method, req_endpoint, query }) {
  /*
   * log
   */
  if (DEBUG_ENDPOINTS) global.ccconsole.info(`${req_method} ${req_endpoint} ${JSON.stringify(query)}`)
  /*
   * authenticate (free for all, but must pass captcha)
   */
  if (req.headers["experimental"]) {
    await auth_captcha(req)
  } else {
    // coming soon - validate RapidAPI referrer and include Captcha if configured for site_id
  }
}
/*
 * HANDLE ERROR
 */
function req_error({ err, req, res, req_method, req_endpoint }) {
  err.req_request = `${req_method} ${req_endpoint}`
  err.user_id = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress
  global.http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
}
