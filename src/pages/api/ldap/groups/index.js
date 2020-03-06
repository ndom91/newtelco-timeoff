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
  ad.find('(memberOf=cn=VacationAdmins,ou=frankfurt,dc=newtelco,dc=local)', function (err, results) {
    if (err) {
      console.log('ERROR: ' + JSON.stringify(err))
      return
    }
    if (results.users) {
      const member = results.users.find(user => user.mail === mail)
      if (member.mail) {
        res.status(200).json({ memberAdmin: true, results: results })
      } else {
        res.status(200).json({ memberAdmin: false, results: results })
      }
    }
  })
}
