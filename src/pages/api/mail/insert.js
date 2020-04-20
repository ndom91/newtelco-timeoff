const db = require('../../../lib/db')
const escape = require('sql-template-strings')
const { format } = require('date-fns')

module.exports = async (req, res) => {
  const body = JSON.parse(req.body)
  const vaca = body.vaca
  const name = vaca.name
  const email = vaca.email
  const lastYear = vaca.lastYear
  const thisYear = vaca.thisYear
  const spentThisYear = vaca.spentThisYear
  const total = vaca.total
  const requested = vaca.requested
  const remaining = vaca.remaining
  const type = vaca.type
  // const dateFromISO = new Date(vaca.dateFrom)
  // const dateFrom = new Date(dateFromISO.getTime() - (dateFromISO.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  const dateFrom = format(new Date(vaca.dateFrom), 'yyyy-MM-dd')
  // const dateToISO = new Date(vaca.dateTo)
  // const dateTo = new Date(dateToISO.getTime() - (dateToISO.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
  const dateTo = format(new Date(vaca.dateTo), 'yyyy-MM-dd')
  const manager = vaca.manager
  const submittedBy = email.substring(0, email.lastIndexOf('@'))
  const note = vaca.notes
  const approvalHash = body.ah
  const files = JSON.stringify(body.files)

  console.log('insert.js')
  console.log(dateFrom)
  console.log(dateTo)

  let insertAbsence
  if (type === 'sick' || type === 'trip') {
    insertAbsence = await db.query(escape`
        INSERT INTO vacations (name, email, type, fromDate, toDate, manager, note, submitted_datetime, submitted_by, approval_hash, files) VALUES (${name}, ${email}, ${type}, ${dateFrom}, ${dateTo}, ${manager}, ${note}, ${new Date().toISOString().slice(0, 19).replace('T', ' ')}, ${submittedBy}, ${approvalHash}, ${files} ) 
    `)
  } else {
    insertAbsence = await db.query(escape`
        INSERT INTO vacations (name, email, resturlaubVorjahr, jahresurlaubInsgesamt, jahresUrlaubAusgegeben, restjahresurlaubInsgesamt, beantragt, resturlaubJAHR, type, fromDate, toDate, manager, note, submitted_datetime, submitted_by, approval_hash, files) VALUES (${name}, ${email}, ${lastYear}, ${thisYear}, ${spentThisYear}, ${total}, ${requested}, ${remaining}, ${type}, ${dateFrom}, ${dateTo}, ${manager}, ${note}, ${new Date().toISOString().slice(0, 19).replace('T', ' ')}, ${submittedBy}, ${approvalHash}, ${files} ) 
    `)
  }
  if (insertAbsence.affectedRows === 1) {
    res.status(200).json({ code: 200, id: insertAbsence.insertId })
  } else {
    res.status(500).json({ code: 500, err: insertAbsence })
  }
}

export const config = {
  api: {
    bodyParser: false
  }
}
