const db = require("../../../../lib/db")
const escape = require("sql-template-strings")

module.exports = async (req, res) => {
  const email = req.query.email
  const newestEntry = await db.query(escape`
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
      type LIKE 'vacation' AND
      email like ${email} AND
      approved NOT LIKE 1
    ORDER BY submitted_datetime desc limit 1
  `)
  res.status(200).json({ newestEntry })
}
