const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const year = req.query.y
  const query = await db.query(escape`
      SELECT * FROM vacations WHERE YEAR(fromDate) = ${year} OR YEAR(toDate) = ${year} AND disabled = 0 AND approved = 2 AND type = 'vacation';
  `)
  res.status(200).json({ query })
}
