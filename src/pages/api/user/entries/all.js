const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const type = req.query.t
  if (type === "homeoffice") {
    const userEntries = await db.query(escape`
    SELECT
      id,
      name,
      email,
      weekFrom as fromDate,
      weekTo as toDate,
      manager,
      note,
      approved,
      'homeoffice' as type,
      approvalHash as approval_hash,
      approvedDatetime as approval_datetime,
      submittedDatetime as submitted_datetime,
      submittedBy as submitted_by
    FROM homeoffice
    WHERE disabled LIKE 0
  `)
    res.status(200).json({ userEntries })
  } else {
    const userEntries = await db.query(escape`
    SELECT
      id,
      name,
      email,
      resturlaubVorjahr,
      jahresurlaubInsgesamt,
      jahresUrlaubAusgegeben,
      restjahresurlaubInsgesamt,
      beantragt,
      resturlaubJAHR,
      type,
      DATE_FORMAT(fromDate, \"%d.%m.%Y\") as fromDate,
      DATE_FORMAT(toDate, \"%d.%m.%Y\") as toDate,
      manager,
      note,
      files,
      submitted_datetime,
      submitted_by,
      approval_hash,
      approved,
      approval_datetime,
      disabled
    FROM vacations
    WHERE
      disabled LIKE 0 AND
      type LIKE ${type}
  `)
    res.status(200).json({ userEntries })
  }
}
