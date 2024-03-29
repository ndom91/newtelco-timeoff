const escape = require("sql-template-strings")
const { formatISO, lastDayOfMonth, startOfMonth } = require("date-fns")
const db = require("../../../lib/db")

const handler = async (req, res) => {
  const { query, method, body } = req

  if (method === "GET" && query.uid?.length) {
    const { uid } = query
    const findOne = await db.query(escape`
      SELECT * FROM homeoffice
      WHERE
        email LIKE ${uid} AND
        disabled LIKE 0 AND
        approved NOT LIKE 1
  `)

    res.status(200).json(findOne)
  } else if (method === "GET" && query.month?.length) {
    const beginDate = startOfMonth(new Date(query.year, query.month - 1))
    const endDate = lastDayOfMonth(new Date(query.year, query.month - 1))
    const monthHomeoffices = await db.query(escape`
      SELECT * FROM homeoffice
      WHERE
        weekTo >= ${formatISO(beginDate)} AND
        weekFrom < ${formatISO(endDate)}
  `)
    res.status(200).json(monthHomeoffices)
  } else if (method === "GET" && query.team?.length) {
    const teamUsers = await db.query(escape`
      SELECT email FROM users
      WHERE
        team LIKE ${query.team}
  `)
    const findAllTeam = await db.query(`
      SELECT * FROM homeoffice
      WHERE
        email IN ('${teamUsers.map((user) => user.email).join("','")}') AND
        disabled LIKE 0 AND
        approved NOT LIKE 1
    `)

    res.status(200).json(findAllTeam)
  } else if (method === "GET") {
    const find = await db.query(escape`
      SELECT * FROM homeoffice
      WHERE
        disabled LIKE 0 AND
        approved NOT LIKE 1
  `)

    res.status(200).json(find)
  } else if (method === "POST") {
    const {
      weekFrom,
      weekTo,
      days,
      name,
      email,
      manager,
      note,
      submittedBy,
      approvalHash,
      approved = false,
    } = body

    const insert = await db.query(escape`
      INSERT INTO homeoffice
      (weekFrom, weekTo, days, name, email, manager, note, submittedBy, approvalHash, approved)
      VALUES (${weekFrom}, ${weekTo}, ${JSON.stringify(
      days
    )}, ${name}, ${email}, ${manager}, ${note}, ${submittedBy}, ${approvalHash}, ${approved})
  `)

    res.status(200).json(insert)
  } else if (method === "PUT") {
    const {
      id,
      weekFrom,
      weekTo,
      days,
      name,
      email,
      manager,
      note,
      submittedBy,
      approvalHash,
      approved,
    } = body

    const update = await db.query(escape`
      UPDATE homeoffice SET
        weekFrom = ${weekFrom},
        weekTo = ${weekTo},
        days = ${days},
        name = ${name},
        email = ${email},
        manager = ${manager},
        note = ${note},
        submittedBy = ${submittedBy},
        approvalHash = ${approvalHash},
        approved = ${approved}
      WHERE
        id = ${id}
  `)

    res.status(200).json(update)
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"])
    res.status(405).end(`Method ${method} Not Allowed`)
  }
}

module.exports = handler
