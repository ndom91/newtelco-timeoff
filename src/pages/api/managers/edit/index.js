const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const id = req.query.id
  const name = req.query.name
  const team = req.query.team
  const email = req.query.email
  const managerEdit = await db.query(escape`
      UPDATE managers SET name = ${name}, email = ${email}, team = ${team} WHERE id LIKE ${id}
  `)
  res.status(200).json({ managerEdit })
}
