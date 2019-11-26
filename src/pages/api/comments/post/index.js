const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const body = decodeURIComponent(req.query.body)
  const email = decodeURIComponent(req.query.user)
  const page = req.query.team
  const userInfo = await db.query(escape`
    SELECT id FROM users WHERE email LIKE ${email}
  `)
  const userId = userInfo[0].id
  const discussionInsert = await db.query(escape`
    INSERT INTO discussion (user, body, page) VALUES (${userId}, ${body}, ${page})
  `)
  res.status(200).json({ discussionInsert })
}
