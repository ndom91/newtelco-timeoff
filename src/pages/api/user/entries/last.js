const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const email = req.query.u
  const lastRequest = await db.query(escape`
    SELECT * FROM vacations WHERE email LIKE ${email} AND disabled LIKE 0 ORDER BY id DESC LIMIT 1
  `)
  res.status(200).json({ lastRequest })
}
