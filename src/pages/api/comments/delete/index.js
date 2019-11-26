const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const id = req.query.id
  const discussionDelete = await db.query(escape`
    UPDATE discussion SET active = 0 WHERE id LIKE ${id}
  `)
  res.status(200).json({ discussionDelete })
}
