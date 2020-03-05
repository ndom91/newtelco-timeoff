const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const username = req.query.u
  const userEntries = await db.query(escape`
    SELECT id, name, email, resturlaubVorjahr, jahresurlaubInsgesamt, jahresUrlaubAusgegeben, restjahresurlaubInsgesamt, beantragt, resturlaubJAHR, type, DATE_FORMAT(fromDate, \"%d.%m.%Y\") as fromDate, DATE_FORMAT(toDate, \"%d.%m.%Y\") as toDate, manager, note, files, submitted_datetime, submitted_by, approval_hash, approved, approval_datetime, disabled FROM vacations WHERE email LIKE ${username} AND disabled LIKE 0 AND type LIKE 'vacation' ORDER BY submitted_datetime DESC LIMIT 1
  `)
  res.status(200).json({ userEntries })
}
