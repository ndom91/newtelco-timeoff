import moment from 'moment-timezone'
const db = require('../../../../lib/db')
moment.tz.setDefault('UTC')

module.exports = async (req, res) => {
  const body = JSON.parse(req.body)
  const added = body.added
  console.log(added)

  const fromDate = moment(added.startDate).utc().add(1, 'hour').format('YYYY-MM-DD HH:mm')
  const toDate = moment(added.endDate).utc().add(1, 'hour').format('YYYY-MM-DD HH:mm')
  const type = added.type
  const title = added.title
  const email = added.email

  const userInfo = await db.query(`
    SELECT id FROM users WHERE email LIKE '${email}'
  `)
  console.log(userInfo)
  const userId = userInfo[0].id
  const query = await db.query(`
    INSERT INTO oncall (fromDate, toDate, type, title, user) VALUES ('${fromDate}', '${toDate}', '${type}', '${title}', '${userId}')
  `)
  console.log(query)
  res.status(200).json({ status: 'ok', query })
}
