const db = require("../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (_, res) => {
  const query = await db.query(escape`
      SELECT MONTHNAME(fromDate) MONTH, YEAR(fromDate) YEAR, COUNT(*) COUNT FROM vacations WHERE fromDate > CURRENT_DATE() - INTERVAL 7 MONTH AND fromdate < CURRENT_DATE GROUP BY MONTH(fromDate), YEAR(fromDate) ORDER BY  YEAR(fromDate), MONTH(fromDate) WHERE type = 'vacation' AND disabled = 0 AND approved = 2
  `)
  res.status(200).json({ query })
}
