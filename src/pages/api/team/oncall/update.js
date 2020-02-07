import moment from 'moment-timezone'
const db = require('../../../../lib/db')
moment.tz.setDefault('UTC')

module.exports = async (req, res) => {
  const body = JSON.parse(req.body)
  // const id = body.changed
  const id = Object.keys(body.changed)
  const changes = body.changed[id]
  let query
  // console.log(Object.keys(changes).length)
  if (Object.keys(changes).length > 1) {
    // multiple object keys - gotta loop through them all.
    const changeArr = Object.entries(changes)
    changeArr.forEach(async change => {
      console.log(change)
      let field = change[0]
      let value = change[1]
      if (field === 'startDate') {
        field = 'fromDate'
        // const endMoment = moment.tz(value, 'Europe/Berlin')
        // value = endMoment.tz('UTC').format('YYYY-MM-DD HH:mm')
        value = moment(value).utc().add(1, 'hour').format('YYYY-MM-DD HH:mm')
      } else if (field === 'endDate') {
        field = 'toDate'
        // const endMoment = moment.tz(value, 'Europe/Berlin')
        // value = endMoment.tz('GMT').format('YYYY-MM-DD HH:mm')
        value = moment(value).utc().add(1, 'hour').format('YYYY-MM-DD HH:mm')
      }
      query = await db.query(`
        UPDATE oncall SET ${field} = '${value}' where id like ${parseInt(id) + 1}
      `)
      console.log(query)
    })
    res.status(200).json({ status: 'ok', changeArr })
  } else {
    // single object keys - gotta loop through them all.
    const field = Object.keys(body.changed[id])
    const value = Object.values(body.changed[id])
    query = await db.query(`
      UPDATE oncall SET ${field} = '${value}' where id like ${parseInt(id) + 1}
    `)
    res.status(200).json({ status: 'ok', query })
  }
  // res.status(200).json({ body: body, id: id[0], field: field[0], value: value[0] })
}
