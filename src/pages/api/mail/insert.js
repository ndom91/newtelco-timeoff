const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const vaca = JSON.parse(decodeURIComponent(req.query.vaca))
  const name = vaca.name
  const email = vaca.email
  const lastYear = vaca.lastYear
  const thisYear = vaca.thisYear
  const total = vaca.total
  const requested = vaca.requested
  const remaining = vaca.remaining
  const type = vaca.type
  const dateFromISO = new Date(vaca.dateFrom)
  const dateFrom = new Date(dateFromISO.getTime() - (dateFromISO.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  const dateToISO = new Date(vaca.dateTo)
  const dateTo = new Date(dateToISO.getTime() - (dateToISO.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  const manager = vaca.manager
  const submittedBy = email.substring(0, email.lastIndexOf('@'))
  const note = vaca.notes
  const approvalHash = req.query.ah

  const insertAbsence = await db.query(escape`
      INSERT INTO vacations (name, email, resturlaubVorjahr, jahresurlaubInsgesamt, restjahresurlaubInsgesamt, beantragt, resturlaubJAHR, type, fromDate, toDate, manager, note, submitted_datetime, submitted_by, approval_hash) VALUES (${name}, ${email}, ${lastYear}, ${thisYear}, ${total}, ${requested}, ${remaining}, ${type}, ${dateFrom}, ${dateTo}, ${manager}, ${note}, ${new Date().toISOString().slice(0, 19).replace('T', ' ')}, ${submittedBy}, ${approvalHash} ) 
  `)
  if (insertAbsence.affectedRows === 1) {
    res.status(200).json({ code: 200, id: insertAbsence.insertId })
  } else {
    res.status(500).json({ code: 500, err: insertAbsence })
  }
}
