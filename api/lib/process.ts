export const serverStartError = function (error) {
  if (error.syscall !== "listen") {
    throw error
  }
  const bind = typeof global.PORT === "string" ? "Pipe " + global.PORT : "Port " + global.PORT

  switch (error.code) {
    case "EACCES":
      global.ccconsole.error(bind + " requires elevated privileges")
      process.exit(1)
    case "EADDRINUSE":
      global.ccconsole.error(bind + " is already in use")
      process.exit(1)
    default:
      throw error
  }
}
