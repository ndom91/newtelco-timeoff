const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const companyInfo = await db.query(escape`
    SELECT * FROM settings LIMIT 1
  `)
  res.status(200).json({ companyInfo })
}
