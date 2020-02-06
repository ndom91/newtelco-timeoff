const db = require('../../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const body = JSON.parse(req.body)
  // const id = body.changed
  const id = Object.keys(body.changed)
  const changes = body.changed[id]
  let query
  if (Object.keys(changes).length > 1) {
    // multiple object keys - gotta loop through them all.
  } else {
    const value = Object.values(body.changed[id])
    const field = Object.keys(body.changed[id])
    query = await db.query(escape`
      UPDATE oncall SET ${field} = ${value} where id like ${id}
    `)
  }
  // res.status(200).json({ body: body, id: id[0], field: field[0], value: value[0] })
  res.status(200).json({ status: 'ok', query })
}
