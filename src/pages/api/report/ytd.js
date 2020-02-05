const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const year = req.query.y
  const query = await db.query(escape`
      SELECT id, name, email, resturlaubJAHR, submitted_datetime
      FROM vacations
      WHERE id IN (
          SELECT MAX(id)
          FROM vacations 
          WHERE YEAR(fromDate) = ${year} OR YEAR(toDate) = ${year} AND type = 'vacation' AND approved = '2' AND disabled = '0'
          GROUP BY email
      )
  `)
  res.status(200).json({ query })
}
