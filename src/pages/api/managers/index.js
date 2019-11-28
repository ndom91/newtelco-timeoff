const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const managerEntries = await db.query(escape`
      SELECT managers.id, managers.name, managers.email, teams.name as team FROM managers
      LEFT JOIN teams on managers.team = teams.id
  `)
  res.status(200).json({ managerEntries })
}
