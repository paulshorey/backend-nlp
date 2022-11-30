/*
 * IMPORTS
 */
import { dictionary_definition } from './promises/oxford.js'

/*
 * API
 */
export default function (expressApp, http_response) {

  /*******************************************************************************************
   * 3RD PARTY
   */
  // /api/oxford/definition/:key
  expressApp.get('/api/oxford/definition/:key', async function (req, res) { global.res = res
    try {
      const results = await dictionary_definition(req.params.key)
      http_response(res, 200, results)
    } catch (err) {
      http_response(res, 500, err.stack ? err.stack.split("\n") : err.message)
    }
  })

}
