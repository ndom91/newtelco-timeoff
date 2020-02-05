const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const dateParams = JSON.parse(req.query.m)
  const month = dateParams.month
  const year = dateParams.year
  const query = await db.query(escape`
      SELECT * FROM vacations WHERE (MONTH(toDate) = ${month} AND YEAR(toDate) = ${year}) OR (MONTH(fromDate) = ${month} AND YEAR(fromDate) = ${year}) AND disabled = 0 AND approved = 2 AND type = 'vacation';
  `)
  res.status(200).json({ query })
}
