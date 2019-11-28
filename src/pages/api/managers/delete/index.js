const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const id = req.query.id
  const managerDelete = await db.query(escape`
      DELETE FROM managers WHERE id LIKE ${id}
  `)
  res.status(200).json({ managerDelete })
}
