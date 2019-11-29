const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const id = req.query.id
  const dateJoined = decodeURIComponent(req.query.dateJoined) || ''
  const daysRemaining = decodeURIComponent(req.query.daysRemaining) || 0

  const userUpdate = await db.query(escape`
      UPDATE users SET dateJoined = ${dateJoined}, daysAvailable = ${daysRemaining} WHERE id LIKE ${id}
  `)
  res.status(200).json({ userUpdate })
}
