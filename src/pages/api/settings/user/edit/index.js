const db = require('../../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const id = req.query.id
  const dateJoined = decodeURIComponent(req.query.dateJoined)
  const daysRemaining = decodeURIComponent(req.query.daysRemaining)
  console.log(dateJoined, daysRemaining)
  let userUpdate
  if (dateJoined && !daysRemaining) {
    userUpdate = await db.query(escape`
        UPDATE users SET dateJoined = ${dateJoined} WHERE id LIKE ${id}
    `)
  } else if (daysRemaining && !dateJoined) {
    userUpdate = await db.query(escape`
        UPDATE users SET daysAvailable = ${daysRemaining} WHERE id LIKE ${id}
    `)
  } else if (daysRemaining && dateJoined) {
    userUpdate = await db.query(escape`
        UPDATE users SET dateJoined = ${dateJoined}, daysAvailable = ${daysRemaining} WHERE id LIKE ${id}
    `)
  }
  res.status(200).json({ userUpdate })
}
