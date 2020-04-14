const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const year = req.query.y
  const query = await db.query(escape`
      select vacations.id, MONTH(vacations.fromDate) as 'date', vacations.name, users.team as 'group', vacations.beantragt as 'volume'
      from vacations
      left join users
      on vacations.email = users.email
      where (year(fromDate) = ${year} or year(toDate) = ${year})
      and vacations.type = 'vacation'
      and vacations.disabled = 0
      and vacations.id is not null
      and vacations.name is not null
      and users.team is not null
      and users.team not like '%anagement'
      order by vacations.id desc
  `)
  res.status(200).json({ query })
}
