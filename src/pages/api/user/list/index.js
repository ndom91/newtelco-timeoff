const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const userList = await db.query(escape`
    SELECT * FROM users
  `)
  res.status(200).json({ userList })
}
