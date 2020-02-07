const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const query = await db.query(escape`
    SELECT oncall.id, oncall.fromDate, oncall.toDate, oncall.type as oncallType, users.email, users.fname, users.lname, oncall.title
    FROM oncall
    LEFT JOIN users
    ON oncall.user = users.id
  `)
  res.status(200).json({ query })
}
