const db = require("../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const hash = req.query.hash
  // const action = req.query.a
  const checkApprovalQuery = await db.query(escape`
    SELECT id, approved FROM vacations WHERE approval_hash LIKE ${hash}
  `)
  if (checkApprovalQuery[0].approved === 0) {
    res.status(200).json({ code: 200, status: 0 })
  } else {
    res.status(200).json({ code: 200, status: 1 })
  }
}
