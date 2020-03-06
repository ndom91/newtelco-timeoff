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
  // ad.getGroupMembershipForUser(user, function (err, groups) {
  ad.getUsersForGroup('VacationAdmins', function (err, users) {
    if (err) {
      console.log('ERROR: ' + JSON.stringify(err))
      return
    }
    // const adminResult = users.find(group => group.cn === 'Management' || group.cn === 'AdminGroup')
    res.status(200).json({ memberAdmin: typeof adminResult !== 'undefined', results: users })
  })
}
