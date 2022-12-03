import parse_error_message from "@ps/fn/io/err/parse_error_message"
import authIndex from "@ps/nlp/src/lib/auth"

const DEBUG1 = false

export const endpointHandler = function ({ expressApp, method, path, response, auth }) {
  expressApp[method](path, async function (req, res) {
    global.res = res
    if (global.DEBUG_PATHS || DEBUG1) global.cconsole.info(`${method.toUpperCase()} /${path}`, req.query, req.body)
    try {
      // authenticate
      let authError = await authIndex({ req, auth })
      if (authError) {
        const err = `Authentication error: ${authError}`
        errorHandler({ err, req, res, method, path })
      }
      // fetch data
      const data = await response({ req, res })
      // return response
      http_response(res, 200, data)
    } catch (err) {
      errorHandler({ err, req, res, method, path })
    }
  })
}

export const errorHandler = function ({ err, req, res, method, path }) {
  err.request = `${method} ${path}`
  err.user_id = req.headers["x-real-ip"] || req.headers["x-forwarded-for"] || req.ip || req.connection.remoteAddress
  http_response(res, 500, err.stack ? err.stack.split("\n") : err.message || err)
}

export const http_response = function (response, status_code: number, data: any, extras?: any) {
  // always respond with JSON
  response.setHeader("Content-Type", "application/json")
  response.writeHead(Number(status_code) || 200)
  let output
  if (status_code >= 200 && status_code < 300) {
    // success
    output = {
      host: global["hostname"],
      status: "success",
      code: 200,
      ...extras,
      data: data
    }
  } else {
    // system "error" or user inputs "fail"ed
    output = {
      host: global["hostname"],
      status:
        status_code >= 500 || ((!status_code || status_code < 500) && typeof data === "object") ? "error" : "fail",
      code: data.code || status_code || 400,
      error: {
        code: status_code,
        message: parse_error_message(data)
      }
    }
    // error
    if (output.status === "error") {
      console.error(data)
    }
  }
  response.write(JSON.stringify(output, null, "\t"))
  response.end()
}
