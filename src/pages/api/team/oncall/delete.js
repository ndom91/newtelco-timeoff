import moment from 'moment-timezone'
const db = require('../../../../lib/db')
moment.tz.setDefault('UTC')

module.exports = async (req, res) => {
  const body = JSON.parse(req.body)
  if (body) {
    const toDelete = body.toDelete
    const fromDate = moment(toDelete.startDate).utc().add(1, 'hour').format('YYYY-MM-DD HH:mm')
    const toDate = moment(toDelete.endDate).utc().add(1, 'hour').format('YYYY-MM-DD HH:mm')
    const title = toDelete.title
    const type = toDelete.oncallType

    const query = await db.query(`
      DELETE FROM oncall 
      WHERE fromDate like '${fromDate}'
      AND toDate like '${toDate}'
      AND type like '${type}'
      AND title like '${title}'
    `)
    res.status(200).json({ status: 'ok', query })
  }
}
