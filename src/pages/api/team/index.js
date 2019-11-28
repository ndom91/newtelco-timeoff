const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const teamInfos = await db.query(escape`
    SELECT * FROM teams
  `)
  res.status(200).json({ teamInfos })
}
