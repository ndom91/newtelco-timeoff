import ActiveDirectory from 'activedirectory2'

module.exports = async (req, res) => {
  const config = {
    url: process.env.LDAP_URL,
    baseDN: process.env.LDAP_BASE_DN,
    username: process.env.LDAP_BIND_DN,
    password: process.env.LDAP_BIND_PW
  }
  const ad = new ActiveDirectory(config)

  const mail = req.query.m
  const user = mail.substr(0, mail.lastIndexOf('@'))
  const query = process.env.LDAP_ADMIN_QUERY
  ad.getGroupMembershipForUser(user, function (err, groups) {
    // ad.find(query, function (err, results) {
    if (err) {
      console.log('ERROR: ' + JSON.stringify(err))
      return
    }
    const adminResult = groups.find(group => group.cn === 'Mangement' || group.cn === 'AdminGroup')
    res.status(200).json({ memberAdmin: typeof adminResult !== 'undefined', results: groups })

    // if (groups.users.find(u => u.cn === user)) {
    //   res.status(200).json({ memberAdmin: true, results: results })
    // } else {
    //   res.status(201).json({ memberAdmin: false, results: results })
    // }
  })
}
