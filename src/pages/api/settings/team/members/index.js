const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const team = req.query.team
  const teamMembers = await db.query(escape`
    SELECT * FROM users WHERE team LIKE ${team}
  `)
  res.status(200).json({ teamMembers })
}
