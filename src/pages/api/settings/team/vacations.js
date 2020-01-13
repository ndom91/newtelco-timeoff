const db = require('../../../../lib/db')

module.exports = async (req, res) => {
  const members = JSON.parse(decodeURIComponent(req.query.members))
  const teamVacations = await db.query(`
    SELECT * FROM vacations WHERE email IN ('${members.join('\',\'')}') AND disabled LIKE 0
  `)
  res.status(200).json({ teamVacations })
}
