/*
 * IMPORTS
 */
import str_row from "@ps/nlp/api/data.words/promise/str_row"
import { data_word_get_parsed } from "@ps/nlp/api/data.words/pgdb"
import aggregate_req_body_query from "@ps/fn/io/req/aggregate_req_body_query_params"

/*
 * API
 */
let DEBUG1 = false
export default function ({ expressApp, http_response, req_authenticate, req_error }) {
  {
    let req_method = "get"
    let req_endpoint = "/v1/word/:str?"
    expressApp[req_method](req_endpoint, async function (req, res) {
      try {
        let time_start = Date.now()
        let query = aggregate_req_body_query(req)
        await req_authenticate({ req, req_method, req_endpoint, query })

        const row = await str_row(query.str)
        //           "key, str, root, proper, singular, plural, abbreviation, acronym, ctr, pos1, pos2, pos3, pos4, pos5, sentiment, name, brand, food, stop, aux, prefix, list_count, word_count, char_count, syl_count, xnou, xadj, xver, xadv, xint, xdet, xpro, xpre, xcon, xetc, dict, pos_short, poss"
        if (!row) throw new Error(`!row key="${query.str}"`)
        fix_row(row)

        http_response(res, 200, row, { time: Date.now() - time_start })
      } catch (err) {
        req_error({ err, req, res, req_method, req_endpoint })
      }
    })
  }
  {
    let req_method = "get"
    let req_endpoint = "/v1/synonyms/:str?"
    expressApp[req_method](req_endpoint, async function (req, res) {
      try {
        let time_start = Date.now()
        let query = aggregate_req_body_query(req)
        await req_authenticate({ req, req_method, req_endpoint, query })

        const row = await data_word_get_parsed(query.str, "key, str, pos1, pos2, pos3, dict")
        if (!row) throw new Error(`!row key="${query.str}"`)
        fix_row(row)

        http_response(res, 200, row, { time: Date.now() - time_start })
      } catch (err) {
        req_error({ err, req, res, req_method, req_endpoint })
      }
    })
  }
  {
    let req_method = "get"
    let req_endpoint = "/v1/word-info/:str?"
    expressApp[req_method](req_endpoint, async function (req, res) {
      try {
        let time_start = Date.now()
        let query = aggregate_req_body_query(req)
        await req_authenticate({ req, req_method, req_endpoint, query })

        const row = await data_word_get_parsed(
          query.str,
          "key, str, root, proper, singular, plural, abbreviation, acronym, ctr, pos1, pos2, pos3, pos4, pos5, sentiment, name, brand, food, stop, aux, prefix, list_count, word_count, char_count, syl_count"
        )
        if (!row) throw new Error(`!row key="${query.str}"`)
        fix_row(row)

        http_response(res, 200, row, { time: Date.now() - time_start })
      } catch (err) {
        req_error({ err, req, res, req_method, req_endpoint })
      }
    })
  }
}

function fix_row(row) {
  if ("sentiment" in row) {
    row.sentiment = Math.min(row.sentiment + 1, 1) // -1,0,1 -> 0,1
  }

  if (row.dict) {
    row.synonyms = []
    let pos_nums: any = {}
    let pos_maxs: any = {}
    if (row.pos1) pos_maxs[row.pos1] = row["x" + row.pos1] || 30
    if (row.pos2) pos_maxs[row.pos2] = row["x" + row.pos2] || 30
    if (row.pos3) pos_maxs[row.pos3] = row["x" + row.pos3] || 30
    if (row.pos4) pos_maxs[row.pos4] = row["x" + row.pos4] || 30
    if (row.pos5) pos_maxs[row.pos5] = row["x" + row.pos5] || 30
    for (let key in row.dict) {
      // each synonym
      let info = row.dict[key]
      if (!info[12]) continue // must be synonym, not derivation
      let str = typeof info[3] === "string" && info[3] ? info[3] : key
      let pos = info[9]
      // add ?
      if (!pos_maxs[pos]) continue
      if (pos_nums[pos] && pos_nums[pos] >= pos_maxs[pos]) continue
      // add
      row.synonyms.push([str, info[0], info[1], info[2], pos])
      if (!pos_nums[pos]) pos_nums[pos] = 0
      pos_nums[pos]++
    }
  }

  if (!DEBUG1) {
    delete row.dict
    delete row.poss
    delete row.xnou
    delete row.xadj
    delete row.xver
    delete row.xadv
    delete row.xint
    delete row.xdet
    delete row.xpro
    delete row.xpre
    delete row.xcon
    delete row.xetc
    if (!row.prefix) {
      delete row.prefix
    }
    if (!row.ctr) {
      delete row.ctr
    }
  }

  return row
}
