import axios from "axios"
import { http_response } from "@ps/nlp/src/lib/http"

/*
 * THIS IS DIFFERENT FROM OTHER API ENDPOINTS IN THIS PROJECT
 * This is simply a proxy server to api.apify.com
 * Puppeteer/script is hosted there
 */
const fy: any = []
fy.push({
  api: "/v1/crawl/test",
  url: "https://api.apify.com/v2/acts/techy.tools~example-html/run-sync?token=Byc43cN3uZv2Xyxo9q6GPSvjD",
  reqData: () => ({})
})
fy.push({
  api: "/v1/crawl/sedo",
  url: "https://api.apify.com/v2/acts/techy.tools~sedo-results/run-sync?token=Byc43cN3uZv2Xyxo9q6GPSvjD",
  reqData: (req) => ({ str: req.query.str })
})
fy.push({
  api: "/v1/crawl/afternic",
  url: "https://api.apify.com/v2/acts/techy.tools~afternic-results/run-sync?token=Byc43cN3uZv2Xyxo9q6GPSvjD",
  reqData: (req) => ({ str: req.query.str })
})

/*
 * Generate a list of endpoints - same format as all the other manually added ones
 */
export default fy.map((f) => ({
  path: f.api,
  method: "get",
  response: async function ({ req, res }) {
    axios
      .post(f.url, f.reqData(req), { timeout: 22000 })
      .then((data) => {
        http_response(res, 200, (data && data.data) || {})
      })
      .catch((err) => {
        http_response(res, 500, err.stack ? err.stack.split("\n") : err.message)
      })
  }
}))
