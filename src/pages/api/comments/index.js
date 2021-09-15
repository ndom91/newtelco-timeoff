const db = require("../../../lib/db")

module.exports = async (req, res) => {
  const team = req.query.team
  const count = req.query.count
  const comments = await db.query(`
    SELECT id, user, page, datetime, active, FROM_BASE64(body) as body FROM discussion WHERE page LIKE '${team}' AND active LIKE 1 ORDER BY datetime DESC LIMIT ${count}
  `)
  const resp = []
  comments.forEach(async (comment) => {
    const user = comment.user
    db.query(`SELECT * FROM users WHERE id LIKE ${user}`).then((data) => {
      const obj = comment
      obj.userDetails = data[0]
      resp.push(obj)
    })
    if (resp.length === comments.length) {
      res.status(200).json({ resp })
    }
  })
}
