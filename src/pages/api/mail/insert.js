const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const vaca = JSON.parse(decodeURIComponent(req.query.vaca))
  console.log(vaca)
  const name = this.vaca.name
  const email = this.vaca.email
  const lastYear = this.vaca.lastYear
  const thisYear = this.vaca.thisYear
  const total = this.vaca.total
  const requested = this.vaca.requested
  const remaining = this.vaca.remaining
  const type = this.vaca.type
  const dateFrom = this.vaca.dateFrom
  const dateTo = this.vaca.dateTo
  const manager = this.vaca.manager

  const note = ''
  const approvalHash = ''

  // submittedBy is just username, not email

  const insertAbsence = await db.query(escape`
      INSERT INTO vacations (name, email, resturlaubVorjahr, jahresurlaubInsgesamt, restjahresurlaubInsgesamt, beantragt, resturlaubJAHR, type, fromDate, toDate, manager, note, submitted_datetime, submitted_by, approval_hash) VALUES (${name}, ${email}, ${lastYear}, ${thisYear}, ${total}, ${requested}, ${remaining}, ${type}, ${dateFrom}, ${dateTo}, ${manager}, ${note}, ${new Date().toISOString()}, ${email}, ${approvalHash} ) 
  `)
  console.log(insertAbsence)
  res.status(200).json({ msg: 'Success!', req: vaca })
}
