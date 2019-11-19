const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const username = req.query.user
  const userEntries = await db.query(escape`
    SELECT * FROM vacations WHERE email LIKE ${username}
  `)
  res.status(200).json({ userEntries })
}
