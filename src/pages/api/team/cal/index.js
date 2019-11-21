const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const team = req.query.t
  const companyInfo = await db.query(escape`
    SELECT * FROM vacations 
  `)
  res.status(200).json({ companyInfo })
}
