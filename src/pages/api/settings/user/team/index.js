const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const email = decodeURIComponent(req.query.mail)
  const user = await db.query(escape`
    SELECT team FROM users WHERE email LIKE ${email}
  `)
  res.status(200).json({ user })
}
