const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const body = JSON.parse(req.body)
  const users = body.users
  const userCount = users.length
  let userSuccessCount = 0
  let attemptCount = 0
  let lastError = ""
  users.forEach(async (user) => {
    const insertQuery = await db.query(escape`
        INSERT INTO users (fname, lname, email, team) VALUES (${user.fname}, ${user.lname}, ${user.email}, ${user.team})
      `)
    if (insertQuery.affectedRows === 1) {
      attemptCount++
      userSuccessCount++
      // TODO: Possibly insert a dummy initial vacation table entry when new user is added
      // const insertInitialVacationQuery = await db.query(escape`
      //     INSERT INTO vacation (fname, lname, email, team) VALUES (${user.fname}, ${user.lname}, ${user.email}, ${user.team})
      //   `)
    } else {
      attemptCount++
      lastError = insertQuery
    }
    if (attemptCount === userCount) {
      if (userSuccessCount === userCount) {
        res
          .status(200)
          .json({ status: 200, text: `Successfully added ${userCount} users` })
      } else {
        res.status(200).json({
          status: 500,
          text: `Error adding ${userCount - userSuccessCount} users`,
          error: lastError,
        })
      }
    }
  })
}
