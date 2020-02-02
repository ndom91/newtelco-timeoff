const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const id = req.query.id
  const getFiles = await db.query(escape`
    SELECT files FROM vacations WHERE id LIKE ${id}
  `)
  if (getFiles) {
    res.status(200).json({ code: 200, files: getFiles })
  } else {
    res.status(500).json({ code: 500, err: getFiles })
  }
}
