const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const body = JSON.parse(req.body)
  const users = body.users
  const userCount = users.length
  let userSuccessCount = 0
  let attemptCount = 0
  let lastError = ''
  users.forEach(async user => {
    const updateQuery = await db.query(escape`
        UPDATE users SET fname ${user.fname}, lname = ${user.lname}, team = ${user.team}
      `)
    if (updateQuery.affectedRows === 1) {
      attemptCount++
      userSuccessCount++
    } else {
      attemptCount++
      lastError = updateQuery
    }
    if (attemptCount === userCount) {
      if (userSuccessCount === userCount) {
        res.status(200).json({ status: 200, text: `Successfully updated ${userCount} users` })
      } else {
        res.status(200).json({ status: 500, text: `Error updating ${userCount - userSuccessCount} users`, error: lastError })
      }
    }
  })
}
