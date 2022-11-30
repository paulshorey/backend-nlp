import parse_error_message from "@ps/fn/io/err/parse_error_message"

/*
 * Global API response - just pass original response variable
 */
export const http_response = function (response, status_code, data, extras?: any) {
  // always respond with JSON
  response.setHeader("Content-Type", "application/json")
  response.writeHead(status_code)
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
global.http_response = http_response
