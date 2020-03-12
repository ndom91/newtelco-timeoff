const db = require('../../../lib/db')
const escape = require('sql-template-strings')

module.exports = async (req, res) => {
  const query = await db.query(escape`
      select MONTH(vacations.fromDate) as 'month', YEAR(vacations.fromDate) as 'year',  users.team as 'group', count(vacations.id) as 'count'
      from vacations
      left join users
      on vacations.email = users.email
      where vacations.fromDate BETWEEN CURDATE() - INTERVAL 6 MONTH AND CURDATE()
      and vacations.type = 'vacation'
      and vacations.disabled = 0
      and vacations.id is not null
      and vacations.name is not null
      and users.team is not null
      and users.team not like '%anagement'
      group by users.team, MONTH(vacations.fromDate)
  `)
  res.status(200).json({ query })
}
