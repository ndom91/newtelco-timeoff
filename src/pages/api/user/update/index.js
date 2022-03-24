const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const body = JSON.parse(req.body)
  const users = body.users
  const userCount = users.length
  let userSuccessCount = 0
  let attemptCount = 0
  let lastError = ""
  const updateResults = await Promise.all(
    users.map((user) => {
      return db.query(escape`
      UPDATE users SET fname = ${user.fname}, lname = ${user.lname}, team = ${user.team} where email = ${user.email}
    `)
    })
  )

  if (updateResults.length !== userCount) {
    res
      .status(500)
      .json({ status: 500, text: `Error updating ${userCount} users` })
  }

  updateResults.map((res) => {
    if (res.warningCount !== 0) {
      res
        .status(500)
        .json({ status: 500, text: `Error updating ${userCount} users` })
    }
  })

  res
    .status(200)
    .json({ status: 200, text: `Successfully updated ${userCount} users` })
}
