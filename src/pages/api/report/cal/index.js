const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (_, res) => {
  const companyVacations = await db.query(escape`
    SELECT id, toDate as 'endDate', fromDate as 'startDate', name as 'text' FROM vacations
    WHERE disabled = 0
    AND approved = 2
    AND DATE(toDate) > CURRENT_DATE() - INTERVAL 6 MONTH
  `)
  res.status(200).json({ companyVacations })
}
