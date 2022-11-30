import axios from "axios"

const fy = []
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
 * API
 */
let DEBUG1 = true
export default function (expressApp, http_response) {
  for (let f of fy) {
    expressApp.get(f.api, function (req, res) {
      global.res = res
      if (DEBUG1) global.cconsole.info("API ", f.api)
      try {
        axios
          .post(f.url, f.reqData(req), { timeout: 22000 })
          .then((data) => {
            http_response(res, 200, (data && data.data) || {})
          })
          .catch((err) => {
            http_response(res, 500, err.stack ? err.stack.split("\n") : err.message)
          })
      } catch (err) {
        http_response(res, 500, err.stack ? err.stack.split("\n") : err.message)
      }
    })
  }
}
