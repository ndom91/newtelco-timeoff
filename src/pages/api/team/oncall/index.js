const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const onCall = await db.query(escape`
    SELECT * FROM oncall 
  `)
  res.status(200).json({ onCall })
}
