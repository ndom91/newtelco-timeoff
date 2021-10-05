const db = require("../../../lib/db")
const escape = require("sql-template-strings")
const { format } = require("date-fns")

module.exports = async (req, res) => {
  const { vaca, ah: approvalHash, files } = req.body
  const {
    name,
    email,
    lastYear,
    thisYear,
    spentThisYear,
    total,
    requested,
    remaining,
    type,
    dateFrom: from,
    dateTo: to,
    manager,
    notes: note,
    confirmIllness,
  } = vaca
  const dateFrom = format(new Date(from), "yyyy-MM-dd")
  const dateTo = format(new Date(to), "yyyy-MM-dd")
  const submittedBy = email.substring(0, email.lastIndexOf("@"))

  let insertAbsence
  if (type === "sick" || type === "trip") {
    insertAbsence = await db.query(escape`
        INSERT INTO vacations (name, email, type, fromDate, toDate, manager, note, submitted_datetime, submitted_by, approval_hash, files, confirmIllness) VALUES (${name}, ${email}, ${type}, ${dateFrom}, ${dateTo}, ${manager}, ${note}, ${new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")}, ${submittedBy}, ${approvalHash}, ${
      files.length ? files : "[]"
    }, ${confirmIllness} )
    `)
  } else {
    insertAbsence = await db.query(escape`
        INSERT INTO vacations (name, email, resturlaubVorjahr, jahresurlaubInsgesamt, jahresUrlaubAusgegeben, restjahresurlaubInsgesamt, beantragt, resturlaubJAHR, type, fromDate, toDate, manager, note, submitted_datetime, submitted_by, approval_hash, files) VALUES (${name}, ${email}, ${lastYear}, ${thisYear}, ${spentThisYear}, ${total}, ${requested}, ${remaining}, ${type}, ${dateFrom}, ${dateTo}, ${manager}, ${note}, ${new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ")}, ${submittedBy}, ${approvalHash}, ${
      files.length ? files : "[]"
    } )
    `)
  }
  if (insertAbsence.affectedRows === 1) {
    res
      .status(200)
      .json({ code: 200, id: insertAbsence.insertId, affectedRows: 1 })
  } else {
    res.status(500).json({ code: 500, err: insertAbsence, affectedRows: 0 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}
