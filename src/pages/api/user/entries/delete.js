const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const id = req.query.id
  const deleteQuery = await db.query(escape`
    UPDATE vacations SET disabled = 1 WHERE id LIKE ${id}
  `)
  res.status(200).json({ deleteQuery })
}
