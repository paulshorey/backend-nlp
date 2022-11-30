/*
 * IMPORTS
 */
import { data_interactions_get_all_parsed, data_interactions_put } from "@ps/nlp/api/users.interactions/pgdb"

/*
 * API
 */
let DEBUG1 = false
let DEBUG2 = false
export default function (expressApp, http_response) {
  /*
   * GET interactions
   */
  expressApp.get("/v1/interactions", async function (req, res) {
    global.res = res
    if (DEBUG1) global.cconsole.info("GET /interactions")
    // http_response(res, 500, "idk")
    try {
      /*
       * get data
       */
      let rows: any = await data_interactions_get_all_parsed()
      if (!rows) {
        let err = "Could not get interactions."
        http_response(res, 500, err)
        return
      }

      /*
       * return data
       */
      http_response(res, 200, rows)
    } catch (err) {
      global.ccconsole.error("GET /v1/interactions", err)
      http_response(res, 1500, err.stack.split("\n"))
    }
  })

  /*
   * PUT interactions
   */
  expressApp.put("/v1/interactions", async function (req, res) {
    global.res = res
    if (DEBUG1 && !DEBUG2) global.cconsole.info("PUT /interactions")
    if (DEBUG2) global.cconsole.log("PUT /interactions body", req.body)
    // http_response(res, 500, "idk")
    try {
      if (!req.body.contact) {
        let err = "!req.body.contact" // no data
        http_response(res, 500, err)
        return
      }
      if (!req.body.captcha_response) {
        let err = "!req.body.captcha_response" // no captcha
        http_response(res, 500, err)
        return
      }
      if (!req.body.contact.email) {
        let err = "!req.body.contact.email" // required field
        http_response(res, 500, err)
        return
      }
      if (!req.body.contact.email.match(/^\S+@\S+\.\S+$/)) {
        let err = "Email address is not valid. Please check for spaces or typos." // required field
        http_response(res, 500, err)
        return
      }

      /*
       * add data
       */
      let row: any = {
        email: req.body.contact.email,
        name: req.body.contact.name || "",
        text: req.body.contact.text || "",
        date: new Date(),
        updates_products: !!req.body.contact.updates_products
      }
      let error: any = await data_interactions_put(row)
      if (error) {
        http_response(res, 500, error)
        return
      }

      /*
       * return data
       */
      http_response(res, 200, {
        message: `posted email "${row.email}", used captcha "${req.body.captcha_response}"`
      })
    } catch (err) {
      global.ccconsole.error("PUT /v1/interactions", err)
      http_response(res, 500, err.stack.split("\n"))
    }
  })
}
