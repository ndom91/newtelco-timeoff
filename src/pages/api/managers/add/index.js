const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const name = req.query.name
  const team = req.query.team
  const email = req.query.email
  const managerAdd = await db.query(escape`
      INSERT INTO managers (name, email, team) VALUES (${name}, ${email}, ${team})
  `)
  res.status(200).json({ managerAdd })
}
