/*
 * Dependencies
 */
import import_pg from "pg"
import json_parse from "@ps/fn/io/json/json_parse"
import { makeSQLString } from "../lib/pgdb"
import str_hash from "@ps/fn/io/str/str_hash"
const { Pool } = import_pg
const pool = new Pool()

/*
 * Debugging
 */
const DEBUG1 = false // allow short messages: api name and parameters
const DEBUG2 = false // allow lengthy messages: queryString
if (DEBUG2 || DEBUG1) {
  process.on("uncaughtException", (err) => {
    global.execute("pm2 stop all")
  })
}

/**************************************************************************************************
 * LEGACY FUNCTIONS
 **************************************************************************************************/

export const crawl_stopwords_get = function (key) {
  return new Promise(async (resolve) => {
    let queryString = `SELECT key, occurrences FROM crawl.stopwords WHERE key=e'${key.replace(/[']+/g, "''")}'`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows[0])
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        if (DEBUG2 || DEBUG1) global.ccconsole.error(err)
        resolve(null)
      })
  })
}

export const crawl_word_get = function (key, columns, limit = 1000) {
  let selectWhat = "key"
  if (typeof columns === "string") {
    selectWhat = columns
  }
  if (columns && Array.isArray(columns)) {
    selectWhat = columns.toString()
  }
  return new Promise(async (resolve) => {
    key = key.toLowerCase()
    let queryString = `SELECT ${selectWhat} FROM crawl.words WHERE key=e'${key.replace(/[']+/g, "''")}' LIMIT ${limit}`
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows[0])
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        if (DEBUG2 || DEBUG1) global.ccconsole.error(err)
        resolve(null)
      })
  })
}

/**************************************************************************************************
 * FUNCTIONS
 **************************************************************************************************/

export const data_interactions_delete = function (key) {
  return new Promise(async (resolve) => {
    let queryString = `DELETE FROM users.interactions WHERE key=e'${key.replace(/[']+/g, "''")}'`
    pool
      .query(queryString)
      .then(() => {
        if (DEBUG1) global.cconsole.warn("deleted ", key)
        resolve(true)
      })
      .catch((err) => {
        if (DEBUG1) global.cconsole.error(`could not delete "${key}"`, err)
        resolve(null)
      })
  })
}

export const data_interactions_get_all = function () {
  return new Promise(async (resolve) => {
    let queryString = `SELECT * FROM users.interactions ORDER BY date DESC`
    if (DEBUG2) global.cconsole.log("get queryString:", queryString)
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows)
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        DEBUG2 || DEBUG1 ? global.ccconsole.error(err) : null
        resolve(null)
      })
  })
}

export const data_interactions_get_all_parsed = function () {
  return new Promise(async (resolve) => {
    let rows: any = await data_interactions_get_all()
    if (DEBUG1) global.cconsole.log("rows distinct?", rows)
    if (!rows || !rows.length) {
      resolve([])
    }
    for (let ri in rows) {
      for (let prop in rows[ri]) {
        rows[ri][prop] = json_parse(rows[ri][prop])
      }
    }
    resolve(rows)
  })
}

export const data_interactions_get_all_distinct = function () {
  return new Promise(async (resolve) => {
    let queryString = `
    WITH myrows AS ( 
      SELECT *, ROW_NUMBER() OVER(PARTITION BY email ORDER BY text_len DESC) AS rn FROM users.interactions 
    ) SELECT s.* FROM myrows s WHERE s.rn = 1 ORDER BY date DESC LIMIT 1000
    `
    if (DEBUG2) global.cconsole.log("get queryString:", queryString)
    pool
      .query(queryString)
      .then((res) => {
        if (res.rows.length) {
          resolve(res.rows)
        } else {
          resolve(null)
        }
      })
      .catch((err) => {
        DEBUG2 || DEBUG1 ? global.ccconsole.error(err) : null
        resolve(null)
      })
  })
}

export const data_interactions_get_all_distinct_parsed = function () {
  return new Promise(async (resolve) => {
    let rows: any = await data_interactions_get_all_distinct()
    if (DEBUG1) global.cconsole.log("rows distinct?", rows)
    if (!rows || !rows.length) {
      resolve([])
    }
    for (let ri in rows) {
      for (let prop in rows[ri]) {
        rows[ri][prop] = json_parse(rows[ri][prop])
      }
    }
    resolve(rows)
  })
}

/**
 * Save user-submitted object to DB, and do some minor fixes
 * @param row {object} - DB row, with email (required) and any other properties to overwrite
 * @resolves {boolean|string} - false (on success) or error message
 */
export const data_interactions_put = function (row) {
  if (DEBUG2) global.cconsole.log("data_interactions_put", JSON.stringify(row).substr(0, 100))
  if (DEBUG1) global.cconsole.log("data_interactions_put", row.email)
  return new Promise(async (resolve) => {
    // required inputs
    if (!row.email) {
      resolve("!row.email")
      return
    }

    // automatically add fields
    row.key = str_hash(row.email + row.text) + ""
    row.date = new Date()
    row.text_len = (row.name + row.text).length
    row.email = row.email.toLowerCase()

    // update
    try {
      let queryString = makeSQLString(row.key, row, "users.interactions")
      if (DEBUG2) global.cconsole.log(queryString)
      pool
        .query(queryString)
        .then(() => {
          resolve(false)
        })
        .catch((e) => {
          global.cconsole.warn("pg pool failed", e.message || e)
          resolve(e.message || e)
        })
    } catch (e) {
      DEBUG2 || DEBUG1 ? global.ccconsole.error(e) : null
      resolve(e.message || e)
    }
  })
}
