const db = require("../../../../lib/db")
const escape = require("sql-template-strings")
const moment = require("moment-timezone")

module.exports = async (req, res) => {
  const body = JSON.parse(req.body)
  const editData = body.editData
  const lastYear = editData.lastYear
  const thisYear = editData.thisYear
  const spentThisYear = editData.spent
  const total = editData.total
  const requested = editData.requested
  const remaining = editData.remaining
  const id = editData.id
  const from = moment.parseZone(editData.from).utc().format("YYYY-MM-DD")
  const to = moment.parseZone(editData.to).utc().format("YYYY-MM-DD")
  const notes = editData.note
  const files = JSON.stringify(body.files)

  const updateQuery = await db.query(escape`
      UPDATE vacations SET resturlaubVorjahr = ${lastYear}, jahresurlaubInsgesamt = ${thisYear}, jahresUrlaubAusgegeben = ${spentThisYear}, restjahresurlaubInsgesamt = ${total}, beantragt = ${requested}, resturlaubJAHR = ${remaining}, files = ${files}, fromDate = ${from}, toDate = ${to}, note = ${notes} WHERE id LIKE ${id}
  `)

  res.status(200).json({ updateQuery, body, from, to })
}
